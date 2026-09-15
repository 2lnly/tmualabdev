/* ============================================================
   TMUA Lab — question bank browser.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;

  var els = {};

  function filtered() {
    var qy = els.search.value.trim().toLowerCase();
    var paper = els.paper.value, topic = els.topic.value, diff = els.diff.value;
    var src = els.src.value;
    return TL.BANK.filter(function (q) {
      if (paper && q.p !== +paper) return false;
      if (topic && q.t !== topic) return false;
      if (src === 'past' && !q.src) return false;
      if (src === 'lab' && q.src) return false;
      if (diff === 'hard' && !TL.isHard(q)) return false;
      if (diff === '1' && q.d > 2) return false;
      if (diff === '3' && (q.d < 3 || q.d > 3)) return false;
      if (diff === '5' && q.d < 4) return false;
      if (qy) {
        var hay = (q.id + ' ' + TL.plain(q.q) + ' ' + q.sp + ' ' + TL.topic(q.t).name + ' ' + TL.plain(q.e)).toLowerCase();
        if (hay.indexOf(qy) < 0) return false;
      }
      return true;
    });
  }

  function render(openId) {
    var rows = filtered();
    var db = TL.db.raw();
    els.count.textContent = rows.length + ' of ' + TL.BANK.length + ' questions';
    if (!rows.length) {
      els.list.innerHTML = '<div class="empty"><h3>Nothing matches</h3><p>Try a broader filter.</p></div>';
      return;
    }
    els.list.innerHTML = rows.slice(0, 400).map(function (q) {
      var open = q.id === openId;
      return '<details class="bank-item" id="' + q.id + '"' + (open ? ' open' : '') + '>' +
        '<summary>' +
          '<span class="id">' + q.id + '</span>' +
          '<span class="chip chip-p' + q.p + '">P' + q.p + '</span>' +
          '<span class="pv">' + TL.esc(TL.plain(q.q).slice(0, 110)) + '</span>' +
          (q.src ? '<span class="chip" style="border-color:color-mix(in srgb,var(--warn) 45%,transparent);color:var(--warn)">'
                 + q.src.year + ' P' + q.src.paper + '</span>' : '') +
          (db.seen[q.id] ? '<span class="chip">seen</span>' : '') +
          (TL.isHard(q) ? '<span class="chip chip-bad">hard</span>' : '') +
        '</summary>' +
        '<div class="bank-body" data-body="' + q.id + '"></div>' +
      '</details>';
    }).join('');

    TL.$$('details.bank-item', els.list).forEach(function (d) {
      var fill = function () {
        var body = TL.$('[data-body]', d);
        if (body.dataset.filled) return;
        body.dataset.filled = '1';
        TL.showQuestion(body, TL.byId(body.dataset.body), null);
      };
      if (d.open) fill();
      d.addEventListener('toggle', function () { if (d.open) fill(); });
    });

    if (openId) {
      var t = TL.$('#' + CSS.escape(openId));
      TL.into(t, { behavior: 'smooth', block: 'center' });
    }
  }

  TL.page = function () {
    els.search = TL.$('#bankSearch');
    els.paper = TL.$('#bankPaper');
    els.topic = TL.$('#bankTopic');
    els.diff = TL.$('#bankDiff');
    els.src = TL.$('#bankSrc');
    els.list = TL.$('#bankList');
    els.count = TL.$('#bankCount');

    els.topic.innerHTML = '<option value="">All topics</option>' +
      TL.TOPICS.map(function (t) { return '<option value="' + t.k + '">P' + t.p + ' · ' + TL.esc(t.name) + '</option>'; }).join('');

    var q = TL.qs();
    if (q.topic) els.topic.value = q.topic;
    if (q.paper) els.paper.value = q.paper;

    if (q.src) els.src.value = q.src;

    ['search', 'paper', 'topic', 'diff', 'src'].forEach(function (k) {
      els[k].addEventListener('input', function () { render(); });
      els[k].addEventListener('change', function () { render(); });
    });

    render(q.q || null);
  };
})(window);
