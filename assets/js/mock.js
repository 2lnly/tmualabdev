/* ============================================================
   TMUA Lab — mocks in the replica test driver.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;
  var stage, session, queue = [], results = [];

  function card(p, predicted) {
    var info = TL.PAPERS[p];
    var st = TL.paperStats(p);
    var left = st.total - st.seen;
    return '<article class="paper-card' + (p === 2 ? ' p2' : '') + '">' +
      '<div class="pnum">section ' + p + '</div>' +
      '<h3>' + info.name + ' — ' + info.full + '</h3>' +
      '<p class="desc">' + info.blurb + '</p>' +
      '<div class="facts">' +
        '<span class="chip chip-p' + p + '">' + TL.EXAM.questions + ' questions</span>' +
        '<span class="chip">' + TL.EXAM.minutes + ':00 countdown</span>' +
        '<span class="chip">' + left + ' unseen left</span>' +
      '</div>' +
      '<div class="go">' +
        '<button class="btn btn-accent btn-sm" data-start="' + p + '">Sit Paper ' + p + ' ▸</button>' +
      '</div></article>';
  }

  function cards() {
    var host = TL.$('#mockCards');
    host.innerHTML = card(1) + card(2);
    TL.$$('[data-start]', host).forEach(function (b) {
      b.onclick = function () { begin([+b.dataset.start]); };
    });
    var both = TL.el('div', { class: 'callout', style: 'margin-top:18px' });
    both.innerHTML = '<div><h3>Both papers, back to back</h3>' +
      '<p>Forty questions and two and a half hours, the way you will actually sit it. There is no break between ' +
      'sections in the real test, and there is none here.</p></div>' +
      '<div class="right"><button class="btn btn-primary" id="bothBtn">Sit the full test</button></div>';
    host.parentNode.insertBefore(both, host.nextSibling);
    TL.$('#bothBtn').onclick = function () { begin([1, 2]); };
  }

  function begin(papers, predicted) {
    queue = papers.slice(); results = []; pastPick = null;
    runNext(predicted);
  }

  /* ---------- real past papers ---------- */

  var pastPick = null;   // {year, paper} while a real paper is being sat

  function pastSection() {
    var papers = TL.pastPapers().filter(function (p) { return p.complete; });
    var host = TL.$('#pastPapers');
    if (!host) return;
    if (!papers.length) { host.parentNode.style.display = 'none'; return; }

    var years = {};
    papers.forEach(function (p) { (years[p.year] = years[p.year] || []).push(p); });

    host.innerHTML = Object.keys(years).sort().reverse().map(function (y) {
      var row = years[y].sort(function (a, b) { return a.paper - b.paper; });
      return '<div class="past-year">' +
        '<span class="py">' + y + '</span>' +
        row.map(function (p) {
          var st = pastState(p);
          return '<button class="past-btn' + (p.paper === 2 ? ' p2' : '') + '" ' +
            'data-year="' + p.year + '" data-paper="' + p.paper + '">' +
            '<span class="pn">Paper ' + p.paper + '</span>' +
            '<span class="ps">' + (st ? st.score.toFixed(1) : 'not sat') + '</span>' +
          '</button>';
        }).join('') +
      '</div>';
    }).join('');

    TL.$$('.past-btn', host).forEach(function (b) {
      b.onclick = function () {
        pastPick = { year: +b.dataset.year, paper: +b.dataset.paper };
        queue = [pastPick.paper]; results = [];
        runNext(false);
      };
    });
  }

  /** Best score recorded for a given real paper, if it has been sat. */
  function pastState(p) {
    var best = null;
    TL.db.raw().sessions.forEach(function (s) {
      if (s.past === p.tag && s.score != null && (!best || s.score > best.score)) best = s;
    });
    return best;
  }

  function runNext(predicted) {
    if (!queue.length) { finishAll(); return; }
    var p = queue.shift();
    var qs, title;
    if (pastPick) {
      qs = TL.buildPastPaper(pastPick.year, pastPick.paper);
      title = 'TMUA ' + pastPick.year + ' · Paper ' + pastPick.paper;
    } else {
      var seed = predicted ? ('predicted-2026-p' + p) : ('mock' + Date.now() + p);
      qs = TL.buildPaper(p, seed, { fixed: !!predicted });
      title = (predicted ? '2026 Predicted Paper ' : 'Mock · Paper ') + p;
    }

    document.body.classList.add('driver');
    TL.$('#hdr').style.display = 'none';
    TL.$('#ftr').style.display = 'none';

    session = new TL.Session({
      mode: 'mock', ui: 'driver', title: title, paper: p,
      feedback: 'end', seconds: TL.EXAM.minutes * 60,
      questions: qs,
      onFinish: function (r) {
        session.destroy();
        if (pastPick) {
          var rec = TL.getSession(r.payload.id);
          if (rec) { rec.past = pastPick.year + '-P' + pastPick.paper; TL.db.save(); }
        }
        results.push(r);
        if (queue.length) {
          if (root.confirm('Section complete. The next section starts as soon as you continue.')) runNext(predicted);
          else finishAll();
        } else finishAll();
      }
    });
    stage.innerHTML = '';
    session.mount(stage);
    root.scrollTo({ top: 0 });
  }

  function finishAll() {
    document.body.classList.remove('driver');
    TL.$('#hdr').style.display = '';
    TL.$('#ftr').style.display = '';
    if (!results.length) { root.location.href = 'mock.html'; return; }

    if (results.length === 1) {
      TL.renderResults(stage, results[0].payload, results[0].scored, { again: function () { root.location.href = 'mock.html'; } });
      root.scrollTo({ top: 0 });
      return;
    }

    var s1 = results[0].scored, s2 = results[1].scored;
    var overall = TL.overall(s1 ? s1.score : null, s2 ? s2.score : null);
    stage.innerHTML =
      '<div class="wrap"><div class="app-head"><div class="eyebrow">result</div>' +
        '<h1 style="margin-top:14px">Full mock</h1>' +
        '<p>Two sections, ' + (TL.EXAM.questions * 2) + ' questions. Your overall TMUA score is the mean of the two papers.</p></div>' +
      '<div class="stat-row" style="margin-bottom:26px">' +
        '<div class="stat"><div class="k">paper 1</div><div class="v">' + (s1 ? s1.score.toFixed(1) : '—') + '</div><div class="d">' + results[0].payload.items.filter(function (i) { return i.ok; }).length + '/' + TL.EXAM.questions + '</div></div>' +
        '<div class="stat"><div class="k">paper 2</div><div class="v">' + (s2 ? s2.score.toFixed(1) : '—') + '</div><div class="d">' + results[1].payload.items.filter(function (i) { return i.ok; }).length + '/' + TL.EXAM.questions + '</div></div>' +
        '<div class="stat"><div class="k">overall</div><div class="v" style="color:var(--accent)">' + (overall == null ? '—' : overall.toFixed(1)) + '</div><div class="d">' + (overall == null ? '' : TL.percentileFor(overall) + 'th percentile') + '</div></div>' +
        '<div class="stat"><div class="k">total time</div><div class="v">' + TL.fmtClock(Math.round((results[0].payload.dur + results[1].payload.dur) / 1000)) + '</div></div>' +
      '</div>' +
      '<div class="pill-row" style="margin-bottom:8px">' +
        '<button class="btn btn-ghost btn-sm" data-sec="0">Paper 1 in full</button>' +
        '<button class="btn btn-ghost btn-sm" data-sec="1">Paper 2 in full</button>' +
        '<a class="btn btn-primary btn-sm" href="progress.html">Dashboard</a>' +
      '</div><div id="secHost"></div></div>';

    TL.$$('[data-sec]', stage).forEach(function (b) {
      b.onclick = function () {
        var r = results[+b.dataset.sec];
        TL.renderResults(TL.$('#secHost', stage), r.payload, r.scored, {});
        TL.into(TL.$('#secHost', stage));
      };
    });
    root.scrollTo({ top: 0 });
  }

  function recent() {
    var host = TL.$('#recent');
    var rows = TL.db.raw().sessions.filter(function (s) { return s.mode === 'mock'; }).slice(0, 8);
    if (!rows.length) {
      host.innerHTML = '<li><div class="empty"><h3>No mocks yet</h3><p>Sitting one full section is worth more than three loose practice sets.</p></div></li>';
      return;
    }
    host.innerHTML = rows.map(function (s) {
      var ok = s.items.filter(function (i) { return i.ok; }).length;
      return '<li><button class="qrow" data-s="' + s.id + '">' +
        '<span class="mk ' + (s.score >= 6 ? 'ok' : 'no') + '">' + (s.score ? s.score.toFixed(1) : '–') + '</span>' +
        '<span class="tt">' + TL.esc(s.title) + '</span>' +
        '<span class="chip">' + ok + '/' + s.items.length + '</span>' +
        '<span class="tm">' + TL.fmtDate(s.at) + '</span></button></li>';
    }).join('');
    TL.$$('.qrow', host).forEach(function (b) {
      b.onclick = function () {
        var s = TL.getSession(b.dataset.s);
        TL.renderResults(stage, s, TL.scoreSet(s.items.map(function (i) { return { q: i.q, ok: i.ok }; })),
          { again: function () { root.location.href = 'mock.html'; } });
        root.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  TL.page = function () {
    stage = TL.$('#stage');
    cards();
    pastSection();
    recent();
    var q = TL.qs();
    var m = /^(\d{4})-([12])$/.exec(q.past || '');
    if (m && TL.buildPastPaper(+m[1], +m[2]).length) {
      pastPick = { year: +m[1], paper: +m[2] };
      queue = [pastPick.paper]; results = [];
      runNext(false);
      return;
    }
    if (q.start === 'both') begin([1, 2], q.predicted);
    else if (q.start === '1' || q.start === '2') begin([+q.start], q.predicted);
  };
})(window);
