import data from '../data/content.json';

export type Item = (typeof data.posts)[number];

export const site = data.site;
export const categories = data.categories;
export const posts: Item[] = [...data.posts].sort((a, b) => b.date.localeCompare(a.date));
export const pages: Item[] = data.pages;

export const catBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const postsInCategory = (slug: string) => {
  const c = catBySlug(slug);
  return c ? posts.filter((p) => p.categories.includes(c.id)) : [];
};

/** Texto plano para extractos. */
export const plain = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/\s+/g, ' ').trim();

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Limpia el HTML que deja Divi: quita clases et_pb_*, estilos y scripts incrustados,
 * convierte enlaces internos del WP original en relativos y desenvuelve divs vacíos.
 * Para noticias (texto, imágenes, iframes) el resultado queda limpio; las páginas
 * armadas con el builder se deben rehacer como componentes.
 */
export function cleanHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s(class|style|data-[\w-]+|id)="[^"]*"/gi, (m) => (/^\s(class|id)="[^"]*(wp-|align|has-)/i.test(m) ? m : ''))
    .replace(/https?:\/\/(www\.)?municipalidadelbosque\.cl\/(?!wp-content)/gi, '/')
    .replace(/<div>\s*<\/div>/gi, '')
    .replace(/<img /gi, '<img loading="lazy" decoding="async" ');
}

export const isDivi = (html: string) => /et_pb_|et-l--/.test(html);
