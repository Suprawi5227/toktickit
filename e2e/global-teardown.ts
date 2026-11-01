import type { Server } from "http";

export default async function globalTeardown() {
  const server = (globalThis as any).__TEST_SERVER__ as Server | undefined;
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
}

