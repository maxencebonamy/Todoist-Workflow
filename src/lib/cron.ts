import type { MaybePromise } from "#/lib/types"
import { CronJob } from "cron"

export const startCronJob = (cron: string, callback: () => MaybePromise<void>): CronJob => {
	const job = new CronJob(cron, callback)
	job.start()
	return job
}
