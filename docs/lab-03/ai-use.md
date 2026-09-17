# Lab 3 AI Use and Reflection

## LLM Model Used
- **Model**: Gemini 3.6 Flash / Antigravity AI Coding Assistant

---

## Key Prompts Used (6-10 Prompts)

1. **Sprint Engineering Specification Generation**:
   > *"Draft docs/lab-03/specification.md covering Sprint Goal, Stakeholder Request, Scope, FR-01..14, BR-01..15, UI summary, Data Changes, API Contract, AC-01..12, Definition of Done, and Assumptions."*

2. **UI & API Specifications**:
   > *"Generate docs/lab-03/ui-spec.md and api-spec.md extending Zen Green design tokens to Login, Change Password, IT Queue, IT Ticket Detail, Public Comments, Internal Notes, and Admin User Management."*

3. **Test Plan & AC Traceability**:
   > *"Create docs/lab-03/tests.md listing Unit, API, UI, and Authorization test cases mapped to AC-01 through AC-12."*

4. **Prisma Schema & Data Evolution**:
   > *"Evolve server/prisma/schema.prisma to add User, Role, ITPriority, PublicComment, InternalNote models and set up relationships for Ticket requester and owner."*

5. **Authentication & Password Hashing**:
   > *"Implement authMiddleware, bcrypt password hashing, JWT session cookies, and mandatory first-login password change in server/src/middleware/auth.ts and auth.routes.ts."*

6. **IT Staff Ticket Queue & Workflow Endpoints**:
   > *"Build REST endpoints for IT Queue filtering, ticket claiming, reassigning, IT Priority updates, status transitions, Public Comments, and role-restricted Internal Notes."*

7. **Admin User Management & Safety Enforcement**:
   > *"Implement Admin user CRUD endpoints in server/src/routes/admin.routes.ts with safety rules blocking self-deactivation and deactivating the last active Admin."*

8. **Frontend Integration & Zen Green UI**:
   > *"Update client/src/App.tsx, AuthContext, LoginScreen, StaffTicketQueue, StaffTicketDetail, and UserManagement components."*

---

## Reflection on AI Specification & Coding Agent Use

Using AI agents for Spec-Driven Development (Spec DD) and Test-Driven Development (TDD) provided structural clarity and prevented logic oversights before code was written. 

1. **Spec DD Benefits**: Writing the specification document upfront ensured that critical safety constraints—such as preventing an Administrator from deactivating their own account or removing the last active Admin—were explicitly defined and tested.
2. **Authorization Rigor**: AI-driven role enforcement ensured that server-side validation was added to every endpoint rather than relying solely on UI button hiding.
3. **Efficiency**: Iterative code generation allowed rapid end-to-end implementation from database schema migration to responsive UI components with full test coverage.
