import test from "node:test";
import assert from "node:assert/strict";
import { kmhToMps, fmtTimeSeconds, fmtMMSS, fmtSignedDelta, fmtHHMMSS } from "../src/utils/time.js";

test('kmhToMps converts km/h to m/s', () => {
  assert.equal(kmhToMps(3.6), 1);
});

test('fmtTimeSeconds formats seconds into readable string', () => {
  assert.equal(fmtTimeSeconds(0), '0s');
  assert.equal(fmtTimeSeconds(59.6), '60s');
  assert.equal(fmtTimeSeconds(60), '1.0m');
  assert.equal(fmtTimeSeconds(600), '10m');
});

test('fmtMMSS formats minutes and seconds', () => {
  assert.equal(fmtMMSS(0), '00:00');
  assert.equal(fmtMMSS(61), '01:01');
});

test('fmtSignedDelta formats signed deltas', () => {
  assert.equal(fmtSignedDelta(0.4), '±0s');
  assert.equal(fmtSignedDelta(-10), '−10s');
  assert.equal(fmtSignedDelta(75), '+01:15');
});

test('fmtHHMMSS formats a date', () => {
  const date = new Date(0);
  date.setHours(3, 4, 5, 0);
  assert.equal(fmtHHMMSS(date), '03:04:05');
});
