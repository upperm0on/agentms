"""
SEO-optimized views for the hostel management system
"""
from django.http import HttpResponse, JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from django.conf import settings
from .seo_utils import (
    generate_sitemap_data, generate_sitemap_xml, generate_robots_txt,
    generate_structured_data, generate_meta_tags, generate_faq_structured_data
)
import json


@cache_page(60 * 60 * 24)  # Cache for 24 hours
def sitemap_xml(request):
    """Generate XML sitemap"""
    xml_content = generate_sitemap_xml()
    return HttpResponse(xml_content, content_type='application/xml')


@cache_page(60 * 60 * 24)  # Cache for 24 hours
def robots_txt(request):
    """Generate robots.txt"""
    robots_content = generate_robots_txt()
    return HttpResponse(robots_content, content_type='text/plain')


def seo_meta_api(request):
    """API endpoint for SEO meta data"""
    page_type = request.GET.get('type', 'website')
    hostel_id = request.GET.get('hostel_id')
    
    meta_data = {
        'meta_tags': generate_meta_tags(request, page_type=page_type),
        'structured_data': generate_structured_data(page_type=page_type)
    }
    
    if hostel_id:
        try:
            from hq.models import Hostel
            hostel = Hostel.objects.get(id=hostel_id)
            meta_data['meta_tags'] = generate_meta_tags(request, hostel=hostel)
            meta_data['structured_data'] = generate_structured_data(hostel=hostel)
        except Hostel.DoesNotExist:
            pass
    
    return JsonResponse(meta_data)


def seo_landing_page(request):
    """SEO-optimized landing page"""
    from hq.models import Hostel
    
    # Get featured hostels for SEO
    featured_hostels = Hostel.objects.filter(is_active=True)[:6]
    
    # Generate FAQ data
    faqs = [
        {
            'question': 'How do I book a hostel on Hosttelz?',
            'answer': 'Simply search for hostels in your preferred location, select your dates, and complete the booking process. It\'s quick and secure!'
        },
        {
            'question': 'Are hostels on Hosttelz safe and secure?',
            'answer': 'Yes! All hostels on our platform are verified and meet our safety standards. We also provide 24/7 customer support.'
        },
        {
            'question': 'Can I manage my hostel bookings easily?',
            'answer': 'Absolutely! Our platform provides comprehensive management tools for hostel owners including reservation tracking, guest management, and analytics.'
        },
        {
            'question': 'What payment methods are accepted?',
            'answer': 'We accept all major payment methods including mobile money, bank transfers, and international cards for your convenience.'
        }
    ]
    
    # Generate structured data
    structured_data = [
        generate_structured_data(),
        generate_faq_structured_data(faqs)
    ]
    
    context = {
        'featured_hostels': featured_hostels,
        'faqs': faqs,
        'structured_data': structured_data,
        'meta_tags': generate_meta_tags(request)
    }
    
    return render(request, 'seo/landing_page.html', context)


