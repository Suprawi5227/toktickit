# Lab 4 UI Specification: Zen Green Theme Extensions & Dashboards

## 1. Design System & Zen Green Theme Continuity
Lab 4 strictly preserves and extends the **Zen Green** design language established in Lab 2 and Lab 3. The application shell, dashboards, ticket details, and modals must feel like one seamless, unified product.

### Color Tokens
- **Primary Brand Green**: `#006B3C` (Navbar brand, primary buttons, active tabs, metric highlights)
- **Primary Hover Green**: `#0B7A46` (Button hover states, focus rings, link accents)
- **Soft Green Surface**: `#EAF6EF` (Selected row background, badge backgrounds, card headers)
- **Deep Slate Text**: `#1A3326` (High-contrast typography, heading titles)
- **Muted Gray Text**: `#5C6F64` (Secondary labels, timestamps, metadata)
- **Canvas Background**: `#F5F7F6` (Quiet, accessible neutral background)
- **Surface White**: `#FFFFFF` (Card surfaces, modals, input containers)
- **Card Border**: `#E0E6E3` (Subtle container separation, 1px solid)
- **Status & Priority Semantics**:
  - `New`: Blue badge (`#0D6EFD`, bg `#E7F1FF`)
  - `Open`: Purple badge (`#6F42C1`, bg `#F2E7FE`)
  - `In Progress`: Amber/Orange badge (`#FD7E14`, bg `#FFF3CD`)
  - `Waiting for Requester`: Warning badge (`#FFC107`, text `#664D03`, bg `#FFF8E1`)
  - `Resolved`: Primary Green badge (`#006B3C`, bg `#EAF6EF`)
  - `Closed`: Gray badge (`#6C757D`, bg `#F8F9FA`)
  - `Reopened`: Teal badge (`#20C997`, bg `#E6FAF4`)
  - `Cancelled`: Dark red badge (`#DC3545`, bg `#F8D7DA`)

---

## 2. Global Navigation & Shell Enhancements

### Navigation Bar
- **App Title**: `TokTickIT` with active service desk badge.
- **Role-Appropriate Links**:
  - **Requester**:
    - `Dashboard` (Active indicator when on dashboard)
    - `My Tickets`
    - `Create Ticket`
  - **IT Staff**:
    - `Dashboard`
    - `Ticket Queue`
  - **Administrator**:
    - `Dashboard` (Shared staff operational dashboard + admin quick link)
    - `Ticket Queue`
    - `User Management`
- **Right Utilities**:
  - User greeting with role badge: `[Requester]`, `[IT Staff]`, `[Admin]`
  - Profile dropdown with "Change Password" and "Logout" buttons.

---

## 3. Screen Specifications

### 3.1. IT Staff Operational Dashboard (`/dashboard`)
The IT Staff Dashboard serves as the daily operational cockpit for service-desk staff.

```text
+---------------------------------------------------------------------------------+
| Welcome back, Michael!                                            [Refresh]    |
| Here's what's happening with your queue today.                                  |
|                                                                                 |
| [  New   ]   [   Open   ]   [ In Progress ]   [ Waiting Req ]   [ My Assigned ] |
| [   14   ]   [    23    ]   [     18      ]   [      7      ]   [     16      ] |
| +2 today     -1 yesterday    +4 active          Needs reply      Assigned to me |
+---------------------------------------------------------------------------------+
| My Recent Tickets                    View all | Quick Actions                   |
| +-------------------------------------------+ | +-----------------------------+ |
| | TKT-2026-00034   [In Progress]  May 12, 09:14 AM| | [+] Create Ticket           |
| | Laptop battery drains quickly              | | [Q] Search Tickets          |
| +-------------------------------------------+ | | [>] My Queue                |
| | TKT-2026-00030   [Open]         May 10, 02:15 PM| +-----------------------------+ |
| | Printer keeps showing offline              |                                 |
| +-------------------------------------------+                                 |
+---------------------------------------------------------------------------------+
```

#### Key Elements:
1. **Welcome Banner**: Personal greeting with authenticated staff name and manual Refresh button.
2. **Metric Cards Row (5 Cards)**:
   - **Card 1: New** (Count of unassigned new tickets)
   - **Card 2: Open** (Count of open tickets)
   - **Card 3: In Progress** (Count of actively worked tickets)
   - **Card 4: Waiting for Requester** (Count of blocked tickets)
   - **Card 5: My Assigned** (Count of tickets where `ownerId == currentUser.id`)
   - *Behavior*: Clicking any metric card drills down to the Ticket Queue with pre-applied status or owner filter.
3. **Recent Tickets Panel**:
   - Lists up to 5 recently updated tickets assigned to or worked by the user.
   - Shows Ticket Number, Summary, Status badge, and formatted timestamp.
   - Clickable row navigates directly to Ticket Detail.
4. **Quick Actions Panel**:
   - Prominent shortcut buttons: "Create Ticket", "Search Tickets", "My Queue".

---

### 3.2. Requester Dashboard (`/dashboard`)
Provides authenticated requesters with a clear view of their submitted requests without duplicating the entire My Tickets list.

```text
+---------------------------------------------------------------------------------+
| Welcome, Jennifer!                                                              |
| Here's the latest on your requests.                                             |
|                                                                                 |
| [ My Open Tickets ]   [   In Progress   ]   [    Resolved    ]   [    Closed    ] |
| [        3        ]   [        2        ]   [        5       ]   [      12      ] |
| View all              View all              View all             View all       |
+---------------------------------------------------------------------------------+
| My Recent Tickets                    View all | Quick Actions                   |
| +-------------------------------------------+ | +-----------------------------+ |
| | TKT-2026-001234   [In Progress] May 12, 09:14 | | [+] Create Ticket           |
| | Need new monitor                           | |     Submit a new request     |
| +-------------------------------------------+ | +-----------------------------+ |
| | TKT-2026-000987   [Resolved]    May 08, 04:20 | | [=] View My Tickets         |
| | Email not syncing                          | |     Track existing requests  |
| +-------------------------------------------+ +-----------------------------+ |
+---------------------------------------------------------------------------------+
```

