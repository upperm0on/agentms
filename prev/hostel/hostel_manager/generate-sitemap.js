import { writeFileSync } from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

// YOUR live domain (use HTTPS)
const SITE_URL = 'https://yourdomain.com';  // <-- Replace with your domain

// List all your app routes here
const routes = [
  '/',
  '/signup',
  '/hostels'
];

async function generateSitemap() {
  const sitemapStream = new SitemapStream({ hostname: SITE_URL });

  routes.forEach(route => {
    sitemapStream.write({ url: route, changefreq: 'weekly', priority: 0.8 });
  });

  sitemapStream.end();

  const sitemap = await streamToPromise(sitemapStream);

  // Save to public/ so it deploys automatically
  writeFileSync('./public/sitemap.xml', sitemap.toString());
}

generateSitemap();
