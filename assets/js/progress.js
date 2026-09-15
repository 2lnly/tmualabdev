/* ============================================================
   TMUA Lab — dashboard. Charts are hand-drawn SVG; no libraries.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;

  function card(title, sub, body, cls) {
    return '<section class="panel ' + (cls || 'col-6') + '">' +
      '<div class="card-h"><h3>' + title + '</h3>' + (sub ? '<span class="sub">' + sub + '</span>' : '') + '</div>' +
      '<div class="card-b">' + body + '</div></section>';
  }

  function statRow() {
    var st = TL.stats();
    var sessions = TL.db.raw().sessions.filter(function (s) { return s.score != null; });
    var last = sessions.length ? sessions[0].score : null;
    var best = sessions.reduce(function (m, s) { return Math.max(m, s.score); }, 0);
    return '<div class="stat-row">' +
      '<div class="stat"><div class="k">answered</div><div class="v">' + st.answered + '</div>' +
        '<div class="d">' + st.seen + ' of ' + st.bank + ' questions seen</div></div>' +
      '<div class="stat"><div class="k">accuracy</div><div class="v">' + TL.pct(st.accuracy) + '</div>' +
        '<div class="d">across every attempt</div></div>' +
      '<div class="stat"><div class="k">per question</div><div class="v">' +
        (st.avgMs ? TL.fmtClock(Math.round(st.avgMs / 1000)) : '—') + '</div>' +
        '<div class="d">real pace ' + TL.fmtClock(TL.EXAM.secondsPerQ) + '</div></div>' +
      '<div class="stat"><div class="k">last score</div><div class="v">' + (last == null ? '—' : last.toFixed(1)) + '</div>' +
        '<div class="d">' + (last == null ? 'no scored sitting yet' : TL.percentileFor(last) + 'th percentile') + '</div></div>' +
      '<div class="stat"><div class="k">best</div><div class="v">' + (best ? best.toFixed(1) : '—') + '</div>' +
        '<div class="d">' + sessions.length + ' scored sittings</div></div>' +
      '<div class="stat"><div class="k">streak</div><div class="v">' + TL.streak() + '</div>' +
        '<div class="d">consecutive days</div></div>' +
    '</div>';
  }

  function scoreChart() {
    var rows = TL.db.raw().sessions.filter(function (s) { return s.score != null; })
      .slice(0, 24).reverse();
    if (rows.length < 2) {
      return '<div class="empty" style="padding:30px 10px"><h3>Not enough data</h3>' +
        '<p>Two scored sittings and a line appears here. Sets of ten questions or more are scored.</p></div>';
    }
    var W = 560, H = 190, pad = { l: 30, r: 12, t: 14, b: 24 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var x = function (i) { return pad.l + (rows.length === 1 ? iw / 2 : iw * i / (rows.length - 1)); };
    var y = function (v) { return pad.t + ih * (1 - (v - 1) / 8); };

    var grid = '';
    [1, 3, 5, 7, 9].forEach(function (v) {
      grid += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) +
        '" stroke="var(--border)" stroke-dasharray="2 4"/>' +
        '<text x="' + (pad.l - 7) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10" ' +
        'fill="var(--faint)" font-family="var(--font-mono)">' + v + '</text>';
    });

    var d = rows.map(function (s, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(s.score).toFixed(1); }).join(' ');
    var area = d + ' L' + x(rows.length - 1).toFixed(1) + ' ' + (pad.t + ih) + ' L' + x(0).toFixed(1) + ' ' + (pad.t + ih) + ' Z';
    var dots = rows.map(function (s, i) {
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(s.score).toFixed(1) + '" r="3" fill="var(--accent)">' +
        '<title>' + TL.esc(s.title) + ' — ' + s.score.toFixed(1) + '</title></circle>';
    }).join('');

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;overflow:visible">' +
      '<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--accent)" stop-opacity=".26"/>' +
      '<stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<path d="' + area + '" fill="url(#sg)"/>' +
      '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + '</svg>';
  }

  function topicBars() {
    var rows = TL.TOPICS.map(function (t) { return { t: t, s: TL.topicStats(t.k) }; });
    var any = rows.some(function (r) { return r.s.answered > 0; });
    if (!any) {
      return '<div class="empty" style="padding:26px 10px"><h3>No attempts yet</h3>' +
        '<p>Accuracy per specification topic appears here once you have answered something.</p></div>';
    }
    return '<div class="bars">' + rows.map(function (r) {
      var a = r.s.accuracy;
      var col = a == null ? 'var(--track)' : a >= 0.75 ? 'var(--good)' : a >= 0.5 ? 'var(--accent)' : 'var(--bad)';
      return '<div class="bar-row"><div><div class="bl">' +
        '<span class="chip chip-p' + r.t.p + '" style="margin-right:8px;padding:1px 6px;font-size:9.5px">P' + r.t.p + '</span>' +
        TL.esc(r.t.name) + '</div>' +
        '<div class="bt"><i style="width:' + ((a || 0) * 100) + '%;background:' + col + '"></i></div></div>' +
        '<div class="bv">' + (a == null ? '—' : TL.pct(a)) + '<br><span style="color:var(--faint);font-size:10.5px">' +
        r.s.answered + '/' + r.s.total + '</span></div></div>';
    }).join('') + '</div>';
  }

  function coverage() {
    return [1, 2].map(function (p) {
      var s = TL.paperStats(p);
      var pct = s.total ? Math.round(100 * s.seen / s.total) : 0;
      return '<div class="bar-row" style="margin-bottom:12px"><div>' +
        '<div class="bl">' + TL.PAPERS[p].name + ' — ' + TL.esc(TL.PAPERS[p].full) + '</div>' +
        '<div class="bt"><i style="width:' + pct + '%;background:var(--p' + p + ')"></i></div></div>' +
        '<div class="bv">' + pct + '%<br><span style="color:var(--faint);font-size:10.5px">' + s.seen + '/' + s.total + '</span></div></div>';
    }).join('') +
    '<div class="pill-row" style="margin-top:16px">' +
      '<button class="btn btn-quiet btn-sm" data-reset="1">Reset Paper 1</button>' +
      '<button class="btn btn-quiet btn-sm" data-reset="2">Reset Paper 2</button>' +
    '</div>' +
    '<p class="muted" style="font-size:12px;margin:12px 0 0">Resetting makes a paper available from the start. It ' +
    'records a cutoff rather than deleting anything, so your history, streak and review queue stay as they are.</p>';
  }

  function heatmap() {
    var act = TL.activity(91);
    var max = act.reduce(function (m, a) { return Math.max(m, a.n); }, 0) || 1;
    var cells = act.map(function (a) {
      var l = a.n === 0 ? 0 : Math.min(4, Math.ceil(4 * a.n / max));
      return '<i data-l="' + l + '" title="' + TL.fmtDate(a.t) + ' — ' + a.n + ' answered"></i>';
    }).join('');
    var total = act.reduce(function (s, a) { return s + a.n; }, 0);
    var days = act.filter(function (a) { return a.n > 0; }).length;
    return '<div class="streak">' + cells + '</div>' +
      '<p class="muted" style="font-size:12.4px;margin:14px 0 0">' + total + ' questions over ' + days +
      ' active day' + (days === 1 ? '' : 's') + ' in the last 13 weeks.</p>';
  }

  function timing() {
    var db = TL.db.raw();
    var buckets = [0, 0, 0, 0, 0, 0];
    var labels = ['&lt;1m', '1–2m', '2–3m', '3–4m', '4–6m', '6m+'];
    var n = 0;
    db.attempts.forEach(function (a) {
      if (!(a.ms > 4000 && a.ms < 900000)) return;
      var m = a.ms / 60000; n++;
      var i = m < 1 ? 0 : m < 2 ? 1 : m < 3 ? 2 : m < 4 ? 3 : m < 6 ? 4 : 5;
      buckets[i]++;
    });
    if (!n) return '<div class="empty" style="padding:26px 10px"><h3>No timings yet</h3><p>Time spent per question appears here.</p></div>';
    var max = Math.max.apply(null, buckets);
    return '<div style="display:flex;align-items:flex-end;gap:8px;height:130px">' +
      buckets.map(function (b, i) {
        var h = max ? Math.round(100 * b / max) : 0;
        var hot = i >= 4;
        return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:6px">' +
          '<div style="height:' + h + '%;min-height:2px;border-radius:5px 5px 0 0;background:' +
            (hot ? 'var(--bad)' : 'var(--accent)') + ';opacity:' + (hot ? .8 : .85) + '" title="' + b + ' answers"></div>' +
          '</div>';
      }).join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:6px">' + labels.map(function (l) {
        return '<div style="flex:1;text-align:center;font-family:var(--font-mono);font-size:10.5px;color:var(--faint)">' + l + '</div>';
      }).join('') + '</div>' +
      '<p class="muted" style="font-size:12.4px;margin:12px 0 0">The real paper allows ' +
      TL.fmtClock(TL.EXAM.secondsPerQ) + ' a question on average. Anything past four minutes is a question you ' +
      'should have flagged and left.</p>';
  }

  function history() {
    var rows = TL.db.raw().sessions.slice(0, 30);
    if (!rows.length) {
      return '<div class="empty" style="padding:30px 10px"><h3>No sittings yet</h3>' +
        '<p>Sets and mocks appear here, newest first. Deleting one returns its questions to the pool.</p></div>';
    }
    return '<ul class="qlist">' + rows.map(function (s) {
      var ok = s.items.filter(function (i) { return i.ok; }).length;
      return '<li style="display:flex;align-items:center">' +
        '<button class="qrow" data-s="' + s.id + '" style="flex:1;border-bottom:0">' +
          '<span class="mk ' + (s.score == null ? 'bl' : s.score >= 6 ? 'ok' : 'no') + '">' +
            (s.score == null ? '–' : s.score.toFixed(1)) + '</span>' +
          '<span class="tt">' + TL.esc(s.title) + '</span>' +
          '<span class="chip chip-' + (s.mode === 'mock' ? 'p2' : 'p1') + '">' + s.mode + '</span>' +
          '<span class="chip">' + ok + '/' + s.items.length + '</span>' +
          '<span class="tm">' + TL.fmtDate(s.at) + '</span>' +
        '</button>' +
        '<button class="btn btn-quiet btn-sm" data-del="' + s.id + '" style="margin-right:12px" title="Delete sitting">✕</button>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function dataCard() {
    return '<p style="font-size:14px;color:var(--text-soft);margin-bottom:16px">' +
      (TL.cloud && TL.cloud.db
        ? 'Progress lives in this browser. Turn on sync below to keep a copy in the shared study space so it ' +
          'follows you between devices.'
        : 'Everything lives in this browser under a single local-storage key. Nothing is sent anywhere, which ' +
          'also means nothing follows you to another device — export if you want a copy.') + '</p>' +
      '<div class="pill-row">' +
        '<button class="btn btn-ghost btn-sm" id="exportBtn">Export JSON</button>' +
        '<button class="btn btn-ghost btn-sm" id="importBtn">Import</button>' +
        '<button class="btn btn-quiet btn-sm" id="wipeBtn">Erase everything</button>' +
      '</div><input type="file" id="importFile" accept="application/json" class="hidden">';
  }

  /* Sync and the cohort board need the `db` capability, so they exist only in
     the published artifact. Both hooks render nothing anywhere else. */
  function syncCard() { return TL.cloud && TL.cloud.syncCard ? TL.cloud.syncCard() : null; }
  function boardCard() { return TL.cloud && TL.cloud.boardCard ? TL.cloud.boardCard() : null; }

  function bindAll() {
    TL.$$('[data-reset]').forEach(function (b) {
      b.onclick = function () {
        var p = +b.dataset.reset;
        if (root.confirm('Make every Paper ' + p + ' question available again? Your history, streak and review queue are untouched.')) {
          TL.resetPaper(p); TL.toast('Paper ' + p + ' reset'); render();
        }
      };
    });
    TL.$$('[data-s]').forEach(function (b) {
      b.onclick = function () { root.location.href = 'practice.html?session=' + b.dataset.s; };
    });
    TL.$$('[data-del]').forEach(function (b) {
      b.onclick = function () {
        if (root.confirm('Delete this sitting? Its questions go back into the pool and can come round again.')) {
          TL.deleteSession(b.dataset.del); TL.toast('Sitting deleted'); render();
        }
      };
    });

    var ex = TL.$('#exportBtn');
    if (ex) ex.onclick = function () {
      var name = 'tmualab-' + new Date().toISOString().slice(0, 10) + '.json';
      var json = JSON.stringify(TL.db.raw(), null, 2);
      // A published artifact must hand the file to the viewer through the
      // downloads capability; a plain <a download> is inert inside the viewer.
      if (TL.cloud && TL.cloud.saveFile) { TL.cloud.saveFile(name, json); return; }
      var blob = new Blob([json], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    var im = TL.$('#importBtn'), f = TL.$('#importFile');
    if (im) im.onclick = function () { f.click(); };
    if (f) f.onchange = function () {
      var file = f.files[0]; if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var data = JSON.parse(r.result);
          if (!data || typeof data !== 'object' || !data.attempts) throw new Error('bad file');
          root.localStorage.setItem('tmualab.v1', JSON.stringify(data));
          TL.toast('Imported — reloading');
          setTimeout(function () { root.location.reload(); }, 600);
        } catch (e) { TL.toast('That file is not a TMUA Lab export'); }
      };
      r.readAsText(file);
    };
    var w = TL.$('#wipeBtn');
    if (w) w.onclick = function () {
      if (root.confirm('Erase every answer, sitting, streak and preference stored in this browser? This cannot be undone.')) {
        TL.db.reset(); TL.toast('Erased'); setTimeout(function () { root.location.reload(); }, 500);
      }
    };
  }

  function render() {
    var sync = syncCard(), board = boardCard();
    TL.$('#dash').innerHTML =
      statRow() +
      '<div class="dash-grid" style="margin-top:18px">' +
        card('Score history', 'TMUA scale, 1.0–9.0', scoreChart(), 'col-8') +
        card('Coverage', 'questions seen', coverage(), 'col-4') +
        (sync ? card('Sync', sync.sub, sync.body, 'col-6') : '') +
        (board ? card('Cohort board', 'best score, everyone with the link', board, 'col-6') : '') +
        card('Accuracy by topic', 'first attempts only', topicBars(), 'col-6') +
        card('Time per question', 'all recorded answers', timing(), 'col-6') +
        card('Activity', 'last 13 weeks', heatmap(), 'col-8') +
        card('Your data', TL.cloud && TL.cloud.db ? 'this device' : 'local only', dataCard(), 'col-4') +
        card('History', 'newest first', history(), 'col-12') +
      '</div>';
    bindAll();
    if (TL.cloud && TL.cloud.bindDash) TL.cloud.bindDash(render);
  }

  TL.redrawDash = function () { if (TL.$('#dash')) render(); };

  TL.page = render;
})(window);
