---
title: Product Review
doc_id: 98-product-review
version: "2.0"
status: living
related_docs:
  - 07_Creator_Experience
  - 14_UI_Pages
  - 15_Design_System
  - 99_Current_Project_Status
---

# Product Review

Elenco compatto dei miglioramenti (non bug) emersi dall'uso reale di Zero, da tenere vivo fino alla V1. ☐ da fare, ☑ fatto. Le voci si spostano tra categorie o priorità quando serve, non si eliminano mai.

## UX

☑ [High] Add show/hide password (eye icon) to every password field.
☑ [High] Ask for confirmation before deleting a Journey — done, real dialog with explicit warning text (`JourneyForm.tsx`/`JourneyCardMenu.tsx`).
☑ [High] Ask for confirmation before deleting a Chapter or an Episode — re-checked 2026-09-04: both already have a real confirmation dialog with explicit warning text (`ChapterEditButton.tsx`, `EpisodeItem.tsx`). The 2026-08-24 note above was stale.
☑ [High] Verify and improve drag & drop for Chapters — checked 2026-09-04: Chapters are already sortable (`useSortable`, drag handle, same mechanism as Episodes), confirmed working by Manuel.
☑ [High] ~~Add Back navigation inside internal pages~~ — reversed on Manuel's request: all Back buttons removed instead (see 99_Current_Project_Status.md).
☑ [Medium] Reduce the number of clicks required to complete common actions — reviewed 2026-09-07: the only real waste was the "Add episode" dialog defaulting to Draft even after a successful video upload, requiring a manual "Published" checkbox click (`EpisodeForm.tsx`, fixed). The floating "+" quick-upload and Update publishing flows (3-5 clicks) are physiologically necessary — picking a content type, a title — not waste. The Settings toggle + explicit "Save changes" click is intentional, matching industry standard for preference forms.
☑ [Medium] Improve transitions and overall navigation fluidity — reviewed 2026-09-07: Manuel confirmed the page-to-page transition itself is fine as-is, no work needed there. The real issue was profile photos (cover, avatar, Journey cards) showing empty/gray space while loading from R2 — fixed with a shared `FadeImage` component (pulsing skeleton + fade-in), wired into `ProfileHero`, `ProfileAvatarStory` and `ContentCard`.
☑ [Medium] Add an explanation for the Trust Score on the public Profile (there was none) — done 2026-09-07: click/tap-to-open panel shared with the existing inline badge (`TrustScorePanel.tsx`), closes via a visible X, click-outside or Esc. Rendered through a portal so it never ends up hidden behind the Overview/Journeys tab bar below it.
☑ [Low] Make it obvious that Trust Score/Followers/Following are clickable — done 2026-09-07: same hover effect already used on photo cards (scale up + brightness), instead of adding an extra icon.
☑ [Low] Add a visible close (X) button inside the side menu panel itself, not just the hamburger button that already toggled into one — done 2026-09-07.

## Creator Experience

