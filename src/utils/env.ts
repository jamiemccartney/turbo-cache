import Process from "node:process";
import z from "zod";

const envSchema = z
	.object({
		SERVER_PORT: z.coerce.number().optional().default(8080),
		SERVER_HOST: z.string().optional().default("0.0.0.0"),
		TURBO_TOKENS: z
			.string()
			.transform((val) => val.split(",").map((val) => val.trim()))
			.pipe(z.array(z.string()).min(1)),

		LOGGER_LEVEL: z
			.enum(["fatal", "error", "warn", "info", "debug", "trace"])
			.optional() //
			.default("info"),

		AWS_BUCKET: z.string().min(1),
		AWS_REGION: z.string(),
		AWS_ENDPOINT: z.string().optional(),
		AWS_ACCESS_KEY_ID: z.string().optional(),
		AWS_SECRET_ACCESS_KEY: z.string().optional(),
		AWS_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
	})
	.refine((env) => !env.AWS_ACCESS_KEY_ID || env.AWS_SECRET_ACCESS_KEY, {
		message:
			"Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be provided together",
	});

export function getEnv(env: Record<string, unknown> = Process.env) {
	return envSchema.parse(env);
}

export type Env = z.infer<typeof envSchema>;
