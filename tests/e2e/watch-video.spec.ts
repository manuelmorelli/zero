import { test, expect } from "@playwright/test";
import { addBetaCookie, findAnyWatchableEpisode } from "./helpers";

// Non crea dati: usa un episodio già pubblicato per davvero nel database di sviluppo, scelto al
// volo invece che per id fisso, così il test non si rompe se quel contenuto viene rimosso. Un
// video reale (file su R2) non viene caricato dai test per non scrivere ad ogni esecuzione sullo
// storage vero di Manuel.

test("opens a published episode and the player mounts with a real video", async ({ page, context, baseURL }) => {
  const episode = findAnyWatchableEpisode();

  test.skip(!episode, "No published episode with a video exists yet in the database.");
  if (!episode) return;

  await addBetaCookie(context, baseURL!);
  await page.goto(`/journeys/${episode.journeyId}/episodes/${episode.id}`);

  await expect(page.locator("video")).toBeVisible();
  await expect(page.locator("video")).toHaveAttribute("poster", /.+/);
});
