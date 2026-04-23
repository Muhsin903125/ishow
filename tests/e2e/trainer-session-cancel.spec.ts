import { expect, test } from "@playwright/test";

test("trainer demo flow cancels a session with a reason", async ({ page }) => {
  let sessionCancelled = false;
  let cancelReason = "";

  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "ishow_demo_auth",
      JSON.stringify({
        id: "00000000-bbbb-bbbb-bbbb-000000000000",
        name: "Trainer",
        email: "trainer@ishow.ae",
        role: "trainer",
      })
    );
  });
  await page.context().addCookies([
    {
      name: "ishow_demo_auth",
      value: "1",
      url: "http://localhost:3001",
    },
  ]);

  await page.route("**/api/trainer/workspace", async (route) => {
    const sessions = sessionCancelled
      ? [
          {
            id: "sess-1",
            userId: "client-1",
            trainerId: "00000000-bbbb-bbbb-bbbb-000000000000",
            title: "Upper Body Session",
            scheduledDate: "2026-04-24",
            scheduledTime: "09:00",
            duration: 60,
            status: "cancelled",
            cancelReason,
            createdAt: "2026-04-22T10:00:00.000Z",
          },
        ]
      : [
          {
            id: "sess-1",
            userId: "client-1",
            trainerId: "00000000-bbbb-bbbb-bbbb-000000000000",
            title: "Upper Body Session",
            scheduledDate: "2026-04-24",
            scheduledTime: "09:00",
            duration: 60,
            status: "scheduled",
            createdAt: "2026-04-22T10:00:00.000Z",
          },
        ];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        clients: [
          {
            id: "client-1",
            name: "Aisha Client",
            role: "customer",
            createdAt: "2026-04-01T09:00:00.000Z",
          },
        ],
        pendingAssessments: [],
        sessions,
        programs: [],
        payments: [],
        exercises: [],
      }),
    });
  });

  await page.route("**/api/sessions/sess-1", async (route) => {
    const payload = JSON.parse(route.request().postData() ?? "{}") as {
      session?: { status?: string; cancelReason?: string };
    };

    expect(payload.session?.status).toBe("cancelled");
    expect(payload.session?.cancelReason).toBeTruthy();

    sessionCancelled = true;
    cancelReason = payload.session?.cancelReason ?? "";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        session: {
          id: "sess-1",
          userId: "client-1",
          trainerId: "00000000-bbbb-bbbb-bbbb-000000000000",
          title: "Upper Body Session",
          scheduledDate: "2026-04-24",
          scheduledTime: "09:00",
          duration: 60,
          status: "cancelled",
          cancelReason,
          createdAt: "2026-04-22T10:00:00.000Z",
        },
      }),
    });
  });

  await page.goto("/trainer/sessions?demo=1");

  page.once("dialog", (dialog) => dialog.accept("Client travelling for work"));
  await page.getByTitle("Cancel").first().click();

  await expect(page.getByText("No Active Deployments")).toBeVisible();
  await expect(page.getByText("Client travelling for work")).toBeVisible();
});
