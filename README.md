# el-bosque-astro

Prototipo estático de municipalidadelbosque.cl: WordPress sigue como CMS (headless) y Astro genera el sitio.
Mantiene **las mismas URLs** que WordPress (la ruta sale del `link` de cada entrada), así no se pierde SEO.

## Uso

```bash
npm install
npm run sync      # descarga posts/páginas/categorías desde WP_URL → src/data/content.json
npm run build     # genera dist/ (≈3 s para 1.284 páginas)
npm run dev       # servidor local
```

Para otro cliente cambia solo `WP_URL`:

```bash
WP_URL=https://otro-sitio.cl npm run sync
```

(y ajusta `site` en `astro.config.mjs`, el menú en `src/layouts/Base.astro` y los colores en `src/styles/global.css`).

## Deploy en Cloudflare Pages

- Framework preset: **Astro** · Build command: `npm run sync && npm run build` · Output: `dist`
- Variable de entorno: `WP_URL=https://cms.tudominio.cl` (WordPress movido a un subdominio)
- Node 22 (`NODE_VERSION=22`)

### Rebuild automático al publicar

1. Pages → Settings → Builds → **Deploy hooks** → crear hook (da una URL).
2. En n8n: Webhook/WordPress Trigger (post publicado o actualizado) → HTTP Request `POST` a la URL del hook.
   Conviene un *debounce* de 1–2 min para agrupar ediciones seguidas.

## Qué falta (pendiente)

- Páginas armadas con Divi (≈47 % de las páginas): el HTML se limpia, pero el layout hay que rehacerlo como componentes Astro. Se marcan con un aviso amarillo en el prototipo.
- Menú: la API no entrega `menu-items` sin autenticación (401); está escrito a mano en `Base.astro`. Con una Application Password se puede leer desde WP.
- Imágenes: siguen apuntando a `wp-content/uploads` del WordPress original. Siguiente paso: pasarlas a R2/Cloudflare Images.
- Tablas Ninja Tables (4 páginas): el HTML llega estático; se pierde ordenar/buscar. Reemplazar por un componente con filtro simple o Pagefind.
- Formularios, búsqueda y notificaciones push: no incluidos.
