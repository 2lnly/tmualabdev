/* ============================================================
   TMUA Lab — community page: the question-report builder.
   Nothing is transmitted; it assembles text you can copy.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = root.TL;

  function build() {
    var id = (TL.$('#rid').value || '').trim().toUpperCase();
    var q = TL.byId(id);
    var txt =
      'TMUA Lab — question report\n' +
      '--------------------------------\n' +
      'Question: ' + (id || '(not given)') + '\n' +
      'Issue:    ' + TL.$('#rkind').value + '\n' +
      (q
        ? 'Topic:    P' + q.p + ' · ' + TL.topic(q.t).name + ' · ' + q.sp + '\n' +
          'Marked:   ' + TL.LETTERS[q.a] + '\n' +
          'Stem:     ' + TL.plain(q.q).slice(0, 240) + '\n'
        : (id ? 'Note:     no question with that id is in the bank\n' : '')) +
      '\n' + (TL.$('#rtext').value || '(no detail given)') + '\n';
    var out = TL.$('#rout');
    out.textContent = txt;
    out.style.display = 'block';
    return txt;
  }

  TL.page = function () {
    TL.$('#rbuild').onclick = build;
    TL.$('#rcopy').onclick = function () {
      var t = build();
      if (root.navigator.clipboard) {
        root.navigator.clipboard.writeText(t).then(
          function () { TL.toast('Report copied'); },
          function () { TL.toast('Select the text and copy it'); }
        );
      } else TL.toast('Select the text and copy it');
    };
    var q = TL.qs();
    if (q.to) TL.into(document.getElementById(q.to), { behavior: 'smooth', block: 'start' });
  };
})(window);
