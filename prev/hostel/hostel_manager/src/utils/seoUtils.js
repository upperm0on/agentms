/**
 * Advanced SEO utilities for the hostel management system
 */

// Generate comprehensive meta tags for any page
export const generateMetaTags = (pageData = {}) => {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage,
    url,
    hostel,
    pageType = 'website'
  } = pageData;

  const baseTitle = title || 'Hosttelz | Book Affordable Hostels in Ghana';
  const baseDescription = description || 'Find and book affordable hostels across Ghana. Trusted platform for students and travelers. Safe, secure, and easy booking process.';
  const baseKeywords = keywords || 'hostel booking Ghana, affordable hostels, student accommodation, hostel management, Ghana hostels, hostel reservation, student housing';

  let finalTitle = baseTitle;
  let finalDescription = baseDescription;
  let finalKeywords = baseKeywords;

  // Hostel-specific optimization
  if (hostel) {
    finalTitle = `${hostel.name} | Book Now on Hosttelz - ${hostel.campus || 'Ghana'}`;
    finalDescription = `Book ${hostel.name} for affordable accommodation in ${hostel.campus || 'Ghana'}. ${hostel.description || hostel.short_description || 'Safe and comfortable hostel accommodation.'}`;
    finalKeywords = `hostel ${hostel.name}, ${hostel.campus} hostel, ${hostel.name} booking, affordable accommodation ${hostel.campus}, hostel Ghana, ${hostel.campus} hostels`;
  }

  // Page type specific optimization
  if (pageType === 'search') {
    finalTitle = 'Search Hostels | Find Affordable Accommodation - Hosttelz';
    finalDescription = 'Search and find the perfect hostel for your stay in Ghana. Browse our verified hostels with easy booking and secure payments.';
    finalKeywords = 'hostel search Ghana, find hostels, hostel booking, accommodation search, Ghana hostels';
  } else if (pageType === 'booking') {
    finalTitle = 'Book Hostel | Secure Online Booking - Hosttelz';
    finalDescription = 'Book your hostel accommodation securely online. Easy payment options and instant confirmation for your stay in Ghana.';
    finalKeywords = 'book hostel, hostel booking, online booking, secure payment, hostel reservation';
  }

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords,
    canonical: canonical || window.location.href,
    ogImage: ogImage || 'https://hosttelz.com/images/hosttelz-banner.jpg',
    url: url || window.location.href
  };
};

// Generate structured data for different page types
export const generateStructuredData = (pageData = {}) => {
  const { hostel, pageType, breadcrumbs, faqs } = pageData;

  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hosttelz',
    url: 'https://hosttelz.com',
    logo: 'https://hosttelz.com/images/logo.png',
    description: 'Leading hostel booking and management platform in Ghana',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GH',
      addressRegion: 'Greater Accra'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+233-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'French']
    },
    sameAs: [
      'https://facebook.com/hosttelz',
      'https://twitter.com/hosttelz',
      'https://instagram.com/hosttelz'
    ]
  };

  if (hostel) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Hostel',
      name: hostel.name,
      description: hostel.description || hostel.short_description,
      url: `https://hosttelz.com/hostels/${hostel.slug || hostel.id}/`,
      image: hostel.image?.startsWith('http') ? hostel.image : `https://hosttelz.com${hostel.image}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: hostel.address || '',
        addressLocality: hostel.campus || '',
        addressCountry: 'GH'
      },
      telephone: hostel.contact_number || '',
      priceRange: hostel.min_price ? `$${hostel.min_price}${hostel.max_price ? `-$${hostel.max_price}` : ''}` : undefined,
      amenityFeature: hostel.amenities?.map(amenity => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity
      })) || [],
      aggregateRating: hostel.ratings ? {
        '@type': 'AggregateRating',
        ratingValue: hostel.ratings,
        reviewCount: hostel.review_count || 0
      } : undefined
    };
  }

  if (pageType === 'search') {
    return {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      name: 'Hostel Search Results',
      description: 'Search results for hostels in Ghana',
      url: window.location.href
    };
  }

  return baseData;
};

// Generate breadcrumb structured data
export const generateBreadcrumbData = (breadcrumbs = []) => {
  if (breadcrumbs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};

// Generate FAQ structured data
export const generateFAQData = (faqs = []) => {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

// Generate sitemap data
export const generateSitemapData = (hostels = []) => {
  const basePages = [
    {
      url: '/',
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/hostels/',
      priority: 0.9,
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/search/',
      priority: 0.8,
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/about/',
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/contact/',
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];

  const hostelPages = hostels.map(hostel => ({
    url: `/hostels/${hostel.slug || hostel.id}/`,
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: hostel.updated_at ? new Date(hostel.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }));

  return [...basePages, ...hostelPages];
};

// Generate robots.txt content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Allow: /hostels/
Allow: /search/
Disallow: /admin/
Disallow: /api/private/

Sitemap: https://hosttelz.com/sitemap.xml
Sitemap: https://hosttelz.com/sitemap-hostels.xml`;
};

