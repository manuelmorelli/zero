import { test, expect } from "@playwright/test";
import { addBetaCookie, apiSignUp, deleteTestUser, findUserByEmail, markEmailVerified, uniqueEmail, TEST_DATE_OF_BIRTH } from "./helpers";

test.describe("registration through the real UI", () => {
  let email: string;

  test.beforeEach(async ({ context, baseURL }) => {
    await addBetaCookie(context, baseURL!);
  });

  test.afterEach(() => {
    if (!email) return;
    try {
      const user = findUserByEmail(email);
      deleteTestUser(user.id);
    } catch {
      // registrazione mai arrivata in fondo (es. assert falso sopra): niente da cancellare
    }
  });

  test("creates the account and blocks login until the email is confirmed", async ({ page }) => {
    email = uniqueEmail("register");

    await page.goto("/register");
    await page.locator("#name").fill("E2E Register");
    await page.locator("#email").fill(email);
    await page.locator("#dateOfBirth").fill(TEST_DATE_OF_BIRTH);
    await page.locator("#password").fill("Sup3rSecret!");
    await page.locator("#confirmPassword").fill("Sup3rSecret!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Account created!")).toBeVisible();

    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Sup3rSecret!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/not verified/i)).toBeVisible();
  });
});

test.describe("login once the email is verified", () => {
  let userId: string;

  test.beforeEach(async ({ context, baseURL }) => {
    await addBetaCookie(context, baseURL!);
  });

  test.afterEach(async () => {
    if (userId) await deleteTestUser(userId);
  });

  test("logs in and reaches a page reserved to signed-in users", async ({ page, request }) => {
    const email = uniqueEmail("login");
    const password = "Sup3rSecret!";
    const user = await apiSignUp(request, { name: "E2E Login", email, password });
    userId = user.id;
    await markEmailVerified(email);

    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/$/);

    await page.goto("/dashboard/journeys/new");
    await expect(page).toHaveURL(/\/dashboard\/journeys\/new$/);
  });
});
