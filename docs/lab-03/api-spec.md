# Lab 3 REST API Specification

**Base URL**: `/api`

---

## 1. Authentication Endpoints

### 1.1 `POST /auth/login`
- **Purpose**: Authenticate user with credentials and establish session.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Responses**:
  - `200 OK`: Returns authenticated user info and sets HTTP-Only session cookie.
    ```json
    {
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "user@example.com",
        "role": "IT_STAFF",
        "requiresPasswordChange": false
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials or account is disabled (`isActive = false`). Message must be safe: `"Invalid email or password"`.

### 1.2 `POST /auth/logout`
- **Purpose**: Destroy current authenticated session and clear session cookie.
- **Responses**: `200 OK` `{ "message": "Logged out successfully" }`

### 1.3 `GET /auth/me`
- **Purpose**: Retrieve current authenticated user profile and role.
- **Responses**:
  - `200 OK`: Returns user profile object.
  - `401 Unauthorized`: No active valid session.

### 1.4 `POST /auth/change-password`
- **Purpose**: Mandatory first-login password change for users with `requiresPasswordChange = true`.
- **Request Body**:
  ```json
  {
    "currentPassword": "InitialPassword123!",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: Password updated, `requiresPasswordChange` set to `false`.
  - `400 Bad Request`: Password does not meet strength rules or current password incorrect.
  - `401 Unauthorized`: Not authenticated.

---

## 2. IT Staff Ticket Queue & Workflow Endpoints

### 2.1 `GET /tickets/queue`
- **Access**: Restricted to `IT_STAFF` and `ADMIN`.
- **Query Parameters**:
  - `search` (optional): Keyword search on ticket number or summary.
  - `status` (optional): Filter by `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
  - `itPriority` (optional): Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `ownerId` (optional): Filter by assigned owner ID (or `unassigned`).
  - `page` (default: 1), `limit` (default: 10).
  - `sortBy` (default: `createdAt`), `sortOrder` (`asc` | `desc`).
- **Responses**:
  - `200 OK`: Paginated ticket array + pagination metadata.
  - `403 Forbidden`: Requesting user is `REQUESTER`.

### 2.2 `PATCH /tickets/:id/claim`
- **Access**: `IT_STAFF` and `ADMIN`.
- **Purpose**: Claim ownership of an unassigned ticket.
- **Responses**:
  - `200 OK`: Ticket owner updated to current user ID. If status was `NEW`, status transitions to `OPEN`.
  - `403 Forbidden`: Unauthorized role.
  - `404 Not Found`: Ticket does not exist.

### 2.3 `PATCH /tickets/:id/reassign`
- **Access**: `IT_STAFF` and `ADMIN`.
- **Request Body**: `{ "ownerId": 5 }` (Must be an active IT Staff or Admin user).
- **Responses**: `200 OK` or `400 Bad Request` (if user is inactive or non-staff).

### 2.4 `PATCH /tickets/:id/status`
- **Access**: `IT_STAFF` and `ADMIN`.
- **Request Body**: `{ "status": "IN_PROGRESS" }`
- **Responses**:
  - `200 OK`: Updated ticket object.
  - `400 Bad Request`: Invalid transition according to BR-08 transition matrix.

### 2.5 `PATCH /tickets/:id/it-priority`
- **Access**: `IT_STAFF` and `ADMIN`.
- **Request Body**: `{ "itPriority": "HIGH" }`
- **Responses**: `200 OK`.

### 2.6 `PATCH /tickets/:id/indicate-resolved`
- **Access**: `REQUESTER` (Owner of ticket only).
- **Purpose**: Requester indicates that problem appears resolved.
- **Responses**: `200 OK`: Sets `requesterResolvedInd = true` and posts an automated Public Comment.

---

## 3. Public Comments & Internal Notes Endpoints

### 3.1 `GET /tickets/:id/comments` & `POST /tickets/:id/comments`
- **GET Access**: Requester (owned ticket), IT Staff, Admin.
- **POST Access**: Requester (owned ticket), IT Staff, Admin.
- **POST Body**: `{ "content": "Thank you for the update!" }`
- **Responses**:
  - `201 Created`: Comment appended with server timestamp and author details.
  - `400 Bad Request`: Empty or whitespace-only content.
  - `403 Forbidden`: Requester attempting to comment on unowned ticket.

### 3.2 `GET /tickets/:id/notes` & `POST /tickets/:id/notes`
- **GET / POST Access**: `IT_STAFF` and `ADMIN` strictly (403 Forbidden for `REQUESTER`).
- **POST Body**: `{ "content": "Replaced user's network card. Testing connection." }`
- **Responses**:
  - `201 Created`: Internal note appended.
  - `403 Forbidden`: Requester role rejected without leaking note contents.

---

## 4. Administrator User Management Endpoints

### 4.1 `GET /admin/users`
- **Access**: `ADMIN` only.
- **Query Parameters**: `search` (name/email), `role` (`REQUESTER`, `IT_STAFF`, `ADMIN`), `page`, `limit`.
- **Responses**: `200 OK`: User list array with pagination metadata.

### 4.2 `POST /admin/users`
- **Access**: `ADMIN` only.
- **Request Body**:
  ```json
  {
    "name": "Alex Thompson",
    "email": "alex.thompson@toktickit.com",
    "role": "IT_STAFF",
    "isActive": true,
    "initialPassword": "InitialPassword123!"
  }
  ```
- **Responses**:
  - `201 Created`: User created with `requiresPasswordChange = true`.
  - `409 Conflict` / `400 Bad Request`: Duplicate email address or invalid role value.

### 4.3 `PATCH /admin/users/:id`
- **Access**: `ADMIN` only.
- **Request Body**: `{ "name": "...", "email": "...", "role": "...", "isActive": false }`
- **Safety Checks**:
  - Rejects self-deactivation (`400 Bad Request`: "Cannot deactivate your own logged-in account").
  - Rejects deactivation of the last active Admin (`400 Bad Request`: "System must have at least one active Administrator").

### 4.4 `POST /admin/users/:id/reset-password`
- **Access**: `ADMIN` only.
- **Request Body**: `{ "initialPassword": "NewInitialPass123!" }`
- **Responses**: `200 OK`: Reset user's password hash and set `requiresPasswordChange = true`.
