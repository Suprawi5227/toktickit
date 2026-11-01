import { test, expect } from "@playwright/test";

test.describe("Lab 4 Actions Taken Work Log E2E Flow", () => {
  test("E2E-01: IT Staff logs action taken, collaborative staff adds follow-up, verified in ticket log (AC-01, AC-02, AC-05)", async ({
    request,
  }) => {
    // 1. Login as Staff A (Kevin Patel)
    const loginResA = await request.post("/api/auth/login", {
      data: { email: "kevin.patel@toktickit.com", password: "Password123!" },
    });
    expect(loginResA.status()).toBe(200);
    const { token: tokenA, user: userA } = await loginResA.json();

    // 2. Staff A creates Action Taken on Ticket #1 (AC-01, AC-02)
    const createResA = await request.post("/api/tickets/1/actions-taken", {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: {
        description: "Replaced faulty fan and cleaned heat sink",
        result: "Thermal throttling resolved, fan operating silently",
        followUpRequired: true,
        followUpNote: "Inspect fan RPM and temperature log in 7 days",
      },
    });
    expect(createResA.status()).toBe(201);
    const actionA = (await createResA.json()).data;
    expect(actionA.performedById).toBe(userA.id);
    expect(actionA.followUpRequired).toBe(true);
    expect(actionA.followUpNote).toBe("Inspect fan RPM and temperature log in 7 days");

    // 3. Login as Staff B (Lisa Martinez) - Collaborative Staff (AC-05)
    const loginResB = await request.post("/api/auth/login", {
      data: { email: "lisa.martinez@toktickit.com", password: "Password123!" },
    });
    expect(loginResB.status()).toBe(200);
    const { token: tokenB, user: userB } = await loginResB.json();

    // 4. Staff B logs collaborative follow-up action on the same ticket
    const createResB = await request.post("/api/tickets/1/actions-taken", {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: {
        description: "Collaborative inspection: thermal sensor reading checked",
        result: "Temperatures within normal operational threshold",
        followUpRequired: false,
      },
    });
    expect(createResB.status()).toBe(201);
    const actionB = (await createResB.json()).data;
    expect(actionB.performedById).toBe(userB.id);

    // 5. Verify ticket log contains both actions with appropriate performer attribution
    const fetchRes = await request.get("/api/tickets/1/actions-taken", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(fetchRes.status()).toBe(200);
    const actions = (await fetchRes.json()).data;
    const ids = actions.map((a: any) => a.id);
    expect(ids).toContain(actionA.id);
    expect(ids).toContain(actionB.id);

    const retrievedA = actions.find((a: any) => a.id === actionA.id);
    const retrievedB = actions.find((a: any) => a.id === actionB.id);
    expect(retrievedA.performedBy.name).toBe("Kevin Patel (IT Support)");
    expect(retrievedB.performedBy.name).toBe("Lisa Martinez (IT Support)");
  });

  test("E2E-02: Requester sees read-only actions taken and cannot access action form (AC-03, AC-04)", async ({
    request,
  }) => {
    // 1. Login as Requester Jennifer Anderson (ticket #1 requester)
    const reqLogin = await request.post("/api/auth/login", {
      data: { email: "jennifer.anderson@example.com", password: "Password123!" },
    });
    expect(reqLogin.status()).toBe(200);
    const { token: reqToken } = await reqLogin.json();

    // 2. Fetch actions on owned ticket #1 -> 200 OK (read-only view) (AC-04)
    const fetchOwnRes = await request.get("/api/tickets/1/actions-taken", {
      headers: { Authorization: `Bearer ${reqToken}` },
    });
    expect(fetchOwnRes.status()).toBe(200);
    const actions = (await fetchOwnRes.json()).data;
    expect(Array.isArray(actions)).toBe(true);

    // 3. Attempt to create Action Taken as requester -> 403 Forbidden (AC-03)
    const createAttempt = await request.post("/api/tickets/1/actions-taken", {
      headers: { Authorization: `Bearer ${reqToken}` },
      data: {
        description: "Requester trying to add action",
        result: "Should be blocked by resolution and action gate",
      },
    });
    expect(createAttempt.status()).toBe(403);

    // 4. Attempt to view actions on unowned ticket #2 -> 403 Forbidden (AC-04)
    const fetchUnownedRes = await request.get("/api/tickets/2/actions-taken", {
      headers: { Authorization: `Bearer ${reqToken}` },
    });
    expect(fetchUnownedRes.status()).toBe(403);
  });
});
