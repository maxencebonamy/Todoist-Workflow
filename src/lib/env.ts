import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import type { z } from "zod"
import { logger } from "#/lib/logger"

let parsedEnv: unknown = null

export const createEnv = <T>(env: NodeJS.ProcessEnv, schema: z.ZodSchema<T>): T => {
	if (parsedEnv) {
		return parsedEnv as T
	}

	// parse .env file using dotenv
	// dotenv-expand is used to support environment variable expansion (e.g. `APP_URL=${APP_HOST}:${APP_PORT}`)
	dotenvExpand.expand(dotenv.config())

	const result = schema.safeParse(env)

	if (!result.success) {
		const message = "Failed to parse env:\n" + result.error.errors.map(e => `- ${e.path.join(".")}: ${e.message}`).join("\n")
		logger.fatal(message)
	}

	parsedEnv = result.data
	return parsedEnv as T
}

export const isEnvParsed = (): boolean => {
	return !!parsedEnv
}
