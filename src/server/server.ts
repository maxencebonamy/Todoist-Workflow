import { env } from "#/config/env"
import { logger } from "#/lib/logger"
import type { FastifyInstance } from "fastify"
import Fastify from "fastify"
import { readFileSync, readdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

export const startServer = async (): Promise<FastifyInstance> => {
	const fastify = Fastify({
		https: {
			key: readFileSync(env.TLS_KEY_PATH),
			cert: readFileSync(env.TLS_CERT_PATH),
			ca: env.TLS_CA_PATH ? readFileSync(env.TLS_CA_PATH) : undefined
		}
	})

	const __filename = fileURLToPath(import.meta.url)
	const __dirname = dirname(__filename)

	const endpointsDir = join(__dirname, "endpoints")
	const endpointFiles = readdirSync(endpointsDir).filter(file => file.endsWith(".ts") || file.endsWith(".js"))

	await Promise.all(
		endpointFiles.map(async file => {
			const endpointPath = join(endpointsDir, file)
			const { register } = await import(endpointPath) as { register: (fastify: FastifyInstance) => void }
			if (!register) {
				logger.fatal(`Endpoint "${file}" does not export a register function`)
			}
			register(fastify)
		})
	)

	fastify.listen({ port: env.SERVER_PORT, host: "0.0.0.0" }, (err, address) => {
		if (err) throw err
		logger.info(`Server listening at ${address}`)
	})

	return fastify
}
