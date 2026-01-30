export function initMap(options){
  if (!options || !options.L) {
    throw new Error("initMap requires a Leaflet instance");
  }
  const L = options.L;
  const map = L.map(options.mapId, {
    center: options.center,
    crs: options.crs || L.CRS.EPSG3857,
    zoom: options.zoom,
    zoomControl: options.zoomControl !== false,
    preferCanvas: !!options.preferCanvas,
  });
  if (options.scaleControl !== false) {
    L.control.scale().addTo(map);
  }
  if (options.tileUrl) {
    L.tileLayer(options.tileUrl, options.tileOptions || {}).addTo(map);
  }
  const renderers = {
    canvas: L.canvas({padding: 0.5}),
    svg: L.svg(),
  };
  const layers = {
    markerLayer: L.layerGroup().addTo(map),
    circleLayer: L.layerGroup().addTo(map),
    labelLayer: L.layerGroup().addTo(map),
    pulseLayer: L.layerGroup().addTo(map),
    eventLayer: L.layerGroup().addTo(map),
    eventCircleLayer: L.layerGroup().addTo(map),
    eventLabelLayer: L.layerGroup().addTo(map),
    eventCamLayer: L.layerGroup().addTo(map),
    detLayer: L.layerGroup().addTo(map),
  };
  return {map, layers, renderers};
}

export function addMarkers(options){
  const L = options.L;
  const dev = options.dev;
  const markerLayer = options.layers.markerLayer;
  const styleDefault = options.styleDefault;
  const tooltipFormatter = options.tooltipFormatter;
  const onSelect = options.onSelect;
  const onHover = options.onHover;
  const onHoverOut = options.onHoverOut;
  const markers = options.markers || new Array(dev.lat.length);

  for (let i = 0; i < dev.lat.length; i++) {
    const m = L.circleMarker([dev.lat[i], dev.lon[i]], styleDefault()).addTo(markerLayer);
    if (tooltipFormatter) {
      m.bindTooltip(tooltipFormatter(i), {sticky: true, direction: "top", opacity: 0.95});
    }
    if (onSelect) m.on("click", () => onSelect(i));
    if (onHover) m.on("mouseover", () => onHover(i));
    if (onHoverOut) m.on("mouseout", () => onHoverOut(i));
    markers[i] = m;
  }

  return markers;
}

export function setHighlight(options){
  const markers = options.markers;
  const styles = options.styles;
  const state = options.state;
  const neigh = options.neigh;
  const skipTooltip = !!options.skipTooltip;

  if (state.selected === null) {
    for (let i = 0; i < markers.length; i++) markers[i].setStyle(styles.default());
    return;
  }

  const rr = neigh.rings[state.selected];
  const baseStyle = state.onlyNeighbors ? styles.hidden() : styles.dim();

  for (let i = 0; i < markers.length; i++) markers[i].setStyle(baseStyle);
  markers[state.selected].setStyle(styles.selected());

  const isNeighborAllowed = (nidx, ringIdx) => {
    if (state.ringFilter !== "ALL" && ringIdx !== state.ringFilter) return false;
    if (state.onlyMutual && state.mutualSet && !state.mutualSet.has(nidx)) return false;
    return true;
  };

  for (let r = 0; r < 5; r++) {
    for (const e of rr[r]) {
      const nidx = e[0];
      if (!isNeighborAllowed(nidx, r)) continue;
      markers[nidx].setStyle(styles.ring(r));
    }
  }
  if (styles.sameSite) {
    for (const ss of neigh.sameSite[state.selected]) {
      const j = ss[0];
      markers[j].setStyle(styles.sameSite());
    }
  }
  if (state.hovered !== null && state.hovered !== state.selected) {
    markers[state.hovered].setStyle(styles.hover());
    if (!skipTooltip) {
      try { markers[state.hovered].openTooltip(); } catch (e) {}
    }
  }
}

export function drawIsochrones(options){
  const L = options.L;
  const layers = options.layers;
  const origin = options.origin;
  const radii = options.radii || [];
  const destinationPoint = options.destinationPoint;
  const circleStyle = options.circleStyle || {};
  const labelFormatter = options.labelFormatter;

  layers.circleLayer.clearLayers();
  layers.labelLayer.clearLayers();
  if (!origin) return;

  radii.forEach((r) => {
    L.circle([origin.lat, origin.lon], Object.assign({radius: r}, circleStyle)).addTo(layers.circleLayer);
    if (destinationPoint && labelFormatter) {
      const p = destinationPoint(origin.lat, origin.lon, r, 90);
      const icon = L.divIcon({className: "", html: `<div class="circle-label">${labelFormatter(r)}</div>`, iconSize: [0, 0]});
      L.marker([p.lat, p.lon], {icon, interactive: false}).addTo(layers.labelLayer);
    }
  });
}

