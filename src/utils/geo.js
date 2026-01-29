(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.geoUtils = api;
    root.destinationPoint = api.destinationPoint;
    root.bearingBetween = api.bearingBetween;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function destinationPoint(lat, lon, distM, bearingDeg) {
    const R = 6371000.0;
    const brng = bearingDeg * Math.PI / 180.0;
    const lat1 = lat * Math.PI / 180.0;
    const lon1 = lon * Math.PI / 180.0;
    const dr = distM / R;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dr) * Math.cos(lat1), Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2));
    return {lat: lat2 * 180 / Math.PI, lon: lon2 * 180 / Math.PI};
  }

  function bearingBetween(lat1, lon1, lat2, lon2){
    const φ1 = lat1 * Math.PI / 180.0;
    const φ2 = lat2 * Math.PI / 180.0;
    const Δλ = (lon2 - lon1) * Math.PI / 180.0;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x) * 180.0 / Math.PI;
    θ = (θ + 360.0) % 360.0;
    return θ;
  }

  return {destinationPoint, bearingBetween};
});
