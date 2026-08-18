# Employee Task Management System

A production-style Spring Boot REST API for managing employees and assigning, tracking, and updating development tasks. The application uses a clean layered architecture with DTOs, service-layer business logic, Spring Data JPA persistence, Bean Validation, consistent exception responses, and MySQL.

## Features

The API supports employee creation, retrieval, update, deletion, and case-insensitive search by name, department, or both. Managers can assign tasks to employees, view all tasks, view an individual task, view an employee's tasks, update task details, change task status, and delete tasks. Input validation, duplicate email detection, not-found handling, invalid enum handling, and unexpected-error handling are implemented through a global REST exception handler.

## Technologies

| Area | Technology |
|---|---|
| Language | Java 17+ |
| Framework | Spring Boot 3.3.5 |
| Web | Spring Web / REST |
| Persistence | Spring Data JPA and Hibernate |
| Database | MySQL |
| Build | Maven |
| Validation | Jakarta Bean Validation |
| Testing | JUnit 5 and Mockito |

## Project Structure

```text
employee-task-management-system/
├── pom.xml
├── README.md
├── .gitignore
├── postman/
│   └── employee-task-management.postman_collection.json
└── src/
    ├── main/
    │   ├── java/com/digitalbyte/employeeTaskManagement/
    │   │   ├── EmployeeTaskManagementApplication.java
    │   │   ├── controller/
    │   │   │   ├── EmployeeController.java
    │   │   │   └── TaskController.java
    │   │   ├── dto/
    │   │   │   ├── EmployeeRequest.java
    │   │   │   ├── EmployeeResponse.java
    │   │   │   ├── TaskRequest.java
    │   │   │   ├── TaskResponse.java
    │   │   │   └── TaskStatusRequest.java
    │   │   ├── entity/
    │   │   │   ├── Employee.java
    │   │   │   ├── Task.java
    │   │   │   ├── TaskPriority.java
    │   │   │   └── TaskStatus.java
    │   │   ├── exception/
    │   │   │   ├── DuplicateEmailException.java
    │   │   │   ├── EmployeeNotFoundException.java
    │   │   │   ├── ErrorResponse.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── TaskNotFoundException.java
    │   │   ├── repository/
    │   │   │   ├── EmployeeRepository.java
    │   │   │   └── TaskRepository.java
    │   │   └── service/
    │   │       ├── EmployeeService.java
    │   │       ├── EmployeeServiceImpl.java
    │   │       ├── TaskService.java
    │   │       └── TaskServiceImpl.java
    │   └── resources/application.properties
    └── test/java/com/digitalbyte/employeeTaskManagement/service/
        ├── EmployeeServiceTest.java
        └── TaskServiceTest.java
```

## Database Setup

Create a MySQL database named `employee_task_management`:

```sql
CREATE DATABASE employee_task_management;
```

The application uses Hibernate's `update` mode to create and evolve the required tables during development. For production, use a controlled migration strategy and a least-privilege database user.

## Configuration

The application reads database settings from environment variables. The defaults are suitable for a local MySQL installation only and should be overridden in shared or production environments.

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/employee_task_management?createDatabaseIfNotExist=true&serverTimezone=UTC` | JDBC connection URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |

Example Linux/macOS configuration:

```bash
export DB_URL='jdbc:mysql://localhost:3306/employee_task_management?serverTimezone=UTC'
export DB_USERNAME='employee_app'
export DB_PASSWORD='change-me'
```

The server listens on port `8080` by default.

## Running the Application

From the project root:

```bash
mvn clean install
mvn spring-boot:run
```

The API is then available at `http://localhost:8080`.

## API Conventions

Successful create operations return `201 Created`. Successful reads, updates, and status changes return `200 OK`. Successful deletions return `204 No Content`. Validation failures return `400 Bad Request`, missing resources return `404 Not Found`, duplicate email conflicts return `409 Conflict`, and unexpected failures return `500 Internal Server Error`.

Validation and application errors use a consistent shape:

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-08-18T18:30:00",
  "errors": {
    "email": "Email must be valid",
    "name": "Name is required"
  }
}
```

Task statuses are `TODO`, `IN_PROGRESS`, and `COMPLETED`. Task priorities are `LOW`, `MEDIUM`, and `HIGH`.

## Employee APIs

### Add Employee

```http
POST /api/employees
Content-Type: application/json
```

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "Engineering",
  "jobTitle": "Java Developer"
}
```

Returns `201 Created`:

```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "Engineering",
  "jobTitle": "Java Developer"
}
```

### Get All Employees

```http
GET /api/employees
```

### Get Employee by ID

```http
GET /api/employees/1
```

### Search Employees

Search by name, department, or both. Query parameters are optional; an empty search returns all employees.

```http
GET /api/employees/search?name=Rahul
GET /api/employees/search?department=Engineering
GET /api/employees/search?name=Rahul&department=Engineering
```

### Update Employee

```http
PUT /api/employees/1
Content-Type: application/json
```

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "Engineering",
  "jobTitle": "Senior Java Developer"
}
```

### Delete Employee

```http
DELETE /api/employees/1
```

The employee-to-task relationship uses cascading deletion with orphan removal, so associated tasks are removed rather than left with an invalid foreign key.

### Get Employee Tasks

```http
GET /api/employees/1/tasks
```

## Task APIs

### Assign a Task

```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "title": "Complete Spring Boot Training",
  "description": "Complete the assigned Spring Boot development training.",
  "priority": "HIGH",
  "dueDate": "2026-08-30",
  "employeeId": 1
}
```

The initial status defaults to `TODO` when it is omitted. Returns `201 Created`:

```json
{
  "id": 1,
  "title": "Complete Spring Boot Training",
  "description": "Complete the assigned Spring Boot development training.",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-08-30",
  "employeeId": 1
}
```

### Get All Tasks

```http
GET /api/tasks
```

### Get Task by ID

```http
GET /api/tasks/1
```

### Get Tasks Assigned to an Employee

```http
GET /api/employees/1/tasks
```

### Update Task

```http
PUT /api/tasks/1
Content-Type: application/json
```

```json
{
  "title": "Complete Spring Boot Training",
  "description": "Finish Spring Boot training and submit the assignment.",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-08-30",
  "employeeId": 1
}
```

### Update Task Status

```http
PATCH /api/tasks/1/status
Content-Type: application/json
```

```json
{
  "status": "COMPLETED"
}
```

### Delete Task

```http
DELETE /api/tasks/1
```

## Postman

A ready-to-import Postman collection is included at `postman/employee-task-management.postman_collection.json`. Import the collection, start the application, and run the requests in order. The collection defines a `baseUrl` variable set to `http://localhost:8080` and stores the most recently created employee and task IDs for subsequent requests.

## Testing

Run the complete automated test suite with:

```bash
mvn test
```

The unit tests use JUnit 5 and Mockito to verify employee and task service behavior, including successful operations, duplicate email detection, missing employees, missing tasks, task assignment, updates, status changes, deletion, listing, and search.

## Design Notes

Controllers accept and return DTOs rather than exposing JPA entities. Business rules remain in service implementations. The employee-task association is represented by `Employee` with a cascading, orphan-removing one-to-many collection and `Task` with a required lazy many-to-one association. The API never serializes the entity graph directly, preventing recursive JSON output.
