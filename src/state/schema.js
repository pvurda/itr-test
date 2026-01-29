export const schema = {
  hypotheses: {
    list: [],
    activeId: null,
  },
  event: {
    active: false,
    placing: false,
    id: "E-001",
    lat: null,
    lon: null,
    t0ms: null,
    target: "person",
    type: "sospechoso",
    confidence: 0.60,
    tolSec: 30,
    horizonSec: 600,
    pastWindowSec: 600,
  },
  detections: {
    v: 1,
    list: [],
    nextSeq: 1,
    lastUndoId: null,
  },
  selection: {
    selected: null,
    hovered: null,
    ringFilter: "ALL",
    mutualSet: null,
  },
  ui: {
    onlyNeighbors: false,
    showCircles: true,
    onlyMutual: false,
  },
};
