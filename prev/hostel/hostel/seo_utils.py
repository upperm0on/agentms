"""
Advanced SEO utilities for the hostel management system
"""
import json
from django.conf import settings
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.core.cache import cache
import re


def generate_sitemap_data():
    """Generate comprehensive sitemap data for all hostels and pages"""
    from hq.models import Hostel
    from django.urls import reverse
    
    sitemap_data = {
        'pages': [
            {
                'url': '/',
                'priority': 1.0,
                'changefreq': 'daily',
                'lastmod': '2024-01-01'
            },
            {
                'url': '/hostels/',
                'priority': 0.9,
                'changefreq': 'daily',
                'lastmod': '2024-01-01'
            },
            {
                'url': '/about/',
                'priority': 0.8,
                'changefreq': 'monthly',
                'lastmod': '2024-01-01'
            },
            {
                'url': '/contact/',
                'priority': 0.7,
                'changefreq': 'monthly',
                'lastmod': '2024-01-01'
            }
        ],
        'hostels': []
    }
    
    # Add all hostels to sitemap
    for hostel in Hostel.objects.filter(is_active=True):
        sitemap_data['hostels'].append({
            'url': f'/hostels/{hostel.slug or hostel.id}/',
            'priority': 0.8,
            'changefreq': 'weekly',
            'lastmod': hostel.updated_at.isoformat() if hasattr(hostel, 'updated_at') else '2024-01-01'
        })
    
    return sitemap_data


def generate_structured_data(hostel=None, page_type='website'):
    """Generate JSON-LD structured data for SEO"""
    
    base_data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Hosttelz',
        'url': 'https://hosttelz.com',
        'logo': 'https://hosttelz.com/images/logo.png',
        'description': 'Leading hostel booking and management platform in Ghana and Africa',
        'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'GH',
            'addressRegion': 'Greater Accra'
        },
        'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+233-XXX-XXXX',
            'contactType': 'customer service',
            'availableLanguage': ['English', 'French']
        },
        'sameAs': [
            'https://facebook.com/hosttelz',
            'https://twitter.com/hosttelz',
            'https://instagram.com/hosttelz'
        ]
    }
    
    if hostel:
        hostel_data = {
            '@context': 'https://schema.org',
            '@type': 'Hostel',
            'name': hostel.name,
            'description': strip_tags(hostel.description or hostel.short_description or ''),
            'url': f'https://hosttelz.com/hostels/{hostel.slug or hostel.id}/',
            'image': hostel.image.url if hostel.image else None,
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': hostel.address or '',
                'addressLocality': hostel.campus or '',
                'addressCountry': 'GH'
            },
            'telephone': hostel.contact_number or '',
            'priceRange': f"${hostel.min_price or 0}-${hostel.max_price or 0}" if hostel.min_price else None,
            'amenityFeature': [
                {'@type': 'LocationFeatureSpecification', 'name': amenity}
                for amenity in (hostel.amenities or [])
            ] if hostel.amenities else [],
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': hostel.ratings or 0,
                'reviewCount': hostel.review_count or 0
            } if hostel.ratings else None
        }
        return hostel_data
    
    return base_data


def generate_meta_tags(request, hostel=None, page_type='website'):
    """Generate comprehensive meta tags for SEO"""
    
    base_meta = {
        'title': 'Hosttelz | Book Affordable Hostels & Manage Reservations',
        'description': 'Find and book affordable hostels with Hosttelz. Leading hostel booking platform in Ghana. Easy reservation management for hostel owners.',
        'keywords': 'hostel booking, affordable hostels, hostel management, student housing, Ghana hostels, hostel reservation, accommodation booking',
        'og:type': 'website',
        'og:site_name': 'Hosttelz',
        'twitter:card': 'summary_large_image',
        'twitter:site': '@hosttelz',
        'robots': 'index, follow',
        'canonical': request.build_absolute_uri(request.path)
    }
    
    if hostel:
        hostel_meta = {
            'title': f'{hostel.name} | Book Now on Hosttelz',
            'description': f'Book {hostel.name} - {strip_tags(hostel.description or hostel.short_description or "Affordable hostel accommodation")}',
            'keywords': f'hostel {hostel.name}, {hostel.campus} hostel, {hostel.name} booking, affordable accommodation {hostel.campus}',
            'og:title': f'{hostel.name} - Hosttelz',
            'og:description': f'Book {hostel.name} for affordable accommodation',
            'og:image': hostel.image.url if hostel.image else 'https://hosttelz.com/images/default-hostel.jpg',
            'og:url': f'https://hosttelz.com/hostels/{hostel.slug or hostel.id}/',
            'twitter:title': f'{hostel.name} - Book Now',
            'twitter:description': f'Book {hostel.name} for affordable accommodation',
            'twitter:image': hostel.image.url if hostel.image else 'https://hosttelz.com/images/default-hostel.jpg'
        }
        base_meta.update(hostel_meta)
    
    return base_meta


