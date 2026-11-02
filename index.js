// Root entrypoint for OpenCode V2 directory-form plugin registration.
//
// OpenCode V2 hosts (2.0.4 or later) require configured plugin paths to be
// directories containing an `index` entrypoint (they reject bare file paths).
// npm/git package installs resolve via package.json `main`; this file serves
// the directory form — an absolute path such as
// `"plugins": ["/path/to/superpowers-classicpress-dev"]` (`~` is not expanded).
export { default } from './.opencode/plugins/superpowers-classicpress-dev.js';
