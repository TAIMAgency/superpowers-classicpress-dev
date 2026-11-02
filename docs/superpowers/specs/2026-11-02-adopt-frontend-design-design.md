# Design: Adopt Anthropic's `frontend-design`, wire into `classicpress-dev`

Date: 2026-11-02. Status: **approved** (conversation-approval; short design
per brainstorming "small change").

## Intent & why

Agents styling ClassicPress theme CSS or plugin admin screens currently have
no visual-design training — they default to "AI slop" (generic fonts, timid
palettes, template layouts). We adopt Anthropic's `frontend-design`
(Apache-2.0, upstream-maintained at `anthropics/skills`) and connect it to
the ClassicPress methodology through the wiring we already shipped.

## Goals

1. Install `frontend-design` locally
   (`~/.config/opencode/skills/frontend-design/` — SKILL.md + its
   LICENSE.txt, kept intact per Apache-2.0 attribution).
2. One companion-map entry in
   `skills/classicpress-dev/references/companion-skill-map.md`: USE flag,
   Apache-2.0, verified date, "design is platform-agnostic; apply to classic
   theme CSS and plugin admin screens."
3. One §9 rules-of-engagement row in `skills/classicpress-dev/SKILL.md`
   ("distinctive visual design direction") → apply fully, but in classic
   PHP/CSS idioms — no React build pipelines, no block-pattern suggestions,
   and any font-loading must use core-safe enqueueing.

## Non-goals

No upstream content forked into our skill; no new sibling skill; no changes
to the OpenCode plugin, manifests, or packaging.

## Anti-goals

Creating the impression that design guidance ever sanctions block-editor
output for CP.

## Constraints

SKILL.md stays within its line budget (one table row); companion map keeps
the reference-don't-vendor rule (upstream is *referenced* even though the
*local install* legitimately carries its own LICENSE.txt); no placeholder
churn; `Requires CP`/version facts untouched.

## Approaches considered

1. **Adopt + wire in** — chosen: upstream-maintained quality,
   licensing-cleanest, smallest surface.
2. Integrate into our skill — rejected: permanent fork, drift maintenance,
   violates the one-domain-skill design.
3. Author `classicpress-design` sibling — rejected: duplicative authoring
   cost, mostly re-teaches the upstream.

## Left to the builder

Exact wording of the map entry and §9 row; install-time pinning note
("verified 2026-11-02, @main"); verification steps (skill discoverable; the
two wired files still parse).
