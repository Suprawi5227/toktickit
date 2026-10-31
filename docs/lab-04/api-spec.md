# Lab 4 REST API Specification: Actions Taken, Dashboards, and Ticket Workflow

**Base URL**: `/api`  
**Authentication**: Session-based (HTTP-Only signed JWT cookie)

---

## 1. Actions Taken Endpoints

### 1.1. Create Action Taken
- **Route**: `POST /tickets/:id/actions-taken`
- **Authorized Roles**: `IT_STAFF`, `ADMIN`
- **Purpose**: Log a technical work action performed under a specific ticket.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "actionDateTime": "2026-10-31T14:30:00.000Z",
    "description": "Inspected power delivery circuit and replaced swollen capacitor.",
    "result": "System boots reliably, completed 30-minute stress test.",
    "followUpRequired": true,
    "followUpNote": "Check stability during heavy workload next Tuesday.",
    "attachmentNotes": "Refer to diagnostics-log.txt in ticket attachments."
  }
  ```
- **Validation Rules**:
  - `description`: String, required, min 3 chars.
  - `result`: String, required, min 3 chars.
  - `followUpRequired`: Boolean, default `false`.
  - `followUpNote`: String, required if `followUpRequired` is `true`. Optional if `false`.
  - `performedById`: Automatically bound to `req.user.id`. Client cannot spoof this value.
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "id": 101,
        "ticketId": 45,
        "actionDateTime": "2026-10-31T14:30:00.000Z",
        "description": "Inspected power delivery circuit and replaced swollen capacitor.",
        "result": "System boots reliably, completed 30-minute stress test.",
        "performedBy": {
          "id": 3,
          "name": "Kevin Patel",
          "email": "kevin.patel@toktickit.com",
          "role": "IT_STAFF"
        },
        "followUpRequired": true,
        "followUpNote": "Check stability during heavy workload next Tuesday.",
        "attachmentNotes": "Refer to diagnostics-log.txt in ticket attachments.",
        "createdAt": "2026-10-31T14:32:10.000Z",
        "updatedAt": "2026-10-31T14:32:10.000Z"
      }
    }
    ```
  - `400 Bad Request`: Validation failure (e.g. `followUpRequired` is true but `followUpNote` is empty).
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Authenticated user is a `REQUESTER`.
  - `404 Not Found`: Ticket does not exist.

---

### 1.2. List Actions Taken for a Ticket
- **Route**: `GET /tickets/:id/actions-taken`
- **Authorized Roles**: All authenticated users (with ownership check for `REQUESTER`).
- **Purpose**: Retrieve historical log of Actions Taken for a ticket in ascending chronological order.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 101,
          "ticketId": 45,
          "actionDateTime": "2026-10-31T14:30:00.000Z",
          "description": "Initial diagnosis performed.",
          "result": "Identified bad RAM slot.",
          "performedBy": {
            "id": 3,
            "name": "Kevin Patel",
            "role": "IT_STAFF"
          },
          "followUpRequired": false,
          "followUpNote": null,
          "attachmentNotes": null,
          "createdAt": "2026-10-31T14:32:10.000Z"
        }
      ]
    }
    ```
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Authenticated user is a `REQUESTER` attempting to view actions for a ticket belonging to another user.
  - `404 Not Found`: Ticket does not exist.

---

### 1.3. Update Action Taken
- **Route**: `PATCH /tickets/:id/actions-taken/:actionId`
- **Authorized Roles**: `IT_STAFF`, `ADMIN`
- **Purpose**: Modify an existing action record (e.g. updating result or adding follow-up resolution).
- **Request Body**: Partial fields allowed (`description`, `result`, `followUpRequired`, `followUpNote`, `attachmentNotes`).
- **Responses**:
  - `200 OK`: Returns updated Action Taken object.
  - `400 Bad Request`: Validation failure (e.g. `followUpRequired` set to true without note).
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Requester account.
  - `404 Not Found`: Action Taken or Ticket not found.
  - `409 Conflict`: Concurrency update mismatch.

---

### 1.4. Retrieve Single Action Taken Details
- **Route**: `GET /tickets/:id/actions-taken/:actionId`
- **Authorized Roles**: All authenticated users (with ownership check for `REQUESTER`).
- **Purpose**: Retrieve full details of an individual Action Taken record by its ID.
- **Responses**:
  - `200 OK`: Returns single Action Taken object matching shape in 1.1.
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Authenticated user is a `REQUESTER` querying an action under another user's ticket.
  - `404 Not Found`: Ticket or Action Taken record does not exist.

---

### 1.5. Audit Trail & Omission of DELETE Endpoint
- **Design Rule**: The TokTickIT API intentionally does not expose a `DELETE /tickets/:id/actions-taken/:actionId` endpoint.
- **Rationale**: Actions Taken constitute historical records of actual technical work performed. Omitting deletion guarantees that technical work records remain permanent, tamper-evident audit trails as mandated by enterprise service-desk standards.

---

## 2. Role Dashboards Endpoints

### 2.1. IT Staff & Admin Dashboard Metrics
- **Route**: `GET /dashboards/staff`
- **Authorized Roles**: `IT_STAFF`, `ADMIN`
- **Purpose**: Return operational counts and summary metrics for the staff cockpit (with concise user accounts summary when queried by `ADMIN`).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "metrics": {
          "newCount": 14,
          "openCount": 23,
          "inProgressCount": 18,
          "waitingRequesterCount": 7,
          "myAssignedCount": 16,
          "unassignedCount": 12
        },
        "priorityBreakdown": {
          "urgent": 4,
          "high": 9,
          "medium": 28,
          "low": 17
        },
        "userSummary": {
          "totalUsers": 12,
          "activeUsers": 11,
          "requesters": 6,
          "staff": 4,
          "admins": 2
        },
        "recentTickets": [
          {
            "id": 45,
            "ticketNo": "TKT-2026-00034",
            "summary": "Laptop battery drains quickly",
            "status": "IN_PROGRESS",
            "itPriority": "HIGH",
            "updatedAt": "2026-10-31T14:32:10.000Z",
            "owner": {
              "id": 3,
              "name": "Kevin Patel"
            }
          }
        ]
      }
    }
    ```
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Requester account.

