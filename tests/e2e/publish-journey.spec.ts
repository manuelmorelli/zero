import { test, expect } from "@playwright/test";
import {
  addBetaCookie,
  apiSignUp,
  createDraftJourney,
  createPublishedEpisode,
  deleteTestUser,
  getCreatorByUserId,
  getJourneyStatus,
  makeIncompleteProfile,
  makePublishReady,
  uniqueEmail,
  uniqueUsername,
} from "./helpers";

// La pubblicazione vera richiederebbe un video reale caricato tramite R2 (EpisodeVideoField):
// per non scrivere su quello storage ad ogni esecuzione, il Journey e l'Episodio di partenza
// vengono creati direttamente nel database. Il pulsante "Publish" e la sua logica di controllo
// (lib/actions/journey.ts publishJourney) sono invece quelli veri, azionati dal browser.

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe("publish a Journey", () => {
  let userId: string;

  test.beforeEach(async ({ context, baseURL }) => {
    await addBetaCookie(context, baseURL!);
  });

  test.afterEach(() => {
    if (userId) deleteTestUser(userId);
  });

  test("publishes once every requirement is met", async ({ page, request }) => {
    const email = uniqueEmail("publish");
    const password = "Sup3rSecret!";
    const user = await apiSignUp(request, { name: "E2E Publisher", email, password, creatorMode: true });
    userId = user.id;
    makePublishReady(userId, uniqueUsername("publisher"));

    const creator = getCreatorByUserId(userId);
    const journey = createDraftJourney(creator.id, "E2E Journey", "A short test description.");
    createPublishedEpisode(journey.id, "E2E Episode");

    await loginAs(page, email, password);
    await page.goto(`/dashboard/journeys/${journey.id}`);
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page.getByRole("link", { name: "View Public Page" })).toBeVisible();
    expect(getJourneyStatus(journey.id)).not.toBe("DRAFT");
  });

  test("blocks publishing and explains what's missing", async ({ page, request }) => {
    const email = uniqueEmail("incomplete");
    const password = "Sup3rSecret!";
    const user = await apiSignUp(request, { name: "E2E Incomplete", email, password, creatorMode: true });
    userId = user.id;

    // Profilo completo ma senza video di presentazione né Community Guidelines accettate:
    // getPublishReadiness deve bloccare la pubblicazione su questi due requisiti.
    const creator = makeIncompleteProfile(userId, uniqueUsername("incomplete"));
    const journey = createDraftJourney(creator.id, "E2E Journey", "A short test description.");
    createPublishedEpisode(journey.id, "E2E Episode");

    await loginAs(page, email, password);
    await page.goto(`/dashboard/journeys/${journey.id}`);
    await page.getByRole("button", { name: "Publish" }).click();

    const publishError = page.locator("p.text-danger");
    await expect(publishError).toContainText("your presentation video");
    await expect(publishError).toContainText("acceptance of the Community Guidelines");
    expect(getJourneyStatus(journey.id)).toBe("DRAFT");
  });
});
