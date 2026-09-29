import { PrismaClient, Role, Priority, ITPriority, TicketStatus } from "@prisma/client";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { getPrisma } from "../src/prisma.js";

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

export const SEEDED_USERS = [
  // Requesters (4 active, 1 inactive)
  { name: "Jennifer Anderson", email: "jennifer.anderson@example.com", role: Role.REQUESTER, isActive: true, requiresPasswordChange: false },
  { name: "Michael Brown", email: "michael.brown@example.com", role: Role.REQUESTER, isActive: true, requiresPasswordChange: false },
  { name: "Sarah Johnson", email: "sarah.johnson@example.com", role: Role.REQUESTER, isActive: true, requiresPasswordChange: false },
  { name: "David Lee", email: "david.lee@example.com", role: Role.REQUESTER, isActive: true, requiresPasswordChange: true }, // Needs password change
  { name: "Inactive Requester", email: "inactive.requester@example.com", role: Role.REQUESTER, isActive: false, requiresPasswordChange: false },

  // IT Staff (3 active, 1 inactive)
  { name: "Kevin Patel (IT Support)", email: "kevin.patel@toktickit.com", role: Role.IT_STAFF, isActive: true, requiresPasswordChange: false },
  { name: "Lisa Martinez (IT Support)", email: "lisa.martinez@toktickit.com", role: Role.IT_STAFF, isActive: true, requiresPasswordChange: false },
  { name: "Robert Wilson (IT Support)", email: "robert.wilson@toktickit.com", role: Role.IT_STAFF, isActive: true, requiresPasswordChange: false },
  { name: "Inactive IT Staff", email: "inactive.staff@toktickit.com", role: Role.IT_STAFF, isActive: false, requiresPasswordChange: false },

  // Administrator (1 active)
  { name: "John Smith (Admin)", email: "john.smith@toktickit.com", role: Role.ADMIN, isActive: true, requiresPasswordChange: false },
];

export async function seedUsers(prisma: PrismaClient): Promise<Record<string, number>> {
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const userMap: Record<string, number> = {};

  for (const u of SEEDED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        requiresPasswordChange: u.requiresPasswordChange,
      },
      create: {
        email: u.email,
        passwordHash: defaultPasswordHash,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        requiresPasswordChange: u.requiresPasswordChange,
      },
    });

    // Also populate DevelopmentRequester for backwards compatibility
    await prisma.developmentRequester.upsert({
      where: { email: u.email },
      update: { name: u.name, isActive: u.isActive },
      create: { name: u.name, email: u.email, isActive: u.isActive },
    });

    userMap[u.email] = user.id;
  }

  return userMap;
}

export async function seedCategories(prisma: PrismaClient): Promise<Record<string, number>> {
  const catMap: Record<string, number> = {};
  for (const name of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catMap[name] = cat.id;
  }
  return catMap;
}

export async function seedRelatedSystems(prisma: PrismaClient): Promise<Record<string, number>> {
  const sysMap: Record<string, number> = {};
  for (const name of RELATED_SYSTEMS) {
    const sys = await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    sysMap[name] = sys.id;
  }
  return sysMap;
}

export async function seedTickets(
  prisma: PrismaClient,
  users: Record<string, number>,
  categories: Record<string, number>,
  systems: Record<string, number>
) {
  const ticketsData = [
    {
      ticketNumber: "TXT-2025-001234",
      summary: "Laptop battery drains quickly",
      description: "My laptop battery is draining much faster than usual even when idling.",
      requestedPriority: Priority.MEDIUM,
      itPriority: ITPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterEmail: "jennifer.anderson@example.com",
      ownerEmail: "kevin.patel@toktickit.com",
      categoryName: "Hardware",
      systemName: "Corporate Laptop",
    },
    {
      ticketNumber: "TXT-2025-001233",
      summary: "Cannot connect to VPN",
      description: "Getting timeout error when connecting to Campus VPN from off-campus.",
      requestedPriority: Priority.HIGH,
      itPriority: ITPriority.HIGH,
      status: TicketStatus.OPEN,
      requesterEmail: "michael.brown@example.com",
      ownerEmail: null,
      categoryName: "Network",
      systemName: "VPN",
    },
    {
      ticketNumber: "TXT-2025-001232",
      summary: "Email not syncing on mobile",
      description: "Outlook mobile app on my phone stopped receiving new emails today.",
      requestedPriority: Priority.MEDIUM,
      itPriority: ITPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterEmail: "sarah.johnson@example.com",
      ownerEmail: "lisa.martinez@toktickit.com",
      categoryName: "Software",
      systemName: "Email",
    },
    {
      ticketNumber: "TXT-2025-001231",
      summary: "New employee setup request",
      description: "Need accounts created for a new team member starting next week.",
      requestedPriority: Priority.LOW,
      itPriority: ITPriority.LOW,
      status: TicketStatus.NEW,
      requesterEmail: "david.lee@example.com",
      ownerEmail: null,
      categoryName: "Account and Access",
      systemName: "LEB2 App",
    },
  ];

  for (const t of ticketsData) {
    const requesterId = users[t.requesterEmail];
    const ownerId = t.ownerEmail ? users[t.ownerEmail] : null;
    const categoryId = categories[t.categoryName];
    const relatedSystemId = systems[t.systemName];

    const ticket = await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        status: t.status,
        requesterId,
        ownerId,
        categoryId,
        relatedSystemId,
      },
      create: {
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        status: t.status,
        requesterId,
        ownerId,
        categoryId,
        relatedSystemId,
      },
    });

    // Seed comments & notes for the first ticket
    if (t.ticketNumber === "TXT-2025-001234") {
      const existingComments = await prisma.publicComment.findMany({ where: { ticketId: ticket.id } });
      if (existingComments.length === 0) {
        await prisma.publicComment.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: users["jennifer.anderson@example.com"],
              content: "Thank you for looking into this. Please let me know if you need any diagnostic info.",
            },
            {
              ticketId: ticket.id,
              authorId: users["kevin.patel@toktickit.com"],
              content: "We are investigating the issue on your device. We will update you shortly.",
            },
          ],
        });
      }

      const existingNotes = await prisma.internalNote.findMany({ where: { ticketId: ticket.id } });
      if (existingNotes.length === 0) {
        await prisma.internalNote.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: users["kevin.patel@toktickit.com"],
              content: "Ran battery report. Capacity is down to 42%. Scheduled replacement battery unit.",
            },
          ],
        });
      }
    }
  }
}

async function main() {
  const prisma = getPrisma();
  const categories = await seedCategories(prisma);
  const systems = await seedRelatedSystems(prisma);
  const users = await seedUsers(prisma);
  await seedTickets(prisma, users, categories, systems);
  console.log("Database seeded successfully for Lab 3.");
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
