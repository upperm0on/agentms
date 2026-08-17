"""
SEO-optimized URL patterns
"""
from django.urls import path
from . import seo_views

urlpatterns = [
    # SEO endpoints
    path('sitemap.xml', seo_views.sitemap_xml, name='sitemap_xml'),
    path('robots.txt', seo_views.robots_txt, name='robots_txt'),
    path('api/seo/meta/', seo_views.seo_meta_api, name='seo_meta_api'),
    
    # SEO-optimized pages
    path('', seo_views.seo_landing_page, name='seo_landing'),
    path('about/', seo_views.seo_about_page, name='seo_about'),
    path('contact/', seo_views.seo_contact_page, name='seo_contact'),
    path('search/', seo_views.seo_search_results, name='seo_search'),
    path('hostels/<int:hostel_id>/', seo_views.seo_hostel_detail, name='seo_hostel_detail'),
]
