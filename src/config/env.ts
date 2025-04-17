import { createEnv } from "#/lib/env"
import { z } from "zod"

export const env = createEnv(process.env, z.object({

	// Logs
	LOG_LEVEL: z.enum([ "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "OFF" ]),

	// Todoist
	TODOIST_API_KEY: z.string(),
	TODOIST_PROJECT_NAME: z.string()

}))
