import { env } from "#/config/env"
import { getProjectByName } from "#/lib/todoist"
import { startServer } from "#/server/server"

const project = await getProjectByName(env.TODOIST_PROJECT_NAME)
// startCronJob("*/10 * * * * *", () => assignNumbersTask(project))

void startServer()
