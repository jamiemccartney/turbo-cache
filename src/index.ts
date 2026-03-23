import Process from "node:process";
import { getContext } from "@utils/context";
import { getEnv } from "@utils/env";
import { logger } from "@utils/logger";
import { createServer } from "./server";

const childLogger = logger.child({ source: "server" });

async function bootstrap() {
	const env = getEnv();
	const context = getContext(env);

	const app = createServer(context);

	const server = app.listen(env.SERVER_PORT, env.SERVER_HOST);

	server.on("listening", () => {
		childLogger.info({
			event: "start",
			status: "success",
			host: env.SERVER_HOST,
			port: env.SERVER_PORT,
		});
	});

	server.on("error", (err) => {
		childLogger.fatal({ event: "start", status: "failed", err }, "failed to start server");
		Process.exit(1);
	});

	Process.on("SIGINT", () => {
		childLogger.info({ event: "sigint" });
		server.close(() => {
			Process.exit(0);
		});
	});

	Process.on("SIGTERM", () => {
		childLogger.info({ event: "sigterm" });
		Process.exit(0);
	});
}

bootstrap().catch((err) => {
	childLogger.error({ event: "start", status: "failed", err }, "error doing server bootstrap");
	Process.exit(1);
});
