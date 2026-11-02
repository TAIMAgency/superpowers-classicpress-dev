# Companion skill map — upstream WordPress agent skills

Standalone reference for `skills/classicpress-dev/SKILL.md` §9. It lists
upstream WordPress-relevant agent-skill packs, what is in them, their
licenses, and how each fits ClassicPress work: **USE** (apply after the
§2 parity check), **FILTER** (apply mechanics, override WP-era habits per
§9), or **SKIP** (block-editor/ecommerce/WordPress.org-only surface).

Rules:

- This map only *references* upstreams. Nothing here is copied, vendored,
  or embedded into this repo; read whichever upstream you install.
- Licenses below were verified from each repo's LICENSE file / GitHub
  metadata on **2026-11-02**. Re-check at install time — licenses and
  contents drift.
- Whichever pack you install, this skill still wins every conflict (§9).

## The packs

| Upstream | License | Skills | CP fit |
|---|---|---|---|
| [WordPress/agent-skills](https://github.com/WordPress/agent-skills) | GPL-2.0-or-later | `wordpress-router`, `wp-plugin-development`, `wp-plugin-directory-guidelines`, `wp-project-triage`, `wp-rest-api`, `wp-wpcli-and-ops`, `wp-performance`, `wp-phpstan`, `wp-playground`, `wp-env` | FILTER: core mechanics are CP-sound (plugins, REST, CLI, performance, PHPStan). `wp-plugin-directory-guidelines` targets the **WordPress.org** directory — repoint release flow to the ClassicPress directory (§8). `wp-playground`/`wp-env` are WordPress-runtimes: best-effort approximation only (§6). |
| (same, block-era skills) | GPL-2.0-or-later | `wp-block-development`, `wp-block-themes`, `wp-patterns`, `wp-interactivity-api`, `wp-abilities-api`, `blueprint`, `wpds` | SKIP: the editor surface ClassicPress does not have (§3). |
| [jorgerosal/wordpress-skills](https://github.com/jorgerosal/wordpress-skills) | MIT | `wp-accessibility-review`, `wp-acf-and-content-modeling`, `wp-admin-ui-development`, `wp-ci-cd-and-release-engineering`, `wp-migration-upgrade-review`, `wp-performance-review`, `wp-plugin-development`, `wp-rest-api-development`, `wp-security-review`, `wp-site-audit-and-onboarding`, `wp-test-strategy`, `wp-theme-development`, `wp-wpcli-and-ops`, `wp-phpstan-review` | USE: review/dev methodology, and ClassicPress is a fork of PHP WordPress — the mechanics hold after the §2 parity check. FILTER: `wp-theme-development` may assume block themes (`theme.json`, templates) — apply its classic-theme guidance only. SKIP in the same pack: `wp-block-development`, `wp-headless-and-wpgraphql`, `wp-playground-development`, `wp-woocommerce-dev`. |
| [wpacademy/wordpress-dev-skills](https://github.com/wpacademy/wordpress-dev-skills) | GPL-2.0 (LICENSE file is GPLv2 text; not MIT) | `wp-plugin-dev`, `wp-plugin-review`, `wp-theme-dev` | FILTER: full plugin/theme/review workflows, classic-era PHP — good skeletons. Apply §3 banned-list and §8 release-dir overrides from this skill. |
| [mralaminahamed/wp-dev-skills](https://github.com/mralaminahamed/wp-dev-skills) | MIT | `wp-coding-standards`, `wp-database`, `wp-plugin-testing`, `wp-plugin-release`, `wp-plugin-audit`, `wp-i18n-workflow`, `wp-multisite`, `wp-background-processing`, `wp-email-templates`, `wp-structured-data`, `wp-admin-browser`, `wp-ci-qa`, `wp-build-tools`, `wp-phpstan-stubs`, `wp-github-flow`, `wp-guided-tour`, `wp-freemius` | USE: standards (PHPCS/WPCS), `$wpdb`/`dbDelta` discipline, PHPUnit for plugins, i18n, multisite, background processing — all CP-identical mechanics. FILTER: `wp-plugin-release` and `wp-org-submission`-style flows assume WordPress.org SVN — repoint to the ClassicPress directory (§8); version-sync checklist itself is reusable. SKIP: `wp-woocommerce` (out of scope for this skill). |
| [wpultimatesecurity/WordPress-Security-Skills](https://github.com/wpultimatesecurity/WordPress-Security-Skills) | MIT | `secure-plugin-development`, `ajax-security`, `nonces-csrf-protection`, `capability-permission-checks`, `output-escaping`, `input-sanitization-validation`, `sql-injection-prevention`, `rest-api-security`, `http-api-ssrf-prevention`, `file-upload-security`, `filesystem-security`, `authentication-session-security`, `settings-options-security`, `secrets-credentials-management`, `cron-background-job-security`, `dependency-supply-chain-security`, `multisite-security`, `security-headers-csp`, `security-auditing-code-review`, `object-injection-deserialization`, `user-data-protection-privacy` | USE: these are the deep versions of the §5 table; when this pack is installed prefer its per-area skills over the table. SKIP inside this pack: `gutenberg-block-editor-security`, `woocommerce-security` (CP: no block editor; WooCommerce out of scope here). |
| [amElnagdy/guard-skills](https://github.com/amElnagdy/guard-skills) | MIT | `wp-guard`, `clean-code-guard`, `docs-guard`, `test-guard` | USE: quality gates that catch agent failure modes. `wp-guard` reviews WP-API-touching code — CP-safe: the escaping/nonce/prepared-query checks apply verbatim; ignore any FSE/WP.org-specific lines it emits. Skip `woo-guard` for this scope. |
| [elvismdev/claude-wordpress-skills](https://github.com/elvismdev/claude-wordpress-skills) | MIT | `wp-performance-review` | USE: performance review of PHP/plugin code — mechanics are CP-identical after §2. |
| [anthropics/skills](https://github.com/anthropics/skills) `frontend-design` | Apache-2.0 | `frontend-design` | USE: distinctive-visual-design direction (typography, palette, composition, motion) — platform-agnostic; apply to classic theme `style.css`, template PHP, and plugin admin screens. FILTER its stack assumptions (React/Next examples, build pipelines) to classic PHP/CSS idioms. SKIP nothing — it carries no block-editor-era habits. (Verified 2026-11-02, @main.) |

## Choosing a minimum set for ClassicPress work

If you install only a few, the highest-value companions are:

1. One security pack (`wpultimatesecurity/WordPress-Security-Skills`) —
   the §5 table is the floor, the pack is the floor with details.
2. `amElnagdy/guard-skills` — catches review-quality failure modes that
   are the same on any delivery target.
3. `mralaminahamed/wp-dev-skills` — testing/standards/release mechanics.
4. `WordPress/agent-skills` for `wp-plugin-development` + `wp-rest-api`
   reference depth.
5. `anthropics/skills` `frontend-design` (Apache-2.0) — the visual-design
   voice for theme and plugin-admin work: one deliberate direction,
   typography, palette, and motion, in classic PHP/CSS idioms.

## Explicit SKIP categories for ClassicPress (any pack)

- Gutenberg/Blocks/FSE: block authoring, `theme.json`, block themes,
  block patterns, Interactivity API, block build pipelines (§3).
- WooCommerce and page-builder ecosystems (Woo, Elementor, Divi, Bricks):
  different products, different idioms; do not import their patterns.
- WordPress.org plugin/theme directory submission (SVN deploy flows,
  Plugin Check-as-submission-gate): the ClassicPress directory has its
  own submission/review guidelines (§8).
