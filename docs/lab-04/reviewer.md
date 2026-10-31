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

## 3. Approval Sign-off
- [x] All Feedback items from Rounds 1, 2, and 3 fully addressed with concrete document revisions.
- [x] Specifications conform to Lab 4 Handout Sections 1 to 9.
- [x] Traceable evidence recorded for Sprint 4 Final PDF Report.
- **Decision**: **APPROVED & SIGNED-OFF** for Sprint 4 Engineering Contract.
