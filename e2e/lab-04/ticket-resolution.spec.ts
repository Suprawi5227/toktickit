import { test, expect } from "@playwright/test";

test.describe("Lab 4 Ticket Resolution Gate & Advisory Workflow E2E", () => {
  test("E2E-03: Requester indicates resolved -> IT Staff inspects advisory banner -> Formally resolves ticket (AC-06, AC-07, AC-08)", async ({
    request,
  }) => {
    // 1. Login as Requester Jennifer Anderson
    const reqLogin = await request.post("/api/auth/login", {
      data: { email: "jennifer.anderson@example.com", password: "Password123!" },
    });
    expect(reqLogin.status()).toBe(200);
    const { token: reqToken } = await reqLogin.json();

    // 2. Fetch Jennifer's tickets from Requester Dashboard to get an owned ticket
    const dashboardRes = await request.get("/api/dashboards/requester", {
      headers: { Authorization: `Bearer ${reqToken}` },
    });
    expect(dashboardRes.status()).toBe(200);
    const { data: reqData } = await dashboardRes.json();
    expect(reqData.recentTickets.length).toBeGreaterThan(0);
    const targetTicket = reqData.recentTickets[0];
    const ticketId = targetTicket.id;

    // 3. Login as IT Staff Kevin Patel
    const staffLogin = await request.post("/api/auth/login", {
      data: { email: "kevin.patel@toktickit.com", password: "Password123!" },
    });
    expect(staffLogin.status()).toBe(200);
    const { token: staffToken } = await staffLogin.json();

    // Ensure ticket is in active IN_PROGRESS state per BR-07 state machine
    const currentStatusRes = await request.get(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const currentTicket = (await currentStatusRes.json()).data;
    if (currentTicket.status === "RESOLVED" || currentTicket.status === "CLOSED") {
      await request.patch(`/api/tickets/${ticketId}/status`, {
        headers: { Authorization: `Bearer ${staffToken}` },
        data: { status: "REOPENED" },
      });
      await request.patch(`/api/tickets/${ticketId}/status`, {
        headers: { Authorization: `Bearer ${staffToken}` },
        data: { status: "IN_PROGRESS" },
      });
    } else if (currentTicket.status === "NEW") {
      await request.patch(`/api/tickets/${ticketId}/status`, {
        headers: { Authorization: `Bearer ${staffToken}` },
        data: { status: "IN_PROGRESS" },
      });
    }

    // 4. Requester indicates resolution on active ticket (AC-07, BR-09)
    const indicateRes = await request.patch(`/api/tickets/${ticketId}/indicate-resolved`, {
      headers: { Authorization: `Bearer ${reqToken}` },
      data: { note: "Laptop issue appears resolved from my end" },
    });
    expect(indicateRes.status()).toBe(200);
    const ticketData = (await indicateRes.json()).data;
    expect(ticketData.requesterResolvedInd).toBe(true);
    // Ticket status remains in active state (IN_PROGRESS) per BR-09
    expect(ticketData.status).toBe("IN_PROGRESS");

    // 5. Staff inspects ticket and verifies requesterResolvedInd is true
    const inspectTicket = await request.get(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    expect(inspectTicket.status()).toBe(200);
    const inspected = (await inspectTicket.json()).data;
    expect(inspected.requesterResolvedInd).toBe(true);

    // 6. IT Staff formally resolves the ticket (AC-08, BR-07, BR-08)
    const resolveRes = await request.patch(`/api/tickets/${ticketId}/status`, {
      headers: { Authorization: `Bearer ${staffToken}` },
      data: { status: "RESOLVED", lastUpdatedAt: inspected.updatedAt },
    });
    expect(resolveRes.status()).toBe(200);
    const resolvedTicket = (await resolveRes.json()).data;
    expect(resolvedTicket.status).toBe("RESOLVED");
  });

  test("E2E-04: Requester cannot transition ticket status to RESOLVED directly via client or API (AC-06)", async ({
    request,
  }) => {
    // 1. Login as Requester
    const reqLogin = await request.post("/api/auth/login", {
      data: { email: "jennifer.anderson@example.com", password: "Password123!" },
    });
    expect(reqLogin.status()).toBe(200);
    const { token: reqToken } = await reqLogin.json();

    // 2. Direct PATCH to /api/tickets/1/status with RESOLVED must be rejected with 403 Forbidden (AC-06, BR-08)
    const illegalStatusChange = await request.patch("/api/tickets/1/status", {
      headers: { Authorization: `Bearer ${reqToken}` },
      data: { status: "RESOLVED" },
    });
    expect(illegalStatusChange.status()).toBe(403);
  });
});
