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
- **PR #16 (Issue 1: Docs):** เพื่อนสอบถามเรื่อง Data Retained after errors (BR-10) และการจำกัดขนาด/ประเภทไฟล์แนบ → ตอบกลับยืนยันแล้ว Approved
- **PR #18 (Issue 2: DB & API):** เพื่อนสอบถามเรื่อง Zod Validation สำหรับฟอร์ม และ Auto-sequence Ticket Number → ตอบกลับยืนยันแล้ว Approved
- **PR #20 (Issue 3: Requester UI):** เพื่อนสอบถามเรื่อง Zod Validation และ Ticket Number format → ตอบอธิบายแผนงานแบ่ง Issue แล้ว Approved
- **PR #22 (Issue 4: Ticket API):** เพื่อน @jejaebubu ตรวจสอบ POST /api/tickets, Zod validation และ Auto-Sequence Ticket Number → Approved
- **PR #24 (Issue 5: Attachment API):** เพื่อนแนะนำให้เพิ่ม image/webp ใน allowedTypes, เพิ่มการจำกัดจำนวนไฟล์ไม่เกิน 5, และลบไฟล์ทดสอบออกจาก Git → แก้ไขแล้ว Approved
- **PR #26 (Issue 6: Create Form):** เพื่อนแจ้งว่า Priority Enum ใช้ค่า "CRITICAL" แต่ Prisma Schema กำหนดเป็น "URGENT" และ property TicketNumber ไม่ตรงกับ API Contract → แก้ไขแล้ว Approved
- **PR #28 (Issue 7: My Tickets):** เพื่อนแนะนำให้เปลี่ยนจาก query param `requesterId` เป็น HTTP Header `x-requester-id` ตาม API Spec และให้เพิ่ม `success: true`, `limit`, `totalItems` ใน Response Payload → แก้ไขแล้ว Approved
- **PR #30 (Issue 8: Ticket Detail):** เพื่อนแนะนำให้เพิ่ม Ownership Isolation Check (403 Forbidden) และ mandatory removal reason สำหรับ DELETE attachment → แก้ไขแล้ว Approved
- **PR #34 (Issue 9: QA & E2E):** เพื่อนชมว่า UI Polish และ E2E Test Suite ครอบคลุมครบ 5 เคส → Approved โดยไม่มีแก้ไขเพิ่มเติม

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
