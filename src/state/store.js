import { schema } from "./schema.js";

const STORAGE_KEYS = {
  hypotheses: "cv.hypotheses.v1",
  event: "cv.event",
  detections: "cv.detections",
  ui: "cv.ui.v1",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignorar errores de storage.
  }
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Ignorar errores de storage.
  }
}

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;

  const setState = (updater) => {
    const next = typeof updater === "function" ? updater(state) : updater;
    if (!next || typeof next !== "object") return state;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener(state));
    return state;
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const load = (loader) => {
    const next = typeof loader === "function" ? loader(state) : state;
    if (next && typeof next === "object") {
      state = next;
      listeners.forEach((listener) => listener(state));
    }
    return state;
  };

  const persist = (persister) => {
    if (typeof persister === "function") {
      persister(state);
    }
    return state;
  };

  return {
    getState,
    setState,
    subscribe,
    load,
    persist,
  };
}

const store = createStore(clone(schema));

export const getState = () => store.getState();
export const setState = (updater) => store.setState(updater);
export const subscribe = (listener) => store.subscribe(listener);

export function loadState(options = {}) {
  const loaded = {
    hypotheses: false,
    event: false,
    detections: false,
    ui: false,
  };

  const next = store.load((current) => {
    const state = { ...current };

    const hyp = readJSON(STORAGE_KEYS.hypotheses);
    if (hyp && Array.isArray(hyp.list) && hyp.list.length > 0) {
      state.hypotheses = {
        list: hyp.list,
        activeId: hyp.activeId && hyp.list.some((h) => h.id === hyp.activeId)
          ? hyp.activeId
          : hyp.list[0].id,
      };
      loaded.hypotheses = true;
    } else if (options.hypothesesBaseline) {
      state.hypotheses = options.hypothesesBaseline;
    }

    const ev = readJSON(STORAGE_KEYS.event);
    if (ev && isFinite(ev.lat) && isFinite(ev.lon) && ev.t0ms) {
      state.event = {
        ...state.event,
        ...ev,
        active: true,
      };
      loaded.event = true;
    } else if (options.eventDefaults) {
      state.event = {
        ...state.event,
        ...options.eventDefaults,
      };
    }

    const det = readJSON(STORAGE_KEYS.detections);
    if (det && Array.isArray(det.list)) {
      state.detections = {
        ...state.detections,
        list: det.list,
        nextSeq: det.nextSeq || (det.list.length + 1) || 1,
        lastUndoId: null,
      };
      loaded.detections = true;
    }

    const ui = readJSON(STORAGE_KEYS.ui);
    if (ui && typeof ui === "object") {
      state.ui = {
        ...state.ui,
        ...ui,
      };
      loaded.ui = true;
    }

    return state;
  });

  return { state: next, loaded };
}

export function persistState(options = {}) {
  const state = getState();

  if (options.hypotheses) {
    const payload = options.hypotheses === true ? state.hypotheses : options.hypotheses;
    writeJSON(STORAGE_KEYS.hypotheses, payload);
  }

  if (options.event !== undefined) {
    if (options.event === null) {
      removeKey(STORAGE_KEYS.event);
    } else {
      const payload = options.event === true ? state.event : options.event;
      writeJSON(STORAGE_KEYS.event, payload);
    }
  }

  if (options.detections !== undefined) {
    if (options.detections === null) {
      removeKey(STORAGE_KEYS.detections);
    } else {
      const payload = options.detections === true ? state.detections : options.detections;
      writeJSON(STORAGE_KEYS.detections, payload);
    }
  }

  if (options.ui) {
    const payload = options.ui === true ? state.ui : options.ui;
    writeJSON(STORAGE_KEYS.ui, payload);
  }
}
