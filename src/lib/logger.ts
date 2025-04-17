import { env } from "#/config/env"
import { isEnvParsed } from "#/lib/env"
import chalk, { type ChalkInstance } from "chalk"
import moment from "moment"
import readline from "readline"
import type { ZodSchema } from "zod"

const levels = {
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4,
	FATAL: 5,
	OFF: 6
} as const

const stringify = (value: unknown): string => {
	if (typeof value === "string") {
		return value
	}
	if (typeof value === "object") {
		return JSON.stringify(value)
	}
	return value !== undefined ? value.toString() : "undefined"
}

const currentTimestamp = (): string => {
	return moment().format("YYYY/MM/DD HH:mm:ss")
}

const logConsole = (level: string, chalkize: ChalkInstance, ...messages: unknown[]): void => {
	const timestamp = currentTimestamp()

	// eslint-disable-next-line no-console
	console.log(`${chalk.dim(timestamp)} ${chalkize(`[${level}]`)} ${messages.map(stringify).join(" ")}`)
}

const debug = (...messages: unknown[]): void => {
	if (!isEnvParsed() || levels[env.LOG_LEVEL] <= levels.DEBUG) {
		logConsole("DEBUG", chalk.bold.blue, ...messages)
	}
}

const info = (...messages: unknown[]): void => {
	if (!isEnvParsed() || levels[env.LOG_LEVEL] <= levels.INFO) {
		logConsole("INFO", chalk.bold.green, ...messages)
	}
}

const warn = (...messages: unknown[]): void => {
	if (!isEnvParsed() || levels[env.LOG_LEVEL] <= levels.WARN) {
		logConsole("WARN", chalk.bold.yellow, ...messages)
	}
}

const error = (...messages: unknown[]): void => {
	if (!isEnvParsed() || levels[env.LOG_LEVEL] <= levels.ERROR) {
		logConsole("ERROR", chalk.bold.red, ...messages)
	}
}

const fatal = (...messages: unknown[]): never => {
	if (!isEnvParsed() || levels[env.LOG_LEVEL] <= levels.FATAL) {
		logConsole("FATAL", chalk.bold.red, ...messages)
	}
	process.exit(1)
}

const input = async <T = string>(message: string, schema?: ZodSchema<T>): Promise<T> => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	const askQuestion = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve))

	const chalkize = chalk.bold.magenta
	// eslint-disable-next-line no-constant-condition
	while (true) {
		logConsole("INPUT", chalkize, message)
		const userInput = await askQuestion("> ")
		if (schema) {
			try {
				const parsed = schema.parse(userInput)
				rl.close()
				return parsed
			} catch (error) {
				logConsole("ERROR", chalk.bold.red, "Invalid input. Please try again.")
			}
		} else {
			rl.close()
			return userInput as T
		}
	}
}

export const logger = {
	info,
	warn,
	error,
	debug,
	fatal,
	input
}
