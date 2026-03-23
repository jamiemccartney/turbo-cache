import { pipeline } from "node:stream/promises";
import type { Context } from "@utils/context";
import { hasValidAuth } from "@utils/middlewares";
import {
	artifactHasManyBodySchema,
	hashPathSchema,
	teamParamsSchema,
} from "@utils/schemas";
import express, { type Request, type Response, type Router } from "express";

export function getArtifactStatus(router: Router, context: Context) {
	router.get(
		"/artifacts/status",
		hasValidAuth(context),
		(_req: Request, res: Response) => {
			res.json({ status: "enabled" });
			return res.end();
		},
	);
}

export function postArtifactAnalytics(router: Router, context: Context) {
	router.post(
		"/artifacts/events",
		hasValidAuth(context),
		express.json(),
		(_req: Request, res: Response) => {
			return res.status(200).end();
		},
	);
}

export function putArtifactByHash(router: Router, context: Context) {
	router.put(
		"/artifacts/:hash",
		hasValidAuth(context),
		async (req, res, next) => {
			try {
				const params = hashPathSchema.parse(req.params);
				const query = teamParamsSchema.parse(req.query);

				await context.artifactStore.uploadStream(
					query.storageId,
					params.hash,
					req,
				);
				res.status(201).json({ message: "uploaded" });
			} catch (err) {
				next(err);
			}
		},
	);
}

export function getArtifactByHash(router: Router, context: Context) {
	router.get(
		"/artifacts/:hash",
		hasValidAuth(context),
		async (req, res, next) => {
			try {
				const params = hashPathSchema.parse(req.params);
				const query = teamParamsSchema.parse(req.query);

				const result = await context.artifactStore.downloadStream(
					query.storageId,
					params.hash,
				);

				if (!result?.body) return res.sendStatus(404);

				await pipeline(result.body, res);
			} catch (err) {
				next(err);
			}
		},
	);
}

export function headArtifactByHash(router: Router, context: Context) {
	router.head(
		"/artifacts/:hash",
		hasValidAuth(context),
		async (req, res, next) => {
			try {
				const params = hashPathSchema.parse(req.params);
				const query = teamParamsSchema.parse(req.query);

				const meta = await context.artifactStore.exists(
					query.storageId,
					params.hash,
				);

				if (!meta) {
					return res.sendStatus(404);
				}

				for (const [key, value] of Object.entries(meta)) {
					res.setHeader(key, value);
				}

				res.status(200).end();
			} catch (err) {
				next(err);
			}
		},
	);
}

export function postArtifacts(router: Router, context: Context) {
	router.post(
		"/artifacts",
		hasValidAuth(context),
		express.json(),
		async (req, res, next) => {
			try {
				const query = teamParamsSchema.parse(req.query);
				const body = artifactHasManyBodySchema.parse(req.body);

				const meta = await context.artifactStore.existsMany(
					query.storageId,
					body.hashes,
				);

				res.json(meta);
			} catch (err) {
				next(err);
			}
		},
	);
}
