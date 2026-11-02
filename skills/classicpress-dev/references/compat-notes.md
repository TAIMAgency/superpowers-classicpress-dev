# Compatibility notes — ClassicPress versions, re-base behavior, verification habits

Standalone reference for `skills/classicpress-dev/SKILL.md` §§1–2. Facts
below were checked against ClassicPress release trees and classicpress.net
on **2026-11-02**; the *habits* are version-proof, the version trivia is
not — re-check when a new CP release lands.

## How ClassicPress relates to WordPress versions

| Era | Base | Notes |
|---|---|---|
| CP 1.x (2018–2022) | forked from **WordPress 4.9.x** | No re-basing against WP afterwards — 1.x only received backports. WP-5.0+ APIs did not exist in 1.x. |
| CP 2.0 "Bella" (Feb 2024) | re-fork of **WordPress 6.2.3** | Chose several WP 6.3.x security/efficiency backports. HTML5 output became the default (no `add_theme_support( 'html5' )` needed). |
| CP 2.1 (Jun 2024) | still WP 6.2.x base | CP's own directory runs on CP; new default theme ("The ClassicPress Theme"). |
| CP 2.2 (Sep 2024) | still WP 6.2.x base | Media categories; `object_relationships`/`object_relationshipmeta` tables; bcrypt password hashing by default (+ optional pepper filter); `cp_` table prefix for new installs; backported `wp_trigger_error()`. Deprecations begin: jQueryUI, ClipboardJS, hoverIntent. |
| CP 2.3 (Dec 2024) | still WP 6.2.x base | XML-RPC and Emoji can be disabled from options; PHP 8.4 support. |
| CP 2.4 (Feb 2025) | still WP 6.2.x base | AVIF support; plugin/theme prior-to-update backups. |
| CP 2.5 (Sep 2025) | still WP 6.2.x base | Site Health "Block Compatibility" report; `classicpress_has_update()`; media widgets refactored to vanilla JS. |

The 2.x line did **not** re-base continuously onto 6.3, 6.4, and later
releases as they came out. WordPress APIs introduced *after* 6.2 are absent unless CP
explicitly backported them — which is why §2's check-the-source rule is
not negotiable. `Requires at least:` headers must resolve against the
base WordPress version CP reports (see below): `6.2` or lower for
anything in CP 2.x, per classicpress.net docs.

## Version-detection facts (from `wp-includes/version.php`)

The single most confusing point for agents:

- ClassicPress keeps **two** version globals:
  - `$cp_version` — the ClassicPress version string (e.g. `2.5.0`).
  - `$wp_version` — the **base WordPress version** this CP tree reports
    (e.g. `6.2.6` in CP 2.5.x). It is *not* a WordPress version string
    that means "WordPress": a `$wp_version` of `6.2.6` can equally be a
    WordPress 6.2 install or ClassicPress 2.x.
- Core's recommended detection for plugins/themes:
  `function_exists( 'classicpress_version' )` (returns `$cp_version`;
  companion: `classicpress_version_short()`, `classicpress_is_dev_install()`).
- CP keeps its own DB revision global (`$cp_db_version`) next to
  `$wp_db_version`; upgrade routines that branch on schema versions
  should branch on CP's, not WP's, when touching CP-only schema.

So: never classify a tree from the shape of `$wp_version` alone; use
`classicpress_version()` / `$cp_version` (SKILL.md §1).

## Answering "does this CP version have X?" — the grep workflow

1. **Local tree exists?** Grep it: `function foo(`, `add_action( 'x'`,
   or the class name in `wp-includes/`, `wp-admin/`, `wp-content/`
   (including `mu-plugins`). A hit in the working tree beats any doc.
2. **No local tree?** Pin the exact version:
   ```bash
   git clone --depth 1 --branch <cp-version-tag> \
     https://github.com/ClassicPress/ClassicPress-release
   ```
   Every CP release is tagged; grep that checkout. The development repo
   (`ClassicPress/ClassicPress`) has the tree under `src/` — the release
   repo (`ClassicPress-release`) has it at the root, which matches what
   real installs run.
3. **Only then consult docs** (https://docs.classicpress.net and
   classicpress.net announcements) for context on whether it is
   backported-but-present, backported-later, or never ported.
4. Report exactly what you checked (tree + tag) in your answer.

Quick heuristics (verify with step 1–2 before relying on them):

- WP-6.2-era core APIs → present in CP 2.x (par excellence: Site Health,
  `wp_trigger_error()` since 2.2, REST-request detection helpers).
- WP 6.3+/7.x APIs → default **absent**; presence is a claim you must
  support with a grep hit.
- Block APIs (`register_block_type`, `block.json` schemas, FSE) → an
  intentional no; CP ships only enough compat surface to *not fatal* on
  poorly-written inherited plugins. Building against the compat layer is
  a defect, not a feature.

## ClassicPress-only surface worth knowing

- `classicpress_version()` family (above).
- `Requires CP:` (theme) / equivalent (plugin) headers: CP-specific
  manifest lines WordPress ignores (verified in
  `wp-includes/class-wp-theme.php`, `@since CP-2.0.0`). Fine in CP
  directory releases; do **not** add them to plugins/themes published on
  WordPress.org — CP's docs warn the header disables WP.org update checks.
- Media categories and the object-relationships tables (2.2+).
- `cp_` table prefix on new installs (2.2+) — `$wpdb` code must never
  hardcode a `wp_` prefix; always use `$wpdb->prefix` / `->base_prefix`.
- Semver bigger promise: CP will not break compatibility in minor/patch
  releases; majors (3.0) may — plan deprecations (jQueryUI, ClipboardJS,
  hoverIntent are deprecated as of 2.2; Post-by-Email/XML-RPC defaults
  tighten) and prefer vanilla-JS/SortableJS replacements CP itself uses.

## Version pinning advice for deliverables

- State the supported CP floor in the plugin/theme headers (`Requires CP`
  for themes) and in the readme, then verify every API against **that**
  floor, not the newest release.
- Test matrix minimum: oldest supported CP minor + latest stable CP
  release, on the PHP versions both declare (CP 2.x: PHP 7.4+).
- When generating `.pot`/release metadata: anchor version strings to the
  CP release you certified against so a future reader can re-verify.

## What "compatible" must never claim

- "It works on WordPress 6.2, so it works on CP 2.x" — true only modulo
  the §3 banned list and CP backport specifics; qualify claims this way.
- "CP 2.x is WordPress minus Gutenberg, nothing more" — it has its own
  features (§ classics above); treating them as unknown produces APIs
  that ignore native CP capability.
- "The compat/polyfill layer means I can use block functions" — no; it
  exists to fail softer, not as a build target.
