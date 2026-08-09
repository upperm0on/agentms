import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const AdminSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  url,
  pageType = 'admin_dashboard'
}) => {
  // Generate comprehensive meta tags for admin pages
  const generateMetaTags = () => {
    const baseTitle = title || 'Hosttelz Admin | System Administration Dashboard';
    const baseDescription = description || 'Comprehensive system administration for Hosttelz platform. Manage users, hostels, and system-wide analytics with advanced admin tools.';
    const baseKeywords = keywords || 'system administration, platform management, user management, hostel oversight, system analytics, admin dashboard';

    let finalTitle = baseTitle;
    let finalDescription = baseDescription;
    let finalKeywords = baseKeywords;

    // Page type specific optimization
    if (pageType === 'users') {
      finalTitle = 'User Management | System Administration - Hosttelz Admin';
      finalDescription = 'Manage all users across the Hosttelz platform. Monitor user activity, manage permissions, and ensure platform security.';
      finalKeywords = 'user management, system administration, user monitoring, permission management, platform security';
    } else if (pageType === 'hostels') {
      finalTitle = 'Hostel Management | Platform Oversight - Hosttelz Admin';
      finalDescription = 'Oversee all hostels on the platform. Monitor hostel performance, manage listings, and ensure quality standards.';
      finalKeywords = 'hostel oversight, platform management, hostel monitoring, quality control, listing management';
    } else if (pageType === 'analytics') {
      finalTitle = 'System Analytics | Platform Insights - Hosttelz Admin';
      finalDescription = 'Comprehensive system analytics and insights. Monitor platform performance, user engagement, and business metrics.';
      finalKeywords = 'system analytics, platform insights, performance monitoring, business metrics, data analysis';
    } else if (pageType === 'database') {
      finalTitle = 'Database Management | System Administration - Hosttelz Admin';
      finalDescription = 'Advanced database management tools. Monitor system health, manage data, and ensure optimal performance.';
      finalKeywords = 'database management, system administration, data monitoring, system health, performance optimization';
    }

    return {
      title: finalTitle,
      description: finalDescription,
      keywords: finalKeywords,
      canonical: canonical || window.location.href,
      ogImage: ogImage || 'https://hosttelz.com/images/admin-dashboard.jpg',
      url: url || window.location.href
    };
  };

  // Generate structured data for admin pages
  const generateStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Hosttelz Admin',
      url: 'https://admin.hosttelz.com',
      description: 'Advanced system administration platform for Hosttelz',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Administrative tools for platform management'
      },
      creator: {
        '@type': 'Organization',
        name: 'Hosttelz',
        url: 'https://hosttelz.com'
      },
      featureList: [
        'User Management',
        'System Monitoring',
        'Database Administration',
        'Analytics Dashboard',
        'Security Management'
      ]
    };

    if (pageType === 'database') {
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Hosttelz Database Manager',
        description: 'Advanced database management and administration tools',
        url: 'https://admin.hosttelz.com/database/',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        featureList: [
          'Dynamic Table Management',
          'CRUD Operations',
          'Data Visualization',
          'System Monitoring',
          'Performance Analytics'
        ]
      };
    }

    return baseData;
  };

  const metaTags = generateMetaTags();
  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={metaTags.canonical} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTags.title} />
      <meta property="og:description" content={metaTags.description} />
      <meta property="og:url" content={metaTags.url} />
      <meta property="og:site_name" content="Hosttelz Admin" />
      <meta property="og:image" content={metaTags.ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTags.title} />
      <meta name="twitter:description" content={metaTags.description} />
      <meta name="twitter:image" content={metaTags.ogImage} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
      
      {/* Additional SEO for Admin App */}
      <meta name="application-name" content="Hosttelz Admin" />
      <meta name="apple-mobile-web-app-title" content="Hosttelz Admin" />
      <meta name="theme-color" content="#dc2626" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default AdminSEO;
