# Transcribing a TMUA past paper

You are transcribing **one** official TMUA past paper into JSON for the TMUA Lab
question bank. Accuracy matters far more than speed: a wrong answer key or a
mangled formula is worse than no question at all.

## Where things are

- **Question images**: `<SCRATCH>/q/<TAG>/sheet-01.png` … `sheet-04.png`
  Each sheet stacks about five questions, in order, cropped from the paper.
  Individual crops also exist as `q01.png` … `q20.png` if you need a closer look
  at one question — read those when a sheet is hard to make out.
- **Your output**: `data/past/<TAG>.json` in the repo.

`<TAG>` looks like `2019-P1`.

## Method

1. Read every sheet image for your paper. Read the individual `qNN.png` crop for
   any question whose notation you cannot make out with certainty.
2. For each of the 20 questions, transcribe the stem, **every** answer option in
   order, and work out the answer yourself.
3. Check your answer against the official key you were given. **If your answer
   disagrees with the key, work it again.** If it still disagrees, use the key's
   answer and add a `"note"` field saying what you got and why you think it
   differs. Never silently overwrite the key.
4. Write the JSON file. Then run `node tools/build-past.js` from the repo root:
   it re-checks every answer against the official key and will fail loudly if
   any disagree.

## Output format

A JSON array of exactly 20 objects, in question order:

```json
[
  {
    "n": 1,
    "t": "alg",
    "sp": "Discriminant · graphs that do not meet",
    "d": 3,
    "sol": "lab",
    "q": "The graphs of $y = x^2 + 5x + 6$ and $y = mx - 3$ are plotted on the same axes.<p>Given that the graphs do not meet, what is the complete range of possible values of $m$?</p>",
    "o": ["$-1 < m < 11$", "$m < -1,\\ m > 11$", "$-\\sqrt{11} < m < \\sqrt{11}$"],
    "a": 0,
    "e": "Setting them equal gives $x^2 + (5-m)x + 9 = 0$. The graphs miss each other exactly when the discriminant is negative: $(5-m)^2 - 36 < 0$, so $-1 < m < 11$."
  }
]
```

| Field | Meaning |
| --- | --- |
| `n` | Question number, 1–20 |
| `t` | Topic key — see below |
| `sp` | Specification point: a short human label, e.g. `"Sine rule · the ambiguous case"` |
| `d` | Difficulty 1–5. Real TMUA questions are mostly 3–5; reserve 1–2 for genuinely routine ones |
| `sol` | Always `"lab"` (you wrote the solution) |
| `q` | The stem |
| `o` | **Every** option, in order. Do not pad to five — papers vary from 4 to 8 |
| `a` | Zero-based index of the correct option |
| `e` | Your worked solution |
| `fig` | Only if the question has a diagram: a one-sentence description of it |

### Topic keys

Usable on either paper: `alg` (algebra and functions), `seq` (sequences and
series, including binomial), `geo` (coordinate geometry, circles, triangles),
`trig` (trigonometry), `exp` (exponentials and logarithms), `cal`
(differentiation and integration), `gra` (graphs and transformations).

Paper 2 only: `log` (logic, necessary and sufficient, quantifiers), `prf` (proof,
counterexample, finding the error in an argument), `num` (number, divisibility,
bases), `ineq` (inequalities and reasoning about them).

Pick the topic by what the question actually tests. A Paper 2 question about
integrals is `cal`, not `log`.

## Writing the maths

Maths goes between `$…$` (inline) or `$$…$$` (displayed), in a LaTeX subset:

- `\frac{a}{b}`, `\sqrt{x}`, `\sqrt[3]{x}`, `x^2`, `x^{n+1}`, `a_1`, `\binom{n}{k}`
- `\le \ge \ne \pm \times \cdot \infty \approx \equiv`
- `\pi \theta \alpha \beta \lambda \Delta \Sigma` and the rest of the Greek letters
- `\Rightarrow \Leftrightarrow \implies \iff \in \notin \forall \exists \neg \land \lor`
- `\sum_{n=0}^{\infty}`, `\int_a^b`, `\lim`, `\sin \cos \tan \log \ln`
- `\left( … \right)`, `\left\lfloor … \right\rfloor`, `\mathbb{R}` `\mathbb{N}` `\mathbb{Z}`
- `\text{…}` for words inside maths

Rules that matter:

- **Never put prose inside `$…$`** — it renders as italic single letters. Write
  `$x < -2$ or $x > 2$`, not `$x < -2 \text{ or } x > 2$`.
- Prose in `q` and `e` is **HTML**: use `<p>…</p>` between paragraphs, `<br>` for
  line breaks, `<ul><li>…</li></ul>` for bullets, `<em>` and `<b>`.
- Multi-part option lists (I, II, III) go in the stem as `<p>I&nbsp;&nbsp; …<br>II&nbsp; …</p>`.
- Escape backslashes for JSON: write `\\frac`, `\\sqrt`, `\\le` in the file.

## Writing the solution

`e` is the part a struggling student actually reads. Write the *route*, not just
the algebra: say what to notice first, then carry it through. Two to five
sentences. Explain why the tempting wrong turn is wrong when there is an obvious
one. Match the tone of the example above — plain, direct, no exclamation marks,
no "simply" or "just".

## Diagrams

If a question depends on a figure, describe the figure in words inside the stem
so the question is still answerable, and add the `fig` field. Do not attempt SVG.

## When you are done

Report: the tag, how many questions you wrote, any question where your answer
initially disagreed with the key (and how it resolved), and any question whose
notation you were not fully confident reading.
