#!/usr/bin/env node
/* ============================================================
   TMUA Lab — static pages for search engines.
   `node tools/build-pages.js`  (also run by tools/build-past.js)

   The app renders questions in the browser, which search engines
   see as one page. This writes a plain, fully rendered HTML page
   for every past paper, every question and every topic, plus the
   sitemap — so "TMUA 2019 paper 2 question 14" has a real page to
   land on. Output is generated, gitignored, and rebuilt on deploy.

     papers/index.html                      all sixteen papers
     papers/<year>-paper-<n>/index.html     one paper, its questions, answer key
     papers/<year>-paper-<n>/question-<k>/  one question with worked solution
     topics/<topic>/index.html              every past-paper question on a topic
     sitemap.xml
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://tmua.dev';
const A = path.join(ROOT, 'assets', 'js');

/* ---------------- load the bank exactly as the browser does ---------------- */

function loadBank() {
  global.window = {
    location: { search: '', pathname: '/' },
    localStorage: { s: {}, getItem(k) { return this.s[k] || null; }, setItem(k, v) { this.s[k] = v; } }
  };
  for (const f of ['math', 'bank-past', 'bank-p1', 'bank-p2', 'core']) {
    const file = path.join(A, f + '.js');
    delete require.cache[require.resolve(file)];
    require(file);
  }
  const TL = global.window.TL;
  // The nav is defined in shell.js, which needs a DOM. Read the array literal
  // straight from source so the static header can never drift from the app's.
  const shell = fs.readFileSync(path.join(A, 'shell.js'), 'utf8');
  const m = shell.match(/TL\.NAV = (\[[\s\S]*?\]);/);
  if (!m) throw new Error('could not find TL.NAV in shell.js');
  TL.NAV = new Function('return ' + m[1])();
  return TL;
}

/* ---------------- helpers ---------------- */

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function clip(s, n) {
  s = String(s).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)) + '…';
}

/** JSON-LD must never contain a literal "</" or it can close the script tag. */
const ld = obj => '<script type="application/ld+json">' +
  JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* ---------------- URLs ---------------- */

const paperSlug = (y, p) => `${y}-paper-${p}`;
const U = {
  papers: () => '/papers/',
  paper: (y, p) => `/papers/${paperSlug(y, p)}/`,
  question: (y, p, n) => `/papers/${paperSlug(y, p)}/question-${n}/`,
  topic: t => `/topics/${slug(t.name)}/`
};

/* ---------------- page shell ---------------- */

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%2354d8f0'/><text y='72' x='50' text-anchor='middle' font-size='62' font-family='monospace' font-weight='bold' fill='%2303151b'>T</text></svg>";

function header(TL, current) {
  const links = TL.NAV.map(it => {
    const href = '/' + it.href;
    const cur = it.href === current ? ' aria-current="page"' : '';
    return `<a href="${href}"${cur}><i>${it.n}</i>${esc(it.label)}</a>`;
  }).join('');
  return `<header class="hdr"><div class="wrap hdr-in">
  <a class="brand" href="/"><span class="mark">T</span>TMUA <em>Lab</em></a>
  <nav class="nav" id="nav">${links}</nav>
  <div class="hdr-right">
    <button class="kbd-btn" id="themeBtn" title="Switch theme" aria-label="Switch theme">◐</button>
    <button class="burger" id="burger" aria-label="Menu"><span></span></button>
  </div>
</div></header>`;
}

const FOOTER = `<footer class="ftr"><div class="wrap ftr-in">
  <div class="disc">Past paper questions are the copyright of UAT-UK and are published by them free of charge as
    preparation material. Worked solutions are written for this site. Not affiliated with UAT-UK, Pearson VUE,
    Imperial College London, LSE, the University of Warwick, Durham University or the University of Cambridge.</div>
  <div class="links">
    <a href="/papers/">Past papers</a>
    <a href="/guide.html">Guide</a>
    <a href="/community.html">Community</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/terms.html">Terms</a>
  </div>
</div></footer>`;

