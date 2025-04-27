import { createEnv } from "#/lib/env"
import { z } from "zod"

export const env = createEnv(process.env, z.object({

	LOG_LEVEL: z.enum([ "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "OFF" ]),

	TODOIST_API_KEY: z.string(),
	TODOIST_PROJECT_NAME: z.string(),
	TODOIST_CLIENT_ID: z.string(),
	TODOIST_CLIENT_SECRET: z.string(),

	SERVER_HOST: z.string(),
	SERVER_PORT: z.coerce.number(),
	SERVER_URL: z.string().url(),

	TLS_KEY_PATH: z.string(),
	TLS_CERT_PATH: z.string(),
	TLS_CA_PATH: z.string().optional()

}))
