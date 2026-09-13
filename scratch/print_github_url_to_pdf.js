import { chromium } from "playwright";

const GITHUB_URL = "https://github.com/Suprawi5227/toktickit/blob/main/docs/lab-02/final-deliverable.md";
const PDF_PATH = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-02/final-deliverable.pdf";

async function convertGitHubToPDF() {
  console.log(`Navigating to GitHub URL: ${GITHUB_URL}...`);
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 1.5
  });

  const page = await context.newPage();
  await page.goto(GITHUB_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);

  // Inject CSS to clean up GitHub navigation header & footer for a clean document print
  await page.addStyleTag({
    content: `
      header.Header, 
      .AppHeader, 
      footer.footer, 
      .js-header-wrapper, 
      .file-navigation, 
      .flash-messages,
      .repository-content > div:first-child {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
      }
      .markdown-body {
        padding: 20px !important;
        max-width: 100% !important;
      }
    `
  });

  await page.waitForTimeout(1000);

  console.log("Printing GitHub rendered markdown page to PDF...");
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    margin: {
      top: "15mm",
      right: "15mm",
      bottom: "15mm",
      left: "15mm"
    }
  });

  await browser.close();
  console.log(`Successfully generated PDF from GitHub URL at: ${PDF_PATH}`);
}

convertGitHubToPDF().catch(console.error);
