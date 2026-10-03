// Descarga el contenido de cualquier WordPress vía REST API y lo guarda en src/data/content.json
// Reutilizable: solo cambia WP_URL. Uso: WP_URL=https://www.sitio.cl npm run sync
import { mkdir, writeFile } from 'node:fs/promises';

const WP = (process.env.WP_URL || 'https://www.municipalidadelbosque.cl').replace(/\/$/, '');
const API = `${WP}/wp-json/wp/v2`;
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (wp-static-sync)' };

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const raw = await res.text();
  // Algunos plugins imprimen avisos tras el JSON: tomamos solo el primer valor.
  return JSON.parse(raw.slice(0, raw.lastIndexOf(raw.trimStart()[0] === '[' ? ']' : '}') + 1));
}

async function fetchAll(endpoint, fields, extra = '') {
  const out = [];
  for (let page = 1; ; page++) {
    let batch;
    try {
      batch = await getJson(`${API}/${endpoint}?per_page=100&page=${page}&_fields=${fields}${extra}`);
    } catch (e) {
      if (page === 1) throw e;
      break; // WP responde 400 al pasar de la última página
    }
    if (!batch.length) break;
    out.push(...batch);
    process.stdout.write(`\r${endpoint}: ${out.length}`);
  }
  console.log();
  return out;
}

const slim = (i) => ({
  id: i.id,
  slug: i.slug,
  path: new URL(i.link).pathname, // conserva la URL exacta → SEO intacto
  title: i.title.rendered,
  html: i.content.rendered,
  excerpt: i.excerpt?.rendered ?? '',
  date: i.date,
  modified: i.modified,
  categories: i.categories ?? [],
  image: i._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
  imageAlt: i._embedded?.['wp:featuredmedia']?.[0]?.alt_text ?? '',
  parent: i.parent ?? 0,
});

const FIELDS = 'id,slug,link,title,content,excerpt,date,modified,categories,featured_media,parent,_links,_embedded';

const [posts, pages, categories] = await Promise.all([
  fetchAll('posts', FIELDS, '&_embed=wp:featuredmedia'),
  fetchAll('pages', FIELDS, '&_embed=wp:featuredmedia'),
  fetchAll('categories', 'id,slug,name,count,link'),
]);

const data = {
  site: await getJson(`${WP}/wp-json/?_fields=name,description`).catch(() => ({ name: 'Sitio', description: '' })),
  syncedAt: new Date().toISOString(),
  categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, count: c.count, path: new URL(c.link).pathname })),
  posts: posts.map(slim),
  pages: pages.map(slim),
};

await mkdir('src/data', { recursive: true });
await writeFile('src/data/content.json', JSON.stringify(data));
console.log(`OK → ${data.posts.length} posts, ${data.pages.length} páginas, ${data.categories.length} categorías`);
