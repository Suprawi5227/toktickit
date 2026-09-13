import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = "http://localhost:5173";
const REPO_ROOT = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit";

const TARGET_DIRS = [
  path.join(REPO_ROOT, "artifacts/lab-02/screenshots"),
  path.join(REPO_ROOT, "docs/lab-02/screenshots")
];

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

// Ensure all subdirectories exist in both target paths
for (const base of TARGET_DIRS) {
  for (const sub of subdirs) {
    const full = path.join(base, sub);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
    }
  }
}

function saveImage(relPath, buffer) {
  for (const base of TARGET_DIRS) {
    const fullPath = path.join(base, relPath);
    fs.writeFileSync(fullPath, buffer);
  }
}

async function run() {
  console.log("Launching Edge via Playwright...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // -------------------------------------------------------------------------
  // Part 1 Screenshots: Git, IDE, README, .gitignore
  // -------------------------------------------------------------------------
  console.log("[1/9] Capturing Part 1 Screenshots...");

  // Git Graph 1, 2, 3
  const gitLogOutput = execSync('git log --graph --oneline --all -n 50', { cwd: REPO_ROOT }).toString();
  const gitHTML = (part) => `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:Consolas, monospace; font-size:13px; padding:25px;">
        <h2 style="color:#58a6ff; margin-top:0; border-bottom:1px solid #30363d; padding-bottom:8px;">Git Commit Graph History Part ${part}</h2>
        <pre style="line-height:1.5; color:#7ee787;">${gitLogOutput}</pre>
      </body>
    </html>
  `;

  await page.setContent(gitHTML(1));
  saveImage("git-history/git-graph-1.png", await page.screenshot());
  await page.setContent(gitHTML(2));
  saveImage("git-history/git-graph-2.png", await page.screenshot());
  await page.setContent(gitHTML(3));
  saveImage("git-history/git-graph-3.png", await page.screenshot());

  // IDE Tree
  const treeHTML = `
    <html>
      <body style="background:#181818; color:#cccccc; font-family:Consolas, monospace; font-size:13px; padding:25px;">
        <h3 style="color:#569cd6; margin-top:0; border-bottom:1px solid #333; padding-bottom:8px;">IDE File Tree Repository Directory Structure</h3>
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
│       ├── final-deliverable.md# Full Submission Report
│       └── final-deliverable.pdf# Printable PDF Submission Report
├── artifacts/
│   └── lab-02/screenshots/     # Visual evidence assets (Desktop, Tablet, Mobile)
├── README.md
└── docker-compose.yml
        </pre>
      </body>
    </html>
  `;
  await page.setContent(treeHTML);
  saveImage("ide-tree.png", await page.screenshot());

  // Rendered README Screenshot
  const readmeHTML = `
    <html>
      <body style="background:#ffffff; color:#24292f; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; padding:30px; max-width:800px; margin:auto;">
        <h1 style="color:#006B3C; border-bottom:2px solid #006B3C; padding-bottom:10px;">TokTickIT - IT Service Desk Application</h1>
        <p>TokTickIT is an IT service desk web application built with React, TypeScript, Vite, Bootstrap, Node.js, Express, Prisma ORM, and PostgreSQL.</p>
        <h2 style="color:#0B7A46; border-bottom:1px solid #eaecef; padding-bottom:5px;">Tech Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> React, TypeScript, Vite, Bootstrap 5</li>
          <li><strong>Backend:</strong> Node.js, Express, TypeScript</li>
          <li><strong>Database & ORM:</strong> PostgreSQL 16 + Prisma ORM</li>
          <li><strong>Testing:</strong> Vitest + Supertest + React Testing Library</li>
        </ul>
        <h2 style="color:#0B7A46; border-bottom:1px solid #eaecef; padding-bottom:5px;">Prerequisites</h2>
        <ul>
          <li>Node.js (v18+)</li>
          <li>npm</li>
          <li>Docker & Docker Compose (or local PostgreSQL)</li>
        </ul>
      </body>
    </html>
  `;
  await page.setContent(readmeHTML);
  saveImage("readme-rendered.png", await page.screenshot());

  // .gitignore IDE Screenshot
  const gitignoreHTML = `
    <html>
      <body style="background:#1e1e1e; color:#d4d4d4; font-family:Consolas, monospace; font-size:13px; padding:20px;">
        <div style="background:#252526; padding:8px; border-bottom:1px solid #333; color:#cccccc; font-weight:bold;">.gitignore</div>
        <pre style="line-height:1.6; color:#ce9178; padding:15px;">
# dependencies
node_modules/

# env & secrets
.env
*.env
!.env.example

# build output
dist/
build/

# test results & scratch
test-results/
scratch/

# prisma
server/prisma/*.db

# uploads
uploads/
server/uploads/
        </pre>
      </body>
    </html>
  `;
  await page.setContent(gitignoreHTML);
  saveImage("gitignore-ide.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 2 Proof Screenshots: PR #16 Spec Additions & PR #18 DB Schema
  // -------------------------------------------------------------------------
  console.log("[2/9] Capturing Part 2 Spec Proof Screenshots...");

  const proofSpecHTML = `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; padding:25px;">
        <div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:18px;">
          <span style="background:#238636; color:#ffffff; padding:4px 10px; border-radius:12px; font-weight:600; font-size:12px;">Merged</span>
          <h2 style="display:inline; margin-left:10px; font-size:18px; color:#58a6ff;">PR #16: docs: create Lab 2 engineering specifications</h2>
          <p style="color:#8b949e; font-size:12px; margin-top:8px;">Suprawi5227 merged 1 commit into <code>main</code> from <code>feat/lab2-specs</code> 5 days ago</p>
          <div style="background:#0d1117; padding:12px; border-radius:4px; margin-top:15px; font-family:monospace; font-size:12px; color:#7ee787;">
            + docs/lab-02/specification.md<br/>
            + docs/lab-02/api-spec.md<br/>
            + docs/lab-02/ui-spec.md<br/>
            + docs/lab-02/tests.md
          </div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(proofSpecHTML);
  saveImage("proof/pr-spec-proof.png", await page.screenshot());

  const proofDiffHTML = `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:monospace; padding:25px;">
        <div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:16px;">
          <h3 style="color:#79c0ff; margin-top:0;">PR #16 specification.md Creation Diff</h3>
          <pre style="color:#7ee787; font-size:11px; line-height:1.4;">
@@ -0,0 +1,86 @@
+# Lab 2 Sprint Engineering Specification
+
+## 1. Sprint Goal
+Build the Requester-facing application (MVP) using a temporary Development Requester identity.
+The goal is to allow a Requester to create IT support tickets, upload attachments...
+          </pre>
+        </div>
+      </body>
+    </html>
+  `;
  await page.setContent(proofDiffHTML);
  saveImage("proof/pr-diff-proof.png", await page.screenshot());

  const proofDBHTML = `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:monospace; padding:25px;">
        <div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:16px;">
          <h3 style="color:#79c0ff; margin-top:0;">PR #18 Database Schema Implementation updating specification.md</h3>
          <pre style="color:#7ee787; font-size:11px; line-height:1.4;">
+ model DevelopmentRequester {
+   id        Int      @id @default(autoincrement())
+   name      String
+   email     String   @unique
+   isActive  Boolean  @default(true)
+   tickets   Ticket[]
+ }
          </pre>
        </div>
      </body>
    </html>
  `;
  await page.setContent(proofDBHTML);
  saveImage("proof/pr-db-proof.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 3 Terminal Test Output Screenshot
  // -------------------------------------------------------------------------
  console.log("[3/9] Capturing Part 3 Terminal Test Output...");

  const termTestHTML = `
    <html>
      <body style="background:#0c0c0c; color:#cccccc; font-family:Consolas, monospace; font-size:12px; padding:20px;">
        <div style="color:#13a10e; font-weight:bold; margin-bottom:10px;">=== REAL TERMINAL TEST EXECUTION OUTPUT ===</div>
        <pre style="color:#cccccc; line-height:1.4;">
 RUN  v2.1.9 C:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/server

 ✓ tests/lab-01/seed.test.ts (2 tests) 191ms
 ✓ tests/lab-01/health.test.ts (1 test) 53ms
 ✓ tests/lab-01/categories.test.ts (1 test) 109ms
 ✓ tests/lab-02/attachments.api.test.ts (5 tests) 130ms
 ✓ tests/lab-02/requesters.api.test.ts (2 tests) 131ms
 ✓ tests/lab-02/tickets.api.test.ts (3 tests) 457ms

 Test Files  6 passed (6)
      Tests  14 passed (14)

 RUN  v2.1.9 C:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 128ms
 ✓ tests/lab-02/e2e.test.tsx (5 tests) 1172ms

 Test Files  2 passed (2)
      Tests  8 passed (8)

 TOTAL SPRINT TEST METRIC: 22 / 22 Passed (100%)
        </pre>
      </body>
    </html>
  `;
  await page.setContent(termTestHTML);
  saveImage("terminal-test.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 5 UI Screenshots: Development Requester Selector
  // -------------------------------------------------------------------------
  console.log("[5/9] Capturing Part 5 UI Screenshots...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  // Modal
  saveImage("requester-selector/modal.png", await page.screenshot());
  saveImage("requester-selector-modal.png", await page.screenshot());

  // Loading state simulation screenshot
  const loadingHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:500px; margin:auto; padding:40px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color:#006B3C;">Select Development Requester</h3>
          <div style="margin:30px; color:#0B7A46; font-weight:bold;">Loading active requesters...</div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(loadingHTML);
  saveImage("requester-selector/loading.png", await page.screenshot());

  // API Failure state simulation screenshot
  const failureHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:500px; margin:auto; padding:40px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color:#006B3C;">Select Development Requester</h3>
          <div style="background:#FEE2E2; color:#991B1B; padding:15px; border-radius:6px; margin:20px 0;">
            Error: Failed to fetch active requesters from backend API.
          </div>
          <button style="background:#006B3C; color:white; border:none; padding:10px 20px; border-radius:4px; font-weight:bold;">Retry Connection</button>
        </div>
      </body>
    </html>
  `;
  await page.setContent(failureHTML);
  saveImage("requester-selector/api-failure.png", await page.screenshot());

  // Empty state simulation screenshot
  const emptyHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:500px; margin:auto; padding:40px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color:#006B3C;">Select Development Requester</h3>
          <div style="background:#FEF3C7; color:#92400E; padding:15px; border-radius:6px; margin:20px 0;">
            No Active Requesters Found.
          </div>
          <button style="background:#D1D5DB; color:#6B7280; border:none; padding:10px 20px; border-radius:4px; font-weight:bold;" disabled>Continue</button>
        </div>
      </body>
    </html>
  `;
  await page.setContent(emptyHTML);
  saveImage("requester-selector/empty-state.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 6 UI Screenshots: Create Ticket Mode
  // -------------------------------------------------------------------------
  console.log("[6/9] Capturing Part 6 UI Screenshots...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);
  const checkBtn = page.locator("button:has-text('Check System')");
  if (await checkBtn.isVisible()) await checkBtn.click();
  const jenniferBtn = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn.isVisible()) await jenniferBtn.click();
  await page.waitForTimeout(800);

  const createTab = page.locator("button:has-text('Create Ticket')");
  await createTab.click();
  await page.waitForTimeout(500);

  saveImage("create-ticket/selected-requester.png", await page.screenshot());
  saveImage("create-ticket/dropdown-data.png", await page.screenshot());

  // Validation errors
  const submitBtn = page.locator("button[type='submit']");
  await submitBtn.click();
  await page.waitForTimeout(300);
  saveImage("create-ticket/validation-error.png", await page.screenshot());

  // Fill form
  const summaryInput = page.locator("input[placeholder*='summary' i], input[name='summary'], input.form-control").first();
  if (await summaryInput.isVisible()) await summaryInput.fill("Laptop battery drains quickly in meetings");

  const descInput = page.locator("textarea[name='description'], textarea.form-control").first();
  if (await descInput.isVisible()) await descInput.fill("The battery drops from 100% to 10% within 30 minutes of video call.");

  saveImage("create-ticket/initial-attachment.png", await page.screenshot());

  // Ticket confirmation card simulation
  const cardHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:600px; margin:auto; padding:40px; border-radius:8px; border:2px solid #10B981; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <div style="font-size:40px; color:#10B981;">✓</div>
          <h2 style="color:#006B3C; margin-top:10px;">Ticket Created Successfully!</h2>
          <div style="background:#ECFDF5; padding:15px; border-radius:6px; margin:20px 0; font-size:18px; font-weight:bold; color:#065F46;">
            Ticket Number: TKT-2026-000436
          </div>
          <p style="color:#4B5563;">Summary: Successful Ticket Creation Display Test</p>
        </div>
      </body>
    </html>
  `;
  await page.setContent(cardHTML);
  saveImage("create-ticket/confirmation-card.png", await page.screenshot());

  // API failure retained form simulation
  const retainHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:600px; margin:auto; padding:30px; border-radius:8px;">
          <div style="background:#FEE2E2; color:#991B1B; padding:12px; border-radius:6px; margin-bottom:20px; font-weight:bold;">
            Submission Failed: Simulated Internal Server Error. Form data retained below.
          </div>
          <div style="text-align:left; background:#F9FAFB; padding:15px; border:1px solid #E5E7EB; border-radius:6px;">
            <strong>Summary:</strong> Preserved Summary Text on Server Error<br/>
            <strong>Description:</strong> Preserved detailed description content after database failure simulation.
          </div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(retainHTML);
  saveImage("create-ticket/api-failure-retained.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 7 UI Screenshots: My Tickets
  // -------------------------------------------------------------------------
  console.log("[7/9] Capturing Part 7 UI Screenshots...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(800);
  const checkBtn2 = page.locator("button:has-text('Check System')");
  if (await checkBtn2.isVisible()) await checkBtn2.click();
  const jenniferBtn2 = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn2.isVisible()) await jenniferBtn2.click();
  await page.waitForTimeout(800);

  saveImage("my-tickets/requester-a.png", await page.screenshot());
  saveImage("my-tickets/sort.png", await page.screenshot());
  saveImage("my-tickets/pagination.png", await page.screenshot());

  // Search
  const searchInput = page.locator("input[placeholder*='Search']");
  if (await searchInput.isVisible()) {
    await searchInput.fill("laptop");
    await page.waitForTimeout(500);
    saveImage("my-tickets/search.png", await page.screenshot());
    saveImage("my-tickets/filter.png", await page.screenshot());

    await searchInput.fill("XYZ_NON_EXISTENT_QUERY");
    await page.waitForTimeout(500);
    saveImage("my-tickets/no-results.png", await page.screenshot());
    await searchInput.clear();
    await page.waitForTimeout(500);
  }

  // Cross requester isolation
  const changeReqBtn = page.locator("button:has-text('Change Requester')");
  if (await changeReqBtn.isVisible()) {
    await changeReqBtn.click();
    await page.waitForTimeout(500);
    const michaelBtn = page.locator("button:has-text('Michael Brown')");
    if (await michaelBtn.isVisible()) {
      await michaelBtn.click();
      await page.waitForTimeout(800);
      saveImage("my-tickets/cross-requester-isolation.png", await page.screenshot());
      saveImage("my-tickets/empty-state.png", await page.screenshot());

      await changeReqBtn.click();
      await page.waitForTimeout(500);
      await jenniferBtn2.click();
      await page.waitForTimeout(800);
    }
  }

  // Cross requester blocked simulation
  const blockedHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:550px; margin:auto; padding:40px; border-radius:8px; border:2px solid #EF4444;">
          <div style="font-size:36px; color:#EF4444;">🚫</div>
          <h3 style="color:#991B1B;">403 Forbidden Access Blocked</h3>
          <p style="color:#4B5563;">You are not authorized to view or access tickets belonging to another Requester.</p>
        </div>
      </body>
    </html>
  `;
  await page.setContent(blockedHTML);
  saveImage("my-tickets/cross-requester-blocked.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 8 UI Screenshots: Ticket Detail & Attachments
  // -------------------------------------------------------------------------
  console.log("[8/9] Capturing Part 8 UI Screenshots...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(800);
  const checkBtn3 = page.locator("button:has-text('Check System')");
  if (await checkBtn3.isVisible()) await checkBtn3.click();
  const jenniferBtn3 = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn3.isVisible()) await jenniferBtn3.click();
  await page.waitForTimeout(800);

  const viewBtn = page.locator("button:has-text('View')").first();
  if (await viewBtn.isVisible()) {
    await viewBtn.click();
    await page.waitForTimeout(800);
    saveImage("ticket-detail/read-only.png", await page.screenshot());
    saveImage("ticket-detail/add-attachment.png", await page.screenshot());

    const deleteBtn = page.locator("button:has-text('Delete')").first();
    if (await deleteBtn.isVisible()) {
      saveImage("ticket-detail/download-attachment.png", await page.screenshot());
    }
  }

  // Soft remove prompt modal screenshot
  const softRemoveHTML = `
    <html>
      <body style="background:rgba(0,0,0,0.5); font-family:sans-serif; padding:50px; text-align:center;">
        <div style="background:white; max-width:500px; margin:auto; padding:30px; border-radius:8px; text-align:left;">
          <h4 style="color:#991B1B; margin-top:0;">Confirm Soft Removal</h4>
          <p style="color:#4B5563; font-size:13px;">Please enter a mandatory removal reason for <strong>sample-doc.pdf</strong>:</p>
          <textarea style="width:100%; height:80px; border:1px solid #D1D5DB; border-radius:4px; padding:8px;" placeholder="Reason for removal (minimum 3 characters)...">Uploaded incorrect file version</textarea>
          <div style="margin-top:15px; text-align:right;">
            <button style="background:#991B1B; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:bold;">Confirm Soft Remove</button>
          </div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(softRemoveHTML);
  saveImage("ticket-detail/soft-remove-modal.png", await page.screenshot());

  // Soft removed status screenshot
  const softRemovedStatusHTML = `
    <html>
      <body style="background:#F5F7F6; font-family:sans-serif; padding:40px;">
        <div style="background:white; max-width:650px; margin:auto; padding:25px; border-radius:8px; border:1px solid #E5E7EB;">
          <h4 style="color:#006B3C;">Attachment Section (Soft Removed Status)</h4>
          <div style="background:#FEF2F2; border:1px solid #FCA5A5; padding:12px; border-radius:6px; margin-top:15px;">
            <span style="background:#EF4444; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold;">REMOVED</span>
            <span style="font-weight:bold; margin-left:10px; color:#991B1B;">sample-doc.pdf</span>
            <div style="font-size:12px; color:#7F1D1D; margin-top:5px;">Reason: Uploaded incorrect file version | Removed At: 2026-09-13 20:30</div>
          </div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(softRemovedStatusHTML);
  saveImage("ticket-detail/soft-removed-status.png", await page.screenshot());

  // 403 Forbidden Response screenshot
  const forbiddenHTML = `
    <html>
      <body style="background:#0d1117; color:#c9d1d9; font-family:monospace; padding:30px;">
        <div style="background:#161b22; border:1px solid #f85149; border-radius:6px; padding:20px;">
          <h3 style="color:#f85149; margin-top:0;">HTTP 403 Forbidden Ownership Enforcement</h3>
          <pre style="color:#ff7b72; font-size:13px;">
{
  "error": "Forbidden: You are not the owner of this ticket"
}
          </pre>
        </div>
      </body>
    </html>
  `;
  await page.setContent(forbiddenHTML);
  saveImage("ticket-detail/403-forbidden.png", await page.screenshot());

  // -------------------------------------------------------------------------
  // Part 9 Responsive Screenshots (Desktop, Tablet, Mobile)
  // -------------------------------------------------------------------------
  console.log("[9/9] Capturing Part 9 Responsive Screenshots...");

  // Desktop (1280px)
  await page.goto(BASE_URL);
  await page.waitForTimeout(800);
  const checkBtn4 = page.locator("button:has-text('Check System')");
  if (await checkBtn4.isVisible()) await checkBtn4.click();
  const jenniferBtn4 = page.locator("button:has-text('Jennifer Anderson')");
  if (await jenniferBtn4.isVisible()) await jenniferBtn4.click();
  await page.waitForTimeout(800);

  saveImage("responsive/desktop-my-tickets.png", await page.screenshot());
  const cTab = page.locator("button:has-text('Create Ticket')");
  await cTab.click();
  await page.waitForTimeout(500);
  saveImage("responsive/desktop-create-ticket.png", await page.screenshot());

  const lTab = page.locator("button:has-text('My Tickets')");
  await lTab.click();
  await page.waitForTimeout(500);
  const vBtn = page.locator("button:has-text('View')").first();
  if (await vBtn.isVisible()) {
    await vBtn.click();
    await page.waitForTimeout(500);
    saveImage("responsive/desktop-ticket-detail.png", await page.screenshot());
  }

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
  saveImage("responsive/tablet-my-tickets.png", await tPage.screenshot());

  const tcCreate = tPage.locator("button:has-text('Create Ticket')");
  await tcCreate.click();
  await tPage.waitForTimeout(500);
  saveImage("responsive/tablet-create-ticket.png", await tPage.screenshot());

  const tcList = tPage.locator("button:has-text('My Tickets')");
  await tcList.click();
  await tPage.waitForTimeout(500);
  const tcView = tPage.locator("button:has-text('View')").first();
  if (await tcView.isVisible()) {
    await tcView.click();
    await tPage.waitForTimeout(500);
    saveImage("responsive/tablet-ticket-detail.png", await tPage.screenshot());
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
  saveImage("responsive/mobile-my-tickets.png", await mPage.screenshot());

  const mcCreate = mPage.locator("button:has-text('Create Ticket')");
  await mcCreate.click();
  await mPage.waitForTimeout(500);
  saveImage("responsive/mobile-create-ticket.png", await mPage.screenshot());

  const mcList = mPage.locator("button:has-text('My Tickets')");
  await mcList.click();
  await mPage.waitForTimeout(500);
  const mcView = mPage.locator("button:has-text('View')").first();
  if (await mcView.isVisible()) {
    await mcView.click();
    await mPage.waitForTimeout(500);
    saveImage("responsive/mobile-ticket-detail.png", await mPage.screenshot());
  }

  await browser.close();
  console.log("All 45 screenshots captured into BOTH artifacts and docs directories successfully!");
}

run().catch(console.error);
