import { createEnv } from "#/lib/env"
import { z } from "zod"

export const env = createEnv(process.env, z.object({

	// Logs
	LOG_LEVEL: z.enum([ "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "OFF" ]),

	// Todoist
	TODOIST_API_KEY: z.string(),
	TODOIST_PROJECT_NAME: z.string(),

	// Server
	SERVER_PORT: z.coerce.number(),
	TLS_KEY_PATH: z.string(),
	TLS_CERT_PATH: z.string()

}))
