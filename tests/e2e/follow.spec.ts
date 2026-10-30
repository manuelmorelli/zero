import { test, expect } from "@playwright/test";
import { addBetaCookie, apiSignUp, deleteTestUser, findFollow, markEmailVerified, setUsername, uniqueEmail, uniqueUsername } from "./helpers";

test.describe("follow a profile", () => {
  let followerId: string;
  let followeeId: string;

  test.afterEach(() => {
    if (followerId) deleteTestUser(followerId);
    if (followeeId) deleteTestUser(followeeId);
  });

  test("follow and then unfollow through the profile button", async ({ page, request, context, baseURL }) => {
    const followerEmail = uniqueEmail("follower");
    const followerPassword = "Sup3rSecret!";
    const follower = await apiSignUp(request, { name: "E2E Follower", email: followerEmail, password: followerPassword });
    followerId = follower.id;
    markEmailVerified(followerEmail);

    const followee = await apiSignUp(request, { name: "E2E Followee", email: uniqueEmail("followee"), password: "Sup3rSecret!" });
    followeeId = followee.id;
    const followeeUsername = uniqueUsername("target");
    setUsername(followeeId, followeeUsername);

    await addBetaCookie(context, baseURL!);
    await page.goto("/login");
    await page.locator("#email").fill(followerEmail);
    await page.locator("#password").fill(followerPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto(`/profile/${followeeUsername}`);
    const followButton = page.getByRole("button", { name: "Follow", exact: true });
    await followButton.click();
    await expect(page.getByRole("button", { name: "Following", exact: true })).toBeVisible();

    expect(findFollow(followerId, followeeId)).not.toBeNull();

    await page.getByRole("button", { name: "Following", exact: true }).click();
    await expect(page.getByRole("button", { name: "Follow", exact: true })).toBeVisible();
  });
});
