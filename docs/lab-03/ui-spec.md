# Lab 3 UI Specification: Zen Green Theme Extensions

## 1. Design System & Theme Continuity
Lab 3 reuses and extends the Zen Green design system established in Lab 2.
- **Primary Green**: `#006B3C` (Header, Primary buttons, Navigation active bar)
- **Secondary Green**: `#0B7A46` (Focus rings, Links, Secondary actions, Hover states)
- **Pale Green**: `#EAF6EF` (Active row selection, Status/Role badges, Success alerts)
- **Page Background**: `#F5F7F6` (Quiet near-white canvas)
- **Card Background**: `White` `#FFFFFF` (Card surfaces with `#E0E6E3` border and subtle shadow)
- **Internal Note Accent**: `#FFF8E7` surface with `#F5A623` amber border (Strictly separated from Public Comments)
- **Public Comment Accent**: `#FFFFFF` surface with `#006B3C` thin green left border

---

## 2. Application Shell & Role Navigation

### Header Bar
- **App Title**: `TokTickIT` with standard logo icon.
- **Role Navigation**:
  - **Requester**: "My Tickets" | "Create Ticket"
  - **IT Staff**: "My Queue" | "All Tickets"
  - **Administrator**: "User Management"
- **User Profile Menu (Top Right)**:
  - User Full Name + Role Badge (e.g. `[IT Staff]`, `[Admin]`, `[Requester]`)
  - Dropdown options: "Change Password" | "Logout"

---

## 3. Required User Interfaces & Screen Specifications

### 3.1. Login Screen & Mandatory Change Password

#### Login Screen
- Centered card layout on `#F5F7F6` canvas.
- **Fields**: Email Address (`type="email"`), Password (`type="password"` with show/hide toggle).
- **Actions**: "Sign In" primary button (shows spinner during submission).
- **Feedback**: Immediate inline validation errors for missing/invalid input; safe alert banner for invalid credentials or inactive accounts without revealing account existence specifics.

#### Mandatory Change Password Screen
- Displayed when authenticated user has `requiresPasswordChange = true`.
- **Fields**: Current Password, New Password, Confirm New Password.
- **Validation Indicators**: Password strength rules checklist (at least 8 characters, upper & lowercase, number/special char).
- **Actions**: "Update Password & Continue" button.

---

### 3.2. IT Staff Ticket Queue

- **Top Bar**: Search input (by ticket number or summary), Status Filter dropdown (`All`, `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`), Priority Filter dropdown, Sort selector (`Newest First`, `Priority High-to-Low`).
- **Desktop Grid (≥ 992px)**:
  - Columns: `Ticket No`, `Created Date`, `Summary`, `Category`, `Req. Priority`, `IT Priority`, `Status`, `Owner`, `Actions`.
  - Owner cell displays assignee name or `Unassigned` in muted italic text.
  - Priority & Status pills use standard color coding (e.g., Urgent: Red badge, High: Amber badge, Medium: Blue badge, Low: Gray badge).
- **Mobile List View (< 768px)**:
  - Compact cards displaying Ticket No, Summary, Status badge, Owner, and "View Ticket" button.
- **Pagination Footer**: `Showing X-Y of Z tickets`, `Previous` / `Next` buttons, page number buttons.
- **Empty State**: Clear icon and message when no tickets match current filters.

---

### 3.3. IT Staff Ticket Detail Screen

- **Header Section**: Ticket Number, Status pill, IT Priority pill, Created Date, Requester Name & Email.
- **Operational Controls (Editable for IT Staff)**:
  - **Owner Field**: Dropdown to select/reassign Ticket Owner (lists active IT Staff & Admin users) or "Claim Ticket" quick action button.
  - **IT Priority Field**: Dropdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - **Status Field**: Dropdown enforcing allowed workflow transitions based on current status.
- **Tabbed / Segmented Lower Panel**:
  - **Tab 1: Public Comments**: Shared communication log. Input text area with "Post Comment" button. Author name, role, timestamp displayed on each comment.
  - **Tab 2: Internal Notes**: Operational notes (visible only to IT Staff and Admin). Styled with distinct light amber card background (`#FFF8E7`) and amber left border. Includes notice: *"Internal Note - Not visible to Requester"*.
  - **Tab 3: Attachments**: View existing attachments uploaded by Requester.
- **Requester Resolution Indicator**: Banner shown if Requester indicated "Problem Appears Resolved".

---

### 3.4. Administrator User Management Screen

- **Top Toolbar**: "+ Create User" primary action button, Search input (by name or email), Role Filter (`All Roles`, `Requester`, `IT Staff`, `Administrator`).
- **User List Table**:
  - Columns: `Name`, `Email`, `Role Badge`, `Status (Active/Inactive)`, `Actions`.
  - Actions: "Edit" button, "Reset Password" button.
- **Create / Edit User Slide-over Panel or Modal**:
  - Fields: Full Name*, Email Address*, Role* (Dropdown: Requester, IT Staff, Administrator), Active Toggle (Yes/No Switch), Initial Password (on Create or Reset).
  - Validation: Real-time duplicate email error banner, self-deactivation warning if Admin attempts to deactivate own account.
  - Action Buttons: "Save User", "Cancel", and "Deactivate User" (destructive button, disabled for own account or last admin).

---

## 4. Responsive & Accessibility Rules
- **Desktop (≥ 992px)**: Full multi-column tables and split-pane views.
- **Tablet (768-991px)**: Adaptive tables with collapsible columns or 2-column stacked layout.
- **Mobile (< 768px)**: Stacked single-column layouts, touch-friendly tap targets (≥ 44px), sticky action bars where appropriate.
- **Accessibility**: ARIA labels on search inputs and filters, keyboard focus outlines (`#0B7A46`), screen reader announcements for error banners.