def generate_robots_txt():
    """Generate robots.txt content"""
    return """User-agent: *
Allow: /
Allow: /hostels/
Allow: /api/
Disallow: /admin/
Disallow: /static/admin/
Disallow: /media/private/

Sitemap: https://hosttelz.com/sitemap.xml
Sitemap: https://hosttelz.com/sitemap-hostels.xml
"""


def generate_sitemap_xml():
    """Generate XML sitemap"""
    sitemap_data = generate_sitemap_data()
    
    xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'''
    
    for page in sitemap_data['pages']:
        xml_content += f'''
    <url>
        <loc>https://hosttelz.com{page['url']}</loc>
        <lastmod>{page['lastmod']}</lastmod>
        <changefreq>{page['changefreq']}</changefreq>
        <priority>{page['priority']}</priority>
    </url>'''
    
    for hostel in sitemap_data['hostels']:
        xml_content += f'''
    <url>
        <loc>https://hosttelz.com{hostel['url']}</loc>
        <lastmod>{hostel['lastmod']}</lastmod>
        <changefreq>{hostel['changefreq']}</changefreq>
        <priority>{hostel['priority']}</priority>
    </url>'''
    
    xml_content += '''
</urlset>'''
    
    return xml_content


def optimize_content_for_seo(content, keywords=None):
    """Optimize content for SEO"""
    if not content:
        return content
    
    # Basic content optimization
    optimized_content = content
    
    # Add keywords naturally if provided
    if keywords:
        for keyword in keywords:
            if keyword.lower() not in optimized_content.lower():
                # Add keyword naturally in the content
                optimized_content = optimized_content.replace(
                    'hostel', f'{keyword} hostel', 1
                )
    
    # Ensure proper heading structure
    if not re.search(r'<h[1-6]', optimized_content):
        optimized_content = f'<h2>About This Hostel</h2>{optimized_content}'
    
    return optimized_content


def generate_breadcrumb_structured_data(breadcrumbs):
    """Generate breadcrumb structured data"""
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': i + 1,
                'name': crumb['name'],
                'item': crumb['url']
            }
            for i, crumb in enumerate(breadcrumbs)
        ]
    }


def generate_faq_structured_data(faqs):
    """Generate FAQ structured data"""
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': faq['question'],
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq['answer']
                }
            }
            for faq in faqs
        ]
    }


def generate_local_business_structured_data(hostel):
    """Generate LocalBusiness structured data for hostels"""
    return {
        '@context': 'https://schema.org',
        '@type': 'Hostel',
        'name': hostel.name,
        'description': hostel.description or hostel.short_description,
        'url': f'https://hosttelz.com/hostels/{hostel.slug or hostel.id}/',
        'image': hostel.image.url if hostel.image else None,
        'address': {
            '@type': 'PostalAddress',
            'streetAddress': hostel.address or '',
            'addressLocality': hostel.campus or '',
            'addressRegion': 'Greater Accra',
            'addressCountry': 'GH'
        },
        'telephone': hostel.contact_number or '',
        'priceRange': f"${hostel.min_price or 0}-${hostel.max_price or 0}" if hostel.min_price else None,
        'openingHours': 'Mo-Su 00:00-23:59',
        'amenityFeature': [
            {'@type': 'LocationFeatureSpecification', 'name': amenity}
            for amenity in (hostel.amenities or [])
        ] if hostel.amenities else [],
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': hostel.ratings or 0,
            'reviewCount': hostel.review_count or 0
        } if hostel.ratings else None,
        'geo': {
            '@type': 'GeoCoordinates',
            'latitude': hostel.latitude or 5.6037,
            'longitude': hostel.longitude or -0.1870
        } if hasattr(hostel, 'latitude') and hostel.latitude else None
    }
