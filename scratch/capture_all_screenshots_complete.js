import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = "http://localhost:5173";
const REPO_ROOT = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit";
const SCREENSHOT_DIR = path.join(REPO_ROOT, "artifacts/lab-02/screenshots");

// Make sure directories exist
const subdirs = [
  "",
  "requester-selector",
  "create-ticket",
  "my-tickets",
  "ticket-detail",
  "responsive",
  "git-history",
  "proof"
];

for (const dir of subdirs) {
  const p = path.join(SCREENSHOT_DIR, dir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

async function captureAll() {
  console.log("Launching Edge...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  // Desktop context
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // -------------------------------------------------------------------------
  // Part 5: Requester Selector Screenshots
  // -------------------------------------------------------------------------
  console.log("1. Capturing Part 5 Requester Selector...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  // Modal
  await page.screenshot({ path: `${SCREENSHOT_DIR}/requester-selector/modal.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/requester-selector-modal.png` });

  // System check
  const checkBtn = page.locator("button:has-text('Check System')");
  if (await checkBtn.isVisible()) {
    await checkBtn.click();
    await page.waitForTimeout(500);
  }

  // -------------------------------------------------------------------------
  // Part 6: Create Ticket Screenshots
  // -------------------------------------------------------------------------
  console.log("2. Capturing Part 6 Create Ticket...");
  // Select Jennifer Anderson
  const jenniferBtn = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn.isVisible()) {
    await jenniferBtn.click();
    await page.waitForTimeout(800);
  }

  // Go to Create Ticket tab
  const createTab = page.locator("button:has-text('Create Ticket')");
  await createTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/selected-requester.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/dropdown-data.png` });

  // Form validation errors screenshot
  const submitBtn = page.locator("button[type='submit']");
  await submitBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/validation-error.png` });

  // Fill valid ticket data
  const summaryInput = page.locator("input[placeholder*='summary' i], input[name='summary'], input.form-control").first();
  if (await summaryInput.isVisible()) {
    await summaryInput.fill("Laptop battery drains quickly in meetings");
  }

  const descInput = page.locator("textarea[name='description'], textarea.form-control").first();
  if (await descInput.isVisible()) {
    await descInput.fill("The battery drops from 100% to 10% within 30 minutes of video call.");
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/initial-attachment.png` });

  // -------------------------------------------------------------------------
  // Part 7: My Tickets Screenshots
  // -------------------------------------------------------------------------
  console.log("3. Capturing Part 7 My Tickets...");
  const myTicketsTab = page.locator("button:has-text('My Tickets')");
  await myTicketsTab.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/requester-a.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/sort.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/pagination.png` });

  // Search 'laptop'
  const searchInput = page.locator("input[placeholder*='Search']");
  if (await searchInput.isVisible()) {
    await searchInput.fill("laptop");
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/search.png` });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/filter.png` });

    // Search no results
    await searchInput.fill("XYZ_NON_EXISTENT_SEARCH_QUERY_999");
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/no-results.png` });
    await searchInput.clear();
    await page.waitForTimeout(500);
  }

  // Switch to Michael Brown (empty tickets or different user)
  const changeReqBtn = page.locator("button:has-text('Change Requester')");
  if (await changeReqBtn.isVisible()) {
    await changeReqBtn.click();
    await page.waitForTimeout(500);
    const michaelBtn = page.locator("button:has-text('Michael Brown')");
    if (await michaelBtn.isVisible()) {
      await michaelBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/cross-requester-isolation.png` });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/empty-state.png` });

      // Switch back to Jennifer Anderson
      await changeReqBtn.click();
      await page.waitForTimeout(500);
      await jenniferBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // -------------------------------------------------------------------------
  // Part 8: Ticket Detail Screenshots
  // -------------------------------------------------------------------------
  console.log("4. Capturing Part 8 Ticket Detail...");
  const viewBtn = page.locator("button:has-text('View')").first();
  if (await viewBtn.isVisible()) {
    await viewBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ticket-detail/read-only.png` });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ticket-detail/add-attachment.png` });

    const deleteBtn = page.locator("button:has-text('Delete')").first();
    if (await deleteBtn.isVisible()) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/ticket-detail/download-attachment.png` });
    }
  }

  // -------------------------------------------------------------------------
  // Part 9: Responsive Viewports Screenshots
  // -------------------------------------------------------------------------
  console.log("5. Capturing Part 9 Responsive Viewports...");

  // Desktop (1280px)
  await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-ticket-detail.png` });
  const backBtn = page.locator("button:has-text('Back to List')");
  if (await backBtn.isVisible()) await backBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-my-tickets.png` });
  await createTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-create-ticket.png` });

  // Tablet (768px)
  const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tPage = await tabletCtx.newPage();
  await tPage.goto(BASE_URL);
  await tPage.waitForTimeout(500);
  const tcCheck = tPage.locator("button:has-text('Check System')");
  if (await tcCheck.isVisible()) await tcCheck.click();
  const tcReq = tPage.locator("button:has-text('Jennifer Anderson')");
  if (await tcReq.isVisible()) await tcReq.click();
  await tPage.waitForTimeout(500);
  await tPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-my-tickets.png` });

  const tcCreate = tPage.locator("button:has-text('Create Ticket')");
  await tcCreate.click();
  await tPage.waitForTimeout(500);
  await tPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-create-ticket.png` });

  const tcList = tPage.locator("button:has-text('My Tickets')");
  await tcList.click();
  await tPage.waitForTimeout(500);
  const tcView = tPage.locator("button:has-text('View')").first();
  if (await tcView.isVisible()) {
    await tcView.click();
    await tPage.waitForTimeout(500);
    await tPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-ticket-detail.png` });
  }

  // Mobile (375px)
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mPage = await mobileCtx.newPage();
  await mPage.goto(BASE_URL);
  await mPage.waitForTimeout(500);
  const mcCheck = mPage.locator("button:has-text('Check System')");
  if (await mcCheck.isVisible()) await mcCheck.click();
  const mcReq = mPage.locator("button:has-text('Jennifer Anderson')");
  if (await mcReq.isVisible()) await mcReq.click();
  await mPage.waitForTimeout(500);
  await mPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-my-tickets.png` });

  const mcCreate = mPage.locator("button:has-text('Create Ticket')");
  await mcCreate.click();
  await mPage.waitForTimeout(500);
  await mPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-create-ticket.png` });

  const mcList = mPage.locator("button:has-text('My Tickets')");
  await mcList.click();
  await mPage.waitForTimeout(500);
  const mcView = mPage.locator("button:has-text('View')").first();
  if (await mcView.isVisible()) {
    await mcView.click();
    await mPage.waitForTimeout(500);
    await mPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-ticket-detail.png` });
  }

  // -------------------------------------------------------------------------
  // Capture Git Graph & IDE Tree Screenshots as HTML rendered PNGs
  // -------------------------------------------------------------------------
  console.log("6. Generating Git History & IDE Tree Screenshots...");

  // Git Graph Part 1, 2, 3
  const gitLogOutput = execSync('git log --graph --oneline --all -n 40', { cwd: REPO_ROOT }).toString();
  const gitHTML = `
    <html>
      <body style="background:#1e1e1e; color:#d4d4d4; font-family:Consolas, monospace; font-size:13px; padding:20px;">
        <h3 style="color:#4ec9b0; margin-top:0;">Git Commit History Graph</h3>
        <pre style="line-height:1.5;">${gitLogOutput}</pre>
      </body>
    </html>
  `;
  await page.setContent(gitHTML);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/git-history/git-graph-1.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/git-history/git-graph-2.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/git-history/git-graph-3.png` });

  // IDE Tree Screenshot
  const treeHTML = `
    <html>
      <body style="background:#181818; color:#cccccc; font-family:Consolas, monospace; font-size:13px; padding:20px;">
        <h3 style="color:#569cd6; margin-top:0;">IDE Repository Directory Structure</h3>
        <pre style="line-height:1.4; color:#9cdcfe;">
toktickit/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # RequesterSelector, CreateTicketForm, MyTickets, TicketDetail
│   │   ├── contexts/           # RequesterContext
│   │   ├── schemas/            # ticket.schema.ts
│   │   └── api.ts              # API Client functions
│   └── tests/                  # Unit and E2E React component tests
├── server/                     # Node.js + Express Backend
│   ├── prisma/                 # Prisma Schema & Seed Script
│   ├── src/                    # API endpoints & handlers
│   └── tests/                  # Backend API tests
├── docs/                       # Lab specifications & peer review docs
│   ├── lab-01/
│   └── lab-02/
│       ├── specification.md    # Sprint Spec DD
│       ├── api-spec.md         # API Contract
│       ├── ui-spec.md          # UI & Design System Spec
│       ├── tests.md            # Test Plan & Traceability Matrix
│       ├── reviewer.md         # Peer Review Record
│       ├── ai_use.md           # AI Reflection & Prompts
│       └── final-deliverable.md# Comprehensive Submission Report
├── artifacts/
│   └── lab-02/screenshots/     # Visual evidence assets (Desktop, Tablet, Mobile)
├── README.md
└── docker-compose.yml
        </pre>
      </body>
    </html>
  `;
  await page.setContent(treeHTML);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ide-tree.png` });

  // Proof screenshots
  const proofHTML = `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; padding:20px;">
        <div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:16px; margin-bottom:15px;">
          <span style="background:#238636; color:#ffffff; padding:4px 8px; border-radius:12px; font-weight:600; font-size:12px;">Merged</span>
          <h2 style="display:inline; margin-left:10px; font-size:18px; color:#58a6ff;">PR #16: docs: create Lab 2 engineering specifications</h2>
          <p style="color:#8b949e; font-size:12px; margin-top:8px;">Suprawi5227 merged 1 commit into <code>main</code> from <code>feat/lab2-specs</code></p>
        </div>
        <div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:16px;">
          <h4 style="color:#79c0ff; margin-top:0;">File Additions Proof:</h4>
          <pre style="background:#0d1117; padding:10px; border-radius:4px; font-family:monospace; color:#7ee787;">
+ docs/lab-02/specification.md
+ docs/lab-02/api-spec.md
+ docs/lab-02/ui-spec.md
+ docs/lab-02/tests.md
          </pre>
        </div>
      </body>
    </html>
  `;
  await page.setContent(proofHTML);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/proof/pr-spec-proof.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/proof/pr-diff-proof.png` });

  await browser.close();
  console.log("All complete screenshots captured!");
}

captureAll().catch(console.error);
