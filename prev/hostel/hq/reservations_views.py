from django.shortcuts import render
import json
import requests
from django.conf import settings

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from reservations.models import Reservation
from hq.models import Hostel
from payment_account.models import PaymentAccount
from consumers.models import Consumer
from email_service.utils import notify_reservation_confirmed

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    user = request.user
    hostel_id = request.data.get('hostel_id')
    reservee_date = request.data.get('reservee_date')
    room_uuid = request.data.get('room_uuid')
    amount = request.data.get('amount')

    # Basic validation
    if not hostel_id or not reservee_date or not room_uuid or not amount:
        return Response({'detail': 'hostel_id, reservee_date, room_uuid, and amount are required.'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        hostel = Hostel.objects.get(id=hostel_id)
    except Hostel.DoesNotExist:
        return Response({'detail': 'Hostel not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check room availability before creating reservation
    try:
        if hostel.room_details:
            rooms = hostel.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)
            
            for room in rooms:
                if room.get('uuid') == room_uuid:
                    number_of_rooms = int(room.get('number_of_rooms', 1))
                    number_in_room = int(room.get('number_in_room', 1))
                    
                    # Calculate total capacity for this room type
                    total_capacity = number_of_rooms * number_in_room
                    
                    # Count active consumers (tenants) already in this room
                    active_consumers = Consumer.objects.filter(
                        hostel=hostel,
                        room_uuid=room_uuid,
                        is_active=True
                    ).count()
                    
                    # Count current active reservations for this room
                    # IMPORTANT: Count both paid and unpaid pending/confirmed reservations to prevent overbooking.
                    # Optionally exclude expired reservations.
                    from datetime import date as _date
                    today = _date.today()
                    active_reservations = Reservation.objects.filter(
                        hostel=hostel,
                        room_uuid=room_uuid,
                        status__in=['pending', 'confirmed'],
                        expiry_date__gte=today
                    ).count()
                    
                    # Calculate available slots
                    occupied_slots = active_consumers + active_reservations
                    available_slots = total_capacity - occupied_slots
                    
                    if available_slots <= 0:
                        return Response({
                            'detail': 'Room is full. No more reservations can be accepted for this room.',
                            'is_full': True,
                            'available_slots': available_slots,
                            'total_capacity': total_capacity
                        }, status=status.HTTP_400_BAD_REQUEST)
                    break
    except (ValueError, TypeError, KeyError) as e:
        print(f"Error checking room availability: {e}")
        # Continue with reservation creation if there's an error checking availability
    
    reservation = Reservation.objects.create(
        user=user,
        hostel=hostel,
        reservee_date=reservee_date,
        room_uuid=room_uuid,
        amount=amount,
        status='pending',
    )
    
    # Send reservation confirmation email
    try:
        notify_reservation_confirmed(reservation, user)
    except Exception as e:
        # Log error but don't fail the reservation creation
        print(f"Failed to send reservation confirmation email: {str(e)}")
    
    # Send action notification email to admin
    try:
        from email_service.action_notifications import notify_admin_reservation_created
        # Get admin user (first staff user or the user who created it)
        admin_user = User.objects.filter(is_staff=True).first() or user
        notify_admin_reservation_created(admin_user, reservation)
    except Exception as e:
        print(f"Failed to send admin notification for reservation creation: {str(e)}")
    
    return Response({
        'id': reservation.id,
        'user': reservation.user.id,
        'hostel': reservation.hostel.id,
        'reservee_date': reservation.reservee_date,
        'expiry_date': reservation.expiry_date,
        'room_uuid': reservation.room_uuid,
        'amount': float(reservation.amount),
        'status': reservation.status,
        'created_at': reservation.created_at,
        'updated_at': reservation.updated_at,
    }, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_reservation(request, reservation_id):
    """
    Allow the user to delete their own reservation.
    """
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

    if reservation.user != request.user:
        return Response({'detail': 'You do not have permission to delete this reservation.'},
                        status=status.HTTP_403_FORBIDDEN)

    # Store reservation data before deletion for email notification
    reservation_id = reservation.id
    reservation_user_email = reservation.user.email
    reservation_hostel_name = reservation.hostel.name
    
    reservation.delete()
    
    # Send action notification email to admin
    try:
        from email_service.action_notifications import notify_admin_reservation_cancelled
        # Create a mock reservation object for notification
        class MockReservation:
            def __init__(self, id, user_email, hostel_name):
                self.id = id
                self.user = type('User', (), {'email': user_email})()
                self.hostel = type('Hostel', (), {'name': hostel_name})()
        mock_reservation = MockReservation(reservation_id, reservation_user_email, reservation_hostel_name)
        admin_user = User.objects.filter(is_staff=True).first() or request.user
        notify_admin_reservation_cancelled(admin_user, mock_reservation)
    except Exception as e:
        print(f"Failed to send admin notification for reservation deletion: {str(e)}")
    
    return Response({'detail': 'Reservation deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_reservation_payment(request):
    """
    Initiate payment for a reservation (deposit payment)
    """
    user = request.user
    reservation_id = request.data.get('reservation_id')
    email = request.data.get('email')
    deposit_percentage = request.data.get('deposit_percentage', 30)  # Default 30% deposit
    
    # Debug logging
    print(f"Payment initiation request - User: {user.email}, Reservation ID: {reservation_id}, Email: {email}")
    
    # Validate required fields
    if not email:
        return Response({'detail': 'Email is required for payment.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=user)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    if reservation.is_paid:
        return Response({'detail': 'Reservation already paid.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate deposit amount
    if not reservation.amount:
        return Response({'detail': 'Reservation amount not set.'}, status=status.HTTP_400_BAD_REQUEST)
    
    deposit_amount = float(reservation.amount) * (deposit_percentage / 100)
    reservation.deposit_amount = deposit_amount
    reservation.save()
    
    # Get hostel and manager for subaccount payment
    hostel = reservation.hostel
    manager = hostel.manager
    
    # Prepare payment data
    data = {
        "email": email,
        "amount": int(deposit_amount * 100),  # Convert to kobo
    }
    
    # Add subaccount configuration if manager has payment account
    try:
        payment_account = PaymentAccount.objects.get(manager=manager)
        platform_fee_kobo = int((deposit_amount * 100 * payment_account.platform_share_percentage) / 100)
        
        data.update({
            "subaccount": payment_account.account_code,
            "transaction_charge": platform_fee_kobo,
            "bearer": "account"
        })
    except PaymentAccount.DoesNotExist:
        pass  # Proceed without subaccount
    
    # Initialize Paystack transaction
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    
    response = requests.post("https://api.paystack.co/transaction/initialize", headers=headers, json=data)
    resp_data = response.json()
    
    if resp_data.get("status"):
        # Store reference in reservation
        reference = resp_data["data"].get("reference")
        reservation.reference = reference
        reservation.save()
        
        return Response({
            "authorization_url": resp_data["data"]["authorization_url"],
            "reference": reference,
            "deposit_amount": deposit_amount,
            "total_amount": float(reservation.amount),
            "remaining_amount": float(reservation.amount) - deposit_amount
        })
    else:
        return Response({'detail': 'Payment initialization failed.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_reservation_payment(request):
    """
    Verify reservation payment after Paystack callback
    """
    user = request.user
    reference = request.data.get('reference')
    reservation_id = request.data.get('reservation_id')
    
    if not reference or not reservation_id:
        return Response({'detail': 'Reference and reservation_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=user, reference=reference)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify with Paystack
    headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    response = requests.get(url, headers=headers)
    paystack_data = response.json()
    
    if paystack_data.get("status") and paystack_data.get("data", {}).get("status") == "success":
        # Payment successful
        reservation.is_paid = True
        reservation.status = 'confirmed'
        reservation.save()
        
        return Response({
            'detail': 'Payment verified successfully.',
            'reservation': {
                'id': reservation.id,
                'status': reservation.status,
                'is_paid': reservation.is_paid,
                'deposit_amount': float(reservation.deposit_amount),
                'remaining_amount': float(reservation.amount) - float(reservation.deposit_amount)
            }
        })
    else:
        return Response({'detail': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_reservations(request):
    """
    Get all reservations for the authenticated user
    """
    user = request.user
    reservations = Reservation.objects.filter(user=user).order_by('-created_at')
    
    reservation_data = []
    for reservation in reservations:
        # Get hostel details
        hostel = reservation.hostel
        hostel_data = {
            'id': hostel.id,
            'name': hostel.name,
            'image': str(hostel.image) if hostel.image else None,
            'campus': hostel.campus.campus if hostel.campus else None,
            'region': hostel.campus.region if hostel.campus else None,
            'rating': float(hostel.ratings) if hostel.ratings else None,
            'status': hostel.status,
            'gender_type': hostel.gender_type,
            'room_details': hostel.room_details,
            'additional_details': hostel.additional_details,
        }
        
        # Find the specific room details
        room_details = []
        if hostel.room_details:
            try:
                if isinstance(hostel.room_details, str):
                    room_details = json.loads(hostel.room_details)
                else:
                    room_details = hostel.room_details
            except:
                room_details = []
        
        # Find the reserved room
        reserved_room = None
        for room in room_details:
            if room.get('uuid') == reservation.room_uuid:
                reserved_room = room
                break
        
        reservation_data.append({
            'id': reservation.id,
            'hostel': hostel_data,
            'reserved_room': reserved_room,
            'reservee_date': reservation.reservee_date,
            'expiry_date': reservation.expiry_date,
            'room_uuid': reservation.room_uuid,
            'status': reservation.status,
            'amount': float(reservation.amount) if reservation.amount else None,
            'deposit_amount': float(reservation.deposit_amount) if reservation.deposit_amount else None,
            'is_paid': reservation.is_paid,
            'created_at': reservation.created_at,
            'updated_at': reservation.updated_at,
        })
    
    return Response({'reservations': reservation_data})

