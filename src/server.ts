import type { Context } from "@utils/context";
import {
	errorHandler,
	httpLogger,
	routeNotFoundHandler,
} from "@utils/middlewares";
import express from "express";
import helmet from "helmet";
import * as routes from "./routes";

export function createServer(context: Context) {
	const router = express.Router();

	routes.headArtifactByHash(router, context);
	routes.getArtifactStatus(router, context);
	routes.postArtifactAnalytics(router, context);
	routes.postArtifacts(router, context);
	routes.getArtifactByHash(router, context);
	routes.putArtifactByHash(router, context);

	const app = express();

	app.use(helmet());
	app.use(httpLogger);
	app.use("/v8", router);
	app.use(routeNotFoundHandler);
	app.use(errorHandler);

	return app;
}
