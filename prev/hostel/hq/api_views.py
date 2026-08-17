from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Hostel
from .serializers import HostelSerializer


from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt


from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model

User = get_user_model()
from managers.models import Manager
from user_auth.models import Gender, UserProfile, UserVerification
from user_auth.decorators import require_verified_account_api
from consumers.models import Consumer
from reservations.models import Reservation
import json
from reviews.models import Reviews
from consumers.models import Consumer
from ratings.models import five_star, four_star, three_star, two_star, one_star
import requests
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from datetime import datetime
# Import entrepreneur modules only when needed to avoid circular imports
# from entrepreneurs.models import Entrepreneur
# from entrepreneurs.serializers import EntrepreneurSerializer

def check_room_availability(hostel, room_uuid):
    """
    Check if a room has available slots for new reservations
    Returns: (is_available, available_slots, total_capacity)
    """
    try:
        if not hostel.room_details:
            return False, 0, 0
        
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
                
                # Count current active reservations for this room (paid and unpaid), excluding expired
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
                
                return available_slots > 0, available_slots, total_capacity
                
        return False, 0, 0
    except (ValueError, TypeError, KeyError) as e:
        print(f"Error checking room availability: {e}")
        return False, 0, 0

@api_view(['GET'])
@permission_classes([AllowAny])
def check_room_availability_api(request):
    """
    API endpoint to check if a room is available for reservation
    """
    try:
        hostel_id = request.GET.get('hostel_id')
        room_uuid = request.GET.get('room_uuid')
        
        if not hostel_id or not room_uuid:
            return Response({
                'status': 'error',
                'message': 'hostel_id and room_uuid are required'
            }, status=400)
        
        try:
            hostel = Hostel.objects.get(id=hostel_id)
        except Hostel.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Hostel not found'
            }, status=404)
        
        is_available, available_slots, total_capacity = check_room_availability(hostel, room_uuid)
        
        return Response({
            'status': 'success',
            'is_available': is_available,
            'available_slots': available_slots,
            'total_capacity': total_capacity,
            'is_full': not is_available
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def google_oauth_login(request):
    """
    Google OAuth login endpoint
    Accepts Google JWT credential and creates/logs in user
    """
    credential = request.data.get('credential') or request.data.get('access_token')
    
    if not credential:
        return Response(
            {'error': 'Google credential is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify the JWT token with Google using tokeninfo endpoint
        # This works for both JWT credentials and access tokens
        try:
            # Try to verify as JWT credential first
            tokeninfo_url = f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}'
            response = requests.get(tokeninfo_url, timeout=10)
            
            if response.status_code == 200:
                # Valid JWT token
                token_data = response.json()
                # Verify the audience matches our client ID
                if token_data.get('aud') != '826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com':
                    return Response(
                        {'error': 'Invalid Google credential audience'}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Get user info from tokeninfo
                email = token_data.get('email')
                first_name = token_data.get('given_name', '')
                last_name = token_data.get('family_name', '')
                full_name = token_data.get('name', '')
                google_id = token_data.get('sub')
                picture = token_data.get('picture', '')
            else:
                # If tokeninfo fails, try as access token
                google_user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
                headers = {'Authorization': f'Bearer {credential}'}
                response = requests.get(google_user_info_url, headers=headers, timeout=10)
                
                if response.status_code != 200:
                    return Response(
                        {'error': 'Invalid Google credential'}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                google_data = response.json()
                email = google_data.get('email')
                first_name = google_data.get('given_name', '')
                last_name = google_data.get('family_name', '')
                full_name = google_data.get('name', '')
                google_id = google_data.get('id')
                picture = google_data.get('picture', '')
        except requests.RequestException as e:
            return Response(
                {'error': f'Error verifying Google credential: {str(e)}'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate username from email
        username = email.split('@')[0]
        original_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
            }
        )
        
        # Update user info if not newly created
        if not created:
            if first_name and not user.first_name:
                user.first_name = first_name
            if last_name and not user.last_name:
                user.last_name = last_name
            user.save()
        
        # Create or get UserVerification and mark as verified (Google emails are verified)
        verification, _ = UserVerification.objects.get_or_create(
            user=user,
            defaults={'account_verified': True}
        )
        if not verification.account_verified:
            verification.account_verified = True
            verification.save()
        
        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Check if user is a manager
        is_manager = False
        hostel_data = []
        try:
            manager = Manager.objects.get(user=user)
            is_manager = True
            try:
                hostels = Hostel.objects.filter(manager=manager)
                for hostel_i in hostels: 
                    hostel_data.append({hostel_i.pk: HostelSerializer(hostel_i).data})
            except:
                hostel_data = []
        except Manager.DoesNotExist:
            pass
        
        # Check if user is an entrepreneur
        is_entrepreneur = False
        entrepreneur_data = None
        try:
            from entrepreneurs.models import Entrepreneur
            from entrepreneurs.serializers import EntrepreneurSerializer
            entrepreneur = Entrepreneur.objects.get(user=user)
            is_entrepreneur = True
            entrepreneur_data = EntrepreneurSerializer(entrepreneur).data
        except:
            pass
        
        return Response({
            'token': token.key,
            'email': user.email,
            'username': user.username,
            'name': full_name or f"{first_name} {last_name}".strip() or username,
            'is_manager': is_manager,
            'is_entrepreneur': is_entrepreneur,
            'account_verified': verification.account_verified,
            'hostel': hostel_data if is_manager else None,
            'entrepreneur': entrepreneur_data if is_entrepreneur else None,
            'status': 'success',
            'message': 'Logged in successfully with Google'
        }, status=status.HTTP_200_OK)
        
    except requests.RequestException as e:
        return Response(
            {'error': f'Error verifying Google token: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def custom_login(request):
    """
    Custom login view that handles manager and entrepreneur validation
    """
    email = request.data.get('email')
    password = request.data.get('password')
    is_manager = request.data.get('is_manager', False)
    is_ent = request.data.get('is_ent', False)
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate using the EmailBackend (pass email as username)
    user = authenticate(request, username=email, password=password)
    
    if not user:
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check verification status (used for all login types)
    try:
        verification = user.verification
        account_verified = verification.account_verified
    except:
        account_verified = False
    
    # If is_manager is True, check if user is actually a manager
    if is_manager:
        hostel_data = []
        try:
            manager = Manager.objects.get(user=user)
            # Get the manager's hostel
            try:
                hostel = Hostel.objects.filter(manager=manager)
                for hostel_i in hostel: 
                    hostel_data.append({hostel_i.pk: HostelSerializer(hostel_i).data})
            except Hostel.DoesNotExist:
                hostel_data = None
            
            # User is a manager, proceed with login
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'email': user.email,
                'username': user.username,
                'is_manager': True,
                'account_verified': account_verified,
                'hostel': hostel_data,
                'status': 'success'
            }, status=status.HTTP_200_OK)
        except Manager.DoesNotExist:
            # User is not a manager
            return Response({
                'error': 'User is not a manager',
                'status': 'failed'
            }, status=status.HTTP_403_FORBIDDEN)
    
    # If is_ent is True, check if user is an entrepreneur
    elif is_ent:
        try:
            from entrepreneurs.models import Entrepreneur
            from entrepreneurs.serializers import EntrepreneurSerializer
            entrepreneur = Entrepreneur.objects.get(user=user)
            # Serialize entrepreneur data
            entrepreneur_data = EntrepreneurSerializer(entrepreneur).data
            
            # User is an entrepreneur, proceed with login
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'email': user.email,
                'username': user.username,
                'is_entrepreneur': True,
                'account_verified': account_verified,
                'entrepreneur': entrepreneur_data,
                'status': 'success'
            }, status=status.HTTP_200_OK)
        except Entrepreneur.DoesNotExist:
            # User is not an entrepreneur
            return Response({
                'error': 'User is not an entrepreneur',
                'status': 'failed'
            }, status=status.HTTP_403_FORBIDDEN)
    
    else:
        # Regular user login (not manager or entrepreneur)
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'email': user.email,
            'username': user.username,
            'is_manager': False,
            'is_entrepreneur': False,
            'account_verified': account_verified,
            'status': 'success'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@require_verified_account_api
def hostel_list_view(request):
    # Get all hostels first
    hostels = Hostel.objects.all()
    
    # Apply gender filtering if user has gender set
    if request.user.is_authenticated:
        try:
            from user_auth.models import Gender
            gender_obj = Gender.objects.get(user=request.user)
            user_gender = gender_obj.gender.lower() if gender_obj.gender else None
            
            if user_gender:
                # Filter hostels to show only those that accept the user's gender
                hostels = hostels.filter(
                    gender_type__in=[user_gender, 'mixed']
                )
        except Gender.DoesNotExist:
            # User has no gender set, show all hostels
            pass
        except Exception as e:
            print(f"Error filtering hostels by gender: {e}")
            # On error, show all hostels
    
    # Order by ratings (highest first) and serialize
    hostels = hostels.order_by("-ratings")
    serializer = HostelSerializer(hostels, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@require_verified_account_api
def landing_page(request): 
    if request.user.is_authenticated: 
        data = {
            'username': request.user.username,
        }
        return Response(data)
    else: 
        data = {
            'username': request.user.username,
        }
        return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])  # <-- THIS MAKES IT PUBLIC
def signup(request):
    email = request.data.get("email")
    password = request.data.get("password")
    gender = request.data.get("gender")
    phone = request.data.get("phone")
    
    # Generate username from email (before @ symbol)
    username = email.split('@')[0] if email else None
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response({
            "error": "Email already exists",
            "message": "A user with this email already exists"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists, if so append a number
    original_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{original_username}{counter}"
        counter += 1
    
    user = User.objects.create_user(username=username, password=password, email=email)

    # Create Gender record if gender is provided
    if gender:
        Gender.objects.create(user=user, gender=gender)

    # Create or update UserProfile with phone if provided
    if phone:
        profile, _created = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.save()

    # Create UserVerification with account_verified=False and send email
    verification = UserVerification.objects.create(user=user, account_verified=False)
    verification.send_verification_email()

    # generate token
    token, created = Token.objects.get_or_create(user=user)

    print(request.POST)

    return Response({
        "token": token.key,
        "email": user.email,
        "username": user.username,
        "account_verified": False,
        "message": "Account created successfully. Please check your email to verify your account."
    }, status=status.HTTP_201_CREATED)


import json


import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
from decouple import config 
PAYSTACK_PUBLIC_KEY = config('PAYSTACK_PUBLIC_KEY')
@api_view(['POST'])
@require_verified_account_api
def initiate_payment(request):
    if request.method == 'POST': 
        data = {
            "public_key": PAYSTACK_PUBLIC_KEY,
            "email": request.user.email
        }
    
    return JsonResponse(data)

from django.utils import timezone

from django.http import JsonResponse
# from django_q.tasks import schedule
from datetime import timedelta
from django.utils import timezone


from consumers.models import Consumer

def create_room(user, room_uuid, amount, hostel=None):
    consumer = Consumer.objects.create(
        user=user,
        room_uuid=room_uuid,
        amount=amount,
        hostel=hostel
    )

    consumer.save()

    
    print(f"Room created for user {user.username} with room_uuid {consumer.room_uuid}")
    return {"room_uuid": consumer.room_uuid, "reference": consumer.reference if consumer.reference else None}

from hq.models import Hostel
from payment_account.models import PaymentAccount
PAYSTACK_SECRET_KEY = config("PAYSTACK_SECRET_KEY")

@api_view(['POST'])
@require_verified_account_api
def verify_payment(request):
    body_unicode = request.body  # Convert bytes -> string
    body_data = json.loads(body_unicode)          # Convert string -> dict

    email = body_data.get("email")
    amount = int(body_data.get("amount"))  # amount comes as string, cast to int
    room_uuid = body_data.get('room_uuid') or request.data.get('room_uuid')
    room_number = body_data.get('room_number') or request.data.get('room_number')  # legacy support
    hostel = int(body_data.get('hostel_id'))

    # Debug incoming payloads
    print("[verify_payment] raw body:", body_unicode)
    print("[verify_payment] request.data:", dict(request.data) if hasattr(request, 'data') else None)
    print("[verify_payment] parsed -> email:", email, "amount:", amount, "hostel_id:", hostel, "room_uuid:", room_uuid, "room_number:", room_number)


    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    # Get hostel and manager for subaccount payment
    actual_hostel = Hostel.objects.get(id=hostel)
    manager = actual_hostel.manager
    
    # Prepare payment data with subaccount configuration
    data = {
        "email": email,
        "amount": amount,  # amount in kobo
    }
    
    # Add subaccount configuration if manager has payment account
    try:
        payment_account = PaymentAccount.objects.get(manager=manager)
        
        # Calculate platform fee based on share percentage
        platform_fee_kobo = int((amount * payment_account.platform_share_percentage) / 100)
        
        # Configure subaccount payment with calculated platform fee
        data.update({
            "subaccount": payment_account.account_code,
            "transaction_charge": platform_fee_kobo,  # Calculated platform fee in kobo
            "bearer": "account"  # Platform account bears all Paystack fees
        })
        
        print(f"Payment configured with subaccount: {payment_account.account_code}")
        print(f"Platform share: {payment_account.platform_share_percentage}%")
        print(f"Platform fee: ₦{platform_fee_kobo / 100}")
        print(f"Manager will receive: ₦{(amount - platform_fee_kobo) / 100}")
        
    except PaymentAccount.DoesNotExist:
        print("No payment account found for manager - proceeding without subaccount")
        # If no payment account, proceed with regular payment (no split)
    except Exception as e:
        print(f"Error setting up subaccount payment: {e}")
        # On error, proceed with regular payment
    
    response = requests.post("https://api.paystack.co/transaction/initialize", headers=headers, json=data)
    resp_data = response.json()

    from django_q.tasks import async_task

    print(resp_data)
    # Create Consumer with is_active=False
    reference = resp_data["data"].get("reference")

    # Resolve room_uuid if only legacy room_number provided or if payload sends nested room_details
    if not room_uuid and actual_hostel.room_details:
        try:
            rooms = actual_hostel.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)
            idx = int(room_number) if room_number is not None else None
            if idx is not None and 0 <= idx < len(rooms):
                room_uuid = rooms[idx].get('uuid')
            # Fallback: if client sent an object like room_details with uuid
            if not room_uuid:
                incoming_room = body_data.get('room_details') or request.data.get('room_details')
                if isinstance(incoming_room, dict):
                    room_uuid = incoming_room.get('uuid')
        except Exception:
            room_uuid = None

    print("[verify_payment] resolved room_uuid:", room_uuid)

    consumer = Consumer.objects.create(
        user=request.user,
        room_uuid=room_uuid,
        amount=(amount/100),
        is_active=False,
        reference=reference,
        hostel=actual_hostel
    )
    print("[verify_payment] consumer created id:", consumer.id, "room_uuid:", consumer.room_uuid, "reference:", consumer.reference)
    consumer.save()

    # # Enqueue task to check this payment
    # if resp_data:
    #     async_task("hq.tasks.verify_payment", resp_data["data"]["reference"])


    # return JsonResponse({"status": "pending", "reference": resp_data['data']['reference']})

    return Response({
        "authorization_url": resp_data["data"]["authorization_url"],
        "reference": resp_data["data"]["reference"],
        "room_uuid": room_uuid,
    })

# hq/views.py

import os
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BasicAuthentication
from django.core.mail import send_mail

PAYSTACK_SECRET_KEY = config("PAYSTACK_SECRET_KEY")
@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def paystack_callback(request):
    try:
        try:
            payload = json.loads(request.body.decode() or "{}")
        except Exception:
            payload = {}

        reference = (
            payload.get("data", {}).get("reference")
            or payload.get("reference")
            or request.GET.get('reference')
        )

        if not reference:
            return JsonResponse({"status": "error", "message": "Missing reference"}, status=400)

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        verify_url = f"https://api.paystack.co/transaction/verify/{reference}"
        response = requests.get(verify_url, headers=headers, timeout=10)
        result = response.json()

        if result.get("status") and result.get("data", {}).get("status") == "success":
            consumer = Consumer.objects.filter(reference=reference).first()
            if consumer:
                consumer.is_active = True
                consumer.save()
                # Log subaccount payment information if available
                if "subaccount" in result["data"]:
                    subaccount_info = result["data"]["subaccount"]
                    print(f"Subaccount payment successful: {subaccount_info}")
                    
                    # Log transaction details for audit
                    transaction_data = result["data"]
                    print(f"Transaction amount: ₦{transaction_data.get('amount', 0) / 100}")
                    print(f"Transaction charge: ₦{transaction_data.get('transaction_charge', 0) / 100}")
                    print(f"Manager receives: ₦{(transaction_data.get('amount', 0) - transaction_data.get('transaction_charge', 0)) / 100}")
                    
            # Send payment confirmation email using the new email service
            try:
                from email_service.utils import notify_payment_confirmed
                # Create a payment object for the email service
                payment_data = {
                    'amount': consumer.amount,
                    'reference': consumer.reference,
                    'created_at': consumer.created_at,
                }
                notify_payment_confirmed(payment_data, consumer.user)
            except Exception as e:
                # Fallback to simple email if the new service fails
                send_mail(
                    subject='Payment Confirmation',
                    message='Your payment was successful.',
                    from_email='HostTels <developers@kwabenaboakyeroyalventures.com>',
                    recipient_list=[consumer.user.email],
                    fail_silently=False,
                )
            return JsonResponse({"status": "success"})

        return JsonResponse({"status": "error", "message": "Verification failed"}, status=400)

    except Exception as e:
        print("❌ Error in callback:", str(e))
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    

@api_view(['POST'])
@require_verified_account_api
def consumer_request(request): 
    # Get the most recent consumer deterministically
    consumer = (
        Consumer.objects
        .filter(user=request.user)
        .order_by('-date_created', '-id')
        .first()
    )

    # Handle case where no consumer exists yet
    if not consumer:
        return JsonResponse({
            'status': 'No consumer record found for this user',
            'stat': None,
            'user': f'{request.user.username}',
        }, status=404)

    hostel_data = HostelSerializer(consumer.hostel).data if consumer.hostel else None

    if consumer.is_active: 
        response = {
            'status': 'This user has successfully verified their payment',
            'stat': f'{consumer.is_active}',
            'user': f'{consumer.user.username}',
            'data': hostel_data,
            'room_uuid': f'{consumer.room_uuid}',
        }
    else: 
        response = {
            'status': 'This user has not verified their payment',
            'stat': f'{consumer.is_active}',
            'user': f'{consumer.user.username}',
            'data': hostel_data,
            'room_uuid': f'{consumer.room_uuid}',
        }
    return JsonResponse(response)
    


from location.models import Location

from .serializers import CampusSerializer

@api_view(['GET', 'POST'])
@require_verified_account_api
def search_request(request): 
    if request.method == "GET":
        campus_list = Location.objects.all()
        campus_serializer = CampusSerializer(campus_list, many=True)
        return Response(campus_serializer.data)

    if request.method == "POST":
        location = json.loads(request.body).get('location')

        try:
            campus = Location.objects.get(campus=location)
            hostels = Hostel.objects.filter(campus=campus)
        except Location.DoesNotExist:
            return Response({'status': 'No campus found'}, status=404)

        # Apply gender filtering if user has gender set
        if request.user.is_authenticated:
            try:
                from user_auth.models import Gender
                gender_obj = Gender.objects.get(user=request.user)
                user_gender = gender_obj.gender.lower() if gender_obj.gender else None
                
                if user_gender:
                    # Filter hostels to show only those that accept the user's gender
                    hostels = hostels.filter(
                        gender_type__in=[user_gender, 'mixed']
                    )
            except Gender.DoesNotExist:
                # User has no gender set, show all hostels
                pass
            except Exception as e:
                print(f"Error filtering hostels by gender in search: {e}")
                # On error, show all hostels

        hostel_serializer = HostelSerializer(hostels, many=True)

        if not hostels.exists():
            return Response({'status': 'No hostel result'}, status=404)

        return Response({'data': hostel_serializer.data})



@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """
    Verify user email with the provided token and return JSON response
    """
    try:
        verification = UserVerification.objects.get(verification_token=token)
        
        if verification.account_verified:
            return Response({
                'status': 'success',
                'message': 'Email already verified',
                'account_verified': True,
                'email': verification.user.email,
                'username': verification.user.username
            }, status=status.HTTP_200_OK)
        
        # Verify the account
        verification.account_verified = True
        verification.save()
        
        return Response({
            'status': 'success',
            'message': 'Email verified successfully',
            'account_verified': True,
            'email': verification.user.email,
            'username': verification.user.username
        }, status=status.HTTP_200_OK)
        
    except UserVerification.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Invalid verification token',
            'account_verified': False
        }, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@require_verified_account_api
def assign_hostel_category(request):
    """
    API endpoint to manually assign/update category for a specific hostel
    """
    hostel_id = request.data.get('hostel_id')
    
    if not hostel_id:
        return Response({
            'status': 'error',
            'message': 'hostel_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find hostel by ID
        hostel = Hostel.objects.get(id=hostel_id)
        
        # Get current category
        current_category = hostel.category.name if hostel.category else 'None'
        
        # Get auto-assigned category
        auto_category = hostel.get_auto_category()
        
        if auto_category:
            # Update the hostel's category
            hostel.category = auto_category
            hostel.save(update_fields=['category'])
            
            return Response({
                'status': 'success',
                'message': f'Category updated successfully',
                'hostel_name': hostel.name,
                'previous_category': current_category,
                'new_category': auto_category.name,
                'category_id': auto_category.id
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': 'Could not determine appropriate category for this hostel',
                'hostel_name': hostel.name,
                'current_category': current_category
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Hostel.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Hostel with ID {hostel_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def activate_user_account(request):
    """
    API endpoint to activate user account by email
    """
    email = request.data.get('email')
    
    if not email:
        return Response({
            'status': 'error',
            'message': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user by email
        user = User.objects.get(email=email)
        
        # Get or create verification record
        verification, created = UserVerification.objects.get_or_create(
            user=user,
            defaults={'account_verified': False}
        )
        
        if verification.account_verified:
            return Response({
                'status': 'success',
                'message': 'Account is already activated',
                'account_verified': True,
                'email': user.email,
                'username': user.username
            }, status=status.HTTP_200_OK)
        
        # Activate the account
        verification.account_verified = True
        verification.save()
        
        return Response({
            'status': 'success',
            'message': 'Account activated successfully',
            'account_verified': True,
            'email': user.email,
            'username': user.username,
            'user_id': user.id
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def create_review_api(request):
    """
    API endpoint to create a review and rating for a hostel
    """
    try:
        # Get the token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Token '):
            return Response({
                'status': 'error',
                'message': 'Token authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        token_key = auth_header.split(' ')[1]
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get the consumer's hostel
        try:
            consumer = Consumer.objects.get(user=user)
            hostel = consumer.hostel
        except Consumer.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Consumer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get review data
        review_text = request.data.get('review', '')
        rating = request.data.get('rating')
        
        if not rating or not review_text:
            return Response({
                'status': 'error',
                'message': 'Rating and review text are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate rating
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError("Rating must be between 1 and 5")
        except (ValueError, TypeError):
            return Response({
                'status': 'error',
                'message': 'Rating must be a number between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create rating entry
        rating_dict = {
            1: one_star,
            2: two_star,
            3: three_star,
            4: four_star,
            5: five_star
        }
        
        rating_dict[rating].objects.create(product=hostel)
        
        # Create review entry
        review = Reviews.objects.create(
            user=user,
            hostel=hostel,
            review=review_text,
            rating=rating
        )
        
        return Response({
            'status': 'success',
            'message': 'Review created successfully',
            'data': {
                'id': review.id,
                'rating': review.rating,
                'review': review.review,
                'created_at': review.created_at,
                'hostel_id': hostel.id
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_reviews_api(request, hostel_id):
    """
    API endpoint to get reviews for a specific hostel
    """
    try:
        # Get reviews for the hostel
        reviews = Reviews.objects.filter(hostel_id=hostel_id).order_by('-created_at')
        
        reviews_data = []
        for review in reviews:
            reviews_data.append({
                'id': review.id,
                'user_id': review.user.id,
                'user_email': review.user.email,
                'rating': review.rating,
                'review': review.review,
                'created_at': review.created_at
            })
        
        return Response({
            'status': 'success',
            'data': reviews_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['POST'])
@require_verified_account_api
def create_store(request):
    """
    Create a store, entrepreneur, and commodities for a user.
    This endpoint creates:
    1. Store with name, description, location
    2. Commodities (products/services) for the store
    3. Entrepreneur record linking user to store
    """
    try:
        user = request.user
          
        # Check if user already has a store/entrepreneur record
        try:
            from entrepreneurs.models import Entrepreneur
            existing_entrepreneur = Entrepreneur.objects.filter(user=user).first()
            if existing_entrepreneur:
                return Response({
                    'error': 'User already has a store',
                    'message': 'You already have a store. You can only have one store per account.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error checking existing entrepreneur: {e}")
        
        # Get store data
        store_name = request.data.get('name')
        store_description = request.data.get('description', '')
        store_location = request.data.get('location', '')
        commodities_data = request.data.get('commodities', [])
        
        if not store_name:
            return Response({
                'error': 'Store name is required',
                'message': 'Please provide a name for your store'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Import models
        from entrepreneurs.models import Store, Commodity, Entrepreneur
        from entrepreneurs.serializers import StoreSerializer, EntrepreneurSerializer
        
        # Auto-populate location from consumer if user is a consumer
        if not store_location:
            try:
                from consumers.models import Consumer
                consumer = Consumer.objects.filter(user=user, is_active=True).first()
                if consumer and consumer.hostel and consumer.hostel.campus:
                    store_location = consumer.hostel.campus.campus
            except Exception as e:
                print(f"Error getting consumer location: {e}")
        
        # Create Store
        store = Store.objects.create(
            name=store_name,
            description=store_description,
            location=store_location
        )
        
        # Create Commodities
        created_commodities = []
        for commodity_data in commodities_data:
            commodity_name = commodity_data.get('name')
            commodity_type = commodity_data.get('type', 'product')
            commodity_description = commodity_data.get('description', '')
            commodity_price = commodity_data.get('price')
            
            if commodity_name:
                commodity = Commodity.objects.create(
                    store=store,
                    name=commodity_name,
                    description=commodity_description,
                    type=commodity_type,
                    price=commodity_price
                )
                created_commodities.append(commodity)
        
        # Create Entrepreneur
        entrepreneur = Entrepreneur.objects.create(
            user=user,
            store=store,
            location=store_location
        )
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_store_created
            notify_market_store_created(user, store)
        except Exception as email_error:
            print(f"Failed to send action notification for store creation: {str(email_error)}")
        
        # Send welcome email to entrepreneur
        try:
            subject = 'Welcome to sitysns Marketplace - You\'re Now a Seller!'
            message = f"""
Dear {user.username or user.email},

Congratulations! You have successfully created your store on sitysns Marketplace.

🎉 What this means:
- You can now list and sell products and services
- Reach buyers within your campus/hostel community
- Manage your store, products, and orders from your dashboard
- Track your sales and earnings

🏪 Your Store: {store_name}
📍 Location: {store_location or 'Not specified'}

🚀 Getting Started:
1. Visit your Store Dashboard to manage your products
2. Add products and services to your store
3. Set prices and descriptions
4. Start receiving orders from buyers!

💰 Earnings:
- You receive the product price minus a 1.5% service fee
- Track all your transactions in the Analytics section
- View your earnings in your Wallet

📊 Access Your Store:
Visit: {getattr(settings, 'FRONTEND_URL', 'http://localhost:5175')}/my-store

Need help? Contact our support team.

Best regards,
The sitysns Marketplace Team
            """.strip()
            
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@sitysns.com'),
                recipient_list=[user.email],
                fail_silently=True,  # Don't fail store creation if email fails
            )
        except Exception as email_error:
            print(f"Error sending entrepreneur welcome email: {email_error}")
            # Don't fail store creation if email fails
        
        # Serialize response
        store_serializer = StoreSerializer(store)
        entrepreneur_serializer = EntrepreneurSerializer(entrepreneur)
        
        return Response({
            'status': 'success',
            'message': 'Store created successfully',
            'store': store_serializer.data,
            'entrepreneur': entrepreneur_serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error creating store: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to create store',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== MARKETPLACE API ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_listings(request):
    """
    Get all listings (commodities) with filtering, pagination, and search.
    Query params:
    - category: filter by category (optional)
    - type: 'all', 'product', or 'service' (optional)
    - sortBy: 'recent', 'price-low', 'price-high', 'popular' (optional)
    - page: page number (default: 1)
    - pageSize: items per page (default: 24)
    - q: search query (optional)
    """
    try:
        from entrepreneurs.models import Store, Commodity
        from entrepreneurs.serializers import CommoditySerializer, StoreSerializer
        
        # Get query parameters
        category = request.GET.get('category', 'all')
        listing_type = request.GET.get('type', 'all')
        sort_by = request.GET.get('sortBy', 'recent')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('pageSize', 24))
        search_query = request.GET.get('q', '').strip()
        
        # Start with all commodities
        commodities = Commodity.objects.select_related('store').all()
        
        # Filter by type
        if listing_type != 'all':
            commodities = commodities.filter(type=listing_type)
        
        # Search filter
        if search_query:
            from django.db.models import Q
            commodities = commodities.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(store__name__icontains=search_query)
            )
        
        # Category filter
        if category and category != 'all':
            commodities = commodities.filter(category_slug=category)
        
        # Sorting
        if sort_by == 'price-low':
            commodities = commodities.order_by('price')
        elif sort_by == 'price-high':
            commodities = commodities.order_by('-price')
        elif sort_by == 'popular':
            # For now, sort by created_at (can be enhanced with views/orders count)
            commodities = commodities.order_by('-created_at')
        else:  # 'recent' or default
            commodities = commodities.order_by('-created_at')
        
        # Pagination
        total = commodities.count()
        start = (page - 1) * page_size
        end = start + page_size
        paginated_commodities = commodities[start:end]
        
        # Serialize commodities with store info
        items = []
        for commodity in paginated_commodities:
            serializer = CommoditySerializer(commodity)
            item_data = serializer.data
            
            # Add store information
            store_serializer = StoreSerializer(commodity.store)
            item_data['store'] = store_serializer.data
            item_data['store_name'] = commodity.store.name
            item_data['store_id'] = commodity.store.id
            
            # Format for frontend
            items.append({
                'id': item_data['id'],
                'name': item_data['name'],
                'description': item_data['description'],
                'type': item_data['type'],
                'category': item_data.get('category_slug'),
                'category_slug': item_data.get('category_slug'),
                'price': float(item_data['price']) if item_data['price'] else None,
                'store_id': item_data['store_id'],
                'store_name': item_data['store_name'],
                'store': item_data['store'],
                'primary_image': item_data.get('image_url') or item_data.get('primary_image'),
                'image_url': item_data.get('image_url'),
                'created_at': item_data['created_at'],
                'updated_at': item_data['updated_at'],
            })
        
        return Response({
            'items': items,
            'page': page,
            'pageSize': page_size,
            'total': total,
            'totalPages': (total + page_size - 1) // page_size,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching listings: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch listings',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_product_by_id(request, product_id):
    """Get a single product/commodity by ID"""
    try:
        from entrepreneurs.models import Commodity
        from entrepreneurs.serializers import CommoditySerializer, StoreSerializer
        
        try:
            commodity = Commodity.objects.select_related('store').get(id=product_id)
        except Commodity.DoesNotExist:
            return Response({
                'error': 'Product not found',
                'message': 'The requested product does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CommoditySerializer(commodity)
        item_data = serializer.data
        
        # Add store information
        store_serializer = StoreSerializer(commodity.store)
        item_data['store'] = store_serializer.data
        item_data['store_name'] = commodity.store.name
        item_data['store_id'] = commodity.store.id
        
        return Response({
            'id': item_data['id'],
            'name': item_data['name'],
            'description': item_data['description'],
            'type': item_data['type'],
            'category': item_data.get('category_slug'),
            'category_slug': item_data.get('category_slug'),
            'price': float(item_data['price']) if item_data['price'] else None,
            'store_id': item_data['store_id'],
            'store_name': item_data['store_name'],
            'store': item_data['store'],
            'primary_image': item_data.get('image_url') or item_data.get('primary_image'),
            'image_url': item_data.get('image_url'),
            'created_at': item_data['created_at'],
            'updated_at': item_data['updated_at'],
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching product: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch product',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_store_by_id(request, store_id):
    """Get a single store by ID with its commodities"""
    try:
        from entrepreneurs.models import Store
        from entrepreneurs.serializers import StoreSerializer
        
        try:
            store = Store.objects.prefetch_related('commodities').get(id=store_id)
        except Store.DoesNotExist:
            return Response({
                'error': 'Store not found',
                'message': 'The requested store does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = StoreSerializer(store)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching store: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch store',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_store_products(request, store_id):
    """Get all products/commodities for a specific store"""
    try:
        from entrepreneurs.models import Store, Commodity
        from entrepreneurs.serializers import CommoditySerializer, StoreSerializer
        
        # Check if store exists
        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({
                'error': 'Store not found',
                'message': 'The requested store does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all commodities for this store
        commodities = Commodity.objects.filter(store=store).select_related('store').order_by('-created_at')
        
        # Serialize commodities with store info
        items = []
        for commodity in commodities:
            serializer = CommoditySerializer(commodity)
            item_data = serializer.data
            
            # Add store information
            store_serializer = StoreSerializer(commodity.store)
            item_data['store'] = store_serializer.data
            item_data['store_name'] = commodity.store.name
            item_data['store_id'] = commodity.store.id
            
            # Format for frontend
            items.append({
                'id': item_data['id'],
                'name': item_data['name'],
                'description': item_data['description'],
                'type': item_data['type'],
                'category_slug': item_data.get('category_slug', None),
                'price': float(item_data['price']) if item_data['price'] else None,
                'store_id': item_data['store_id'],
                'store_name': item_data['store_name'],
                'store': item_data['store'],
                'image_url': item_data.get('image_url', None),
                'primary_image': item_data.get('primary_image', None),
                'created_at': item_data['created_at'],
                'updated_at': item_data['updated_at'],
            })
        
        return Response(items, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching store products: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch store products',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_categories(request):
    """Get all categories (for now, return static categories)"""
    try:
        # For now, return static categories based on commodity types
        # This can be enhanced later with a Category model
        categories = [
            {'id': 'electronics', 'name': 'Electronics'},
            {'id': 'furniture', 'name': 'Furniture'},
            {'id': 'clothing', 'name': 'Clothing & Accessories'},
            {'id': 'books', 'name': 'Books & Supplies'},
            {'id': 'food', 'name': 'Food & Beverages'},
            {'id': 'academic', 'name': 'Academic Services'},
            {'id': 'design', 'name': 'Design & Creative'},
            {'id': 'tech', 'name': 'Tech Services'},
            {'id': 'personal', 'name': 'Personal Services'},
            {'id': 'delivery', 'name': 'Delivery & Logistics'},
        ]
        
        return Response(categories, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching categories: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch categories',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entrepreneur_me(request):
    """Get current user's entrepreneur status and data"""
    try:
        from entrepreneurs.models import Entrepreneur
        from entrepreneurs.serializers import EntrepreneurSerializer, StoreSerializer
        
        if not request.user.is_authenticated:
            return Response({
                'is_entrepreneur': False,
                'entrepreneur': None,
                'store': None,
                'message': 'User is not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur:
            return Response({
                'is_entrepreneur': False,
                'entrepreneur': None,
                'store': None,
                'message': 'User is not an entrepreneur'
            }, status=status.HTTP_200_OK)
        
        try:
            entrepreneur_serializer = EntrepreneurSerializer(entrepreneur)
            store_data = None
            if entrepreneur.store:
                try:
                    store_serializer = StoreSerializer(entrepreneur.store)
                    store_data = store_serializer.data
                except Exception as store_err:
                    print(f"Error serializing store: {store_err}")
                    # Fallback: return basic store info
                    store_data = {
                        'id': entrepreneur.store.id,
                        'name': entrepreneur.store.name,
                        'description': getattr(entrepreneur.store, 'description', ''),
                    }
            
            return Response({
                'is_entrepreneur': True,
                'entrepreneur': entrepreneur_serializer.data,
                'store': store_data,
                'message': 'User is an entrepreneur'
            }, status=status.HTTP_200_OK)
        except Exception as ser_err:
            import traceback
            print(f"Error serializing entrepreneur: {ser_err}")
            print(traceback.format_exc())
            # Fallback: return basic entrepreneur info
            return Response({
                'is_entrepreneur': True,
                'entrepreneur': {
                    'id': entrepreneur.id,
                    'store_id': entrepreneur.store.id if entrepreneur.store else None,
                    'store': {
                        'id': entrepreneur.store.id,
                        'name': entrepreneur.store.name,
                    } if entrepreneur.store else None,
                },
                'store': {
                    'id': entrepreneur.store.id,
                    'name': entrepreneur.store.name,
                } if entrepreneur.store else None,
                'message': 'User is an entrepreneur'
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching entrepreneur status: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch entrepreneur status',
            'message': f'An error occurred: {str(e)}',
            'is_entrepreneur': False,
            'entrepreneur': None,
            'store': None,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_my_store(request):
    """Get current user's store"""
    try:
        from entrepreneurs.models import Entrepreneur
        from entrepreneurs.serializers import StoreSerializer, EntrepreneurSerializer
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        store_serializer = StoreSerializer(entrepreneur.store)
        entrepreneur_serializer = EntrepreneurSerializer(entrepreneur)
        
        return Response({
            'store': store_serializer.data,
            'entrepreneur': entrepreneur_serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching my store: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch store',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_my_store_products(request):
    """Get current user's store products/commodities"""
    try:
        from entrepreneurs.models import Entrepreneur, Commodity
        from entrepreneurs.serializers import CommoditySerializer
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        commodities = Commodity.objects.filter(store=entrepreneur.store).order_by('-created_at')
        serializer = CommoditySerializer(commodities, many=True)
        
        return Response({
            'products': serializer.data,
            'count': commodities.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching store products: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch products',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@require_verified_account_api
def update_store_settings(request):
    """Update store settings"""
    try:
        from entrepreneurs.models import Entrepreneur, Store
        from entrepreneurs.serializers import StoreSerializer
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        store = entrepreneur.store
        
        # Update store fields
        if 'name' in request.data:
            store.name = request.data['name']
        if 'description' in request.data:
            store.description = request.data['description']
        if 'location' in request.data:
            store.location = request.data['location']
        
        store.save()
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_store_updated
            user = request.user
            changes = {
                'name': request.data.get('name'),
                'description': request.data.get('description'),
                'location': request.data.get('location'),
            }
            notify_market_store_updated(user, store, changes)
        except Exception as email_error:
            print(f"Failed to send action notification for store update: {str(email_error)}")
        
        serializer = StoreSerializer(store)
        return Response({
            'status': 'success',
            'message': 'Store settings updated successfully',
            'store': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error updating store settings: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to update store settings',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def create_listing(request):
    """Create a new listing (commodity) for the user's store"""
    try:
        from entrepreneurs.models import Entrepreneur, Commodity
        from entrepreneurs.serializers import CommoditySerializer
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get commodity data
        name = request.data.get('name')
        description = request.data.get('description', '')
        commodity_type = request.data.get('type', 'product')
        category_slug = request.data.get('category_slug') or request.data.get('category')
        price = request.data.get('price')
        # Prefer path over URL if available (more reliable)
        primary_image = request.data.get('primary_image_path') or request.data.get('primary_image')  # Can be path, URL, or file
        tags = request.data.get('tags', [])
        stock_quantity = request.data.get('stock_quantity')
        
        if not name:
            return Response({
                'error': 'Name is required',
                'message': 'Please provide a name for the listing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create commodity first to get ID
        commodity = Commodity.objects.create(
            store=entrepreneur.store,
            name=name,
            description=description,
            type=commodity_type,
            category_slug=category_slug,
            price=price
        )
        
        # Get store_id and user_id for path construction
        store_id = entrepreneur.store.id
        user_id = request.user.id
        
        # Handle image - save primary_image path/URL to the image field
        if primary_image:
            # If primary_image is a string (path or URL), process it
            if isinstance(primary_image, str):
                # Check if it's already a path (no http:// or /media/ prefix)
                # Paths from upload endpoint are like: store/1/2/product_images/temp_file.jpg
                # URLs are like: http://localhost:8000/media/store/1/2/product_images/temp_file.jpg
                if '://' not in primary_image and not primary_image.startswith('/media/'):
                    # It's already a path, use it directly
                    image_path = primary_image
                    print(f"[DEBUG] Using primary_image as path directly: {image_path}")
                else:
                    # It's a URL, extract the path
                    image_path = primary_image
                    print(f"[DEBUG] Original primary_image (URL): {primary_image}")
                    
                    # Remove protocol and domain if present
                    if '://' in image_path:
                        image_path = image_path.split('://', 1)[1]
                        if '/' in image_path:
                            image_path = '/' + image_path.split('/', 1)[1]
                    
                    # Remove /media/ prefix if present
                    if '/media/' in image_path:
                        image_path = image_path.split('/media/')[-1]
                    elif image_path.startswith('media/'):
                        image_path = image_path.replace('media/', '', 1)
                    
                    # Remove leading slash
                    if image_path.startswith('/'):
                        image_path = image_path.lstrip('/')
                    
                    print(f"[DEBUG] Extracted image_path from URL: {image_path}")
                
                print(f"[DEBUG] Final image_path: {image_path}")
                print(f"[DEBUG] Checking if file exists in storage at: {image_path}")
                
                # Check if it's a temp path (needs to be moved to final location)
                if 'temp_' in image_path and default_storage.exists(image_path):
                    print(f"[DEBUG] Temp file detected, moving to final location...")
                    try:
                        # Extract filename from temp path (remove temp_ prefix)
                        # Path format: store/{user_id}/{store_id}/product_images/temp_{timestamp}_{filename}
                        # Final format: store/{user_id}/{store_id}/product_images/{product_id}_{timestamp}_{filename}
                        temp_filename = os.path.basename(image_path)
                        # Remove 'temp_' prefix from filename
                        final_filename = temp_filename.replace('temp_', '', 1) if temp_filename.startswith('temp_') else temp_filename
                        
                        # Construct final path with product_id
                        final_path = f'store/{user_id}/{store_id}/product_images/{commodity.id}_{final_filename}'
                        
                        print(f"[DEBUG] Moving from: {image_path}")
                        print(f"[DEBUG] Moving to: {final_path}")
                        
                        # Open temp file and save to final location
                        temp_file = default_storage.open(image_path, 'rb')
                        final_saved_path = default_storage.save(final_path, temp_file)
                        temp_file.close()
                        
                        # Delete temp file
                        try:
                            default_storage.delete(image_path)
                            print(f"[DEBUG] Deleted temp file: {image_path}")
                        except Exception as delete_error:
                            print(f"[DEBUG] Warning: Failed to delete temp file: {delete_error}")
                        
                        # Set commodity image to final path
                        commodity.image.name = final_saved_path
                        commodity.save(update_fields=['image'])
                        print(f"[DEBUG] Saved commodity.image.name: {commodity.image.name}")
                        print(f"[DEBUG] Commodity.image.url: {commodity.image.url if commodity.image else 'None'}")
                    except Exception as move_error:
                        print(f"[DEBUG] Error moving temp file: {move_error}")
                        import traceback
                        print(traceback.format_exc())
                        # Fallback: use temp path if move fails
                        commodity.image.name = image_path
                        commodity.save(update_fields=['image'])
                        print(f"[DEBUG] Fallback: Using temp path due to move error")
                elif default_storage.exists(image_path):
                    # File exists and is not a temp path (already in final location, e.g., from edit)
                    print(f"[DEBUG] File exists! Setting ImageField...")
                    commodity.image.name = image_path
                    commodity.save(update_fields=['image'])
                    print(f"[DEBUG] Saved commodity.image.name: {commodity.image.name}")
                    print(f"[DEBUG] Commodity.image.url: {commodity.image.url if commodity.image else 'None'}")
                else:
                    print(f"[DEBUG] WARNING: File not found in storage at path: {image_path}")
                    # If file doesn't exist, try to set the path directly as fallback
                    commodity.image.name = image_path
                    commodity.save(update_fields=['image'])
                    print(f"[DEBUG] Set image path directly (file may not exist): {image_path}")
            elif hasattr(primary_image, 'read'):
                # If primary_image is a file object, save it directly
                file_name = primary_image.name if hasattr(primary_image, 'name') else f'image_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg'
                # Use the new path structure
                final_filename = f'store/{user_id}/{store_id}/product_images/{commodity.id}_{file_name}'
                commodity.image.save(final_filename, primary_image, save=False)
                commodity.save(update_fields=['image'])
                print(f"[DEBUG] Saved commodity.image from file object: {commodity.image.name}")
        else:
            print(f"[DEBUG] No primary_image provided")
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_listing_created
            notify_market_listing_created(request.user, commodity)
        except Exception as email_error:
            print(f"Failed to send action notification for listing creation: {str(email_error)}")
        
        serializer = CommoditySerializer(commodity)
        product_data = serializer.data
        
        # Add store information for frontend compatibility
        from entrepreneurs.serializers import StoreSerializer
        store_serializer = StoreSerializer(commodity.store)
        product_data['store'] = store_serializer.data
        product_data['store_name'] = commodity.store.name
        product_data['store_id'] = commodity.store.id
        product_data['primary_image'] = product_data.get('image_url') or primary_image
        product_data['tags'] = tags if isinstance(tags, list) else []
        if stock_quantity is not None:
            product_data['stock_quantity'] = stock_quantity
        
        return Response({
            'status': 'success',
            'message': 'Listing created successfully',
            'product': product_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error creating listing: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to create listing',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@require_verified_account_api
def update_listing(request, commodity_id):
    """Update an existing listing (commodity) for the user's store"""
    try:
        from entrepreneurs.models import Entrepreneur, Commodity
        from entrepreneurs.serializers import CommoditySerializer
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get the commodity
        try:
            commodity = Commodity.objects.get(id=commodity_id, store=entrepreneur.store)
        except Commodity.DoesNotExist:
            return Response({
                'error': 'Listing not found',
                'message': 'The requested listing does not exist or does not belong to your store'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get commodity data
        name = request.data.get('name')
        description = request.data.get('description', '')
        commodity_type = request.data.get('type', 'product')
        category_slug = request.data.get('category_slug') or request.data.get('category')
        price = request.data.get('price')
        # Prefer path over URL if available (more reliable)
        primary_image = request.data.get('primary_image_path') or request.data.get('primary_image')  # Can be path, URL, or file
        tags = request.data.get('tags', [])
        stock_quantity = request.data.get('stock_quantity')
        
        # Update commodity fields
        if name:
            commodity.name = name
        if description is not None:
            commodity.description = description
        if commodity_type:
            commodity.type = commodity_type
        if category_slug is not None:
            commodity.category_slug = category_slug
        if price is not None:
            commodity.price = price
        
        # Get store_id and user_id for path construction
        store_id = entrepreneur.store.id
        user_id = request.user.id
        
        # Handle image - save primary_image path/URL to the image field
        if primary_image:
            # If primary_image is a string (path or URL), process it
            if isinstance(primary_image, str):
                # Check if it's already a path (no http:// or /media/ prefix)
                if '://' not in primary_image and not primary_image.startswith('/media/'):
                    # It's already a path, use it directly
                    image_path = primary_image
                    print(f"[DEBUG] Using primary_image as path directly: {image_path}")
                else:
                    # It's a URL, extract the path
                    image_path = primary_image
                    print(f"[DEBUG] Original primary_image (URL): {primary_image}")
                    
                    # Remove protocol and domain if present
                    if '://' in image_path:
                        image_path = image_path.split('://', 1)[1]
                        if '/' in image_path:
                            image_path = '/' + image_path.split('/', 1)[1]
                    
                    # Remove /media/ prefix if present
                    if '/media/' in image_path:
                        image_path = image_path.split('/media/')[-1]
                    elif image_path.startswith('media/'):
                        image_path = image_path.replace('media/', '', 1)
                    
                    # Remove leading slash
                    if image_path.startswith('/'):
                        image_path = image_path.lstrip('/')
                    
                    print(f"[DEBUG] Extracted image_path from URL: {image_path}")
                
                print(f"[DEBUG] Final image_path: {image_path}")
                print(f"[DEBUG] Checking if file exists in storage at: {image_path}")
                
                # Check if it's a temp path (shouldn't happen during edit, but handle it)
                if 'temp_' in image_path and default_storage.exists(image_path):
                    print(f"[DEBUG] Temp file detected during edit, moving to final location...")
                    try:
                        # Extract filename from temp path (remove temp_ prefix)
                        temp_filename = os.path.basename(image_path)
                        final_filename = temp_filename.replace('temp_', '', 1) if temp_filename.startswith('temp_') else temp_filename
                        
                        # Construct final path with product_id
                        final_path = f'store/{user_id}/{store_id}/product_images/{commodity.id}_{final_filename}'
                        
                        print(f"[DEBUG] Moving from: {image_path}")
                        print(f"[DEBUG] Moving to: {final_path}")
                        
                        # Open temp file and save to final location
                        temp_file = default_storage.open(image_path, 'rb')
                        final_saved_path = default_storage.save(final_path, temp_file)
                        temp_file.close()
                        
                        # Delete temp file
                        try:
                            default_storage.delete(image_path)
                            print(f"[DEBUG] Deleted temp file: {image_path}")
                        except Exception as delete_error:
                            print(f"[DEBUG] Warning: Failed to delete temp file: {delete_error}")
                        
                        # Set commodity image to final path
                        commodity.image.name = final_saved_path
                    except Exception as move_error:
                        print(f"[DEBUG] Error moving temp file: {move_error}")
                        import traceback
                        print(traceback.format_exc())
                        # Fallback: use temp path if move fails
                        commodity.image.name = image_path
                        print(f"[DEBUG] Fallback: Using temp path due to move error")
                elif default_storage.exists(image_path):
                    # File exists (should be in final location for edits)
                    print(f"[DEBUG] File exists! Setting ImageField...")
                    commodity.image.name = image_path
                else:
                    print(f"[DEBUG] WARNING: File not found in storage at path: {image_path}")
                    # If file doesn't exist, try to set the path directly as fallback
                    commodity.image.name = image_path
                    print(f"[DEBUG] Set image path directly (file may not exist): {image_path}")
            elif hasattr(primary_image, 'read'):
                # If primary_image is a file object, save it directly
                file_name = primary_image.name if hasattr(primary_image, 'name') else f'image_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg'
                # Use the new path structure
                final_filename = f'store/{user_id}/{store_id}/product_images/{commodity.id}_{file_name}'
                commodity.image.save(final_filename, primary_image, save=False)
                print(f"[DEBUG] Saved commodity.image from file object: {commodity.image.name}")
        # If primary_image is None or empty, don't update the image field
        
        # Save commodity
        commodity.save()
        
        serializer = CommoditySerializer(commodity)
        product_data = serializer.data
        
        # Add store information for frontend compatibility
        from entrepreneurs.serializers import StoreSerializer
        store_serializer = StoreSerializer(commodity.store)
        product_data['store'] = store_serializer.data
        product_data['store_name'] = commodity.store.name
        product_data['store_id'] = commodity.store.id
        product_data['primary_image'] = product_data.get('image_url') or primary_image
        product_data['tags'] = tags if isinstance(tags, list) else []
        if stock_quantity is not None:
            product_data['stock_quantity'] = stock_quantity
        
        return Response({
            'status': 'success',
            'message': 'Listing updated successfully',
            'product': product_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error updating listing: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to update listing',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_store_analytics(request, store_id):
    """Get store analytics including revenue, profit, clicks, and transactions"""
    try:
        from entrepreneurs.models import Entrepreneur, Store, Transaction, CommodityClick
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum, Count, Q
        
        # Verify user owns the store
        entrepreneur = Entrepreneur.objects.filter(user=request.user, store_id=store_id).first()
        if not entrepreneur:
            return Response({
                'error': 'Unauthorized',
                'message': 'You do not have access to this store'
            }, status=status.HTTP_403_FORBIDDEN)
        
        store = entrepreneur.store
        if not store:
            return Response({
                'error': 'Store not found',
                'message': 'Store does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get time range filter
        time_range = request.GET.get('time_range', 'all')
        now = timezone.now()
        
        if time_range == '7d':
            start_date = now - timedelta(days=7)
        elif time_range == '30d':
            start_date = now - timedelta(days=30)
        elif time_range == '90d':
            start_date = now - timedelta(days=90)
        else:
            start_date = None
        
        # Build query filter
        transaction_filter = Q(store=store, status='completed')
        click_filter = Q(commodity__store=store)
        
        if start_date:
            transaction_filter &= Q(transaction_date__gte=start_date)
            click_filter &= Q(clicked_at__gte=start_date)
        
        # Calculate metrics
        transactions = Transaction.objects.filter(transaction_filter)
        
        total_revenue = transactions.aggregate(Sum('price'))['price__sum'] or 0
        total_service_fees = transactions.aggregate(Sum('service_fee'))['service_fee__sum'] or 0
        gross_profit = total_revenue
        net_profit = transactions.aggregate(Sum('net_profit'))['net_profit__sum'] or 0
        total_transactions = transactions.count()
        
        # Calculate monthly fee (5% of total revenue)
        from decimal import Decimal
        monthly_fee_percentage = Decimal(str(store.monthly_fee_percentage)) if hasattr(store, 'monthly_fee_percentage') and store.monthly_fee_percentage else Decimal('5.00')
        total_monthly_fees = Decimal(str(total_revenue)) * (monthly_fee_percentage / Decimal('100'))
        
        # Calculate final net profit after monthly fees
        final_net_profit = Decimal(str(net_profit)) - total_monthly_fees
        
        # Get click rates
        clicks = CommodityClick.objects.filter(click_filter)
        total_clicks = clicks.count()
        
        # Get click rates per product
        click_rates = {}
        commodities = store.commodities.all()
        for commodity in commodities:
            commodity_clicks = clicks.filter(commodity=commodity).count()
            # For now, we'll use a simple view count (can be enhanced later)
            views = commodity_clicks * 2  # Placeholder - can be tracked separately
            rate = (commodity_clicks / views * 100) if views > 0 else 0
            click_rates[commodity.id] = {
                'clicks': commodity_clicks,
                'views': views,
                'rate': rate
            }
        
        # Top products by revenue
        top_products = transactions.values('product__id', 'product__name').annotate(
            revenue=Sum('price'),
            count=Count('id')
        ).order_by('-revenue')[:10]
        
        return Response({
            'total_revenue': float(total_revenue),
            'gross_profit': float(gross_profit),
            'net_profit': float(net_profit),
            'final_net_profit': float(final_net_profit),
            'total_transactions': total_transactions,
            'total_clicks': total_clicks,
            'service_fees': float(total_service_fees),
            'monthly_fees': float(total_monthly_fees),
            'monthly_fee_percentage': float(monthly_fee_percentage),
            'click_rates': click_rates,
            'top_products': [
                {
                    'id': item['product__id'],
                    'name': item['product__name'] or 'N/A',
                    'revenue': float(item['revenue']),
                    'count': item['count']
                }
                for item in top_products
            ]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching store analytics: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch analytics',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_store_transactions(request, store_id):
    """Get store transactions with pagination"""
    try:
        from entrepreneurs.models import Entrepreneur, Transaction
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Q
        from rest_framework.pagination import PageNumberPagination
        
        # Verify user owns the store
        entrepreneur = Entrepreneur.objects.filter(user=request.user, store_id=store_id).first()
        if not entrepreneur:
            return Response({
                'error': 'Unauthorized',
                'message': 'You do not have access to this store'
            }, status=status.HTTP_403_FORBIDDEN)
        
        store = entrepreneur.store
        if not store:
            return Response({
                'error': 'Store not found',
                'message': 'Store does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get time range filter
        time_range = request.GET.get('time_range', 'all')
        now = timezone.now()
        
        if time_range == '7d':
            start_date = now - timedelta(days=7)
        elif time_range == '30d':
            start_date = now - timedelta(days=30)
        elif time_range == '90d':
            start_date = now - timedelta(days=90)
        else:
            start_date = None
        
        # Build query filter
        transaction_filter = Q(store=store)
        if start_date:
            transaction_filter &= Q(transaction_date__gte=start_date)
        
        transactions = Transaction.objects.filter(transaction_filter).select_related(
            'consumer', 'product'
        ).order_by('-transaction_date')
        
        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 50
        paginated_transactions = paginator.paginate_queryset(transactions, request)
        
        # Serialize transactions
        transaction_data = []
        for transaction in paginated_transactions:
            transaction_data.append({
                'id': transaction.id,
                'consumer': {
                    'id': transaction.consumer.id if transaction.consumer else None,
                    'username': transaction.consumer.username if transaction.consumer else None,
                    'email': transaction.consumer.email if transaction.consumer else None,
                } if transaction.consumer else None,
                'product': {
                    'id': transaction.product.id if transaction.product else None,
                    'name': transaction.product.name if transaction.product else None,
                } if transaction.product else None,
                'store': {
                    'id': transaction.store.id,
                    'name': transaction.store.name,
                },
                'price': float(transaction.price),
                'service_fee': float(transaction.service_fee),
                'net_profit': float(transaction.net_profit),
                'status': transaction.status,
                'transaction_date': transaction.transaction_date.isoformat(),
                'created_at': transaction.created_at.isoformat(),
            })
        
        return paginator.get_paginated_response(transaction_data)
        
    except Exception as e:
        import traceback
        print(f"Error fetching store transactions: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch transactions',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ORDERS & WALLET API ENDPOINTS ====================

@api_view(['POST'])
@require_verified_account_api
def create_order(request):
    """
    Create an order (simulate instant payment).
    For now, we'll simulate payment - just create the transaction.
    """
    try:
        from entrepreneurs.models import Commodity, Transaction, Store
        from decimal import Decimal
        
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({
                'error': 'Product ID is required',
                'message': 'Please provide a product_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the product
        try:
            product = Commodity.objects.select_related('store').get(id=product_id)
        except Commodity.DoesNotExist:
            return Response({
                'error': 'Product not found',
                'message': 'The requested product does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get user
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in to place an order'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if product has a price
        if product.price is None:
            return Response({
                'error': 'Product price not set',
                'message': 'This product does not have a price set'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate fees: delivery_fee (8.5%), service_fee (1.5%)
        price = Decimal(str(product.price))
        if price <= 0:
            return Response({
                'error': 'Invalid product price',
                'message': 'Product price must be greater than zero'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        delivery_fee = price * Decimal('0.085')  # 8.5% delivery fee
        service_fee = price * Decimal('0.015')  # 1.5% service fee
        net_profit = price - service_fee
        
        # Get buyer location (from consumer if available)
        buyer_location = None
        try:
            from consumers.models import Consumer
            consumer = Consumer.objects.filter(user=user, is_active=True).first()
            if consumer and consumer.hostel and consumer.hostel.campus:
                buyer_location = consumer.hostel.campus.campus
        except:
            pass
        
        # Get seller location (from store)
        seller_location = product.store.location or ''
        
        # Create transaction (order) - status is 'pending' until deliverer accepts
        transaction = Transaction.objects.create(
            consumer=user,
            product=product,
            store=product.store,
            price=price,
            delivery_fee=delivery_fee,
            service_fee=service_fee,
            net_profit=net_profit,
            status='pending',  # Changed to pending - needs delivery
            delivery_status='pending',
            buyer_location=buyer_location,
            seller_location=seller_location
        )
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_order_created
            notify_market_order_created(user, transaction)
        except Exception as email_error:
            print(f"Failed to send action notification for order creation: {str(email_error)}")
        
        # Return order data
        return Response({
            'id': transaction.id,
            'product_id': product.id,
            'product_name': product.name,
            'store_id': product.store.id,
            'store_name': product.store.name,
            'price': float(price),
            'delivery_fee': float(delivery_fee),
            'service_fee': float(service_fee),
            'total': float(price + delivery_fee),
            'status': transaction.status,
            'delivery_status': transaction.delivery_status,
            'created_at': transaction.created_at.isoformat(),
            'transaction_date': transaction.transaction_date.isoformat(),
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error creating order: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to create order',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_user_orders(request):
    """
    Get all orders for the current user (as buyer and/or seller).
    Returns transactions where user is the consumer (buyer) OR where user owns the store (seller).
    """
    try:
        from entrepreneurs.models import Transaction, Entrepreneur
        from entrepreneurs.serializers import CommoditySerializer, StoreSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in to view orders'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get user's store if they are an entrepreneur
        user_store_ids = []
        try:
            entrepreneur = Entrepreneur.objects.filter(user=user).first()
            if entrepreneur and entrepreneur.store:
                user_store_ids.append(entrepreneur.store.id)
        except:
            pass
        
        # Get all transactions where user is the consumer (buyer) OR where user owns the store (seller)
        from django.db.models import Q
        transactions = Transaction.objects.filter(
            Q(consumer=user) | Q(store_id__in=user_store_ids)
        ).select_related('product', 'store', 'product__store', 'consumer', 'deliverer__user').order_by('-created_at')
        
        orders = []
        for transaction in transactions:
            # Determine if user is buyer or seller
            is_buyer = transaction.consumer == user
            is_seller = transaction.store_id in user_store_ids
            
            product_data = None
            if transaction.product:
                serializer = CommoditySerializer(transaction.product)
                product_data = serializer.data
            
            store_data = None
            if transaction.store:
                store_serializer = StoreSerializer(transaction.store)
                store_data = store_serializer.data
            
            # Build order data
            order_data = {
                'id': transaction.id,
                'product_id': transaction.product.id if transaction.product else None,
                'product_name': transaction.product.name if transaction.product else 'N/A',
                'product': product_data,
                'store_id': transaction.store.id,
                'store_name': transaction.store.name,
                'store': store_data,
                'price': float(transaction.price),
                'service_fee': float(transaction.service_fee),
                'delivery_fee': float(transaction.delivery_fee) if transaction.delivery_fee else 0,
                'total': float(transaction.price),
                'total_amount': float(transaction.price),
                'status': transaction.status,
                'delivery_status': transaction.delivery_status,
                'deliverer_confirmed': transaction.deliverer_confirmed,
                'buyer_confirmed': transaction.buyer_confirmed,
                'seller_confirmed': transaction.seller_confirmed,
                'buyer_location': transaction.buyer_location,
                'seller_location': transaction.seller_location,
                'created_at': transaction.created_at.isoformat(),
                'transaction_date': transaction.transaction_date.isoformat(),
                'user_role': 'buyer' if is_buyer else 'seller',  # Indicate user's role in this transaction
            }
            
            # Add consumer information (for sellers)
            if is_seller and transaction.consumer:
                order_data['consumer'] = {
                    'id': transaction.consumer.id,
                    'username': transaction.consumer.username,
                    'email': transaction.consumer.email,
                }
                order_data['consumer_email'] = transaction.consumer.email
                order_data['consumer_username'] = transaction.consumer.username
            elif is_buyer:
                # For buyers, consumer is themselves
                order_data['consumer'] = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
                order_data['consumer_email'] = user.email
                order_data['consumer_username'] = user.username
            
            # Add deliverer information if available
            if transaction.deliverer:
                order_data['deliverer'] = {
                    'id': transaction.deliverer.id,
                    'user_email': transaction.deliverer.user.email if transaction.deliverer.user else None,
                    'user_username': transaction.deliverer.user.username if transaction.deliverer.user else None,
                    'location': transaction.deliverer.location,
                    'phone_number': transaction.deliverer.phone_number,
                }
            
            # Add product/item fields for compatibility
            if transaction.product:
                order_data['item_name'] = transaction.product.name
                order_data['item_description'] = transaction.product.description
                order_data['item_price'] = float(transaction.product.price) if transaction.product.price else 0
                if product_data and product_data.get('primary_image'):
                    order_data['item_image'] = product_data['primary_image']
                order_data['type'] = transaction.product.type
            
            orders.append(order_data)
        
        return Response(orders, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching orders: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch orders',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_user_wallet(request):
    """
    Get wallet balance and transactions for the current user.
    For buyers: show spending history and balance.
    For sellers: show earnings and balance.
    """
    try:
        from entrepreneurs.models import Transaction
        from decimal import Decimal
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in to view wallet'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get all transactions for user
        transactions = Transaction.objects.filter(
            consumer=user
        ).select_related('product', 'store').order_by('-created_at')
        
        # Calculate total spent (for buyers)
        total_spent = sum(t.price for t in transactions if t.status == 'completed')
        
        # For now, simulate a wallet balance (start with 1000, deduct purchases)
        # In a real system, this would come from a Wallet model
        initial_balance = Decimal('1000.00')
        balance = initial_balance - Decimal(str(total_spent))
        
        # Format transactions
        transaction_list = []
        for transaction in transactions:
            transaction_list.append({
                'id': transaction.id,
                'type': 'purchase',
                'amount': float(transaction.price),
                'description': f"Purchase: {transaction.product.name if transaction.product else 'N/A'}",
                'status': transaction.status,
                'created_at': transaction.created_at.isoformat(),
                'product_id': transaction.product.id if transaction.product else None,
                'store_id': transaction.store.id,
                'store_name': transaction.store.name,
            })
        
        return Response({
            'balance': float(balance),
            'escrow': 0.0,  # For future use
            'transactions': transaction_list,
            'total_spent': float(total_spent),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching wallet: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch wallet',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== DELIVERY PERSON API ENDPOINTS ====================

@api_view(['POST'])
@require_verified_account_api
def register_deliverer(request):
    """
    Register the current user as a deliverer.
    """
    try:
        from entrepreneurs.models import Deliverer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in to register as a deliverer'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is already a deliverer
        from entrepreneurs.serializers import DelivererSerializer
        if Deliverer.objects.filter(user=user).exists():
            deliverer = Deliverer.objects.get(user=user)
            serializer = DelivererSerializer(deliverer)
            return Response({
                'message': 'You are already registered as a deliverer',
                'deliverer': serializer.data
            }, status=status.HTTP_200_OK)
        
        # Check if user has a hostel (Consumer record)
        location = None
        try:
            from consumers.models import Consumer
            consumer = Consumer.objects.filter(user=user, is_active=True, hostel__isnull=False).first()
            if consumer and consumer.hostel and consumer.hostel.campus:
                # Use hostel campus as location
                location = consumer.hostel.campus.campus
        except Exception as e:
            print(f"Error checking consumer/hostel: {e}")
        
        # If no hostel found, get location from request
        if not location:
            location = request.data.get('location', '')
            if not location:
                return Response({
                    'error': 'Location required',
                    'message': 'Please provide your hostel/campus location. We could not find a hostel associated with your account.',
                    'has_hostel': False
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get phone number from request
        phone_number = request.data.get('phone_number', '')
        
        # Create deliverer
        deliverer = Deliverer.objects.create(
            user=user,
            location=location,
            phone_number=phone_number,
            is_active=True
        )
        
        # Send welcome email to deliverer
        try:
            subject = 'Welcome to sitysns Marketplace - You\'re Now a Deliverer!'
            message = f"""
Dear {user.username or user.email},

Congratulations! You have successfully registered as a deliverer on sitysns Marketplace.

🎉 What this means:
- You can now browse and accept delivery requests from buyers
- Earn 8.5% of the product price for each successful delivery
- Help connect sellers and buyers by delivering products
- Track your earnings and delivery history in your dashboard

📍 Your Location: {location}
📱 Contact: {phone_number or 'Not provided'}

🚀 Getting Started:
1. Visit your Deliverer Dashboard to see available delivery requests
2. Accept requests that match your location
3. Pick up from seller and deliver to buyer
4. Confirm delivery and get paid!

💰 Earnings:
- You earn 8.5% of each product's price as delivery fee
- Payment is processed after successful delivery confirmation
- Track all your earnings in the Analytics section

📊 Access Your Dashboard:
Visit: {getattr(settings, 'FRONTEND_URL', 'http://localhost:5175')}/deliverer-dashboard

Need help? Contact our support team.

Best regards,
The sitysns Marketplace Team
            """.strip()
            
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@sitysns.com'),
                recipient_list=[user.email],
                fail_silently=True,  # Don't fail registration if email fails
            )
        except Exception as email_error:
            print(f"Error sending deliverer welcome email: {email_error}")
            # Don't fail registration if email fails
        
        serializer = DelivererSerializer(deliverer)
        return Response({
            'message': 'Successfully registered as deliverer',
            'deliverer': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error registering deliverer: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to register as deliverer',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_user_hostel(request):
    """
    Get current user's hostel information (if they have an active Consumer record).
    """
    try:
        from consumers.models import Consumer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has an active consumer record with a hostel
        consumer = Consumer.objects.filter(
            user=user, 
            is_active=True, 
            hostel__isnull=False
        ).select_related('hostel', 'hostel__campus').first()
        
        if consumer and consumer.hostel and consumer.hostel.campus:
            return Response({
                'has_hostel': True,
                'hostel_name': consumer.hostel.name,
                'location': consumer.hostel.campus.campus,
                'campus': consumer.hostel.campus.campus
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'has_hostel': False,
                'hostel_name': None,
                'location': None,
                'campus': None
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        import traceback
        print(f"Error fetching user hostel: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch hostel information',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_deliverer_status(request):
    """
    Get current user's deliverer status.
    """
    try:
        from entrepreneurs.models import Deliverer
        from entrepreneurs.serializers import DelivererSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            deliverer = Deliverer.objects.get(user=user)
            serializer = DelivererSerializer(deliverer)
            return Response({
                'is_deliverer': True,
                'deliverer': serializer.data
            }, status=status.HTTP_200_OK)
        except Deliverer.DoesNotExist:
            return Response({
                'is_deliverer': False,
                'deliverer': None
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        import traceback
        print(f"Error fetching deliverer status: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch deliverer status',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_delivery_requests(request):
    """
    Get available delivery requests (status='pending', deliverer=None).
    Only show requests where deliverer hasn't accepted yet.
    """
    try:
        from entrepreneurs.models import Transaction, Deliverer
        from entrepreneurs.serializers import TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a deliverer
        try:
            deliverer = Deliverer.objects.get(user=user, is_active=True)
        except Deliverer.DoesNotExist:
            return Response({
                'error': 'Not a deliverer',
                'message': 'You must be registered as a deliverer to view delivery requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if deliverer has active delivery
        active_delivery = Transaction.objects.filter(
            deliverer=deliverer,
            delivery_status__in=['assigned', 'in_transit', 'delivered']
        ).exclude(status__in=['completed', 'cancelled']).first()
        
        if active_delivery:
            # If has active delivery, return empty list (they should see progress instead)
            return Response({
                'available_requests': [],
                'has_active_delivery': True,
                'active_delivery_id': active_delivery.id
            }, status=status.HTTP_200_OK)
        
        # Get available requests (pending, no deliverer assigned)
        requests = Transaction.objects.filter(
            status='pending',
            delivery_status='pending',
            deliverer__isnull=True
        ).select_related('product', 'store', 'consumer', 'product__store').order_by('-created_at')
        
        serializer = TransactionSerializer(requests, many=True)
        return Response({
            'available_requests': serializer.data,
            'has_active_delivery': False
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching delivery requests: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch delivery requests',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def accept_delivery_request(request, transaction_id):
    """
    Accept a delivery request.
    """
    try:
        from entrepreneurs.models import Transaction, Deliverer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a deliverer
        try:
            deliverer = Deliverer.objects.get(user=user, is_active=True)
        except Deliverer.DoesNotExist:
            return Response({
                'error': 'Not a deliverer',
                'message': 'You must be registered as a deliverer to accept delivery requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if deliverer has active delivery
        active_delivery = Transaction.objects.filter(
            deliverer=deliverer,
            delivery_status__in=['assigned', 'in_transit', 'delivered']
        ).exclude(status__in=['completed', 'cancelled']).first()
        
        if active_delivery:
            return Response({
                'error': 'Active delivery in progress',
                'message': 'You have an active delivery. Complete it before accepting new requests.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get transaction
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found',
                'message': 'The requested delivery request does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if transaction is available
        if transaction.status != 'pending' or transaction.delivery_status != 'pending' or transaction.deliverer:
            return Response({
                'error': 'Request not available',
                'message': 'This delivery request has already been accepted or is not available'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Assign deliverer
        transaction.deliverer = deliverer
        transaction.status = 'delivery_assigned'
        transaction.delivery_status = 'assigned'
        transaction.save()
        
        from entrepreneurs.serializers import TransactionSerializer
        serializer = TransactionSerializer(transaction)
        return Response({
            'message': 'Delivery request accepted successfully',
            'transaction': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error accepting delivery request: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to accept delivery request',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_my_deliveries(request):
    """
    Get deliverer's accepted deliveries (in progress).
    """
    try:
        from entrepreneurs.models import Transaction, Deliverer
        from entrepreneurs.serializers import TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a deliverer
        try:
            deliverer = Deliverer.objects.get(user=user, is_active=True)
        except Deliverer.DoesNotExist:
            return Response({
                'error': 'Not a deliverer',
                'message': 'You must be registered as a deliverer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get in-progress deliveries
        deliveries = Transaction.objects.filter(
            deliverer=deliverer,
            delivery_status__in=['assigned', 'in_transit', 'delivered']
        ).exclude(status__in=['completed', 'cancelled']).select_related(
            'product', 'store', 'consumer', 'product__store'
        ).order_by('-created_at')
        
        serializer = TransactionSerializer(deliveries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching deliveries: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch deliveries',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_verified_account_api
def get_completed_deliveries(request):
    """
    Get deliverer's completed deliveries (for analytics).
    """
    try:
        from entrepreneurs.models import Transaction, Deliverer
        from entrepreneurs.serializers import TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a deliverer
        try:
            deliverer = Deliverer.objects.get(user=user, is_active=True)
        except Deliverer.DoesNotExist:
            return Response({
                'error': 'Not a deliverer',
                'message': 'You must be registered as a deliverer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get completed deliveries
        deliveries = Transaction.objects.filter(
            deliverer=deliverer,
            delivery_status='completed',
            status='completed'
        ).select_related('product', 'store', 'consumer', 'product__store').order_by('-created_at')
        
        serializer = TransactionSerializer(deliveries, many=True)
        
        # Calculate earnings
        total_earnings = sum(float(d.delivery_fee) for d in deliveries)
        
        return Response({
            'deliveries': serializer.data,
            'total_earnings': total_earnings,
            'total_deliveries': len(deliveries)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error fetching completed deliveries: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to fetch completed deliveries',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def confirm_delivery(request, transaction_id):
    """
    Deliverer confirms delivery completion.
    """
    try:
        from entrepreneurs.models import Transaction, Deliverer
        from entrepreneurs import serializers as entrepreneur_serializers
        
        # Ensure TransactionSerializer is available
        if not hasattr(entrepreneur_serializers, 'TransactionSerializer'):
            raise ImportError("TransactionSerializer not found in entrepreneurs.serializers")
        
        TransactionSerializer = entrepreneur_serializers.TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a deliverer
        try:
            deliverer = Deliverer.objects.get(user=user, is_active=True)
        except Deliverer.DoesNotExist:
            return Response({
                'error': 'Not a deliverer',
                'message': 'You must be registered as a deliverer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get transaction
        try:
            transaction = Transaction.objects.get(id=transaction_id, deliverer=deliverer)
        except Transaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found',
                'message': 'The requested transaction does not exist or is not assigned to you'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Store old status for notification
        old_status = transaction.status
        
        # Update delivery status
        transaction.delivery_status = 'delivered'
        transaction.deliverer_confirmed = True
        transaction.status = 'delivery_confirmed'
        transaction.save()
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_order_status_changed
            notify_market_order_status_changed(user, transaction, old_status, 'delivery_confirmed')
        except Exception as email_error:
            print(f"Failed to send action notification for order status change: {str(email_error)}")
        
        serializer = TransactionSerializer(transaction)
        return Response({
            'message': 'Delivery confirmed successfully',
            'transaction': serializer.data
        }, status=status.HTTP_200_OK)
        
    except ImportError as ie:
        import traceback
        print(f"Import error confirming delivery: {ie}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to import required modules',
            'message': f'An import error occurred: {str(ie)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        print(f"Error confirming delivery: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to confirm delivery',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def buyer_confirm_delivery(request, transaction_id):
    """
    Buyer confirms delivery completion.
    """
    try:
        from entrepreneurs.models import Transaction
        from entrepreneurs.serializers import TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get transaction
        try:
            transaction = Transaction.objects.get(id=transaction_id, consumer=user)
        except Transaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found',
                'message': 'The requested transaction does not exist or is not yours'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if deliverer has confirmed
        if not transaction.deliverer_confirmed:
            return Response({
                'error': 'Deliverer not confirmed',
                'message': 'The deliverer must confirm delivery first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store old status for notification
        old_status = transaction.status
        
        # Update buyer confirmation
        transaction.buyer_confirmed = True
        transaction.status = 'buyer_confirmed'
        
        # If seller also confirmed, mark as completed
        if transaction.seller_confirmed:
            transaction.status = 'completed'
            transaction.delivery_status = 'completed'
        
        transaction.save()
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_order_status_changed
            new_status = 'completed' if transaction.seller_confirmed else 'buyer_confirmed'
            notify_market_order_status_changed(user, transaction, old_status, new_status)
        except Exception as email_error:
            print(f"Failed to send action notification for order status change: {str(email_error)}")
        
        serializer = TransactionSerializer(transaction)
        return Response({
            'message': 'Delivery confirmed successfully',
            'transaction': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error confirming delivery: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to confirm delivery',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def seller_confirm_delivery(request, transaction_id):
    """
    Seller confirms delivery completion.
    """
    try:
        from entrepreneurs.models import Transaction, Entrepreneur
        from entrepreneurs.serializers import TransactionSerializer
        
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'You must be logged in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get transaction
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found',
                'message': 'The requested transaction does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the seller (store owner)
        try:
            entrepreneur = Entrepreneur.objects.get(user=user, store=transaction.store)
        except Entrepreneur.DoesNotExist:
            return Response({
                'error': 'Not authorized',
                'message': 'You are not the seller for this transaction'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if deliverer and buyer have confirmed
        if not transaction.deliverer_confirmed or not transaction.buyer_confirmed:
            return Response({
                'error': 'Others not confirmed',
                'message': 'Both deliverer and buyer must confirm delivery first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store old status for notification
        old_status = transaction.status
        
        # Update seller confirmation
        transaction.seller_confirmed = True
        transaction.status = 'completed'
        transaction.delivery_status = 'completed'
        transaction.save()
        
        # Send action notification email
        try:
            from email_service.action_notifications import notify_market_order_status_changed
            notify_market_order_status_changed(user, transaction, old_status, 'completed')
        except Exception as email_error:
            print(f"Failed to send action notification for order status change: {str(email_error)}")
        
        serializer = TransactionSerializer(transaction)
        return Response({
            'message': 'Delivery confirmed successfully. Transaction completed!',
            'transaction': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error confirming delivery: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to confirm delivery',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def track_commodity_click(request, commodity_id):
    """Track a click/view on a commodity for analytics"""
    try:
        from entrepreneurs.models import Commodity, CommodityClick
        
        commodity = Commodity.objects.filter(id=commodity_id).first()
        if not commodity:
            return Response({
                'error': 'Commodity not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Get IP address
        ip_address = request.META.get('REMOTE_ADDR')
        
        # Create click record
        click = CommodityClick.objects.create(
            commodity=commodity,
            user=user,
            ip_address=ip_address
        )
        
        return Response({
            'status': 'success',
            'message': 'Click tracked successfully',
            'click_id': click.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error tracking click: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to track click',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def upload_marketplace_image(request):
    """Upload an image for marketplace listings (products/services)
    Saves to: media/store/{user_id}/{store_id}/product_images/{product_id}_{filename} (editing)
    or: media/store/{user_id}/{store_id}/product_images/temp_{timestamp}_{filename} (new product)
    """
    try:
        if 'image' not in request.FILES:
            return Response({
                'error': 'No image provided',
                'message': 'Please provide an image file'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type',
                'message': 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            return Response({
                'error': 'File too large',
                'message': 'Image file must be less than 10MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get store_id and product_id
        from entrepreneurs.models import Entrepreneur
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        store_id = request.data.get('store_id') or (entrepreneur.store.id if entrepreneur and entrepreneur.store else None)
        product_id = request.data.get('product_id')  # Optional - if provided, we're editing
        
        if not store_id:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate unique filename with new path structure
        user_id = request.user.id
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = os.path.splitext(image_file.name)[1]
        
        # Determine path structure
        if product_id:
            # Editing: save directly to final location with product_id
            filename = f'store/{user_id}/{store_id}/product_images/{product_id}_{timestamp}_{image_file.name}'
        else:
            # New product: save to temp location (will be moved after product creation)
            filename = f'store/{user_id}/{store_id}/product_images/temp_{timestamp}_{image_file.name}'
        
        # Save file using default storage
        saved_path = default_storage.save(filename, image_file)
        
        # Get URL
        try:
            url = default_storage.url(saved_path)
        except Exception:
            # Fallback to path if URL resolution not available
            url = saved_path
        
        return Response({
            'status': 'success',
            'message': 'Image uploaded successfully',
            'url': url,
            'path': saved_path
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error uploading image: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to upload image',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def upload_store_logo(request):
    """Upload a logo for a store"""
    try:
        from entrepreneurs.models import Entrepreneur, Store
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'logo' not in request.FILES:
            return Response({
                'error': 'No logo provided',
                'message': 'Please provide a logo file'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        logo_file = request.FILES['logo']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if logo_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type',
                'message': 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB for logos)
        max_size = 5 * 1024 * 1024  # 5MB
        if logo_file.size > max_size:
            return Response({
                'error': 'File too large',
                'message': 'Logo file must be less than 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to store model
        store = entrepreneur.store
        store.logo = logo_file
        store.save()
        
        # Get URL
        try:
            url = store.logo.url
        except Exception:
            url = store.logo.name if store.logo else None
        
        return Response({
            'status': 'success',
            'message': 'Logo uploaded successfully',
            'url': url,
            'logo': url
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error uploading logo: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to upload logo',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_verified_account_api
def upload_store_banner(request):
    """Upload a banner for a store"""
    try:
        from entrepreneurs.models import Entrepreneur, Store
        
        entrepreneur = Entrepreneur.objects.filter(user=request.user).select_related('store').first()
        
        if not entrepreneur or not entrepreneur.store:
            return Response({
                'error': 'No store found',
                'message': 'You do not have a store yet. Create one to get started.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'banner' not in request.FILES:
            return Response({
                'error': 'No banner provided',
                'message': 'Please provide a banner file'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        banner_file = request.FILES['banner']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if banner_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type',
                'message': 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 10MB for banners)
        max_size = 10 * 1024 * 1024  # 10MB
        if banner_file.size > max_size:
            return Response({
                'error': 'File too large',
                'message': 'Banner file must be less than 10MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to store model
        store = entrepreneur.store
        store.cover_photo = banner_file
        store.save()
        
        # Get URL
        try:
            url = store.cover_photo.url
        except Exception:
            url = store.cover_photo.name if store.cover_photo else None
        
        return Response({
            'status': 'success',
            'message': 'Banner uploaded successfully',
            'url': url,
            'banner': url
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print(f"Error uploading banner: {e}")
        print(traceback.format_exc())
        return Response({
            'error': 'Failed to upload banner',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
