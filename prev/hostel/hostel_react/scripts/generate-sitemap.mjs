#!/usr/bin/env node
/**
 * Build-time sitemap generator.
 * - Fetches all hostels from API
 * - Generates sitemap.xml under public/
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SitemapStream, streamToPromise } from 'sitemap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dotenv if available
try {
  const dotenv = await import('dotenv');
  if (dotenv?.default?.config) dotenv.default.config();
} catch (e) {
  // optional
}

const SITE_URL = process.env.VITE_SITE_URL || 'https://hosttelz.com';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
const HOSTELS_ENDPOINT = '/hq/api/hostels/';

async function fetchHostels() {
  const url = `${API_BASE_URL}${HOSTELS_ENDPOINT}`;
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function hostelPath(h) {
  const slugOrId = `${h.slug || h.uuid || h.id || ''}`.trim();
  if (!slugOrId) return null;
  return `/hostels/${slugOrId}`;
}

async function generate() {
  const smStream = new SitemapStream({ hostname: SITE_URL });

  // Static routes
  const staticPaths = [
    '/',
    '/hostels',
    '/signup',
    '/login',
    '/dashboard',
    '/detailed_search',
    '/student-resources',
    '/campus-guide',
    '/safety-tips',
    '/help-center',
    '/contact-us',
    '/report-issue',
    '/feedback',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/disclaimer',
  ];

  for (const path of staticPaths) {
    smStream.write({ url: path, changefreq: 'weekly', priority: 0.8 });
  }

  const hostels = await fetchHostels();
  for (const h of hostels) {
    const path = hostelPath(h);
    if (!path) continue;
    smStream.write({ url: path, changefreq: 'weekly', priority: 0.7 });
  }

  smStream.end();
  const xml = await streamToPromise(smStream).then((data) => data.toString());

  const outPath = resolve(__dirname, '../public/sitemap.xml');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, xml, 'utf8');

}

await generate();
