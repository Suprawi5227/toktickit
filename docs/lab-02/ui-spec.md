# Lab 2 UI Specification: Zen Green Theme

## 1. Color Tokens
- **Primary Green**: `#006B3C` (Used for app header, primary actions, and strong emphasis)
- **Secondary Green**: `#0B7A46` (Used for active tabs, focus accents, links, and hover states)
- **Pale Green**: `#EAF6EF` (Used for selected items, success messages, and subtle section emphasis)
- **Page Background**: `#F5F7F6` (Quiet near-white for the main background)
- **Surface / Cards**: `White` (With subtle border and restrained shadow)
- **Text**: `Dark charcoal-green` (Not pure black, for comfortable reading)
- **Error**: `Dark red text and border` (Messages appear immediately below the field)
- **Warning**: `Amber` (For callouts or badges; not for ordinary decoration)
- **Success**: `Green` (For confirmations with readable text)

## 2. Typography and Spacing
- **Font**: Modern, clean sans-serif (e.g., Inter or Roboto).
- **Labels**: Appear above controls using consistent font weight and spacing.
- **Required Fields**: Marked with a red asterisk `*` (which does not replace the validation message).

## 3. Form Controls and States
- **Editable Field**: White background with clear neutral border.
- **Read-only Field**: Soft gray-green or warm ivory shading (distinct but readable).
- **Disabled Controls**: Visually distinct and cannot be activated.
- **Focus Indicators**: Must remain visible for keyboard users (using Secondary Green).
- **Inputs**: Consistent height. Multiline descriptions are taller and resizable (without breaking layout).

## 4. Buttons
- **Hierarchy**: Clear distinction between Primary (Solid Primary Green), Secondary (Outline), and Destructive (Red) buttons.
- **Busy State**: The Submit button shows a busy/loading state (e.g., spinner or "Submitting...") and is disabled while processing.
- **Icons**: Icons may support but must not replace unclear text. Icon-only controls require an accessible label/tooltip.

## 5. Screen Layouts & Responsive Rules
- **Desktop (≥ 992px)**: Multi-column layout where specified. Content centered with a sensible maximum width.
- **Tablet (768-991px)**: Two-column layout where practical.
- **Mobile (< 768px)**: Fields stack vertically. Buttons remain touch-friendly. No horizontal page scrolling.
- **All sizes**: No clipped labels, overlapping messages, hidden buttons, or unreadable attachment names.

## 6. Required Screens
### 6.1. Development Requester Selection
- Centered card on a clean background.
- Dropdown to select active requesters.
- "Continue" button.
- Handles empty state (no active requesters) and loading state.

### 6.2. Create Ticket
- System-generated fields (Ticket No., Date) near the top, styled as read-only.
- Classification fields (Category, Related System, Priority) grouped together.
- Summary (single line) and Description (multiline).
- Attachment section below main fields.
- Primary "Submit" action and secondary actions at the bottom.

### 6.3. My Tickets
- Search bar and filter/sort dropdowns at the top.
- Responsive table (desktop) or card list (mobile) showing Ticket Number, Summary, Category, Priority, Status, Last Updated.
- Pagination controls at the bottom.
- Empty state: Clear message and "Create Ticket" call to action when no tickets exist.

### 6.4. Requester Ticket Detail (View Mode)
- All ticket information presented as read-only fields.
- Clear separation between ticket details and attachment actions.
- Controls to add, download (active only), and soft-remove attachments (with reason).

## 7. Accessibility Checklist
- [x] All form inputs have associated labels.
- [x] High color contrast for text.
- [x] Keyboard navigation possible for all interactive elements.
- [x] Focus states are clearly visible.
