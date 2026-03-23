import Process from "node:process";
import pino from "pino";
import { ZodError } from "zod";

export const logger = pino({
	timestamp: pino.stdTimeFunctions.isoTime,
	level: Process.env.LOGGER_LEVEL ?? "info",
	serializers: {
		err: (err) => ({
			type: err.name,
			msg: err instanceof ZodError ? JSON.parse(err.message) : err.message,
		}),
	},
	formatters: {
		level: (label) => ({
			level: label,
		}),
		bindings: () => ({}),
	},
});
