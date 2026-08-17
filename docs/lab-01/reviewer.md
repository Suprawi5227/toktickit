# Lab 1 — Peer Review Record

**Author:** [ใส่ชื่อของคุณ] — [ใส่นักศึกษาของคุณ] — GitHub: @Suprawi5227
**Peer reviewer:** [ใส่ชื่อเพื่อน] — [ใส่นักศึกษาของเพื่อน] — GitHub: @[ใส่ชื่อ GitHub เพื่อน]

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| #8 | feature/1-project-foundation | Approved |
| #9 | feature/2-health-check | Approved (หลังจากแก้เรื่อง npm install / .env) |
| #10 | feature/3-category-seed | Approved (หลังจากยืนยันเรื่อง upsert และ uniqueness) |
| #12 | feature/4-category-list | Approved (หลังจากเคลียร์เรื่อง TODO ค้าง) |

Reviewer comment I received: เพื่อนคอมเมนต์ถามหาไฟล์ .env และเตือนเรื่องการรัน npm install ใน Issue 2 รวมถึงแนะนำเรื่องการรัน seed ซ้ำใน Issue 3 และ Issue 4 ก็มีการตรวจพวก TODO ที่ค้างอยู่
How I responded: ผมได้ตอบกลับอธิบายว่าไฟล์ .env ควรก๊อปจาก .env.example เอง และยืนยันผลการรัน seed ด้วย upsert รวมถึงเคลียร์โค้ด TODO ทั้งหมดให้คลีนก่อนนำไป Merge

## Pull Requests I reviewed for my partner
My comment: ผมได้เข้าไปช่วยรีวิว PR งาน Issue 3 ของเพื่อน (titayaaa) และแจ้งเตือนเรื่องการลืมสร้าง Category Model ใน schema.prisma และการเขียน Seed script ที่ไม่ครบถ้วน และเข้าไปรีวิว Issue 4 ของเพื่อน (Achikan) เพื่อแนะนำให้เปลี่ยนจากการใช้ vi.spyOn Mock DB มาเป็นการทำ Integration Test ของจริงแทน
Partner's response: [ใส่การตอบกลับของเพื่อน ถ้ายากให้ใส่ว่า: เพื่อนรับทราบและได้กลับไปแก้ไขโค้ดให้ถูกต้องตามคำแนะนำเรียบร้อยแล้ว]
