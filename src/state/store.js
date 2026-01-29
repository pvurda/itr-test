const STORAGE_KEY = "cv-state-v1";

let state = null;
const listeners = new Set();

function defaultState() {
  return {
    selection: {
      selected: null,
      ringFilter: "ALL",
      hovered: null,
      mutualSet: null,
    },
    hypotheses: {
      list: [],
      activeId: null,
    },
    event: {
      active: false,
      placing: false,
      lat: null,
      lon: null,
      t0ms: null,
      id: "E-001",
      target: "person",
      type: "sighting",
      confidence: 0.6,
      horizonSec: 600,
      pastWindowSec: 600,
    },
    detections: {
      list: [],
      nextSeq: 1,
      lastUndoId: null,
      eventId: "E-001",
    },
    ui: {
      showCircles: true,
      onlyNeighbors: false,
      onlyMutual: false,
    },
  };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (error) {
    // ignore storage failures
  }
}

function notify() {
  for (const listener of listeners) {
    listener(state);
  }
}

export function createStore() {
  if (state) {
    return { getState, subscribe, loadState, persistState };
  }
  const stored = readStorage();
  state = defaultState();
  if (stored) {
    state = {
      ...state,
      ...stored,
      selection: { ...state.selection, ...(stored.selection || {}) },
      hypotheses: { ...state.hypotheses, ...(stored.hypotheses || {}) },
      event: { ...state.event, ...(stored.event || {}) },
      detections: { ...state.detections, ...(stored.detections || {}) },
      ui: { ...state.ui, ...(stored.ui || {}) },
    };
  }
  return { getState, subscribe, loadState, persistState };
}

export function getState() {
  if (!state) {
    throw new Error("Store not initialized. Call createStore() first.");
  }
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function persistState(payload) {
  if (!state) {
    throw new Error("Store not initialized. Call createStore() first.");
  }

  const next = { ...state };
  for (const [key, value] of Object.entries(payload || {})) {
    if (value === true) {
      next[key] = state[key];
    } else {
      next[key] = value;
    }
  }
  state = {
    ...state,
    ...next,
  };
  writeStorage(state);
  notify();
}

export function loadState({ hypothesesBaseline } = {}) {
  if (!state) {
    throw new Error("Store not initialized. Call createStore() first.");
  }
  const stored = readStorage();
  const loaded = {
    hypotheses: false,
    event: false,
    detections: false,
    ui: false,
  };

  if (stored && stored.hypotheses) {
    state.hypotheses = stored.hypotheses;
    loaded.hypotheses = true;
  } else if (hypothesesBaseline) {
    state.hypotheses = hypothesesBaseline;
  }

  if (stored && stored.event) {
    state.event = { ...state.event, ...stored.event, active: true };
    loaded.event = true;
  }

  if (stored && stored.detections) {
    state.detections = { ...state.detections, ...stored.detections };
    loaded.detections = true;
  }

  if (stored && stored.ui) {
    state.ui = { ...state.ui, ...stored.ui };
    loaded.ui = true;
  }

  notify();
  return { loaded };
}
