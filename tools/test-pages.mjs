/**
 * Page regression: every page boots with no console errors and renders its
 * key furniture.  `node tools/test-pages.mjs`
 *
 * Needs jsdom:  npm i --no-save jsdom
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..') + '/';
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

function shim(w) {
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  w.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
    unobserve() {}
  };
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.CSS = w.CSS || { escape: s => s.replace(/([^\w-])/g, '\\$1') };
  w.scrollTo = () => {};
  w.confirm = () => true;
}

let failures = 0;
for (const page of pages) {
  const vc = new VirtualConsole();
  const errs = [];
  vc.on('jsdomError', e => errs.push('jsdomError: ' + (e.stack || e.message).split('\n')[0]));
  vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));

  const dom = new JSDOM(fs.readFileSync(ROOT + page, 'utf8'),
    { url: 'http://localhost/' + page, runScripts: 'dangerously', virtualConsole: vc, pretendToBeVisual: true });
  const w = dom.window, doc = w.document;
  shim(w);

  for (const src of [...doc.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))) {
    try { w.eval(fs.readFileSync(ROOT + src, 'utf8')); }
    catch (e) { errs.push('script ' + src + ': ' + e.message); }
  }
  try { doc.dispatchEvent(new w.Event('DOMContentLoaded')); }
  catch (e) { errs.push('DCL: ' + e.message); }
  await new Promise(r => setTimeout(r, 120));

  const info = [];
  const need = (label, sel, min = 1) => {
    const n = doc.querySelectorAll(sel).length;
    info.push(`${label}=${n}`);
    if (n < min) errs.push(`expected at least ${min} of "${sel}", found ${n}`);
  };
  need('hdr', '#hdr .brand');
  if (page === 'index.html') { need('papers', '#paperCards .paper-card', 2); need('topics', '#topicList .topic', 11); }
  if (page === 'practice.html') { need('feedback', '#segFeedback button', 3); need('source', '#segSource button', 3); }
  if (page === 'mock.html') need('pastYears', '#pastPapers .past-year', 8);
  if (page === 'questions.html') need('items', '#bankList details', 100);
  if (page === 'progress.html') need('cards', '#dash section.panel', 7);

  if (errs.length) failures++;
  console.log((errs.length ? 'FAIL ' : 'ok   ') + page.padEnd(17) + info.join(' '));
  errs.slice(0, 3).forEach(e => console.log('       ' + e));
  dom.window.close();
}
console.log(failures ? `\n${failures} page(s) with errors` : `\nall ${pages.length} pages clean`);
process.exit(failures ? 1 : 0);
