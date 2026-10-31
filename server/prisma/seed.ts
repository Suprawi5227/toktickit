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
        passwordHash: defaultPasswordHash,
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
): Promise<Record<string, number>> {
  const ticketMap: Record<string, number> = {};
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
      requesterResolvedInd: false,
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
      requesterResolvedInd: false,
    },
    {
      ticketNumber: "TXT-2025-001232",
      summary: "Email not syncing on mobile",
      description: "Outlook mobile app on my phone stopped receiving new emails today.",
      requestedPriority: Priority.MEDIUM,
      itPriority: ITPriority.MEDIUM,
      status: TicketStatus.WAITING_FOR_REQUESTER,
      requesterEmail: "sarah.johnson@example.com",
      ownerEmail: "lisa.martinez@toktickit.com",
      categoryName: "Software",
      systemName: "Email",
      requesterResolvedInd: true,
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
      requesterResolvedInd: false,
    },
    {
      ticketNumber: "TXT-2025-001230",
      summary: "Intermittent Wi-Fi disconnects in Science building",
      description: "Wi-Fi connection drops every 15 minutes when sitting in Room 402.",
      requestedPriority: Priority.HIGH,
      itPriority: ITPriority.HIGH,
      status: TicketStatus.RESOLVED,
      requesterEmail: "jennifer.anderson@example.com",
      ownerEmail: "kevin.patel@toktickit.com",
      categoryName: "Network",
      systemName: "Campus Wi-Fi",
      requesterResolvedInd: true,
    },
    {
      ticketNumber: "TXT-2025-001229",
      summary: "Software license activation for grading tool",
      description: "Need license key activated for the grade submission application.",
      requestedPriority: Priority.MEDIUM,
      itPriority: ITPriority.LOW,
      status: TicketStatus.CLOSED,
      requesterEmail: "michael.brown@example.com",
      ownerEmail: "lisa.martinez@toktickit.com",
      categoryName: "Software",
      systemName: "Grade Submission App",
      requesterResolvedInd: true,
    },
    {
      ticketNumber: "TXT-2025-001228",
      summary: "Department printer recurring jam on tray 2",
      description: "Printer jammed again after previous cleanup. Paper sensor may be failing.",
      requestedPriority: Priority.URGENT,
      itPriority: ITPriority.URGENT,
      status: TicketStatus.REOPENED,
      requesterEmail: "sarah.johnson@example.com",
      ownerEmail: "robert.wilson@toktickit.com",
      categoryName: "Hardware",
      systemName: "Printer",
      requesterResolvedInd: false,
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
        requesterResolvedInd: t.requesterResolvedInd,
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
        requesterResolvedInd: t.requesterResolvedInd,
      },
    });

    ticketMap[t.ticketNumber] = ticket.id;

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

  return ticketMap;
}

export async function seedActionsTaken(
  prisma: PrismaClient,
  ticketMap: Record<string, number>,
  users: Record<string, number>
) {
  // Clean existing actions for seeded tickets to guarantee idempotent runs
  for (const ticketId of Object.values(ticketMap)) {
    await prisma.actionTaken.deleteMany({ where: { ticketId } });
  }

  const actionsData = [
    // TXT-2025-001234 (Multi-action with collaborative performers)
    {
      ticketId: ticketMap["TXT-2025-001234"],
      actionDateTime: new Date("2026-10-31T09:30:00.000Z"),
      description: "Ran full hardware diagnostic and battery degradation assessment.",
      result: "Battery health is at 42% capacity with 850 cycles; replacement unit required.",
      performedById: users["kevin.patel@toktickit.com"],
      followUpRequired: true,
      followUpNote: "Order replacement battery pack and schedule hardware servicing.",
      attachmentNotes: "Diagnostic logs attached to ticket detail.",
    },
    {
      ticketId: ticketMap["TXT-2025-001234"],
      actionDateTime: new Date("2026-10-31T11:15:00.000Z"),
      description: "Retrieved approved battery stock from IT inventory and benchmarked cell voltages.",
      result: "Replacement battery pack staged and verified; ready for user drop-off.",
      performedById: users["robert.wilson@toktickit.com"], // Collaborative performer
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
    },

    // TXT-2025-001232 (Single action with follow-up note)
    {
      ticketId: ticketMap["TXT-2025-001232"],
      actionDateTime: new Date("2026-10-31T10:00:00.000Z"),
      description: "Revoked stale ActiveSync mobile device profile and generated new exchange auth token.",
      result: "User instructed to re-authenticate mobile Outlook client.",
      performedById: users["lisa.martinez@toktickit.com"],
      followUpRequired: true,
      followUpNote: "Verify sync status with user after 24 hours.",
      attachmentNotes: null,
    },

    // TXT-2025-001230 (Resolved ticket single action)
    {
      ticketId: ticketMap["TXT-2025-001230"],
      actionDateTime: new Date("2026-10-30T14:20:00.000Z"),
      description: "Rebooted access point AP-SCI-402 and updated radio transmit power.",
      result: "Signal strength stable at -55 dBm with zero packet drop over 30-minute stress test.",
      performedById: users["kevin.patel@toktickit.com"],
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
    },

    // TXT-2025-001229 (Closed ticket single action)
    {
      ticketId: ticketMap["TXT-2025-001229"],
      actionDateTime: new Date("2026-10-29T16:00:00.000Z"),
      description: "Provisioned academic software license key and validated remote workstation activation.",
      result: "License activated successfully; student grading submission module functional.",
      performedById: users["lisa.martinez@toktickit.com"],
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
    },

    // TXT-2025-001228 (Reopened ticket single action with follow-up)
    {
      ticketId: ticketMap["TXT-2025-001228"],
      actionDateTime: new Date("2026-10-31T13:45:00.000Z"),
      description: "Disassembled Tray 2 pickup assembly and inspected optical sensor.",
      result: "Roller rubber worn smooth causing slippage on heavy bond paper.",
      performedById: users["robert.wilson@toktickit.com"],
      followUpRequired: true,
      followUpNote: "Expedite pickup roller replacement part from supplier.",
      attachmentNotes: "Hardware photo taken.",
    },

    // Note: TXT-2025-001233 and TXT-2025-001231 intentionally have ZERO actions taken (tests empty state).
  ];

  await prisma.actionTaken.createMany({
    data: actionsData,
  });
}

async function main() {
  const prisma = getPrisma();
  const categories = await seedCategories(prisma);
  const systems = await seedRelatedSystems(prisma);
  const users = await seedUsers(prisma);
  const ticketMap = await seedTickets(prisma, users, categories, systems);
  await seedActionsTaken(prisma, ticketMap, users);
  console.log("Database seeded successfully for Lab 4.");
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
