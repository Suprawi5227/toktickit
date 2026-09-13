import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:5173";
const SCREENSHOT_DIR = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/artifacts/lab-02/screenshots";

// Ensure directories exist
const dirs = [
  "",
  "/requester-selector",
  "/create-ticket",
  "/my-tickets",
  "/ticket-detail",
  "/responsive"
];

for (const d of dirs) {
  const fullPath = path.join(SCREENSHOT_DIR, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

async function capture() {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  // Desktop context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log("Navigating to app...");
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  // 1. Requester Selector Modal
  await page.screenshot({ path: `${SCREENSHOT_DIR}/requester-selector/modal.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/requester-selector-modal.png` });

  // 2. System check
  const checkBtn = page.locator("button:has-text('Check System')");
  if (await checkBtn.isVisible()) {
    await checkBtn.click();
    await page.waitForTimeout(500);
  }

  // 3. Select Requester Jennifer Anderson (ID 1)
  const reqBtn = page.locator("button:has-text('Jennifer Anderson')");
  if (await reqBtn.isVisible()) {
    await reqBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Desktop My Tickets view
  await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/my-tickets-requester-a.png` });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-my-tickets.png` });

  // 5. Search in My Tickets
  const searchInput = page.locator("input[placeholder*='Search']");
  if (await searchInput.isVisible()) {
    await searchInput.fill("laptop");
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/my-tickets/search.png` });
    await searchInput.clear();
    await page.waitForTimeout(500);
  }

  // 6. Create Ticket Screen
  const createTab = page.locator("button:has-text('Create Ticket')");
  if (await createTab.isVisible()) {
    await createTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/create-ticket-selected-requester.png` });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-create-ticket.png` });

    // Validation errors screenshot
    const submitBtn = page.locator("button[type='submit']");
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/create-ticket/validation-error.png` });
    }
  }

  // 7. View Ticket Detail
  const listTab = page.locator("button:has-text('My Tickets')");
  if (await listTab.isVisible()) {
    await listTab.click();
    await page.waitForTimeout(500);
    const viewBtn = page.locator("button:has-text('View')").first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/ticket-detail/read-only.png` });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/responsive/desktop-ticket-detail.png` });
    }
  }

  // Tablet Viewports (768x1024)
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto(BASE_URL);
  await tabletPage.waitForTimeout(500);
  const tCheck = tabletPage.locator("button:has-text('Check System')");
  if (await tCheck.isVisible()) await tCheck.click();
  const tReq = tabletPage.locator("button:has-text('Jennifer Anderson')");
  if (await tReq.isVisible()) await tReq.click();
  await tabletPage.waitForTimeout(500);
  await tabletPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-my-tickets.png` });

  const tCreate = tabletPage.locator("button:has-text('Create Ticket')");
  if (await tCreate.isVisible()) {
    await tCreate.click();
    await tabletPage.waitForTimeout(500);
    await tabletPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-create-ticket.png` });
  }

  const tList = tabletPage.locator("button:has-text('My Tickets')");
  if (await tList.isVisible()) {
    await tList.click();
    await tabletPage.waitForTimeout(500);
    const tView = tabletPage.locator("button:has-text('View')").first();
    if (await tView.isVisible()) {
      await tView.click();
      await tabletPage.waitForTimeout(500);
      await tabletPage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/tablet-ticket-detail.png` });
    }
  }

  // Mobile Viewports (375x667)
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL);
  await mobilePage.waitForTimeout(500);
  const mCheck = mobilePage.locator("button:has-text('Check System')");
  if (await mCheck.isVisible()) await mCheck.click();
  const mReq = mobilePage.locator("button:has-text('Jennifer Anderson')");
  if (await mReq.isVisible()) await mReq.click();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-my-tickets.png` });

  const mCreate = mobilePage.locator("button:has-text('Create Ticket')");
  if (await mCreate.isVisible()) {
    await mCreate.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-create-ticket.png` });
  }

  const mList = mobilePage.locator("button:has-text('My Tickets')");
  if (await mList.isVisible()) {
    await mList.click();
    await mobilePage.waitForTimeout(500);
    const mView = mobilePage.locator("button:has-text('View')").first();
    if (await mView.isVisible()) {
      await mView.click();
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/responsive/mobile-ticket-detail.png` });
    }
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch(console.error);
