import { env } from "#/config/env"
import type { FastifyInstance } from "fastify/fastify"

export const register = (fastify: FastifyInstance): void => {
	fastify.get("/oauth/start", async (request, reply) => {
		const queryParams = new URLSearchParams({
			client_id: env.TODOIST_CLIENT_ID,
			scope: "data:read_write",
			state: "some-random-string",
			redirect_uri: `${env.SERVER_URL}/oauth/callback`
		})
		const authUrl = `https://todoist.com/oauth/authorize?${queryParams.toString()}`
		return reply.redirect(authUrl)
	})
}
