# Uso

1. Abrir `index.html` via `file://` en el navegador.
2. Si el navegador bloquea recursos locales, iniciar un servidor simple y abrir `http://localhost:8000/index.html`:
   ```bash
   python -m http.server 8000
   ```

# Decisiones clave del refactor (sin cambiar comportamiento)

- `index.html` queda controlado por el repo y carga el entrypoint `src/app/entrypoint.js`.
- El contenedor del mapa usa el ID estable `map` (sin IDs generados).
- Se elimina la dependencia de HTML generado por Folium para evitar regeneración de IDs.
