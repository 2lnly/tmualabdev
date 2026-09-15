/* ============================================================
   TMUA Lab — published-artifact layer.
   Bundled ONLY into the single-file artifact build. It supplies:
     · hash routing over the views the bundler inlines
     · db        — cross-device sync + a cohort board
     · sample    — an alternative explanation for a question
     · downloads — handing the JSON export to the viewer
   Every capability is optional: when `claude.use` yields null the
   page is exactly the local site.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;
  var D = root.document;

  /* ============================================================
     Routing
     ============================================================ */

  var ROUTES = ['home', 'practice', 'mock', 'review', 'progress',
                'questions', 'guide', 'community', 'privacy', 'terms'];
  var TITLES = {
    home: 'TMUA Lab', practice: 'Practice — TMUA Lab', mock: 'Mock test — TMUA Lab',
    review: 'Review — TMUA Lab', progress: 'Progress — TMUA Lab',
    questions: 'Question bank — TMUA Lab', guide: 'The TMUA guide — TMUA Lab',
    community: 'Community — TMUA Lab', privacy: 'Privacy — TMUA Lab', terms: 'Terms — TMUA Lab'
  };

  var QS = {};
  TL.qs = function () { return QS; };

  function parseHash() {
    var raw = (root.location.hash || '').replace(/^#\/?/, '');
    var qi = raw.indexOf('?');
    var name = (qi < 0 ? raw : raw.slice(0, qi)) || 'home';
    var q = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf('=');
        var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
        q[k] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
      });
    }
    if (ROUTES.indexOf(name) < 0) name = 'home';
    return { name: name, q: q };
  }

  var restoring = false, lastHash = '#/';

  function navigate() {
    if (restoring) { restoring = false; return; }

    // A bare '#anchor' is an in-page link (the guide's contents, #report),
    // never a route — scroll to it and leave the view alone.
    var raw = root.location.hash || '';
    if (raw.length > 1 && raw.charAt(1) !== '/') {
      var target = D.getElementById(raw.slice(1));
      if (target) { TL.into(target); return; }
    }

    if (TL.current && !TL.current.done) {
      if (!root.confirm('Leave this sitting? Nothing is recorded and its questions go back into the pool.')) {
        restoring = true;
        root.location.hash = lastHash;
        return;
      }
      TL.current.abandon();
      TL.current.destroy();
      TL.current = null;
    }
    if (TL.cloud.leaveView) TL.cloud.leaveView();

    var r = parseHash();
    lastHash = root.location.hash || '#/';
    QS = r.q;

    D.body.classList.remove('driver');
    var hdr = TL.$('#hdr'), ftr = TL.$('#ftr');
    if (hdr) hdr.style.display = '';
    if (ftr) ftr.style.display = '';

    TL.$('#main').innerHTML = TL.VIEWS[r.name] || TL.VIEWS.home;
    D.title = TITLES[r.name] || 'TMUA Lab';
    TL.mountHeader();
    TL.reveal();

    var fn = TL.pages[r.name];
    if (fn) fn();
    root.scrollTo({ top: 0 });
  }

  /** Go to a route, re-rendering even when the hash is already that value. */
  TL.go = function (h) {
    if ((root.location.hash || '#/') === h) navigate();
    else root.location.hash = h;
  };

  // Track the live sitting so routing away can clean it up.
  var _mount = TL.Session.prototype.mount;
  TL.Session.prototype.mount = function (host) { TL.current = this; return _mount.call(this, host); };
  var _destroy = TL.Session.prototype.destroy;
  TL.Session.prototype.destroy = function () {
    if (TL.current === this) TL.current = null;
    return _destroy.call(this);
  };

  /* ============================================================
     Capabilities
     ============================================================ */

  var cloud = (TL.cloud = {
    db: null, sample: null, downloads: null,
    link: null,        // {handle, slug, key}
    board: null,       // rows from the cohort collection
    status: 'idle',    // idle | busy | ok | error
    note: ''
  });

  function esc(s) { return TL.esc(s); }

  /* ---------- sample: an alternative explanation ---------- */

  var SAMPLE_DEAD = { not_granted: 1, sampling_disabled: 1, not_declared: 1,
                      capability_disabled: 1, capability_removed: 1, tools_unavailable: 1 };

  function sampleCopy(code) {
    if (code === 'rate_limited') return 'Too many requests just now. Give it a moment and ask again.';
    if (code === 'prompt_too_large' || code === 'invalid_request') return 'That question is too long to ask about.';
    if (code === 'refused' || code === 'empty_completion') return 'No answer came back for that one.';
    if (code === 'session_expired') return 'Your Claude session expired. Reload the page and try again.';
    if (SAMPLE_DEAD[code]) return 'Alternative explanations are not available here.';
    return 'Something went wrong asking Claude. Try again in a moment.';
  }

  TL.explainButton = function (q, chosen) {
    if (!cloud.sample) return '';
    return '<div class="ai" data-ai="' + esc(q.id) + '" data-chose="' + (chosen == null ? '' : chosen) + '">' +
      '<div class="ai-bar">' +
        '<button class="btn btn-quiet btn-sm" data-ask="1">Explain it another way</button>' +
        '<span class="who">asks claude · uses your account</span>' +
      '</div>' +
      '<div class="ai-out hidden"></div>' +
    '</div>';
  };

  function promptFor(q, chosen) {
    var letters = TL.LETTERS;
    var opts = q.o.map(function (o, i) { return letters[i] + ') ' + TL.plain(o); }).join('\n');
    return 'A student is preparing for the TMUA — the Test of Mathematics for University Admission, a ' +
      'non-calculator multiple-choice test at AS-level standard. They have read the worked answer below and ' +
      'still do not follow it.\n\n' +
      'QUESTION\n' + TL.plain(q.q) + '\n\n' +
      'OPTIONS\n' + opts + '\n\n' +
      'CORRECT ANSWER: ' + letters[q.a] + '\n' +
      'THE STUDENT CHOSE: ' + (chosen == null || chosen === '' ? 'nothing — they left it blank' : letters[chosen]) + '\n\n' +
      'THE EXPLANATION THEY HAVE ALREADY READ\n' + TL.plain(q.e) + '\n\n' +
      'Write a different explanation of the same question. Rules:\n' +
      '- Take a genuinely different route to the answer if one exists. If there is only one sensible route, ' +
      'explain that route in different terms, starting from whatever the student most likely misunderstood.\n' +
      '- Plain prose and plain-text maths only (x^2, sqrt(5), <=). No LaTeX, no markdown, no bullet characters.\n' +
      '- At most 150 words.\n' +
      (chosen == null || chosen === '' ? '' :
       (chosen === q.a ? '- They got it right, so finish with the one idea that makes it quick next time.\n'
                       : '- Finish with one sentence on why option ' + letters[chosen] + ' is tempting.\n'));
  }

  TL.bindExplain = function (host) {
    if (!cloud.sample) return;
    TL.$$('[data-ai]', host).forEach(function (box) {
      var btn = TL.$('[data-ask]', box);
      var out = TL.$('.ai-out', box);
      if (!btn) return;
      var ctl = null;

      btn.onclick = function () {
        if (ctl) { ctl.abort(); return; }
        var q = TL.byId(box.dataset.ai);
        if (!q) return;
        var chose = box.dataset.chose === '' ? null : +box.dataset.chose;

        ctl = new root.AbortController();
        btn.textContent = 'Stop';
        out.classList.remove('hidden');
        out.classList.add('think');
        out.textContent = 'Thinking… this usually takes a few seconds.';

        cloud.sample(promptFor(q, chose), {
          signal: ctl.signal,
          modelTier: 'default',
          onText: function (e) { out.classList.remove('think'); out.textContent = e.text; }
        }).then(function (res) {
          out.classList.remove('think');
          out.textContent = res.text;
          if (res.truncated) {
            var n = TL.el('div', { class: 'ai-note', text: 'Cut short — ask again for a shorter answer.' });
            box.appendChild(n);
          }
        }).catch(function (e) {
          if (e && e.code === 'cancelled') {
            out.classList.remove('think');
            out.textContent = e.text || '';
            if (!e.text) out.classList.add('hidden');
          } else {
            out.classList.remove('think');
            out.textContent = sampleCopy(e && e.code);
            if (e && SAMPLE_DEAD[e.code]) {
              cloud.sample = null;
              TL.$$('[data-ask]').forEach(function (b) { b.remove(); });
            }
          }
        }).then(function () {
          ctl = null;
          btn.textContent = 'Explain it another way';
        });
      };
    });
  };

  /* ---------- downloads ---------- */

  cloud.saveFile = function (filename, data) {
    if (!cloud.downloads) return false;
    cloud.downloads.save({ filename: filename, data: data }).then(function (r) {
      if (r.status === 'saved') TL.toast('Saved ' + filename);
    }).catch(function (e) {
      var c = e && e.code;
      if (c === 'declined') return;
      if (c === 'rate_limited') TL.toast('A save prompt is already open');
      else TL.toast('That file could not be saved here');
    });
    return true;
  };

  /* ============================================================
     db — sync and the cohort board
     ============================================================ */

  var LINK_KEY = 'tmualab.sync';
  var MAX_DOC = 200 * 1024;         // stay clear of the 256 KiB document cap
  var boardUnsub = null, rerender = null, pushTimer = null;

  function loadLink() {
    try { return JSON.parse(root.localStorage.getItem(LINK_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveLink(v) {
    try {
      if (v) root.localStorage.setItem(LINK_KEY, JSON.stringify(v));
      else root.localStorage.removeItem(LINK_KEY);
    } catch (e) {}
    cloud.link = v;
  }

  function slugify(name) {
    var s = String(name).trim().toLowerCase().replace(/[^a-z0-9_\-.~:@+]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 48);
    return s;
  }

  /** A passcode digest. Enough to stop two people colliding by accident;
      deliberately not presented as security. */
  function keyOf(handle, pass) {
    var base = slugify(handle) + '::' + String(pass);
    var out = '';
    for (var i = 0; i < 4; i++) out += ('0000000' + TL.hash(base + '#' + i).toString(16)).slice(-8);
    return out;
  }

  /* --- what travels --- */

  function summary() {
    var st = TL.stats();
    var sessions = TL.db.raw().sessions.filter(function (s) { return s.score != null; });
    var best = sessions.reduce(function (m, s) { return Math.max(m, s.score); }, 0);
    var mocks = TL.db.raw().sessions.filter(function (s) { return s.mode === 'mock'; }).length;
    return {
      handle: cloud.link ? cloud.link.handle : '',
      key: cloud.link ? cloud.link.key : '',
      best: best || 0,
      answered: st.answered,
      accuracy: st.accuracy == null ? 0 : Math.round(st.accuracy * 1000) / 1000,
      mocks: mocks,
      streak: TL.streak(),
      updatedAt: Date.now()
    };
  }

  /** Trim the state until it fits a document, oldest history first. */
  function payload() {
    var raw = TL.db.raw();
    var att = raw.attempts.slice(), ses = raw.sessions.slice();
    var body;
    for (var round = 0; round < 12; round++) {
      body = {
        v: 1,
        seen: raw.seen,
        review: raw.review,
        cleared: raw.cleared || {},
        cutoff: raw.cutoff,
        attempts: att,
        sessions: ses
      };
      if (JSON.stringify(body).length <= MAX_DOC) return body;
      if (ses.length > 12) ses = ses.slice(0, Math.max(12, Math.floor(ses.length * 0.6)));
      else att = att.slice(Math.floor(att.length * 0.35));
    }
    return body;
  }

  /** Union the two histories; the more recent record of any one item wins. */
  function merge(remote) {
    var local = TL.db.raw();
    if (!remote || typeof remote !== 'object') return;

    Object.keys(remote.seen || {}).forEach(function (k) { local.seen[k] = 1; });

    local.cleared = local.cleared || {};
    Object.keys(remote.cleared || {}).forEach(function (k) {
      local.cleared[k] = Math.max(local.cleared[k] || 0, remote.cleared[k] || 0);
    });

    Object.keys(remote.review || {}).forEach(function (k) {
      var r = remote.review[k], l = local.review[k];
      if (local.cleared[k] && (r.at || 0) <= local.cleared[k]) return;   // already finished here
      if (!l || (r.at || 0) > (l.at || 0)) local.review[k] = r;
    });
    Object.keys(local.review).forEach(function (k) {
      if ((remote.cleared || {})[k] && (local.review[k].at || 0) <= remote.cleared[k]) delete local.review[k];
    });

    var seenAtt = {};
    local.attempts.forEach(function (a) { seenAtt[a.q + '|' + a.at] = 1; });
    (remote.attempts || []).forEach(function (a) {
      var k = a.q + '|' + a.at;
      if (!seenAtt[k]) { seenAtt[k] = 1; local.attempts.push(a); }
    });
    local.attempts.sort(function (a, b) { return a.at - b.at; });
    if (local.attempts.length > 6000) local.attempts.splice(0, local.attempts.length - 6000);

    var haveSes = {};
    local.sessions.forEach(function (s) { haveSes[s.id] = 1; });
    (remote.sessions || []).forEach(function (s) { if (s && s.id && !haveSes[s.id]) local.sessions.push(s); });
    local.sessions.sort(function (a, b) { return b.at - a.at; });
    if (local.sessions.length > 200) local.sessions.length = 200;

    Object.keys(remote.cutoff || {}).forEach(function (k) {
      local.cutoff[k] = Math.max(local.cutoff[k] || 0, remote.cutoff[k] || 0);
    });

    TL.db.save();
  }

  function dbCopy(code) {
    if (code === 'quota_exceeded') return 'The shared space is full — nothing new can be stored right now.';
    if (code === 'resource_exhausted') return 'Too many requests just now. Try again in a moment.';
    if (code === 'revoked') return 'Access to the shared space ended. Your progress is safe on this device.';
    if (code === 'invalid_argument') return 'That could not be stored. Your progress is safe on this device.';
    return 'The shared space is unreachable. Your progress is safe on this device.';
  }

  function setStatus(s, note) {
    cloud.status = s; cloud.note = note || '';
    if (rerender) rerender();
  }

  cloud.pull = function () {
    if (!cloud.db || !cloud.link) return Promise.resolve();
    return cloud.db.doc('players/' + cloud.link.slug + '/state/blob').get().then(function (snap) {
      if (snap.exists) merge(snap.data());
    });
  };

  cloud.push = function () {
    if (!cloud.db || !cloud.link) return Promise.resolve();
    var slug = cloud.link.slug;
    var row = cloud.db.doc('players/' + slug);
    return row.get().then(function (snap) {
      var body = summary();
      // `best` only ever climbs. A device whose state blob failed to come
      // down must not publish a 0 over a score already on the board.
      var prev = snap.exists ? snap.data() : null;
      if (prev && typeof prev.best === 'number') body.best = Math.max(prev.best, body.best);
      return row.set(body);
    }).then(function () {
      return cloud.db.doc('players/' + slug + '/state/blob').set(payload());
    });
  };

  cloud.syncNow = function () {
    if (!cloud.db || !cloud.link || cloud.status === 'busy') return;
    setStatus('busy');
    cloud.pull()
      .then(function () { return cloud.push(); })
      .then(function () {
        try { root.localStorage.setItem('tmualab.syncAt', String(Date.now())); } catch (e) {}
        setStatus('ok');
      })
      .catch(function (e) { setStatus('error', dbCopy(e && e.code)); });
  };

  /** Sync soon after a sitting is saved, without a write per question. */
  function scheduleSync() {
    if (!cloud.db || !cloud.link) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { pushTimer = null; cloud.syncNow(); }, 4000);
  }

  var _saveSession = TL.saveSession;
  TL.saveSession = function (s) { var id = _saveSession(s); scheduleSync(); return id; };

  cloud.linkAccount = function (handle, pass) {
    if (!cloud.db) return;
    handle = String(handle || '').trim();
    var slug = slugify(handle);
    if (slug.length < 2) { setStatus('error', 'Pick a name of at least two letters or digits.'); return; }
    if (String(pass || '').length < 4) { setStatus('error', 'The passcode needs at least four characters.'); return; }

    var key = keyOf(handle, pass);
    var ref = cloud.db.doc('players/' + slug);
    setStatus('busy');

    ref.acquire({ holder: key, ttlMs: 8000 }).then(function (lease) {
      if (!lease.acquired) throw { code: 'busy' };
      return ref.get();
    }).then(function (snap) {
      if (snap.exists && snap.data().key && snap.data().key !== key) throw { code: 'taken' };
      saveLink({ handle: handle.slice(0, 24), slug: slug, key: key });
      return cloud.pull().then(cloud.push);
    }).then(function () {
      try { root.localStorage.setItem('tmualab.syncAt', String(Date.now())); } catch (e) {}
      setStatus('ok');
      TL.toast('Sync on');
    }).catch(function (e) {
      var c = e && e.code;
      if (c === 'busy') setStatus('error', 'Someone is claiming that name right now. Try again in a moment.');
      else if (c === 'taken') setStatus('error', 'That name is already in use with a different passcode.');
      else { saveLink(null); setStatus('error', dbCopy(c)); }
    });
  };

  cloud.unlink = function () {
    saveLink(null);
    setStatus('idle');
    TL.toast('Sync off — this device only');
  };

  /* ---------- dashboard cards ---------- */

  cloud.syncCard = function () {
    if (!cloud.db) return null;
    var link = cloud.link;
    var busy = cloud.status === 'busy';
    var problem = cloud.status === 'error'
      ? '<div class="ai-note" style="color:var(--bad)">' + esc(cloud.note) + '</div>' : '';

    if (!link) {
      return {
        sub: 'off',
        body:
          '<p style="font-size:14px;color:var(--text-soft);margin:0">Pick a name and a passcode to keep a copy of ' +
            'your progress in the shared study space. Enter the same pair on another device and your seen ' +
            'questions, review queue, sittings and streak follow you there.</p>' +
          '<div class="sync-form">' +
            '<input id="syncName" type="text" maxlength="24" placeholder="Display name" autocomplete="off">' +
            '<input id="syncPass" type="password" maxlength="64" placeholder="Passcode (4+ characters)" autocomplete="new-password">' +
            '<button class="btn btn-accent btn-sm" id="syncOn"' + (busy ? ' disabled' : '') + '>' +
              (busy ? 'Connecting…' : 'Turn on sync') + '</button>' +
          '</div>' + problem +
          '<p class="sync-warn" style="margin-top:12px">Anyone with this page can see the cohort board and could ' +
            'take an unused name. The passcode prevents accidents, not determined people — use a throwaway one, ' +
            'never a real password.</p>'
      };
    }

    var at = 0;
    try { at = +(root.localStorage.getItem('tmualab.syncAt') || 0); } catch (e) {}
    return {
      sub: 'on',
      body:
        '<div class="sync-live"><span class="dot"></span><span>Synced as <b>' + esc(link.handle) + '</b></span></div>' +
        '<p style="font-size:13px;color:var(--faint);margin:8px 0 0">' +
          (busy ? 'Syncing…' : at ? 'Last synced ' + TL.fmtDate(at) + '.' : 'Not synced yet.') +
          ' A sitting syncs on its own a few seconds after it ends.</p>' +
        problem +
        '<div class="pill-row" style="margin-top:14px">' +
          '<button class="btn btn-ghost btn-sm" id="syncNow"' + (busy ? ' disabled' : '') + '>Sync now</button>' +
          '<button class="btn btn-quiet btn-sm" id="syncOff">Turn off</button>' +
        '</div>' +
        '<p class="sync-warn" style="margin-top:12px">Turning sync off leaves this device untouched and stops ' +
          'writing. It does not remove what is already in the shared space.</p>'
    };
  };

  cloud.boardCard = function () {
    if (!cloud.db) return null;
    if (!cloud.board) return '<div class="empty" style="padding:26px 10px"><h3>Loading</h3>' +
      '<p>Reading the shared study space.</p></div>';
    if (!cloud.board.length) return '<div class="empty" style="padding:26px 10px"><h3>Nobody yet</h3>' +
      '<p>Turn on sync and your best score appears here for everyone with this link.</p></div>';

    var mine = cloud.link ? cloud.link.slug : null;
    return '<ol class="board">' + cloud.board.map(function (r, i) {
      var me = r.id === mine;
      return '<li>' +
        '<span class="rk">' + (i + 1) + '</span>' +
        '<span class="nm' + (me ? ' me' : '') + '">' + esc(String(r.handle || r.id).slice(0, 24)) +
          (me ? ' · you' : '') + '</span>' +
        '<span class="chip">' + (r.mocks || 0) + ' mock' + (r.mocks === 1 ? '' : 's') + '</span>' +
        '<span class="sc">' + (typeof r.best === 'number' ? r.best.toFixed(1) : '—') + '</span>' +
      '</li>';
    }).join('') + '</ol>' +
    '<p class="sync-warn" style="margin-top:12px">Best score from any scored sitting. Names are written by other ' +
      'viewers — treat them as untrusted text.</p>';
  };

  cloud.bindDash = function (again) {
    rerender = again;
    var on = TL.$('#syncOn');
    if (on) on.onclick = function () {
      cloud.linkAccount(TL.$('#syncName').value, TL.$('#syncPass').value);
    };
    var now = TL.$('#syncNow');
    if (now) now.onclick = cloud.syncNow;
    var off = TL.$('#syncOff');
    if (off) off.onclick = function () {
      if (root.confirm('Turn sync off on this device? Your progress here is untouched.')) cloud.unlink();
    };

    if (cloud.db && !boardUnsub) {
      try {
        boardUnsub = cloud.db.collection('players').orderBy('best', 'desc').limit(50)
          .onSnapshot(function (snap) {
            cloud.board = snap.docs.map(function (d) {
              var v = d.data() || {};
              return { id: d.id, handle: v.handle, best: v.best, mocks: v.mocks };
            });
            if (rerender) rerender();
          }, function () {
            cloud.board = [];
            if (rerender) rerender();
          });
      } catch (e) { cloud.board = []; }
    }
  };

  cloud.leaveView = function () {
    rerender = null;
    if (boardUnsub) { boardUnsub(); boardUnsub = null; }
    cloud.board = null;
  };

  /* ============================================================
     Boot
     ============================================================ */

  function use(name) {
    if (!root.claude || typeof root.claude.use !== 'function') return Promise.resolve(null);
    try { return root.claude.use(name).catch(function () { return null; }); }
    catch (e) { return Promise.resolve(null); }
  }

  function boot() {
    TL.mountHeader();
    TL.mountFooter();
    navigate();
    root.addEventListener('hashchange', navigate);

    // Capabilities arrive later than the first render, never before it.
    use('sample').then(function (s) {
      cloud.sample = s || null;
      if (s && TL.$('#main')) navigate();          // reveal the ask buttons
    });

    use('downloads').then(function (d) { cloud.downloads = d || null; });

    use('db').then(function (db) {
      cloud.db = db || null;
      if (!db) return;
      cloud.link = loadLink();
      if (cloud.link) cloud.syncNow();
      if (TL.redrawDash) TL.redrawDash();
    });
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
