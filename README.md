# superpowers-classicpress-dev

**ClassicPress development methodology for AI coding agents â€” as one skill.**

ClassicPress is a WordPress fork maintained without the block editor, re-based
on WordPress 6.2. AI coding agents default to WordPress-era "modern best
practice" â€” block registration, `theme.json`, block themes â€” and to "latest
WordPress" recall that ClassicPress 2.x does not have. This pack ships exactly
one skill, `classicpress-dev`, that makes agents do what agents typically will
not:

1. **Triage** â€” detect ClassicPress reliably (`classicpress_version()` /
   `$cp_version`, not the misleading shape of `$wp_version`).
2. **Verify against the source before using any API** â€” grep the CP tree,
   never trust recall of post-6.2 WordPress.
3. **Refuse block-editor output** in CP-targeted code â€” and handle inherited
   block-era code honestly (port or quarantine, never half-delete).
4. **Build classic-first** â€” classic themes, Settings-API plugins, core APIs.
5. **Apply the security baseline** â€” nonces + capability checks, escaping,
   `$wpdb->prepare()`, upload and filesystem discipline.
6. **Release to the ClassicPress directory** â€” not WordPress.org SVN.

The skill is harness-neutral (OpenCode, Claude Code, Codex, Cursor, or any
skills-compatible harness) and speaks all of them through this repo's
adopted packaging.

## What is in the repo

| Path | Purpose |
|---|---|
| `skills/classicpress-dev/SKILL.md` | The skill itself (~215 lines: triage, verify-first, banned list, build rules, security baseline, testing, performance, release, `wp-*` rules of engagement). |
| `skills/classicpress-dev/references/companion-skill-map.md` | Vetted upstream WordPress agent-skill packs with licenses and CP-fit flags. |
| `skills/classicpress-dev/references/compat-notes.md` | CP re-base history, version-detection facts, the "does this CP version have X?" grep workflow. |
| `.opencode/plugins/superpowers-classicpress-dev.js` | OpenCode plugin: V1 (`config` hook) + V2 (`ctx.skill.transform`) adapters. |
| `index.js` | OpenCode V2 directory-form entrypoint. |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code plugin / marketplace manifests. |
| `scripts/validate.mjs` | Manifest/frontmatter sanity checker (`npm run validate`). |

## Install

### OpenCode (V1 and V2)

From a pushed copy of this repo â€” OpenCode V2's current config key:

```jsonc
// ~/.config/opencode/opencode.json  (global)  or  .opencode/opencode.json (project)
// OpenCode V2: key is "plugins" (the older singular "plugin" is deprecated
// but still accepted by hosts that shipped it).
{
  "plugins": [
    "superpowers-classicpress-dev@git+https://github.com/TAIMAgency/superpowers-classicpress-dev.git"
  ]
}
```

The `name@git+https://...` specifier form is what OpenCode itself uses for
git-hosted plugin packages (verified working in OpenCode V2; the Superpowers
plugin installs exactly this way). Legacy OpenCode 1.x hosts may use the
singular key with the same values:

```jsonc
{ "plugin": ["superpowers-classicpress-dev@git+https://github.com/TAIMAgency/superpowers-classicpress-dev.git"] }
```

Local directory form (both hosts verify; the path must be the directory that
contains `index.js` and `skills/`; `~` is not expanded):

```jsonc
{
  "plugins": ["/absolute/path/to/superpowers-classicpress-dev"]
}
```

Or skip the plugin entirely and install the skill as a personal skill: copy
`skills/classicpress-dev/` into `~/.config/opencode/skills/`.

Generation-shape differences are handled inside the plugin: it detects V1
(`config.skills.paths` injection) and V2 (`ctx.skill.transform`) itself.

### Claude Code

From the pushed repo URL (or `owner/repo` shorthand):

```
/plugin marketplace add TAIMAgency/superpowers-classicpress-dev
/plugin install superpowers-classicpress-dev@superpowers-classicpress-dev
```

The marketplace manifest is self-contained (`.claude-plugin/marketplace.json`
â†’ `./`), so nothing else is required.

### Codex, Cursor, and generic agents

These load skills from a directory of `SKILL.md` folders:

- Codex: `~/.codex/skills/` (also reads the cross-runner alias
  `~/.agents/skills/`)
- Cursor: `~/.cursor/skills/` (or the project-level `.cursor/skills/`)
- Claude Code (without the plugin step, as a personal skill):
  `~/.claude/skills/`
- Anything skills-compatible: its conventional `skills/` directory

```
git clone https://github.com/TAIMAgency/superpowers-classicpress-dev.git
cp -R superpowers-classicpress-dev/skills/classicpress-dev ~/.claude/skills/   # example
```

Substitute your harness's directory in the `cp` target.

## Verify your install

Open your agent in any project â€” ideally a ClassicPress one â€” and say:

> Tell me about your classicpress-dev skill

Expected: the agent can state that ClassicPress re-based to WordPress 6.2,
that it verifies APIs against the CP tree before using them, and that it
refuses Gutenberg/block-editor output in CP-targeted code. If the agent does
not have the skill, see Troubleshooting.

## Recommended companion stack (optional)

The skill is complete on its own. For a fuller stack, install up to a few
vetted upstream WordPress skill packs â€” every entry has its license and a
ClassicPress fit flag (USE / FILTER / SKIP) in
[`skills/classicpress-dev/references/companion-skill-map.md`](skills/classicpress-dev/references/companion-skill-map.md):

- `wpultimatesecurity/WordPress-Security-Skills` (MIT) â€” deep security skills; this pack's baseline table is the floor and those skills are the detail.
- `amElnagdy/guard-skills` (MIT) â€” review quality gates.
- `mralaminahamed/wp-dev-skills` (MIT) â€” standards, testing, i18n, release mechanics (its WordPress.org release-dir advice gets overridden â€” see map).
- `WordPress/agent-skills` (GPL-2.0-or-later) â€” plugin/REST/CLI reference depth; block-era skills inside are SKIP.
- `anthropics/skills` `frontend-design` (Apache-2.0) — visual-design direction for theme and plugin-admin work, filtered to classic PHP/CSS idioms.

Rule: when packs conflict, `classicpress-dev` wins â€” the skill ships a
rules-of-engagement table (SKILL.md Â§9) that filters WP.org-flavored habits.

## Troubleshooting

- **Skill not listed by the harness.** Check the skill directory contains
  `SKILL.md` with `---` frontmatter containing `name` and a substantial
  `description` (the harness-trigger field). Run `npm run validate` (node â‰¥
  18) from a checkout for the same checks the harness effectively applies.
- **OpenCode plugin loads but skill absent.** Look for
  `[superpowers-classicpress-dev]` console lines: `no skills found under â€¦`
  means the plugin resolved to the wrong path (directory-form installs need
  to point at the repo root so `index.js` and `skills/` sit together).
- **V1 host rejected the plugin.** V1 (`opencode 1.x`) uses the named export
  / `config` hook. Newer V2 hosts also call `default.setup`; the plugin guards
  both shapes â€” upgrade to the latest V2 if V2-mode registration fails.
- **Conflict with other admin skills.** Skills are additive; nothing is
  overwritten. Precedence belongs to `classicpress-dev` by Â§9.

Attribution: ClassicPress fact-checking performed against ClassicPress
release trees and classicpress.net (2026-11-02); companion-map upstreams are
referenced only â€” never vendored â€” with licenses recorded in the map. Under
MIT; see [LICENSE](LICENSE). ClassicPress is a fork of WordPress (GPLv2+);
no upstream code is bundled here.
