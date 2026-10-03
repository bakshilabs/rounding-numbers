// Checks the rounding logic in index.html. Run with: node test-logic.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const src = html.split('// ==LOGIC START==')[1].replace(/^.*\n/, '').split('// ==LOGIC END==')[0];
const L = new Function(src + '; return { fmt, roundTo, neighbours, isHalfway, decidingDigit, parseAnswer, diagnose, makeLevel, starsFor, LEVELS };')();

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

assert.equal(L.starsFor(10), 3); assert.equal(L.starsFor(9), 3);
assert.equal(L.starsFor(8), 2); assert.equal(L.starsFor(7), 2);
assert.equal(L.starsFor(6), 1); assert.equal(L.starsFor(0), 1);

assert.equal(L.fmt(6347), '6,347');
console.log('All rounding logic checks passed.');
