import { useEffect } from 'react';
import SEO from './SEO';
import { SITE_URL } from '../../config/site';

function upsertJsonLd(id, data) {
  const scriptId = id || 'jsonld-hostel';
  let el = document.getElementById(scriptId);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = scriptId;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 2);
}

export default function HostelSEO({ hostel }) {
  if (!hostel) return null;

  const name = hostel.name || 'Hostel';
  const description = hostel.description || hostel.short_description || `Book ${name} with Hosttelz. Affordable, convenient, and secure.`;
  const image = hostel.image ? (hostel.image.startsWith('http') ? hostel.image : `${SITE_URL}/${hostel.image.replace(/^\//, '')}`) : undefined;
  const keywords = [
    'hostel booking',
    'affordable hostels',
    'hostel management',
    'student housing',
    'guest check-in',
    'hostels in Ghana',
    'hostel reservation platform',
    name
  ].join(', ');
  const idOrSlug = hostel.slug || hostel.uuid || hostel.id;
  const url = idOrSlug ? `${SITE_URL}/hostels/${idOrSlug}` : SITE_URL;

  useEffect(() => {
    const address = hostel.address || hostel.location || '';
    const priceRange = hostel.priceRange || hostel.price_range || hostel.min_price ? `$${hostel.min_price}${hostel.max_price ? ` - $${hostel.max_price}` : ''}` : undefined;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Hostel',
      name,
      description,
      image: image ? [image] : undefined,
      address: address || undefined,
      priceRange: priceRange || undefined,
      url,
      aggregateRating: hostel.aggregateRating || hostel.ratings ? {
        '@type': 'AggregateRating',
        ratingValue: hostel.aggregateRating?.ratingValue || hostel.ratings,
        reviewCount: hostel.aggregateRating?.reviewCount || hostel.reviewCount || 0
      } : undefined
    };

    upsertJsonLd('jsonld-hostel', jsonLd);
  }, [hostel, name, description, image, url]);

  return (
    <SEO
      title={`${name} | Book Affordable Stay with Hosttelz`}
      description={description}
      keywords={keywords}
      canonical={url}
      ogImage={image}
      url={url}
    />
  );
}
