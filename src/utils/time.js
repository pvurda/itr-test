(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.timeUtils = api;
    root.kmhToMps = api.kmhToMps;
    root.fmtTimeSeconds = api.fmtTimeSeconds;
    root.fmtMMSS = api.fmtMMSS;
    root.fmtSignedDelta = api.fmtSignedDelta;
    root.fmtHHMMSS = api.fmtHHMMSS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function kmhToMps(kmh){ return (kmh * 1000.0) / 3600.0; }

  function fmtTimeSeconds(sec) {
    if (!isFinite(sec) || sec < 0) return "—";
    if (sec < 60) return `${Math.round(sec)}s`;
    const min = sec / 60.0;
    if (min < 10) return `${min.toFixed(1)}m`;
    return `${Math.round(min)}m`;
  }

  function fmtHHMMSS(d){
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
  }

  function fmtMMSS(sec){
    if (!isFinite(sec) || sec < 0) return "—";
    const s = Math.round(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  }

  function fmtSignedDelta(sec){
    if (!isFinite(sec)) return "—";
    const s = Math.round(sec);
    if (Math.abs(s) < 1) return "±0s";
    const sign = (s < 0) ? "−" : "+";
    const a = Math.abs(s);
    if (a < 60) return `${sign}${a}s`;
    const m = Math.floor(a / 60);
    const r = a % 60;
    return `${sign}${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  }

  return {kmhToMps, fmtTimeSeconds, fmtMMSS, fmtSignedDelta, fmtHHMMSS};
});
