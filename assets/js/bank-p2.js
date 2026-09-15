/* ============================================================
   TMUA Lab — question bank, Paper 2
   Mathematical Reasoning: logic, proof, number, inequalities.
   ============================================================ */
(function (root) {
  'use strict';
  var TL = (root.TL = root.TL || {});
  var B = (TL.BANK = TL.BANK || []);
  function q(o) { o.p = 2; B.push(o); }

  /* ---------------- Logic and mathematical arguments ---------------- */

  q({ id: 'P2-LOG-01', t: 'log', sp: 'Necessary and sufficient', d: 2,
    q: 'Let $n$ be an integer. The statement "$n^2$ is even" is which kind of condition for "$n$ is even"?',
    o: ['necessary and sufficient', 'necessary but not sufficient', 'sufficient but not necessary', 'neither necessary nor sufficient', 'sufficient only when $n > 0$'],
    a: 0,
    e: 'If $n$ is even then $n = 2k$ and $n^2 = 4k^2$ is even, so the condition is necessary. Conversely, if $n$ were odd then $n^2$ would be odd, so $n^2$ even forces $n$ even — the condition is also sufficient. Hence it is necessary and sufficient.' });

  q({ id: 'P2-LOG-02', t: 'log', sp: 'Necessary and sufficient', d: 2,
    q: 'For a real number $x$, the statement "$x > 2$" is which kind of condition for "$x^2 > 4$"?',
    o: ['sufficient but not necessary', 'necessary but not sufficient', 'necessary and sufficient', 'neither necessary nor sufficient', 'necessary only when $x > 0$'],
    a: 0,
    e: 'If $x > 2$ then certainly $x^2 > 4$, so the condition is sufficient. It is not necessary, because $x = -3$ also gives $x^2 > 4$ while $x > 2$ fails.' });

  q({ id: 'P2-LOG-03', t: 'log', sp: 'Contrapositive', d: 1,
    q: 'What is the contrapositive of "If $n^2$ is odd then $n$ is odd"?',
    o: ['If $n$ is even then $n^2$ is even', 'If $n$ is odd then $n^2$ is odd', 'If $n^2$ is even then $n$ is even', 'If $n$ is not odd then $n^2$ is odd', 'If $n^2$ is odd then $n$ is even'],
    a: 0,
    e: 'The contrapositive of "$P \\Rightarrow Q$" is "$\\neg Q \\Rightarrow \\neg P$". Here $P$ is "$n^2$ is odd" and $Q$ is "$n$ is odd", so the contrapositive is "if $n$ is even then $n^2$ is even".' });

  q({ id: 'P2-LOG-04', t: 'log', sp: 'Quantifiers', d: 2,
    q: 'What is the negation of "for all $x \\in \\mathbb{R}$, $x^2 + 1 > 0$"?',
    o: ['there exists $x \\in \\mathbb{R}$ with $x^2 + 1 \\le 0$', 'for all $x \\in \\mathbb{R}$, $x^2 + 1 \\le 0$', 'there exists $x \\in \\mathbb{R}$ with $x^2 + 1 < 0$', 'for all $x \\in \\mathbb{R}$, $x^2 + 1 < 0$', 'there exists $x \\in \\mathbb{R}$ with $x^2 + 1 > 0$'],
    a: 0,
    e: 'Negating a universal statement gives an existential one, and the negation of $> 0$ is $\\le 0$. So the negation is "there exists a real $x$ with $x^2 + 1 \\le 0$". (This is false, as it should be — the original statement is true.)' });

  q({ id: 'P2-LOG-05', t: 'log', sp: 'Converse', d: 2,
    q: 'Consider the statement "if a quadrilateral is a square then it is a rectangle". Which of these is its converse, correctly labelled as true or false?',
    o: ['"If a quadrilateral is a rectangle then it is a square" — false', '"If a quadrilateral is a rectangle then it is a square" — true', '"If a quadrilateral is not a square then it is not a rectangle" — false', '"If a quadrilateral is not a rectangle then it is not a square" — true', '"If a quadrilateral is a square then it is not a rectangle" — false'],
    a: 0,
    e: 'The converse of "$P \\Rightarrow Q$" is "$Q \\Rightarrow P$", here "if a rectangle then a square". That is false: a $2 \\times 3$ rectangle is not a square. Option D is the contrapositive, which is true but not the converse.' });

  q({ id: 'P2-LOG-06', t: 'log', sp: 'Equivalent statements', d: 1,
    q: 'Which statement is logically equivalent to $P \\Rightarrow Q$?',
    o: ['$\\neg Q \\Rightarrow \\neg P$', '$Q \\Rightarrow P$', '$\\neg P \\Rightarrow \\neg Q$', '$P \\land \\neg Q$', '$\\neg P \\land Q$'],
    a: 0,
    e: 'An implication is equivalent to its contrapositive, $\\neg Q \\Rightarrow \\neg P$. The converse and the inverse (options B and C) are not equivalent to it.' });

  q({ id: 'P2-LOG-07', t: 'log', sp: 'Quantifiers', d: 2,
    q: 'What is the negation of "every prime greater than $2$ is odd"?',
    o: ['there is a prime greater than $2$ that is even', 'every prime greater than $2$ is even', 'there is a prime greater than $2$ that is odd', 'no prime greater than $2$ is odd', 'every even number greater than $2$ is prime'],
    a: 0,
    e: 'The statement is "for all primes $p > 2$, $p$ is odd". Its negation is "there exists a prime $p > 2$ which is not odd", i.e. which is even.' });

  q({ id: 'P2-LOG-08', t: 'log', sp: 'Necessary and sufficient', d: 4,
    q: 'Let $a$ and $b$ be real numbers. The statement "$ab = 0$" is which kind of condition for "$a = 0$"?',
    o: ['necessary but not sufficient', 'sufficient but not necessary', 'necessary and sufficient', 'neither necessary nor sufficient', 'sufficient but not necessary when $b \\ne 0$'],
    a: 0,
    e: 'If $a = 0$ then $ab = 0$, so $ab = 0$ is necessary. It is not sufficient: $a = 1$ and $b = 0$ give $ab = 0$ with $a \\ne 0$.' });

  q({ id: 'P2-LOG-09', t: 'log', sp: 'Necessary and sufficient', d: 2,
    q: 'For a positive integer $x$, the statement "$x$ is divisible by $6$" is which kind of condition for "$x$ is divisible by $3$"?',
    o: ['sufficient but not necessary', 'necessary but not sufficient', 'necessary and sufficient', 'neither necessary nor sufficient', 'necessary but not sufficient when $x$ is even'],
    a: 0,
    e: 'Divisibility by $6$ implies divisibility by $3$, so it is sufficient. It is not necessary: $x = 9$ is divisible by $3$ but not by $6$.' });

  q({ id: 'P2-LOG-10', t: 'log', sp: 'Deduction', d: 1,
    q: 'You are told: "If it rains, the match is cancelled." You then learn that the match was not cancelled. What follows?',
    o: ['it did not rain', 'it rained', 'nothing can be deduced', 'it rained and the match was cancelled', 'the match was cancelled for another reason'],
    a: 0,
    e: 'This is modus tollens: from $P \\Rightarrow Q$ and $\\neg Q$ we may deduce $\\neg P$. Since the match was not cancelled, it cannot have rained.' });

  q({ id: 'P2-LOG-11', t: 'log', sp: 'De Morgan', d: 2,
    q: 'What is the negation of "$x > 0$ and $x < 5$"?',
    o: ['$x \\le 0$ or $x \\ge 5$', '$x \\le 0$ and $x \\ge 5$', '$x < 0$ or $x > 5$', '$x \\ge 0$ or $x \\le 5$', '$x \\le 0$'],
    a: 0,
    e: 'By De Morgan’s law, $\\neg(P \\land Q)$ is $\\neg P \\lor \\neg Q$. Negating each part gives "$x \\le 0$ or $x \\ge 5$".' });

  q({ id: 'P2-LOG-12', t: 'log', sp: 'Sets of solutions', d: 1,
    q: 'How many integers $x$ satisfy "$x$ is an integer and $x^2 < 2$"?',
    o: ['$1$', '$2$', '$3$', '$4$', '$5$'],
    a: 2,
    e: 'The condition means $-\\sqrt2 < x < \\sqrt2$, and the integers in that range are $-1$, $0$ and $1$: three of them.' });

  /* ---------------- Proof and counterexample ---------------- */

  q({ id: 'P2-PRF-01', t: 'prf', sp: 'Counterexamples', d: 5,
    q: 'Which value of $n$ is a counterexample to "if $n$ is prime then $2^n - 1$ is prime"?',
    o: ['$n = 2$', '$n = 3$', '$n = 5$', '$n = 7$', '$n = 11$'],
    a: 4,
    e: 'For $n = 2, 3, 5, 7$ we get $3, 7, 31, 127$, all prime. But $2^{11} - 1 = 2047 = 23 \\times 89$, so $n = 11$ is a counterexample.' });

  q({ id: 'P2-PRF-02', t: 'prf', sp: 'Counterexamples', d: 1,
    q: 'Which value of $x$ is a counterexample to "for all real $x$, $x^2 \\ge x$"?',
    o: ['$x = 0$', '$x = 1$', '$x = \\frac{1}{2}$', '$x = -1$', '$x = 2$'],
    a: 2,
    e: 'At $x = \\frac12$ we have $x^2 = \\frac14 < \\frac12$. Each of the other values satisfies $x^2 \\ge x$.' });

  q({ id: 'P2-PRF-03', t: 'prf', sp: 'Counterexamples', d: 2,
    q: 'Which pair is a counterexample to "if $a > b$ then $a^2 > b^2$"?',
    o: ['$a = 3$, $b = 2$', '$a = 1$, $b = -2$', '$a = 5$, $b = -1$', '$a = 2$, $b = -1$', '$a = 10$, $b = 9$'],
    a: 1,
    e: 'With $a = 1$ and $b = -2$ we have $a > b$, but $a^2 = 1$ and $b^2 = 4$, so $a^2 > b^2$ fails. In every other pair the larger number also has the larger square.' });

  q({ id: 'P2-PRF-04', t: 'prf', sp: 'Methods of proof', d: 1,
    q: 'A proof begins "Suppose, if possible, that $\\sqrt2 = \\frac{p}{q}$ where $p$ and $q$ are integers with no common factor." Which method is being used?',
    o: ['proof by contradiction', 'direct proof', 'proof by exhaustion', 'proof by counterexample', 'proof by induction'],
    a: 0,
    e: 'Assuming the opposite of what is to be proved and deriving an impossibility is proof by contradiction.' });

  q({ id: 'P2-PRF-05', t: 'prf', sp: 'Counterexamples', d: 5,
    q: 'For which smallest positive integer $n$ does $n^2 + n + 41$ fail to be prime?',
    o: ['$n = 39$', '$n = 40$', '$n = 41$', '$n = 10$', 'it never fails'],
    a: 1,
    e: 'At $n = 40$, $n^2 + n + 41 = 40 \\times 41 + 41 = 41^2 = 1681$, which is not prime. The expression is prime for every $n$ from $1$ to $39$, so $40$ is the first failure.' });

  q({ id: 'P2-PRF-06', t: 'prf', sp: 'Parity arguments', d: 2,
    q: 'For every integer $n$, which of these is always even?',
    o: ['$n^2 + n$', '$n^2 + 1$', '$n^2 + n + 1$', '$2n + 1$', '$n^2 - 1$'],
    a: 0,
    e: '$n^2 + n = n(n+1)$ is a product of two consecutive integers, one of which must be even, so the product is always even. Each of the others is odd for at least one choice of $n$.' });

  q({ id: 'P2-PRF-07', t: 'prf', sp: 'Errors in proofs', d: 3,
    q: 'A student "proves" that $1 = 2$: let $a = b$; then $a^2 = ab$; so $a^2 - b^2 = ab - b^2$; so $(a-b)(a+b) = b(a-b)$; so $a + b = b$; so $2b = b$; so $2 = 1$. Which step is invalid?',
    o: ['dividing both sides by $a - b$, which is zero', 'squaring both sides at the start', 'factorising $a^2 - b^2$ as $(a-b)(a+b)$', 'subtracting $b^2$ from both sides', 'concluding $2b = b$ from $a + b = b$'],
    a: 0,
    e: 'Every step is legitimate until the cancellation of $a - b$. Since $a = b$, that factor is zero, and dividing by zero is not permitted.' });

  q({ id: 'P2-PRF-08', t: 'prf', sp: 'Setting up a proof', d: 2,
    q: 'To prove "the sum of any two odd numbers is even", which opening line is correct?',
    o: ['Let the numbers be $2m+1$ and $2n+1$, where $m$ and $n$ are integers', 'Let the numbers be $2n+1$ and $2n+1$, where $n$ is an integer', 'Let the numbers be $2n+1$ and $2n+3$, where $n$ is an integer', 'Let the numbers be $n$ and $n+2$, where $n$ is odd', 'Note that $1 + 3 = 4$, which is even'],
    a: 0,
    e: 'The two odd numbers are arbitrary and need not be related, so they need separate parameters. Option B forces them to be equal, options C and D force them to differ by $2$, and option E checks only one case.' });

  q({ id: 'P2-PRF-09', t: 'prf', sp: 'Counterexamples', d: 1,
    q: 'Which pair is a counterexample to "if $x^2 = y^2$ then $x = y$"?',
    o: ['$x = 1$, $y = -1$', '$x = 2$, $y = 2$', '$x = -3$, $y = -3$', '$x = 4$, $y = 2$', '$x = 0$, $y = 1$'],
    a: 0,
    e: 'With $x = 1$ and $y = -1$ the hypothesis holds ($1 = 1$) but the conclusion fails. Options B and C satisfy the conclusion, and options D and E do not satisfy the hypothesis at all, so none of them is a counterexample.' });

  q({ id: 'P2-PRF-10', t: 'prf', sp: 'Counterexamples', d: 2,
    q: 'Which pair is a counterexample to "the sum of two irrational numbers is irrational"?',
    o: ['$\\sqrt2$ and $-\\sqrt2$', '$\\sqrt2$ and $\\sqrt3$', '$\\sqrt2$ and $2$', '$\\pi$ and $1$', '$\\sqrt2$ and $\\sqrt8$'],
    a: 0,
    e: 'Both $\\sqrt2$ and $-\\sqrt2$ are irrational, yet their sum is $0$, which is rational. In options C and D one number is rational, so the hypothesis fails; in options B and E the sums $\\sqrt2+\\sqrt3$ and $3\\sqrt2$ are irrational.' });

  q({ id: 'P2-PRF-11', t: 'prf', sp: 'Divisibility proofs', d: 4,
    q: 'What is the largest integer that divides $n^3 - n$ for every integer $n$?',
    o: ['$2$', '$3$', '$6$', '$12$', '$4$'],
    a: 2,
    e: '$n^3 - n = (n-1)n(n+1)$ is a product of three consecutive integers, so it is divisible by $2$ and by $3$, hence by $6$. Taking $n = 2$ gives $6$ itself, so nothing larger can always divide it.' });

  q({ id: 'P2-PRF-12', t: 'prf', sp: 'Counterexamples', d: 3,
    q: 'Which value of $n$ is a counterexample to "if $n$ is an integer and $n^2$ is divisible by $4$, then $n$ is divisible by $4$"?',
    o: ['$n = 2$', '$n = 3$', '$n = 5$', '$n = 7$', '$n = 9$'],
    a: 0,
    e: 'For $n = 2$ we have $n^2 = 4$, which is divisible by $4$, while $2$ is not. For the odd values listed, $n^2$ is odd, so the hypothesis fails and they cannot be counterexamples.' });

  /* ---------------- Number, divisibility and rationality ---------------- */

  q({ id: 'P2-NUM-01', t: 'num', sp: 'Divisor counting', d: 2,
    q: 'How many positive divisors does $360$ have?',
    o: ['$24$', '$12$', '$18$', '$36$', '$20$'],
    a: 0,
    e: '$360 = 2^3 \\times 3^2 \\times 5$, so the number of divisors is $(3+1)(2+1)(1+1) = 24$.' });

  q({ id: 'P2-NUM-02', t: 'num', sp: 'Cyclic patterns', d: 3,
    q: 'What is the last digit of $7^{2026}$?',
    o: ['$1$', '$3$', '$7$', '$9$', '$4$'],
    a: 3,
    e: 'The last digits of powers of $7$ cycle $7, 9, 3, 1$ with period $4$. Since $2026 = 4 \\times 506 + 2$, the last digit is the second in the cycle, namely $9$.' });

  q({ id: 'P2-NUM-03', t: 'num', sp: 'Rationality', d: 2,
    q: 'Which of these numbers is rational?',
    o: ['$\\sqrt2 \\times \\sqrt8$', '$\\sqrt2 + \\sqrt3$', '$\\dfrac{\\sqrt3}{\\sqrt2}$', '$\\dfrac{\\pi}{2}$', '$\\sqrt5 - 1$'],
    a: 0,
    e: '$\\sqrt2 \\times \\sqrt8 = \\sqrt{16} = 4$, an integer. Each of the others is irrational.' });

  q({ id: 'P2-NUM-04', t: 'num', sp: 'HCF and LCM', d: 1,
    q: 'What is the highest common factor of $84$ and $126$?',
    o: ['$42$', '$21$', '$14$', '$6$', '$252$'],
    a: 0,
    e: '$84 = 2^2 \\times 3 \\times 7$ and $126 = 2 \\times 3^2 \\times 7$. Taking the lowest power of each shared prime gives $2 \\times 3 \\times 7 = 42$.' });

  q({ id: 'P2-NUM-05', t: 'num', sp: 'Inclusion and exclusion', d: 3,
    q: 'How many integers from $1$ to $100$ inclusive are divisible by $3$ or by $5$?',
    o: ['$47$', '$45$', '$53$', '$46$', '$50$'],
    a: 0,
    e: 'There are $33$ multiples of $3$ and $20$ of $5$, but the $6$ multiples of $15$ have been counted twice. So the answer is $33 + 20 - 6 = 47$.' });

  q({ id: 'P2-NUM-06', t: 'num', sp: 'Modular arithmetic', d: 3,
    q: 'What is the remainder when $2^{100}$ is divided by $7$?',
    o: ['$1$', '$2$', '$3$', '$4$', '$5$'],
    a: 1,
    e: 'Since $2^3 = 8$ leaves remainder $1$, powers of $2$ repeat with period $3$ modulo $7$. As $100 = 3 \\times 33 + 1$, $2^{100}$ leaves the same remainder as $2^1$, namely $2$.' });

  q({ id: 'P2-NUM-07', t: 'num', sp: 'Prime factorisation', d: 4,
    q: 'What is the smallest positive integer $n$ such that $1176n$ is a perfect square?',
    o: ['$6$', '$2$', '$3$', '$14$', '$42$'],
    a: 0,
    e: '$1176 = 2^3 \\times 3 \\times 7^2$. A square needs every exponent even, so we must supply one more $2$ and one more $3$: $n = 6$.' });

  q({ id: 'P2-NUM-08', t: 'num', sp: 'Place value', d: 2,
    q: 'What is the sum of the digits of $10^{20} - 1$?',
    o: ['$180$', '$20$', '$9$', '$200$', '$181$'],
    a: 0,
    e: '$10^{20} - 1$ is a string of twenty nines, so the digit sum is $20 \\times 9 = 180$.' });

  q({ id: 'P2-NUM-09', t: 'num', sp: 'Primes', d: 1,
    q: 'Primes $p$ and $q$ satisfy $pq = 91$. What is $p + q$?',
    o: ['$20$', '$92$', '$26$', '$18$', '$14$'],
    a: 0,
    e: '$91 = 7 \\times 13$ and both factors are prime, so $p + q = 20$.' });

  q({ id: 'P2-NUM-10', t: 'num', sp: 'Factorials', d: 5,
    q: 'How many zeros does $25!$ end in?',
    o: ['$6$', '$5$', '$4$', '$7$', '$10$'],
    a: 0,
    e: 'Trailing zeros come from factors of $10 = 2 \\times 5$, and fives are the scarcer. The count is $\\left\\lfloor\\frac{25}{5}\\right\\rfloor + \\left\\lfloor\\frac{25}{25}\\right\\rfloor = 5 + 1 = 6$.' });

  q({ id: 'P2-NUM-11', t: 'num', sp: 'Squares', d: 2,
    q: 'Which of these can never be the units digit of a perfect square?',
    o: ['$1$', '$4$', '$5$', '$6$', '$8$'],
    a: 4,
    e: 'Squaring the digits $0$ to $9$ gives units digits $0, 1, 4, 9, 6, 5, 6, 9, 4, 1$. The set of possible units digits is $\\{0,1,4,5,6,9\\}$, which excludes $8$.' });

  q({ id: 'P2-NUM-12', t: 'num', sp: 'Modular arithmetic', d: 4,
    q: 'Let $n$ be an integer. Which set contains exactly the possible remainders when $n^2$ is divided by $3$?',
    o: ['$\\{0, 1\\}$', '$\\{0, 1, 2\\}$', '$\\{1, 2\\}$', '$\\{0\\}$', '$\\{1\\}$'],
    a: 0,
    e: 'Any integer is $3k$, $3k+1$ or $3k+2$. Squaring gives $9k^2$, $9k^2+6k+1$ and $9k^2+12k+4$, leaving remainders $0$, $1$ and $1$. Both $0$ and $1$ occur, so the set is $\\{0,1\\}$.' });

  /* ---------------- Inequalities and reasoning ---------------- */

  q({ id: 'P2-INE-01', t: 'ineq', sp: 'Quadratic inequalities', d: 1,
    q: 'Solve $x^2 > 3x$.',
    o: ['$x < 0$ or $x > 3$', '$0 < x < 3$', '$x > 3$', '$x > 0$', 'all real $x$'],
    a: 0,
    e: 'Rearranging, $x(x-3) > 0$. A positive product needs both factors negative or both positive, so $x < 0$ or $x > 3$. Dividing by $x$ would lose the negative branch.' });

  q({ id: 'P2-INE-02', t: 'ineq', sp: 'Quadratic inequalities', d: 1,
    q: 'How many integers satisfy $x^2 - 5x + 4 < 0$?',
    o: ['$0$', '$1$', '$2$', '$3$', '$4$'],
    a: 2,
    e: 'Factorising, $(x-1)(x-4) < 0$, so $1 < x < 4$. The integers strictly inside are $2$ and $3$: two of them.' });

  q({ id: 'P2-INE-03', t: 'ineq', sp: 'Reciprocal inequalities', d: 5,
    q: 'For which real $x$ is $\\dfrac{1}{x} > x$?',
    o: ['$x < -1$ or $0 < x < 1$', '$0 < x < 1$', '$x < -1$', '$-1 < x < 0$ or $x > 1$', 'all $x \\ne 0$'],
    a: 0,
    e: 'Multiplying by $x^2 > 0$ is safe and gives $x > x^3$, i.e. $x(1-x)(1+x) > 0$. Testing the intervals cut out by $-1$, $0$ and $1$: the inequality holds on $x < -1$ and on $0 < x < 1$.' });

  q({ id: 'P2-INE-04', t: 'ineq', sp: 'Deductions from inequalities', d: 2,
    q: 'Given that $a > b > 0$, which of these must be true?',
    o: ['$a - b > 1$', '$\\dfrac{1}{a} > \\dfrac{1}{b}$', '$a^2 > b^2$', '$\\sqrt{a} < \\sqrt{b}$', '$ab < b^2$'],
    a: 2,
    e: 'Both numbers are positive, so multiplying $a > b$ by the positive number $a$ gives $a^2 > ab$, and by $b$ gives $ab > b^2$; hence $a^2 > b^2$. Taking reciprocals or square roots reverses or preserves the order the other way, and $a - b$ can be as small as we like.' });

  q({ id: 'P2-INE-05', t: 'ineq', sp: 'AM–GM', d: 4,
    q: 'What is the least value of $x + \\dfrac{9}{x}$ for $x > 0$?',
    o: ['$6$', '$9$', '$3$', '$12$', '$0$'],
    a: 0,
    e: 'Since $\\left(\\sqrt x - \\frac{3}{\\sqrt x}\\right)^2 \\ge 0$, expanding gives $x + \\frac9x \\ge 6$, with equality when $x = 3$.' });

  q({ id: 'P2-INE-06', t: 'ineq', sp: 'Ordering', d: 2,
    q: 'If $0 < x < 1$, which of these is the largest?',
    o: ['$x$', '$x^2$', '$\\sqrt{x}$', '$\\dfrac{1}{x}$', '$x^3$'],
    a: 3,
    e: 'For $0 < x < 1$ the powers satisfy $x^3 < x^2 < x < \\sqrt x < 1$, while $\\frac1x > 1$. So $\\frac1x$ is the largest.' });

  q({ id: 'P2-INE-07', t: 'ineq', sp: 'Rational inequalities', d: 3,
    q: 'Solve $\\dfrac{x-1}{x+2} \\le 0$.',
    o: ['$-2 < x \\le 1$', '$-2 \\le x \\le 1$', '$x \\le 1$', '$x < -2$ or $x \\ge 1$', '$-1 \\le x < 2$'],
    a: 0,
    e: 'The quotient is zero at $x = 1$ and undefined at $x = -2$. Between them the numerator is negative and the denominator positive, so the quotient is negative. Hence $-2 < x \\le 1$, with $x = -2$ excluded.' });

  q({ id: 'P2-INE-08', t: 'ineq', sp: 'Powers', d: 1,
    q: 'What is the largest integer $n$ with $2^n < 1000$?',
    o: ['$9$', '$10$', '$8$', '$11$', '$500$'],
    a: 0,
    e: '$2^9 = 512 < 1000$ but $2^{10} = 1024 > 1000$, so $n = 9$.' });

  q({ id: 'P2-INE-09', t: 'ineq', sp: 'Discriminants', d: 2,
    q: 'For which values of $k$ is $x^2 + kx + 4 > 0$ for every real $x$?',
    o: ['$-4 < k < 4$', '$k > 4$', '$k < -4$ or $k > 4$', '$-2 < k < 2$', 'all real $k$'],
    a: 0,
    e: 'The parabola opens upwards, so it stays above the axis exactly when there are no real roots: $k^2 - 16 < 0$, i.e. $-4 < k < 4$.' });

  q({ id: 'P2-INE-10', t: 'ineq', sp: 'Estimation', d: 2,
    q: 'Between which two numbers does $\\sqrt{10}$ lie?',
    o: ['$3.1$ and $3.2$', '$3.0$ and $3.1$', '$3.2$ and $3.3$', '$3.3$ and $3.4$', '$2.9$ and $3.0$'],
    a: 0,
    e: '$3.1^2 = 9.61$ and $3.2^2 = 10.24$, so $3.1 < \\sqrt{10} < 3.2$.' });

  q({ id: 'P2-INE-11', t: 'ineq', sp: 'Optimisation by inequality', d: 2,
    q: 'Positive numbers $x$ and $y$ satisfy $x + y = 10$. What is the greatest possible value of $xy$?',
    o: ['$25$', '$50$', '$100$', '$20$', '$10$'],
    a: 0,
    e: 'Writing $y = 10 - x$, the product is $10x - x^2 = 25 - (x-5)^2$, which is greatest when $x = 5$, giving $xy = 25$.' });

  q({ id: 'P2-INE-12', t: 'ineq', sp: 'Lattice points', d: 3,
    q: 'How many pairs of integers $(x, y)$ satisfy $x^2 + y^2 \\le 2$?',
    o: ['$9$', '$5$', '$13$', '$4$', '$8$'],
    a: 0,
    e: 'Either coordinate with absolute value $2$ or more already makes the sum at least $4$, so $x$ and $y$ each lie in $\\{-1, 0, 1\\}$. All nine such pairs satisfy the inequality, since the largest sum obtained is $1 + 1 = 2$.' });

})(window);
