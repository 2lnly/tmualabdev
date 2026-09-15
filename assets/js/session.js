/* ============================================================
   TMUA Lab — the sitting engine.
   One object drives practice, review and mocks; `ui` decides
   whether it renders as the study view or the exam test driver.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});
  var D = root.document;

  var LET = TL.LETTERS;

  function Session(cfg) {
    this.mode = cfg.mode;                       // practice | review | mock
    this.ui = cfg.ui || 'study';                // study | driver
    this.title = cfg.title || 'Practice';
    this.paper = cfg.paper || null;
    // When answers are revealed, independent of whether the set is timed:
    //   'instant' — marked the moment an option is chosen
    //   'check'   — chosen, then confirmed with a button
    //   'end'     — nothing until the whole set is over
    this.feedback = cfg.mode === 'mock' ? 'end' : (cfg.feedback || 'check');
    this.limit = cfg.seconds || 0;              // countdown, 0 = count up
    this.pausable = !!cfg.pausable;
    this.onFinish = cfg.onFinish || function () {};
    this.items = cfg.questions.map(function (q) {
      return { q: q, ans: null, checked: false, flag: false, ms: 0 };
    });
    this.i = 0;
    this.started = Date.now();
    this.elapsed = 0;
    this.paused = false;
    this.done = false;
    this._tick = null;
    this._enter = Date.now();
  }

  Session.prototype.cur = function () { return this.items[this.i]; };

  Session.prototype.answered = function () {
    return this.items.filter(function (it) { return it.ans !== null; }).length;
  };

  Session.prototype.stamp = function () {
    var now = Date.now();
    if (!this.paused) this.items[this.i].ms += now - this._enter;
    this._enter = now;
  };

  Session.prototype.goto = function (n) {
    if (this.done) return;
    n = Math.max(0, Math.min(this.items.length - 1, n));
    if (n === this.i) return;
    this.stamp();
    this.i = n;
    this.render();
  };

  Session.prototype.next = function () { this.goto(this.i + 1); };
  Session.prototype.prev = function () { this.goto(this.i - 1); };

  Session.prototype.pick = function (k) {
    var it = this.cur();
    if (it.checked) return;
    // Outside instant mode a second click on the same option clears it, so a
    // misclick is recoverable. In instant mode the first click is committal —
    // which is the point of it.
    it.ans = (it.ans === k && this.feedback !== 'instant') ? null : k;
    if (it.ans !== null && this.feedback === 'instant') { this.check(); return; }
    this.render();
  };

  Session.prototype.check = function () {
    var it = this.cur();
    if (it.checked || it.ans === null) return;
    this.stamp();
    it.checked = true;
    TL.record(it.q.id, it.ans === it.q.a, it.ms, this.mode);
    this.render();
  };

  Session.prototype.finish = function () {
    if (this.done) return;
    this.stamp();
    this.done = true;
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
    var self = this;
    // record anything not already recorded (mocks, or skipped questions)
    this.items.forEach(function (it) {
      if (!it.checked) {
        it.checked = true;
        TL.record(it.q.id, it.ans !== null && it.ans === it.q.a, it.ms, self.mode);
      }
    });
    var payload = {
      mode: this.mode,
      title: this.title,
      paper: this.paper,
      at: this.started,
      dur: Date.now() - this.started,
      items: this.items.map(function (it) {
        return { q: it.q.id, ans: it.ans, ok: it.ans !== null && it.ans === it.q.a, ms: it.ms, flag: it.flag };
      })
    };
    var scored = TL.scoreSet(payload.items.map(function (it) { return { q: it.q, ok: it.ok }; }));
    payload.score = scored ? scored.score : null;
    payload.id = TL.saveSession(payload);
    this.result = { payload: payload, scored: scored };
    this.onFinish(this.result);
  };

  Session.prototype.abandon = function () {
    // nothing recorded, questions go back into the pool
    if (this._tick) clearInterval(this._tick);
    var db = TL.db.raw();
    this.items.forEach(function (it) { if (!it.checked) delete db.seen[it.q.id]; });
    TL.db.save();
    this.done = true;
  };

  Session.prototype.remaining = function () {
    if (!this.limit) return null;
    return Math.max(0, this.limit - Math.floor((Date.now() - this.started - this.pausedMs()) / 1000));
  };

  Session.prototype._pausedMs = 0;
  Session.prototype.pausedMs = function () { return this._pausedMs; };

  Session.prototype.togglePause = function () {
    if (!this.pausable || this.done) return;
    if (this.paused) {
      this._pausedMs += Date.now() - this._pauseStart;
      this.paused = false; this._enter = Date.now();
    } else {
      this.stamp();
      this.paused = true; this._pauseStart = Date.now();
    }
    this.render();
  };

  Session.prototype.clockText = function () {
    if (this.limit) return TL.fmtClock(this.remaining());
    return TL.fmtClock(Math.floor((Date.now() - this.started - this._pausedMs) / 1000));
  };

  /* ---------------- rendering: study view ---------------- */

  function chipsFor(q) {
    var t = TL.topic(q.t);
    var out = '<span class="chip chip-p' + q.p + '">Paper ' + q.p + '</span>' +
              '<span class="chip">' + TL.esc(t.short) + '</span>' +
              '<span class="chip" style="border-style:dashed">' + TL.esc(q.sp) + '</span>';
    if (TL.isHard(q)) out += '<span class="chip chip-bad">hard</span>';
    if (q.src) {
      out += '<span class="chip" style="border-color:color-mix(in srgb,var(--warn) 45%,transparent);color:var(--warn)">' +
             'TMUA ' + q.src.year + ' · P' + q.src.paper + ' Q' + q.src.number + '</span>';
    }
    return out;
  }

  Session.prototype.renderStudy = function () {
    var self = this, it = this.cur(), q = it.q, n = this.items.length;
    var showAnswer = it.checked;

    var opts = q.o.map(function (o, k) {
      var cls = 'opt';
      var pressed = it.ans === k;
      if (showAnswer) {
        if (k === q.a) cls += ' correct';
        else if (pressed) cls += ' wrong';
      }
      return '<li><button class="' + cls + '" data-k="' + k + '"' +
        (pressed ? ' aria-pressed="true"' : ' aria-pressed="false"') +
        (showAnswer ? ' disabled' : '') + '>' +
        '<span class="let">' + LET[k] + '</span><span>' + TL.tex(o) + '</span></button></li>';
    }).join('');

    var explain = '';
    if (showAnswer) {
      var pc = Math.round(TL.facility(q) * 100);
      explain =
        '<div class="explain"><div class="lab">' +
          (it.ans === q.a ? 'correct' : it.ans === null ? 'not answered' : 'not quite') +
          ' · answer ' + LET[q.a] + '</div>' +
          '<div class="body">' + TL.tex(q.e) + '</div>' +
          TL.explainButton(q, it.ans) +
          '<div class="stats">' +
            '<span><b>' + pc + '%</b> of candidates answer this correctly</span>' +
            '<span>target time <b>' + TL.fmtClock(TL.targetTime(q)) + '</b></span>' +
            '<span>you took <b>' + TL.fmtClock(Math.round(it.ms / 1000)) + '</b></span>' +
          '</div></div>';
    }

    var clock = this.clockText();
    var clockCls = '';
    if (this.limit) {
      var r = this.remaining();
      clockCls = r < 60 ? ' crit' : r < 300 ? ' warn' : '';
    }

    var pauseBtn = this.pausable
      ? '<button class="btn btn-quiet btn-sm" id="pauseBtn">' + (this.paused ? 'Resume' : 'Pause') + '</button>' : '';

    var actions =
      '<div class="q-actions">' +
        '<button class="btn btn-ghost btn-sm" id="prevBtn"' + (this.i === 0 ? ' disabled' : '') + '>← Previous</button>' +
        (this.feedback === 'check' && !showAnswer
          ? '<button class="btn btn-accent btn-sm" id="checkBtn"' + (it.ans === null ? ' disabled' : '') + '>Check answer</button>'
          : '') +
        '<div class="right">' +
          (this.i === n - 1
            ? '<button class="btn btn-primary btn-sm" id="endBtn">Finish set</button>'
            : '<button class="btn btn-primary btn-sm" id="nextBtn">Next →</button>') +
        '</div></div>';

    var railCells = this.items.map(function (x, k) {
      var c = 'rail-grid-btn';
      var cls = [];
      if (k === self.i) cls.push('cur');
      if (x.checked) cls.push(x.ans === x.q.a ? 'ok' : 'no');
      else if (x.ans !== null) cls.push('answered');
      if (x.flag) cls.push('flag');
      return '<button class="' + cls.join(' ') + '" data-g="' + k + '">' + (k + 1) + '</button>';
    }).join('');

    this.host.innerHTML =
      '<div class="wrap">' +
      '<div class="q-bar">' +
        '<span class="pos">Q<b>' + (this.i + 1) + '</b> / ' + n + '</span>' +
        '<span class="prog"><i style="width:' + (100 * this.answered() / n) + '%"></i></span>' +
        '<span class="clock' + clockCls + '">' + clock + (this.paused ? ' ⏸' : '') + '</span>' +
        pauseBtn +
        '<button class="btn btn-quiet btn-sm" id="quitBtn">End</button>' +
      '</div>' +
      '<div class="player">' +
        '<div>' +
          '<section class="panel q-card">' +
            '<div class="q-meta">' + chipsFor(q) + '</div>' +
            '<div class="q-stem">' + TL.tex(q.q) + '</div>' +
            '<ul class="opts">' + opts + '</ul>' +
            explain +
            actions +
          '</section>' +
        '</div>' +
        '<aside class="panel rail">' +
          '<h4>Question navigator</h4>' +
          '<div class="rail-grid">' + railCells + '</div>' +
          '<div class="rail-legend">' +
            '<span><i style="background:color-mix(in srgb,var(--accent) 18%,transparent);border:1px solid var(--accent)"></i>answered</span>' +
            '<span><i style="background:color-mix(in srgb,var(--good) 25%,transparent);border:1px solid var(--good)"></i>correct</span>' +
            '<span><i style="background:color-mix(in srgb,var(--bad) 25%,transparent);border:1px solid var(--bad)"></i>wrong</span>' +
          '</div>' +
          '<div class="rail-keys">' +
            '<div><span>select answer</span><span><kbd>A</kbd>–<kbd>H</kbd></span></div>' +
            '<div><span>next / previous</span><span><kbd>N</kbd><kbd>P</kbd></span></div>' +
            (this.feedback === 'check'
              ? '<div><span>check answer</span><span><kbd>↵</kbd></span></div>'
              : '<div><span>next question</span><span><kbd>↵</kbd></span></div>') +
            '<div><span>flag question</span><span><kbd>F</kbd></span></div>' +
            '<div><span>command palette</span><span><kbd>⌘K</kbd></span></div>' +
          '</div>' +
        '</aside>' +
      '</div></div>';

    TL.$$('.opt', this.host).forEach(function (b) {
      b.onclick = function () { self.pick(+b.dataset.k); };
    });
    TL.$$('.rail-grid button', this.host).forEach(function (b) {
      b.onclick = function () { self.goto(+b.dataset.g); };
    });
    var bind = function (id, fn) { var e = TL.$('#' + id, self.host); if (e) e.onclick = fn; };
    bind('prevBtn', function () { self.prev(); });
    bind('nextBtn', function () { self.next(); });
    bind('checkBtn', function () { self.check(); });
    bind('endBtn', function () { self.confirmEnd(); });
    bind('quitBtn', function () { self.confirmEnd(); });
    bind('pauseBtn', function () { self.togglePause(); });
    TL.bindExplain(this.host);
  };

  /* ---------------- rendering: exam test driver ---------------- */

  Session.prototype.renderDriver = function () {
    var self = this, it = this.cur(), q = it.q, n = this.items.length;
    var r = this.remaining();
    var crit = r != null && r < 300;

    var opts = q.o.map(function (o, k) {
      return '<li><button class="drv-opt" data-k="' + k + '" aria-pressed="' + (it.ans === k) + '">' +
        '<span class="rd"></span><span class="lt">' + LET[k] + '</span>' +
        '<span>' + TL.tex(o) + '</span></button></li>';
    }).join('');

    this.host.innerHTML =
      '<div class="drv">' +
        '<div class="drv-top">' +
          '<span class="who">Test of Mathematics for University Admission</span>' +
          '<span class="sect">' + TL.esc(this.title) + '</span>' +
          '<span class="time' + (crit ? ' crit' : '') + '" id="drvClock">' +
            (r == null ? '' : 'Time remaining ' + TL.fmtClock(r)) + '</span>' +
        '</div>' +
        '<div class="drv-sub">' +
          '<span>Question ' + (this.i + 1) + ' of ' + n + '</span>' +
          '<button class="fl" id="flagBtn" aria-pressed="' + it.flag + '">⚑ ' +
            (it.flag ? 'Flagged for review' : 'Flag for review') + '</button>' +
        '</div>' +
        '<div class="drv-body"><div class="drv-inner">' +
          '<div class="drv-qn">Question ' + (this.i + 1) + '</div>' +
          '<div class="drv-stem">' + TL.tex(q.q) + '</div>' +
          '<ul class="drv-opts">' + opts + '</ul>' +
        '</div></div>' +
        '<div class="drv-foot">' +
          '<button class="drv-btn sec" id="navBtn">Question navigator</button>' +
          '<span class="spacer"></span>' +
          '<button class="drv-btn sec" id="prevBtn"' + (this.i === 0 ? ' disabled' : '') + '>◀ Previous</button>' +
          (this.i === n - 1
            ? '<button class="drv-btn" id="endBtn">End section ▶</button>'
            : '<button class="drv-btn" id="nextBtn">Next ▶</button>') +
        '</div>' +
      '</div>';

    TL.$$('.drv-opt', this.host).forEach(function (b) {
      b.onclick = function () { self.pick(+b.dataset.k); };
    });
    var bind = function (id, fn) { var e = TL.$('#' + id, self.host); if (e) e.onclick = fn; };
    bind('prevBtn', function () { self.prev(); });
    bind('nextBtn', function () { self.next(); });
    bind('endBtn', function () { self.confirmEnd(); });
    bind('flagBtn', function () { self.cur().flag = !self.cur().flag; self.render(); });
    bind('navBtn', function () { self.openNavigator(); });
  };

  Session.prototype.openNavigator = function () {
    var self = this;
    var sheet = TL.el('div', { class: 'drv-nav-sheet' });
    var cells = this.items.map(function (x, k) {
      var cls = [];
      if (x.ans !== null) cls.push('answered');
      if (x.flag) cls.push('flag');
      if (k === self.i) cls.push('cur');
      return '<button class="' + cls.join(' ') + '" data-g="' + k + '">' + (k + 1) + '</button>';
    }).join('');
    sheet.innerHTML = '<div class="drv-nav-box"><h3>Question navigator</h3>' +
      '<p style="font-size:13px;color:#55636f">Shaded squares are answered. A flag marks a question you asked to come back to.</p>' +
      '<div class="drv-nav-grid">' + cells + '</div>' +
      '<div style="margin-top:18px;display:flex;gap:10px">' +
        '<button class="drv-btn sec" id="navClose">Return to question</button>' +
        '<button class="drv-btn" id="navEnd">End section</button>' +
      '</div></div>';
    D.body.appendChild(sheet);
    TL.$$('.drv-nav-grid button', sheet).forEach(function (b) {
      b.onclick = function () { sheet.remove(); self.goto(+b.dataset.g); };
    });
    TL.$('#navClose', sheet).onclick = function () { sheet.remove(); };
    TL.$('#navEnd', sheet).onclick = function () { sheet.remove(); self.confirmEnd(); };
    sheet.onclick = function (e) { if (e.target === sheet) sheet.remove(); };
  };

  /* ---------------- shared ---------------- */

  Session.prototype.confirmEnd = function () {
    var left = this.items.length - this.answered();
    var msg = left
      ? 'End now? ' + left + ' question' + (left === 1 ? ' is' : 's are') + ' still unanswered, and unanswered counts as wrong.'
      : 'End and see your result?';
    if (root.confirm(msg)) this.finish();
  };

  Session.prototype.render = function () {
    if (this.done) return;
    if (this.ui === 'driver') this.renderDriver(); else this.renderStudy();
  };

  Session.prototype.mount = function (host) {
    var self = this;
    this.host = host;
    this.render();

    if (this.limit || !this.limit) {
      this._tick = setInterval(function () {
        if (self.done) return;
        if (self.limit && self.remaining() <= 0) { TL.toast('Time is up'); self.finish(); return; }
        if (self.ui === 'driver') {
          var c = TL.$('#drvClock', self.host);
          if (c) {
            c.textContent = 'Time remaining ' + TL.fmtClock(self.remaining());
            c.classList.toggle('crit', self.remaining() < 300);
          }
        } else {
          var e = TL.$('.q-bar .clock', self.host);
          if (e && !self.paused) {
            e.textContent = self.clockText();
            if (self.limit) {
              var r = self.remaining();
              e.className = 'clock' + (r < 60 ? ' crit' : r < 300 ? ' warn' : '');
            }
          }
        }
      }, 1000);
    }

    this._keys = function (e) {
      if (self.done) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey) {
        return;
      }
      var k = e.key;
      if (e.altKey) {
        if (k.toLowerCase() === 'n') { e.preventDefault(); self.next(); }
        if (k.toLowerCase() === 'p') { e.preventDefault(); self.prev(); }
        return;
      }
      if (self.ui === 'study') {
        var idx = LET.indexOf(k.toUpperCase());
        if (idx >= 0 && idx < self.cur().q.o.length) { e.preventDefault(); self.pick(idx); return; }
        if (k === 'Enter') {
          e.preventDefault();
          if (self.cur().checked || self.feedback !== 'check') self.next(); else self.check();
          return;
        }
        if (k === 'ArrowRight' || k.toLowerCase() === 'n') { e.preventDefault(); self.next(); return; }
        if (k === 'ArrowLeft' || k.toLowerCase() === 'p') { e.preventDefault(); self.prev(); return; }
        if (k.toLowerCase() === 'f') { self.cur().flag = !self.cur().flag; self.render(); return; }
      }
    };
    D.addEventListener('keydown', this._keys);

    this._leave = function (e) {
      if (!self.done) { e.preventDefault(); e.returnValue = ''; return ''; }
    };
    root.addEventListener('beforeunload', this._leave);
  };

  Session.prototype.destroy = function () {
    if (this._tick) clearInterval(this._tick);
    if (this._keys) D.removeEventListener('keydown', this._keys);
    if (this._leave) root.removeEventListener('beforeunload', this._leave);
  };

  TL.Session = Session;

  /* ============================================================
     Results
     ============================================================ */

  TL.renderResults = function (host, payload, scored, opts) {
    opts = opts || {};
    var pct = scored ? scored.score / 9 : 0;
    var C = 2 * Math.PI * 92;

    var ring = scored
      ? '<div class="score-ring">' +
          '<svg width="216" height="216" viewBox="0 0 216 216">' +
            '<circle cx="108" cy="108" r="92" fill="none" stroke="var(--track)" stroke-width="12"/>' +
            '<circle cx="108" cy="108" r="92" fill="none" stroke="var(--accent)" stroke-width="12" ' +
              'stroke-linecap="round" stroke-dasharray="' + C + '" ' +
              'stroke-dashoffset="' + (C * (1 - pct)) + '" style="transition:stroke-dashoffset 1.1s var(--ease-out)"/>' +
          '</svg>' +
          '<div class="val"><b>' + scored.score.toFixed(1) + '</b><span>TMUA score</span></div>' +
        '</div>'
      : '<div class="score-ring"><div class="val" style="position:static;height:100%">' +
          '<div><b style="font-size:34px">—</b><span>no score</span></div></div></div>';

    var stats =
      '<div class="stat-row">' +
        '<div class="stat"><div class="k">mark</div><div class="v">' + payload.items.filter(function (i) { return i.ok; }).length +
          '<small>/' + payload.items.length + '</small></div></div>' +
        '<div class="stat"><div class="k">accuracy</div><div class="v">' +
          TL.pct(payload.items.filter(function (i) { return i.ok; }).length / payload.items.length) + '</div></div>' +
        '<div class="stat"><div class="k">time taken</div><div class="v">' + TL.fmtClock(Math.round(payload.dur / 1000)) + '</div></div>' +
        '<div class="stat"><div class="k">per question</div><div class="v">' +
          TL.fmtClock(Math.round(payload.dur / 1000 / payload.items.length)) +
          '</div><div class="d">real pace ' + TL.fmtClock(TL.EXAM.secondsPerQ) + '</div></div>' +
        (scored ? '<div class="stat"><div class="k">percentile</div><div class="v">' + scored.percentile +
          '<small>th</small></div><div class="d">of TMUA candidates</div></div>' : '') +
      '</div>';

    var rows = payload.items.map(function (it, k) {
      var q = TL.byId(it.q);
      var mk = it.ans === null ? 'bl' : it.ok ? 'ok' : 'no';
      var sym = it.ans === null ? '–' : it.ok ? '✓' : '✕';
      return '<li><button class="qrow" data-q="' + it.q + '">' +
        '<span class="ix">' + (k + 1) + '</span>' +
        '<span class="mk ' + mk + '">' + sym + '</span>' +
        '<span class="tt">' + TL.esc(TL.plain(q ? q.q : it.q).slice(0, 96)) + '</span>' +
        (it.flag ? '<span class="chip chip-warn">flag</span>' : '') +
        '<span class="tm">' + TL.fmtClock(Math.round(it.ms / 1000)) + '</span>' +
        '</button></li>';
    }).join('');

    var working = scored
      ? '<details class="panel" style="margin-top:22px">' +
          '<summary style="padding:16px 20px;cursor:pointer;font-family:var(--font-display);font-size:15px">' +
            'How is my score calculated?</summary>' +
          '<div style="padding:0 20px 20px;font-size:14.4px;color:var(--text-soft);line-height:1.75">' +
            '<p>You answered <b>' + scored.mark + '</b> of <b>' + scored.total + '</b>. On this particular draw of ' +
            'questions a typical candidate would have been expected to get about <b>' + scored.expected + '</b>, ' +
            'so this paper was <b>' + scored.paperTone + '</b>.</p>' +
            '<p>Your mark is re-expressed as the proportion you would have scored on a paper of average ' +
            'difficulty — <b>' + Math.round(scored.adjusted * 100) + '%</b> — and that proportion is placed on the ' +
            'TMUA 1.0–9.0 scale, giving <b>' + scored.score.toFixed(1) + '</b>. That sits at roughly the ' +
            '<b>' + scored.percentile + 'th percentile</b> of the published TMUA distribution.</p>' +
            (scored.indicative
              ? '<p><b>This is an indication, not a prediction.</b> A real section is ' + TL.EXAM.questions +
                ' questions; short sets are deliberately pulled towards the middle of the scale.</p>' : '') +
            '<p class="muted" style="font-size:13px">Boundaries move between papers, exactly as they do between real ' +
            'sittings: ' + Math.round(scored.adjusted * 100) + '% on a hard draw is worth more than the same mark on a kind one.</p>' +
          '</div></details>'
      : '<div class="panel" style="margin-top:22px;padding:18px 20px;font-size:14px;color:var(--text-soft)">' +
        'Sets under ' + 10 + ' questions get no score. Any single number drawn from a handful of answers would be ' +
        'guesswork dressed up as a prediction — sit a full ' + TL.EXAM.questions + '-question section for a figure to trust.</div>';

    host.innerHTML =
      '<div class="wrap">' +
        '<div class="app-head"><div class="eyebrow">result</div>' +
          '<h1 style="margin-top:14px">' + TL.esc(payload.title) + '</h1>' +
          '<p>' + TL.fmtDate(payload.at) + ' · ' + payload.mode + '</p></div>' +
        '<div class="res-hero">' + ring + '<div>' + stats + '</div></div>' +
        working +
        '<div class="split" style="margin:28px 0 14px"><h2 style="font-size:20px">Every question</h2>' +
          '<div class="right pill-row">' +
            (opts.again ? '<button class="btn btn-ghost btn-sm" id="againBtn">Another set</button>' : '') +
            '<a class="btn btn-ghost btn-sm" href="review.html">Review queue</a>' +
            '<a class="btn btn-primary btn-sm" href="progress.html">Dashboard</a>' +
          '</div></div>' +
        '<ul class="qlist panel" style="overflow:hidden">' + rows + '</ul>' +
        '<div id="qdetail"></div>' +
      '</div>';

    TL.$$('.qrow', host).forEach(function (b) {
      b.onclick = function () {
        var q = TL.byId(b.dataset.q);
        var it = payload.items.filter(function (x) { return x.q === b.dataset.q; })[0];
        TL.showQuestion(TL.$('#qdetail', host), q, it);
        TL.into(TL.$('#qdetail', host));
      };
    });
    if (opts.again) {
      var a = TL.$('#againBtn', host);
      if (a) a.onclick = opts.again;
    }
  };

  /** Full worked question, used in results and the bank browser. */
  TL.showQuestion = function (host, q, it) {
    if (!q) { host.innerHTML = ''; return; }
    var opts = q.o.map(function (o, k) {
      var cls = 'opt';
      if (k === q.a) cls += ' correct';
      else if (it && it.ans === k) cls += ' wrong';
      return '<li><button class="' + cls + '" disabled><span class="let">' + LET[k] + '</span>' +
        '<span>' + TL.tex(o) + '</span></button></li>';
    }).join('');
    host.innerHTML =
      '<section class="panel q-card" style="margin-top:22px">' +
        '<div class="q-meta">' + chipsFor(q) + '<span class="chip">' + TL.esc(q.id) + '</span></div>' +
        '<div class="q-stem">' + TL.tex(q.q) + '</div>' +
        '<ul class="opts">' + opts + '</ul>' +
        '<div class="explain"><div class="lab">worked answer · ' + LET[q.a] + '</div>' +
          '<div class="body">' + TL.tex(q.e) + '</div>' +
          TL.explainButton(q, it ? it.ans : null) +
          '<div class="stats">' +
            '<span><b>' + Math.round(TL.facility(q) * 100) + '%</b> answer correctly</span>' +
            '<span>target time <b>' + TL.fmtClock(TL.targetTime(q)) + '</b></span>' +
            (it ? '<span>you took <b>' + TL.fmtClock(Math.round(it.ms / 1000)) + '</b></span>' : '') +
          '</div></div>' +
      '</section>';
    TL.bindExplain(host);
  };

  /* Alternative explanations need the `sample` capability, which only a
     published artifact has. Both hooks no-op everywhere else. */
  TL.explainButton = TL.explainButton || function () { return ''; };
  TL.bindExplain = TL.bindExplain || function () {};

  TL.chipsFor = chipsFor;
})(window);
