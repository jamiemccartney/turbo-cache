import pino from "pino";
import { ZodError } from "zod";
import Process from "node:process";

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
