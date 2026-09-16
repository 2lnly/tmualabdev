/* ============================================================
   TMUA Lab — behaviour for the generated static pages.
   Deliberately tiny: these pages are read, not operated, and
   must not pull in the question bank the app pages need.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'tmualab.theme';
  var root = document.documentElement;

  function get() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function apply(v) { if (v) root.setAttribute('data-theme', v); else root.removeAttribute('data-theme'); }
  apply(get());

  function ready() {
    var btn = document.getElementById('themeBtn');
    if (btn) btn.onclick = function () {
      var cur = get();
      var dark = cur ? cur === 'dark' : !(window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches);
      var next = dark ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    };
    var burger = document.getElementById('burger');
    if (burger) burger.onclick = function () { document.getElementById('nav').classList.toggle('open'); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
