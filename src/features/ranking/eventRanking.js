export function calculateEtaSeconds(distMeters, detour, speedMps) {
  return (distMeters * detour) / speedMps;
}

export function calculateDeltaSeconds(etaSeconds, dtAnchorSec) {
  return etaSeconds - dtAnchorSec;
}

export function buildEventEntry(options) {
  const tEta = calculateEtaSeconds(options.dist, options.detour, options.speedMps);
  const delta = calculateDeltaSeconds(tEta, options.dtAnchorSec);
  return {
    idx: options.idx,
    dist: options.dist,
    tEta,
    delta,
    expMs: options.anchorTms + tEta * 1000,
    bearing: options.bearing,
    isMutual: options.isMutual,
  };
}

function compareEventEntries(a, b, preferLpr, isLpr) {
  if (preferLpr && isLpr(a.idx) !== isLpr(b.idx)) return isLpr(a.idx) ? -1 : 1;
  const ma = a.isMutual ? 1 : 0;
  const mb = b.isMutual ? 1 : 0;
  if (ma !== mb) return mb - ma;
  return 0;
}

export function sortEventEntries(entries, options) {
  const mode = options.mode;
  const preferLpr = options.preferLpr;
  const isLpr = options.isLpr;
  entries.sort((a, b) => {
    const common = compareEventEntries(a, b, preferLpr, isLpr);
    if (common) return common;
    if (mode === 'past') return b.delta - a.delta;
    if (mode === 'now') return Math.abs(a.delta) - Math.abs(b.delta);
    if (mode === 'next') return a.delta - b.delta;
    if (mode === 'neg') return Math.abs(a.delta) - Math.abs(b.delta);
    return 0;
  });
  return entries;
}

export const rankingUtils = {
  calculateEtaSeconds,
  calculateDeltaSeconds,
  buildEventEntry,
  sortEventEntries,
};
