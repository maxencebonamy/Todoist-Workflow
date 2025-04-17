import { env } from "#/config/env"
import { startCronJob } from "#/lib/cron"
import { getProjectByName } from "#/lib/todoist"
import { assignNumbersTask } from "#/tasks/assign-numbers"

const project = await getProjectByName(env.TODOIST_PROJECT_NAME)
startCronJob("*/10 * * * * *", () => assignNumbersTask(project))
