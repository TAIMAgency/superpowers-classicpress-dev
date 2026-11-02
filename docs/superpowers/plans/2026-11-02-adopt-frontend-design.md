# Adopt frontend-design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give agents visual-design capability for ClassicPress work by installing Anthropic's `frontend-design` skill locally and wiring it into `classicpress-dev` (companion map + one rules-of-engagement row).

**Architecture:** Two independent artifacts: (a) a local skill install (the user's `~/.config/opencode/skills/` directory, not the deliverable repo), (b) two documented edits in the `superpowers-classicpress-dev` repo that reference the upstream without embedding it. Task 2 needs nothing at runtime from Task 1, so the tasks are order-free, but both run in sequence for a single commit-and-push sweep.

**Tech Stack:** PowerShell verification (no node/bun on this machine); git; the `anthropics/skills` upstream (Apache-2.0).

**Spec:** `docs/superpowers/specs/2026-11-02-adopt-frontend-design-design.md` (same repo).

## Global Constraints

- Upstream content is never copied into the `superpowers-classicpress-dev` repo (companion-map rule: reference, don't vendor). The local install is a copy of upstream files *with their LICENSE.txt* — allowed by Apache-2.0, and it lives outside the repo.
- No banned model-tier strings (`haiku`/`sonnet`/`opus`) may appear in any touched file.
- One §9 row and one map entry — no other SKILL.md growth; the skill body stays well under its ~400-line budget.
- Upstream source pinned to @main as of 2026-11-02; the map entry records this date.
- Repo language style: match the existing tables/rows in both target files.

## Review Focus

- **Adopted skill must remain harness-triggerable:** after install, `SKILL.md` must have `---` frontmatter with non-empty `name` and `description` (a description under ~20 chars would fail trigger reliability). Pinned by Task 1 Step 3.
- **Attribution must survive the install:** `LICENSE.txt` (Apache-2.0 text) must sit alongside SKILL.md. Pinned by Task 1 Step 3.
- **§9 row must not sanction block-editor output or React pipelines for CP:** the row's ruling text must explicitly name the classic idioms. Pinned by Task 2 Step 2 (content inspection + grep).
- **No model-tier strings regress:** grep all touched files. Pinned by Task 2 Step 3.
- **Map stays a reference-only document:** the new map entry adds no skill body text, only a table row; the repo contains no `frontend-design` directory. Pinned by Task 2 Step 4.

---

### Task 1: Local install of `frontend-design`

**Files:**
- Create: `C:\Users\norechef\.config\opencode\skills\frontend-design\SKILL.md` (verbatim upstream copy)
- Create: `C:\Users\norechef\.config\opencode\skills\frontend-design\LICENSE.txt` (verbatim upstream copy)

**Interfaces:**
- Consumes: upstream raw files `https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md` and `.../LICENSE.txt` (Apache-2.0, verified 2026-11-02).
- Produces: a discoverable personal skill named `frontend-design` on this machine. Not referenced by path from the repo.

- [ ] **Step 1: Download both upstream files verbatim**

PowerShell `New-Object Net.WebClient` (or `Invoke-WebRequest`) into
`~\.config\opencode\skills\frontend-design\` (create directory first).
Exact URLs above. If either download fails or returns non-2xx, stop and
retry/report — no partial install.

- [ ] **Step 2: Wave the attribution flag**

Confirm `LICENSE.txt` starts with "Apache License" (first non-empty line)
and is not the WordPress/other GPL text — one Get-Content check. A wrong
license file is a failed install, not a footnote.

- [ ] **Step 3: Verify frontmatter + triggerability**

PowerShell (no node): read the file, assert (a) it starts `---\n`, (b)
frontmatter contains `name:` and a `description:` line of ≥ 20 chars. Any
failure: reinstall; do not edit upstream content.

- [ ] **Step 4: Record result (no repo change)**

This task changes nothing in the `superpowers-classicpress-dev` repo;
git status there must be clean of skill files afterwards.

### Task 2: Wire `frontend-design` into `classicpress-dev`

**Files:**
- Modify: `skills/classicpress-dev/references/companion-skill-map.md` (add one rows-table entry in the right place — the map's "The packs" table plus, if needed, one line in the "minimum set" list)
- Modify: `skills/classicpress-dev/SKILL.md` (add exactly one row to the §9 rules-of-engagement table)

**Interfaces:**
- Consumes: the existing table formats in both files (§9 two-column "WP-era instruction | ClassicPress ruling"; map five-column "| Upstream | License | Skills | CP fit |").
- Produces: documentation wiring; nothing downstream consumes it programmatically. Repo still passes the Task-1-era manifest/frontmatter checks by inspection (no build system exists).

- [ ] **Step 1: Map entry (exact content)**

In the "The packs" table, add a row:

```markdown
| [anthropics/skills](https://github.com/anthropics/skills) `frontend-design` | Apache-2.0 | `frontend-design` | USE: distinctive-visual-design direction (typography, palette, composition, motion) — platform-agnostic; apply to classic theme `style.css`, template PHP, and plugin admin screens. FILTER its stack assumptions (React/Next examples, build pipelines) to classic PHP/CSS idioms. SKIP nothing — it carries no block-editor-era habits. (Verified 2026-11-02, @main.) |
```

Also add one line to the "Choosing a minimum set" list: `5.` entry naming
`frontend-design` as the visual-design voice for themed/plugin work
(one line, plain sentence).

- [ ] **Step 2: §9 row (exact content)**

Add to the §9 table (position: after the security/i18n/DB mechanics row):

```markdown
| "Distinctive visual design direction" (`frontend-design`) | Apply fully — in classic PHP/CSS idioms: `style.css` + `wp_enqueue_style` (font loading via core-safe enqueueing, not `<?php echo` link tags). It carries no block patterns; do not let it suggest blocks or React pipelines. |
```

- [ ] **Step 3: Constraint greps**

PowerShell: `Select-String` across both touched files for
`haiku|sonnet|opus` → expect zero matches; `git grep -c frontend-design`
in the repo → expect exactly the two touched files.

- [ ] **Step 4: Proportion checks**

SKILL.md line count still < 240 (was 213 before this task); map has no
new fenced code blocks; `git diff --stat` shows only the two files.

- [ ] **Step 5: Commit + push**

```bash
git add skills/classicpress-dev/SKILL.md skills/classicpress-dev/references/companion-skill-map.md
git add docs/superpowers/specs/2026-11-02-adopt-frontend-design-design.md docs/superpowers/plans/2026-11-02-adopt-frontend-design.md
git commit -m "docs: wire frontend-design into companion map and rules of engagement"
git push origin main
```
