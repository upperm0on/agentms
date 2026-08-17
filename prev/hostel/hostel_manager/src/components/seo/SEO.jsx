import { useEffect } from 'react';
import { CANONICAL_URL, OG_IMAGE_URL, DEFAULT_META, SITE_URL } from '../../config/site';

function setMetaTag(name, content, attr = 'name') {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SEO({
  title = DEFAULT_META.title,
  description = DEFAULT_META.description,
  keywords = DEFAULT_META.keywords,
  canonical = CANONICAL_URL,
  ogImage = OG_IMAGE_URL,
  url = SITE_URL,
}) {
  useEffect(() => {
    if (title) document.title = title;

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    setLinkTag('canonical', canonical);

    // Open Graph
    setMetaTag('og:type', 'website', 'property');
    setMetaTag('og:url', url, 'property');
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:image', ogImage, 'property');

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
  }, [title, description, keywords, canonical, ogImage, url]);

  return null;
}
