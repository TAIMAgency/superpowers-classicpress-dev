#!/usr/bin/env node
// Validation for superpowers-classicpress-dev.
// Checks (run from the repo root): `node scripts/validate.mjs` (or `npm run validate`).
// 1. Every committed JSON manifest parses.
// 2. package.json `main` and every path referenced by the manifests/index
//    resolve to files on disk.
// 3. Every skills/<name>/SKILL.md has `---` frontmatter containing `name` and
//    a non-empty `description`.
// 4. Skills are readable and non-trivial (frontmatter + body > 0 lines).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const notes = [];

const readJson = (rel) => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { errors.push(`missing file: ${rel}`); return null; }
  try {
    return { json: JSON.parse(fs.readFileSync(p, 'utf8')), p };
  } catch (err) {
    errors.push(`invalid JSON in ${rel}: ${err.message}`);
    return null;
  }
};

const assertExists = (rel, why) => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) errors.push(`missing file: ${rel} (referenced by ${why})`);
};

// 1+2: manifests, entrypoints, and referenced paths
const pkg = readJson('package.json');
if (pkg?.json?.main) assertExists(pkg.json.main, 'package.json.main');
else if (pkg) errors.push('package.json: missing "main"');

const pluginJson = readJson(path.join('.claude-plugin', 'plugin.json'));
if (pluginJson && !pluginJson.json.name) errors.push('.claude-plugin/plugin.json: missing "name"');
if (pluginJson && !pluginJson.json.description) errors.push('.claude-plugin/plugin.json: missing "description"');

const marketplace = readJson(path.join('.claude-plugin', 'marketplace.json'));
if (marketplace) {
  const plugins = marketplace.json.plugins || [];
  if (plugins.length === 0) errors.push('.claude-plugin/marketplace.json: "plugins" is empty');
  for (const pl of plugins) {
    const src = pl.source?.source ?? pl.source;
    if (typeof src === 'string' && src.startsWith('./')) assertExists(path.join(src, 'index.js'), 'marketplace.json plugin source');
  }
}

assertExists('index.js', 'OpenCode V2 directory-form entrypoint');
assertExists(path.join('.opencode', 'plugins', 'superpowers-classicpress-dev.js'), 'OpenCode plugin entrypoint');
assertExists('LICENSE', 'distribution license');
assertExists('README.md', 'documentation');

// 3+4: skills frontmatter and body
const skillsDir = path.join(root, 'skills');
if (!fs.existsSync(skillsDir)) {
  notes.push('no skills/ directory yet — skill task has not run');
} else {
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'));
  if (skills.length === 0) {
    notes.push('no skills under skills/ — skill task has not run');
  }
  for (const s of skills) {
    const skillFile = path.join(skillsDir, s.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) { errors.push(`skill ${s.name}: missing SKILL.md`); continue; }
    const raw = fs.readFileSync(skillFile, 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) { errors.push(`skill ${s.name}: no --- frontmatter block`); continue; }
    const fm = m[1];
    const nameM = fm.match(/^name:\s*(.+)$/m);
    const descM = fm.match(/^description:\s*$/m) || fm.match(/^description:\s*.+$/m);
    if (!nameM) errors.push(`skill ${s.name}: frontmatter missing "name"`);
    if (!descM) { errors.push(`skill ${s.name}: frontmatter missing "description"`); continue; }
    // Multi-line (block scalar) descriptions: content lives on indented lines.
    const descLines = fm.split(/\r?\n/);
    const di = descLines.findIndex((l) => /^description:\s*/.test(l));
    const rest = descLines.slice(di + 1).filter((l) => /^\s+\S/.test(l));
    const inlineDesc = descLines[di].replace(/^description:\s*/, '').trim();
    const descValue = inlineDesc || rest.map((l) => l.trim()).join(' ');
    if (descValue.length < 20) errors.push(`skill ${s.name}: description too short to trigger reliably`);
    if (m[2].trim().length === 0) errors.push(`skill ${s.name}: SKILL.md body is empty`);
  }
}

if (notes.length) for (const n of notes) console.log(`note: ${n}`);
if (errors.length) {
  for (const e of errors) console.error(`FAIL: ${e}`);
  process.exit(1);
}
console.log(`OK: manifests, entrypoints, LICENSE, README${(pkg?.json?.main ? ', main' : '')} valid; skills checked: ${fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter((n) => !n.startsWith('.')).length : 0}`);
