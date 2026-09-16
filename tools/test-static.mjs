/**
 * Check the generated static pages.  `node tools/test-static.mjs`
 *
 * These pages exist to be crawled, so the things that matter are: every
 * internal link resolves to a real file, every page has a unique title and a
 * canonical matching its own path, no LaTeX leaks into the rendered text, and
 * the structured data parses.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tmua.dev';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

/** Does a site-absolute URL resolve to a file on disk? */
function resolves(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return true;             // external or relative: not our problem here
  const p = path.join(ROOT, decodeURIComponent(clean));
  if (clean.endsWith('/')) return fs.existsSync(path.join(p, 'index.html'));
  return fs.existsSync(p) || fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));
}

const pages = [...walk(path.join(ROOT, 'papers')), ...walk(path.join(ROOT, 'topics'))];
let problems = 0;
const titles = new Map();
const fail = (f, m) => { console.log(`  ${path.relative(ROOT, f)}: ${m}`); problems++; };

for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = '/' + path.relative(ROOT, f).replace(/index\.html$/, '');

  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1];
  if (!title) fail(f, 'no <title>');
  else if (titles.has(title)) fail(f, `duplicate title, also on ${titles.get(title)}`);
  else titles.set(title, path.relative(ROOT, f));

  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (canon !== SITE + rel) fail(f, `canonical is ${canon}, expected ${SITE + rel}`);

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length < 50) fail(f, `description too short (${desc.length} chars)`);
  if (desc.length > 320) fail(f, `description too long (${desc.length} chars)`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1].replace(/\\u003c/g, '<')); }
    catch (e) { fail(f, 'structured data does not parse: ' + e.message); }
  }

  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    if (!resolves(m[1])) fail(f, `dead link ${m[1]}`);
  }
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    if (!resolves(m[1])) fail(f, `missing asset ${m[1]}`);
  }

  // rendered maths should never show its own source
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const leak = text.match(/\\(frac|sqrt|begin|left|right|cdot|le|ge|pi|sum|int)\b|\$\$?[^$]/);
  if (leak) fail(f, `unrendered LaTeX in the text: ${leak[0]}`);
}

// the sitemap must list only pages that exist, and every generated page
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const listed = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, ''));
for (const u of listed) if (!resolves(u)) { console.log(`  sitemap: ${u} does not exist`); problems++; }
const set = new Set(listed);
for (const f of pages) {
  const rel = '/' + path.relative(ROOT, f).replace(/index\.html$/, '');
  if (!set.has(rel)) { console.log(`  sitemap: missing ${rel}`); problems++; }
}
if (new Set(listed).size !== listed.length) { console.log('  sitemap: duplicate URLs'); problems++; }

console.log(`${pages.length} generated pages, ${listed.length} sitemap URLs`);
console.log(problems ? `\n${problems} problem(s)` : '\nno problems');
process.exit(problems ? 1 : 0);
