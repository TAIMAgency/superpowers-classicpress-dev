# Design: superpowers-classicpress-dev

Date: 2026-11-02
Status: awaiting approval

## Intent

Distill the ClassicPress development workflow curated in this session (repo triage
of wordpress-* skills, security/quality gates, ClassicPress guardrails) into
**one self-contained skill** — `classicpress-dev` — packaged as a GitHub-ready
repository so other developers can install it into their coding agents
(OpenCode, Claude Code, Codex, Cursor, and any skills-compatible harness).

The skill must stand alone: a developer who installs only this gets the complete
ClassicPress methodology. Companion skills are recommended but optional.

## Goals

1. Single `classicpress-dev` skill encoding the end-to-end method:
   triage → classic-first build rules → security gates → testing →
   performance → CP-directory release (no WP.org SVN) → review guardrails.
2. Multi-harness deployment in one repo:
   - `skills/classicpress-dev/` — portable skill folder (works for any agent
     with skills-directory support)
   - `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` —
     Claude Code plugin/marketplace install
   - OpenCode plugin (`package.json` + `index.js` + `.opencode/plugins/…`)
     registering the skill natively on both V1 and V2, following the
     superpowers plugin contract (`config.skills.paths` V1;
     `ctx.skill.transform` → `draft.add` V2). No model-bootstrap injection —
     that is superpowers' job; this skill is domain knowledge.
3. `README.md` with per-harness install commands and troubleshooting pointers,
   plus a companion-skills recommendation section (links to the curated
   upstreams, with licenses) for developers who want the fuller stack.
4. MIT license; attribution for upstream inspiration where relevant.
5. Git-initialized repo, one clean commit, ready for `git push` to GitHub.

## Non-goals / anti-goals

- No redistribution of third-party skills (license-cleanliness, slim install)
- No Gutenberg/block-editor patterns anywhere in the skill content
- No Claude-specific conventions (model-tier notes, plugin-only commands) baked
  into skill text; harness-neutral language only
- Not a marketplace of many skills — exactly one skill ships

## Approaches considered

1. **Single skill + thin multi-harness shell (chosen)** — self-contained,
   license-clean, minimal trigger-description surface.
2. Plugin bundling all ~56 curated skills — fat install, GPL contamination risk
   from mixing with WordPress/agent-skills content, heavy maintenance. Rejected.
3. Thin delta-skill only — not useful enough for other developers. Rejected.

## Deliverables (builder map)

```
superpowers-classicpress-dev/
├── skills/classicpress-dev/SKILL.md      # the one skill (complete methodology)
├── skills/classicpress-dev/references/   # supporting deep-dives
│   ├── companion-skill-map.md            # curated upstream list + licenses
│   └── compat-notes.md                   # CP re-base caveats / verification habits
├── .claude-plugin/plugin.json
├── .claude-plugin/marketplace.json
├── .opencode/plugins/superpowers-classicpress-dev.js   # V1 config hook
├── index.js                              # V2 directory-form entry (default export setup)
├── package.json
├── README.md
├── LICENSE (MIT)
├── .gitignore
└── docs/superpowers/specs/… (this design doc)
```

## Left to the builder

Version 0.1.0, homepage placeholders to be finalized by the user's GitHub
username before push. Exact skill phrasing follows `superpowers:writing-skills`
conventions (frontmatter name/description triggers, imperative, ~400 lines
max with overflow into references).