def seo_hostel_detail(request, hostel_id):
    """SEO-optimized hostel detail page"""
    from hq.models import Hostel
    
    try:
        hostel = Hostel.objects.get(id=hostel_id, is_active=True)
    except Hostel.DoesNotExist:
        return render(request, '404.html', status=404)
    
    # Generate breadcrumbs
    breadcrumbs = [
        {'name': 'Home', 'url': 'https://hosttelz.com/'},
        {'name': 'Hostels', 'url': 'https://hosttelz.com/hostels/'},
        {'name': hostel.name, 'url': f'https://hosttelz.com/hostels/{hostel.id}/'}
    ]
    
    # Generate structured data
    structured_data = [
        generate_structured_data(hostel=hostel),
        {
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
    ]
    
    context = {
        'hostel': hostel,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data,
        'meta_tags': generate_meta_tags(request, hostel=hostel)
    }
    
    return render(request, 'seo/hostel_detail.html', context)


def seo_search_results(request):
    """SEO-optimized search results page"""
    query = request.GET.get('q', '')
    location = request.GET.get('location', '')
    
    # Generate meta tags for search results
    meta_tags = generate_meta_tags(request)
    if query:
        meta_tags['title'] = f'Search Results for "{query}" | Hosttelz'
        meta_tags['description'] = f'Find hostels matching "{query}" on Hosttelz. Book affordable accommodation in {location or "Ghana"} today!'
    
    context = {
        'query': query,
        'location': location,
        'meta_tags': meta_tags,
        'structured_data': [generate_structured_data()]
    }
    
    return render(request, 'seo/search_results.html', context)


def seo_about_page(request):
    """SEO-optimized about page"""
    about_content = {
        'title': 'About Hosttelz - Leading Hostel Booking Platform in Ghana',
        'description': 'Learn about Hosttelz, Ghana\'s premier hostel booking and management platform. Connecting students with affordable accommodation.',
        'content': '''
        <h1>About Hosttelz</h1>
        <p>Hosttelz is Ghana's leading hostel booking and management platform, dedicated to connecting students and travelers with affordable, safe, and comfortable accommodation.</p>
        
        <h2>Our Mission</h2>
        <p>We believe that everyone deserves access to quality accommodation at affordable prices. Our platform makes it easy for students to find the perfect hostel while providing hostel owners with powerful management tools.</p>
        
        <h2>Why Choose Hosttelz?</h2>
        <ul>
            <li><strong>Verified Hostels:</strong> All our hostels are thoroughly verified for safety and quality</li>
            <li><strong>Easy Booking:</strong> Simple and secure booking process</li>
            <li><strong>24/7 Support:</strong> Round-the-clock customer support</li>
            <li><strong>Management Tools:</strong> Comprehensive tools for hostel owners</li>
            <li><strong>Affordable Prices:</strong> Best deals on hostel accommodation</li>
        </ul>
        
        <h2>Our Services</h2>
        <p>We offer a complete ecosystem for hostel management including:</p>
        <ul>
            <li>Hostel discovery and booking</li>
            <li>Reservation management</li>
            <li>Payment processing</li>
            <li>Guest communication</li>
            <li>Analytics and reporting</li>
        </ul>
        '''
    }
    
    structured_data = [
        generate_structured_data(),
        {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            'name': 'About Hosttelz',
            'description': about_content['description'],
            'url': 'https://hosttelz.com/about/',
            'mainEntity': {
                '@type': 'Organization',
                'name': 'Hosttelz',
                'description': 'Leading hostel booking platform in Ghana'
            }
        }
    ]
    
    context = {
        'about_content': about_content,
        'structured_data': structured_data,
        'meta_tags': generate_meta_tags(request)
    }
    
    return render(request, 'seo/about.html', context)


def seo_contact_page(request):
    """SEO-optimized contact page"""
    contact_info = {
        'title': 'Contact Hosttelz - Get in Touch',
        'description': 'Contact Hosttelz for support, inquiries, or partnership opportunities. We\'re here to help with all your hostel booking needs.',
        'email': 'support@hosttelz.com',
        'phone': '+233-XXX-XXXX',
        'address': 'Accra, Ghana'
    }
    
    structured_data = [
        generate_structured_data(),
        {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            'name': 'Contact Hosttelz',
            'description': contact_info['description'],
            'url': 'https://hosttelz.com/contact/',
            'mainEntity': {
                '@type': 'Organization',
                'name': 'Hosttelz',
                'email': contact_info['email'],
                'telephone': contact_info['phone'],
                'address': {
                    '@type': 'PostalAddress',
                    'addressLocality': contact_info['address'],
                    'addressCountry': 'GH'
                }
            }
        }
    ]
    
    context = {
        'contact_info': contact_info,
        'structured_data': structured_data,
        'meta_tags': generate_meta_tags(request)
    }
    
    return render(request, 'seo/contact.html', context)
