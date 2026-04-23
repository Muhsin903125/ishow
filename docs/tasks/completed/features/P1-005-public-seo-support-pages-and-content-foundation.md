---
id: P1-005
type: feature
priority: p1-high
status: completed
module: public-seo
---

# P1-005 - Public SEO Support Pages and Content Foundation

## Summary

Add a set of general public-facing pages that strengthen trust, AI discoverability, and organic SEO around the core landing page.

## Problem / Background

The current public surface is too thin. Outside the homepage, the repo mainly exposes product/auth pages plus legal pages like privacy and terms.

That makes the site weaker for:

- search coverage
- entity/trust signals
- AI retrieval and summarization
- internal linking
- long-tail local-intent queries

The website should include multiple general supporting pages such as `about`, `contact`, and content pages, so the brand is not forced to carry all trust and discoverability on the homepage alone.

## Acceptance Criteria

- [x] an `About` page explains the coach, philosophy, service area, and brand story
- [x] a `Contact` page exists with clear consultation/contact pathways
- [x] an `FAQ` page addresses core objections and service questions
- [x] a content foundation exists, at minimum a `Content` or `Blog` index page with a reusable article layout strategy
- [x] public pages use consistent metadata, headings, and internal linking for SEO
- [x] page templates are written for human trust first, but remain structured enough for AI retrieval and summaries

## Affected Files

- `src/pages/about.tsx`
- `src/pages/contact.tsx`
- `src/pages/faq.tsx`
- `src/pages/content/index.tsx`
- `src/pages/content/[slug].tsx`
- `src/components/Navbar.tsx`
- `src/pages/_document.tsx`

## Notes

- Keep these pages simple, credible, and text-rich enough to support AI and SEO.
- Do not create empty SEO filler. Every page should serve a real user purpose.
- Strong early topics for content pages:
- fat loss coaching in Dubai
- online personal training in UAE
- accountability and habit coaching
- beginner gym confidence
- strength training for busy professionals
