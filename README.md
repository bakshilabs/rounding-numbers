# Round It!

A rounding app for children aged about 8 (UK Year 3/4): rounding to the nearest 10, 100 and 1,000.

## How to use

Double-click `index.html`. It opens in your browser and runs from this folder. There's nothing to install and no server is needed.

- **Explore**: drag a number along the number line and see which end it rounds to. Switch between the nearest 10, 100 and 1,000. The "rounding hill" shows the digit shortcut.
- **Levels 1–5**: 10 questions each, with stars for answers right first time.
  1. Nearest 10 (2-digit)
  2. Nearest 10 (3-digit)
  3. Nearest 100
  4. Nearest 1,000
  5. Mixed, with £, g, ml and m

Stars are saved in this browser only. Grown-ups can clear them under **For grown-ups → Reset progress**.

Without internet the app still works fully, but it falls back to system fonts.

## Research behind it

- **Curriculum (England).** Rounding any number to the nearest 10, 100 or 1,000 is statutory in Year 4. Year 3 builds the groundwork: placing numbers on a number line and finding the multiple of 10 or 100 before and after.
- **Order.** Nearest 10, then 100, then 1,000. Then one number rounded three ways (6,347 → 6,350, 6,300, 6,000). Then measures (2,800 g ≈ 3 kg). This matches the White Rose Year 4 small steps and Oak National Academy.
- **Meaning before the rule.** Children who only memorise "5 or more, round up" often can't apply it. The app starts with the number line:
  1. Find the two multiples either side.
  2. Find the halfway point.
  3. Pick the closer end.

  The digit rule is taught afterwards, as a shortcut.
- **Halfway numbers** (5, 50, 500) are exactly in the middle, and by convention they round up. The app says this directly.
- **Mistakes the app spots and explains:**
  - not changing every digit (4,698 → 4,798 instead of 4,700)
  - picking the wrong neighbour, or always rounding up
  - rounding to the wrong place
  - rounding a halfway number down
  - crossing a boundary (95 → 100, 996 → 1,000, 9,960 → 10,000, 4 → 0)
- **Support that fades.** The first 3 questions in Levels 1–4 are split into two tap-to-answer steps. After that, answers are typed, and the number line is available as a hint. There are no timers.

Sources:
- [DfE National Curriculum: Mathematics](https://assets.publishing.service.gov.uk/media/5a7da548ed915d2ac884cb07/PRIMARY_national_curriculum_-_Mathematics_220714.pdf)
- [DfE Year 3 guidance](https://assets.publishing.service.gov.uk/media/61409475e90e07043fea1c45/Maths_guidance_year_3.pdf)
- [DfE Year 4 guidance](https://assets.publishing.service.gov.uk/media/6009a9888fa8f5296a72aad7/Maths_guidance_year_4.pdf)
- [Oak National Academy lesson](https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/comparing-ordering-and-rounding-4-digit-numbers/lessons/round-a-4-digit-number-to-the-nearest-thousand-hundred-and-ten)
- [White Rose Year 4 overview](https://thirdspacelearning.com/blog/white-rose-maths-year-4/)
- [Why is rounding so hard?](https://teachingintheheartofflorida.com/2019/06/why-is-rounding-numbers-to-the-nearest-10-and-100-so-hard-3-ways-you-can-make-it-easier-for-students.html)

## Checking the maths

```
node test-logic.mjs
```

This tests the rounding function on every number from 0 to 10,000, the mistake detection, and the question generator.
