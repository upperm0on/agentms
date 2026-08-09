import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SEOOptimizer = ({ children, pageData = {} }) => {
  const location = useLocation();
  const [optimizedContent, setOptimizedContent] = useState('');

  // Generate SEO-optimized content based on current page
  useEffect(() => {
    const optimizeContent = () => {
      const path = location.pathname;
      let content = '';

      // Page-specific content optimization
      if (path === '/') {
        content = `
          <h1>Book Affordable Hostels in Ghana - Hosttelz</h1>
          <p>Find and book the best hostels across Ghana with Hosttelz. 
          Our platform connects students and travelers with safe, affordable, 
          and comfortable accommodation options.</p>
          
          <h2>Why Choose Hosttelz for Hostel Booking?</h2>
          <ul>
            <li>Verified and safe hostels across Ghana</li>
            <li>Easy online booking and payment</li>
            <li>24/7 customer support</li>
            <li>Best prices guaranteed</li>
            <li>Student-friendly accommodation</li>
          </ul>
          
          <h2>Popular Hostel Locations in Ghana</h2>
          <p>Discover hostels in major cities including Accra, Kumasi, Cape Coast, 
          and Tamale. Each location offers unique experiences and affordable 
          accommodation options.</p>
        `;
      } else if (path.startsWith('/hostels/')) {
        const hostel = pageData.hostel;
        if (hostel) {
          content = `
            <h1>${hostel.name} - Book Now on Hosttelz</h1>
            <p>${hostel.description || hostel.short_description}</p>
            
            <h2>Hostel Details</h2>
            <p>Location: ${hostel.campus || 'Ghana'}</p>
            <p>Price Range: $${hostel.min_price || 0}${hostel.max_price ? ` - $${hostel.max_price}` : ''}</p>
            ${hostel.amenities ? `<p>Amenities: ${hostel.amenities.join(', ')}</p>` : ''}
            
            <h2>Why Book ${hostel.name}?</h2>
            <p>Experience comfortable and affordable accommodation at ${hostel.name}. 
            Perfect for students and travelers looking for quality hostel accommodation 
            in ${hostel.campus || 'Ghana'}.</p>
          `;
        }
      } else if (path === '/search') {
        const query = new URLSearchParams(location.search).get('q') || '';
        const location_param = new URLSearchParams(location.search).get('location') || '';
        
        content = `
          <h1>Search Results for Hostels${query ? `: ${query}` : ''}${location_param ? ` in ${location_param}` : ''}</h1>
          <p>Find the perfect hostel for your stay in Ghana. 
          ${query ? `Searching for "${query}"` : 'Browse our selection of verified hostels'} 
          ${location_param ? `in ${location_param}` : 'across Ghana'}.</p>
          
          <h2>Hostel Search Tips</h2>
          <ul>
            <li>Use specific location names for better results</li>
            <li>Filter by price range to find affordable options</li>
            <li>Check amenities that matter to you</li>
            <li>Read reviews from previous guests</li>
          </ul>
        `;
      }

      setOptimizedContent(content);
    };

    optimizeContent();
  }, [location, pageData]);

  // Generate meta tags for current page
  const generatePageMeta = () => {
    const path = location.pathname;
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
          keywords: `hostel ${hostel.name}, ${hostel.campus} hostel, ${hostel.name} booking, affordable accommodation ${hostel.campus}, hostel Ghana`
        };
      }
    } else if (path === '/search') {
      const query = new URLSearchParams(location.search).get('q') || '';
      const location_param = new URLSearchParams(location.search).get('location') || '';
      
      meta = {
        title: `Search Hostels${query ? `: ${query}` : ''}${location_param ? ` in ${location_param}` : ''} | Hosttelz`,
        description: `Find hostels${query ? ` matching "${query}"` : ''}${location_param ? ` in ${location_param}` : ' across Ghana'}. Book affordable accommodation with Hosttelz.`,
        keywords: `hostel search${query ? ` ${query}` : ''}${location_param ? ` ${location_param}` : ''}, hostel booking Ghana, affordable hostels`
      };
    }

    return meta;
  };

  const pageMeta = generatePageMeta();

  // Update document head using useEffect
  React.useEffect(() => {
    // Update title
    document.title = pageMeta.title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = pageMeta.description;
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = pageMeta.keywords;
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://hosttelz.com${location.pathname}`;
    
    // Update Open Graph meta tags
    const ogTags = [
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: pageMeta.title },
      { property: 'og:description', content: pageMeta.description },
      { property: 'og:url', content: `https://hosttelz.com${location.pathname}` },
      { property: 'og:site_name', content: 'Hosttelz' },
      { property: 'og:image', content: 'https://hosttelz.com/images/hosttelz-banner.jpg' }
    ];
    
    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content;
    });
    
    // Update Twitter meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageMeta.title },
      { name: 'twitter:description', content: pageMeta.description },
      { name: 'twitter:image', content: 'https://hosttelz.com/images/hosttelz-banner.jpg' }
    ];
    
    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = tag.name;
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content;
    });
    
    // Add structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hosttelz',
      url: 'https://hosttelz.com',
      description: 'Leading hostel booking platform in Ghana',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://hosttelz.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }, null, 2);
    
  }, [pageMeta, location.pathname]);

  return (
    <>
      {/* SEO-optimized content */}
      
      {/* SEO-optimized content */}
      {optimizedContent && (
        <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: optimizedContent }} />
      )}
      
      {children}
    </>
  );
};

export default SEOOptimizer;
