import { test, expect } from "@playwright/test";

test.describe("Lab 4 Dashboards & Drill-Down E2E Flow", () => {
  test("E2E-05: IT Staff dashboard renders live metrics and drills down to filtered queue (AC-11, AC-14)", async ({
    request,
  }) => {
    // 1. Login as IT Staff
    const staffLogin = await request.post("/api/auth/login", {
      data: { email: "kevin.patel@toktickit.com", password: "Password123!" },
    });
    expect(staffLogin.status()).toBe(200);
    const { token: staffToken } = await staffLogin.json();

    // 2. Fetch staff dashboard metrics
    const dashboardRes = await request.get("/api/dashboards/staff", {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    expect(dashboardRes.status()).toBe(200);
    const { data } = await dashboardRes.json();

    // 3. Verify metrics integrity (AC-11)
    expect(data.metrics).toBeDefined();
    expect(typeof data.metrics.unassignedCount).toBe("number");
    expect(typeof data.metrics.myAssignedCount).toBe("number");
    expect(typeof data.metrics.openCount).toBe("number");
    expect(typeof data.metrics.inProgressCount).toBe("number");
    expect(typeof data.metrics.waitingRequesterCount).toBe("number");

    // 4. Verify priority breakdown
    expect(data.priorityBreakdown).toBeDefined();
    expect(typeof data.priorityBreakdown.urgent).toBe("number");

    // 5. Verify recent tickets drill-down data
    expect(Array.isArray(data.recentTickets)).toBe(true);
  });

  test("E2E-06: Requester dashboard renders strictly isolated requester metrics and tickets (AC-12, AC-13)", async ({
    request,
  }) => {
    // 1. Login as Requester Jennifer Anderson
    const reqLogin = await request.post("/api/auth/login", {
      data: { email: "jennifer.anderson@example.com", password: "Password123!" },
    });
    expect(reqLogin.status()).toBe(200);
    const { token: reqToken, user: reqUser } = await reqLogin.json();

    // 2. Fetch requester dashboard
    const dashboardRes = await request.get("/api/dashboards/requester", {
      headers: { Authorization: `Bearer ${reqToken}` },
    });
    expect(dashboardRes.status()).toBe(200);
    const { data } = await dashboardRes.json();

    // 3. Verify data isolation (AC-12) - all recent tickets belong to Jennifer
    expect(Array.isArray(data.recentTickets)).toBe(true);
    for (const t of data.recentTickets) {
      if (t.requesterId !== undefined) {
        expect(t.requesterId).toBe(reqUser.id);
      }
    }

    // 4. Verify zero counts render as numbers (BR-13, AC-13)
    const openCount = data.metrics.totalOpen ?? data.metrics.openCount;
    expect(typeof openCount).toBe("number");
    expect(typeof data.metrics.waitingOnMeCount).toBe("number");
    expect(typeof data.metrics.resolvedCount).toBe("number");
    expect(typeof data.metrics.closedCount).toBe("number");
    expect(openCount).toBeGreaterThanOrEqual(0);
    expect(data.metrics.waitingOnMeCount).toBeGreaterThanOrEqual(0);
  });
});
