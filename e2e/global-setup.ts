import { app } from "../server/src/app.js";
import type { Server } from "http";

let server: Server;

export default async function globalSetup() {
  await new Promise<void>((resolve, reject) => {
    try {
      server = app.listen(3000, "127.0.0.1", () => {
        console.log("Playwright E2E test server listening on http://127.0.0.1:3000");
        (globalThis as any).__TEST_SERVER__ = server;
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