---

### 2.2. Requester Dashboard Metrics
- **Route**: `GET /dashboards/requester`
- **Authorized Roles**: `REQUESTER` (or `ADMIN`/`IT_STAFF` querying their own requester tickets)
- **Purpose**: Return summary counts for tickets strictly owned by the caller.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "metrics": {
          "totalOpen": 5,
          "inProgressCount": 2,
          "waitingOnMeCount": 1,
          "resolvedCount": 5,
          "closedCount": 12
        },
        "recentTickets": [
          {
            "id": 45,
            "ticketNo": "TKT-2026-001234",
            "summary": "Need new monitor",
            "status": "IN_PROGRESS",
            "updatedAt": "2026-10-31T14:32:10.000Z",
            "createdAt": "2026-10-30T10:00:00.000Z"
          }
        ]
      }
    }
    ```
  - `401 Unauthorized`: Not authenticated.

---

## 3. Ticket Workflow & Lifecycle Endpoints

### 3.1. Update Ticket Status (with Formal Resolution Gate)
- **Route**: `PATCH /tickets/:id/status`
- **Authorized Roles**: `IT_STAFF`, `ADMIN` (Requesters may only cancel tickets in `NEW` status)
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "lastUpdatedAt": "2026-10-31T14:00:00.000Z"
  }
  ```
- **Behavior & Rules**:
  - Validates requested transition against State Machine matrix (BR-07).
  - Validates `lastUpdatedAt` against current database `ticket.updatedAt`. If older, returns `409 Conflict`.
  - Requesters attempting to set `status: "RESOLVED"` or `status: "CLOSED"` receive `403 Forbidden`.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "id": 45,
        "status": "RESOLVED",
        "updatedAt": "2026-10-31T14:40:00.000Z"
      }
    }
    ```
  - `400 Bad Request`: Disallowed state transition (e.g. `NEW` to `RESOLVED`).
  - `403 Forbidden`: Unauthorized role.
  - `404 Not Found`: Ticket does not exist.
  - `409 Conflict`: Stale update detected (optimistic concurrency error).
    ```json
    {
      "error": "Conflict: Ticket has been modified by another user. Please refresh and retry."
    }
    ```

---

### 3.2. Advisory Requester Resolution Indication
- **Route**: `PATCH /tickets/:id/indicate-resolved`
- **Authorized Roles**: `REQUESTER` (strictly owner)
- **Purpose**: Requester advisory feedback indicating problem appears resolved.
- **Behavior**:
  - Sets `ticket.requesterResolvedInd = true`.
  - Appends an automated Public Comment: *"Requester indicated that the problem appears resolved."*
  - Does NOT transition ticket status to `RESOLVED` (enforces Resolution Gate BR-08 and BR-09).
- **Responses**:
  - `200 OK`: Returns updated ticket summary.
  - `403 Forbidden`: Not the ticket owner.
