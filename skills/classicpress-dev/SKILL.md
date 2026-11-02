---
name: classicpress-dev
description: Use when a project targets ClassicPress — writing or porting ClassicPress plugins or classic PHP themes, reviewing code against a ClassicPress version, releasing to the ClassicPress directory, applying WordPress agent skills (wp-*) to ClassicPress code, or when Gutenberg/block-editor patterns appear in a ClassicPress repo. Also use when asked to "modernize" or "best-practice-ify" a ClassicPress plugin/theme, or to audit whether an inherited codebase is ClassicPress-safe. Covers triage, parity verification against the CP source, build rules, the security baseline, testing, performance, and release. Skip for non-WordPress PHP or for sites that need the WordPress block editor.
---

# ClassicPress Development

ClassicPress is a WordPress fork maintained without the block editor. It re-bases
on WordPress releases over time (the 2.x line began at WordPress 6.2), so any
WordPress-era convention — including your training data and any `wp-*` agent
skill — is **suspect until checked against the ClassicPress version that matters
here**. This skill is the workflow that turns that suspicion into verified code.

## Golden rule

**Never rely on your memory of "latest WordPress" to decide what ClassicPress
supports. Verify against the ClassicPress source in this project, then implement.**

## 1. Triage — know what you are looking at

Before editing, determine:

1. **Is this actually ClassicPress?** Do not classify by the shape of
   `$wp_version` alone: ClassicPress 2.x is a re-fork of WordPress 6.2.x
   and reports `$wp_version` as the *base* WordPress version (e.g.
   `6.2.6`), not as `2.x` (verified in CP 2.5.0 `wp-includes/version.php`).
   Reliable checks, best first:
   `function_exists( 'classicpress_version' )` — the detection method CP
   core itself recommends — or the `$cp_version` global in
   `wp-includes/version.php` (CP format: `2.x.y`, e.g. `2.5.0`). A
   `readme.txt` that mentions ClassicPress also signals a CP tree.
   Ambiguous? Say so and ask — never assume.
2. **What kind of code?** plugin (file header `Plugin Name:`), classic theme
   (style.css header `Theme Name:`), child theme (`Template:` header), or a
   mixed codebase being ported from WordPress.
3. **Which CP version?** From the code (or ask). Parity differs between 2.x
   minors: each re-base restored chunks of the WordPress 6.2+ API surface.
   Verification in step 2 is always against *this* version.

## 2. Verify against the source — every time

Before using any WordPress function, hook, or constant you are not already
certain this CP tree ships:

- Grep the local tree: `wp-includes/`, `wp-admin/`, `wp-content/` — the
  function's `function foo()` or `do_action( 'hook_name'` must exist in
  *this* checkout.
- No local tree? Pin the version: `git clone --depth 1 --branch <tag>
  https://github.com/ClassicPress/ClassicPress` (or read the tagged tree on
  github) and grep that, or check classicpress.net docs before claiming support.
- A plugin sold to run on CP must target the *lowest* CP version the user
  actually runs — verify the floor, not the ceiling.
- Claim parity only on evidence: a confirmed grep hit or doc citation. "It
  should be there" is not verification.

Report what you checked and what you did not. An unverified API claim in a
ClassicPress change is a finding all by itself.

## 3. Do NOT emit in ClassicPress-targeted code

ClassicPress has no block editor. Never write or add:

- Gutenberg/Blocks: `register_block_type`, `block.json`, `@wordpress/blocks`
  runtime APIs, `register_block_pattern*`, `wp_enqueue_block_*`
- Full Site Editing / block themes: `theme.json` (block-theme schema),
  `templates/*.html`, `parts/*.html`, block template parts, block theme
  `screenshot` handling
- Block-dependent frontend: Interactivity API (`data-wp-*`), `@wordpress/scripts`
  build pipelines whose only product is block assets
- Post-6.2 APIs not present in the CP re-base being targeted (verify per §2 if
  the API appears after WordPress 6.2; e.g., newer editor/REST additions)

**Inherited WordPress code being ported to CP:** block-era code is not
"leave it and disable it": either port the behavior to shortcodes/paradigms the
CP site actually renders, or quarantine the whole feature with a follow-up
ticket. Dead `register_block_type` calls in a shipped CP plugin are a
defect: dead weight today, and a failure tomorrow if the API surface they
expect exists anywhere.

