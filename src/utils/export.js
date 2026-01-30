export function buildDetectionsExportPayload(options) {
  return {
    v: 1,
    exportedAt: options.exportedAt,
    event: options.event,
    detections: options.detections,
  };
}

export function buildNeighborCsvRows(options) {
  const idx = options.selectedIdx;
  const dev = options.dev;
  const neigh = options.neigh;
  const rings = options.rings;
  const timeState = options.timeState;
  const hyp = options.hyp;
  const mutualSet = options.mutualSet;
  const isNeighborAllowed = options.isNeighborAllowed;
  const walkMps = options.walkMps;
  const driveMps = options.driveMps;

  const hyp_id = hyp ? hyp.id : "";
  const hyp_rev = hyp ? (hyp.rev || 0) : 0;
  const hyp_conf = hyp ? Number(hyp.confidence ?? 0) : 0;
  const hyp_mode = hyp ? (hyp.time && hyp.time.mode ? hyp.time.mode : timeState.mode) : timeState.mode;

  const det = timeState.detour;

  const header = [
    "selected_code","selected_idx","selected_desc",
    "neighbor_code","neighbor_idx","neighbor_desc",
    "distance_m","hyp_id","hyp_rev","hyp_confidence","hyp_mode","detour_factor","walk_kmh","drive_kmh",
    "walk_seconds","drive_seconds",
    "bearing_deg","sector","range_label","is_mutual","site_id"
  ].join(",");
  const rows = [header];

  const rr = neigh.rings[idx];
  const sectors = ["N","NE","E","SE","S","SW","W","NW"];
  for (let r=0;r<5;r++) {
    for (const e of rr[r]) {
      const j = e[0];
      if (!isNeighborAllowed(j, r)) continue;
      const dist = e[1];
      const dEff = dist * det;
      const wSec = dEff / walkMps;
      const dSec = dEff / driveMps;
      const isMut = (mutualSet && mutualSet.has(j)) ? 1 : 0;
      const row = [
        JSON.stringify(String(dev.code[idx])),
        idx,
        JSON.stringify(dev.desc[idx]),
        JSON.stringify(String(dev.code[j])),
        j,
        JSON.stringify(dev.desc[j]),
        dist,
        JSON.stringify(hyp_id),
        hyp_rev,
        hyp_conf.toFixed(2),
        JSON.stringify(String(hyp_mode)),
        det.toFixed(2),
        timeState.walkKmh,
        timeState.driveKmh,
        Math.round(wSec),
        Math.round(dSec),
        e[2],
        JSON.stringify(sectors[e[3]]),
        JSON.stringify(rings[r].label),
        isMut,
        dev.site[j]
      ];
      rows.push(row.join(","));
    }
  }

  for (const ss of neigh.sameSite[idx]) {
    const j = ss[0];
    const dist = ss[1];
    const dEff = dist * det;
    const wSec = dEff / walkMps;
    const dSec = dEff / driveMps;
    const row = [
      JSON.stringify(String(dev.code[idx])),
      idx,
      JSON.stringify(dev.desc[idx]),
      JSON.stringify(String(dev.code[j])),
      j,
      JSON.stringify(dev.desc[j]),
      dist,
      JSON.stringify(hyp_id),
      hyp_rev,
      hyp_conf.toFixed(2),
      JSON.stringify(String(hyp_mode)),
      det.toFixed(2),
      timeState.walkKmh,
      timeState.driveKmh,
      Math.round(wSec),
      Math.round(dSec),
      "",
      "",
      JSON.stringify("same_site"),
      0,
      dev.site[j]
    ];
    rows.push(row.join(","));
  }

  return rows;
}

export const exportUtils = {buildDetectionsExportPayload, buildNeighborCsvRows};
