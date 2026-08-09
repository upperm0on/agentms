# Enhanced API views for new features
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
import json
import logging

from .models import Hostel
from consumers.models import Consumer
from reservations.models import Reservation
from payments.models import Payment
from reviews.models import Reviews

User = get_user_model()
logger = logging.getLogger(__name__)

# Advanced Search API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def advanced_search(request):
    """
    Enhanced search with multiple criteria
    """
    try:
        data = request.data
        search_criteria = {
            'location': data.get('location', ''),
            'price_range': data.get('priceRange', {}),
            'amenities': data.get('amenities', []),
            'rating': data.get('rating', 0),
            'room_type': data.get('roomType', ''),
            'gender': data.get('gender', ''),
            'distance': data.get('distance', 10),
            'sort_by': data.get('sortBy', 'relevance')
        }
        
        # Build query
        query = Q()
        
        # Location search
        if search_criteria['location']:
            query &= Q(location__icontains=search_criteria['location'])
        
        # Price range
        if search_criteria['price_range'].get('min'):
            query &= Q(room_details__price__gte=search_criteria['price_range']['min'])
        if search_criteria['price_range'].get('max'):
            query &= Q(room_details__price__lte=search_criteria['price_range']['max'])
        
        # Amenities
        if search_criteria['amenities']:
            for amenity in search_criteria['amenities']:
                query &= Q(additional_details__amenities__icontains=amenity)
        
        # Rating
        if search_criteria['rating'] > 0:
            query &= Q(average_rating__gte=search_criteria['rating'])
        
        # Room type
        if search_criteria['room_type']:
            query &= Q(room_details__room_type=search_criteria['room_type'])
        
        # Gender
        if search_criteria['gender']:
            query &= Q(room_details__gender=search_criteria['gender'])
        
        # Execute search
        hostels = Hostel.objects.filter(query).distinct()
        
        # Apply sorting
        if search_criteria['sort_by'] == 'price_low':
            hostels = hostels.order_by('room_details__price')
        elif search_criteria['sort_by'] == 'price_high':
            hostels = hostels.order_by('-room_details__price')
        elif search_criteria['sort_by'] == 'rating':
            hostels = hostels.order_by('-average_rating')
        else:  # relevance
            hostels = hostels.order_by('-created_at')
        
        # Serialize results
        results = []
        for hostel in hostels:
            results.append({
                'id': hostel.id,
                'name': hostel.name,
                'location': hostel.location,
                'price': hostel.room_details.get('price', 0) if hostel.room_details else 0,
                'rating': hostel.average_rating,
                'amenities': hostel.additional_details.get('amenities', []) if hostel.additional_details else [],
                'image': hostel.image.url if hostel.image else None,
            })
        
        return Response({
            'results': results,
            'total': len(results),
            'search_criteria': search_criteria
        })
        
    except Exception as e:
        logger.error(f"Advanced search error: {e}")
        return Response(
            {'error': 'Search failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Notifications API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    Get user notifications
    """
    try:
        user = request.user
        notifications = []
        
        # Get recent reservations
        recent_reservations = Reservation.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-created_at')[:5]
        
        for reservation in recent_reservations:
            notifications.append({
                'id': f"reservation_{reservation.id}",
                'title': 'New Reservation',
                'message': f'Your reservation for {reservation.hostel.name} has been confirmed',
                'type': 'info',
                'created_at': reservation.created_at.isoformat(),
                'read': False,
                'data': {'reservation_id': reservation.id}
            })
        
        # Get payment notifications
        recent_payments = Payment.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-created_at')[:5]
        
        for payment in recent_payments:
            notifications.append({
                'id': f"payment_{payment.id}",
                'title': 'Payment Received',
                'message': f'Payment of {payment.amount} has been processed',
                'type': 'success',
                'created_at': payment.created_at.isoformat(),
                'read': False,
                'data': {'payment_id': payment.id}
            })
        
        # Sort by creation date
        notifications.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response({
            'notifications': notifications,
            'unread_count': len([n for n in notifications if not n['read']])
        })
        
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        return Response(
            {'error': 'Failed to fetch notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark notification as read
    """
    try:
        # In a real implementation, you'd store notification state in database
        # For now, we'll just return success
        return Response({'success': True})
        
    except Exception as e:
        logger.error(f"Mark notification read error: {e}")
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Enhanced Analytics API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhanced_analytics(request):
    """
    Get enhanced analytics data
    """
    try:
        data = request.data
        date_range = data.get('date_range', '30d')
        metrics = data.get('metrics', ['revenue', 'occupancy', 'bookings'])
        
        # Calculate date range
        end_date = timezone.now()
        if date_range == '7d':
            start_date = end_date - timedelta(days=7)
        elif date_range == '30d':
            start_date = end_date - timedelta(days=30)
        elif date_range == '90d':
            start_date = end_date - timedelta(days=90)
        elif date_range == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        analytics_data = {}
        
        # Revenue analytics
        if 'revenue' in metrics:
            total_revenue = Payment.objects.filter(
                created_at__gte=start_date,
                created_at__lte=end_date,
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            previous_period_revenue = Payment.objects.filter(
                created_at__gte=start_date - (end_date - start_date),
                created_at__lt=start_date,
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            revenue_growth = 0
            if previous_period_revenue > 0:
                revenue_growth = (total_revenue - previous_period_revenue) / previous_period_revenue
            
            analytics_data['revenue'] = {
                'total': total_revenue,
                'growth': revenue_growth
            }
        
        # Occupancy analytics
        if 'occupancy' in metrics:
            total_rooms = Hostel.objects.aggregate(total=Count('id'))['total'] or 1
            occupied_rooms = Reservation.objects.filter(
                created_at__gte=start_date,
                created_at__lte=end_date,
                status='confirmed'
            ).count()
            
            occupancy_rate = occupied_rooms / total_rooms if total_rooms > 0 else 0
            
            analytics_data['occupancy'] = {
                'rate': occupancy_rate,
                'total_rooms': total_rooms,
                'occupied_rooms': occupied_rooms
            }
        
        # Bookings analytics
        if 'bookings' in metrics:
            total_bookings = Reservation.objects.filter(
                created_at__gte=start_date,
                created_at__lte=end_date
            ).count()
            
            previous_period_bookings = Reservation.objects.filter(
                created_at__gte=start_date - (end_date - start_date),
                created_at__lt=start_date
            ).count()
            
            booking_growth = 0
            if previous_period_bookings > 0:
                booking_growth = (total_bookings - previous_period_bookings) / previous_period_bookings
            
            analytics_data['bookings'] = {
                'total': total_bookings,
                'growth': booking_growth
            }
        
        # Top performing rooms
        top_rooms = Hostel.objects.annotate(
            booking_count=Count('reservation')
        ).order_by('-booking_count')[:5]
        
        analytics_data['top_rooms'] = [
            {
                'name': room.name,
                'revenue': room.room_details.get('price', 0) * room.booking_count if room.room_details else 0,
                'bookings': room.booking_count
            }
            for room in top_rooms
        ]
        
        return Response(analytics_data)
        
    except Exception as e:
        logger.error(f"Enhanced analytics error: {e}")
        return Response(
            {'error': 'Failed to fetch analytics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Document Management API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_documents(request):
    """
    Get user documents
    """
    try:
        # In a real implementation, you'd have a Document model
        # For now, return mock data
        documents = [
            {
                'id': 1,
                'name': 'Lease Agreement.pdf',
                'size': 1024000,
                'file_type': 'application/pdf',
                'category': 'lease',
                'created_at': timezone.now().isoformat(),
                'url': '/media/documents/lease_agreement.pdf'
            },
            {
                'id': 2,
                'name': 'ID Document.jpg',
                'size': 512000,
                'file_type': 'image/jpeg',
                'category': 'identification',
                'created_at': timezone.now().isoformat(),
                'url': '/media/documents/id_document.jpg'
            }
        ]
        
        return Response({'documents': documents})
        
    except Exception as e:
        logger.error(f"Get documents error: {e}")
        return Response(
            {'error': 'Failed to fetch documents'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_documents(request):
    """
    Upload documents
    """
    try:
        files = request.FILES.getlist('files')
        categories = request.data.getlist('categories')
        
        uploaded_documents = []
        
        for i, file in enumerate(files):
            # In a real implementation, you'd save the file and create a Document record
            document = {
                'id': len(uploaded_documents) + 1,
                'name': file.name,
                'size': file.size,
                'file_type': file.content_type,
                'category': categories[i] if i < len(categories) else 'other',
                'created_at': timezone.now().isoformat(),
                'url': f'/media/documents/{file.name}'
            }
            uploaded_documents.append(document)
        
        return Response({'documents': uploaded_documents})
        
    except Exception as e:
        logger.error(f"Upload documents error: {e}")
        return Response(
            {'error': 'Failed to upload documents'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Communication API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """
    Get user conversations
    """
    try:
        # In a real implementation, you'd have Conversation and Message models
        # For now, return mock data
        conversations = [
            {
                'id': 1,
                'subject': 'Hostel Booking Inquiry',
                'participants': [
                    {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
                    {'id': 2, 'name': 'Manager', 'email': 'manager@hostel.com'}
                ],
                'last_message': {
                    'content': 'Thank you for your inquiry. We will get back to you soon.',
                    'created_at': timezone.now().isoformat()
                },
                'status': 'active',
                'unread_count': 2,
                'updated_at': timezone.now().isoformat()
            }
        ]
        
        return Response({'conversations': conversations})
        
    except Exception as e:
        logger.error(f"Get conversations error: {e}")
        return Response(
            {'error': 'Failed to fetch conversations'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """
    Get messages for a conversation
    """
    try:
        # In a real implementation, you'd fetch from Message model
        # For now, return mock data
        messages = [
            {
                'id': 1,
                'content': 'Hello, I am interested in booking a room.',
                'created_at': timezone.now().isoformat(),
                'is_own': True,
                'status': 'sent'
            },
            {
                'id': 2,
                'content': 'Thank you for your inquiry. We will get back to you soon.',
                'created_at': timezone.now().isoformat(),
                'is_own': False,
                'status': 'sent'
            }
        ]
        
        return Response({'messages': messages})
        
    except Exception as e:
        logger.error(f"Get conversation messages error: {e}")
        return Response(
            {'error': 'Failed to fetch messages'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    """
    Send a message in a conversation
    """
    try:
        data = request.data
        content = data.get('content', '')
        message_type = data.get('type', 'text')
        
        # In a real implementation, you'd create a Message record
        message = {
            'id': 3,
            'content': content,
            'type': message_type,
            'created_at': timezone.now().isoformat(),
            'is_own': True,
            'status': 'sent'
        }
        
        return Response({'message': message})
        
    except Exception as e:
        logger.error(f"Send message error: {e}")
        return Response(
            {'error': 'Failed to send message'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