## 4. Build rules

### Themes (classic only)

- `style.css` with the full header block is the theme *manifest*: `Theme Name`,
  `Version`, `Requires CP` (the CP version floor), `Requires PHP`, `License`,
  `Text Domain`. `Requires CP:` is a ClassicPress-specific header WordPress
  does not parse — verify against the target tree's `class-wp-theme.php`.
- Template hierarchy from real PHP files: `index.php` (mandatory fallback),
  `header.php`, `footer.php`, `sidebar.php`, `single.php`, `page.php`,
  `archive.php`, `search.php`, `404.php`, `functions.php`. Use
  `get_template_part()` / `locate_template()` for composition — not HTML
  template parts.
- Enqueue all assets: `wp_enqueue_style/script`. Cache-bust with
  `wp_get_theme()->get( 'Version' )` or `filemtime()`. Never hardcode `<link>`
  or `<script>` tags with `bloginfo( 'stylesheet_url' )`.
- `add_theme_support()` for `title-tag`, `post-thumbnails`, `custom-logo`,
  `html5`, `menus`. Register menus and widget areas explicitly.
- `wp_body_open()` after `<body>`; `wp_head()` before `</head>`;
  `wp_footer()` before `</body>`.
- A `screenshot.png` (1200×900 recommended) and `readme.txt` ship with the
  theme; the manifest stays `style.css`.
- Child themes: `functions.php` loads *after* the parent — wire hooks with
  that ordering in mind, and override templates by path, not by copy drifting.

### Plugins

- File header: `Plugin Name`, `Version`, `Description`, `Requires at least` /
  `Requires PHP`, `Text Domain`, `License` (and `License URI`).
- `defined( 'ABSPATH' ) || exit;` at the top of every PHP entry file.
- Lifecycle: activation (create/update schema via `dbDelta` or options),
  deactivation (hooks/cron cleanup, keep data), **uninstall.php** (drop data
  only when `WP_UNINSTALL_PLUGIN` is defined).
- Hooks over surgery: actions/filters for everything cross-module; prefix
  every filter/action name with the plugin slug.
- Settings API for admin options: `register_setting` with a
  `sanitize_callback`, `add_settings_section/field`, `settings_fields()` so
  nonce + capability handling come from core.
- Load assets conditionally (check `is_admin()` / page hooks) instead of on
  every request.
- Shortcodes are first-class in ClassicPress: shortcodes with
  `shortcode_atts` + escaped output are the correct replacement for the
  block content editors cannot provide.

## 5. Security baseline (apply to every change)

| Concern | Rule |
|---|---|
| Input | `wp_unslash()` then `sanitize_*` matched to type; validate against allowlists |
| Output | Escape at output: `esc_html/attr/url/js/textarea`, `wp_kses_post` where rich HTML is intended |
| Requests | Nonce generate *and* verify (`wp_nonce_field` + `check_admin_referer` / `check_ajax_referer` / `wp_verify_nonce`), always paired with a capability check |
| Authorization | `current_user_can()` with per-object caps (`edit_post` etc.) — never role names |
| SQL | `$wpdb->prepare()` with `%d/%s/%f` placeholders; `esc_like()` for LIKE; allowlists for identifiers |
| HTTP | `wp_safe_remote_*` + `wp_http_validate_url`; allowlist outbound hosts; check `is_wp_error` |
| Uploads/files | `wp_handle_upload` + MIME allowlist; `validate_file()`/`wp_normalize_path` on any user-influenced path |
| Secrets | No plaintext secrets in code/db; Application Passwords for API auth |
| Dependencies | Prefer core-enqueued handles; vet/lockfile any bundled PHP/JS; no remote `include`/`eval` |
| Cron/CLI | Callbacks re-check authorization from stored context; never trust `$current_user`; CLI args sanitized |

This mirrors the wp-sec security skills when they are installed; this table
is the standalone version when they are not.

## 6. Testing and verification

- Write the test first when adding behavior (see the `test-driven-development`
  skill if installed). For CP plugins: PHPUnit + the WP-compatible test suite
  or `WP_Mock`/Brain Monkey for unit seams.