function page({ TL, route, title, description, crumbs, body, extraLd, current = 'papers/' }) {
  const url = SITE + route;
  const crumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.href
    }))
  };
  const crumbHtml = crumbs.map((c, i) => i === crumbs.length - 1
    ? `<span aria-current="page">${esc(c.name)}</span>`
    : `<a href="${c.href}">${esc(c.name)}</a>`).join('<span class="sep">›</span>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0a0e12">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TMUA Lab">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/app.css">
${ld(crumbLd)}
${extraLd ? ld(extraLd) : ''}
</head>
<body>
<a class="skip" href="${route}#main">Skip to content</a>
${header(TL, current)}
<main id="main"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb">${crumbHtml}</nav>
${body}
</div></main>
${FOOTER}
<script src="/assets/js/static.js"></script>
</body>
</html>
`;
}

/* ---------------- pieces ---------------- */

function optionList(TL, q, reveal) {
  return '<ol class="opts opts-static">' + q.o.map((o, k) =>
    `<li><div class="opt${reveal && k === q.a ? ' correct' : ''}"><span class="let">${TL.LETTERS[k]}</span>` +
    `<span>${TL.tex(o)}</span></div></li>`).join('') + '</ol>';
}

function chips(TL, q) {
  const t = TL.topic(q.t);
  return `<a class="chip chip-p${q.p}" href="${U.paper(q.src.year, q.src.paper)}">TMUA ${q.src.year} · Paper ${q.src.paper}</a>` +
    `<a class="chip" href="${U.topic(t)}">${esc(t.name)}</a>` +
    `<span class="chip" style="border-style:dashed">${TL.tex(q.sp)}</span>` +
    `<span class="chip">${q.o.length} options</span>` +
    (TL.isHard(q) ? '<span class="chip chip-bad">hard</span>' : '');
}

/* ---------------- question page ---------------- */

function questionPage(TL, q, paperQs) {
  const { year, paper, number } = q.src;
  const idx = paperQs.indexOf(q);
  const prev = paperQs[idx - 1], next = paperQs[idx + 1];
  const t = TL.topic(q.t);
  const route = U.question(year, paper, number);
  const letter = TL.LETTERS[q.a];
  const stemPlain = TL.plain(q.q);

  const nav = paperQs.map(x =>
    `<a href="${U.question(year, paper, x.src.number)}"${x === q ? ' class="cur" aria-current="page"' : ''}>${x.src.number}</a>`
  ).join('');

  const body = `
<div class="app-head">
  <div class="eyebrow">TMUA ${year} · Paper ${paper} · Question ${number} of ${paperQs.length}</div>
  <h1 style="margin-top:14px">TMUA ${year} Paper ${paper} Question ${number}</h1>
  <p>${esc(t.name)} — ${TL.tex(q.sp)}. Try it first; the answer and a full worked solution are below.</p>
</div>

<div class="player">
  <div>
    <article class="panel q-card">
      <div class="q-meta">${chips(TL, q)}</div>
      ${q.fig ? `<p class="fig-note">The original question includes a diagram: ${TL.tex(q.fig)}</p>` : ''}
      <div class="q-stem">${TL.tex(q.q)}</div>
      ${optionList(TL, q, false)}
      <details class="reveal">
        <summary>Show the answer and worked solution</summary>
        <div class="explain">
          <div class="lab">answer · ${letter}</div>
          ${optionList(TL, q, true).replace('opts-static', 'opts-static opts-answer')}
          <div class="body">${TL.tex(q.e)}</div>
        </div>
      </details>
    </article>

    <nav class="pager" aria-label="Question navigation">
      ${prev ? `<a class="btn btn-ghost btn-sm" href="${U.question(year, paper, prev.src.number)}">← Question ${prev.src.number}</a>` : '<span></span>'}
      ${next ? `<a class="btn btn-primary btn-sm" href="${U.question(year, paper, next.src.number)}">Question ${next.src.number} →</a>`
             : `<a class="btn btn-primary btn-sm" href="${U.paper(year, paper)}">Back to the paper →</a>`}
    </nav>
  </div>

  <aside class="panel rail">
    <h4>TMUA ${year} Paper ${paper}</h4>
    <div class="rail-grid">${nav}</div>
    <div class="rail-cta">
      <a class="btn btn-accent btn-sm btn-block" href="/mock.html?past=${year}-${paper}">Sit this paper, timed</a>
      <a class="btn btn-ghost btn-sm btn-block" href="/practice.html?topic=${q.t}&amp;go=1">Practise ${esc(t.short.toLowerCase())}</a>
      <a class="btn btn-quiet btn-sm btn-block" href="${U.topic(t)}">All ${esc(t.short.toLowerCase())} questions</a>
    </div>
  </aside>
</div>`;

  return page({
    TL, route,
    title: `TMUA ${year} Paper ${paper} Question ${number} — Worked Solution | TMUA Lab`,
    description: clip(`TMUA ${year} Paper ${paper} Q${number} (${t.short}): ${stemPlain}`, 155) ,
    crumbs: [
      { name: 'TMUA Lab', href: '/' },
      { name: 'Past papers', href: U.papers() },
      { name: `${year} Paper ${paper}`, href: U.paper(year, paper) },
      { name: `Question ${number}`, href: route }
    ],
    body,
    extraLd: {
      '@context': 'https://schema.org', '@type': 'LearningResource',
      name: `TMUA ${year} Paper ${paper} Question ${number}`,
      description: clip(stemPlain, 300),
      learningResourceType: 'Practice problem',
      educationalLevel: 'A-level',
      teaches: t.name,
      inLanguage: 'en-GB',
      isAccessibleForFree: true,
      isPartOf: { '@type': 'CreativeWork', name: `TMUA ${year} Paper ${paper}`, url: SITE + U.paper(year, paper) }
    }
  });
}

/* ---------------- paper page ---------------- */

function paperPage(TL, year, paper, qs) {
  const route = U.paper(year, paper);
  const full = TL.PAPERS[paper].full;
  const topics = {};
  qs.forEach(q => { const t = TL.topic(q.t); topics[t.name] = (topics[t.name] || 0) + 1; });
  const mix = Object.entries(topics).sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} (${c})`).join(', ');

  const rows = qs.map(q => {
    const t = TL.topic(q.t);
    return `<li><a class="qrow" href="${U.question(year, paper, q.src.number)}">
      <span class="ix">${q.src.number}</span>
      <span class="tt">${esc(clip(TL.plain(q.q), 110))}</span>
      <span class="chip">${esc(t.short)}</span>
      ${TL.isHard(q) ? '<span class="chip chip-bad">hard</span>' : ''}
    </a></li>`;
  }).join('');

  const key = qs.map(q => `<span><b>${q.src.number}</b> ${TL.LETTERS[q.a]}</span>`).join('');
  const other = paper === 1 ? 2 : 1;

  const body = `
<div class="app-head">
  <div class="eyebrow">past paper · ${year}</div>
  <h1 style="margin-top:14px">TMUA ${year} Paper ${paper}</h1>
  <p>${esc(full)}. All ${qs.length} questions from the ${year} paper, each with a full worked solution.
    Topics on this paper: ${esc(mix)}.</p>
</div>

<div class="callout" style="margin-bottom:22px">
  <div>
    <h3>Sit it properly first</h3>
    <p>Twenty questions, seventy-five minutes, no calculator, in a replica of the real test driver. Reading the
      solutions before you have tried a paper spends it.</p>
  </div>
  <div class="right">
    <a class="btn btn-primary" href="/mock.html?past=${year}-${paper}">Sit ${year} Paper ${paper}</a>
    <a class="btn btn-ghost" href="${U.paper(year, other)}">${year} Paper ${other}</a>
  </div>
</div>

<h2 class="sec-title">Questions</h2>
<ul class="qlist panel" style="overflow:hidden">${rows}</ul>

<details class="panel keybox">
  <summary>Answer key for TMUA ${year} Paper ${paper}</summary>
  <div class="key">${key}</div>
</details>`;

  return page({
    TL, route,
    title: `TMUA ${year} Paper ${paper} — All Questions with Worked Solutions | TMUA Lab`,
    description: clip(`Every question from TMUA ${year} Paper ${paper} (${full}) with worked solutions and the answer key. Sit it free in a replica of the real test driver.`, 158),
    crumbs: [
      { name: 'TMUA Lab', href: '/' },
      { name: 'Past papers', href: U.papers() },
      { name: `${year} Paper ${paper}`, href: route }
    ],
    body
  });
}

