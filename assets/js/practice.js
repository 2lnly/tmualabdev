/* ============================================================
   TMUA Lab — practice: set builder, player, results.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;

  var state = { paper: 1, topics: [], count: 10, mode: 'relaxed', hardOnly: false,
                source: 'past', feedback: 'check' };
  var stage, session;

  function seg(hostSel, key, onChange) {
    var host = TL.$(hostSel);
    if (!host) return;
    TL.$$('button', host).forEach(function (b) {
      b.onclick = function () {
        TL.$$('button', host).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        // an empty value is the string '', not 0 — +'' coerces to zero
        var v = b.dataset.v;
        state[key] = (v !== '' && !isNaN(+v)) ? +v : v;
        if (onChange) onChange();
        summary();
      };
    });
  }

  function renderTopics() {
    var host = TL.$('#segTopics');
    host.innerHTML = TL.topicsFor(state.paper)
      .map(function (t) {
        var on = state.topics.indexOf(t.k) >= 0;
        return '<button data-k="' + t.k + '" aria-pressed="' + on + '">' + TL.esc(t.short) + '</button>';
      }).join('');
    host.className = 'seg' + (state.paper === 2 ? ' p2' : '');
    TL.$$('button', host).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.k, i = state.topics.indexOf(k);
        if (i >= 0) state.topics.splice(i, 1); else state.topics.push(k);
        b.setAttribute('aria-pressed', i < 0);
        summary();
      };
    });
  }

  function filt(extra) {
    var o = { paper: state.paper, topics: state.topics, hardOnly: state.hardOnly, source: state.source };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  function poolSize() { return TL.pool(filt()).length; }
  function unseenSize() { return TL.pool(filt({ unseenOnly: true })).length; }

  /** Exam conditions overrides the choice; everywhere else it is the choice. */
  function effectiveFeedback() {
    return state.mode === 'exam' ? 'end' : state.feedback;
  }

  function summary() {
    var total = poolSize(), fresh = unseenSize();
    var n = Math.min(state.count, Math.max(1, total));
    var secs = state.mode === 'exam' ? n * TL.EXAM.secondsPerQ : null;
    var names = state.topics.length
      ? state.topics.map(function (k) { return TL.topic(k).short; }).join(', ')
      : 'whole paper';

    TL.$('#summary').innerHTML =
      '<li><span>Paper</span><span>' + state.paper + '</span></li>' +
      '<li><span>Source</span><span>' + (state.source === 'past' ? 'real papers' : state.source === 'lab' ? 'this site' : 'everything') + '</span></li>' +
      '<li><span>Topics</span><span>' + TL.esc(names) + '</span></li>' +
      '<li><span>Questions</span><span>' + n + '</span></li>' +
      '<li><span>Conditions</span><span>' + (state.mode === 'exam' ? 'exam' : 'relaxed') + '</span></li>' +
      '<li><span>Answers</span><span>' +
        ({ instant: 'on picking', check: 'on confirm', end: 'at the end' })[effectiveFeedback()] + '</span></li>' +
      '<li><span>Time allowed</span><span>' + (secs ? TL.fmtClock(secs) : 'untimed') + '</span></li>' +
      '<li><span>Scored</span><span>' + (n >= 10 ? 'yes' : 'no — under 10') + '</span></li>';

    TL.$('#poolHint').innerHTML = fresh + ' unseen of ' + total + ' available' +
      (fresh < n ? ' — the set will reuse questions you have already sat.' : '.');

    TL.$('#countHint').textContent = state.mode === 'exam'
      ? 'At the real pace of ' + TL.fmtClock(TL.EXAM.secondsPerQ) + ' a question, ' + n + ' questions is ' + TL.fmtClock(n * TL.EXAM.secondsPerQ) + '.'
      : 'Ten is about fifteen minutes. Sets of ten or more get a score.';

    TL.$('#modeHint').textContent = state.mode === 'exam'
      ? 'A countdown at the real pace, no pausing, and nothing revealed until the end.'
      : 'The timer counts up and can be paused.';

    // Under exam conditions the answer timing is not a free choice.
    var fbLocked = state.mode === 'exam';
    TL.$$('#segFeedback button').forEach(function (b) {
      b.disabled = fbLocked;
      b.setAttribute('aria-pressed', String(effectiveFeedback() === b.dataset.v));
    });
    TL.$('#segFeedback').style.opacity = fbLocked ? '0.5' : '';
    TL.$('#feedbackHint').textContent = fbLocked
      ? 'Fixed to “only at the end” under exam conditions — that is what exam conditions means.'
      : effectiveFeedback() === 'instant'
        ? 'Marked the moment you choose, with no way back. Fastest for drilling; unforgiving of a misclick.'
        : effectiveFeedback() === 'check'
          ? 'Choose, change your mind, then confirm. You can still clear an answer by clicking it again.'
          : 'Nothing revealed until the set is over, then every question at once. Closest to a real sitting.';

    TL.$('#paperHint').textContent = TL.PAPERS[state.paper].full + ' — ' + TL.PAPERS[state.paper].blurb;

    TL.$('#sourceHint').textContent = state.source === 'past'
      ? 'Questions from the real papers UAT-UK publishes, 2016 to 2023. This is the true standard.'
      : state.source === 'lab'
        ? 'Questions written for this site. Measurably easier than a real paper — useful for drilling a topic, not for judging where you stand.'
        : 'The whole bank. Sets will mix real questions with the easier ones written for this site.';
  }

  function recent() {
    var host = TL.$('#recent');
    if (!host) return;
    var db = TL.db.raw();
    var rows = db.sessions.filter(function (s) { return s.mode === 'practice'; }).slice(0, 6);
    if (!rows.length) {
      host.innerHTML = '<li><div class="empty"><h3>Nothing yet</h3><p>Your last few sets will appear here once you have sat one.</p></div></li>';
      return;
    }
    host.innerHTML = rows.map(function (s) {
      var ok = s.items.filter(function (i) { return i.ok; }).length;
      return '<li><button class="qrow" data-s="' + s.id + '">' +
        '<span class="mk ' + (ok / s.items.length >= 0.7 ? 'ok' : 'no') + '">' + (s.score ? s.score.toFixed(1) : '–') + '</span>' +
        '<span class="tt">' + TL.esc(s.title) + '</span>' +
        '<span class="chip">' + ok + '/' + s.items.length + '</span>' +
        '<span class="tm">' + TL.fmtDate(s.at) + '</span></button></li>';
    }).join('');
    TL.$$('.qrow', host).forEach(function (b) {
      b.onclick = function () { showSaved(b.dataset.s); };
    });
  }

  function showSaved(id) {
    var s = TL.getSession(id);
    if (!s) return;
    var scored = TL.scoreSet(s.items.map(function (i) { return { q: i.q, ok: i.ok }; }));
    TL.renderResults(stage, s, scored, { again: back });
    root.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() { root.location.href = 'practice.html'; }

  function start() {
    var qs = TL.buildSet({
      paper: state.paper, topics: state.topics,
      count: state.count, hardOnly: state.hardOnly, source: state.source,
      seed: 'p' + Date.now()
    });
    if (!qs.length) { TL.toast('No questions match that combination'); return; }

    var names = state.topics.length
      ? state.topics.map(function (k) { return TL.topic(k).short; }).join(' + ')
      : 'Paper ' + state.paper;

    session = new TL.Session({
      mode: 'practice',
      ui: 'study',
      title: names + ' · ' + qs.length + ' questions' + (state.mode === 'exam' ? ' · exam conditions' : ''),
      paper: state.paper,
      feedback: effectiveFeedback(),
      seconds: state.mode === 'exam' ? qs.length * TL.EXAM.secondsPerQ : 0,
      pausable: state.mode !== 'exam',
      questions: qs,
      onFinish: function (r) {
        session.destroy();
        TL.renderResults(stage, r.payload, r.scored, { again: back });
        root.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    stage.innerHTML = '';
    session.mount(stage);
    root.scrollTo({ top: 0 });
  }

  TL.page = function () {
    stage = TL.$('#stage');
    var q = TL.qs();

    if (q.paper) state.paper = +q.paper === 2 ? 2 : 1;
    if (q.topic) { var t = TL.topic(q.topic); state.paper = t.p; state.topics = [q.topic]; }
    if (q.n) state.count = Math.max(5, Math.min(30, +q.n));

    state.feedback = TL.prefs.get('feedback', 'check');
    TL.$$('#segFeedback button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.v === state.feedback));
    });

    TL.$$('#segPaper button').forEach(function (b) {
      b.setAttribute('aria-pressed', +b.dataset.v === state.paper);
    });

    seg('#segPaper', 'paper', function () { state.topics = []; renderTopics(); });
    seg('#segSource', 'source');
    seg('#segMode', 'mode');
    seg('#segFeedback', 'feedback', function () { TL.prefs.set('feedback', state.feedback); });
    renderTopics();

    var c = TL.$('#count'), out = TL.$('#countOut');
    c.value = state.count; out.textContent = state.count;
    c.oninput = function () { state.count = +c.value; out.textContent = c.value; summary(); };

    TL.$('#hardOnly').onchange = function (e) { state.hardOnly = e.target.checked; summary(); };
    TL.$('#startBtn').onclick = start;

    summary();
    recent();

    if (q.go) start();
    if (q.session) showSaved(q.session);
  };
})(window);
