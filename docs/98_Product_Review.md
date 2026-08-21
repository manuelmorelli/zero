---
title: Product Review
doc_id: 98-product-review
version: "1.3"
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
☐ [High] Ask for confirmation before deleting Journeys, Chapters and Episodes.
☐ [High] Verify and improve drag & drop for Chapters.
☑ [High] ~~Add Back navigation inside internal pages~~ — reversed on Manuel's request: all Back buttons removed instead (see 99_Current_Project_Status.md).
☐ [Medium] Reduce the number of clicks required to complete common actions.
☐ [Medium] Improve transitions and overall navigation fluidity.

## Creator Experience

☐ [High] Redesign the Account page. The current page contains almost no useful information and feels like an unnecessary intermediate step.
☐ [High] Redesign the Creator Dashboard to make it feel like the creator's control center instead of a simple list.
☑ [High] Improve the Public Profile with a richer layout and better presentation of the creator.
☑ [Medium] Add profile avatar.
☑ [Medium] Add profile cover image.
☐ [Medium] Improve Journey presentation inside the profile.
☐ [Medium] Improve Episode presentation inside Journeys.
☐ [Medium] Improve overall visual hierarchy of creator pages.

## Upload

☑ [High] Replace the temporary Video URL workflow with real video uploads.
☐ [High] Support uploads from desktop and mobile devices.
☐ [Medium] Design the future upload experience (progress, processing state, error handling).
☐ [Medium] Add Episode thumbnail support.

## Feed

☐ [Medium] Improve the Feed layout once enough real content exists.
☐ [Medium] Design empty states for users with little or no content.

## Updates

☐ [High] Manuel reported (2026-08-21) that the "X" close button on the Update viewer (StoryViewer) doesn't close it for him — size was fine, so not a hit-target issue. Not reproduced yet with an automated two-account test (voted on a poll, X worked every time in that test). Root cause still unknown; investigate further in a dedicated session before attempting a fix blind.
☐ [Medium] Group or visually distinguish multiple simultaneous Updates from the same creator in the Home feed, instead of showing them as unrelated separate cards.
☐ [Medium] Add a live character counter to the Update composer (500-character limit) so creators can see remaining space while typing.
☐ [Medium] Ask for confirmation before deleting an Update from the Dashboard (currently deletes immediately, no confirmation — same gap already tracked for Journeys/Chapters/Episodes above).

## Navigation

☐ [Medium] Review whether the current Account page should remain a dedicated page or become part of Settings.
☐ [Medium] Improve navigation consistency across the application.

## Product Decisions

☐ [Medium] Show only the publication date of Episodes (do not display a separate "Recorded" date).
☐ [Medium] Review the future Creator Settings experience before adding more account features.

## Design

☐ [High] Align the interface with the Lovable design prototype that will become the visual reference for Zero.
☐ [Medium] Improve spacing, typography, cards, empty states and visual consistency across the application.
☐ [Medium] Review all pages for a more modern and premium appearance.

## General

☐ [High] Continuously simplify the product by reducing friction and unnecessary actions.
☐ [High] Every new feature must be evaluated not only technically but also from the user's point of view.
☐ [Medium] When implementing future features, always verify whether the user flow can be made simpler before adding functionality.

## Nota

Esiste già un prototipo grafico realizzato con Lovable: sarà il riferimento visivo per il redesign dell'interfaccia, adattato alle decisioni di prodotto prese durante lo sviluppo.
