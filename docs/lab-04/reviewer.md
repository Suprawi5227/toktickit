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

## 3. Approval Sign-off
- [x] All Feedback items addressed with concrete document revisions.
- [x] Specifications conform to Lab 4 Handout Sections 1 to 9.
- [x] Traceable evidence recorded for Sprint 4 Final PDF Report.
- **Decision**: **APPROVED & SIGNED-OFF** for Sprint 4 Engineering Contract.
