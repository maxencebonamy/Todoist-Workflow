import type { FastifyInstance } from "fastify/fastify"

export const register = (fastify: FastifyInstance): void => {
	fastify.get("/health", async (_, reply) => {
		await reply.code(200).send({ status: "ok" })
	})
}