/* ---------------- papers index ---------------- */

function papersIndex(TL, groups) {
  const years = [...new Set(groups.map(g => g.year))].sort((a, b) => b - a);
  const total = groups.reduce((s, g) => s + g.qs.length, 0);

  const rows = years.map(y => {
    const cells = [1, 2].map(p => {
      const g = groups.find(x => x.year === y && x.paper === p);
      if (!g) return '';
      return `<a class="past-btn${p === 2 ? ' p2' : ''}" href="${U.paper(y, p)}">
        <span class="pn">Paper ${p}</span><span class="ps">${g.qs.length} questions</span></a>`;
    }).join('');
    return `<div class="past-year"><span class="py">${y}</span>${cells}</div>`;
  }).join('');

  const body = `
<div class="app-head">
  <div class="eyebrow">past papers</div>
  <h1 style="margin-top:14px">TMUA past papers, 2016 to 2023</h1>
  <p>Every TMUA paper UAT-UK has published — ${groups.length} papers, ${total} questions — with a full worked
    solution for each question and the answer key for each paper. Every answer has been checked against the
    official key.</p>
</div>

<div class="past-grid">${rows}</div>

<section class="prose-block">
  <h2>How to use them</h2>
  <p>There are only sixteen, and a paper you have already read cannot be sat cold again. Build your speed on
    practice sets first, keep 2022 and 2023 for the last fortnight, and work the older papers hardest. When you
    do sit one, use the timed driver rather than reading down the page — seventy-five minutes for twenty questions
    is the whole difficulty of the test.</p>
  <p><b>Paper 1</b> is Applications of Mathematical Knowledge. <b>Paper 2</b> is Mathematical Reasoning: logic,
    necessary and sufficient conditions, proof and counterexample. Both are non-calculator.</p>
  <p>The original PDFs, with UAT-UK's own worked answers, are published free at
    <a href="https://esat-tmua.ac.uk/tmua-preparation-materials/" rel="noopener">esat-tmua.ac.uk</a>.</p>
  <h2>By topic</h2>
  <div class="topics">${TL.TOPICS.map(t => {
    const n = TL.BANK.filter(q => q.src && q.t === t.k).length;
    return n ? `<a class="topic${t.p === 2 ? ' p2' : ''}" href="${U.topic(t)}"><span class="dot"></span>
      <span class="tn">${esc(t.name)}</span><span class="tc">${n}</span></a>` : '';
  }).join('')}</div>
</section>`;

  return page({
    TL, route: U.papers(),
    title: 'TMUA Past Papers 2016–2023 with Worked Solutions | TMUA Lab',
    description: `All ${groups.length} TMUA past papers from 2016 to 2023 — ${total} questions, each with a worked solution, plus answer keys. Sit any paper free under real timed conditions.`,
    crumbs: [{ name: 'TMUA Lab', href: '/' }, { name: 'Past papers', href: U.papers() }],
    body
  });
}

