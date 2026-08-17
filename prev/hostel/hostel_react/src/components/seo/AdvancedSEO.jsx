import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const AdvancedSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  url,
  structuredData,
  breadcrumbs,
  faqs,
  hostel,
  pageType = 'website'
}) => {
  // Generate comprehensive meta tags
  const generateMetaTags = () => {
    const baseTitle = title || 'Hosttelz | Book Affordable Hostels in Ghana';
    const baseDescription = description || 'Find and book affordable hostels across Ghana. Trusted platform for students and travelers. Safe, secure, and easy booking.';
    const baseKeywords = keywords || 'hostel booking Ghana, affordable hostels, student accommodation, hostel management, Ghana hostels, hostel reservation';

    return {
      title: baseTitle,
      description: baseDescription,
      keywords: baseKeywords,
      canonical: canonical || window.location.href,
      ogImage: ogImage || 'https://hosttelz.com/images/hosttelz-banner.jpg',
      url: url || window.location.href
    };
  };

  // Generate structured data based on page type
  const generateStructuredData = () => {
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
  const generateBreadcrumbData = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

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
  const generateFAQData = () => {
    if (!faqs || faqs.length === 0) return null;

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

  const metaTags = generateMetaTags();
  const structuredData = structuredData || generateStructuredData();
  const breadcrumbData = generateBreadcrumbData();
  const faqData = generateFAQData();

  // Combine all structured data
  const allStructuredData = [structuredData, breadcrumbData, faqData].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={metaTags.canonical} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTags.title} />
      <meta property="og:description" content={metaTags.description} />
      <meta property="og:url" content={metaTags.url} />
      <meta property="og:site_name" content="Hosttelz" />
      <meta property="og:image" content={metaTags.ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTags.title} />
      <meta name="twitter:description" content={metaTags.description} />
      <meta name="twitter:image" content={metaTags.ogImage} />
      <meta name="twitter:site" content="@hosttelz" />
      
      {/* Additional SEO */}
      <link rel="alternate" hrefLang="en" href="https://hosttelz.com/" />
      <link rel="alternate" hrefLang="en-gh" href="https://hosttelz.com/" />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data, null, 2)}
        </script>
      ))}
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//api.hosttelz.com" />
      <link rel="dns-prefetch" href="//images.hosttelz.com" />
    </Helmet>
  );
};

export default AdvancedSEO;
