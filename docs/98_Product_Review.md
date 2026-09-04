---
title: Product Review
doc_id: 98-product-review
version: "1.8"
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
☐ [Medium] Reduce the number of clicks required to complete common actions.
☐ [Medium] Improve transitions and overall navigation fluidity.

## Creator Experience

☑ [High] Redesign the Creator Dashboard to make it feel like the creator's control center instead of a simple list — done, Fase 5 of `97_Lovable_Redesign_Checklist.md` (Journey grid, real stats panel, real delete, unified drag & drop). Only gap left: never visually verified with a real authenticated browser session (longstanding limitation, not unfinished work).
☑ [High] Improve the Public Profile with a richer layout and better presentation of the creator.
☑ [Medium] Add profile avatar.
☑ [Medium] Add profile cover image.
☑ [Medium] Improve Journey presentation inside the profile — done, Fase 3 of `97_Lovable_Redesign_Checklist.md` (dedicated `ContentCard`, restructured Overview).
☑ [Medium] Improve Episode presentation inside Journeys — done, episode rows aligned to the Lovable glass style; the one real content gap left (missing duration) is tracked separately below.
☑ [Medium] Improve overall visual hierarchy of creator pages — done 2026-08-24: draft-episode count on the Dashboard Journey grid now stands out in ember (was blended into the same muted line as chapter/episode counts, despite being the one actionable number); the status badge on the Journey management page now uses the same ember-for-live styling as the Dashboard grid (was flat gray in every state, inconsistent with the grid's own badge). Small, contained change — no new components, no database changes.
☑ [Medium] Show episode duration on the public Journey page's episode rows — done; also repositioned below the title/other episode metadata instead of at the far right of the row (was colliding with the floating chat/notification/+ buttons), 2026-09-04.

## Upload

☑ [High] Replace the temporary Video URL workflow with real video uploads.
☑ [High] Support uploads from desktop and mobile devices — a standard file picker, works on both by construction; not yet tried on a real phone.
☑ [Medium] Design the future upload experience (progress, processing state, error handling) — done for both video and episode cover (`EpisodeForm.tsx`: live % progress, format/size validation, error messages).
☑ [Medium] Add Episode thumbnail support — done (`EpisodeForm.tsx`, `posterKey`/`posterPreview`, real R2 upload); Journey cover is used as fallback when not set.

## Updates

☑ [Medium] Group multiple simultaneous Updates from the same creator instead of showing them as separate cards — already true by construction: the Stories row groups by creator (`storiesByCreator` map in `lib/discovery/stories.ts`), one circle per creator regardless of how many active Updates they have. The old card-based Home Feed this item originally referred to no longer exists (removed 2026-08-18, confirmed with Manuel — see `97_Lovable_Redesign_Checklist.md`).
☐ [Medium] Add a live character counter to the Update composer (500-character limit) so creators can see remaining space while typing.
☑ [Medium] Ask for confirmation before deleting an Update — done 2026-08-22. The Dashboard delete list this item originally referred to no longer exists (see "Ultimo task completato" in 99_Current_Project_Status.md); deleting now happens from the Update viewer itself (StoryViewer, owner-only), gated by a native confirm dialog.
☑ [Medium] Update viewer (StoryViewer) background is pure black, too close to the rest of the site's dark background — done: the overlay now uses a radial gradient (surface color fading to the base background) behind the card instead of a flat black backdrop.

## Navigation

☐ [Medium] Improve navigation consistency across the application — re-checked 2026-09-04: feels fine to Manuel today, kept open pending a more thorough joint review to pin down what (if anything) still needs work.

## Product Decisions

☑ [Medium] Show only the publication date of Episodes (do not display a separate "Recorded" date) — checked 2026-09-04: no dual-date display exists anywhere (only `occurredAt` is shown, no separate "Recorded" label), so the described problem isn't present.
☑ [Medium] Review the future Creator Settings experience before adding more account features — done 2026-09-04: new `/settings/creator` page (new-follower notification toggle, link to the Dashboard, payouts placeholder).
☑ [Medium] Show a welcome message once registration completes — Manuel confirmed 2026-09-04 that the existing "Welcome to Zero, {name}" title on the Onboarding page is sufficient; no separate Home banner needed.
☑ [Low] Sort categories alphabetically in `lib/constants/categories.ts` (single source of truth used everywhere; keep "Other" pinned last) — checked 2026-09-04: already alphabetical, with "Other" pinned last.

## Design

☑ [High] Align the interface with the Lovable design prototype — done, all 5 phases of `97_Lovable_Redesign_Checklist.md` closed and committed (checked 2026-08-24).
☑ [Medium] Improve spacing, typography, cards, empty states and visual consistency across the application — done 2026-09-04: page titles, section headings, empty-state cards and container widths unified across Settings/Dashboard/Journeys/Journeyers/Search/Profile/Discover toward the most compact style already present in the site, no in-between sizes invented.
☐ [Medium] Review all pages for a more modern and premium appearance — still open, re-confirmed by Manuel 2026-09-04.
☐ [Medium] Review color alternation across the site (which background shade — `bg`/`surface`/`surface-2` — follows which) — raised by Manuel 2026-09-04, not designed in detail yet.
☐ [Medium] Review Home payoff/copy (no decisions taken yet on which lines to change).
☐ [Medium] Design a mechanism to select real Journeys/creators for the Hero rotation, replacing the 4 fake demo slides in `lib/demo/heroSlides.ts` (starting idea: reuse the existing Journey Score ranking that already powers "Top Journeys", limited to Journeys with a cover photo — not designed in detail yet).

## General

☐ [High] Continuously simplify the product by reducing friction and unnecessary actions.
☐ [High] Every new feature must be evaluated not only technically but also from the user's point of view.
☐ [Medium] When implementing future features, always verify whether the user flow can be made simpler before adding functionality.

## Documentation

☑ [Medium] `99_Current_Project_Status.md` listed profile-photo upload, Journey Page ("Fase 2"), Profile Page ("Fase 3") and Dashboard ("Fase 5") redesign as not-yet-done — all four were already shipped. Corrected 2026-08-24 (`97_Lovable_Redesign_Checklist.md` itself had no such stale claims, only `99` did).

## Nota

Esiste già un prototipo grafico realizzato con Lovable: sarà il riferimento visivo per il redesign dell'interfaccia, adattato alle decisioni di prodotto prese durante lo sviluppo.
