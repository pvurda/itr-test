export function bootstrap({ createStore, initMap, bindUI, renderInitial }) {
  if (typeof createStore !== "function") {
    throw new Error("bootstrap requires createStore");
  }
  if (typeof initMap !== "function") {
    throw new Error("bootstrap requires initMap");
  }

  const store = createStore();
  const map = initMap({ store });

  if (typeof bindUI === "function") {
    bindUI({ store, map });
  }

  if (typeof renderInitial === "function") {
    renderInitial({ store, map });
  }

  return { store, map };
}