export function drawEventRings(options){
  const L = options.L;
  const layers = options.layers;
  const ev = options.ev;
  const anchor = options.anchor;
  const dtAnchorSec = options.dtAnchorSec;
  const fmtHHMMSS = options.fmtHHMMSS;
  const fmtTimeSeconds = options.fmtTimeSeconds;
  const destinationPoint = options.destinationPoint;
  const getEventDetour = options.getEventDetour;
  const getEventSpeedMps = options.getEventSpeedMps;
  const colors = options.colors || {};
  const nowMs = options.nowMs || Date.now();

  layers.eventLayer.clearLayers();
  layers.eventCircleLayer.clearLayers();
  layers.eventLabelLayer.clearLayers();
  if (!ev.active) return {metaText: null, rNow: null};

  const det = getEventDetour();
  const v = getEventSpeedMps();
  const color = (ev.target === "vehicle") ? colors.amber : colors.accent;

  const dtEventSec = (ev.t0ms !== null) ? Math.max(0, (nowMs - ev.t0ms) / 1000.0) : 0;

  const latE = ev.lat;
  const lonE = ev.lon;

  const hasAnchor = anchor && isFinite(anchor.lat) && isFinite(anchor.lon) && isFinite(anchor.tms);

  if (anchor && anchor.source === "event"){
    const m0 = L.circleMarker([latE, lonE], {renderer: options.renderers.svg, radius: 7.0, color: color, weight: 2, fillColor: "#000", fillOpacity: 0.38, opacity: 0.95}).addTo(layers.eventLayer);
    m0.bindTooltip(`EVENTO ${ev.id} · ${(ev.target === "vehicle") ? "AUTO" : "PERSONA"} · T0 ${fmtHHMMSS(new Date(ev.t0ms))}`, {sticky: true, direction: "top", opacity: 0.95});
  } else {
    const m0 = L.circleMarker([latE, lonE], {renderer: options.renderers.svg, radius: 6.2, color: "rgba(234,255,246,0.55)", weight: 2, fillColor: "#000", fillOpacity: 0.18, opacity: 0.70}).addTo(layers.eventLayer);
    m0.bindTooltip(`EVENTO ${ev.id} · T0 ${fmtHHMMSS(new Date(ev.t0ms))}`, {sticky: true, direction: "top", opacity: 0.95});
  }

  let lat0 = latE, lon0 = lonE;
  let anchorLab = "EVENT";
  let anchorTime = (ev.t0ms !== null) ? fmtHHMMSS(new Date(ev.t0ms)) : "—";

  if (hasAnchor){
    lat0 = anchor.lat;
    lon0 = anchor.lon;
    anchorTime = fmtHHMMSS(new Date(anchor.tms));
    if (anchor.source === "det"){
      const camTxt = anchor.camCode ? `ID ${anchor.camCode}` : "CAM";
      anchorLab = `LAST ${camTxt}`;
      const mA = L.circleMarker([lat0, lon0], {renderer: options.renderers.svg, radius: 8.0, color: color, weight: 3, fillColor: "#000", fillOpacity: 0.45, opacity: 0.98}).addTo(layers.eventLayer);
      mA.bindTooltip(`ÚLTIMA DETECCIÓN ${anchor.detId || ""} · ${camTxt} · ${anchorTime}`, {sticky: true, direction: "top", opacity: 0.95});
      try {
        L.polyline([[latE, lonE], [lat0, lon0]], {color: "rgba(234,255,246,0.25)", weight: 1, opacity: 0.55, dashArray: "4 6", interactive: false}).addTo(layers.eventLabelLayer);
      } catch (e) {}
    } else {
      anchorLab = "EVENT";
    }
  }

  const rNow = Math.max(0, v * dtAnchorSec / det);
  L.circle([lat0, lon0], {radius: rNow, color: color, weight: 2, fillColor: color, fillOpacity: 0.06, opacity: 0.85, interactive: false}).addTo(layers.eventCircleLayer);
  const pNow = destinationPoint(lat0, lon0, rNow, 90);
  const iconNow = L.divIcon({className: "", html: `<div class="circle-label" style="border-color:${color}; color:${color};">${anchorLab} · ΔA +${fmtTimeSeconds(dtAnchorSec)}</div>`, iconSize: [0, 0]});
  L.marker([pNow.lat, pNow.lon], {icon: iconNow, interactive: false}).addTo(layers.eventLabelLayer);

  const baseTicks = (ev.target === "vehicle") ? [30, 60, 120, 180, 300, 480, 600, 900, 1200] : [60, 120, 240, 360, 600, 900, 1200, 1800];
  const maxTick = Math.min(3600, Math.max(600, dtAnchorSec + ev.horizonSec));
  const ticks = baseTicks.filter((t) => t <= maxTick);

  const list = [];
  for (const tSec of ticks) {
    const r = v * tSec / det;
    const p = destinationPoint(lat0, lon0, r, 90);
    const tag = fmtTimeSeconds(tSec);
    const dt = tSec - dtAnchorSec;
    const cls = (dt < 0) ? "past" : ((dt > 0) ? "next" : "now");
    const lab = `${tag} · ΔA ${fmtTimeSeconds(Math.abs(dt))}${dt < 0 ? " (past)" : ""}`;
    list.push({r, p, lab, cls});
  }

  list.forEach((row) => {
    L.circle([lat0, lon0], {radius: row.r, color: color, weight: 1, fillColor: color, fillOpacity: 0.03, opacity: 0.55, interactive: false}).addTo(layers.eventCircleLayer);
    const icon = L.divIcon({className: "", html: `<div class="circle-label ${row.cls}" style="border-color:${color}; color:${color};">${row.lab}</div>`, iconSize: [0, 0]});
    L.marker([row.p.lat, row.p.lon], {icon, interactive: false}).addTo(layers.eventLabelLayer);
  });

  const metaText = `${(ev.target === "vehicle") ? "AUTO" : "PERSONA"} · T0 ${fmtHHMMSS(new Date(ev.t0ms))} · NOW ${fmtHHMMSS(new Date(nowMs))} · Δt +${fmtTimeSeconds(dtEventSec)} · ΔA +${fmtTimeSeconds(dtAnchorSec)}`;
  return {metaText, rNow};
}

export function setPulse(options){
  const L = options.L;
  const layers = options.layers;
  const renderers = options.renderers;
  const position = options.position;
  const style = options.style || {};

  layers.pulseLayer.clearLayers();
  if (!position) return;
  L.circleMarker([position.lat, position.lon], Object.assign({renderer: renderers.svg}, style)).addTo(layers.pulseLayer);
}
