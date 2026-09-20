# Tasks API

A REST API for managing tasks, built with Node.js and Express, following a clean architecture approach (routes → controllers → services → repositories). It uses Prisma as the ORM on top of MySQL, and includes full unit and integration test coverage, a CI pipeline with GitHub Actions, and a live deployment on Railway.

## Live Demo

[https://taskmanagerapi-production-e43d.up.railway.app](https://taskmanagerapi-production-e43d.up.railway.app)

> Note: the service may be paused (sleeping) to avoid unnecessary usage. If the first request times out, wait a few seconds and try again, it should wake up automatically.

## Tools

- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Prisma (with `@prisma/adapter-mariadb`)
- **Database:** MySQL
- **Testing:** Jest (unit tests with mocks) + Supertest (integration tests)
- **CI:** GitHub Actions
- **Deployment:** Railway

## Architecture

The project follows a layered (clean) architecture to separate concerns and make the codebase easier to test and maintain:

```
src/
├── routes/         # Defines endpoints and maps them to controllers
├── controllers/     # Handles HTTP req/res, delegates logic to services
├── services/        # Business logic and validation
├── repositories/     # Data access layer (Prisma queries)
├── errors/           # Custom error classes (AppError, ValidationError, NotFoundError)
├── utils/            # Centralized error handling
├── lib/              # Prisma client instance
├── app.js            # Express app definition (exported, no listen)
index.js              # Entry point — imports app and starts the server
```

**Error handling:** the API uses a custom `AppError` class (with `ValidationError` and `NotFoundError` subclasses) combined with a centralized Express error-handling middleware. Services throw typed errors; controllers forward them with `next(error)`; the middleware decides the final HTTP response. This avoids repeating status-code logic across every controller.

**Pagination:** `GET /tasks` supports offset-based pagination (`page` / `limit`), returning both the paginated data and pagination metadata (`page`, `totalPage`, `totalItems`).

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List tasks (supports `?page=&limit=&completed=`) |
| GET | `/api/tasks/:id` | Get a single task by id |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/:id` | Partially update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example request/response

**POST `/api/tasks`**
```json
// Request body
{
  "title": "Buy games",
  "descriptiontsk": "Resident Evil, Gears of War, The last of us"
}

// Response (201)
{
  "success": true,
  "message": "Task created successfully"
}
```

## Running Locally

### Prerequisites
- Node.js 20+
- A running MySQL instance

### Environment variables

Create a `.env` file in the project root:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=tasks_dev
DATABASE_URL=mysql://your_user:your_password@localhost:3306/tasks_dev
```

### Setup

```bash
# install dependencies
npm install

# apply the Prisma schema to your database
npx prisma db push

# start in development mode (auto-restart on changes)
npm run dev

# or start normally
npm start
```

The API will be available at `http://localhost:3001` (or the port you configure).

## Testing

The project has two layers of automated tests:

- **Unit tests** (`src/services/*.test.js`): test business logic in isolation, mocking the repository layer with `jest.mock()`. No database required.
- **Integration tests** (`tests/*.integration.test.js`): test full HTTP request/response flows with Supertest, against a real, separate MySQL test database.

### Setting up the test database

Create a second, dedicated database (e.g. `tasks_test`) and a `.env.test` file:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=tasks_test
DATABASE_URL=mysql://your_user:your_password@localhost:3306/tasks_test
```

Apply the schema to it:
```bash
npx dotenv -e .env.test -- npx prisma db push
```

### Running the tests

```bash
npm test
```

This runs both unit and integration tests with `NODE_ENV=test`, which makes the app load `.env.test` instead of `.env` (see `jest.setup.js`).

## CI/CD

Every push and pull request to `main` triggers a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Spins up a temporary MySQL service
2. Installs dependencies and generates the Prisma client
3. Applies the Prisma schema to the temporary database
4. Runs the full test suite (unit + integration)

Deployment to Railway is handled separately, via Railway's own GitHub integration: every push to `main` that passes CI triggers an automatic redeploy.

## 📌 Notable decisions

- **Clean architecture** was chosen over a flat structure to keep business logic (services) decoupled from HTTP concerns (controllers) and data access (repositories) — this made unit testing with mocked repositories straightforward.
- **Prisma with a MariaDB adapter** was used instead of raw SQL queries, after starting the project with raw `mysql2`/`pg`-style queries, to compare both approaches.
- **Mass assignment** is explicitly prevented in the update endpoint by filtering incoming fields against an allow-list before passing them to Prisma.
- **Separate test database** avoids polluting development data and makes integration tests deterministic (each test controls its own data via `beforeEach`).
