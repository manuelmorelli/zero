import { test, expect } from "@playwright/test";

// Il cancello beta (proxy.ts) è acceso solo quando BETA_ACCESS_CODE è impostata: in sviluppo
// normale è spenta, quindi qui non c'è niente da testare finché Manuel non la attiva (prima di
// un invito a inviti chiusi). Il valore vero viene letto dallo stesso .env del server: non è un
// segreto inventato dal test.
const code = process.env.BETA_ACCESS_CODE;

test("blocks a visitor without the code and unlocks it with the real one", async ({ page }) => {
  test.skip(!code, "BETA_ACCESS_CODE non è impostata adesso: il cancello beta è spento.");

  await page.goto("/");
  await expect(page).toHaveURL(/\/beta-access$/);

  await page.locator("#code").fill("wrong-code");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.getByText("Codice non valido.")).toBeVisible();

  await page.locator("#code").fill(code!);
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/login");
  await expect(page).toHaveURL(/\/login$/);
});
