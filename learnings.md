# NestJS Learnings — Helpdesk API

My notes from building a simple helpdesk (tickets) API with NestJS.

## Contents

1. [Project Basics](#1-project-basics)
2. [Building Blocks: Module, Controller, Service, Interface](#2-building-blocks)
3. [Get All Tickets](#3-get-all-tickets)
4. [Route Parameter — Get One Ticket](#4-route-parameter--get-one-ticket)
5. [Query Parameters — Filter Tickets](#5-query-parameters--filter-tickets)
6. [Create a Ticket (POST)](#6-create-a-ticket-post)
7. [DTO — Shape of Incoming Data](#7-dto--shape-of-incoming-data)
8. [class-validator & class-transformer](#8-class-validator--class-transformer)
9. [ValidationPipe](#9-validationpipe)
10. [Still to Learn](#10-still-to-learn)

---

## 1. Project Basics

- [x] Install NestJS
- [x] Run the project — `npm run start:dev` (watch mode, reloads on code changes)
- [x] `main.ts` — the entry point. It creates the app, applies global settings, and starts the server.

**Global prefix:** `app.setGlobalPrefix('api')` in `main.ts` puts `/api` in front of every route.

- `http://localhost:3000/api/tickets` ✅
- `http://localhost:3000/tickets` ❌ 404

> Tip: use `api/v1` as the prefix if you want versioning later.

---

## 2. Building Blocks

Each feature (like `tickets`) has its own folder with these pieces:

| Piece | Job | CLI command |
|---|---|---|
| **Module** | Feature boundary. Groups the controller and service together. | `nest g module tickets` |
| **Controller** | Handles HTTP only: route, param, query, body. **No business logic.** | `nest g controller tickets --no-spec` |
| **Service** | Business logic: find, create, update, delete. | `nest g service tickets --no-spec` |
| **Interface** | Describes what a ticket looks like (its fields and types). | `nest g interface tickets/ticket --flat` |

- `nest g module tickets` also adds `TicketsModule` to the imports in `app.module.ts`. The root module is where the app learns which features it has.
- `--no-spec` → skip creating the test file.
- `--flat` → create the file directly in the given folder, without making a new subfolder.

**Rule to remember:** HTTP things go in the **controller**. Ticket logic goes in the **service**.

---

## 3. Get All Tickets

**Steps:**

```
create module → create controller (check the route works) → create service (logic lives here)
→ create interface (define the type) → inject service into controller → test in Postman
```

The controller gets the service through the constructor:

```ts
constructor(private readonly ticketService: TicketsService) {}
```

---

## 4. Route Parameter — Get One Ticket

**Goal:** get one ticket by id → `GET /api/tickets/1`

**Steps:**

1. **Service** — `findOne(id)` looks up the ticket. If it isn't found, throw `NotFoundException` (Nest turns it into a `404`).
2. **Controller** — add `@Get(':id')` and read the id with `@Param('id')`.

**Note:** URL values always arrive as **strings**. Use `ParseIntPipe` to convert the id to a number:

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { ... }
```

If the id isn't a number (`/tickets/abc`), Nest returns `400 Bad Request` automatically.

---

## 5. Query Parameters — Filter Tickets

**Goal:** filter the list → `GET /api/tickets?status=open&priority=high`

**Steps:**

1. **Service** — `findAll(status?, priority?)` takes both as optional. If `status` is given, filter by it. If `priority` is given, filter by it too. Return the result.
2. **Controller** — in the same `@Get()`, read the values with `@Query('status')` and `@Query('priority')` and pass them to the service.

**Param vs Query:**

| | Param | Query |
|---|---|---|
| Example | `/tickets/1` | `/tickets?status=open` |
| Purpose | Identify **one** resource | Filter / sort / page a **list** |
| Required? | Yes | No (optional) |

**Notes:**

- No matches → returns an empty array `[]`, not an error.
- Query values are also **strings**. Use `ParseIntPipe` for numbers (for example `?page=2`).

---

## 6. Create a Ticket (POST)

**Goal:** add a new ticket → `POST /api/tickets`. The data comes in the **request body** (JSON), not in the URL.

**Steps:**

1. **Service** — the `create()` method:
   - sets `id` from `nextId++` (each new ticket gets the next number)
   - sets `createdAt` with `new Date().toISOString()`
   - pushes the ticket into the array and returns it
2. **Controller** — use `@Post()` and `@Body()` to read the JSON, then pass it to the service.

The client never sends `id` or `createdAt`. The server sets them.

**Notes:**

- POST returns **`201 Created`** by default (not `200`).
- Postman: **Body → raw → JSON**.
- Data lives in memory, so new tickets disappear when the server restarts.

---

## 7. DTO — Shape of Incoming Data

**DTO = Data Transfer Object:** a class that describes the data a request is allowed to send.

**Problem it solves:** with `payload: any`, anything was accepted: an empty body `{}`, a wrong priority like `"urgent"`, extra fields. The ticket was still created, just with `undefined` values.

**Create it:**

```bash
nest g class tickets/dto/create-ticket.dto --no-spec --flat
```

- It contains only what the client sends: `title`, `subject`, `description`, `priority`, `status` (no `id` or `createdAt`).
- Use it in place of `any`: `@Body() createTicketDto: CreateTicketDto` in the controller, and the same type in the service.

**Why a class and not an interface?** Interfaces disappear after compiling. Classes still exist at runtime, so Nest can check them.

⚠️ A DTO on its own only gives you a **type**. It doesn't block bad data. For that you need sections 8 and 9.

---

## 8. class-validator & class-transformer

```bash
npm i class-validator class-transformer
```

| Package | What it does |
|---|---|
| **class-validator** | Decorators that put rules on DTO fields: `@IsString()`, `@IsNotEmpty()`, `@IsIn(['low', 'medium', 'high'])` |
| **class-transformer** | Turns the plain request JSON into a DTO instance, so the rules can run |

**Problem it solves:** you write the rules **once**, in the DTO. No more `if/else` checks in the controller or service.

---

## 9. ValidationPipe

A **pipe** runs **before** the controller method. `ValidationPipe` checks the body against the DTO rules.

- Valid → the request continues to the controller.
- Invalid → it stops and returns **`400 Bad Request`** with the error messages. The controller and service never run.

**Setup (global, in `main.ts`, applies to every route):**

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

`whitelist: true` → removes fields that aren't in the DTO (for example `"id": 999` or `"hacker": true`).

**Tested results:**

| Request body | Result |
|---|---|
| `{}` | `400` — "title should not be empty", "priority must be one of the following values…" |
| `"priority": "urgent"` | `400` — only the priority error |
| Valid body + extra fields | `201` — extra fields removed |

**Request flow:**

```
Request → ValidationPipe (check against DTO) → Controller → Service → Response
```

---

## 10. Still to Learn

- [x] What goes in the controller, module, and service → [section 2](#2-building-blocks)
- [x] Route (dynamic) parameters → [section 4](#4-route-parameter--get-one-ticket)
- [x] Query parameters → [section 5](#5-query-parameters--filter-tickets)
- [x] Validation → [sections 7–9](#7-dto--shape-of-incoming-data)
- [ ] Error messages — `NotFoundException` gives a `404` by default; next is learning the other built-in exceptions and custom error responses
- [ ] Update (`PATCH`) and delete (`DELETE`) tickets
- [ ] Connect a real database (PostgreSQL)
- [ ] Caching — Nest doesn't cache by default; `@nestjs/cache-manager` adds it
