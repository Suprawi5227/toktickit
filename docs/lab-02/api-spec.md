# Lab 2 API Specification

## Base URL
`/api`

## 1. Reference Data Endpoints

### 1.1 GET /categories
- **Purpose**: Retrieve active Ticket Categories.
- **Response** (200 OK):
  ```json
  [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" }
  ]
  ```

### 1.2 GET /related-systems
- **Purpose**: Retrieve active Related Systems.
- **Response** (200 OK): List of systems (e.g., Email, VPN).

### 1.3 GET /requesters
- **Purpose**: Retrieve active Development Requesters (for the mock login selector).
- **Response** (200 OK): List of active requesters. Inactive requesters must not be returned.

## 2. Ticket Endpoints

### 2.1 POST /tickets
- **Purpose**: Create a new Ticket for the selected Development Requester.
- **Request Body**:
  ```json
  {
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 3,
    "summary": "Laptop battery drains quickly",
    "description": "The battery only lasts 30 minutes after full charge.",
    "requestedPriority": "MEDIUM"
  }
  ```
- **Responses**:
  - `201 Created`: Returns the saved Ticket, including the generated `ticketNumber` and default status `NEW`.
  - `400 Bad Request`: Validation failure (e.g., missing summary).

### 2.2 GET /tickets
- **Purpose**: Retrieve the paginated list of tickets owned by the current Requester.
- **Query Parameters**:
  - `requesterId` (required for Lab 2 context)
  - `search` (optional): text search on summary/description.
  - `status`, `priority`, `category` (optional): filters.
  - `sortBy` (optional): default is `createdAt`, secondary is `ticketNumber`.
  - `page`, `limit` (optional): pagination controls.
- **Responses**:
  - `200 OK`: Returns paginated tickets array and `meta` for pagination.
  - `400 Bad Request`: Missing `requesterId`.

### 2.3 GET /tickets/:id
- **Purpose**: Retrieve details of a specific Ticket.
- **Responses**:
  - `200 OK`: Full ticket details including active attachments.
  - `404 Not Found`: Ticket doesn't exist.
  - `403 Forbidden`: Ticket belongs to a different Requester.

## 3. Attachment Endpoints

### 3.1 POST /tickets/:id/attachments
- **Purpose**: Upload an attachment to an existing Ticket.
- **Content-Type**: `multipart/form-data`
- **Validation**: Max 5MB, allowed types (JPG, PNG, WEBP, PDF), max 5 files per ticket.
- **Responses**:
  - `201 Created`: Attachment metadata saved.
  - `400 Bad Request`: File too large, invalid type, or limit reached.
  - `403 Forbidden`: Ticket not owned by Requester.

### 3.2 GET /tickets/:id/attachments/:attachmentId
- **Purpose**: Download an active attachment.
- **Responses**:
  - `200 OK`: File stream.
  - `404 Not Found`: File removed or does not exist.
  - `403 Forbidden`: Ticket not owned by Requester.

### 3.3 DELETE /tickets/:id/attachments/:attachmentId
- **Purpose**: Soft-remove an attachment.
- **Request Body**: `{ "reason": "Wrong file uploaded" }`
- **Responses**:
  - `200 OK`: Marked as removed. Metadata retained.
  - `403 Forbidden`: Unauthorized.
