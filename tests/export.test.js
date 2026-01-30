import test from "node:test";
import assert from "node:assert/strict";
import { buildDetectionsExportPayload, buildNeighborCsvRows } from "../src/utils/export.js";

test('buildDetectionsExportPayload returns expected structure', () => {
  const payload = buildDetectionsExportPayload({
    exportedAt: '2024-01-01T00:00:00.000Z',
    event: {id: 'E-1'},
    detections: [{id: 'D-1'}],
  });
  assert.deepEqual(payload, {
    v: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    event: {id: 'E-1'},
    detections: [{id: 'D-1'}],
  });
});

test('buildNeighborCsvRows builds header and data rows', () => {
  const dev = {
    code: ['A', 'B'],
    desc: ['Alpha', 'Beta'],
    site: ['S1', 'S2'],
  };
  const neigh = {
    rings: [
      [
        [[1, 100, 45, 0]],
        [],
        [],
        [],
        [],
      ],
    ],
    sameSite: [
      [[1, 0]],
    ],
  };
  const rings = [{label: '0–100 m'}];
  const timeState = {mode: 'both', detour: 1.25, walkKmh: 5, driveKmh: 25};
  const hyp = {id: 'H-1', rev: 1, confidence: 0.5, time: {mode: 'both'}};

  const rows = buildNeighborCsvRows({
    selectedIdx: 0,
    dev,
    neigh,
    rings,
    timeState,
    hyp,
    mutualSet: new Set([1]),
    isNeighborAllowed: () => true,
    walkMps: 1,
    driveMps: 5,
  });

  assert.equal(rows.length, 3);
  assert.ok(rows[0].startsWith('selected_code'));
  assert.ok(rows[1].includes('"A"'));
  assert.ok(rows[1].includes('"B"'));
  assert.ok(rows[2].includes('same_site'));
});
