// e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("la home arranca y sirve el stub de NarrARA", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "NarrARA" })).toBeVisible();
});
