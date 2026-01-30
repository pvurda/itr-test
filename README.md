# Uso

1. Abrir `index.html` via `file://` en el navegador.
2. Si el navegador bloquea recursos locales, iniciar un servidor simple y abrir `http://localhost:8000/index.html` (puerto por defecto `8000`):
   ```bash
   npm run serve
   ```
   Para usar otro puerto:
   ```bash
   PORT=9000 npm run serve
   ```
   o usando argumento:
   ```bash
   npm run serve -- 9000
   ```
3. Validar el entrypoint con `npm run check:syntax`.

Nota: `node -e import(...)` no es el check recomendado porque ejecuta el módulo.

# Decisiones clave del refactor (sin cambiar comportamiento)

- `index.html` queda controlado por el repo y carga el entrypoint `src/app/entrypoint.js`.
- El contenedor del mapa usa el ID estable `map` (sin IDs generados).
- Se elimina la dependencia de HTML generado por Folium para evitar regeneración de IDs.
