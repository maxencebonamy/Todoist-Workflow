import { logger } from "#/lib/logger"
import type { FastifyInstance } from "fastify"
import Fastify from "fastify"

export const startServer = async (): Promise<FastifyInstance> => {
	const fastify = Fastify()

	fastify.get("/", async (request, reply) => {
		logger.debug("Hello world!")
		await reply.code(200).send({ hello: "world" })
	})

	fastify.post("/todoist-webhook", async (request, reply) => {
		logger.debug("Webhook received!", request.body)
		await reply.code(200).send({ status: "ok" })
	})

	fastify.listen({ port: 3000 }, (err, address) => {
		if (err) throw err
		logger.debug(`Server listening at ${address}`)
	})

	return fastify
}
