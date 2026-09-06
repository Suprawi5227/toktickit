import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";
import { getPrisma } from "../src/prisma.js";

// Issue 3 — seed the four supported categories.
export const CATEGORIES = [
  "Account and Access",
  "Hardware",
  "Software",
  "Network",
] as const;

export const RELATED_SYSTEMS = [
  "Email",
  "Campus Wi-Fi",
  "VPN",
  "LEB2 App",
  "Grade Submission App",
  "Printer",
  "Corporate Laptop",
] as const;

export const REQUESTERS = [
  { name: "Jennifer Anderson", email: "jennifer.anderson@example.com", isActive: true },
  { name: "Michael Brown", email: "michael.brown@example.com", isActive: true },
  { name: "Sarah Johnson", email: "sarah.johnson@example.com", isActive: true },
  { name: "David Lee", email: "david.lee@example.com", isActive: true },
  { name: "Inactive User", email: "inactive@example.com", isActive: false },
];

type SeedClient = Pick<PrismaClient, "category" | "relatedSystem" | "developmentRequester">;

export async function seedCategories(prisma: SeedClient): Promise<void> {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

export async function seedRelatedSystems(prisma: SeedClient): Promise<void> {
  for (const name of RELATED_SYSTEMS) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

export async function seedRequesters(prisma: SeedClient): Promise<void> {
  for (const req of REQUESTERS) {
    await prisma.developmentRequester.upsert({
      where: { email: req.email },
      update: { isActive: req.isActive, name: req.name },
      create: req,
    });
  }
}

async function main() {
  const prisma = getPrisma();
  await seedCategories(prisma);
  await seedRelatedSystems(prisma);
  await seedRequesters(prisma);
  console.log("Database seeded successfully.");
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await getPrisma().$disconnect();
    });
}
