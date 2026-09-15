/* ============================================================
   TMUA Lab — core: taxonomy, storage, scoring, review queue.
   Everything is local to the browser; no network, no account.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});

  /* ---------------- taxonomy ---------------- */

  TL.PAPERS = {
    1: { n: 1, key: 'p1', name: 'Paper 1', full: 'Applications of Mathematical Knowledge',
         blurb: 'Pure AS-level content applied at speed: algebra, sequences, coordinate geometry, trigonometry, logarithms and calculus.' },
    2: { n: 2, key: 'p2', name: 'Paper 2', full: 'Mathematical Reasoning',
         blurb: 'Logic, necessary and sufficient conditions, proof and counterexample, number and inequalities — the same syllabus, argued rather than computed.' }
  };

  // `on` lists the papers a topic can appear in. The content topics are
  // examined on both papers — Paper 2 argues about the same syllabus rather
  // than covering a different one — while the reasoning topics are Paper 2 only.
  TL.TOPICS = [
    { k: 'alg',  p: 1, on: [1, 2], name: 'Algebra and functions',        short: 'Algebra' },
    { k: 'seq',  p: 1, on: [1, 2], name: 'Sequences and series',         short: 'Sequences' },
    { k: 'geo',  p: 1, on: [1, 2], name: 'Coordinate geometry',          short: 'Geometry' },
    { k: 'trig', p: 1, on: [1, 2], name: 'Trigonometry',                 short: 'Trigonometry' },
    { k: 'exp',  p: 1, on: [1, 2], name: 'Exponentials and logarithms',  short: 'Logarithms' },
    { k: 'cal',  p: 1, on: [1, 2], name: 'Differentiation and integration', short: 'Calculus' },
    { k: 'gra',  p: 1, on: [1, 2], name: 'Graphs and transformations',   short: 'Graphs' },
    { k: 'log',  p: 2, on: [2],    name: 'Logic and arguments',          short: 'Logic' },
    { k: 'prf',  p: 2, on: [2],    name: 'Proof and counterexample',     short: 'Proof' },
    { k: 'num',  p: 2, on: [2],    name: 'Number and divisibility',      short: 'Number' },
    { k: 'ineq', p: 2, on: [2],    name: 'Inequalities and reasoning',   short: 'Inequalities' }
  ];

  /** Topics examinable on a given paper. */
  TL.topicsFor = function (paper) {
    return TL.TOPICS.filter(function (t) { return (t.on || [t.p]).indexOf(paper) >= 0; });
  };

  TL.topic = function (k) {
    for (var i = 0; i < TL.TOPICS.length; i++) if (TL.TOPICS[i].k === k) return TL.TOPICS[i];
    return { k: k, p: 1, name: k, short: k };
  };

  /* Real-paper constants. */
  TL.EXAM = {
    questions: 20,        // per paper
    minutes: 75,          // per paper
    optionsMin: 4,        // the real paper varies: Paper 1 runs 5-7,
    optionsMax: 8,        // Paper 2 runs 4-8, most often 8

    secondsPerQ: 225,     // 75 * 60 / 20
    boardName: 'UAT-UK',
    centre: 'Pearson VUE'
  };

  TL.LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  /* ---------------- deterministic pseudo-randomness ---------------- */

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  TL.hash = hash;

  /** Deterministic value in [0,1) from a string seed. */
  function rand01(seed) { return (hash(seed) % 100000) / 100000; }

  TL.shuffle = function (arr, seed) {
    var a = arr.slice(), s = hash(String(seed == null ? Math.random() : seed));
    for (var i = a.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      var j = s % (i + 1);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  /* ---------------- calibrated question statistics ---------------- */

  // Facility by difficulty 1..5, anchored on the real past papers: their own
  // difficulty mix comes out at a mean facility of 0.50, which is what the
  // published cohort actually averages (about 10 marks out of 20). Questions
  // written for this site sit above that line, and the scoring model discounts
  // them accordingly — doing well on an easy set should not read as a 9.
  var BASE_P = [0.93, 0.83, 0.67, 0.47, 0.22];

  /** Calibrated proportion answering correctly (0..1). */
  TL.facility = function (q) {
    var base = BASE_P[(q.d || 3) - 1];
    var jitter = (rand01(q.id + ':f') - 0.5) * 0.07;
    return Math.min(0.95, Math.max(0.06, base + jitter));
  };

  /** Calibrated median time on a question, in seconds. */
  TL.targetTime = function (q) {
    var base = 85 + (q.d || 3) * 32;
    return Math.round(base + (rand01(q.id + ':t') - 0.5) * 40);
  };

  /** A question is "hard" when fewer than a quarter of candidates get it right. */
  TL.isHard = function (q) { return TL.facility(q) < 0.25; };

  /* ---------------- storage ---------------- */

  var KEY = 'tmualab.v1';

  function blank() {
    return {
      v: 1,
      seen: {},        // qid -> 1  (served in practice or a mock)
      attempts: [],    // {q, ok, ms, mode, at}
      sessions: [],    // completed sittings
      review: {},      // qid -> {due, ok, at}
      cleared: {},     // qid -> when it left the queue, so a merge cannot resurrect it
      prefs: { theme: '', lastMode: 'relaxed' },
      cutoff: {}       // topic key -> timestamp of "reset and practise again"
    };
  }

  var cache = null;

  function load() {
    if (cache) return cache;
    try {
      var raw = root.localStorage.getItem(KEY);
      cache = raw ? JSON.parse(raw) : blank();
    } catch (e) { cache = blank(); }
    var b = blank();
    for (var k in b) if (cache[k] === undefined) cache[k] = b[k];
    return cache;
  }

  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) { /* private mode */ }
  }

  TL.db = { load: load, save: save,
    reset: function () { cache = blank(); save(); },
    raw: function () { return load(); } };

  /** Small persisted preferences (feedback timing, last-used options). */
  TL.prefs = {
    get: function (k, dflt) {
      var v = load().prefs[k];
      return v === undefined ? dflt : v;
    },
    set: function (k, v) { load().prefs[k] = v; save(); }
  };

  /* ---------------- question pools ---------------- */

  TL.byId = function (id) {
    var B = TL.BANK;
    for (var i = 0; i < B.length; i++) if (B[i].id === id) return B[i];
    return null;
  };

  TL.pool = function (opts) {
    opts = opts || {};
    var db = load();
    return TL.BANK.filter(function (q) {
      if (opts.paper && q.p !== opts.paper) return false;
      if (opts.topics && opts.topics.length && opts.topics.indexOf(q.t) < 0) return false;
      if (opts.hardOnly && !TL.isHard(q)) return false;
      if (opts.source === 'past' && !q.src) return false;
      if (opts.source === 'lab' && q.src) return false;
      if (opts.unseenOnly && db.seen[q.id]) return false;
      return true;
    });
  };

  /** Build a practice set. Unseen questions first, spread across topics. */
  TL.buildSet = function (opts) {
    var n = opts.count || 10;
    var filt = { paper: opts.paper, topics: opts.topics, hardOnly: opts.hardOnly, source: opts.source };
    var fresh = TL.pool({ paper: filt.paper, topics: filt.topics, hardOnly: filt.hardOnly,
                          source: filt.source, unseenOnly: true });
    var all = TL.pool(filt);
    var seed = opts.seed || (Date.now() + '');
    var chosen = TL.shuffle(fresh, seed).slice(0, n);
    if (chosen.length < n) {
      var have = {}; chosen.forEach(function (q) { have[q.id] = 1; });
      var top = TL.shuffle(all.filter(function (q) { return !have[q.id]; }), seed + 'x');
      chosen = chosen.concat(top.slice(0, n - chosen.length));
    }
    // Serve them in the drawn order. A real paper does not open with its
    // easiest question, and sorting by difficulty made every set feel soft.
    return TL.shuffle(chosen, seed + 'o');
  };

  /**
   * Build one full paper: 20 questions spread over that paper's topics.
   * opts.fixed draws from the whole pool regardless of what has been seen, so
   * the same seed always produces the same paper for every candidate.
   */
  TL.buildPaper = function (paper, seed, opts) {
    opts = opts || {};
    // A mock should be built from real questions unless told otherwise.
    var source = opts.source === undefined ? 'past' : opts.source;
    var topics = TL.topicsFor(paper).filter(function (t) {
      return TL.pool({ paper: paper, topics: [t.k], source: source }).length > 0;
    });
    var per = Math.floor(TL.EXAM.questions / topics.length);
    var out = [], used = {};
    topics.forEach(function (t) {
      var any = TL.pool({ paper: paper, topics: [t.k], source: source });
      var fresh = opts.fixed ? any
        : TL.pool({ paper: paper, topics: [t.k], source: source, unseenOnly: true });
      var take = TL.shuffle(fresh.length >= per ? fresh : any, seed + t.k).slice(0, per);
      take.forEach(function (q) { used[q.id] = 1; out.push(q); });
    });
    var rest = TL.shuffle(TL.pool({ paper: paper, source: source })
      .filter(function (q) { return !used[q.id]; }), seed + 'r');
    while (out.length < TL.EXAM.questions && rest.length) out.push(rest.shift());
    return TL.shuffle(out, seed + 'z');
  };

  /* ---------------- past papers ---------------- */

  /** The real papers the bank holds in full, newest first. */
  TL.pastPapers = function () {
    var byTag = {};
    TL.BANK.forEach(function (q) {
      if (!q.src) return;
      var tag = q.src.year + '-P' + q.src.paper;
      (byTag[tag] = byTag[tag] || { year: q.src.year, paper: q.src.paper, qs: [] }).qs.push(q);
    });
    return Object.keys(byTag).map(function (tag) {
      var p = byTag[tag];
      p.tag = tag;
      p.complete = p.qs.length === TL.EXAM.questions;
      return p;
    }).sort(function (a, b) {
      return b.year - a.year || a.paper - b.paper;
    });
  };

  /** One real paper, in its original question order. */
  TL.buildPastPaper = function (year, paper) {
    return TL.BANK.filter(function (q) {
      return q.src && q.src.year === year && q.src.paper === paper;
    }).sort(function (a, b) { return a.src.number - b.src.number; });
  };

  /* ---------------- review queue ---------------- */

  var REST_MS = 36 * 3600 * 1000;   // 36 hours between the two correct answers
  TL.REST_HOURS = 36;

  TL.reviewDue = function (now) {
    now = now || Date.now();
    var db = load(), out = [];
    for (var id in db.review) {
      var r = db.review[id];
      var q = TL.byId(id);
      if (q && r.due <= now) out.push(q);
    }
    return out;
  };

  TL.reviewResting = function (now) {
    now = now || Date.now();
    var db = load(), out = [];
    for (var id in db.review) {
      var r = db.review[id];
      if (r.due > now && TL.byId(id)) out.push({ q: TL.byId(id), due: r.due });
    }
    return out.sort(function (a, b) { return a.due - b.due; });
  };

  TL.reviewCount = function () {
    return { due: TL.reviewDue().length, resting: TL.reviewResting().length };
  };

  function reviewMark(id, ok, mode, now) {
    var db = load();
    if (!ok) {
      db.review[id] = { due: now, ok: 0, at: now };
      return;
    }
    if (mode !== 'review') return;      // only review answers clear the queue
    var r = db.review[id];
    if (!r) return;
    if (r.ok >= 1) { delete db.review[id]; db.cleared = db.cleared || {}; db.cleared[id] = now; }
    else db.review[id] = { due: now + REST_MS, ok: 1, at: now };
  }

  /* ---------------- recording ---------------- */

  /**
   * Record one answered question.
   * mode: 'practice' | 'mock' | 'review'
   */
  TL.record = function (qid, ok, ms, mode) {
    var db = load(), now = Date.now();
    if (mode !== 'review') db.seen[qid] = 1;
    db.attempts.push({ q: qid, ok: ok ? 1 : 0, ms: ms, mode: mode, at: now });
    if (db.attempts.length > 6000) db.attempts.splice(0, db.attempts.length - 6000);
    reviewMark(qid, ok, mode, now);
    save();
  };

  TL.saveSession = function (s) {
    var db = load();
    s.id = 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    db.sessions.unshift(s);
    if (db.sessions.length > 200) db.sessions.length = 200;
    save();
    return s.id;
  };

  TL.deleteSession = function (id) {
    var db = load();
    for (var i = 0; i < db.sessions.length; i++) {
      if (db.sessions[i].id === id) {
        // the questions go straight back into the pool
        (db.sessions[i].items || []).forEach(function (it) { delete db.seen[it.q]; });
        db.sessions.splice(i, 1);
        save();
        return true;
      }
    }
    return false;
  };

  TL.getSession = function (id) {
    var db = load();
    for (var i = 0; i < db.sessions.length; i++) if (db.sessions[i].id === id) return db.sessions[i];
    return null;
  };

  /** "Reset and practise again": reopen a paper without deleting history. */
  TL.resetPaper = function (paper) {
    var db = load();
    TL.BANK.forEach(function (q) { if (q.p === paper) delete db.seen[q.id]; });
    db.cutoff['p' + paper] = Date.now();
    save();
  };

  /* ---------------- scoring ---------------- */

  // Proportion of the (difficulty-adjusted) paper correct -> TMUA scaled score.
  var CURVE = [
    [0.00, 1.0], [0.10, 2.0], [0.20, 2.9], [0.30, 3.7], [0.40, 4.4],
    [0.50, 5.1], [0.60, 5.9], [0.70, 6.7], [0.80, 7.6], [0.90, 8.5], [1.00, 9.0]
  ];

  // TMUA scaled score -> percentage of candidates at or below.
  var PCTL = [
    [1.0, 1], [2.0, 5], [3.0, 14], [4.0, 30], [4.5, 40], [5.0, 50],
    [5.5, 60], [6.0, 70], [6.5, 79], [7.0, 86], [7.5, 91], [8.0, 95],
    [8.5, 97.5], [9.0, 99.5]
  ];

  function interp(table, x) {
    if (x <= table[0][0]) return table[0][1];
    var last = table[table.length - 1];
    if (x >= last[0]) return last[1];
    for (var i = 1; i < table.length; i++) {
      if (x <= table[i][0]) {
        var a = table[i - 1], b = table[i];
        return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
    }
    return last[1];
  }

  /**
   * Score a completed set.
   * items: [{q: id, ans: index|null, ok: bool}]
   * Returns null for sets under 10 questions.
   */
  TL.scoreSet = function (items) {
    var n = items.length;
    if (n < 10) return null;

    var mark = 0, expected = 0, hardest = null, hardestP = 2;
    items.forEach(function (it) {
      var q = TL.byId(it.q); if (!q) return;
      var p = TL.facility(q);
      expected += p;
      if (it.ok) mark++;
      if (p < hardestP) { hardestP = p; hardest = q; }
    });

    var avgP = expected / n;                     // how kind the paper was
    var raw = mark / n;

    // Re-express the result as the proportion this candidate would have scored
    // on a paper of average difficulty. Working in log-odds keeps the transform
    // monotonic and leaves a perfect (or empty) paper alone.
    var logit = function (x) { return Math.log(x / (1 - x)); };
    var adj;
    if (mark === n) adj = 1;
    else if (mark === 0) adj = 0;
    else {
      var corrected = (mark + 0.5) / (n + 1);   // continuity correction
      var shifted = logit(corrected) - logit(Math.min(0.94, Math.max(0.06, avgP)));
      adj = 1 / (1 + Math.exp(-shifted));
    }

    var score = interp(CURVE, adj);

    // Short sets are pulled towards the middle and flagged as indicative.
    var indicative = n < TL.EXAM.questions;
    if (n < 20) {
      var w = (n - 10) / 10;                     // 0 at 10 questions, 1 at 20
      score = 5.1 + (score - 5.1) * (0.55 + 0.45 * w);
    }
    score = Math.round(Math.min(9, Math.max(1, score)) * 10) / 10;

    return {
      score: score,
      mark: mark,
      total: n,
      raw: raw,
      expected: Math.round(expected * 10) / 10,
      avgP: avgP,
      adjusted: adj,
      percentile: Math.round(interp(PCTL, score) * 10) / 10,
      indicative: indicative,
      paperTone: avgP > 0.55 ? 'kinder than a typical paper'
               : avgP < 0.45 ? 'harder than a typical paper'
               : 'about as hard as a typical paper',
      hardest: hardest
    };
  };

  /** Overall TMUA score is the mean of the two papers. */
  TL.overall = function (s1, s2) {
    if (s1 == null || s2 == null) return null;
    return Math.round(((s1 + s2) / 2) * 10) / 10;
  };

  TL.percentileFor = function (score) { return Math.round(interp(PCTL, score) * 10) / 10; };

  /* ---------------- derived statistics ---------------- */

  TL.stats = function () {
    var db = load();
    var att = db.attempts;
    var seen = Object.keys(db.seen).length;
    var ok = 0, ms = 0, timed = 0;
    att.forEach(function (a) {
      if (a.ok) ok++;
      if (a.ms > 4000 && a.ms < 600000) { ms += a.ms; timed++; }
    });
    return {
      answered: att.length,
      correct: ok,
      accuracy: att.length ? ok / att.length : null,
      avgMs: timed ? ms / timed : null,
      seen: seen,
      bank: TL.BANK.length,
      sessions: db.sessions.length
    };
  };

  TL.paperStats = function (paper) {
    var db = load();
    var qs = TL.BANK.filter(function (q) { return q.p === paper; });
    var seen = 0;
    qs.forEach(function (q) { if (db.seen[q.id]) seen++; });
    var first = {}, ok = 0, n = 0;
    db.attempts.forEach(function (a) {
      var q = TL.byId(a.q);
      if (!q || q.p !== paper) return;
      if (first[a.q]) return;
      first[a.q] = 1; n++; if (a.ok) ok++;
    });
    return { total: qs.length, seen: seen, answered: n, accuracy: n ? ok / n : null };
  };

  TL.topicStats = function (key) {
    var db = load();
    var qs = TL.BANK.filter(function (q) { return q.t === key; });
    var ids = {}; qs.forEach(function (q) { ids[q.id] = 1; });
    var n = 0, ok = 0, seen = 0, first = {};
    qs.forEach(function (q) { if (db.seen[q.id]) seen++; });
    db.attempts.forEach(function (a) {
      if (!ids[a.q] || first[a.q]) return;
      first[a.q] = 1; n++; if (a.ok) ok++;
    });
    return { total: qs.length, seen: seen, answered: n, accuracy: n ? ok / n : null };
  };

  /** Days on which at least one question was answered, most recent last. */
  TL.activity = function (days) {
    days = days || 91;
    var db = load(), map = {};
    db.attempts.forEach(function (a) {
      var d = new Date(a.at); d.setHours(0, 0, 0, 0);
      var k = d.getTime();
      map[k] = (map[k] || 0) + 1;
    });
    var out = [], today = new Date(); today.setHours(0, 0, 0, 0);
    for (var i = days - 1; i >= 0; i--) {
      var t = today.getTime() - i * 86400000;
      out.push({ t: t, n: map[t] || 0 });
    }
    return out;
  };

  TL.streak = function () {
    var act = TL.activity(400), i = act.length - 1, run = 0;
    if (i >= 0 && act[i].n === 0) i--;           // today not started yet is fine
    for (; i >= 0; i--) {
      if (act[i].n > 0) run++; else break;
    }
    return run;
  };

  /* ---------------- formatting ---------------- */

  TL.fmtTime = function (ms) {
    if (ms == null || !isFinite(ms)) return '—';
    var s = Math.round(ms / 1000);
    var m = Math.floor(s / 60); s -= m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  TL.fmtClock = function (sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    return (h ? h + ':' : '') + pad(m) + ':' + pad(s);
  };

  TL.pct = function (x, dp) {
    if (x == null || !isFinite(x)) return '—';
    return (x * 100).toFixed(dp == null ? 0 : dp) + '%';
  };

  TL.fmtDate = function (t) {
    var d = new Date(t);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  TL.fmtWhen = function (t) {
    var diff = t - Date.now();
    if (diff <= 0) return 'now';
    var h = diff / 3600000;
    if (h < 1) return Math.max(1, Math.round(diff / 60000)) + ' min';
    if (h < 48) return Math.round(h) + ' h';
    return Math.round(h / 24) + ' d';
  };

  /* ---------------- query string ---------------- */

  TL.qs = function () {
    var out = {};
    (root.location.search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
      out[k] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
    });
    return out;
  };
})(window);
