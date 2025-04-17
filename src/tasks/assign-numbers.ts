import { logger } from "#/lib/logger"
import type { Ticket } from "#/lib/todoist"
import { getTicketsFromProject, updateTicketContent } from "#/lib/todoist"
import type { Project } from "@doist/todoist-api-typescript/dist"

const NUMBER_REGEX = /\[\d{4}\]/

export const assignNumbersTask = async (project: Project): Promise<void> => {
	const tickets = await getTicketsFromProject(project)

	const ticketsToNumber: Ticket[] = []
	let maxId = 0
	for (const ticket of tickets) {
		const match = ticket.content.match(NUMBER_REGEX)
		if (match) {
			const id = parseInt(match[0].replace(/\[|\]/g, ""))
			if (id > maxId) {
				maxId = id
			}
		} else {
			ticketsToNumber.push(ticket)
		}
	}

	for (const ticket of ticketsToNumber) {
		maxId++
		const newContent = `[${maxId.toString().padStart(4, "0")}] ${ticket.content}`
		await updateTicketContent(ticket, newContent)
	}

	logger.debug(`Assigned numbers to ${ticketsToNumber.length} tickets`)
}
