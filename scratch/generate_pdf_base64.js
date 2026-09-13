import fs from "fs";
import path from "path";
import { marked } from "marked";
import { chromium } from "playwright";

const MD_PATH = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-02/final-deliverable.md";
const PDF_PATH = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-02/final-deliverable.pdf";
const DOCS_LAB02 = "c:/Users/test0/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-02";

async function generatePDF() {
  console.log("Reading Markdown file...");
  let markdownText = fs.readFileSync(MD_PATH, "utf-8");

  let embeddedCount = 0;
  // Replace relative screenshot paths with base64 data URLs for 100% guaranteed PDF embedding
  markdownText = markdownText.replace(/!\[(.*?)\]\((screenshots\/.*?)\)/g, (match, alt, imgPath) => {
    const fullImgPath = path.join(DOCS_LAB02, imgPath);
    if (fs.existsSync(fullImgPath)) {
      const imgBuffer = fs.readFileSync(fullImgPath);
      const base64Str = imgBuffer.toString("base64");
      const ext = path.extname(fullImgPath).replace(".", "") || "png";
      embeddedCount++;
      return `<div style="text-align:center; margin:1.5em 0;"><img src="data:image/${ext};base64,${base64Str}" alt="${alt}" style="max-width:100%; height:auto; border:1px solid #E5E7EB; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin:auto;" /><p style="font-size:11px; color:#6B7280; font-style:italic; margin-top:5px;">${alt}</p></div>`;
    }
    return match;
  });

  console.log(`Successfully embedded ${embeddedCount} images as base64 into HTML.`);

  console.log("Converting Markdown to HTML...");
  const htmlContent = marked.parse(markdownText);

  const fullHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>TokTickIT Lab 2 Submission Report</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1F2937;
        line-height: 1.6;
        font-size: 13px;
        padding: 0;
        margin: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        color: #006B3C;
        font-weight: 700;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        page-break-after: avoid;
      }

      h1 {
        font-size: 24px;
        border-bottom: 2px solid #006B3C;
        padding-bottom: 8px;
        margin-top: 0;
      }

      h2 {
        font-size: 18px;
        border-bottom: 1px solid #E5E7EB;
        padding-bottom: 4px;
      }

      h3 {
        font-size: 15px;
      }

      p {
        margin-bottom: 1em;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5em;
        font-size: 11px;
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      th, td {
        border: 1px solid #D1D5DB;
        padding: 6px 10px;
        text-align: left;
      }

      th {
        background-color: #EAF6EF;
        color: #006B3C;
        font-weight: 600;
      }

      tr:nth-child(even) {
        background-color: #F9FAFB;
      }

      code {
        font-family: 'Courier New', Courier, monospace;
        background-color: #F3F4F6;
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 11px;
        color: #0B7A46;
      }

      pre {
        background-color: #1F2937;
        color: #F9FAFB;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 10.5px;
        line-height: 1.4;
        margin-bottom: 1.5em;
        page-break-inside: avoid;
      }

      pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
      }

      blockquote {
        border-left: 4px solid #006B3C;
        margin: 0;
        padding-left: 1rem;
        color: #4B5563;
        font-style: italic;
      }

      hr {
        border: none;
        border-top: 1px solid #E5E7EB;
        margin: 2em 0;
      }

      ul, ol {
        padding-left: 1.5em;
        margin-bottom: 1em;
      }

      li {
        margin-bottom: 0.3em;
      }

      a {
        color: #0B7A46;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    ${htmlContent}
  </body>
  </html>
  `;

  console.log("Launching Edge via Playwright...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  const page = await browser.newPage();
  await page.setContent(fullHTML, { waitUntil: "load" });
  await page.waitForTimeout(3000);

  console.log("Generating PDF with embedded base64 images...");
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
  console.log(`PDF successfully generated with embedded images at: ${PDF_PATH}`);
}

generatePDF().catch(console.error);
