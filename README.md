# TokTickIT - IT Service Desk & Management System

TokTickIT is an IT Support Ticketing and User Management system built for CPE334 (Introduction to Software Engineering in the Age of AI Agents).

React UI -> Express REST API -> Prisma ORM -> PostgreSQL

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Bootstrap, Zen Green Design Language
* **Backend:** Node.js, Express, TypeScript, JWT & Cookie Session Authentication, bcrypt
* **Database:** PostgreSQL, Prisma ORM
* **Testing:** Vitest, Supertest, Playwright

## Repository Structure

```text
toktickit/
  client/
    src/
      components/
        LoginScreen.tsx
        StaffTicketQueue.tsx
        StaffTicketDetail.tsx
        UserManagement.tsx
      contexts/
        AuthContext.tsx
  server/
    prisma/
      schema.prisma
      seed.ts
    src/
      middleware/
        auth.ts
      routes/
        auth.routes.ts
        staff.routes.ts
        admin.routes.ts
    tests/
      lab-03/
  docs/
    lab-01/
    lab-02/
    lab-03/
      specification.md
      ui-spec.md
      api-spec.md
      tests.md
      reviewer.md
      ai-use.md
  README.md
```

## Local Setup

### 1) Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2) Database Setup & Migration

```bash
cd server
npx prisma db push --accept-data-loss
npx prisma db seed
```

### 3) Run Development Server

```bash
# Backend API (Port 3000)
cd server
npm run dev

# Frontend App (Port 5173)
cd client
npm run dev
```

### 4) Run Lab 3 Tests

```bash
# Server API & Auth Tests
cd server
npx vitest run tests/lab-03/

# Client UI Tests
cd client
npx vitest run tests/lab-03/
```

## Lab 3 Scope Summary

* **Authentication & Authorization:** Email + Password login, mandatory first-login password change, Role-Based Access Control (Requester, IT Staff, Administrator).
* **IT Staff Workflow:** Ticket Queue with search, filtering, sorting, pagination, ticket claiming, reassigning, IT Priority, status transitions, Public Comments, and Internal Notes.
* **Administrator User Management:** Minimalist User Management screen to list, search, create, edit, reset initial password, and enforce safety rules (prevent self-deactivation & last admin removal).
