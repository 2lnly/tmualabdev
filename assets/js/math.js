/* ============================================================
   TMUA Lab — tiny LaTeX-subset maths renderer.
   No dependencies, no network. Handles the slice of notation
   an AS-level admissions test actually needs.
   Usage:  TL.math("\\frac{x^2-1}{x+1}")  -> HTML string
           TL.tex("Let $x>0$. Then ...")  -> HTML with $..$ rendered
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});

  var SYM = {
    le: '≤', leq: '≤', ge: '≥', geq: '≥',
    ne: '≠', neq: '≠', approx: '≈', equiv: '≡',
    sim: '∼', propto: '∝', pm: '±', mp: '∓',
    times: '×', div: '÷', cdot: '⋅', ast: '∗',
    infty: '∞', partial: '∂', nabla: '∇',
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
    epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
    theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ',
    pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
    upsilon: 'υ', phi: 'φ', varphi: 'ϕ', chi: 'χ',
    psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ',
    Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ',
    Psi: 'Ψ', Omega: 'Ω',
    'in': '∈', notin: '∉', ni: '∋',
    subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
    cup: '∪', cap: '∩', setminus: '∖', emptyset: '∅',
    forall: '∀', exists: '∃', nexists: '∄',
    neg: '¬', lnot: '¬', land: '∧', wedge: '∧',
    lor: '∨', vee: '∨',
    Rightarrow: '⇒', implies: '⇒', Leftarrow: '⇐',
    impliedby: '⇐', Leftrightarrow: '⇔', iff: '⇔',
    to: '→', rightarrow: '→', leftarrow: '←',
    mapsto: '↦', longrightarrow: '⟶',
    sum: '∑', prod: '∏', 'int': '∫',
    ldots: '…', cdots: '⋯', dots: '…', vdots: '⋮',
    therefore: '∴', because: '∵',
    circ: '∘', degree: '°', angle: '∠',
    perp: '⊥', parallel: '∥', triangle: '△',
    prime: '′', star: '⋆', bullet: '∙',
    lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉',
    langle: '⟨', rangle: '⟩', backslash: '\\'
  };

  var FNS = ('sin cos tan sec csc cosec cot arcsin arccos arctan sinh cosh tanh ' +
             'log ln lg exp lim sup inf max min gcd lcm det mod arg dim ker im ' +
             'Re Im').split(' ');
  var FNSET = {}; FNS.forEach(function (f) { FNSET[f] = 1; });

  var BB = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', P: 'ℙ' };

  function esc(c) {
    return c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;
  }

  var OPS = {
    '+': '+', '-': '−', '=': '=', '<': '&lt;', '>': '&gt;',
    '*': '×', '/': '/', '±': '±', ':': ':', '~': '∼'
  };

  function charHtml(c, upright, unary) {
    if (/[a-zA-Z]/.test(c)) return upright ? c : '<span class="v">' + c + '</span>';
    if (OPS[c] !== undefined) {
      var un = unary && (c === '-' || c === '+') ? ' un' : '';
      return '<span class="op' + un + '">' + OPS[c] + '</span>';
    }
    if (c === ',') return ', ';
    if (c === ' ') return ' ';
    if (c === '(' || c === ')' || c === '[' || c === ']' || c === '|') {
      return '<span class="par">' + c + '</span>';
    }
    if (c === '!') return '<span class="par">!</span>';
    return esc(c);
  }

  function Parser(src) { this.s = src; this.i = 0; this.prev = 'start'; }

  // A leading sign is unary when nothing that could be a left operand precedes it.
  Parser.prototype.isUnary = function () {
    return this.prev === 'start' || this.prev === 'op' || this.prev === 'open';
  };

  Parser.prototype.group = function (upright) {
    // returns HTML for the next atom (a {group}, a \command, or one char)
    var s = this.s;
    if (this.i >= s.length) return '';
    if (s[this.i] === '{') { this.i++; return this.seq('}', upright); }
    if (s[this.i] === '\\') return this.command(upright);
    var c = s[this.i++];
    var html = charHtml(c, upright, this.isUnary());
    if (c !== ' ') {
      this.prev = (c === '(' || c === '[') ? 'open'
                : (OPS[c] !== undefined || c === ',') ? 'op'
                : 'atom';
    }
    return html;
  };

  Parser.prototype.command = function (upright) {
    var s = this.s;
    this.i++; // consume backslash
    var m = /^[a-zA-Z]+/.exec(s.slice(this.i));
    if (!m) {
      var c = s[this.i++];
      if (c === ' ') return ' ';
      if (c === ',') return ' ';
      if (c === ';') return ' ';
      if (c === '\\') return '<br>';
      return esc(c === undefined ? '' : c);
    }
    var name = m[0];
    this.i += name.length;

    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      this.prev = 'start';
      var n = this.group(upright);
      this.prev = 'start';
      var d = this.group(upright);
      this.prev = 'atom';
      return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>';
    }
    if (name === 'sqrt') {
      var idx = '';
      if (s[this.i] === '[') {
        var close = s.indexOf(']', this.i);
        idx = '<sup style="vertical-align:.9em;font-size:.55em">' +
              TL.math(s.slice(this.i + 1, close), true) + '</sup>';
        this.i = close + 1;
      }
      this.prev = 'start';
      var body = this.group(upright);
      this.prev = 'atom';
      return '<span class="rad">' + idx + '<span class="sign">√</span>' +
             '<span class="bod">' + body + '</span></span>';
    }
    if (name === 'text' || name === 'mathrm' || name === 'mbox' || name === 'operatorname') {
      return '<span class="fn" style="font-style:normal">' + this.group(true) + '</span>';
    }
    if (name === 'mathbb') {
      var g = this.s[this.i] === '{' ? this.s[this.i + 1] : this.s[this.i];
      this.i += this.s[this.i] === '{' ? 3 : 1;
      return BB[g] || g;
    }
    if (name === 'left' || name === 'right' || name === 'big' || name === 'Big' ||
        name === 'bigl' || name === 'bigr' || name === 'displaystyle') {
      if (name === 'left' || name === 'right') {
        var d2 = s[this.i];
        if (d2 === undefined) return '';
        if (d2 === '.') { this.i++; return ''; }
        if (d2 === '\\') {                       // \left\lfloor, \right\rangle, …
          var dm = /^\\([a-zA-Z]+)/.exec(s.slice(this.i));
          if (dm) {
            this.i += dm[0].length;
            this.prev = (name === 'left') ? 'open' : 'atom';
            return '<span class="par">' + (SYM[dm[1]] || '') + '</span>';
          }
          this.i++;
          return '';
        }
        this.i++;
        this.prev = (name === 'left') ? 'open' : 'atom';
        return '<span class="par">' + esc(d2) + '</span>';
      }
      return '';
    }
    if (name === 'quad') return ' ';
    if (name === 'qquad') return '  ';
    if (name === 'overline' || name === 'bar') {
      return '<span style="border-top:1px solid currentColor;padding:0 .05em">' + this.group(upright) + '</span>';
    }
    if (name === 'begin') {
      // column vectors and small matrices: \begin{pmatrix} a \\ b \end{pmatrix}
      var em = /^\{([a-z]+)\}/.exec(s.slice(this.i));
      if (em) {
        this.i += em[0].length;
        var env = em[1];
        var endTok = '\\end{' + env + '}';
        var at = s.indexOf(endTok, this.i);
        var body = at < 0 ? s.slice(this.i) : s.slice(this.i, at);
        this.i = at < 0 ? s.length : at + endTok.length;
        var rows = body.split('\\\\').map(function (r) { return TL.math(r.trim(), true); });
        var open = env.charAt(0) === 'b' ? '[' : env.charAt(0) === 'v' ? '|' : '(';
        var shut = env.charAt(0) === 'b' ? ']' : env.charAt(0) === 'v' ? '|' : ')';
        this.prev = 'atom';
        return '<span class="par">' + open + '</span><span class="mat">' +
               rows.map(function (r) { return '<span>' + r + '</span>'; }).join('') +
               '</span><span class="par">' + shut + '</span>';
      }
      return '';
    }
    if (name === 'end') {            // a stray \end we did not consume
      var sm = /^\{[a-z]+\}/.exec(s.slice(this.i));
      if (sm) this.i += sm[0].length;
      return '';
    }
    if (name === 'vec' || name === 'overrightarrow') {
      this.prev = 'atom';
      return '<span class="vecarr">' + this.group(upright) + '</span>';
    }
    if (name === 'dot' || name === 'ddot') {
      this.prev = 'atom';
      return '<span class="dotacc' + (name === 'ddot' ? ' two' : '') + '">' + this.group(upright) + '</span>';
    }
    if (name === 'binom') {
      var a = this.group(upright), b = this.group(upright);
      return '<span class="par">(</span><span class="frac binom">' +
             '<span>' + a + '</span><span>' + b + '</span></span><span class="par">)</span>';
    }
    if (SYM[name]) { this.prev = 'op'; return '<span class="op">' + SYM[name] + '</span>'; }
    this.prev = 'atom';
    return '<span class="fn">' + name + '</span>';
  };

  Parser.prototype.seq = function (stop, upright) {
    var out = '', s = this.s;
    while (this.i < s.length) {
      var c = s[this.i];
      if (stop && c === stop) { this.i++; break; }
      if (c === '^' || c === '_') {
        this.i++;
        var tag = c === '^' ? 'sup' : 'sub';
        var save = this.prev;
        this.prev = 'start';                 // a sign inside an index is unary
        out += '<' + tag + '>' + this.group(upright) + '</' + tag + '>';
        this.prev = save === 'op' ? 'op' : 'atom';
        continue;
      }
      out += this.group(upright);
    }
    return out;
  };

  /** Render a LaTeX-subset string to HTML. */
  TL.math = function (src, bare) {
    if (src == null) return '';
    var p = new Parser(String(src));
    var html = p.seq(null, false);
    return bare ? html : '<span class="m">' + html + '</span>';
  };

  /** Render prose containing $...$ inline maths (and $$...$$ display maths). */
  TL.tex = function (src) {
    if (src == null) return '';
    return String(src)
      .replace(/\$\$([\s\S]+?)\$\$/g, function (_, x) {
        return '<span class="m m-block">' + TL.math(x, true) + '</span>';
      })
      .replace(/\$([^$]+?)\$/g, function (_, x) { return TL.math(x); });
  };

  /** Escape arbitrary text for safe HTML insertion. */
  TL.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var SUPS = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
               '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
               '+': '\u207a', '-': '\u207b', 'n': '\u207f' };
  var SUBS = { '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
               '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089' };

  /**
   * Readable single-line text for previews, search and reports.
   * Keeps the symbols — a preview reading "x2 - 5x" helps nobody.
   */
  TL.plain = function (src) {
    var s = String(src == null ? '' : src).replace(/<[^>]*>/g, ' ');
    // innermost first, repeatedly, so nested fractions survive
    for (var pass = 0; pass < 6; pass++) {
      var before = s;
      s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
      s = s.replace(/\\sqrt\{([^{}]*)\}/g, '\u221a($1)');
      if (s === before) break;
    }
    s = s.replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g, '$1');
    s = s.replace(/\\mathbb\{([A-Z])\}/g, function (_, c) {
      return ({ R: '\u211d', N: '\u2115', Z: '\u2124', Q: '\u211a', C: '\u2102' })[c] || c;
    });
    s = s.replace(/\\([a-zA-Z]+)/g, function (_, n) {
      if (SYM[n]) return SYM[n];
      if (FNSET[n]) return n;
      return '';
    });
    s = s.replace(/\^\{([^{}]*)\}|\^(.)/g, function (_, a, b) {
      var t = a != null ? a : b, out = '';
      for (var i = 0; i < t.length; i++) { if (!SUPS[t[i]]) return '^' + t; out += SUPS[t[i]]; }
      return out;
    });
    s = s.replace(/_\{([^{}]*)\}|_(.)/g, function (_, a, b) {
      var t = a != null ? a : b, out = '';
      for (var i = 0; i < t.length; i++) { if (!SUBS[t[i]]) return '_' + t; out += SUBS[t[i]]; }
      return out;
    });
    return s.replace(/[${}\\]/g, '').replace(/\s+/g, ' ').trim();
  };
})(window);