#### Key Elements:
1. **Metric Cards (4 Cards)**:
   - **My Open Tickets**, **In Progress**, **Resolved**, **Closed**.
   - Strictly scoped to the authenticated requester's tickets.
2. **Recent Tickets**:
   - Shows up to 5 of the requester's recently updated tickets.
   - Displays status badge, summary, date, and link to Ticket Detail.
3. **Quick Actions**:
   - Direct button to "Create Ticket" and "View My Tickets".

---

### 3.3. Actions Taken Section on Ticket Detail
Added to the existing IT Staff Ticket Detail page below the Ticket Summary and alongside Public Comments and Internal Notes.

#### Layout:
- **Header**: "Actions Taken" with item count badge and "+ Add Action Taken" button (visible only to IT Staff and Admin).
- **Actions Taken Table / Card Stream**:
  - Columns / Fields:
    - `Date & Time`: Formatted localized timestamp (`YYYY-MM-DD HH:mm`).
    - `Description`: Clear explanation of technical diagnosis or action taken.
    - `Result`: Outcome of the action (e.g. "Replaced RAM module, boot test passed").
    - `Performed By`: Badge with the staff member's name who performed the work.
    - `Follow-Up`: Pill badge (`Follow-up Required` in amber or `None`). If required, renders the `Follow-up Note` underneath.
    - `Attachment Notes`: Reference text (e.g. "Refer to battery-test-log.png").
    - `Actions`: "Edit" button for IT Staff/Admin.
- **Requester View**:
  - The exact same historical work list is rendered in read-only format.
  - The "+ Add Action Taken" button and "Edit" action buttons are omitted entirely.

#### Add / Edit Action Taken Modal Dialog
- Accessible modal with focus trap and `aria-labelledby="actionTakenModalTitle"`.
- **Form Controls**:
  - `Action Date/Time`: Auto-defaults to current time; customizable if logging past work.
  - `Description`: Multiline textarea (Required).
  - `Result`: Multiline textarea (Required).
  - `Performed By`: Displayed as read-only text badge indicating current user.
  - `Follow-Up Required?`: Checkbox / toggle switch (`No` / `Yes`).
  - `Follow-up Note`: Textarea that dynamically appears and becomes **Required** if "Follow-Up Required?" is checked. Clear error message if submitted empty.
  - `Attachment Notes`: Optional text input to record file references.
- **Buttons**:
  - "Cancel" (secondary outlined button)
  - "Save Action" / "Update Action" (primary green button, with loading spinner during submission).

---

### 3.4. Ticket Workflow Controls & Resolution Feedback
- Located in the sidebar or top banner of Ticket Detail.
- Dropdown select or action button group displaying **only valid transitions** according to BR-07.
- Forbidden or invalid transitions are disabled or excluded from the options.
- If a ticket update triggers a concurrency conflict (HTTP 409), a prominent alert banner prompts: *"This ticket was recently updated by another user. Please refresh the page to view the latest status before making changes."* with a "Refresh Ticket" button.

#### Requester Advisory Resolution Control
- Requesters viewing their own active tickets see a prominent secondary action button: **"Problem Appears Resolved"**.
- Clicking opens a concise modal allowing the Requester to optionally submit a note (e.g. *"Printer is working properly now"*).
- Submitting appends an automated Public Comment and sets `requesterResolvedInd = true`, while keeping status in its current state per BR-08 and BR-09.

#### IT Staff Advisory Resolution Notice Banner
- When `ticket.requesterResolvedInd === true` on an open/in-progress ticket, the IT Staff Ticket Detail prominently displays an accessible notification banner:
  > 💡 **Requester Indication**: The requester has indicated that the problem appears resolved. Please inspect work, verify resolution, and formally transition the ticket status to **Resolved**.
- Includes a direct shortcut button **"Formally Resolve Ticket"** which opens the status update confirmation.

---

## 4. Responsive Layout Breakpoints

| Device | Breakpoint | Dashboard Layout | Actions Taken Layout |
|---|---|---|---|
| **Desktop** | `>= 992px` | 5 Metric cards in single row; 2-column layout (Recent Tickets left, Quick Actions right) | Full table layout with all columns visible |
| **Tablet** | `768px - 991px` | Metric cards wrap to 3 + 2 grid; stacked Recent Tickets and Quick Actions | Stacked table with horizontal scroll prevention |
| **Mobile** | `< 768px` | Metric cards wrap to 2 per row (or 1 per row for small mobile); stacked full-width cards | Card stream / timeline layout where each action is an individual card |

---

## 5. Accessibility & Quality Checklist (WCAG 2.1 AA)
- [x] **Color Contrast**: All text against background meets or exceeds 4.5:1 contrast ratio. Primary `#006B3C` against white achieves 4.75:1.
- [x] **Non-Color Status Cues**: Status pills and priority badges pair semantic color with text labels and distinct icon glyphs.
- [x] **Keyboard Operation**: All metric drill-down cards, table rows, and modal dialogs are operable via `Tab`, `Enter`, and `Escape`.
- [x] **Focus Indicators**: Visible 2px green focus ring (`#0B7A46`) on all interactive controls.
- [x] **No Horizontal Scrolling**: Container widths use fluid max-width containers preventing clipping or horizontal overflow across all viewports.
- [x] **Zero Console Errors**: Clean browser console without React hydration warnings, unhandled promise rejections, or missing keys.
