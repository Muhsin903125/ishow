import { expect, test } from "@playwright/test";

test("demo login enters the authenticated redirect state", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Trainer" }).click();
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Opening your dashboard")).toBeVisible();
});
