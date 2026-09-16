/* ============================================================
   TMUA Lab — page chrome: header, footer, theme, command
   palette, toasts, scroll reveal.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});
  var D = root.document;

  TL.NAV = [
    { n: '01', label: 'Practice',      href: 'practice.html' },
    { n: '02', label: 'Mock test',     href: 'mock.html' },
    { n: '03', label: 'Past papers',   href: 'papers/' },
    { n: '04', label: 'Review',        href: 'review.html' },
    { n: '05', label: 'Progress',      href: 'progress.html' },
    { n: '06', label: 'Question bank', href: 'questions.html' },
    { n: '07', label: 'Guide',         href: 'guide.html' }
  ];

  /* ---------------- helpers ---------------- */

  TL.el = function (tag, attrs, html) {
    var e = D.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };

  TL.$ = function (sel, ctx) { return (ctx || D).querySelector(sel); };
  TL.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || D).querySelectorAll(sel)); };

  /** scrollIntoView, but safe on engines that lack it. */
  TL.into = function (el, opts) {
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView(opts || { behavior: 'smooth', block: 'start' });
  };

  TL.toast = function (msg) {
    var box = TL.$('.toasts');
    if (!box) { box = TL.el('div', { class: 'toasts' }); D.body.appendChild(box); }
    var t = TL.el('div', { class: 'toast', text: msg });
    box.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  };

  /* ---------------- theme ---------------- */

  TL.theme = {
    get: function () {
      try { return root.localStorage.getItem('tmualab.theme') || ''; } catch (e) { return ''; }
    },
    set: function (v) {
      try { root.localStorage.setItem('tmualab.theme', v); } catch (e) {}
      TL.theme.apply();
    },
    apply: function () {
      var v = TL.theme.get();
      if (v) D.documentElement.setAttribute('data-theme', v);
      else D.documentElement.removeAttribute('data-theme');
    },
    toggle: function () {
      var cur = TL.theme.get();
      var dark = cur ? cur === 'dark'
        : !root.matchMedia || !root.matchMedia('(prefers-color-scheme: light)').matches;
      TL.theme.set(dark ? 'light' : 'dark');
      TL.toast(dark ? 'Light theme' : 'Dark theme');
    }
  };
  TL.theme.apply();

  /* ---------------- chrome ---------------- */

  function currentPage() {
    var f = root.location.pathname.split('/').pop();
    return f || 'index.html';
  }

  TL.mountHeader = function () {
    var host = TL.$('#hdr');
    if (!host) return;
    var here = currentPage();
    var due = TL.reviewCount ? TL.reviewCount().due : 0;

    var links = TL.NAV.map(function (it) {
      var cur = it.href === here ? ' aria-current="page"' : '';
      var badge = (it.href === 'review.html' && due)
        ? ' <span class="chip chip-warn" style="padding:1px 6px;font-size:9.5px">' + due + '</span>' : '';
      return '<a href="' + it.href + '"' + cur + '><i>' + it.n + '</i>' + it.label + badge + '</a>';
    }).join('');

    host.className = 'hdr';
    host.innerHTML =
      '<div class="wrap hdr-in">' +
        '<a class="brand" href="index.html"><span class="mark">T</span>TMUA <em>Lab</em></a>' +
        '<nav class="nav" id="nav">' + links + '</nav>' +
        '<div class="hdr-right">' +
          '<button class="kbd-btn" id="palBtn" title="Command palette">⌘K</button>' +
          '<button class="kbd-btn" id="themeBtn" title="Switch theme" aria-label="Switch theme">◐</button>' +
          '<button class="burger" id="burger" aria-label="Menu"><span></span></button>' +
        '</div>' +
      '</div>';

    TL.$('#palBtn').onclick = function () { TL.palette.open(); };
    TL.$('#themeBtn').onclick = function () { TL.theme.toggle(); };
    var b = TL.$('#burger');
    if (b) b.onclick = function () { TL.$('#nav').classList.toggle('open'); };
  };

  TL.mountFooter = function () {
    var host = TL.$('#ftr');
    if (!host) return;
    host.className = 'ftr';
    host.innerHTML =
      '<div class="wrap ftr-in">' +
        '<div class="disc">Not affiliated with UAT-UK, Pearson VUE, Imperial College London, LSE, ' +
          'the University of Warwick, Durham University or the University of Cambridge. ' +
          'TMUA is a registered test administered by UAT-UK.</div>' +
        '<div class="links">' +
          '<a href="papers/">Past papers</a>' +
          '<a href="guide.html">Guide</a>' +
          '<a href="community.html">Community</a>' +
          '<a href="privacy.html">Privacy</a>' +
          '<a href="terms.html">Terms</a>' +
          '<a href="community.html#report">Report an issue</a>' +
        '</div>' +
      '</div>';
  };

  /* ---------------- command palette ---------------- */

  TL.palette = (function () {
    var back = null, input = null, list = null, items = [], sel = 0;

    function actions() {
      var out = TL.NAV.map(function (it) {
        return { ic: it.n, tt: it.label, sb: 'go', run: function () { root.location.href = it.href; } };
      });

      out.push({ ic: '↯', tt: 'Sit a full mock (Paper 1 + Paper 2)', sb: 'mock',
                 run: function () { root.location.href = 'mock.html?start=both'; } });
      out.push({ ic: '↯', tt: 'Sit Paper 1 only', sb: 'mock',
                 run: function () { root.location.href = 'mock.html?start=1'; } });
      out.push({ ic: '↯', tt: 'Sit Paper 2 only', sb: 'mock',
                 run: function () { root.location.href = 'mock.html?start=2'; } });

      (TL.TOPICS || []).forEach(function (t) {
        out.push({ ic: 'P' + t.p, tt: 'Practise ' + t.name, sb: 'practice',
          run: function () { root.location.href = 'practice.html?topic=' + t.k + '&go=1'; } });
      });

      out.push({ ic: '◐', tt: 'Switch light / dark theme', sb: 'theme', run: function () { TL.theme.toggle(); } });
      out.push({ ic: '⟲', tt: 'Erase all my local data', sb: 'danger', run: function () {
        if (root.confirm('This deletes every answer, session and streak stored in this browser. Continue?')) {
          TL.db.reset(); TL.toast('Local data erased'); setTimeout(function () { root.location.reload(); }, 500);
        }
      } });

      (TL.BANK || []).forEach(function (q) {
        out.push({ ic: '?', tt: TL.plain(q.q).slice(0, 78), sb: q.id, q: q,
          run: function () { root.location.href = 'questions.html?q=' + q.id; } });
      });
      return out;
    }

    var ALL = null;

    function fuzzy(hay, needle) {
      hay = hay.toLowerCase(); needle = needle.toLowerCase();
      if (!needle) return 1;
      if (hay.indexOf(needle) >= 0) return 100 - hay.indexOf(needle);
      var i = 0, score = 0;
      for (var j = 0; j < hay.length && i < needle.length; j++) {
        if (hay[j] === needle[i]) { i++; score++; }
      }
      return i === needle.length ? score / 4 : 0;
    }

    function render() {
      var qy = input.value.trim();
      items = ALL.map(function (a) { return { a: a, s: fuzzy(a.tt + ' ' + a.sb, qy) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 40).map(function (x) { return x.a; });
      sel = 0;
      if (!items.length) { list.innerHTML = '<div class="pal-empty">Nothing matches “' + TL.esc(qy) + '”</div>'; return; }
      list.innerHTML = items.map(function (a, i) {
        return '<button class="pal-item" data-i="' + i + '"' + (i === 0 ? ' data-sel="1"' : '') + '>' +
          '<span class="ic">' + TL.esc(a.ic) + '</span>' +
          '<span class="tt">' + TL.esc(a.tt) + '</span>' +
          '<span class="sb">' + TL.esc(a.sb) + '</span></button>';
      }).join('');
      TL.$$('.pal-item', list).forEach(function (b) {
        b.onclick = function () { run(+b.dataset.i); };
      });
    }

    function move(d) {
      var next = sel + d;
      if (next < 0 || next >= items.length) return;
      sel = next;
      TL.$$('.pal-item', list).forEach(function (b, i) {
        if (i === sel) { b.dataset.sel = '1'; TL.into(b, { block: 'nearest' }); }
        else delete b.dataset.sel;
      });
    }

    function run(i) {
      var a = items[i];
      close();
      if (a) a.run();
    }

    function close() { if (back) { back.remove(); back = null; } }

    function open() {
      if (back) return;
      if (!ALL) ALL = actions();
      back = TL.el('div', { class: 'pal-back' });
      back.innerHTML =
        '<div class="pal" role="dialog" aria-label="Command palette">' +
          '<input type="text" placeholder="Jump to a page, start a set, search the bank…" aria-label="Command" autocomplete="off">' +
          '<div class="pal-list"></div>' +
          '<div class="pal-foot"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></div>' +
        '</div>';
      D.body.appendChild(back);
      input = TL.$('input', back); list = TL.$('.pal-list', back);
      back.onclick = function (e) { if (e.target === back) close(); };
      input.oninput = render;
      input.onkeydown = function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
      };
      render();
      input.focus();
    }

    return { open: open, close: close };
  })();

  /* ---------------- global keys ---------------- */

  D.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); TL.palette.open(); return;
    }
    if (typing) return;
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); TL.palette.open(); }
  });

  /* ---------------- scroll reveal ---------------- */

  TL.reveal = function () {
    var els = TL.$$('.rv');
    if (!('IntersectionObserver' in root)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e, i) { e.style.transitionDelay = Math.min(i * 45, 280) + 'ms'; io.observe(e); });
  };

  /* ---------------- count-up ---------------- */

  TL.countUp = function (el, to, dur) {
    dur = dur || 1100;
    var from = 0, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  /* ---------------- boot ---------------- */

  function boot() {
    TL.mountHeader();
    TL.mountFooter();
    TL.reveal();
    if (typeof TL.page === 'function') TL.page();
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
