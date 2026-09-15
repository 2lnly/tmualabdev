#!/usr/bin/env node
/* ============================================================
   TMUA Lab — bank validator.  `node tools/check.js`
   No dependencies. Checks structure, LaTeX balance, rendering,
   duplicate options and prose accidentally left inside $…$.
   ============================================================ */
'use strict';
const path = require('path');
const A = path.join(__dirname, '..', 'assets', 'js');

global.window = {
  location: { search: '' },
  localStorage: { s: {}, getItem(k) { return this.s[k] || null; }, setItem(k, v) { this.s[k] = v; } }
};
['math', 'bank-p1', 'bank-p2', 'bank-past', 'core'].forEach(f => require(path.join(A, f + '.js')));
const TL = global.window.TL;

let errors = 0, warnings = 0;
const err = (id, msg) => { console.log('  ERROR  ' + id + '  ' + msg); errors++; };
const warn = (id, msg) => { console.log('  warn   ' + id + '  ' + msg); warnings++; };

const seen = new Set();
const PROSE = /\b(or|and|for|all|the|where|with|is|are|then|not|of|to|if|has|have|its|by|be)\b/;

for (const q of TL.BANK) {
  const id = q.id || '(no id)';
  if (!q.id) err(id, 'missing id');
  if (seen.has(q.id)) err(id, 'duplicate id');
  seen.add(q.id);

  if (![1, 2].includes(q.p)) err(id, 'paper must be 1 or 2');
  if (!TL.TOPICS.some(t => t.k === q.t)) err(id, 'unknown topic "' + q.t + '"');
  var top = TL.topic(q.t);
  if ((top.on || [top.p]).indexOf(q.p) < 0) err(id, 'topic ' + q.t + ' is not examined on paper ' + q.p);
  if (!q.sp) err(id, 'missing spec point');
  if (!(q.d >= 1 && q.d <= 5)) err(id, 'difficulty must be 1..5');
  if (!Array.isArray(q.o) || q.o.length < TL.EXAM.optionsMin || q.o.length > TL.EXAM.optionsMax) {
    err(id, 'needs between ' + TL.EXAM.optionsMin + ' and ' + TL.EXAM.optionsMax + ' options');
  } else if (q.o.length < 6 && !q.src) {
    warn(id, 'only ' + q.o.length + ' options — the real paper usually offers 6 to 8');
  }
  if (!(q.a >= 0 && q.a < (q.o || []).length)) err(id, 'answer index out of range');
  if (!q.e) err(id, 'missing worked answer');

  if (Array.isArray(q.o) && new Set(q.o).size !== q.o.length) err(id, 'duplicate options');

  const fields = [['stem', q.q], ['answer', q.e]].concat((q.o || []).map((o, i) => ['option ' + i, o]));
  for (const [where, raw] of fields) {
    const s = String(raw == null ? '' : raw);
    if (!s.trim()) { err(id, where + ' is empty'); continue; }
    if ((s.match(/\$/g) || []).length % 2) err(id, where + ': unbalanced $');
    for (const seg of s.match(/\$[^$]*\$/g) || []) {
      let d = 0, bad = false;
      for (const c of seg) { if (c === '{') d++; if (c === '}') d--; if (d < 0) bad = true; }
      if (d !== 0 || bad) err(id, where + ': unbalanced braces in ' + seg);
      if (PROSE.test(seg.slice(1, -1).replace(/\\[a-zA-Z]+/g, ' '))) {
        warn(id, where + ': prose inside maths — ' + seg);
      }
    }
    try { TL.tex(s); } catch (e) { err(id, where + ': render threw — ' + e.message); }
  }
}

// every LaTeX macro used must be one the renderer actually knows — an unknown
// one renders as its own name in upright text, which is a silent visual bug
const mathSrc = require('fs').readFileSync(path.join(A, 'math.js'), 'utf8');
const symBlock = (mathSrc.match(/var SYM = \{([\s\S]*?)\n  \};/) || ['', ''])[1];
const known = new Set([
  ...[...symBlock.matchAll(/(?:^|[,{\s])'?([A-Za-z]+)'?\s*:/g)].map(m => m[1]),
  ...(mathSrc.match(/var FNS = \(([\s\S]*?)\)\.split/) || ['', ''])[1]
      .replace(/['+\n]/g, ' ').trim().split(/\s+/),
  'frac', 'dfrac', 'tfrac', 'sqrt', 'text', 'mathrm', 'mbox', 'operatorname', 'mathbb',
  'left', 'right', 'big', 'Big', 'bigl', 'bigr', 'displaystyle', 'quad', 'qquad',
  'overline', 'bar', 'binom', 'begin', 'end', 'vec', 'overrightarrow', 'dot', 'ddot'
]);
for (const q of TL.BANK) {
  const seenMacro = new Set();
  for (const field of [q.q, q.e, ...(q.o || [])]) {
    for (const m of String(field).matchAll(/\\([a-zA-Z]+)/g)) {
      if (!known.has(m[1]) && !seenMacro.has(m[1])) {
        seenMacro.add(m[1]);
        err(q.id, `uses \\${m[1]}, which the renderer does not know`);
      }
    }
  }
}

// coverage: every topic must hold enough questions to build a full paper
const per = {};
TL.BANK.forEach(q => { per[q.t] = (per[q.t] || 0) + 1; });
for (const p of [1, 2]) {
  const topics = TL.topicsFor(p);
  const need = Math.floor(TL.EXAM.questions / topics.length);
  const total = topics.reduce((s, t) => s + (per[t.k] || 0), 0);
  if (total < TL.EXAM.questions) err('paper ' + p, 'only ' + total + ' questions, a paper needs ' + TL.EXAM.questions);
  topics.forEach(t => {
    if ((per[t.k] || 0) < need) warn(t.k, 'has ' + (per[t.k] || 0) + ', a paper wants ' + need);
  });
}

console.log('\nBank: ' + TL.BANK.length + ' questions');
[1, 2].forEach(p => {
  const t = TL.TOPICS.filter(x => x.p === p);
  console.log('  Paper ' + p + ': ' + TL.BANK.filter(q => q.p === p).length +
    '  (' + t.map(x => x.short + ' ' + (per[x.k] || 0)).join(', ') + ')');
});
const hard = TL.BANK.filter(q => TL.isHard(q)).length;
console.log('  hard questions (facility < 25%): ' + hard);
console.log('\n' + (errors ? errors + ' error(s)' : 'no errors') + ', ' + warnings + ' warning(s)');
process.exit(errors ? 1 : 0);