/* ---------------- topic page ---------------- */

function topicPage(TL, t) {
  const qs = TL.BANK.filter(q => q.src && q.t === t.k)
    .sort((a, b) => b.src.year - a.src.year || a.src.paper - b.src.paper || a.src.number - b.src.number);
  const route = U.topic(t);
  const byYear = {};
  qs.forEach(q => { (byYear[q.src.year] = byYear[q.src.year] || []).push(q); });

  const sections = Object.keys(byYear).sort((a, b) => b - a).map(y => `
<h2 class="sec-title">${y}</h2>
<ul class="qlist panel" style="overflow:hidden">${byYear[y].map(q => `
  <li><a class="qrow" href="${U.question(q.src.year, q.src.paper, q.src.number)}">
    <span class="ix">P${q.src.paper}</span>
    <span class="tt">Q${q.src.number} · ${esc(clip(TL.plain(q.q), 100))}</span>
    ${TL.isHard(q) ? '<span class="chip chip-bad">hard</span>' : ''}
  </a></li>`).join('')}</ul>`).join('');

  const body = `
<div class="app-head">
  <div class="eyebrow">topic</div>
  <h1 style="margin-top:14px">TMUA ${esc(t.name.toLowerCase())} questions</h1>
  <p>All ${qs.length} ${esc(t.name.toLowerCase())} questions from the TMUA past papers, 2016 to 2023, newest first,
    each with a worked solution.</p>
  <div class="pill-row" style="margin-top:18px">
    <a class="btn btn-primary btn-sm" href="/practice.html?topic=${t.k}&amp;go=1">Practise ${esc(t.short.toLowerCase())} now, timed</a>
    <a class="btn btn-ghost btn-sm" href="/papers/">All past papers</a>
  </div>
</div>
${sections}`;

  return page({
    TL, route,
    title: `TMUA ${t.name} Questions — Past Papers with Solutions | TMUA Lab`,
    description: `All ${qs.length} ${t.name.toLowerCase()} questions from the TMUA past papers 2016–2023, each with a full worked solution. Practise them free under timed conditions.`,
    crumbs: [
      { name: 'TMUA Lab', href: '/' },
      { name: 'Past papers', href: U.papers() },
      { name: t.name, href: route }
    ],
    body
  });
}

