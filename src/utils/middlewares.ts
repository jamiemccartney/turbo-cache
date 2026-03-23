import type { Context } from "@utils/context";
import { logger } from "@utils/logger";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const childLogger = logger.child({ source: "middleware" });

export const hasValidAuth =
	(context: Context) => (req: Request, res: Response, next: NextFunction) => {
		const authHeader = req.header("authorization");

		if (!authHeader || !context.tokenStore.has(authHeader)) {
			childLogger.debug({
				middleware: "hasValidAuth",
				event: "request",
				status: "unauthorized",
			});
			return res.status(401).json({
				code: "UNAUTHORIZED",
				message:
					"Unauthorized. The request is missing a valid authentication token or the token is invalid.",
			});
		}

		next();
	};

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
	const startTime = Date.now();
	next();
	res.on("finish", () => {
		childLogger.debug({
			middleware: "httpLogger",
			event: "request",
			status: "finished",
			url: req.originalUrl,
			path: req.path,
			status_code: res.statusCode,
			contentLength: res.get("content-length"),
			time_spend: Date.now() - startTime,
		});
	});
};

export const routeNotFoundHandler = (_req: Request, res: Response) => {
	res.status(404).json({ error: "Not Found" });
};

export const errorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof ZodError) {
		childLogger.warn(
			{
				middleware: "errorHandler",
				event: "request",
				status: "bad_request",
				err,
			},
			"Bad request. One or more of the provided values in the request query, headers, or body is invalid.",
		);
		res.status(400).json({
			code: "BAD_REQUEST",
			message:
				"Bad request. One or more of the provided values in the request query, headers, or body is invalid.",
		});
	} else {
		childLogger.error(
			{
				middleware: "errorHandler",
				event: "request",
				status: "internal_server_error",
				err,
			},
			"Internal Server Error",
		);
		res.status(500).json({
			code: "INTERNAL_SERVER_ERROR",
			message: "Internal Server Error",
		});
	}
};
