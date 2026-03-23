import type { Readable } from "node:stream";
import {
	GetObjectCommand,
	HeadObjectCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
	type ArtifactMetadata,
	ArtifactMetaSerializer,
} from "@utils/artifact-meta";
import type { Request } from "express";

class ArtifactStore {
	private client: S3Client;
	private bucket: string;
	private metaSerializer = new ArtifactMetaSerializer();

	constructor(opts: {
		bucket: string;
		region: string;
		endpoint?: string;
		credentials?: { accessKeyId: string; secretAccessKey: string };
	}) {
		this.client = new S3Client({
			region: opts.region,
			endpoint: opts.endpoint,
			...(opts.credentials?.secretAccessKey && opts.credentials?.accessKeyId
				? { credentials: opts.credentials }
				: {}),
			forcePathStyle: ["localhost", "127.0.0.1"].some((host) =>
				opts.endpoint?.includes(host),
			),
		});
		this.bucket = opts.bucket;
	}

	private getS3Key(teamId: string, hash: string): string {
		return `teams/${teamId}/${hash}`;
	}

	async exists(teamId: string, hash: string) {
		try {
			const res = await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.getS3Key(teamId, hash),
				}),
			);

			if (!res.Metadata) {
				return undefined;
			}

			return this.metaSerializer.forResponse({
				...res.Metadata,
				"content-type": res.ContentType ?? "application/octet-stream",
			});
		} catch (err: unknown) {
			if (
				err instanceof S3ServiceException &&
				err?.$metadata?.httpStatusCode === 404
			) {
				return undefined;
			}

			throw err;
		}
	}

	async existsMany(
		teamId: string,
		hashes: string[],
	): Promise<Record<string, ArtifactMetadata>> {
		const MAX_CONCURRENCY = 32;
		const results: Record<string, ArtifactMetadata> = {};

		for (let i = 0; i < hashes.length; i += MAX_CONCURRENCY) {
			const chunk = hashes.slice(i, i + MAX_CONCURRENCY);

			const entries = await Promise.all(
				chunk.map(
					async (hash) => [hash, await this.exists(teamId, hash)] as const,
				),
			);

			for (const [hash, meta] of entries) {
				if (meta) {
					results[hash] = meta;
				}
			}
		}

		return results;
	}

	async downloadStream(teamId: string, hash: string) {
		try {
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: this.getS3Key(teamId, hash),
				}),
			);

			return {
				body: response.Body as Readable,
				headers: this.metaSerializer.forResponse(response.Metadata),
			};
		} catch (err: unknown) {
			if (
				err instanceof S3ServiceException &&
				err?.$metadata?.httpStatusCode === 404
			) {
				return undefined;
			}

			throw err;
		}
	}

	async uploadStream(
		teamId: string,
		hash: string,
		req: Request,
	): Promise<void> {
		const headers = Object.fromEntries(
			this.metaSerializer.headers
				.map(([key]) => [key, req.header(key)])
				.filter(([_, value]) => value !== undefined),
		);

		const upload = new Upload({
			client: this.client,
			params: {
				Bucket: this.bucket,
				Key: this.getS3Key(teamId, hash),
				Body: req,
				Metadata: this.metaSerializer.fromRequest(headers),
			},
			queueSize: 4,
			partSize: 5 * 1024 * 1024,
		});

		await upload.done();
	}
}

export default ArtifactStore;