// Optimize content for SEO
export const optimizeContentForSEO = (content, keywords = []) => {
  if (!content) return content;

  let optimizedContent = content;

  // Add keywords naturally
  keywords.forEach(keyword => {
    if (keyword && !optimizedContent.toLowerCase().includes(keyword.toLowerCase())) {
      // Add keyword in a natural way
      optimizedContent = optimizedContent.replace(
        /(hostel|accommodation|booking)/gi,
        `${keyword} $1`,
        1
      );
    }
  });

  // Ensure proper heading structure
  if (!/<h[1-6]/.test(optimizedContent)) {
    optimizedContent = `<h2>About This Hostel</h2>${optimizedContent}`;
  }

  return optimizedContent;
};

// Generate location-based keywords
export const generateLocationKeywords = (location) => {
  if (!location) return [];

  const baseKeywords = [
    'hostel booking',
    'affordable hostels',
    'student accommodation',
    'hostel management'
  ];

  const locationKeywords = [
    `${location} hostels`,
    `hostels in ${location}`,
    `${location} accommodation`,
    `${location} student housing`
  ];

  return [...baseKeywords, ...locationKeywords];
};

// Generate hostel-specific keywords
export const generateHostelKeywords = (hostel) => {
  if (!hostel) return [];

  const baseKeywords = [
    'hostel booking',
    'affordable hostels',
    'student accommodation'
  ];

  const hostelKeywords = [
    hostel.name,
    `${hostel.name} booking`,
    `${hostel.name} hostel`,
    `${hostel.campus} hostels`,
    `hostels in ${hostel.campus}`,
    `${hostel.campus} accommodation`
  ];

  if (hostel.amenities) {
    hostelKeywords.push(...hostel.amenities.map(amenity => `${amenity} hostel`));
  }

  return [...baseKeywords, ...hostelKeywords];
};

// Generate page-specific meta tags
export const generatePageMeta = (pathname, searchParams = {}, pageData = {}) => {
  const path = pathname;
  const query = searchParams.q || '';
  const location = searchParams.location || '';

  let meta = {
    title: 'Hosttelz | Book Affordable Hostels in Ghana',
    description: 'Find and book affordable hostels across Ghana. Trusted platform for students and travelers.',
    keywords: 'hostel booking Ghana, affordable hostels, student accommodation, Ghana hostels'
  };

  if (path === '/') {
    meta = {
      title: 'Hosttelz | Book Affordable Hostels in Ghana - Student Accommodation',
      description: 'Find and book affordable hostels across Ghana. Trusted platform for students and travelers. Safe, secure, and easy booking process.',
      keywords: 'hostel booking Ghana, affordable hostels, student accommodation, hostel management, Ghana hostels, hostel reservation, student housing'
    };
  } else if (path.startsWith('/hostels/')) {
    const hostel = pageData.hostel;
    if (hostel) {
      meta = {
        title: `${hostel.name} | Book Now on Hosttelz - ${hostel.campus || 'Ghana'}`,
        description: `Book ${hostel.name} for affordable accommodation in ${hostel.campus || 'Ghana'}. ${hostel.description || hostel.short_description || 'Safe and comfortable hostel accommodation.'}`,
        keywords: generateHostelKeywords(hostel).join(', ')
      };
    }
  } else if (path === '/search') {
    meta = {
      title: `Search Hostels${query ? `: ${query}` : ''}${location ? ` in ${location}` : ''} | Hosttelz`,
      description: `Find hostels${query ? ` matching "${query}"` : ''}${location ? ` in ${location}` : ' across Ghana'}. Book affordable accommodation with Hosttelz.`,
      keywords: generateLocationKeywords(location).join(', ')
    };
  }

  return meta;
};
