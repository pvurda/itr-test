const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateEtaSeconds,
  calculateDeltaSeconds,
  buildEventEntry,
  sortEventEntries,
} = require('../src/features/ranking/eventRanking');

test('calculateEtaSeconds and calculateDeltaSeconds preserve math', () => {
  assert.equal(calculateEtaSeconds(100, 1.5, 2), 75);
  assert.equal(calculateDeltaSeconds(75, 60), 15);
});

test('buildEventEntry creates expected fields', () => {
  const entry = buildEventEntry({
    idx: 5,
    dist: 100,
    detour: 1.25,
    speedMps: 5,
    dtAnchorSec: 10,
    anchorTms: 1000,
    bearing: 90,
    isMutual: true,
  });
  assert.equal(entry.idx, 5);
  assert.equal(entry.dist, 100);
  assert.equal(entry.bearing, 90);
  assert.equal(entry.isMutual, true);
  assert.equal(entry.tEta, 25);
  assert.equal(entry.delta, 15);
  assert.equal(entry.expMs, 1000 + 25 * 1000);
});

test('sortEventEntries respects mutual and delta ordering', () => {
  const entries = [
    {idx: 1, delta: 20, isMutual: false},
    {idx: 2, delta: 10, isMutual: true},
    {idx: 3, delta: 5, isMutual: false},
  ];
  const isLpr = () => false;
  sortEventEntries(entries, {mode: 'next', preferLpr: false, isLpr});
  assert.deepEqual(entries.map(e => e.idx), [2, 3, 1]);
});

