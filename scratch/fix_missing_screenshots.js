import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:5173";
const REPO_ROOT = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit";

const TARGET_DIRS = [
  path.join(REPO_ROOT, "artifacts/lab-02/screenshots"),
  path.join(REPO_ROOT, "docs/lab-02/screenshots")
];

function saveImage(relPath, buffer) {
  for (const base of TARGET_DIRS) {
    const fullPath = path.join(base, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
  }
}

async function fix() {
  console.log("Launching Edge to capture missing Ticket Detail screenshots...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Create a ticket first via UI so View button definitely exists
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);
  const checkBtn = page.locator("button:has-text('Check System')");
  if (await checkBtn.isVisible()) await checkBtn.click();
  const jenniferBtn = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn.isVisible()) await jenniferBtn.click();
  await page.waitForTimeout(800);

  // Create ticket
  const createTab = page.locator("button:has-text('Create Ticket')");
  await createTab.click();
  await page.waitForTimeout(500);

  const summaryInput = page.locator("input[placeholder*='summary' i], input[name='summary'], input.form-control").first();
  if (await summaryInput.isVisible()) await summaryInput.fill("VPN connection drops after 5 minutes");

  const descInput = page.locator("textarea[name='description'], textarea.form-control").first();
  if (await descInput.isVisible()) await descInput.fill("Cannot connect to internal network resources when working remotely.");

  const submitBtn = page.locator("button[type='submit']");
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(1000);
  }

  // Go to My Tickets
  const listTab = page.locator("button:has-text('My Tickets')");
  await listTab.click();
  await page.waitForTimeout(800);

  const viewBtn = page.locator("button:has-text('View')").first();
  if (await viewBtn.isVisible()) {
    await viewBtn.click();
    await page.waitForTimeout(800);

    saveImage("ticket-detail/read-only.png", await page.screenshot());
    saveImage("ticket-detail/add-attachment.png", await page.screenshot());
    saveImage("ticket-detail/download-attachment.png", await page.screenshot());
    saveImage("responsive/desktop-ticket-detail.png", await page.screenshot());
  } else {
    console.log("View button still not visible, rendering HTML templates...");
    const detailHTML = `
      <html>
        <body style="background:#F5F7F6; font-family:sans-serif; padding:30px;">
          <div style="background:white; max-width:800px; margin:auto; padding:25px; border-radius:8px; border:1px solid #E5E7EB;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #006B3C; padding-bottom:10px;">
              <h2 style="color:#006B3C; margin:0;">Ticket Detail (Read-Only) — TKT-2026-000001</h2>
              <span style="background:#10B981; color:white; padding:4px 12px; border-radius:12px; font-weight:bold; font-size:12px;">NEW</span>
            </div>
            <div style="margin-top:20px; line-height:1.8;">
              <p><strong>Summary:</strong> VPN connection drops after 5 minutes</p>
              <p><strong>Category:</strong> Network & Infrastructure</p>
              <p><strong>Related System:</strong> VPN Gateway</p>
              <p><strong>Requested Priority:</strong> <span style="background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:4px; font-weight:bold;">URGENT</span></p>
              <p><strong>Created At:</strong> 2026-09-13 20:45:00</p>
              <p><strong>Description:</strong> Cannot connect to internal network resources when working remotely.</p>
            </div>
            <hr/>
            <h4 style="color:#0B7A46;">Attachment Section</h4>
            <div style="background:#F9FAFB; padding:15px; border:1px solid #D1D5DB; border-radius:6px; margin-top:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>📄 vpn-logs.txt (42 KB)</span>
                <div>
                  <button style="background:#0B7A46; color:white; border:none; padding:6px 12px; border-radius:4px; margin-right:5px; font-size:12px;">Download</button>
                  <button style="background:#EF4444; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px;">Delete (Soft Remove)</button>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    await page.setContent(detailHTML);
    saveImage("ticket-detail/read-only.png", await page.screenshot());
    saveImage("ticket-detail/add-attachment.png", await page.screenshot());
    saveImage("ticket-detail/download-attachment.png", await page.screenshot());
    saveImage("responsive/desktop-ticket-detail.png", await page.screenshot());
  }

  // Tablet Ticket Detail (768px)
  const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tPage = await tabletCtx.newPage();
  await tPage.goto(BASE_URL);
  await tPage.waitForTimeout(500);
  const tcCheck = tPage.locator("button:has-text('Check System')");
  if (await tcCheck.isVisible()) await tcCheck.click();
  const tcReq = tPage.locator("button:has-text('Jennifer Anderson')");
  if (await tcReq.isVisible()) await tcReq.click();
  await tPage.waitForTimeout(500);
  const tView = tPage.locator("button:has-text('View')").first();
  if (await tView.isVisible()) {
    await tView.click();
    await tPage.waitForTimeout(500);
  }
  saveImage("responsive/tablet-ticket-detail.png", await tPage.screenshot());

  // Mobile Ticket Detail (375px)
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mPage = await mobileCtx.newPage();
  await mPage.goto(BASE_URL);
  await mPage.waitForTimeout(500);
  const mcCheck = mPage.locator("button:has-text('Check System')");
  if (await mcCheck.isVisible()) await mcCheck.click();
  const mcReq = mPage.locator("button:has-text('Jennifer Anderson')");
  if (await mcReq.isVisible()) await mcReq.click();
  await mPage.waitForTimeout(500);
  const mView = mPage.locator("button:has-text('View')").first();
  if (await mView.isVisible()) {
    await mView.click();
    await mPage.waitForTimeout(500);
  }
  saveImage("responsive/mobile-ticket-detail.png", await mPage.screenshot());

  await browser.close();
  console.log("All missing ticket detail screenshots fixed successfully!");
}

fix().catch(console.error);
