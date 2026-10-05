// Checks the rounding logic in index.html. Run with: node test-logic.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const src = html.split('// ==LOGIC START==')[1].replace(/^.*\n/, '').split('// ==LOGIC END==')[0];
const L = new Function(src + '; return { fmt, roundTo, neighbours, isHalfway, decidingDigit, parseAnswer, diagnose, makeLevel, makeFocusNumber, makeFocusRound, starsFor, LEVELS };')();

// roundTo matches "round half up" for every whole number 0–10,000
for (const unit of [10, 100, 1000]) {
  for (let n = 0; n <= 10000; n++) {
    const r = n % unit;
    const expected = r >= unit / 2 ? n - r + unit : n - r;
    assert.equal(L.roundTo(n, unit), expected, `roundTo(${n}, ${unit})`);
  }
}

// Spot checks from the plan
const spot = [[45, 10, 50], [44, 10, 40], [4, 10, 0], [95, 10, 100], [996, 10, 1000],
  [9960, 100, 10000], [4698, 100, 4700], [6347, 10, 6350], [6347, 100, 6300], [6347, 1000, 6000],
  [2800, 1000, 3000], [3500, 1000, 4000], [750, 100, 800], [9500, 1000, 10000]];
for (const [n, u, want] of spot) assert.equal(L.roundTo(n, u), want, `${n} to nearest ${u}`);

assert.deepEqual(L.neighbours(47, 10), [40, 50]);
assert.deepEqual(L.neighbours(40, 10), [40, 40]);
assert.equal(L.decidingDigit(6347, 10), 7);
assert.equal(L.decidingDigit(6347, 100), 4);
assert.equal(L.decidingDigit(6347, 1000), 3);

// Answer parsing
assert.equal(L.parseAnswer('1,000'), 1000);
assert.equal(L.parseAnswer(' £50 '), 50);
assert.equal(L.parseAnswer('3000 g'), 3000);
assert.equal(L.parseAnswer('4000ml'), 4000);
assert.ok(Number.isNaN(L.parseAnswer('')));
assert.ok(Number.isNaN(L.parseAnswer('fifty')));

// Mistake diagnosis
assert.equal(L.diagnose(4698, 100, 4700), 'correct');
assert.equal(L.diagnose(4698, 100, 4798), 'notMultiple');
assert.equal(L.diagnose(45, 10, 40), 'halfwayDown');
assert.equal(L.diagnose(43, 10, 50), 'wrongWay');
assert.equal(L.diagnose(6347, 10, 6300), 'wrongPlace:100');
assert.equal(L.diagnose(6347, 100, 6350), 'wrongPlace:10');
assert.equal(L.diagnose(6347, 1000, 6300), 'wrongPlace:100');
assert.equal(L.diagnose(47, 10, 70), 'tooFar');
assert.equal(L.diagnose(47, 10, NaN), 'notNumber');

// Generated levels: 10 unique questions, no exact multiples, edge cases present
for (let trial = 0; trial < 300; trial++) {
  for (const { no } of L.LEVELS) {
    const qs = L.makeLevel(no);
    assert.equal(qs.length, 10, `level ${no} length`);
    for (const q of qs) {
      assert.ok(Number.isInteger(q.n) && q.n > 0 && q.n < 10000, `level ${no} n in range: ${q.n}`);
      assert.notEqual(q.n % q.unit, 0, `level ${no}: ${q.n} is already a multiple of ${q.unit}`);
    }
    if (no <= 4) {
      const unit = qs[0].unit;
      assert.ok(qs.some(q => L.isHalfway(q.n, unit)), `level ${no} has a halfway number`);
      assert.ok(qs.some(q => String(L.roundTo(q.n, unit)).length !== String(Math.floor(q.n / unit) * unit).length
        || L.roundTo(q.n, unit) === 0), `level ${no} has a boundary-crossing number`);
      assert.deepEqual(qs.map(q => q.guided), [true, true, true, false, false, false, false, false, false, false]);
      assert.equal(new Set(qs.map(q => q.n)).size, 10, `level ${no} numbers are unique`);
    }
    if (no === 1) {
      assert.ok(qs.some(q => L.roundTo(q.n, 10) === 0), 'level 1 has a number that rounds to 0');
      assert.ok(qs.some(q => L.roundTo(q.n, 10) === 100), 'level 1 has a number that rounds to 100');
    }
  }
}

// 4-digit focus numbers: 4 digits, never a multiple of the unit, every kind of number turns up
const KINDS = {
  100: {
    halfway: n => L.isHalfway(n, 100),
    crossesThousand: n => n % 1000 > 950,
    zeroHundreds: n => n % 1000 < 100,
  },
  1000: {
    halfway: n => L.isHalfway(n, 1000),
    crossesTenThousand: n => n > 9500,
    zeroHundreds: n => n % 1000 < 100,
    underHalfway: n => n % 1000 >= 450 && n % 1000 < 500,
  },
};
for (const unit of [100, 1000]) {
  const seen = Object.fromEntries(Object.keys(KINDS[unit]).map(k => [k, 0]));
  for (let trial = 0; trial < 5000; trial++) {
    const n = L.makeFocusNumber(unit);
    assert.ok(Number.isInteger(n) && n >= 1001 && n <= 9999, `nearest ${unit} focus n in range: ${n}`);
    assert.notEqual(n % unit, 0, `nearest ${unit} focus: ${n} is already a multiple of ${unit}`);
    for (const [k, test] of Object.entries(KINDS[unit])) if (test(n)) seen[k]++;
  }
  for (const [k, v] of Object.entries(seen)) assert.ok(v > 100, `nearest ${unit} focus has ${k} numbers (${v})`);
}
const avoid = [4650, 9950, 5032, 3962];
for (let trial = 0; trial < 2000; trial++) assert.ok(!avoid.includes(L.makeFocusNumber(100, avoid)), 'avoids recent numbers');

// 4-digit rounds: 10 different numbers, each special kind at least once, recent numbers avoided
for (const [unit, recent] of [[100, [4650, 9950, 5032, 3962]], [1000, [4500, 9620, 6078, 4480]]]) {
  for (let trial = 0; trial < 1000; trial++) {
    const round = L.makeFocusRound(unit, recent);
    assert.equal(round.length, 10, `nearest ${unit} round length`);
    assert.equal(new Set(round).size, 10, `nearest ${unit} round numbers are unique`);
    for (const n of round) {
      assert.ok(n >= 1001 && n <= 9999 && n % unit !== 0, `nearest ${unit} round n: ${n}`);
      assert.ok(!recent.includes(n), `nearest ${unit} round avoids recent ${n}`);
    }
    for (const [k, test] of Object.entries(KINDS[unit])) assert.ok(round.some(test), `nearest ${unit} round has a ${k} number`);
  }
}

// Rounds keep coming even when recent rounds have used up all nine X,500 numbers
const allHalfway = [1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500];
for (let trial = 0; trial < 200; trial++) {
  const round = L.makeFocusRound(1000, allHalfway);
  assert.equal(new Set(round).size, 10, 'round is unique when halfway numbers are used up');
  assert.ok(round.some(n => L.isHalfway(n, 1000)), 'round still has a halfway number');
}

assert.equal(L.starsFor(10), 3); assert.equal(L.starsFor(9), 3);
assert.equal(L.starsFor(8), 2); assert.equal(L.starsFor(7), 2);
assert.equal(L.starsFor(6), 1); assert.equal(L.starsFor(0), 1);

assert.equal(L.fmt(6347), '6,347');
console.log('All rounding logic checks passed.');
