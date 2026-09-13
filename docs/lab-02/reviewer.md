# Lab 2 — Peer Review Record

**Author:** [ใส่ชื่อของคุณ] — [ใส่รหัสนักศึกษาของคุณ] — GitHub: @Suprawi5227
**Peer reviewer:** [ใส่ชื่อเพื่อน] — [ใส่รหัสนักศึกษาของเพื่อน] — GitHub: @[ใส่ชื่อ GitHub เพื่อน]

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Issue | Reviewer verdict |
|----|--------|-------|------------------|
| #18 | feat/lab2-db-seed | Issue 2: Database & Requester API | Approved |
| #20 | feat/lab2-frontend-context | Issue 3: Requester Selector UI | Approved |
| #22 | feat/lab2-backend-ticket | Issue 4: Ticket Creation API | Approved |
| #24 | feat/lab2-backend-attachment | Issue 5: Attachment API | Approved |
| #26 | feat/lab2-frontend-ticket-form | Issue 6: Create Ticket Form | Approved (หลังแก้ Priority Enum CRITICAL → URGENT) |
| #28 | feat/lab2-issue7-my-tickets | Issue 7: My Tickets Page | Approved (หลังแก้ x-requester-id header และ Response Payload) |
| #30 | feat/lab2-issue8-ticket-detail | Issue 8: Ticket Detail | Approved (หลังเพิ่ม Ownership Check และ Removal Reason) |
| #34 | feat/lab2-issue9-qa-polish | Issue 9: QA & E2E Tests | Approved |

### Reviewer comments I received:
- **PR #26:** เพื่อนแจ้งว่า Priority Enum ใช้ค่า "CRITICAL" แต่ Prisma Schema กำหนดเป็น "URGENT" และ property TicketNumber ไม่ตรงกับ API Contract
- **PR #28:** เพื่อนแนะนำให้เปลี่ยนจาก query param `requesterId` เป็น HTTP Header `x-requester-id` ตาม API Spec และให้เพิ่ม `success: true`, `limit`, `totalItems` ใน Response Payload
- **PR #30:** เพื่อนแนะนำให้เพิ่ม Ownership Isolation Check (403 Forbidden) และ mandatory removal reason สำหรับ DELETE attachment

### How I responded:
รับคำแนะนำทั้งหมดมาแก้ไขโค้ดให้ตรงตาม API Specification แล้ว push commit แก้ไขขึ้น PR เดิมทุกครั้ง

## Pull Requests I reviewed for my partner

### @natthakamol1130 (ณัฏฐกมล มอญปาน)
| PR | Title | My review |
|----|-------|-----------|
| #26 | [Frontend] Create Ticket Form UI & File Upload | รีวิวเรื่อง Priority Enum Mismatch (CRITICAL → URGENT), Ticket Number Property ไม่ตรง API Contract, และแนะนำให้ปรับ Response format |
| #28 | [Frontend & Backend] My Tickets Dashboard, Search & Pagination | แนะนำให้เปลี่ยนจาก query param `requesterId` เป็น HTTP Header `x-requester-id` ตาม API Spec, ปรับ Response Payload เพิ่ม `success`, `limit`, `totalItems` |
| #30 | [Backend & Frontend] Ticket Detail API, Ownership Check & Attachment | แนะนำให้เพิ่ม Ownership Isolation Check (403 Forbidden), เพิ่ม mandatory removal reason สำหรับ DELETE attachment, และปรับ Response format |

Partner's response: เพื่อนรับทราบและแก้ไขโค้ดตามคำแนะนำทั้งหมดเรียบร้อยแล้ว

### @jejaebubu (พัฒนาวดี แสงเงินยอด)
| PR | Title | My review |
|----|-------|-----------|
| #11 | [Docs] Lab 2 Engineering Contract, UI Spec, API Spec & Test Plan | รีวิวเอกสาร Specification ของเพื่อน ตรวจสอบความครบถ้วนของ FR, BR, AC และ API Contract |

Partner's response: เพื่อนรับทราบและปรับปรุงเอกสารตามคำแนะนำเรียบร้อยแล้ว
