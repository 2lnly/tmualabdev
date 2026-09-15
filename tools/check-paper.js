#!/usr/bin/env node
/* ============================================================
   Validate ONE transcribed paper against the official answer key.
   `node tools/check-paper.js 2019-P1`
   Read-only — safe to run while other papers are being written.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'past');
const LETTERS = 'ABCDEFGH';

const tag = process.argv[2];
if (!/^\d{4}-P[12]$/.test(tag || '')) {
  console.error('usage: node tools/check-paper.js <YYYY-P1|YYYY-P2>');
  process.exit(2);
}

const keys = JSON.parse(fs.readFileSync(path.join(DIR, 'answer-keys.json'), 'utf8'));
const key = keys[tag];
if (!key) { console.error(`no official key for ${tag}`); process.exit(2); }

const file = path.join(DIR, tag + '.json');
if (!fs.existsSync(file)) { console.error(`${file} does not exist yet`); process.exit(2); }

let qs;
try { qs = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.error(`${tag}.json is not valid JSON: ${e.message}`); process.exit(1); }

const TOPICS = {
  alg: [1, 2], seq: [1, 2], geo: [1, 2], trig: [1, 2], exp: [1, 2], cal: [1, 2], gra: [1, 2],
  log: [2], prf: [2], num: [2], ineq: [2]
};
const paper = +tag.slice(-1);

let bad = 0;
const err = (n, m) => { console.log(`  ERROR Q${n}: ${m}`); bad++; };

if (!Array.isArray(qs)) { console.error('the file must contain a JSON array'); process.exit(1); }
const seen = new Set();

for (const q of qs) {
  const n = q.n;
  if (!(n >= 1 && n <= 20)) { err(n, 'question number out of range'); continue; }
  if (seen.has(n)) err(n, 'duplicate question number');
  seen.add(n);

  if (!TOPICS[q.t]) err(n, `unknown topic "${q.t}"`);
  else if (!TOPICS[q.t].includes(paper)) err(n, `topic "${q.t}" is not examined on paper ${paper}`);
  if (!q.sp) err(n, 'missing spec point (sp)');
  if (!(q.d >= 1 && q.d <= 5)) err(n, 'difficulty must be 1..5');
  if (!q.q || !q.e) err(n, 'missing stem or worked answer');
  if (!Array.isArray(q.o) || q.o.length < 3) err(n, 'needs the full list of options');
  else {
    if (new Set(q.o).size !== q.o.length) err(n, 'two options are identical');
    if (!(q.a >= 0 && q.a < q.o.length)) err(n, 'answer index outside the options');
  }

  for (const [where, v] of [['stem', q.q], ['answer', q.e], ...(q.o || []).map((o, i) => [`option ${LETTERS[i]}`, o])]) {
    const s = String(v == null ? '' : v);
    if ((s.match(/\$/g) || []).length % 2) err(n, `${where}: unbalanced $`);
    for (const seg of s.match(/\$[^$]*\$/g) || []) {
      let d = 0, broke = false;
      for (const c of seg) { if (c === '{') d++; if (c === '}') d--; if (d < 0) broke = true; }
      if (d !== 0 || broke) err(n, `${where}: unbalanced braces in ${seg.slice(0, 50)}`);
    }
  }

  if (q.a >= 0 && q.a < (q.o || []).length) {
    const got = LETTERS[q.a], want = key[n - 1];
    if (got !== want) err(n, `marked ${got}, official key says ${want}`);
  }
}

for (let n = 1; n <= 20; n++) if (!seen.has(n)) err(n, 'missing');

console.log(`${tag}: ${qs.length} question(s), key ${key}`);
console.log(bad ? `\n${bad} problem(s) — fix these before reporting done` : '\nall 20 match the official key');
process.exit(bad ? 1 : 0);
