import type { Project } from "@doist/todoist-api-typescript"
import { TodoistApi, type Task } from "@doist/todoist-api-typescript"
import { logger } from "#/lib/logger"
import { env } from "#/config/env"

const api = new TodoistApi(env.TODOIST_API_KEY)

export type Ticket = Task

export const getProjectByName = async (name: string): Promise<Project> => {
	const projects = await api.getProjects()
	const filteredProjects = projects.results.filter(p => p.name === name)
	if (filteredProjects.length === 0) {
		logger.fatal("Project not found")
	}
	if (filteredProjects.length > 1) {
		logger.warn(`Multiple projects found with the name "${name}"`)
		const answer = await logger.input("Do you want to continue? (y/n)")
		if (answer !== "y") {
			logger.fatal("Aborting")
		}
	}
	logger.debug(`Found ${filteredProjects.length} project(s) with the name "${name}"`)
	return filteredProjects[0]
}

export const getTicketsFromProject = async (project: Project): Promise<Ticket[]> => {
	const tickets: Ticket[] = []
	let cursor: string | null = ""
	do {
		const tasks = await api.getTasks({ projectId: project.id, cursor })
		tickets.push(...tasks.results)
		cursor = tasks.nextCursor
	} while (cursor)
	logger.debug(`Found ${tickets.length} tickets(s) in project ${project.name}`)
	return tickets
}

export const updateTicketContent = async (ticket: Pick<Ticket, "id" | "content">, content: string): Promise<void> => {
	await api.updateTask(ticket.id, { content })
	logger.debug(`Updated ticket from "${ticket.content}" to "${content}"`)
}

export const removeTicketTag = async (ticket: Pick<Ticket, "id" | "content" | "labels">, tag: string): Promise<void> => {
	await api.updateTask(ticket.id, { labels: ticket.labels.filter(l => l !== tag) })
	logger.debug(`Removed tag "${tag}" from ticket "${ticket.content}"`)
}
