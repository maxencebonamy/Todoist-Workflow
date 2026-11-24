# Todoist Workflow

Automatic ticket numbering for Todoist projects.

Todoist Workflow watches a Todoist project through a webhook and assigns each new ticket a sequential, typed reference number (for example `feature/0012`) based on its label, removing the label once the number is set.

## Table of contents

- [Todoist Workflow](#todoist-workflow)
	- [Table of contents](#table-of-contents)
	- [How it works](#how-it-works)
	- [Tech stack](#tech-stack)
	- [Repository structure](#repository-structure)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
	- [Configuration](#configuration)
	- [Running locally](#running-locally)
	- [Useful scripts](#useful-scripts)
	- [API](#api)
	- [Tests and quality](#tests-and-quality)
	- [Deployment](#deployment)
	- [License](#license)

## How it works

1. **Authorization**: the app exposes an OAuth2 flow (`/oauth/start`, `/oauth/callback`) to obtain a Todoist access token.
2. **Webhook**: Todoist calls `/task-webhook` whenever a ticket is created or updated in the configured project.
3. **Type detection**: the ticket's labels are checked against the known types (`bugfix`, `feature`, `refactor`).
4. **Numbering**: the project's tickets are scanned for the highest existing number of the form `` `type/0000` ``, and the next one is assigned.
5. **Update**: the ticket content is prefixed with its new reference and its type label is removed.
6. **Batch task**: `assignNumbersTask` applies the same logic to every unnumbered ticket in a project, for an initial backfill.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Runtime | Node.js, TypeScript |
| Server | Fastify 5, Zod |
| Todoist | `@doist/todoist-api-typescript`, OAuth2 |
| Scheduling | `cron` |
| Tooling | pnpm, tsx, tsup, ESLint (`@maxencebonamy/eslint-plugin`) |
| Deployment | Docker, Docker Compose |

## Repository structure

```
.
├── src/
│   ├── config/
│   │   └── env.ts            Environment variable schema
│   ├── lib/
│   │   ├── cron.ts            Cron job helper
│   │   ├── env.ts             Environment parsing
│   │   ├── logger.ts          Console logger
│   │   ├── todoist.ts         Todoist API helpers
│   │   └── types.ts           Shared types
│   ├── server/
│   │   ├── server.ts          Fastify server, loads endpoints
│   │   └── endpoints/         One file per route
│   ├── tasks/
│   │   └── assign-numbers.ts  Batch ticket-numbering task
│   └── index.ts               Entry point
```

Server routes are plain files under `src/server/endpoints`, each exporting a `register(fastify)` function; they are loaded automatically at startup.

## Prerequisites

- [Node.js](https://nodejs.org/) 22
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A Todoist account and a [Todoist app](https://developer.todoist.com/appconsole.html) (client ID and secret)
- A TLS certificate and key, since the Fastify server only serves HTTPS

## Installation

```bash
git clone git@github.com:maxencebonamy/Todoist-Workflow.git
cd Todoist-Workflow
pnpm install
```

## Configuration

Copy the example file and fill in the values.

```bash
cp .env.example .env
```

| Variable | Description | Example |
| --- | --- | --- |
| `LOG_LEVEL` | Log level (`DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, `OFF`) | `INFO` |
| `TODOIST_API_KEY` | Todoist personal API token | |
| `TODOIST_PROJECT_NAME` | Name of the Todoist project to watch | `Dev` |
| `TODOIST_CLIENT_ID` | Todoist app client ID | |
| `TODOIST_CLIENT_SECRET` | Todoist app client secret | |
| `SERVER_HOST` | Public host of the server | `https://example.com` |
| `SERVER_PORT` | Listening port | `3000` |
| `SERVER_URL` | Full public URL, used for the OAuth redirect URI | `${SERVER_HOST}:${SERVER_PORT}` |
| `TLS_KEY_PATH` | Path to the TLS private key | `./certs/key.pem` |
| `TLS_CERT_PATH` | Path to the TLS certificate | `./certs/cert.pem` |
| `TLS_CA_PATH` | Path to the TLS CA bundle (optional) | `./certs/ca.pem` |

## Running locally

```bash
pnpm run start
```

tsx watches `src/index.ts` and restarts on every change. Then open `https://<SERVER_HOST>:<SERVER_PORT>/oauth/start` once to authorize the app with Todoist.

## Useful scripts

| Command | Effect |
| --- | --- |
| `pnpm run start` | Run the server with tsx in watch mode |
| `npx eslint .` | Lint the project |
| `npx tsup` | Build the project to `dist/` using `tsup.config.json` |

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status |
| `GET` | `/oauth/start` | Redirects to Todoist's OAuth authorization page |
| `GET` | `/oauth/callback` | OAuth2 callback, exchanges the code for an access token |
| `POST` | `/task-webhook` | Todoist webhook, numbers the ticket that triggered it |

## Tests and quality

```bash
npx eslint .
```

No automated test suite is set up yet.

## Deployment

```bash
cp .env.example .env
# fill in the values
docker compose up -d --build
```

[`Dockerfile`](Dockerfile) builds the app on `node:20-alpine` with pnpm, and [`docker-compose.yml`](docker-compose.yml) runs it on port 3000, mounting `./certs` read-only for the TLS files referenced by `TLS_KEY_PATH` and `TLS_CERT_PATH`.

## License

This project is licensed under the [MIT License](LICENSE).
