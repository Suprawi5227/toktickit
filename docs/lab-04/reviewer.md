# Lab 4 Code Review & PR Approval Record

## Reviewer Information
- **Peer Reviewer**: `@natthakamol1130` (Jessica / natthakamol.morn@mail.kmutt.ac.th)
- **Author**: `@Suprawi5227` (Creamsu / sarapao281047@gmail.com)
- **Repository**: [Suprawi5227/toktickit](https://github.com/Suprawi5227/toktickit)
- **Target Branch**: `lab4-staging`
- **Active Pull Request**: [PR #66](https://github.com/Suprawi5227/toktickit/pull/66)
- **Review Date**: October 31, 2026

---

## 1. Specification & Architecture Conformance Audit
- `docs/lab-04/specification.md`, `ui-spec.md`, and `api-spec.md` establish comprehensive Spec-Driven Development (Spec DD) contracts prior to coding.
- Data models designed with clear separation of accountability (`performedById` decoupled from `Ticket.ownerId`).
- Resolution gate strictly limits formal `RESOLVED` and `CLOSED` transitions to IT Staff and Administrators.
- Concurrency handled gracefully via optimistic locking timestamp validation (HTTP 409 Conflict).
- Role-based dashboards defined with authoritative backend aggregations and strict Requester data isolation.

---

## 2. Peer Review Comments & Author Responses

### 🔍 Feedback 1: Action Taken Deletion & Immutable Audit Trail
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Action Taken Deletion / Audit Trail: แนะนำเสริมโน้ตสั้นๆ ใน specification.md และ api-spec.md ว่าระบบตั้งใจไม่มี DELETE endpoint เพื่อรักษาประวัติการปฏิบัติงานให้เป็น Audit Trail ที่แก้ไข/ลบไม่ได้ตามมาตรฐานค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เห็นด้วยอย่างยิ่งครับ! ได้เพิ่มกฎ Business Rule **BR-16 (Immutable Audit Trail & Omission of Deletion)** ใน `docs/lab-04/specification.md` และระบุ Section 1.5 ใน `docs/lab-04/api-spec.md` อย่างเป็นทางการว่าระบบตั้งใจละเว้น `DELETE` endpoint เพื่อให้บันทึกประวัติการทำงานของช่าง/เจ้าหน้าที่คงอยู่ถาวร เป็น Audit Trail ที่ตรวจสอบย้อนหลังได้ตามมาตรฐานระบบ Enterprise Service Desk ครับ"*

---

### 🔍 Feedback 2: Single Action Retrieval Endpoint
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Single Action Endpoint: ใน api-spec.md มี List All และ Update แนะนำเพิ่มรายละเอียด GET /tickets/:id/actions-taken/:actionId สำหรับการดึงเฉพาะ 1 รายการ ให้ครบตาม REST Contract ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ขอบคุณมากครับ! ได้เพิ่มข้อกำหนด REST Endpoint **Section 1.4: `GET /tickets/:id/actions-taken/:actionId`** ลงใน `docs/lab-04/api-spec.md` ครบถ้วนทั้ง Request Parameters, JSON Response Shape (รวมถึงข้อมูล performer และ follow-up notes), และ HTTP Status Codes (200, 401, 403, 404) ตามมาตรฐาน RESTful ครบ 100% เรียบร้อยแล้วครับ"*

---

### 🔍 Feedback 3: Administrator Dashboard Metrics (`userSummary`)
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Admin Dashboard Metrics: ตาม Handout ข้อ 4.6 ในส่วน IT Staff / Admin Dashboard อาจเสริม userSummary (เช่น จำนวนผู้ใช้ทั้งหมด) เพื่อรองรับมุมมองของผู้ดูแลระบบให้ครบถ้วนค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ข้อสังเกตตรงจุดตาม Handout เป๊ะเลยครับ! ได้อัปเดต Endpoint **`GET /dashboards/staff` (Section 2.1)** ใน `docs/lab-04/api-spec.md` และ Section 4.6 ใน `specification.md` โดยกำหนดว่าเมื่อผู้เรียกใช้งานมี Role เป็น `ADMIN` ระบบจะแนบ `userSummary` (ประกอบด้วย `totalUsers`, `activeUsers`, `requesters`, `staff`, `admins`) เพิ่มเติมเข้าไป เพื่อให้ครอบคลุมมุมมองการบริหารจัดการระบบของ Administrator โดยไม่ต้องเปลี่ยน endpoint ครับ"*

---

### 🔍 Feedback 4: Status Transition from `REOPENED` to `WAITING_FOR_REQUESTER`
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Status Transitions: ในตาราง transition ของ REOPENED อาจพิจารณาอนุญาตให้ไปที่ WAITING_FOR_REQUESTER ได้ด้วย เผื่อกรณีที่เปิดตั๋วใหม่แล้วต้องการสอบถามรายละเอียดเพิ่มเติมจากผู้แจ้งค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เป็น Use Case ในการทำงานจริงที่ดีมากครับ! ได้ทำการอัปเดตตาราง State Machine ใน **BR-07** ของ `docs/lab-04/specification.md` และ Section 3.1 ของ `docs/lab-04/api-spec.md` ให้สถานะ `REOPENED` สามารถเปลี่ยนไปเป็น `WAITING_FOR_REQUESTER` ได้อย่างถูกต้อง ในกรณีที่ตั๋วถูกเปิดซ้ำแล้วเจ้าหน้าที่ต้องการสอบถามข้อมูลเพิ่มเติมจากผู้แจ้งครับ"*

---

### 🔍 Feedback 5: Authorization Header Alignment with Codebase
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Authentication Header ใน api-spec.md: ในส่วนหัวระบุเป็น Session-based (HTTP-Only signed JWT cookie) แต่ในระบบจริงของ TokTickIT ตั้งแต่ Lab 3 (authMiddleware.ts และ Supertest) ใช้ Authorization: Bearer <token> เป็นหลักค่ะ แนะนำปรับข้อความให้ตรงกับ Bearer token header เพื่อไม่ให้สับสนตอนเชื่อมต่อ API นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ขอบคุณมากครับที่ทักจุดนี้! ได้ปรับปรุงส่วนหัวของ `docs/lab-04/api-spec.md` ให้ระบุชัดเจนว่าใช้งาน `Authorization: Bearer <token>` เป็นหลักตามการทำงานจริงของ `authMiddleware.ts` และการทดสอบ Supertest พร้อมระบุการรองรับ fallback ผ่าน cookie session สำหรับ browser clients ครับ"*

---

### 🔍 Feedback 6: Compound Index in Prisma Schema
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Compound Index ใน Prisma Schema (specification.md Section 7.1): ใน Justification ข้อ 2 มีการอ้างอิงถึง Compound Index บน [ticketId, actionDateTime] เพื่อ optimize การ query ประวัติงานเรียงตามเวลา แต่ในบล็อกโค้ด Schema ยังแยกเป็น @@index([ticketId]) และ @@index([actionDateTime]) อยู่ค่ะ แนะนำปรับให้เป็น @@index([ticketId, actionDateTime(sort: Desc)]) เพื่อให้ตรงกับคำอธิบายสถาปัตยกรรมนะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"แก้ไขให้ตรงกับ Justification เรียบร้อยแล้วครับ! ใน `docs/lab-04/specification.md` Section 7.1 ได้เปลี่ยนเป็น `@@index([ticketId, actionDateTime(sort: Desc)])` เพื่อรองรับ Query ประวัติการทำงานย้อนหลังแบบเรียงเวลาได้อย่างมีประสิทธิภาพสูงสุดครับ"*

---

### 🔍 Feedback 7: Concurrency Control in Action Taken Update
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Concurrency Control ใน Action Taken Update (api-spec.md Section 1.3): ใน Endpoint PATCH /tickets/:id/actions-taken/:actionId มีระบุเคส 409 Conflict แต่ใน Request Body ยังไม่มีฟิลด์ timestamp สำหรับตรวจสอบ แนะนำเพิ่ม lastUpdatedAt?: string (หรือ expectedUpdatedAt) ใน Body เหมือนกับ Ticket Status Update ใน Section 3.1 เพื่อให้รองรับ Optimistic Concurrency Check ตาม BR-10 ได้สมบูรณ์ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เห็นด้วยอย่างยิ่งครับ! ได้เพิ่มฟิลด์ `lastUpdatedAt?: string` ใน Request Body ของ `PATCH /tickets/:id/actions-taken/:actionId` ใน `docs/lab-04/api-spec.md` Section 1.3 เพื่อให้ระบบตรวจสอบ timestamp ก่อนบันทึก และส่ง 409 Conflict หากข้อมูลถูกแก้ไขโดยผู้อื่นไปก่อนหน้า ตามกฎ BR-10 ครับ"*

---

### 🔍 Feedback 8: Dashboard Trend / Change Indicators Note
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Trend / Change Indicator บน Dashboard (api-spec.md Section 2.1): ใน Mockup หน้าจอมีตัวเลขแนวโน้ม (เช่น +2 today, -1 yesterday) แต่ใน Response JSON มีเฉพาะตัวเลข count แนะนำโน้ตเพิ่มเติมสั้นๆ ว่าฟิลด์ trend นี้คำนวณจาก Backend หรือเป็น optional display เพื่อให้สอดคล้องกันระหว่าง UI และ API นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ได้เพิ่มคำอธิบาย Note on Trend Indicators ใน Section 2.1 ของ `docs/lab-04/api-spec.md` เรียบร้อยแล้วครับ โดยระบุว่าตัวเลขแนวโน้ม (+2 today, -1 yesterday) เป็นการคำนวณของฝั่ง UI Client หรือคำนวณเสริมจากเวลาสร้าง เพื่อรักษาขนาด Response JSON จาก Server ให้กะทัดรัดตาม Handout Section 6.2 ครับ"*

---

### 🔍 Feedback 9: Optional Resolution Note for Requester
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Optional Note สำหรับ Requester Resolution (api-spec.md Section 3.2): ใน PATCH /tickets/:id/indicate-resolved อาจเปิดรับ Request Body { note?: string } เพิ่มเติม เพื่อให้ผู้แจ้งสามารถแนบข้อความสั้นๆ ตอนกดแจ้งแก้ปัญหาเสร็จแล้ว ไปต่อท้าย Auto Public Comment ได้ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ยอดเยี่ยมมากครับ! ได้เพิ่ม Request Body `{ note?: string }` ใน Section 3.2 ของ `docs/lab-04/api-spec.md` และปรับ BR-09 ใน `docs/lab-04/specification.md` ให้ผู้แจ้งสามารถแนบข้อความเพิ่มเติมได้ โดยข้อความนี้จะถูกนำไปต่อท้าย Public Comment ให้อัตโนมัติครับ"*

---

### 🔍 Feedback 10: `updatedAt` in `GET /tickets/:id/actions-taken`
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"updatedAt ใน GET /tickets/:id/actions-taken (api-spec.md Section 1.2): ในตัวอย่าง JSON Response ของ List Actions Taken ตอนนี้มีแค่ createdAt แนะนำให้เพิ่ม "updatedAt": "2026-10-31T14:32:10.000Z" เข้าไปด้วยนะคะ เพื่อให้ฝั่ง Frontend มีค่า timestamp นำไปส่งเป็น lastUpdatedAt ตอนกด Edit (PATCH ใน Section 1.3) ได้เลยค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"จุดนี้สำคัญต่อ Frontend จริงๆ ครับ! ได้เพิ่ม `"updatedAt": "2026-10-31T14:32:10.000Z"` ในตัวอย่าง JSON Response ของ `GET /tickets/:id/actions-taken` (Section 1.2 ใน `docs/lab-04/api-spec.md`) เรียบร้อยแล้ว เพื่อให้ Frontend นำค่าไปใช้เป็น optimistic lock timestamp ในการ PATCH ได้ทันทีครับ"*

---

### 🔍 Feedback 11: Definition of Done Numbering Synchronization
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"อัปเดตเลขข้อ BR ใน Definition of Done (specification.md Section 10): ใน Section 5 มีการเพิ่ม BR-16 เข้ามาแล้ว แนะนำปรับข้อความใน Section 10 บรรทัดแรกจาก (BR-01 to BR-15) เป็น (BR-01 to BR-16) ให้ตรงกันนะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ตรวจทานได้ละเอียดรอบคอบมากครับ! ได้ปรับปรุงบรรทัดแรกของ Definition of Done ใน `docs/lab-04/specification.md` Section 10 ให้ระบุเป็น `(BR-01 to BR-16)` ให้สอดคล้องตรงกันสมบูรณ์แล้วครับ"*

---

### 🔍 Feedback 12: Reopened Badge & Advisory Workflow UI
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"เพิ่มเติมรายละเอียดสถานะ Reopened และ Advisory UI ใน ui-spec.md: ใน Section 1 (Status Semantics) แนะนำเพิ่มสี Badge ของสถานะ Reopened ให้ครบตาม State Machine ค่ะ ใน Section 3.4 อาจโน้ตเพิ่มสั้นๆ เกี่ยวกับปุ่ม "Problem Appears Resolved" สำหรับ Requester และแถบ Advisory Banner ที่แสดงให้ IT Staff เห็นเมื่อ requesterResolvedInd = true เพื่อให้สอดคล้องกับ BR-09 ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เพิ่มเติมครบถ้วนทั้ง 2 ส่วนใน `docs/lab-04/ui-spec.md` แล้วครับ: (1) เพิ่มสี Badge สำหรับสถานะ `Reopened` (Teal `#20C997`, bg `#E6FAF4`) ใน Section 1 และ (2) เพิ่มรายละเอียดปุ่มกดแจ้งแก้ปัญหาเสร็จสิ้นสำหรับ Requester พร้อมการแสดง Advisory Banner สีเขียวอ่อนสำหรับ IT Staff เมื่อ `requesterResolvedInd = true` พร้อมปุ่มกด Formally Resolve ใน Section 3.4 ครับ"*

---

### 🔍 Feedback 13: Standard Status Codes for Indicate-Resolved
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Status Codes ใน PATCH /tickets/:id/indicate-resolved (api-spec.md Section 3.2): แนะนำเพิ่ม 401 Unauthorized และ 404 Not Found ในส่วน Responses ให้ครบเหมือน Endpoint อื่นๆ นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เสริม `401 Unauthorized` และ `404 Not Found` ใน Responses ของ Section 3.2 ใน `docs/lab-04/api-spec.md` เรียบร้อยแล้ว เพื่อให้ครอบคลุมตามมาตรฐาน RESTful Error Handling อย่างสมบูรณ์ครับ"*

---

## 3. Approval Sign-off (PR #66)
- [x] All Feedback items from Rounds 1, 2, and 3 fully addressed with concrete document revisions.
- [x] Specifications conform to Lab 4 Handout Sections 1 to 9.
- [x] Traceable evidence recorded for Sprint 4 Final PDF Report.
- **Decision**: **APPROVED & SIGNED-OFF** for Sprint 4 Engineering Contract.

---

## 4. Peer Review Round 4 (PR #67: Sprint 4 Test Plan & Scaffolding)

### 🔍 Feedback 14: BR-14 (Inactive User Safety) and FR-12 (Sprint Regression)
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ใน specification.md มีระบุกฎ BR-14 (การปฏิเสธ 400 Bad Request เมื่อมอบหมายงานหรือบันทึก Action Taken โดยบัญชีที่ถูกระงับ isActive = false) และ FR-12 (Full Sprint Regression สำหรับฟีเจอร์ Lab 1–3) แนะนำให้เพิ่มเคสทดสอบสำหรับ BR-14 ลงในตาราง docs/lab-04/tests.md (และในไฟล์ actions-taken.api.test.ts / ticket-workflow.api.test.ts) รวมถึงเพิ่มแถวสรุป Regression Test (REG-01..REG-03) ในตารางด้วยนะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ขอบคุณมากครับที่ช่วยตรวจทานความสอดคล้องกับ BR-14 และ FR-12! ได้ดำเนินการเพิ่มเคส `API-10` ใน `actions-taken.api.test.ts`, `API-16` ใน `ticket-workflow.api.test.ts` เพื่อดักจับ Inactive User Safety (HTTP 400) และเพิ่มแถว `REG-01`, `REG-02`, `REG-03` สรุปชุด Full Sprint Regression ของ Lab 1-3 ลงในตาราง `docs/lab-04/tests.md` เรียบร้อยแล้วครับ"*

---

### 🔍 Feedback 15: Unit Layer Harmonization
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ใน Section 1 และ Checklist ระบุว่าแผนการทดสอบครอบคลุมทั้ง 4 เลเยอร์ (Unit, API, UI, E2E) แต่ในตาราง Section 2 คอลัมน์ Type ตอนนี้มีเฉพาะ API, UI และ E2E ค่ะ แนะนำให้เพิ่มเคส Unit (เช่น ทดสอบ validation logic ของ followUpRequired -> followUpNote และฟังก์ชันตรวจสอบ State Machine transition) หรือปรับคอลัมน์ Type ในตารางให้ระบุ Unit / API เพื่อให้สอดคล้องกันค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ตรงจุดนี้เห็นด้วยเป็นอย่างยิ่งครับ! ได้สร้างไฟล์ Unit Test ใหม่ `server/tests/lab-04/unit-validators.test.ts` พร้อมกำหนดเคส `UNIT-01` (ทดสอบ validation logic ของ conditional followUpNote ตาม AC-02, BR-04) และ `UNIT-02` (ทดสอบ state transition helper ตาม BR-07) พร้อมเพิ่มประเภท 'Unit' ในตารางแผนการทดสอบเรียบร้อยแล้วครับ"*

---

### 🔍 Feedback 16: Test ID Linkage across Scaffolding Files
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ในไฟล์ staff-dashboard.api.test.ts มีเคส it.todo สำหรับ Admin (userSummary ตาม FR-11) และเคส 403 Forbidden รวมถึงใน requester-dashboard.api.test.ts มีเคส 401 Unauthorized และใน ActionsTaken.test.tsx / StaffDashboard.test.tsx / RequesterDashboard.test.tsx มี it.todo ที่ยังไม่มีรหัส UI-xx หรือ API-xx กำกับ แนะนำให้ใส่รหัส Test ID หรืออัปเดตคำอธิบายในตาราง docs/lab-04/tests.md ให้ครอบคลุมทุก it.todo นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ได้ดำเนินการกำหนดรหัส Test ID ให้กับทุก `it.todo` ในทุกไฟล์อย่างเป็นระบบแบบ 1:1 เรียบร้อยแล้วครับ (API-01 ถึง API-22, UI-01 ถึง UI-14, E2E-01 ถึง E2E-06) ทำให้สามารถ Trace รหัสทุกตัวจากเอกสาร `tests.md` สู่โค้ดทดสอบจริงได้อย่างแม่นยำ 100% ครับ"*

---

### 🔍 Feedback 17: Dashboard Metric Cards Alignment
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ใน api-spec.md (Section 2.1 & 2.2) และ specification.md (AC-11, FR-10) มีฟิลด์ unassignedCount ของฝั่ง Staff และ waitingOnMeCount (Tickets waiting on the requester) ของฝั่ง Requester แนะนำให้ปรับข้อความใน StaffDashboard.test.tsx (UI-06) และ RequesterDashboard.test.tsx (UI-07) ให้ครอบคลุม metric ดังกล่าวให้ตรงกับ API response ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ปรับแก้เรียบร้อยแล้วครับ! ใน `UI-09` (`StaffDashboard.test.tsx`) ได้ระบุการตรวจวัดการ์ด Unassigned (`unassignedCount`) ร่วมกับสถานะ Open, In Progress, Waiting, Assigned to Me และใน `UI-12` (`RequesterDashboard.test.tsx`) ได้ระบุการตรวจวัดการ์ด Waiting on Me (`waitingOnMeCount`) ควบคู่กับ Open, Resolved, Closed ให้ตรงกับ API Response Schema ตาม `api-spec.md` ครบถ้วนครับ"*

---

### 🔍 Feedback 18: Total Test Cases Count Correction in PR Overview
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ในคำอธิบาย PR เขียนว่า 24 planned test cases (API-01 to API-17, UI-01 to UI-07, E2E-01 to E2E-03) ซึ่งถ้าบวกกัน (17 + 7 + 3) จะได้ 27 เคส ค่ะ ฝากแก้ตัวเลขในคำอธิบาย PR หรืออัปเดตตามจำนวนเคสล่าสุดด้วยนะคะ ขอบคุณมากค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ขอบคุณที่ทักท้วงเรื่องตัวเลขครับ! ได้อัปเดตตัวเลขรวมใน PR Overview และเอกสารให้ตรงกับตารางใหม่ทั้งหมดอย่างถูกต้อง: รวมทั้งสิ้น 47 Planned Test Cases ประกอบด้วย Unit (2), API (22), UI (14), E2E (6) และ Sprint Regression (3) ครับ"*

---

## 5. Peer Review Round 5 (PR #68: Database Schema, Migration & Seed for Actions Taken)

### 🔍 Feedback 19: Advisory Resolution Seed Data on Unresolved Ticket
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"เพิ่มตัวอย่างตั๋วสถานะ Advisory Resolution (requesterResolvedInd: true บนตั๋วที่ยังไม่ RESOLVED): ตอนนี้ตั๋วที่ตั้งค่า requesterResolvedInd: true ใน seed.ts มีเฉพาะใบที่เป็นสถานะ RESOLVED (TXT-2025-001230) และ CLOSED (TXT-2025-001229) ค่ะ แนะนำให้ปรับตั๋วที่ยังเปิดอยู่สัก 1 ใบ (เช่น TXT-2025-001232 ที่เป็นสถานะ WAITING_FOR_REQUESTER หรือเพิ่มตั๋ว IN_PROGRESS) ให้มี requesterResolvedInd: true เพื่อใช้ทดสอบและแสดงผล IT Staff Advisory Resolution Banner ตาม BR-09 และ ui-spec.md Section 3.4 ได้ทันทีหลังรัน seed นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ข้อเสนอแนะนี้ช่วยให้การทดสอบ Advisory Resolution Banner บน UI ทำได้ง่ายขึ้นมากเลยครับ! ได้ปรับให้ตั๋ว `TXT-2025-001232` (สถานะ `WAITING_FOR_REQUESTER`) มีค่า `requesterResolvedInd: true` ใน `server/prisma/seed.ts` เรียบร้อยแล้ว ทำให้สามารถทดสอบการแสดงผลแบนเนอร์แจ้งเตือน IT Staff และปุ่มชอร์ตคัต 'Formally Resolve Ticket' ได้ทันทีหลังรัน seed ตาม BR-09 ครับ"*

---

### 🔍 Feedback 20: Comprehensive `ITPriority.URGENT` Representation
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"เพิ่มความครอบคลุมของ ITPriority.URGENT ในข้อมูลตั๋ว (ticketsData): ตอนนี้ตั๋วทั้ง 7 ใบใน seed.ts มีระดับความสำคัญเป็น HIGH, MEDIUM, และ LOW แต่ยังไม่มีใบที่เป็น URGENT ค่ะ แนะนำให้ปรับตั๋วสัก 1 ใบ (เช่น TXT-2025-001233 หรือ TXT-2025-001228) ให้ใช้ itPriority: ITPriority.URGENT เพื่อให้ข้อมูลบน Staff Dashboard (priorityBreakdown.urgent ตาม api-spec.md Section 2.1 และ FR-09) มีครบทั้ง 4 ระดับความสำคัญค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ปรับเปลี่ยนเรียบร้อยแล้วครับ! ได้ปรับตั๋ว `TXT-2025-001228` (Printer Jam) ให้มีระดับความสำคัญเป็น `ITPriority.URGENT` ทำให้ข้อมูลในระบบมีครบทั้ง 4 ระดับความสำคัญ (LOW, MEDIUM, HIGH, URGENT) สำหรับรองรับการทดสอบ Metric Breakdown บน Staff Dashboard ตาม FR-09 ครับ"*

---

### 🔍 Feedback 21: Idempotent Password Reset in `seedUsers()`
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"เพิ่ม passwordHash: defaultPasswordHash ในบล็อก update ของ seedUsers() (seed.ts บรรทัดที่ 48–53): เพื่อให้การรัน npm run prisma:seed เป็น Idempotent 100% แม้หลังจากรันชุดทดสอบเปลี่ยนรหัสผ่าน (Lab 3 Regression) แนะนำให้ใส่ passwordHash: defaultPasswordHash ลงในบล็อก update ของ prisma.user.upsert ด้วยนะคะ รหัสผ่านของ user ทดสอบจะได้ถูกรีเซ็ตกลับเป็น Password123! เสมอค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"จุดนี้สำคัญต่อการรันเทสต์ซ้ำๆ มากครับ! ได้เพิ่ม `passwordHash: defaultPasswordHash` ลงในบล็อก `update` ของ `prisma.user.upsert` ใน `server/prisma/seed.ts` เรียบร้อยแล้ว ทำให้ทุกครั้งที่รัน Seed รหัสผ่านของ User ทดสอบจะถูกรีเซ็ตกลับเป็น `Password123!` อย่างสมบูรณ์และเป็น Idempotent 100% ครับ"*

---

## 6. Peer Review Round 6 (PR #69: Actions Taken Backend API & Authorization)

### 🔍 Feedback 22: Router Mounting Order in `server/src/app.ts` (Lab 3 Regression)
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"ลำดับการ Mount Router ใน server/src/app.ts (กระทบ Regression Test ของ Lab 3): ตอนนี้ app.use("/api/tickets", staffRouter) ถูกวางไว้ท้ายไฟล์ (บรรทัดที่ 441) ซึ่งอยู่ หลัง app.get("/api/tickets/:id", ...) (บรรทัดที่ 356) ทำให้เมื่อเรียก GET /api/tickets/queue (ในเทสต์ staff-queue.api.test.ts และ staff-ticket-detail.api.test.ts ของ Lab 3) Express จะจับคู่เข้า /api/tickets/:id (โดยมองว่า :id = "queue") แล้วคืนค่า 400 Bad Request แทนที่จะเข้า staffRouter ค่ะ วิธีแก้: รบกวนย้ายบล็อก app.use("/api/auth", ...), app.use("/api/tickets/:id/actions-taken", ...), app.use("/api/tickets", staffRouter) และ app.use("/api/admin", ...) ขึ้นไปวาง ก่อนหน้า app.get("/api/tickets/:id", ...) นะคะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"เป็นจุดสังเกตที่เฉียบขาดมากครับ! ได้ย้ายบล็อกการ Mount Routers ทั้งหมด (`/api/auth`, `/api/tickets/:id/actions-taken`, `/api/tickets`, `/api/admin`) ขึ้นมาอยู่ก่อนหน้า `app.get("/api/tickets/:id")` เรียบร้อยแล้ว และเพิ่มการดึง identity จาก Session/Token ใน `app.get("/api/tickets/:id")` ส่งผลให้เทสต์ของ Lab 3 (`staff-queue`, `staff-ticket-detail`, `authorization`, `comments-notes`) ผ่านฉลุย 100% ไม่มีปัญหา Route Shadowing อีกต่อไปครับ"*

---

### 🔍 Feedback 23: Direct API Verification of BR-14 (Inactive IT Staff Safety)
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"การตรวจสอบ API-10 (BR-14: Inactive IT Staff Safety) ใน actions-taken.routes.ts และ actions-taken.api.test.ts: ใน server/tests/lab-04/actions-taken.api.test.ts ข้อ API-10 ตอนนี้ทดสอบแค่ POST /api/auth/login แล้วเช็ค 401 แต่ยังไม่ได้ยิงทดสอบที่ POST /api/tickets/:id/actions-taken เลยค่ะ (และมีตัวแปร inactiveStaffToken, otherTicketId, inactiveUser ที่ประกาศไว้แต่ยังไม่ได้ใช้งาน) ตาม docs/lab-04/tests.md (API-10) และ BR-14 กำหนดว่าหากพยายามผูก Action Taken กับบัญชี IT Staff ที่ถูกระงับ (isActive = false) ต้องคืนค่า 400 Bad Request วิธีแก้: ใน server/src/routes/actions-taken.routes.ts (POST /): ให้เช็ค const targetPerformerId = req.body.performedById ? Number(req.body.performedById) : req.user!.id; หากไม่พบผู้ใช้หรือ !performer.isActive ให้คืนค่า 400 Bad Request ("Cannot record action: Performer account is deactivated") (ส่วนตอนบันทึกลง DB ให้ยังคงใช้ performedById: req.user!.id เพื่อป้องกันการปลอมแปลงผู้กระทำตามเดิมค่ะ) ใน server/tests/lab-04/actions-taken.api.test.ts (API-10): ให้ทดสอบยิง POST /api/tickets/${testTicketId}/actions-taken พร้อมส่ง performedById: inactiveUser!.id แล้วเช็คว่าได้ expect(res.status).toBe(400) ค่ะ"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ปรับปรุงตามคำแนะนำครบถ้วนสมบูรณ์ทั้ง 2 จุดครับ: (1) ใน `server/src/routes/actions-taken.routes.ts` เพิ่มการตรวจจับ `targetPerformerId` จาก Body หากบัญชีผู้ปฏิบัติงานถูกระงับ (`isActive = false`) จะส่ง HTTP 400 Bad Request พร้อมข้อความชัดเจนทันที และ (2) ใน `actions-taken.api.test.ts` ได้ปรับปรุงเคส `API-10` ให้ยิงคำขอจริงไปยัง `POST /api/tickets/:id/actions-taken` พร้อมแนบ ID ของช่างที่ถูก Deactivated และตรวจสอบการคืนค่า 400 Bad Request พร้อมเคลียร์ Unused Variables ออกหมดจดครับ"*

---

### 🔍 Feedback 24: PR #69 Checklist Sign-off
- **Peer Reviewer Comment (`@natthakamol1130`)**:
  > *"Peer Review Checklist ในคำอธิบาย PR #69: รบกวนติ๊กเครื่องหมายถูก - [x] ในหัวข้อ ## 🔍 Peer Review Checklist ของ PR Description ให้ครบทั้ง 5 ข้อด้วยนะคะ เมื่อแก้ไขและรัน npm test ใน server ผ่านครบทุกไฟล์แล้ว แจ้งได้เลยนะคะ เดี๋ยวกด Approve และ Merge ให้ทันทีค่ะ 🌷"*
- **Author Response & Action Taken (`@Suprawi5227`)**:
  > *"ได้ติ๊กถูก `- [x]` ครบถ้วนทั้ง 5 ข้อใน PR Description ของ PR #69 และตรวจสอบความถูกต้องของ Test Suites ทั้งหมดเรียบร้อยแล้วครับ"*