/* ---------------- sitemap ---------------- */

// The app pages Cloudflare serves at clean URLs. review/progress hold only the
// visitor's own local data and 404 is an error page, so none of those are listed.
const ROOT_PAGES = [
  ['/', 1.0], ['/papers/', 0.9], ['/practice', 0.8], ['/mock', 0.8], ['/guide', 0.8],
  ['/questions', 0.6], ['/community', 0.3], ['/privacy', 0.2], ['/terms', 0.2]
];

function sitemap(routes) {
  const urls = routes.map(([r, p]) =>
    `  <url><loc>${SITE}${r}</loc><priority>${p.toFixed(1)}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ---------------- run ---------------- */

function run() {
  const TL = loadBank();
  const past = TL.BANK.filter(q => q.src);

  // clear previous output so a removed question never lingers
  for (const d of ['papers', 'topics']) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });

  const groups = [];
  past.forEach(q => {
    let g = groups.find(x => x.year === q.src.year && x.paper === q.src.paper);
    if (!g) groups.push(g = { year: q.src.year, paper: q.src.paper, qs: [] });
    g.qs.push(q);
  });
  groups.forEach(g => g.qs.sort((a, b) => a.src.number - b.src.number));
  groups.sort((a, b) => b.year - a.year || a.paper - b.paper);

  const routes = [...ROOT_PAGES];
  write('papers/index.html', papersIndex(TL, groups));

  for (const g of groups) {
    write(`papers/${paperSlug(g.year, g.paper)}/index.html`, paperPage(TL, g.year, g.paper, g.qs));
    routes.push([U.paper(g.year, g.paper), 0.8]);
    for (const q of g.qs) {
      write(`papers/${paperSlug(g.year, g.paper)}/question-${q.src.number}/index.html`, questionPage(TL, q, g.qs));
      routes.push([U.question(g.year, g.paper, q.src.number), 0.6]);
    }
  }

  let topicCount = 0;
  for (const t of TL.TOPICS) {
    if (!past.some(q => q.t === t.k)) continue;
    write(`topics/${slug(t.name)}/index.html`, topicPage(TL, t));
    routes.push([U.topic(t), 0.7]);
    topicCount++;
  }

  write('sitemap.xml', sitemap(routes));
  console.log(`static pages: ${groups.length} papers, ${past.length} questions, ${topicCount} topics, sitemap of ${routes.length} URLs`);
}

module.exports = { run };
if (require.main === module) run();
