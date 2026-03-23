import type { Env } from "@utils/env";
import ArtifactStore from "@utils/s3-artifact-store";
import { TokenStore } from "@utils/token-store";

export const getContext = (env: Env) => {
	const tokenStore = new TokenStore(new Set(env.TURBO_TOKENS));
	const artifactStore = new ArtifactStore({
		region: env.AWS_REGION,
		bucket: env.AWS_BUCKET,
		endpoint: env.AWS_ENDPOINT,
		...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
			? {
					credentials: {
						accessKeyId: env.AWS_ACCESS_KEY_ID,
						secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
					},
				}
			: {}),
	});

	return {
		tokenStore,
		artifactStore,
	};
};

export type Context = ReturnType<typeof getContext>;