☑ [High] Redesign the Creator Dashboard to make it feel like the creator's control center instead of a simple list — done, Fase 5 of `97_Lovable_Redesign_Checklist.md` (Journey grid, real stats panel, real delete, unified drag & drop). Only gap left: never visually verified with a real authenticated browser session (longstanding limitation, not unfinished work).
☑ [High] Improve the Public Profile with a richer layout and better presentation of the creator.
☑ [Medium] Add profile avatar.
☑ [Medium] Add profile cover image.
☑ [Medium] Improve Journey presentation inside the profile — done, Fase 3 of `97_Lovable_Redesign_Checklist.md` (dedicated `ContentCard`, restructured Overview).
☑ [Medium] Improve Episode presentation inside Journeys — done, episode rows aligned to the Lovable glass style; the one real content gap left (missing duration) is tracked separately below.
☑ [Medium] Improve overall visual hierarchy of creator pages — done 2026-08-24: draft-episode count on the Dashboard Journey grid now stands out in ember (was blended into the same muted line as chapter/episode counts, despite being the one actionable number); the status badge on the Journey management page now uses the same ember-for-live styling as the Dashboard grid (was flat gray in every state, inconsistent with the grid's own badge). Small, contained change — no new components, no database changes.
☑ [Medium] Show episode duration on the public Journey page's episode rows — done; also repositioned below the title/other episode metadata instead of at the far right of the row (was colliding with the floating chat/notification/+ buttons), 2026-09-04.
☑ [Medium] Review all edit options available after publishing — Journey, Episode, Chapter, image and video uploads. Manuel wants creators to have as much freedom as possible to edit content even after it has been posted, not only while in draft. For personal images (avatar, cover, etc.) this should include a real positioning editor: move, zoom in/out, flip — a level of control other social platforms don't offer. Raised by Manuel 2026-09-06; partial progress 2026-09-07 (zoom out added to the existing crop editor, `ImageCropper.tsx`, min zoom 0.5 instead of 1-only-in, for Journey cover, avatar and profile cover — move was already free on both axes). Manuel confirmed done as-is on 2026-09-07.

## Upload

☑ [High] Replace the temporary Video URL workflow with real video uploads.
☑ [High] Support uploads from desktop and mobile devices — a standard file picker, works on both by construction; not yet tried on a real phone.
☑ [Medium] Design the future upload experience (progress, processing state, error handling) — done for both video and episode cover (`EpisodeForm.tsx`: live % progress, format/size validation, error messages).
☑ [Medium] Add Episode thumbnail support — done (`EpisodeForm.tsx`, `posterKey`/`posterPreview`, real R2 upload); Journey cover is used as fallback when not set.

## Updates

☑ [Medium] Group multiple simultaneous Updates from the same creator instead of showing them as separate cards — already true by construction: the Stories row groups by creator (`storiesByCreator` map in `lib/discovery/stories.ts`), one circle per creator regardless of how many active Updates they have. The old card-based Home Feed this item originally referred to no longer exists (removed 2026-08-18, confirmed with Manuel — see `97_Lovable_Redesign_Checklist.md`).
☑ [Medium] Add a live character counter to the Update composer (500-character limit) so creators can see remaining space while typing — done 2026-09-06, `QuickUploadButton.tsx` (`CharCount`), red warning under 20 characters left.
☑ [Medium] Ask for confirmation before deleting an Update — done 2026-08-22. The Dashboard delete list this item originally referred to no longer exists (see "Ultimo task completato" in 99_Current_Project_Status.md); deleting now happens from the Update viewer itself (StoryViewer, owner-only), gated by a native confirm dialog.
☑ [Medium] Update viewer (StoryViewer) background is pure black, too close to the rest of the site's dark background — done: the overlay now uses a radial gradient (surface color fading to the base background) behind the card instead of a flat black backdrop.

## Navigation

☑ [Medium] Improve navigation consistency across the application — re-checked 2026-09-04: felt fine to Manuel already; confirmed done, no further review needed, on 2026-09-07.

## Product Decisions

☑ [Medium] Show only the publication date of Episodes (do not display a separate "Recorded" date) — checked 2026-09-04: no dual-date display exists anywhere (only `occurredAt` is shown, no separate "Recorded" label), so the described problem isn't present.
☑ [Medium] Review the future Creator Settings experience before adding more account features — done 2026-09-04: new `/settings/creator` page (new-follower notification toggle, link to the Dashboard, payouts placeholder).
☑ [Medium] Show a welcome message once registration completes — Manuel confirmed 2026-09-04 that the existing "Welcome to Zero, {name}" title on the Onboarding page is sufficient; no separate Home banner needed.
☑ [Low] Sort categories alphabetically in `lib/constants/categories.ts` (single source of truth used everywhere; keep "Other" pinned last) — checked 2026-09-04: already alphabetical, with "Other" pinned last.

## Design

☑ [High] Align the interface with the Lovable design prototype — done, all 5 phases of `97_Lovable_Redesign_Checklist.md` closed and committed (checked 2026-08-24).
☑ [Medium] Improve spacing, typography, cards, empty states and visual consistency across the application — done 2026-09-04: page titles, section headings, empty-state cards and container widths unified across Settings/Dashboard/Journeys/Journeyers/Search/Profile/Discover toward the most compact style already present in the site, no in-between sizes invented.
☑ [Medium] Review all pages for a more modern and premium appearance — open as of 2026-09-04, confirmed done by Manuel on 2026-09-07 (includes the sitewide ~15% scale reduction and title-size fixes across Home/Journeys/Journeyers/Profile/Journey page).
☑ [Medium] Review color alternation across the site (which background shade — `bg`/`surface`/`surface-2` — follows which) — done 2026-09-06: fixed inconsistent glass (`bg-white/*`) backgrounds outside the bg/surface/surface-2 scale on Profile (`AboutCard`), Home (`HowItWorksCta`) and Journey detail (hero card, episode rows); aligned Settings text inputs and Dashboard empty-states to `surface-2` where they were flattened against their `surface` container (commit `fe29b89`). Glass kept where it overlays a photo (Hero quote, Journey card status badge) — that usage is intentional, not an inconsistency.
☑ [Medium] Review Home payoff/copy — confirmed done by Manuel on 2026-09-07, no copy changes needed.
☑ [Medium] Design a mechanism to select real Journeys/creators for the Hero rotation, replacing the 4 fake demo slides in `lib/demo/heroSlides.ts` — done 2026-09-07: `getHeroJourneys()` (`lib/discovery/heroJourneys.ts`) reuses the Journey Score ranking that already powers "Top Journeys", limited to Journeys (Published or Discovery) with a real cover photo; each slide is clickable and links to its Journey, showing title/category/creator instead of the old fake quote. The 4 demo slides remain as an automatic fallback only when no real Journey with a cover exists yet.
☑ [Medium] Extend the "orange glass" card style (already used on What is Zero) to the public Profile's other glass containers — done 2026-09-07: Bio card, stats bar, Overview/Journeys tabs, Edit profile/Dashboard/Share/Follow/Message buttons. The white/neutral glass elsewhere in the site (Landing Hero, Update reactions, episode chips) hasn't been touched yet.

## General

☐ [High] Continuously simplify the product by reducing friction and unnecessary actions.
☐ [High] Every new feature must be evaluated not only technically but also from the user's point of view.
☐ [Medium] When implementing future features, always verify whether the user flow can be made simpler before adding functionality.

## Documentation

☑ [Medium] `99_Current_Project_Status.md` listed profile-photo upload, Journey Page ("Fase 2"), Profile Page ("Fase 3") and Dashboard ("Fase 5") redesign as not-yet-done — all four were already shipped. Corrected 2026-08-24 (`97_Lovable_Redesign_Checklist.md` itself had no such stale claims, only `99` did).

## Nota

Esiste già un prototipo grafico realizzato con Lovable: sarà il riferimento visivo per il redesign dell'interfaccia, adattato alle decisioni di prodotto prese durante lo sviluppo.
