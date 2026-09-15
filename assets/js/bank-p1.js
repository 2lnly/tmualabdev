/* ============================================================
   TMUA Lab — question bank, Paper 1
   Applications of Mathematical Knowledge.
   Every question is non-calculator. NOTE: these are five-option,
   which the real paper is not — it varies from four to eight, most
   often six or seven on Paper 1 and eight on Paper 2.
   `d` is a seed difficulty 1..5.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});
  var B = (TL.BANK = TL.BANK || []);
  function q(o) { o.p = 1; B.push(o); }

  /* ---------------- Algebra and functions ---------------- */

  q({ id: 'P1-ALG-01', t: 'alg', sp: 'Quadratics · discriminant', d: 2,
    q: 'The equation $x^2 + kx + (k+3) = 0$ has two distinct real roots. Which of the following gives all possible values of $k$?',
    o: ['$-2 < k < 6$', '$k < -2$ or $k > 6$', '$-6 < k < 2$', '$k < -6$ or $k > 2$', 'all real $k$'],
    a: 1,
    e: 'Two distinct real roots need a strictly positive discriminant: $k^2 - 4(k+3) > 0$, i.e. $k^2 - 4k - 12 > 0$. Factorising, $(k-6)(k+2) > 0$. A positive product of these two factors requires both negative or both positive, so $k < -2$ or $k > 6$.' });

  q({ id: 'P1-ALG-02', t: 'alg', sp: 'Completing the square', d: 1,
    q: 'What is the least value taken by $f(x) = 2x^2 - 12x + 23$?',
    o: ['$5$', '$-5$', '$23$', '$11$', '$2$'],
    a: 0,
    e: 'Complete the square: $2(x^2 - 6x) + 23 = 2\\left((x-3)^2 - 9\\right) + 23 = 2(x-3)^2 + 5$. Since $2(x-3)^2 \\ge 0$ with equality at $x = 3$, the least value is $5$.' });

  q({ id: 'P1-ALG-03', t: 'alg', sp: 'Modulus inequalities', d: 3,
    q: 'Solve $|2x - 3| < x + 1$.',
    o: ['$\\frac{2}{3} < x < 4$', '$-1 < x < 4$', '$x < 4$', '$\\frac{2}{3} < x < 2$', '$x > \\frac{2}{3}$'],
    a: 0,
    e: 'The right-hand side must be positive, so $x > -1$. Then the inequality is equivalent to $-(x+1) < 2x - 3 < x + 1$. The left half gives $-x - 1 < 2x - 3$, so $2 < 3x$ and $x > \\frac{2}{3}$. The right half gives $2x - 3 < x + 1$, so $x < 4$. Combining, $\\frac{2}{3} < x < 4$.' });

  q({ id: 'P1-ALG-04', t: 'alg', sp: 'Remainder theorem', d: 1,
    q: 'What is the remainder when $x^3 - 4x^2 + 5x - 7$ is divided by $x - 2$?',
    o: ['$-5$', '$5$', '$-7$', '$3$', '$-1$'],
    a: 0,
    e: 'By the remainder theorem the remainder is the value at $x = 2$: $8 - 16 + 10 - 7 = -5$.' });

  q({ id: 'P1-ALG-05', t: 'alg', sp: 'Algebraic manipulation', d: 4,
    q: 'Given that $x + \\frac{1}{x} = 4$, what is the value of $x^3 + \\frac{1}{x^3}$?',
    o: ['$52$', '$64$', '$76$', '$48$', '$60$'],
    a: 0,
    e: 'Cubing gives $\\left(x + \\frac1x\\right)^3 = x^3 + \\frac{1}{x^3} + 3\\left(x + \\frac1x\\right)$. So $64 = x^3 + \\frac{1}{x^3} + 12$, giving $x^3 + \\frac{1}{x^3} = 52$.' });

  q({ id: 'P1-ALG-06', t: 'alg', sp: 'Roots of quadratics', d: 3,
    q: 'The roots of $2x^2 - 5x + 1 = 0$ are $\\alpha$ and $\\beta$. What is $\\alpha^2 + \\beta^2$?',
    o: ['$\\frac{21}{4}$', '$\\frac{23}{4}$', '$\\frac{25}{4}$', '$\\frac{17}{4}$', '$\\frac{21}{2}$'],
    a: 0,
    e: 'From the coefficients, $\\alpha + \\beta = \\frac{5}{2}$ and $\\alpha\\beta = \\frac{1}{2}$. Then $\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta = \\frac{25}{4} - 1 = \\frac{21}{4}$.' });

  q({ id: 'P1-ALG-07', t: 'alg', sp: 'Rational equations', d: 2,
    q: 'Solve $\\dfrac{3}{x - 1} = \\dfrac{2}{x + 2}$.',
    o: ['$x = -8$', '$x = 8$', '$x = -4$', '$x = 4$', '$x = -2$'],
    a: 0,
    e: 'Cross-multiplying, $3(x+2) = 2(x-1)$, so $3x + 6 = 2x - 2$ and $x = -8$. This makes neither denominator zero, so it is valid.' });

  q({ id: 'P1-ALG-08', t: 'alg', sp: 'Disguised quadratics', d: 2,
    q: 'How many real solutions does $x^4 - 5x^2 + 4 = 0$ have?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 4,
    e: 'Put $u = x^2$: $u^2 - 5u + 4 = 0$ gives $u = 1$ or $u = 4$. Both are positive, so $x = \\pm 1$ and $x = \\pm 2$ — four real solutions.' });

  q({ id: 'P1-ALG-09', t: 'alg', sp: 'Inverse functions', d: 2,
    q: 'The function $f$ is defined by $f(x) = \\dfrac{2x+1}{x-3}$ for $x \\ne 3$. What is $f^{-1}(x)$?',
    o: ['$\\frac{3x+1}{x-2}$', '$\\frac{3x-1}{x+2}$', '$\\frac{x+3}{2x-1}$', '$\\frac{2x+1}{x+3}$', '$\\frac{3x+1}{x+2}$'],
    a: 0,
    e: 'Set $y = \\frac{2x+1}{x-3}$, so $y(x-3) = 2x+1$ and $yx - 2x = 3y + 1$. Hence $x = \\frac{3y+1}{y-2}$, and swapping the letters gives $f^{-1}(x) = \\frac{3x+1}{x-2}$.' });

  q({ id: 'P1-ALG-10', t: 'alg', sp: 'Symmetric functions', d: 2,
    q: 'Real numbers $x$ and $y$ satisfy $x + y = 5$ and $x^2 + y^2 = 17$. What is $xy$?',
    o: ['$4$', '$6$', '$8$', '$2$', '$12$'],
    a: 0,
    e: 'From $(x+y)^2 = x^2 + 2xy + y^2$ we get $25 = 17 + 2xy$, so $xy = 4$.' });

  q({ id: 'P1-ALG-11', t: 'alg', sp: 'Algebraic fractions', d: 1,
    q: 'For $x \\ne 3$ and $x \\ne -2$, simplify $\\dfrac{x^2 - 9}{x^2 - x - 6}$.',
    o: ['$\\frac{x+3}{x+2}$', '$\\frac{x-3}{x-2}$', '$\\frac{x+3}{x-2}$', '$\\frac{x-3}{x+2}$', '$\\frac{3}{2}$'],
    a: 0,
    e: 'The numerator is $(x-3)(x+3)$ and the denominator is $(x-3)(x+2)$. Cancelling the common factor $x-3$ leaves $\\frac{x+3}{x+2}$.' });

  q({ id: 'P1-ALG-12', t: 'alg', sp: 'Surds', d: 1,
    q: 'Write $\\dfrac{6}{3 - \\sqrt{3}}$ in the form $a + b\\sqrt{3}$.',
    o: ['$3 + \\sqrt{3}$', '$3 - \\sqrt{3}$', '$2 + \\sqrt{3}$', '$\\frac{3+\\sqrt{3}}{2}$', '$1 + \\sqrt{3}$'],
    a: 0,
    e: 'Multiply top and bottom by $3 + \\sqrt3$: the denominator becomes $9 - 3 = 6$ and the numerator becomes $6(3+\\sqrt3)$. So the value is $3 + \\sqrt{3}$.' });

  /* ---------------- Sequences and series ---------------- */

  q({ id: 'P1-SEQ-01', t: 'seq', sp: 'Arithmetic sequences', d: 2,
    q: 'The third term of an arithmetic sequence is $11$ and the eighth term is $31$. What is the sum of the first $20$ terms?',
    o: ['$820$', '$800$', '$840$', '$760$', '$900$'],
    a: 0,
    e: 'Five common differences separate the terms, so $5d = 31 - 11 = 20$ and $d = 4$. Then $a = 11 - 2d = 3$, and $S_{20} = \\frac{20}{2}\\left(2(3) + 19(4)\\right) = 10(82) = 820$.' });

  q({ id: 'P1-SEQ-02', t: 'seq', sp: 'Sum to infinity', d: 1,
    q: 'A geometric series has first term $12$ and common ratio $\\frac{1}{3}$. What is its sum to infinity?',
    o: ['$18$', '$16$', '$36$', '$24$', '$15$'],
    a: 0,
    e: 'Since $|r| < 1$ the series converges to $\\frac{a}{1-r} = \\frac{12}{1 - \\frac13} = \\frac{12}{\\frac23} = 18$.' });

  q({ id: 'P1-SEQ-03', t: 'seq', sp: 'Sums and terms', d: 3,
    q: 'The sum of the first $n$ terms of a sequence is $S_n = 3n^2 + 2n$. What is the tenth term?',
    o: ['$59$', '$61$', '$56$', '$62$', '$58$'],
    a: 0,
    e: 'The tenth term is $S_{10} - S_{9} = (300 + 20) - (243 + 18) = 320 - 261 = 59$.' });

  q({ id: 'P1-SEQ-04', t: 'seq', sp: 'Geometric sequences', d: 2,
    q: 'In a geometric sequence the second term is $6$ and the fifth term is $162$. What is the common ratio?',
    o: ['$3$', '$2$', '$27$', '$\\frac{1}{3}$', '$9$'],
    a: 0,
    e: 'Three ratios separate the second and fifth terms, so $r^3 = \\frac{162}{6} = 27$ and $r = 3$.' });

  q({ id: 'P1-SEQ-05', t: 'seq', sp: 'Sigma notation', d: 2,
    q: 'For a positive integer $n$, what is $\\displaystyle\\sum_{r=1}^{n} (2r - 1)$?',
    o: ['$n^2$', '$n(n+1)$', '$n(n-1)$', '$2n - 1$', '$n(2n-1)$'],
    a: 0,
    e: 'The sum is $2\\sum r - \\sum 1 = 2 \\cdot \\frac{n(n+1)}{2} - n = n^2 + n - n = n^2$. It is the familiar fact that the first $n$ odd numbers sum to $n^2$.' });

  q({ id: 'P1-SEQ-06', t: 'seq', sp: 'Recurrence relations', d: 1,
    q: 'A sequence is defined by $u_1 = 3$ and $u_{n+1} = 3u_n - 2$. What is $u_4$?',
    o: ['$55$', '$49$', '$61$', '$43$', '$79$'],
    a: 0,
    e: 'Iterating: $u_2 = 9 - 2 = 7$, $u_3 = 21 - 2 = 19$, $u_4 = 57 - 2 = 55$.' });

  q({ id: 'P1-SEQ-07', t: 'seq', sp: 'Sum to infinity', d: 4,
    q: 'An infinite geometric series has first term $9$ and sum $27$. What is its third term?',
    o: ['$4$', '$6$', '$3$', '$2$', '$12$'],
    a: 0,
    e: 'From $\\frac{9}{1-r} = 27$ we get $1 - r = \\frac13$, so $r = \\frac23$. The third term is $ar^2 = 9 \\cdot \\frac49 = 4$.' });

  q({ id: 'P1-SEQ-08', t: 'seq', sp: 'Arithmetic series', d: 2,
    q: 'An arithmetic series has common difference $3$ and the sum of its first ten terms is $155$. What is its first term?',
    o: ['$2$', '$3$', '$5$', '$1$', '$4$'],
    a: 0,
    e: '$S_{10} = \\frac{10}{2}\\left(2a + 9(3)\\right) = 5(2a + 27) = 155$, so $2a + 27 = 31$ and $a = 2$.' });

  q({ id: 'P1-SEQ-09', t: 'seq', sp: 'Arithmetic series', d: 3,
    q: 'How many terms of the series $5 + 9 + 13 + \\ldots$ are needed for the sum to exceed $400$?',
    o: ['$13$', '$14$', '$15$', '$12$', '$16$'],
    a: 1,
    e: 'Here $S_n = \\frac{n}{2}\\left(10 + 4(n-1)\\right) = n(2n+3)$. With $n = 13$ this is $13 \\times 29 = 377$, and with $n = 14$ it is $14 \\times 31 = 434$. So $14$ terms are needed.' });

  q({ id: 'P1-SEQ-10', t: 'seq', sp: 'Binomial expansion', d: 2,
    q: 'What is the coefficient of $x^3$ in the expansion of $(1 + 2x)^6$?',
    o: ['$160$', '$80$', '$20$', '$240$', '$120$'],
    a: 0,
    e: 'The term is $\\binom{6}{3}(2x)^3 = 20 \\times 8 x^3 = 160x^3$.' });

  q({ id: 'P1-SEQ-11', t: 'seq', sp: 'Binomial expansion', d: 5,
    q: 'What is the constant term in the expansion of $\\left(x^2 - \\dfrac{1}{x}\\right)^6$?',
    o: ['$15$', '$-15$', '$20$', '$-20$', '$6$'],
    a: 0,
    e: 'A general term is $\\binom{6}{k}(x^2)^{6-k}\\left(-\\frac1x\\right)^k = \\binom{6}{k}(-1)^k x^{12-3k}$. The power is zero when $k = 4$, giving $\\binom{6}{4}(-1)^4 = 15$.' });

  q({ id: 'P1-SEQ-12', t: 'seq', sp: 'Convergence', d: 3,
    q: 'For which values of $x$ does the series $1 + (x-1) + (x-1)^2 + (x-1)^3 + \\ldots$ converge?',
    o: ['$0 < x < 2$', '$-1 < x < 1$', '$1 < x < 2$', '$x > 0$', '$-2 < x < 2$'],
    a: 0,
    e: 'It is geometric with ratio $x - 1$, so it converges exactly when $|x - 1| < 1$, that is $0 < x < 2$.' });

  /* ---------------- Coordinate geometry ---------------- */

  q({ id: 'P1-GEO-01', t: 'geo', sp: 'Straight lines', d: 1,
    q: 'What is the equation of the line through $(2, 5)$ and $(-1, -1)$?',
    o: ['$y = 2x + 1$', '$y = 2x - 1$', '$y = -2x + 9$', '$y = x + 3$', '$y = 3x - 1$'],
    a: 0,
    e: 'The gradient is $\\frac{5 - (-1)}{2 - (-1)} = \\frac{6}{3} = 2$. Then $y - 5 = 2(x - 2)$ gives $y = 2x + 1$.' });

  q({ id: 'P1-GEO-02', t: 'geo', sp: 'Circles', d: 2,
    q: 'What is the radius of the circle $x^2 + y^2 - 6x + 4y - 12 = 0$?',
    o: ['$5$', '$25$', '$4$', '$12$', '$2\\sqrt{3}$'],
    a: 0,
    e: 'Completing both squares: $(x-3)^2 - 9 + (y+2)^2 - 4 - 12 = 0$, so $(x-3)^2 + (y+2)^2 = 25$ and the radius is $5$.' });

  q({ id: 'P1-GEO-03', t: 'geo', sp: 'Perpendicular bisectors', d: 3,
    q: 'What is the equation of the perpendicular bisector of the segment joining $(1, 2)$ and $(5, 8)$?',
    o: ['$2x + 3y = 21$', '$3x + 2y = 19$', '$2x - 3y = -9$', '$3x - 2y = -1$', '$2x + 3y = 9$'],
    a: 0,
    e: 'The midpoint is $(3, 5)$ and the segment has gradient $\\frac{6}{4} = \\frac32$, so the bisector has gradient $-\\frac23$. Then $y - 5 = -\\frac23(x-3)$ gives $3y - 15 = -2x + 6$, i.e. $2x + 3y = 21$.' });

  q({ id: 'P1-GEO-04', t: 'geo', sp: 'Distance from a line', d: 3,
    q: 'What is the shortest distance from the origin to the line $3x + 4y = 20$?',
    o: ['$4$', '$5$', '$20$', '$2$', '$\\frac{4}{5}$'],
    a: 0,
    e: 'The foot of the perpendicular lies on $y = \\frac43 x$; substituting gives $3x + \\frac{16}{3}x = 20$, so $x = \\frac{12}{5}$ and $y = \\frac{16}{5}$. The distance is $\\sqrt{\\frac{144+256}{25}} = \\frac{20}{5} = 4$. (Equivalently, $\\frac{|20|}{\\sqrt{3^2+4^2}} = 4$.)' });

  q({ id: 'P1-GEO-05', t: 'geo', sp: 'Circles', d: 2,
    q: 'A circle has centre $(2, -1)$ and passes through $(5, 3)$. What is its equation?',
    o: ['$(x-2)^2 + (y+1)^2 = 25$', '$(x-2)^2 + (y+1)^2 = 5$', '$(x+2)^2 + (y-1)^2 = 25$', '$(x-5)^2 + (y-3)^2 = 25$', '$(x-2)^2 + (y-1)^2 = 25$'],
    a: 0,
    e: 'The radius is $\\sqrt{(5-2)^2 + (3+1)^2} = \\sqrt{9+16} = 5$, so the equation is $(x-2)^2 + (y+1)^2 = 25$.' });

  q({ id: 'P1-GEO-06', t: 'geo', sp: 'Tangency', d: 5,
    q: 'The line $y = 2x + c$ is a tangent to the circle $x^2 + y^2 = 5$. What is the value of $c^2$?',
    o: ['$25$', '$5$', '$20$', '$10$', '$1$'],
    a: 0,
    e: 'Substituting, $x^2 + (2x+c)^2 = 5$ gives $5x^2 + 4cx + c^2 - 5 = 0$. Tangency means one repeated root, so $16c^2 - 20(c^2 - 5) = 0$, giving $-4c^2 + 100 = 0$ and $c^2 = 25$.' });

  q({ id: 'P1-GEO-07', t: 'geo', sp: 'Lengths', d: 1,
    q: 'A triangle has vertices $A(0,0)$, $B(6,0)$ and $C(0,8)$. What is the length of the median from $A$?',
    o: ['$5$', '$10$', '$4$', '$\\sqrt{13}$', '$6$'],
    a: 0,
    e: 'The midpoint of $BC$ is $(3, 4)$, so the median has length $\\sqrt{9 + 16} = 5$.' });

  q({ id: 'P1-GEO-08', t: 'geo', sp: 'Areas', d: 3,
    q: 'What is the area of the triangle with vertices $(1,1)$, $(4,5)$ and $(7,2)$?',
    o: ['$10.5$', '$12$', '$21$', '$9$', '$13.5$'],
    a: 0,
    e: 'Using the shoelace formula, the area is $\\frac12\\left|1(5-2) + 4(2-1) + 7(1-5)\\right| = \\frac12|3 + 4 - 28| = \\frac{21}{2} = 10.5$.' });

  q({ id: 'P1-GEO-09', t: 'geo', sp: 'Two circles', d: 5,
    q: 'How many lines are tangent to both of the circles $x^2 + y^2 = 9$ and $(x-5)^2 + y^2 = 4$?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 3,
    e: 'The centres are $5$ apart and the radii are $3$ and $2$, whose sum is also $5$. The circles therefore touch externally, which gives two external tangents plus the common tangent at the point of contact: $3$ in total.' });

  q({ id: 'P1-GEO-10', t: 'geo', sp: 'Straight lines', d: 5,
    q: 'A line of gradient $m$ passes through $(1, 4)$, cutting the $x$-axis at $P$ and the $y$-axis at $Q$. For which $m$ is $(1,4)$ the midpoint of $PQ$?',
    o: ['$m = -4$', '$m = 4$', '$m = -2$', '$m = -\\frac14$', '$m = 2$'],
    a: 0,
    e: 'The line is $y - 4 = m(x-1)$, so $P = \\left(1 - \\frac4m,\\ 0\\right)$ and $Q = (0,\\ 4-m)$. The midpoint has $x$-coordinate $\\frac12\\left(1 - \\frac4m\\right) = 1$, so $-\\frac4m = 1$ and $m = -4$. Then the $y$-coordinate is $\\frac{4-(-4)}{2} = 4$, as required.' });

  q({ id: 'P1-GEO-11', t: 'geo', sp: 'Circles', d: 4,
    q: 'What is the length of the tangent from the origin to the circle $x^2 + y^2 - 2x - 4y + 1 = 0$?',
    o: ['$1$', '$2$', '$\\sqrt{5}$', '$3$', '$\\sqrt{3}$'],
    a: 0,
    e: 'The circle is $(x-1)^2 + (y-2)^2 = 4$, with centre $(1,2)$ and radius $2$. The centre is $\\sqrt5$ from the origin, so the tangent length is $\\sqrt{5 - 4} = 1$.' });

  q({ id: 'P1-GEO-12', t: 'geo', sp: 'Gradients', d: 1,
    q: 'What is the gradient of any line perpendicular to $4x - 6y = 7$?',
    o: ['$-\\frac{3}{2}$', '$\\frac{3}{2}$', '$\\frac{2}{3}$', '$-\\frac{2}{3}$', '$-\\frac{4}{6}$'],
    a: 0,
    e: 'Rearranging, $y = \\frac23 x - \\frac76$, so the gradient is $\\frac23$. A perpendicular line has gradient $-\\frac{3}{2}$.' });

  /* ---------------- Trigonometry ---------------- */

  q({ id: 'P1-TRI-01', t: 'trig', sp: 'Trigonometric equations', d: 3,
    q: 'How many solutions does $2\\sin^2 x = 3\\cos x$ have for $0^\\circ \\le x < 360^\\circ$?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 2,
    e: 'Using $\\sin^2 x = 1 - \\cos^2 x$: $2 - 2\\cos^2 x = 3\\cos x$, so $2\\cos^2 x + 3\\cos x - 2 = 0$ and $(2\\cos x - 1)(\\cos x + 2) = 0$. Only $\\cos x = \\frac12$ is possible, giving $x = 60^\\circ$ and $x = 300^\\circ$: two solutions.' });

  q({ id: 'P1-TRI-02', t: 'trig', sp: 'Exact values', d: 1,
    q: 'What is the exact value of $\\sin 150^\\circ + \\cos 300^\\circ$?',
    o: ['$1$', '$0$', '$\\frac{1}{2}$', '$\\frac{\\sqrt3}{2}$', '$-1$'],
    a: 0,
    e: '$\\sin 150^\\circ = \\sin 30^\\circ = \\frac12$ and $\\cos 300^\\circ = \\cos 60^\\circ = \\frac12$, so the sum is $1$.' });

  q({ id: 'P1-TRI-03', t: 'trig', sp: 'Cosine rule', d: 2,
    q: 'A triangle has sides of length $7$ and $8$ with an included angle of $60^\\circ$. What is the length of the third side?',
    o: ['$\\sqrt{57}$', '$\\sqrt{113}$', '$13$', '$\\sqrt{85}$', '$\\sqrt{169}$'],
    a: 0,
    e: 'By the cosine rule, $c^2 = 49 + 64 - 2(7)(8)\\cos 60^\\circ = 113 - 112 \\times \\frac12 = 113 - 56 = 57$, so $c = \\sqrt{57}$.' });

  q({ id: 'P1-TRI-04', t: 'trig', sp: 'Bounds', d: 3,
    q: 'What is the greatest value taken by $3\\sin x + 4\\cos x$?',
    o: ['$5$', '$7$', '$12$', '$25$', '$\\sqrt{7}$'],
    a: 0,
    e: 'Write $3\\sin x + 4\\cos x = R\\sin(x + \\alpha)$ with $R = \\sqrt{3^2 + 4^2} = 5$. Since $\\sin$ never exceeds $1$, the greatest value is $5$.' });

  q({ id: 'P1-TRI-05', t: 'trig', sp: 'Right-angled triangles', d: 1,
    q: 'An acute angle $\\theta$ satisfies $\\tan\\theta = \\frac{3}{4}$. What is $\\sin\\theta + \\cos\\theta$?',
    o: ['$\\frac{7}{5}$', '$1$', '$\\frac{5}{7}$', '$\\frac{12}{25}$', '$\\frac{7}{12}$'],
    a: 0,
    e: 'The $3$–$4$–$5$ triangle gives $\\sin\\theta = \\frac35$ and $\\cos\\theta = \\frac45$, so the sum is $\\frac75$.' });

  q({ id: 'P1-TRI-06', t: 'trig', sp: 'Multiple angles', d: 3,
    q: 'How many solutions does $\\sin 3x = \\frac{1}{2}$ have for $0 \\le x < 2\\pi$?',
    o: ['$2$', '$3$', '$4$', '$6$', '$8$'],
    a: 3,
    e: 'As $x$ runs over $[0, 2\\pi)$, $3x$ runs over $[0, 6\\pi)$ — three full periods. Each period contributes two solutions of $\\sin\\theta = \\frac12$, so there are $6$.' });

  q({ id: 'P1-TRI-07', t: 'trig', sp: 'Area of a triangle', d: 1,
    q: 'What is the area of a triangle with sides $5$ and $6$ enclosing an angle of $150^\\circ$?',
    o: ['$7.5$', '$15$', '$30$', '$12.5$', '$6$'],
    a: 0,
    e: 'The area is $\\frac12 ab\\sin C = \\frac12(5)(6)\\sin 150^\\circ = 15 \\times \\frac12 = 7.5$.' });

  q({ id: 'P1-TRI-08', t: 'trig', sp: 'Identities', d: 2,
    q: 'For angles where it is defined, simplify $\\dfrac{1 - \\cos^2\\theta}{\\sin\\theta\\cos\\theta}$.',
    o: ['$\\tan\\theta$', '$\\frac{1}{\\tan\\theta}$', '$\\sin\\theta$', '$\\cos\\theta$', '$1$'],
    a: 0,
    e: 'The numerator is $\\sin^2\\theta$, so the expression is $\\frac{\\sin^2\\theta}{\\sin\\theta\\cos\\theta} = \\frac{\\sin\\theta}{\\cos\\theta} = \\tan\\theta$.' });

  q({ id: 'P1-TRI-09', t: 'trig', sp: 'Trigonometric equations', d: 3,
    q: 'What is the sum of all solutions of $\\cos 2x = -\\frac{1}{2}$ with $0^\\circ \\le x < 180^\\circ$?',
    o: ['$180^\\circ$', '$120^\\circ$', '$60^\\circ$', '$240^\\circ$', '$300^\\circ$'],
    a: 0,
    e: 'As $x$ runs over $[0^\\circ, 180^\\circ)$, $2x$ runs over $[0^\\circ, 360^\\circ)$, where $\\cos\\theta = -\\frac12$ at $120^\\circ$ and $240^\\circ$. So $x = 60^\\circ$ or $120^\\circ$, with sum $180^\\circ$.' });

  q({ id: 'P1-TRI-10', t: 'trig', sp: 'Sine rule · ambiguous case', d: 5,
    q: 'In triangle $ABC$, $a = 8$, $b = 8\\sqrt{3}$ and $A = 30^\\circ$. How many such triangles exist?',
    o: ['$0$', '$1$', '$2$', '$3$', 'infinitely many'],
    a: 2,
    e: 'By the sine rule, $\\sin B = \\frac{b\\sin A}{a} = \\frac{8\\sqrt3 \\times \\frac12}{8} = \\frac{\\sqrt3}{2}$, so $B = 60^\\circ$ or $B = 120^\\circ$. Both leave a positive third angle ($90^\\circ$ and $30^\\circ$), so two triangles exist.' });

  q({ id: 'P1-TRI-11', t: 'trig', sp: 'Trigonometric equations', d: 2,
    q: 'What is the smallest positive value of $x$, in degrees, for which $\\tan 2x = 1$?',
    o: ['$22.5^\\circ$', '$45^\\circ$', '$15^\\circ$', '$30^\\circ$', '$67.5^\\circ$'],
    a: 0,
    e: 'The smallest positive angle with tangent $1$ is $45^\\circ$, so $2x = 45^\\circ$ and $x = 22.5^\\circ$.' });

  q({ id: 'P1-TRI-12', t: 'trig', sp: 'Graphs of trig functions', d: 1,
    q: 'What is the period of $y = 2\\sin(3x)$, measured in degrees?',
    o: ['$120^\\circ$', '$360^\\circ$', '$180^\\circ$', '$60^\\circ$', '$720^\\circ$'],
    a: 0,
    e: 'The factor $3$ compresses the graph horizontally by a factor of $3$, so the period is $\\frac{360^\\circ}{3} = 120^\\circ$. The $2$ affects only the amplitude.' });

  /* ---------------- Exponentials and logarithms ---------------- */

  q({ id: 'P1-EXP-01', t: 'exp', sp: 'Log equations', d: 3,
    q: 'Solve $\\log_2 x + \\log_2 (x - 2) = 3$.',
    o: ['$x = 4$', '$x = -2$', '$x = 4$ and $x = -2$', '$x = 8$', '$x = 2$'],
    a: 0,
    e: 'Combining, $\\log_2\\left(x(x-2)\\right) = 3$, so $x^2 - 2x - 8 = 0$ and $x = 4$ or $x = -2$. Logarithms need positive arguments, so $x = -2$ is rejected and only $x = 4$ remains.' });

  q({ id: 'P1-EXP-02', t: 'exp', sp: 'Laws of logarithms', d: 2,
    q: 'Given $\\log_a 2 = p$ and $\\log_a 3 = q$, what is $\\log_a 24$?',
    o: ['$3p + q$', '$p + 3q$', '$3pq$', '$p^3 q$', '$4p + q$'],
    a: 0,
    e: 'Since $24 = 2^3 \\times 3$, $\\log_a 24 = 3\\log_a 2 + \\log_a 3 = 3p + q$.' });

  q({ id: 'P1-EXP-03', t: 'exp', sp: 'Index equations', d: 2,
    q: 'Solve $4^x = 8^{x-1}$.',
    o: ['$x = 3$', '$x = 1$', '$x = 2$', '$x = \\frac{3}{2}$', '$x = -3$'],
    a: 0,
    e: 'Write both sides in base $2$: $2^{2x} = 2^{3(x-1)}$. Equating exponents, $2x = 3x - 3$, so $x = 3$.' });

  q({ id: 'P1-EXP-04', t: 'exp', sp: 'Disguised quadratics', d: 3,
    q: 'How many real solutions does $e^{2x} - 5e^{x} + 6 = 0$ have?',
    o: ['$0$', '$1$', '$2$', '$3$', 'infinitely many'],
    a: 2,
    e: 'Putting $u = e^x$ gives $u^2 - 5u + 6 = 0$, so $u = 2$ or $u = 3$. Both are positive, so each gives one value of $x$ — two solutions.' });

  q({ id: 'P1-EXP-05', t: 'exp', sp: 'Laws of logarithms', d: 1,
    q: 'What is the value of $\\log_2 40 - \\log_2 5$?',
    o: ['$3$', '$8$', '$35$', '$\\log_2 35$', '$5$'],
    a: 0,
    e: 'The difference of logs is the log of the quotient: $\\log_2 \\frac{40}{5} = \\log_2 8 = 3$.' });

  q({ id: 'P1-EXP-06', t: 'exp', sp: 'Logarithms', d: 1,
    q: 'If $\\log_x 64 = 3$, what is $x$?',
    o: ['$4$', '$8$', '$16$', '$2$', '$\\frac{64}{3}$'],
    a: 0,
    e: 'The statement means $x^3 = 64$, so $x = 4$.' });

  q({ id: 'P1-EXP-07', t: 'exp', sp: 'Exponential models', d: 3,
    q: 'The curve $y = ab^x$ passes through $(1, 6)$ and $(3, 54)$, where $a$ and $b$ are positive. What is $a$?',
    o: ['$2$', '$3$', '$6$', '$18$', '$\\frac{1}{2}$'],
    a: 0,
    e: 'Dividing $ab^3 = 54$ by $ab = 6$ gives $b^2 = 9$, so $b = 3$ (taking the positive root). Then $a = \\frac{6}{3} = 2$.' });

  q({ id: 'P1-EXP-08', t: 'exp', sp: 'Fractional indices', d: 2,
    q: 'Solve $\\log_9 x = \\frac{3}{2}$.',
    o: ['$x = 27$', '$x = 13.5$', '$x = 3$', '$x = 81$', '$x = 6$'],
    a: 0,
    e: '$x = 9^{3/2} = \\left(\\sqrt9\\right)^3 = 3^3 = 27$.' });

  q({ id: 'P1-EXP-09', t: 'exp', sp: 'Comparing logarithms', d: 5,
    q: 'Which of these is the largest?',
    o: ['$\\log_2 5$', '$\\log_3 10$', '$\\log_5 30$', '$\\log_4 20$', '$\\log_{10} 200$'],
    a: 0,
    e: 'Each is a little over $2$, so compare $b^2$ with the argument. $\\log_2 5$ exceeds $2$ by the most because $5$ is $1.25$ times $4$, while $10$ is only $\\frac{10}{9}$ times $9$, $30$ is $\\frac{30}{25}$ times $25$, $20$ is $\\frac{20}{16}$ times $16$ and $200$ is $2$ times $100$ — but the last is measured in the much coarser base $10$. Numerically: $2.32$, $2.10$, $2.11$, $2.16$, $2.30$.' });

  q({ id: 'P1-EXP-10', t: 'exp', sp: 'Index laws', d: 2,
    q: 'If $2^x = 3$, what is $8^x$?',
    o: ['$27$', '$9$', '$24$', '$6$', '$512$'],
    a: 0,
    e: '$8^x = (2^3)^x = (2^x)^3 = 3^3 = 27$.' });

  q({ id: 'P1-EXP-11', t: 'exp', sp: 'Exponential inequalities', d: 3,
    q: 'Solve $3^{x^2 - 4} < 1$.',
    o: ['$-2 < x < 2$', '$x < -2$ or $x > 2$', '$x < 2$', '$0 < x < 2$', 'no solutions'],
    a: 0,
    e: 'Since $3^t < 1$ exactly when $t < 0$, we need $x^2 - 4 < 0$, i.e. $-2 < x < 2$.' });

  q({ id: 'P1-EXP-12', t: 'exp', sp: 'Domains of logarithms', d: 4,
    q: 'For which real $x$ is the statement $\\ln(x^2) = 2\\ln x$ true?',
    o: ['$x > 0$', 'all $x \\ne 0$', 'all real $x$', '$x \\ge 1$', '$x > 1$'],
    a: 0,
    e: 'The left-hand side is defined for all $x \\ne 0$, but the right-hand side needs $x > 0$. For $x > 0$ the law of logarithms gives equality, so the statement is true exactly when $x > 0$. (For $x<0$ the correct identity is $\\ln(x^2) = 2\\ln|x|$.)' });

  /* ---------------- Calculus ---------------- */

  q({ id: 'P1-CAL-01', t: 'cal', sp: 'Stationary points', d: 2,
    q: 'At which value of $x$ does $y = x^3 - 6x^2 + 9x$ have a local maximum?',
    o: ['$x = 1$', '$x = 3$', '$x = 2$', '$x = 0$', '$x = 4$'],
    a: 0,
    e: '$\\frac{dy}{dx} = 3x^2 - 12x + 9 = 3(x-1)(x-3)$, so the stationary points are $x = 1$ and $x = 3$. Since $\\frac{d^2y}{dx^2} = 6x - 12$ is negative at $x = 1$, that point is the local maximum.' });

  q({ id: 'P1-CAL-02', t: 'cal', sp: 'Definite integrals', d: 1,
    q: 'Evaluate $\\displaystyle\\int_0^2 (3x^2 - 2x)\\,dx$.',
    o: ['$4$', '$8$', '$12$', '$2$', '$6$'],
    a: 0,
    e: 'An antiderivative is $x^3 - x^2$, so the integral is $(8 - 4) - 0 = 4$.' });

  q({ id: 'P1-CAL-03', t: 'cal', sp: 'Differentiation', d: 2,
    q: 'What is the gradient of $y = \\dfrac{1}{x} + 4\\sqrt{x}$ at $x = 1$?',
    o: ['$1$', '$3$', '$-1$', '$5$', '$2$'],
    a: 0,
    e: 'Write $y = x^{-1} + 4x^{1/2}$, so $\\frac{dy}{dx} = -x^{-2} + 2x^{-1/2}$. At $x = 1$ this is $-1 + 2 = 1$.' });

  q({ id: 'P1-CAL-04', t: 'cal', sp: 'Areas between curves', d: 4,
    q: 'What is the area of the finite region enclosed between $y = x^2$ and $y = 2x$?',
    o: ['$\\frac{4}{3}$', '$\\frac{8}{3}$', '$2$', '$\\frac{2}{3}$', '$\\frac{16}{3}$'],
    a: 0,
    e: 'They meet where $x^2 = 2x$, i.e. $x = 0$ and $x = 2$, and the line is above the parabola between them. The area is $\\int_0^2 (2x - x^2)\\,dx = \\left[x^2 - \\frac{x^3}{3}\\right]_0^2 = 4 - \\frac83 = \\frac43$.' });

  q({ id: 'P1-CAL-05', t: 'cal', sp: 'Tangents and normals', d: 2,
    q: 'What is the equation of the normal to $y = x^2$ at the point $(2, 4)$?',
    o: ['$x + 4y = 18$', '$4x + y = 12$', '$x - 4y = -14$', '$4x - y = 4$', '$x + 4y = 6$'],
    a: 0,
    e: 'Here $\\frac{dy}{dx} = 2x = 4$ at $x = 2$, so the normal has gradient $-\\frac14$. Then $y - 4 = -\\frac14(x - 2)$ gives $4y - 16 = -x + 2$, i.e. $x + 4y = 18$.' });

  q({ id: 'P1-CAL-06', t: 'cal', sp: 'Integration with a condition', d: 2,
    q: 'A function satisfies $f\'(x) = 6x - 4$ and $f(2) = 5$. What is $f(x)$?',
    o: ['$3x^2 - 4x + 1$', '$3x^2 - 4x - 1$', '$3x^2 - 4x + 5$', '$6x^2 - 4x + 1$', '$3x^2 - 4x + 9$'],
    a: 0,
    e: 'Integrating gives $f(x) = 3x^2 - 4x + c$. Then $f(2) = 12 - 8 + c = 5$, so $c = 1$.' });

  q({ id: 'P1-CAL-07', t: 'cal', sp: 'Definite integrals', d: 2,
    q: 'Evaluate $\\displaystyle\\int_1^4 \\frac{1}{\\sqrt{x}}\\,dx$.',
    o: ['$2$', '$4$', '$6$', '$1$', '$3$'],
    a: 0,
    e: 'An antiderivative of $x^{-1/2}$ is $2x^{1/2}$, so the integral is $2\\sqrt4 - 2\\sqrt1 = 4 - 2 = 2$.' });

  q({ id: 'P1-CAL-08', t: 'cal', sp: 'Connected rates of change', d: 3,
    q: 'The edge of a cube is increasing at $2\\ \\text{cm s}^{-1}$. At what rate is the volume increasing when the edge is $3\\ \\text{cm}$?',
    o: ['$54\\ \\text{cm}^3\\text{s}^{-1}$', '$18\\ \\text{cm}^3\\text{s}^{-1}$', '$27\\ \\text{cm}^3\\text{s}^{-1}$', '$108\\ \\text{cm}^3\\text{s}^{-1}$', '$36\\ \\text{cm}^3\\text{s}^{-1}$'],
    a: 0,
    e: 'With $V = s^3$ we get $\\frac{dV}{dt} = 3s^2\\frac{ds}{dt} = 3(9)(2) = 54$.' });

  q({ id: 'P1-CAL-09', t: 'cal', sp: 'Stationary points', d: 2,
    q: 'How many stationary points does $y = x^4 - 4x^3$ have?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 2,
    e: '$\\frac{dy}{dx} = 4x^3 - 12x^2 = 4x^2(x - 3)$, which vanishes at $x = 0$ and $x = 3$ — two stationary points. (The one at $x = 0$ is a point of inflection, but it is still stationary.)' });

  q({ id: 'P1-CAL-10', t: 'cal', sp: 'Symmetry in integration', d: 2,
    q: 'Evaluate $\\displaystyle\\int_{-1}^{1} (x^3 + 3x^2)\\,dx$.',
    o: ['$2$', '$0$', '$4$', '$1$', '$6$'],
    a: 0,
    e: '$x^3$ is odd, so its integral over the symmetric interval is $0$. That leaves $\\int_{-1}^{1} 3x^2 dx = \\left[x^3\\right]_{-1}^{1} = 1 - (-1) = 2$.' });

  q({ id: 'P1-CAL-11', t: 'cal', sp: 'Stationary points', d: 1,
    q: 'The curve $y = x^3 + ax + 5$ has a stationary point at $x = 2$. What is $a$?',
    o: ['$-12$', '$12$', '$-6$', '$6$', '$-4$'],
    a: 0,
    e: '$\\frac{dy}{dx} = 3x^2 + a$, and this is zero at $x = 2$, so $12 + a = 0$ and $a = -12$.' });

  q({ id: 'P1-CAL-12', t: 'cal', sp: 'Optimisation', d: 2,
    q: 'A rectangle has perimeter $40$. What is its greatest possible area?',
    o: ['$100$', '$80$', '$400$', '$200$', '$50$'],
    a: 0,
    e: 'With sides $x$ and $20 - x$, the area is $A = 20x - x^2 = 100 - (x - 10)^2$, which is greatest when $x = 10$, giving $A = 100$.' });

  /* ---------------- Graphs and transformations ---------------- */

  q({ id: 'P1-GRA-01', t: 'gra', sp: 'Transformations', d: 1,
    q: 'The graph of $y = f(x)$ is transformed into the graph of $y = f(x+3) - 2$. Which describes the transformation?',
    o: ['$3$ to the left and $2$ down', '$3$ to the right and $2$ down', '$3$ to the left and $2$ up', '$3$ to the right and $2$ up', '$2$ to the left and $3$ down'],
    a: 0,
    e: 'Replacing $x$ by $x+3$ shifts the graph $3$ units in the negative $x$-direction; subtracting $2$ shifts it $2$ units down.' });

  q({ id: 'P1-GRA-02', t: 'gra', sp: 'Asymptotes', d: 1,
    q: 'What is the horizontal asymptote of $y = \\dfrac{2x - 1}{x + 2}$?',
    o: ['$y = 2$', '$y = -2$', '$y = 0$', '$x = -2$', '$y = \\frac{1}{2}$'],
    a: 0,
    e: 'For large $|x|$ the leading terms dominate and $y \\to \\frac{2x}{x} = 2$. So the horizontal asymptote is $y = 2$. (There is also a vertical asymptote at $x = -2$, but that is not horizontal.)' });

  q({ id: 'P1-GRA-03', t: 'gra', sp: 'Cubics', d: 5,
    q: 'In how many points does the line $y = 1$ meet the curve $y = x^3 - 3x$?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 3,
    e: 'The curve has a local maximum at $x = -1$ with $y = 2$ and a local minimum at $x = 1$ with $y = -2$. The horizontal line $y = 1$ lies strictly between $-2$ and $2$, so it cuts the curve three times.' });

  q({ id: 'P1-GRA-04', t: 'gra', sp: 'Reflections', d: 1,
    q: 'The graph of $y = 2^x$ is reflected in the $y$-axis. What is the equation of the image?',
    o: ['$y = 2^{-x}$', '$y = -2^x$', '$y = 2^x - 1$', '$y = \\log_2 x$', '$y = 2^{x+1}$'],
    a: 0,
    e: 'Reflection in the $y$-axis replaces $x$ by $-x$, giving $y = 2^{-x}$ (equivalently $y = \\left(\\frac12\\right)^x$).' });

  q({ id: 'P1-GRA-05', t: 'gra', sp: 'Polynomial sketching', d: 1,
    q: 'What is the $y$-intercept of $y = (x-1)^2(x+2)$?',
    o: ['$2$', '$-2$', '$1$', '$-1$', '$0$'],
    a: 0,
    e: 'Setting $x = 0$ gives $(-1)^2(2) = 2$.' });

  q({ id: 'P1-GRA-06', t: 'gra', sp: 'Range', d: 2,
    q: 'What is the range of $f(x) = x^2 - 4x + 7$, defined for all real $x$?',
    o: ['$f(x) \\ge 3$', '$f(x) \\ge 7$', '$f(x) \\ge -3$', '$f(x) \\le 3$', 'all real values'],
    a: 0,
    e: 'Completing the square, $f(x) = (x-2)^2 + 3 \\ge 3$, with equality at $x = 2$. So the range is $f(x) \\ge 3$.' });

  q({ id: 'P1-GRA-07', t: 'gra', sp: 'Modulus graphs', d: 2,
    q: 'In how many points does $y = |x - 2| - 1$ cross the $x$-axis?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 2,
    e: 'Setting $y = 0$ gives $|x-2| = 1$, so $x = 1$ or $x = 3$ — two crossings.' });

  q({ id: 'P1-GRA-08', t: 'gra', sp: 'Asymptotes', d: 2,
    q: 'How many vertical asymptotes does $y = \\dfrac{x+1}{x^2 - x - 6}$ have?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 2,
    e: 'The denominator factorises as $(x-3)(x+2)$, vanishing at $x = 3$ and $x = -2$. Neither is a root of the numerator, so both give vertical asymptotes.' });

  q({ id: 'P1-GRA-09', t: 'gra', sp: 'Transformations', d: 2,
    q: 'The graph of $y = f(x)$ is stretched by scale factor $\\frac{1}{2}$ in the $x$-direction. What is the equation of the image?',
    o: ['$y = f(2x)$', '$y = f\\left(\\frac{x}{2}\\right)$', '$y = \\frac12 f(x)$', '$y = 2f(x)$', '$y = f(x) - 2$'],
    a: 0,
    e: 'A horizontal stretch of scale factor $k$ sends $y = f(x)$ to $y = f\\left(\\frac{x}{k}\\right)$. With $k = \\frac12$ this is $y = f(2x)$.' });

  q({ id: 'P1-GRA-10', t: 'gra', sp: 'Intersections', d: 3,
    q: 'For which values of $k$ do the curves $y = x^2$ and $y = k - x^2$ meet in exactly two points?',
    o: ['$k > 0$', '$k \\ge 0$', '$k < 0$', 'all $k$', '$k > 1$'],
    a: 0,
    e: 'Setting them equal gives $2x^2 = k$, so $x^2 = \\frac k2$. This has two distinct solutions exactly when $k > 0$; at $k = 0$ the curves touch at a single point and for $k < 0$ there are none.' });

  q({ id: 'P1-GRA-11', t: 'gra', sp: 'Reciprocal graphs', d: 2,
    q: 'Where does $y = \\dfrac{1}{x-1} + 2$ cross the $x$-axis?',
    o: ['$x = \\frac{1}{2}$', '$x = -\\frac{1}{2}$', '$x = \\frac{3}{2}$', '$x = 2$', 'it does not cross'],
    a: 0,
    e: 'Setting $y = 0$ gives $\\frac{1}{x-1} = -2$, so $x - 1 = -\\frac12$ and $x = \\frac12$.' });

  q({ id: 'P1-GRA-12', t: 'gra', sp: 'Comparing graphs', d: 5,
    q: 'How many real solutions does $x^2 = 2^x$ have?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 3,
    e: 'Sketch both curves. For $x > 0$ they cross at $x = 2$ and $x = 4$. For $x < 0$, $x^2$ grows without bound while $2^x$ decays to $0$, and at $x = 0$ we have $0 < 1$, so there is exactly one crossing between $-1$ and $0$. That is $3$ solutions in total.' });

})(window);
