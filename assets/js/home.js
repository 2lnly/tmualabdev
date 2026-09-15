/* ============================================================
   TMUA Lab — homepage behaviour.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;

  var ROT = ['Imperial', 'the LSE', 'Warwick', 'Durham', 'Cambridge'];

  function rotator() {
    var el = TL.$('#rot');
    if (!el) return;
    var i = 0;
    setInterval(function () {
      i = (i + 1) % ROT.length;
      el.style.transition = 'opacity .22s, transform .22s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
      setTimeout(function () {
        el.textContent = ROT[i];
        el.style.transform = 'translateY(6px)';
        requestAnimationFrame(function () {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }, 230);
    }, 2600);
  }

  function telemetry() {
    var st = TL.stats(), rev = TL.reviewCount();
    var vals = [TL.BANK.length, st.answered, rev.due, TL.streak()];
    TL.$$('#tele .v').forEach(function (el, i) { TL.countUp(el, vals[i], 900 + i * 120); });
  }

  function paperCard(p, opts) {
    opts = opts || {};
    var info = TL.PAPERS[p];
    var st = TL.paperStats(p);
    var left = st.total - st.seen;
    var pct = st.total ? Math.round(100 * st.seen / st.total) : 0;
    var href = opts.href || ('practice.html?paper=' + p);
    return '<article class="paper-card' + (p === 2 ? ' p2' : '') + '">' +
      '<div class="pnum">' + (opts.eyebrow || ('paper ' + p)) + '</div>' +
      '<h3>' + (opts.title || info.full) + '</h3>' +
      '<p class="desc">' + (opts.desc || info.blurb) + '</p>' +
      '<div class="facts">' +
        '<span class="chip chip-p' + p + '">' + TL.EXAM.questions + ' questions</span>' +
        '<span class="chip">' + TL.EXAM.minutes + ' minutes</span>' +
        '<span class="chip">no calculator</span>' +
      '</div>' +
      (opts.stats === false
        ? '<div class="meta" style="margin-top:2px"><span>fixed paper · everyone sits the same questions</span>' +
          '<span>resit as often as you like</span></div>'
        : '<div class="bar"><i data-w="' + pct + '"></i></div>' +
          '<div class="meta">' +
            '<span>' + st.seen + ' / ' + st.total + ' seen · ' + left + ' left</span>' +
            '<span>' + (st.accuracy == null ? '— accuracy' : TL.pct(st.accuracy) + ' accuracy') + '</span>' +
          '</div>') +
      '<div class="go">' +
        '<a class="btn btn-accent btn-sm" href="' + href + '">' + (opts.cta || 'Practise') + ' ▸</a>' +
        (opts.second !== false
          ? '<a class="btn btn-ghost btn-sm" href="mock.html?start=' + p + '">Sit as a mock</a>' : '') +
      '</div></article>';
  }

  function animateBars() {
    setTimeout(function () {
      TL.$$('.paper-card .bar > i').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
    }, 120);
  }

  function papers() {
    var host = TL.$('#paperCards');
    if (host) host.innerHTML = paperCard(1) + paperCard(2);

    var pred = TL.$('#predictedCards');
    if (pred) {
      pred.innerHTML =
        paperCard(1, {
          eyebrow: 'the applications paper',
          title: '2026 Predicted Paper 1',
          desc: 'A full twenty-question section drawn to the shape of a real Paper 1, weighted towards the topics that carried the most marks last cycle.',
          href: 'mock.html?start=1&predicted=1', cta: 'Sit this paper', second: false, stats: false
        }) +
        paperCard(2, {
          eyebrow: 'the reasoning paper',
          title: '2026 Predicted Paper 2',
          desc: 'The reasoning section: logic, necessary and sufficient conditions, proof, counterexample and number. The paper most candidates leave until too late.',
          href: 'mock.html?start=2&predicted=1', cta: 'Sit this paper', second: false, stats: false
        });
    }
    animateBars();
  }

  function topics() {
    var host = TL.$('#topicList');
    if (!host) return;
    host.innerHTML = TL.TOPICS.map(function (t) {
      var st = TL.topicStats(t.k);
      return '<a class="topic' + (t.p === 2 ? ' p2' : '') + '" href="practice.html?topic=' + t.k + '&go=1">' +
        '<span class="dot"></span>' +
        '<span class="tn">' + TL.esc(t.name) + '</span>' +
        '<span class="tc">' + st.total + '</span>' +
        '<span class="tacc">' + (st.accuracy == null ? '—' : TL.pct(st.accuracy)) + '</span>' +
      '</a>';
    }).join('');
  }

  function pastBlurb() {
    var el = TL.$('#pastBlurb');
    if (!el) return;
    var papers = TL.pastPapers().filter(function (p) { return p.complete; });
    if (!papers.length) { var c = TL.$('#pastCallout'); if (c) c.style.display = 'none'; return; }
    var years = {}; papers.forEach(function (p) { years[p.year] = 1; });
    var n = Object.keys(years).length;
    el.innerHTML = '<b>' + papers.length + ' real papers</b> across ' + n + ' year' + (n === 1 ? '' : 's') +
      ', transcribed in full from the papers UAT-UK publishes and sat in the same driver under the same ' +
      'countdown. Every answer is checked against the official key.';
  }

  TL.page = function () {
    TL.$$('#bankCount, #bankCount2').forEach(function (e) { e.textContent = TL.BANK.length.toLocaleString(); });
    rotator();
    telemetry();
    papers();
    pastBlurb();
    topics();
  };
})(window);
