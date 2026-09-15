/* ============================================================
   TMUA Lab — review queue.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;
  var stage, session;

  function stats() {
    var c = TL.reviewCount();
    var resting = TL.reviewResting();
    var next = resting.length ? resting[0].due : null;
    TL.$('#revStats').innerHTML =
      '<div class="panel" style="padding:16px 18px"><div class="k mono muted" style="font-size:10px;letter-spacing:.13em;text-transform:uppercase">due now</div>' +
        '<div style="font-family:var(--font-display);font-size:30px;font-weight:600;margin-top:4px">' + c.due + '</div></div>' +
      '<div class="panel" style="padding:16px 18px"><div class="k mono muted" style="font-size:10px;letter-spacing:.13em;text-transform:uppercase">resting</div>' +
        '<div style="font-family:var(--font-display);font-size:30px;font-weight:600;margin-top:4px">' + c.resting + '</div>' +
        '<div class="muted" style="font-size:11.5px">' + (next ? 'next back in ' + TL.fmtWhen(next) : 'nothing waiting') + '</div></div>' +
      '<div class="panel" style="padding:16px 18px"><div class="k mono muted" style="font-size:10px;letter-spacing:.13em;text-transform:uppercase">spacing</div>' +
        '<div style="font-family:var(--font-display);font-size:30px;font-weight:600;margin-top:4px">' + TL.REST_HOURS + ' h</div>' +
        '<div class="muted" style="font-size:11.5px">between the two correct answers</div></div>' +
      '<div class="panel" style="padding:16px 18px"><div class="k mono muted" style="font-size:10px;letter-spacing:.13em;text-transform:uppercase">streak</div>' +
        '<div style="font-family:var(--font-display);font-size:30px;font-weight:600;margin-top:4px">' + TL.streak() + '</div>' +
        '<div class="muted" style="font-size:11.5px">consecutive days</div></div>';
  }

  function body() {
    var due = TL.reviewDue();
    var resting = TL.reviewResting();
    var host = TL.$('#revBody');

    if (!due.length && !resting.length) {
      host.innerHTML = '<div class="panel"><div class="empty">' +
        '<h3>Queue empty</h3><p>Nothing to review — either you have not got anything wrong yet, or you have ' +
        'cleared everything. Both are good outcomes.</p>' +
        '<div class="pill-row" style="justify-content:center;margin-top:18px">' +
          '<a class="btn btn-primary btn-sm" href="practice.html">Build a set</a>' +
          '<a class="btn btn-ghost btn-sm" href="mock.html">Sit a mock</a></div>' +
        '</div></div>';
      return;
    }

    var restRows = resting.map(function (r) {
      return '<li><button class="qrow" data-q="' + r.q.id + '">' +
        '<span class="mk bl">◔</span>' +
        '<span class="tt">' + TL.esc(TL.plain(r.q.q).slice(0, 92)) + '</span>' +
        '<span class="chip chip-p' + r.q.p + '">P' + r.q.p + '</span>' +
        '<span class="tm">back in ' + TL.fmtWhen(r.due) + '</span></button></li>';
    }).join('');

    host.innerHTML =
      (due.length
        ? '<div class="callout" style="margin-bottom:22px"><div>' +
            '<h3>' + due.length + ' question' + (due.length === 1 ? '' : 's') + ' due now</h3>' +
            '<p>Answers here do not use up unseen questions and do not count towards the site figures.</p></div>' +
            '<div class="right"><button class="btn btn-accent" id="goReview">Start review</button></div></div>'
        : '<div class="panel" style="padding:20px 22px;margin-bottom:22px;color:var(--text-soft);font-size:14.4px">' +
            'Nothing is due right now. Questions rest for ' + TL.REST_HOURS + ' hours between the two correct ' +
            'answers they need, so come back later.</div>') +
      (resting.length
        ? '<div class="sec-head" style="margin-bottom:12px"><div><h2 style="font-size:20px">Resting</h2>' +
            '<p>Answered correctly once. They come back for their second ask when the ' + TL.REST_HOURS +
            ' hours are up.</p></div></div>' +
          '<ul class="qlist panel" style="overflow:hidden">' + restRows + '</ul>'
        : '') +
      '<div id="qdetail"></div>';

    var go = TL.$('#goReview');
    if (go) go.onclick = function () { start(due); };

    TL.$$('.qrow', host).forEach(function (b) {
      b.onclick = function () {
        TL.showQuestion(TL.$('#qdetail'), TL.byId(b.dataset.q), null);
        TL.into(TL.$('#qdetail'), { behavior: 'smooth', block: 'center' });
      };
    });
  }

  function start(due) {
    var qs = TL.shuffle(due, 'rev' + Date.now()).slice(0, 30);
    session = new TL.Session({
      mode: 'review', ui: 'study',
      title: 'Review · ' + qs.length + ' question' + (qs.length === 1 ? '' : 's'),
      feedback: TL.prefs.get('feedback', 'check'), pausable: true, questions: qs,
      onFinish: function (r) {
        session.destroy();
        TL.renderResults(stage, r.payload, r.scored, { again: function () { root.location.href = 'review.html'; } });
        root.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    stage.innerHTML = '';
    session.mount(stage);
    root.scrollTo({ top: 0 });
  }

  TL.page = function () {
    stage = TL.$('#stage');
    stats();
    body();
    if (TL.qs().go) {
      var due = TL.reviewDue();
      if (due.length) start(due);
    }
  };
})(window);