- The classic `bin/install-wp-tests.sh` bootstrap fetches WordPress **core**
  test scaffolding: for ClassicPress targets, point the bootstrap at the CP
  checkout (or verify the WP suite behavior you rely on applies to the CP
  tree). Never silently test a "CP" plugin against WP core and claim parity.
- Browser/Playwright/e2e flows are fine against a real CP site.
- WordPress Playground is WordPress-flavored: treat `wp-playground` skills
  as a **best-effort approximation**, and note any place the CP tree must
  differ. It is not a CP compatibility oracle.
- Verification before completion: run the suite, read the output, and
  grep-diff the "banned list" APIs (§3) out of the diff before claiming done.

## 7. Performance essentials

- Autoloaded options: keep `autoload=yes` options small; large data → custom
  tables with `dbDelta` or explicit `autoload=no`.
- Transients/object cache for external calls; page-level caching is usually
  the host's job.
- Conditional enqueues; no monolithic `admin_init` work on every screen;
  `$wpdb` queries measured, never `SELECT *` over a loop.

## 8. Release: the ClassicPress directory, not WordPress.org

- Version sync across: plugin header `Version:`, version constant,
  `readme.txt` `Stable tag` + Changelog, `.pot` `Project-Id-Version`.
  Semver discipline; do NOT bump the DB schema version on routine releases;
  keep upgrade routines guarded by option-version comparisons.
- `readme.txt`: `=== Plugin Name ===`, description, Installation, FAQ,
  Changelog sections with `=` headings; `Stable tag` points at the tags you
  actually publish.
- Deployment target is the **ClassicPress plugin/theme directory** — read its
  current submission-and-review guidelines before packaging. There is NO
  WordPress.org SVN step for ClassicPress publishes; ignore any
  `wp-org-submission`-style instructions if wp-* skills are installed.
- Ship a clean zip: no `.git`, no node_modules, no test scaffolding, no dev
  config, no leftover debug code; security scanners run against the package
  should find nothing new.

## 9. Rules of engagement with `wp-*` skills (when installed)

If WordPress-flavored agent skills are loaded alongside this one, they
understand ClassicPress through this filter. Order of precedence: **this
skill wins any conflict**.

| WP-era instruction | ClassicPress ruling |
|---|---|
| "Register a block / add theme.json / block template" | Skip; CP has no block editor (§3). Note the omission in the plan. |
| "Block themes are the default / FSE" | False for CP: classic PHP themes are *the* theme type. |
| APIs marked WordPress 6.3+/7.x | Verify against this CP tree first (§2); several never made the 6.2 re-base. |
| `@wordpress/scripts` / block build pipelines | Skip unless you outfit script translations that genuinely need them. |
| WP.org SVN / Plugin Check for directory publish | Wrong directory: use CP directory guidelines (§8). |
| "Model note: run on haiku/sonnet/opus" | Ignore: Claude Code tier conventions. Run everything on the current model. |
| Woo/builder/page-building skills (Elementor, Bricks, Divi…) | Out of scope for CP: do not adopt their patterns. |
| Security/i18n/DB/performance/testing mechanics | Apply fully — PHP patterns are CP-identical after the §2 parity check. |
| `wp i18n make-json` / `wp_set_script_translations` | Only when you actually enqueue script-translated assets; skip block-era JS translation flows. |

## 10. Common mistakes

| Mistake | Fix |
|---|---|
| Testing a "CP" plugin against WP core test suite | Bootstrap the suite against the CP checkout and say which suite ran |
| Claiming an API exists because WP 6.2 "probably" re-based it | Grep the CP tree / cite CP docs (§2) |
| Block-era leftovers after porting | Grep the ported diff for §3 APIs; quarantine or port, never half-delete |
| readme.txt targeting WP.org | Stable tag sections are fine; publish via CP directory (§8) |
| Absorbing "latest WP" advice from wp-* skills unchecked | Apply §9 filter before any step |
| Shipping `.git`/build artifacts inside the zip | Clean package per §8 |

## References

- `references/companion-skill-map.md` — curated upstream WordPress agent
  skills that complement this one, with ClassicPress-fit flags and licenses.
- `references/compat-notes.md` — ClassicPress re-base history habits,
  version pinning, and how to answer "does this CP version have X?" quickly.
- ClassicPress source: https://github.com/ClassicPress/ClassicPress
- ClassicPress docs: https://docs.classicpress.net
