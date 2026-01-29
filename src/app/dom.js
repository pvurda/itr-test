export function bindSearch({
  inputEl,
  resultsEl,
  onQuery,
  onSelect,
  onClose,
  getItems,
  getActiveIndex,
  setActiveIndex,
  setActive,
  debounceMs = 80,
}) {
  if (!inputEl || !resultsEl) return;
  let timer = null;

  inputEl.addEventListener("input", () => {
    if (timer) clearTimeout(timer);
    const value = inputEl.value;
    timer = setTimeout(() => onQuery(value), debounceMs);
  });

  resultsEl.addEventListener("click", (event) => {
    const item = event.target.closest(".cv-result");
    if (!item) return;
    const idx = Number.parseInt(item.getAttribute("data-idx"), 10);
    if (Number.isNaN(idx)) return;
    onSelect(idx);
    onClose();
    inputEl.blur();
  });

  inputEl.addEventListener("keydown", (event) => {
    const items = getItems();
    if (!items || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(items.length - 1, getActiveIndex() + 1);
      setActiveIndex(next);
      setActive(next);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, getActiveIndex() - 1);
      setActiveIndex(next);
      setActive(next);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const idx = items[getActiveIndex()] ?? items[0];
      if (idx !== undefined) {
        onSelect(idx);
        onClose();
        inputEl.blur();
      }
    } else if (event.key === "Escape") {
      onClose();
    }
  });

  document.addEventListener("click", (event) => {
    if (!resultsEl.contains(event.target) && event.target !== inputEl) {
      onClose();
    }
  });
}

export function bindToggles({
  circlesEl,
  onlyEl,
  mutualEl,
  onCirclesChange,
  onOnlyChange,
  onMutualChange,
}) {
  if (circlesEl) {
    circlesEl.addEventListener("change", function () {
      onCirclesChange(this.checked);
    });
  }
  if (onlyEl) {
    onlyEl.addEventListener("change", function () {
      onOnlyChange(this.checked);
    });
  }
  if (mutualEl) {
    mutualEl.addEventListener("change", function () {
      onMutualChange(this.checked);
    });
  }
}

export function bindExport({
  csvButton,
  detExportButton,
  onExportCsv,
  onExportDetections,
}) {
  if (csvButton) {
    csvButton.addEventListener("click", onExportCsv);
  }
  if (detExportButton) {
    detExportButton.addEventListener("click", onExportDetections);
  }
}

export function bindHotkeys({ onKeydown }) {
  if (typeof onKeydown !== "function") return;
  document.addEventListener("keydown", onKeydown);
}
