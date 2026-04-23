# iShow Landing Page Audit

> Audit completed: 2026-04-23
> External reference reviewed: `https://realfit.ae/`

---

## Audit Goal

Review the current iShow landing experience against a local-market competitor and turn the findings into concrete delivery tasks.

---

## Competitor Patterns Observed

`realfit.ae` leans on simple, high-intent service marketing instead of abstract product language. The most important patterns on the homepage are:

- direct geo-specific hero copy for Abu Dhabi and Dubai
- immediate consultation CTA
- visible transformation proof near the top of the page
- plain-language benefit cards explaining why to hire them
- a broad service/program grid
- pricing packages on the landing page
- trainer roster with years of experience
- review/testimonial block and contact form near the end

The content pattern is not especially premium, but it is very clear. It answers the main search-intent questions fast:

- who is this for?
- where do you operate?
- what results do you help with?
- what can I buy?
- how much does it cost?
- why should I trust you?

---

## Current iShow Strengths

- The site already has a stronger visual ceiling than the competitor with motion, video, and a sharper editorial tone.
- The hero, methodology, coach, and CTA structure gives us a premium foundation.
- A CMS-backed landing config already exists for hero, methodology, coach, capabilities, services, and testimonials.
- The product/app angle can become a differentiator if it supports the coaching story instead of replacing it.

---

## Current iShow Gaps

### 1. Messaging is too product-led for a fitness landing page

Current copy such as "A Unified Dashboard For Total Control" and "Execution Stays Visual" sounds closer to software marketing than high-conversion personal training copy.

### 2. Proof does not feel believable yet

The current results area is a stock-image gallery, not real proof. It does not create trust the way actual client stories, coach notes, milestones, pricing clarity, or trainer credibility would.

### 3. The page does not answer enough buyer questions

Compared with the competitor, iShow currently under-explains:

- program types
- pricing or package logic
- coach credentials and method depth
- what happens after signup
- objections and FAQs

It also lacks supporting public pages that help both SEO and trust, such as:

- about
- contact
- FAQ
- content/blog pages

### 4. The requested visual hook needs reframing

Using "old comparison images" less is the right instinct, but the replacement should stay respectful. We should avoid shame-based or humiliating body framing.

Better direction:

- a `wabi-sabi` editorial style: honest, imperfect, lived-in, less polished
- real-life confidence moments: walking into a gym, training in public, showing up socially, buying new clothes, returning to activity
- progress artifacts: coach notes, weekly check-ins, body-metric snapshots, habit streaks, schedule adherence
- transformation stories told as narrative cards instead of generic before/after collages

### 5. White-theme support is incomplete

The repo has `app-light` overrides in `src/styles/globals.css`, but the landing route uses `landing-page` instead of `app-light` in `src/pages/_app.tsx`. The design intent exists, but it is not active on the landing page.

---

## Current Implementation Issues

- `src/components/LandingClient.tsx` contains two sections with `id="coach"`, which can break anchor navigation and creates duplicated content.
- The landing page has mojibake in visible copy, including the subtitle and Dubai badge text.
- The page relies heavily on remote stock imagery and raw `<img>` tags instead of a more deliberate proof/media system.
- The CMS model does not currently cover pricing, FAQs, trust badges, proof-story modules, or partner logos.
- The landing page visual system is almost entirely dark, even though the repo already contains a partial light-surface foundation.

---

## Recommended Direction

### Content pattern

Rebuild the landing page around this order:

1. Search-intent hero for Dubai/UAE personal training
2. Outcome proof that feels human and specific
3. "Why clients choose iShow" differentiators
4. Coaching paths / packages
5. Coach credibility and method
6. Product/app support as a trust enhancer
7. Testimonials and FAQ
8. CTA and consultation capture

### Visual pattern

Use a warmer, lighter landing treatment instead of full black:

- ivory / chalk white main surfaces
- charcoal body text
- orange accents retained as the brand heat
- selective dark sections only where video or emphasis benefits from contrast
- organic photography and imperfect framing over glossy stock poses

### Proof pattern

Replace generic comparison imagery with:

- milestone cards
- real client quotes tied to specific outcomes
- weekly check-in snapshots
- "confidence in public again" lifestyle scenes
- side-by-side progress stories only when sourced, approved, and respectful

---

## Tasks Created From This Audit

- [BUG-004](../docs/tasks/completed/bugs/BUG-004-landing-page-structural-theme-regressions.md)
- [P0-004](../docs/tasks/completed/features/P0-004-landing-page-conversion-repositioning.md)
- [P1-004](features/P1-004-proof-driven-landing-storytelling.md)
- [P1-005](../docs/tasks/completed/features/P1-005-public-seo-support-pages-and-content-foundation.md)

---

## Notes

- Use competitor patterning for structure and buyer psychology, not for direct copy imitation.
- Any body-transformation media should remain consent-based, specific, and dignity-preserving.
- If we want white landing pages, that should be treated as a first-class art direction pass, not a color swap on the current dark composition.
