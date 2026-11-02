# superpowers-classicpress-dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one GitHub-ready repo that distributes a single `classicpress-dev` skill (complete ClassicPress plugin/theme methodology) across OpenCode (V1+V2), Claude Code, Codex/Cursor, and skills-compatible agents.

**Architecture:** Portable skills directory is the source of truth; thin harness adapters (Claude plugin manifests, OpenCode plugin entrypoint) point at it. The OpenCode adapter follows the superpowers plugin contract: named export with `config` hook on V1, default `setup()` using `ctx.skill.transform` → `draft.add` on V2. No bootstrap injection (that is Superpowers' job).

**Tech Stack:** Markdown (skill content), JSON manifests, ESM JavaScript (no dependencies), git.

**Spec:** `docs/superpowers/specs/2026-11-02-classicpress-superpowers-design.md` (same repo)

## Global Constraints

- Skill name: `classicpress-dev` (one skill only; no third-party skill redistribution)
- No Gutenberg/block-editor patterns anywhere in skill content
- Harness-neutral language in skill text (no `haiku`/`sonnet`/`opus` model notes, no Claude-only commands)
- MIT license; CP-guardrails are the author's, upstream inspiration attributed in README
- Skill body target: ≤ ~400 lines; overflow goes into `references/`
- Placeholders `YOUR_GITHUB_USERNAME` exactly as such — user fills before push
- JS: pure ESM, zero npm dependencies, `type: "module"`

## Review Focus

*(not software-behavior tests; these are the mistakes that would bite a developer installing or trusting the skill)*

1. **Skill triggers never fire** — description must contain concrete trigger phrases ("ClassicPress", theme/plugin keywords, "WordPress skills applying to CP"), or agents will overlook it. → Pinned by Task 2 validation check on frontmatter description.
2. **OpenCode V2 rejects the plugin** — `draft.add` payload schema (`id`/`name`/`description`/`path`/`content`) must match the superpowers-verified contract, wrapped in per-skill try/catch so a reject never disables the whole plugin. → Pinned by Task 1 code review steps against the contract; validation step imports the module if a JS runtime exists.
3. **Agent emits block-editor code while following the skill** — the skill's "do not use" section must be explicit and early (build rules before nuance). → Task 2 content check: section order, explicit banned-API list.
4. **Broken install paths** — every README install command must reference files that exist in the repo (manifest names, paths verbatim). → Task 4 verification greps each referenced path.
5. **Manifest/JSON drift** — versions or paths mismatched between `package.json` main, `index.js`, and `.opencode/plugins/…`. → Task 1 validation asserts every path in every manifest resolves on disk at plan-execution end.

---

### Task 1: Repo skeleton + manifests + OpenCode adapter

**Files:**
- Create: `package.json`, `LICENSE`, `.gitignore`
- Create: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Create: `.opencode/plugins/superpowers-classicpress-dev.js`
- Create: `index.js`
- Test: `scripts/validate.mjs`

**Interfaces:**
- Consumes: superpowers OpenCode contract (V1 named-export `config` hook mutating `config.skills.paths`; V2 default export `{ id, setup }` with `ctx.skill.transform((draft) => draft.add({id, name, description?, path, content}))`, per-skill try/catch).
- Produces: module that registers every `skills/*/SKILL.md`; later tasks only add files under `skills/` and never touch the adapter.

- [ ] **Step 1:** Write manifests and adapter exactly as specified in the design ("Deliverables"); versions `0.1.0`; `package.json.main` → `.opencode/plugins/superpowers-classicpress-dev.js`; `index.js` re-exports it (directory form for local V2 installs).
- [ ] **Step 2:** Write `scripts/validate.mjs`: parses every `.json` manifest, asserts `package.json.main` and each OpenCode/Claude manifest-referenced path exists, and asserts every `skills/*/SKILL.md` has `---`-delimited frontmatter with `name` and non-empty `description`.
- [ ] **Step 3:** Run validation. If `node`/`bun` exists on PATH, run `node scripts/validate.mjs` (expected: OK, exit 0). If no runtime, verify manually via PowerShell equivalents (JSON parse + Test-Path + frontmatter regex) and note that `validate.mjs` ships for downstream users.
- [ ] **Step 4:** Sanity-read the V2 adapter against the superpowers contract lines (draft.add fields, try/catch placement, V1 `config.skills.paths` array push, fail-open behavior).
- [ ] **Step 5:** `git init`, first commit: `chore: scaffold repo, manifests, OpenCode adapter`.

### Task 2: Author the `classicpress-dev` skill body

**Files:**
- Create: `skills/classicpress-dev/SKILL.md`
- (Required: invoke `superpowers:writing-skills` before authoring.)

**Interfaces:**
- Consumes: curation from `docs/superpowers/specs/…-design.md` (scope) — triage, classic-first build rules, security baseline, testing, performance, CP-directory release, WP-skill rules of engagement, anti-patterns.
- Produces: skill with frontmatter `name: classicpress-dev`, description carrying triggers "ClassicPress", "classic theme", "plugin", "WP-* skills" — body ≤ ~400 lines, references pushed out.

- [ ] **Step 1:** Invoke `superpowers:writing-skills`; follow its frontmatter/description conventions (trigger-rich description, imperative body, TDD/verification emphasis).
- [ ] **Step 2:** Draft SKILL.md: sections = When to use; repo triage (classic theme vs plugin detection); ClassicPress context + verify-against-source rule; build rules (themes: `style.css` header, template hierarchy, enqueueing; plugins: headers, hooks, Settings API; shortcodes fine) with early explicit "Do NOT emit" banned-API list; security baseline (sanitization, escaping, nonces+caps, prepared SQL, uploads, SSRF-safe remote, secrets, dependencies); testing & verification (PHPUnit harness caveat vs CP core, `wp-playground` caveat, verification-before-completion); performance essentials; release (version sync, `readme.txt`, ClassicPress directory, no WP.org SVN); companion-skill rules of engagement; anti-pattern checklist.
- [ ] **Step 3:** Review against constraints: no block APIs, no model-tier notes, ≤~400 lines, banned list early.
- [ ] **Step 4:** Validation: frontmatter check (Task 1's validator or PowerShell double-check) + git commit `feat: add classicpress-dev skill`.

### Task 3: Reference documents

**Files:**
- Create: `skills/classicpress-dev/references/companion-skill-map.md`
- Create: `skills/classicpress-dev/references/compat-notes.md`

**Interfaces:**
- Consumes: SKILL.md mentions these files by exact name.
- Produces: standalone tables — companion-skill map (upstream repo, skill names, license, why relevant; explicitly SKIP categories for CP) and compat notes (CP re-base behavior, verify-against-source habits, version pinning advice).

- [ ] **Step 1:** Write both tables; align repo names/licences with what we verified in-session (WordPress/agent-skills = GPL-2.0+, others MIT) — the map only *references* upstreams, never embeds them.
- [ ] **Step 2:** Verify every path/file name referenced by SKILL.md resolves (`Test-Path`-style check), then commit `docs: add companion map and compatibility notes`.

### Task 4: README, final validation, git polish

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: final file树 from Tasks 1–3 (all referenced paths must exist).

- [ ] **Step 1:** README: what it is, why (AI agents default to Gutenberg-era patterns; ClassicPress breaks those), per-harness install (OpenCode V1/V2 config snippets; Claude Code `/plugin marketplace add <repo>` or direct repo plugin; Codex/Cursor: copy `skills/classicpress-dev` into their skills dir; generic agents: copy folder), the "verify your install" prompt ("Tell me about your classicpress-dev skill"), companion-stack recommendation, troubleshooting pointers, attribution & license.
- [ ] **Step 2:** Grep-verify every repo path each README/install-command references exists; fix drift.
- [ ] **Step 3:** Full validator run; commit `docs: add README`; final commit audit (`git log --oneline`, `git status` clean).

## Self-review notes

- Spec coverage: all six design deliverables map to Tasks 1–4; attribution (design Goal 4) lives in README + LICENSE (Task 4).
- Proportion: doc-heavy plan matches a doc/artifact-heavy deliverable; signature/code-starved by design.
- Type consistency: plugin filename `superpowers-classicpress-dev.js` used identically in Task 1 files and Task 4 README; skill name `classicpress-dev` everywhere.
