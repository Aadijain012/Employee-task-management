# Employee Task Management System — Full Project

This archive contains the complete **Spring Boot REST API backend** and the **React frontend dashboard** for the Employee Task Management System.

| Folder | Contents | Run command |
|---|---|---|
| `backend/` | Java 17+, Spring Boot, MySQL, JPA, REST API, tests, Postman collection, backend README | `mvn spring-boot:run` |
| `frontend/` | React 19, TypeScript, Vite, responsive employee and task management dashboard | `pnpm install && pnpm dev` |

## Start the complete project

First configure MySQL and start the backend from the `backend` folder. The default API server is available on `http://localhost:8080`.

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

In a second terminal, install dependencies and start the frontend. The Vite configuration proxies `/api` requests to the Spring Boot API on port `8080`, so the dashboard operates on live backend data during development.

```bash
cd frontend
pnpm install
pnpm dev
```

Open the local Vite URL printed by the command, normally `http://localhost:3000`.

## Functional coverage

The frontend demonstrates employee creation, search, update, and deletion; task assignment, status change, update, filtering, and deletion; and live dashboard counts. The backend remains the source of truth for all employee and task data.

## Database configuration

Create the `employee_task_management` database and configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` as described in `backend/README.md`. The backend also includes an importable Postman collection under `backend/postman/`.
