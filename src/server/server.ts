import { env } from "#/config/env"
import { logger } from "#/lib/logger"
import type { FastifyInstance } from "fastify"
import Fastify from "fastify"
import { readFileSync } from "fs"

export const startServer = async (): Promise<FastifyInstance> => {
	const fastify = Fastify({
		https: {
			key: readFileSync(env.TLS_KEY_PATH),
			cert: readFileSync(env.TLS_CERT_PATH)
		}
	})

	fastify.get("/", async (request, reply) => {
		logger.debug("Hello world!")
		await reply.code(200).send({ hello: "world" })
	})

	fastify.post("/todoist-webhook", async (request, reply) => {
		logger.info("Webhook received!", request.body)
		await reply.code(200).send({ status: "ok" })
	})

	fastify.listen({ port: env.SERVER_PORT, host: "0.0.0.0" }, (err, address) => {
		if (err) throw err
		logger.debug(`Server listening at ${address}`)
	})

	return fastify
}
