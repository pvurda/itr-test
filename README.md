# Uso

1. Abrir `index.html` via `file://` en el navegador.
2. Si el navegador bloquea recursos locales, iniciar un servidor simple y abrir `http://localhost:8000/index.html`:
   ```bash
   python -m http.server 8000
   ```

> Nota: el repositorio actualmente contiene `mapa_radar_vecinas_v9_detections (1).html`. No se creó ni renombró `index.html` en este cambio.

# Decisiones clave del refactor (sin cambiar comportamiento)

- No se modificó el HTML existente ni sus dependencias externas (CDN). Se preserva el comportamiento observado.
- Se evitó renombrar o mover archivos para no alterar rutas ni contratos de uso actuales.
- El cambio es únicamente documental para clarificar operación y mantener invariantes de ejecución.
