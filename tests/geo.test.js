import test from "node:test";
import assert from "node:assert/strict";
import { destinationPoint, bearingBetween } from "../src/utils/geo.js";

const almostEqual = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

test('destinationPoint returns origin when distance is zero', () => {
  const origin = {lat: -34.0, lon: -58.0};
  const result = destinationPoint(origin.lat, origin.lon, 0, 90);
  assert.ok(almostEqual(result.lat, origin.lat));
  assert.ok(almostEqual(result.lon, origin.lon));
});

test('bearingBetween returns cardinal bearings', () => {
  assert.ok(almostEqual(bearingBetween(0, 0, 1, 0), 0));
  assert.ok(almostEqual(bearingBetween(0, 0, 0, 1), 90));
  assert.ok(almostEqual(bearingBetween(0, 0, -1, 0), 180));
  assert.ok(almostEqual(bearingBetween(0, 0, 0, -1), 270));
});
