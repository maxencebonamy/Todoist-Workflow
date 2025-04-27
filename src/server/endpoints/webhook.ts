import { env } from "#/config/env"
import { logger } from "#/lib/logger"
import { getProjectByName, getTicketsFromProject, removeTicketTag, updateTicketContent } from "#/lib/todoist"
import type { FastifyInstance } from "fastify/fastify"
import { z } from "zod"

const NUMBER_REGEX = /`[^/`]+\/\d{4}`/

const bodySchema = z.object({
	event_data: z.object({
		id: z.string(),
		content: z.string(),
		project_id: z.string(),
		labels: z.array(z.string())
	})
}).transform(data => ({
	id: data.event_data.id,
	content: data.event_data.content,
	projectId: data.event_data.project_id,
	labels: data.event_data.labels
}))

const getTicketType = (labels: string[]): string | null => {
	for (const label of labels) {
		if ([ "bugfix", "feature", "refactor" ].includes(label)) {
			return label
		}
	}
	return null
}

export const register = (fastify: FastifyInstance): void => {
	fastify.post("/task-webhook", async (request, reply) => {
		logger.debug("Webhook received", request.body)

		const parsedBody = bodySchema.safeParse(request.body)
		if (!parsedBody.success) {
			logger.error("Invalid webhook payload", parsedBody.error)
			await reply.status(400).send("Invalid webhook payload")
			return
		}

		if (parsedBody.data.content.match(NUMBER_REGEX)) {
			logger.debug("Ticket already has a number, skipping...")
			await reply.code(200).send({ status: "ok" })
			return
		}

		const project = await getProjectByName(env.TODOIST_PROJECT_NAME)
		if (parsedBody.data.projectId !== project.id) {
			logger.debug("Invalid project ID", parsedBody.data.projectId)
			await reply.status(200).send({ status: "ok" })
			return
		}

		const tickets = await getTicketsFromProject(project)

		let maxId = 0
		for (const ticket of tickets) {
			const match = ticket.content.match(NUMBER_REGEX)
			if (match) {
				const id = parseInt(match[0].replace(/`.*\//, "").replace(/`/g, ""))
				if (id > maxId) {
					maxId = id
				}
			}
		}

		maxId++
		const ticketType = getTicketType(parsedBody.data.labels)
		if (!ticketType) {
			logger.error(`Ticket ${parsedBody.data.content} does not have a valid type.`)
			await reply.status(400).send("Ticket does not have a valid type")
			return
		}

		const newContent = `\`${ticketType}/${maxId.toString().padStart(4, "0")}\` ${parsedBody.data.content}`
		await updateTicketContent(parsedBody.data, newContent)
		await removeTicketTag(parsedBody.data, ticketType)

		await reply.code(200).send({ status: "updated" })
	})
}
