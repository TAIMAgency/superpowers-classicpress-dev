/**
 * Superpowers ClassicPress Dev — OpenCode plugin
 *
 * Dual-compatible with OpenCode V1 and V2, zero dependencies.
 *
 * V1 (opencode 1.x): discovered via named export scanning (`SuperpowersCPDevPlugin` /
 * default.server). Provides a `config` hook that injects this package's `skills/`
 * directory into `config.skills.paths`.
 *
 * V2 (opencode 2.0.4+): loaded via the default export `{ id, setup }` by the
 * PluginSupervisor. `setup()` registers skills natively via
 * `ctx.skill.transform((draft) => draft.add(info))` where info follows the
 * OpenCode 2.0.4 Skill.Info contract: `{ id, name, description?, path, content }`.
 *
 * Unlike the superpowers plugin, there is NO model-context bootstrap injection:
 * this skill is domain knowledge and carries no controller workflow. Skills are
 * discovered and loaded by the native `skill` tool.
 *
 * Contract follows obra/superpowers' `.opencode/plugins/superpowers.js`
 * (verified against OpenCode 2.0.4+ hosts): draft.add payloads decode against
 * the host Skill.Info schema and throw synchronously on mismatch, so each add
 * is contained in its own try/catch — one rejected payload must never disable
 * the whole plugin. Every failure path logs and continues (fail-open).
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Shared by V1 (config hook) and V2 (setup/ctx.skill.transform):
// <package-root>/skills
const pluginSkillsDir = path.resolve(__dirname, '../../skills');

// Minimal frontmatter reader. Handles plain `key: value` lines, quoted
// values, YAML block scalar markers (`>`, `|`) with indented continuation
// lines, and CRLF endings — enough for the name/description fields read
// here; not a full YAML parser.
const readFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };
  const frontmatter = {};
  let lastKey = null;
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !/^\s/.test(line)) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      frontmatter[key] = /^(>[+-]?|\|[+-]?)$/.test(value) ? '' : value;
      lastKey = key;
    } else if (lastKey !== null && line.trim() !== '') {
      frontmatter[lastKey] = `${frontmatter[lastKey]} ${line.trim()}`.trim();
    }
  }
  for (const key of Object.keys(frontmatter)) {
    frontmatter[key] = frontmatter[key].replace(/^(["'])([\s\S]*)\1$/, '$2');
  }
  return { frontmatter, content: match[2] };
};

// Scan skills/<name>/SKILL.md and build Skill.Info payload objects.
const loadSkills = () => {
  const skills = [];
  if (!fs.existsSync(pluginSkillsDir) || !fs.statSync(pluginSkillsDir).isDirectory()) {
    return skills;
  }
  for (const entry of fs.readdirSync(pluginSkillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const skillPath = path.join(pluginSkillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    try {
      const { frontmatter, content } = readFrontmatter(fs.readFileSync(skillPath, 'utf8'));
      skills.push({
        id: frontmatter.name || entry.name,
        name: frontmatter.name || entry.name,
        ...(frontmatter.description ? { description: frontmatter.description } : {}),
        path: skillPath,
        content,
      });
    } catch (err) {
      console.error(`[superpowers-classicpress-dev] failed to read skill "${entry.name}":`, err);
    }
  }
  return skills;
};

/**
 * V1 Plugin Function (named export). The `config` hook receives the host
 * config; V2 hosts pass a flat `skills` array (skip — setup() owns V2).
 */
export const SuperpowersCPDevPlugin = {
  config(config) {
    if (Array.isArray(config.skills)) return;
    config.skills = config.skills || {};
    config.skills.paths = config.skills.paths || [];
    if (!config.skills.paths.includes(pluginSkillsDir)) {
      config.skills.paths.push(pluginSkillsDir);
    }
  },
};

// V2 Setup Function (default export). V1 hosts (observed on opencode 1.18.x)
// also invoke default.setup with a V1-shaped ctx lacking the skill/session
// domains; the guard below returns quietly on those, V1 is fully served by
// the named export.
async function setup(ctx) {
  if (!ctx || !ctx.skill || typeof ctx.skill.transform !== 'function') {
    return;
  }
  try {
    const skills = loadSkills();
    if (skills.length === 0) {
      console.error('[superpowers-classicpress-dev] no skills found under', pluginSkillsDir);
      return;
    }
    await ctx.skill.transform((draft) => {
      for (const skill of skills) {
        try {
          draft.add(skill);
        } catch (err) {
          console.error(`[superpowers-classicpress-dev] skill "${skill.id}" rejected by host, skipping:`, err);
        }
      }
    });
  } catch (err) {
    // Never break plugin activation: one failing plugin takes down the whole
    // V2 generation.
    console.error('[superpowers-classicpress-dev] skill registration failed:', err);
  }
}

export default { id: 'superpowers-classicpress-dev', setup };
