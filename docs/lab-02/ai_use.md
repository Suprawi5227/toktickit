# Lab 2 — AI Use and Reflection

**LLM/agent used:** Antigravity IDE (Gemini / Claude / AI Coding Assistant)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | "สร้างเอกสาร Specification, API Spec, UI Spec และ Test Plan ทั้งหมดสำหรับ Issue 1" | ตรวจสอบเอกสารที่ AI ร่างให้ ปรับแก้รายละเอียดให้ตรงกับความต้องการของโปรเจกต์ แล้ว Commit ขึ้น GitHub |
| 2 | "ออกแบบ Database Schema (Prisma) ทำโค้ด Seed และ API ดึงรายชื่อ Requester สำหรับ Issue 2" | อนุมัติแผนการพัฒนา ตรวจสอบ Schema ที่ AI สร้างว่าตรงกับ Specification แล้วให้ดำเนินการ |
| 3 | "ทำหน้า UI Create Ticket Form พร้อม Validation ด้วย react-hook-form + Zod สำหรับ Issue 6" | ตรวจสอบโค้ดฟอร์มและ Validation Schema ที่ AI สร้าง แก้ไขค่า Priority Enum จาก CRITICAL เป็น URGENT ตามคำรีวิวจากเพื่อน |
| 4 | "ทำหน้า My Tickets พร้อม Pagination และ Search สำหรับ Issue 7" | นำโค้ดที่ AI สร้างมาใช้ แล้วปรับแก้ตามคำรีวิวเพื่อน เช่น เปลี่ยนจาก query param เป็น HTTP Header x-requester-id และปรับ Response Payload ให้ตรง API Spec |
| 5 | "ทำหน้า Ticket Detail พร้อม Ownership Check และ Delete Attachment สำหรับ Issue 8" | ตรวจสอบแล้วอนุมัติแผน แก้ไขเพิ่มเติมเรื่อง 403 Forbidden สำหรับ Ownership Isolation และเพิ่ม mandatory removal reason ตามคำรีวิว |
| 6 | "เขียน E2E Integration Tests ครอบคลุม flow ตั้งแต่ Login จนถึง Delete Attachment สำหรับ Issue 9" | ตรวจสอบ Test Cases ที่ AI เขียน แก้ไข selector ที่ซ้ำกัน (findByText → findByRole) แล้วรันเทสจนผ่านทั้ง 8/8 |
| 7 | "ช่วยรีวิว PR ของเพื่อนและสร้าง Constructive Feedback บน GitHub" | นำผลวิเคราะห์จาก AI มาเรียบเรียงเป็นคอมเมนต์รีวิวที่สร้างสรรค์ส่งให้เพื่อนบน GitHub PR |

## Reflection
ใน Lab 2 นี้ AI ช่วยเร่งความเร็วในการพัฒนาได้มาก โดยเฉพาะการสร้างโครงสร้างโค้ดเริ่มต้น (Boilerplate) และการเขียน Test Cases แต่สิ่งสำคัญคือต้องตรวจสอบโค้ดที่ AI สร้างอย่างละเอียดเสมอ เช่น กรณี Priority Enum ที่ AI ใช้ค่า CRITICAL แต่ Prisma Schema กำหนดเป็น URGENT ซึ่งเพื่อนช่วยจับได้ตอนรีวิว PR นอกจากนี้การให้ Context ที่ชัดเจน เช่น ก๊อปปี้คอมเมนต์รีวิวจากเพื่อนมาแปะให้ AI ช่วยให้ AI แก้โค้ดได้ตรงจุดมากขึ้น
