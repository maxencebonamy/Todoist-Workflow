import { env } from "#/config/env"
import { logger } from "#/lib/logger"
import type { FastifyInstance } from "fastify/fastify"
import { z } from "zod"

export const register = (fastify: FastifyInstance): void => {
	fastify.get("/oauth/callback", async (request, reply) => {
		const params = z.object({
			code: z.string().optional(),
			state: z.string().optional()
		}).safeParse(request.query)

		if (!params.success) {
			await reply.status(400).send(`Invalid query parameters: ${params.error.message}`)
			return
		}

		try {
			const response = await fetch("https://api.todoist.com/oauth/access_token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({
					client_id: env.TODOIST_CLIENT_ID,
					client_secret: env.TODOIST_CLIENT_SECRET,
					code: String(params.data.code),
					redirect_uri: `${env.SERVER_URL}/oauth/callback`
				})
			})
			const data = await response.json() as unknown
			const parsedData = z.object({
				access_token: z.string().optional()
			}).safeParse(data)
			if (!parsedData.success) {
				await reply.status(400).send(`Invalid response from Todoist: ${parsedData.error.message}`)
				return
			}

			if (parsedData.data.access_token) {
				logger.info("OAuth token received!")
				await reply.send("OAuth authentication successful!")
			} else {
				await reply.status(400).send("Failed to exchange code for token.")
			}
		} catch (err) {
			logger.error(err)
			await reply.status(500).send("An error occurred during OAuth token exchange.")
		}
	})
}
