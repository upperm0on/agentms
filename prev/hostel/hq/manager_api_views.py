from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from consumers.models import Consumer
from managers.models import Manager
from hq.models import Hostel
from hq.serializers import HostelSerializer
from location.models import Location
from user_auth.decorators import require_verified_account_api
from reservations.models import Reservation
from django.contrib.auth.models import User
import json
from django.utils.text import slugify
import logging

logger = logging.getLogger(__name__)

def check_and_update_room_capacity(hostel):
    """
    Check if any rooms have reached capacity and update reservation status to 'full'
    Logic: Total capacity = (number_of_rooms * number_in_room) - active_consumers
    """
    try:
        if not hostel.room_details:
            return
        
        rooms = hostel.room_details
        if isinstance(rooms, str):
            rooms = json.loads(rooms)
        
        for room in rooms:
            room_uuid = room.get('uuid')
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
            
            # Calculate available slots
            available_slots = total_capacity - active_consumers
            
            # Count current active reservations for this room
            active_reservations = Reservation.objects.filter(
                hostel=hostel,
                room_uuid=room_uuid,
                status__in=['pending', 'confirmed'],
                is_paid=True
            ).count()
            
            # If no slots available, mark all pending reservations as 'full'
            if available_slots <= 0 or active_reservations >= available_slots:
                Reservation.objects.filter(
                    hostel=hostel,
                    room_uuid=room_uuid,
                    status='pending',
                    is_paid=False
                ).update(status='full')
                
    except (ValueError, TypeError, KeyError) as e:
        print(f"Error checking room capacity: {e}")
        pass
from django.core.files.storage import default_storage
import re as regex
from datetime import datetime, date


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def manager_post_api(request):
    # Example: just echo back the posted data
    data = request.data
    return Response({'status': 'success', 'received': data})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def get_tenants(request):
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        hostels = Hostel.objects.filter(manager=manager)
        hostels_list = []
        all_tenants = []
        
        if hostels:
            for hostel in hostels: 
                tenants = Consumer.objects.filter(hostel__pk = hostel.id)
                tenant_data = []
                hostels_list.append({hostel.pk: tenant_data})
                for tenant in tenants:
                    tenant_info = {
                        'id': tenant.id,
                        'user': {
                            'id': tenant.user.id,
                            'username': tenant.user.username,
                            'email': tenant.user.email,
                        },
                        'room_uuid': tenant.room_uuid,
                        'amount': float(tenant.amount) if tenant.amount else None,
                        'date_created': tenant.date_created,
                        'is_active': tenant.is_active,
                        'reference': tenant.reference,
                        'hostel': {
                            'id': tenant.hostel.id,
                            'name': tenant.hostel.name,
                        } if tenant.hostel else None
                    }
                    tenant_data.append(tenant_info)
                    all_tenants.append(tenant_info)
                    
        # Serialize the tenants data        
        return Response({
            'status': 'success',
            'tenants': all_tenants,
            'count': len(all_tenants)
        })
    except Manager.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User is not a manager'
        }, status=403)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['POST', 'GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def update_or_create_hostel(request):
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        
        # Handle GET request - return manager's hostel
        if request.method == 'GET':
            print(f"GET request from manager: {manager.user.email}")
            try:
                # Get the specific hostel if hostel_id is provided, otherwise get the first one
                hostel_id = request.GET.get('hostel_id')
                if hostel_id:
                    hostel = Hostel.objects.get(manager=manager, id=hostel_id)
                else:
                    hostel = Hostel.objects.filter(manager=manager).first()
                
                if hostel:
                    serializer = HostelSerializer(hostel)
                    return Response({
                        'status': 'success',
                        'hostel': serializer.data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'No hostel found for this manager'
                    }, status=404)
            except Hostel.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'No hostel found for this manager'
                }, status=404)
        
        # Handle POST request - create or update hostel
        # Extract data from request
        data = request.data
        # Avoid logging huge payloads directly (can cause stream issues)
        try:
            if isinstance(data, dict):
                logger.info("[update_or_create_hostel] Received data keys: %s", list(data.keys()))
            else:
                logger.info("[update_or_create_hostel] Received data type: %s", type(data).__name__)
        except Exception:
            # Best-effort logging only
            pass
        
        # Check if manager already has a hostel
        try:
            hostel = Hostel.objects.get(manager=manager, id=data.get('hostel_id'))
            is_update = True
        except Hostel.DoesNotExist:
            # Create new hostel
            hostel = Hostel()
            hostel.manager = manager
            is_update = False
        
        # Update/create hostel fields
        hostel.name = data.get('name', hostel.name if is_update else '')
        
        # Handle location/campus
        campus_name = data.get('campus')
        if campus_name:
            try:
                location = Location.objects.get(campus=campus_name)
                hostel.campus = location
            except Location.DoesNotExist:
                # Try to create the campus if it doesn't exist
                try:
                    location = Location.objects.create(campus=campus_name)
                    hostel.campus = location
                    logger.info("[update_or_create_hostel] Created new campus: %s", campus_name)
                except Exception as create_error:
                    logger.error("[update_or_create_hostel] Error creating campus %s: %s", campus_name, create_error)
                    return Response({
                        'status': 'error',
                        'message': f'Campus "{campus_name}" not found and could not be created. Please contact support.'
                    }, status=400)
            except Exception as e:
                logger.error("[update_or_create_hostel] Error handling campus %s: %s", campus_name, e)
                return Response({
                    'status': 'error',
                    'message': f'Error processing campus "{campus_name}". Please try again.'
                }, status=400)

        # Handle additional_details (amenities) - it's already a JSON string from frontend
        additional_details = data.get('additional_details')
        if additional_details:
            hostel.additional_details = additional_details

        # Handle room_details - may arrive as JSON string or list
        raw_room_details = data.get('room_details')
        parsed_rooms = None
        if raw_room_details:
            try:
                parsed_rooms = json.loads(raw_room_details) if isinstance(raw_room_details, (str, bytes)) else raw_room_details
            except Exception:
                # If parsing fails, fallback to previous value
                parsed_rooms = None

        # Handle images (hostel main image) - must come from FILES
        if 'image' in request.FILES:
            hostel.image = request.FILES['image']

        hostel.checkout = data.get('checkout_date')
        
        # Handle booking acceptance setting
        accepts_bookings = data.get('accepts_bookings')
        if accepts_bookings is not None:
            hostel.accepts_bookings = accepts_bookings
        
        # Save initially to ensure instance exists before file saves (uses S3 backend if configured)
        try:
            hostel.save()
            logger.info("[update_or_create_hostel] Hostel saved successfully: %s", hostel.name)
            
            # Send email notification
            try:
                from email_service.action_notifications import notify_manager_hostel_created, notify_manager_hostel_updated
                if is_update:
                    changes = {
                        'name': data.get('name'),
                        'campus': data.get('campus'),
                    }
                    notify_manager_hostel_updated(manager.user, hostel, changes)
                    # Also notify admin
                    from email_service.action_notifications import notify_admin_hostel_updated
                    notify_admin_hostel_updated(request.user, hostel, changes)
                else:
                    notify_manager_hostel_created(manager.user, hostel)
                    # Also notify admin
                    from email_service.action_notifications import notify_admin_hostel_created
                    notify_admin_hostel_created(request.user, hostel)
            except Exception as email_error:
                logger.error(f"Failed to send email notification for hostel save: {str(email_error)}")
        except Exception as save_error:
            logger.error("[update_or_create_hostel] Error saving hostel: %s", save_error)
            return Response({
                'status': 'error',
                'message': f'Error saving hostel: {str(save_error)}'
            }, status=400)

        # S3 saving for per-room images (room_image)
        # Mapping preference:
        # 1) room_images_by_uuid[uuid]
        # 2) room_details[<index>][room_image] or room_images[<index>] (index-based)
        try:
            rooms = parsed_rooms if parsed_rooms is not None else hostel.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)
            rooms = rooms or []

            # Debug storage backend (best-effort)
            try:
                logger.debug("[RoomImageUpload] Storage backend: %s", default_storage.__class__.__name__)
            except Exception:
                pass

            # Ensure we have uuids for mapping by uuid
            rooms_with_uuid = []
            has_any_uuid = False
            for idx, r in enumerate(rooms):
                if r.get('uuid'):
                    has_any_uuid = True
                rooms_with_uuid.append(r)

            # If some rooms lack uuid, try to enrich from the persisted instance by index
            try:
                existing_rooms = hostel.room_details
                if isinstance(existing_rooms, str):
                    existing_rooms = json.loads(existing_rooms)
            except Exception:
                existing_rooms = None
            if existing_rooms and isinstance(existing_rooms, list):
                for i in range(min(len(rooms_with_uuid), len(existing_rooms))):
                    if not rooms_with_uuid[i].get('uuid') and existing_rooms[i].get('uuid'):
                        rooms_with_uuid[i]['uuid'] = existing_rooms[i]['uuid']
                        has_any_uuid = True

            # Build uuid -> index map
            uuid_to_index = {}
            if has_any_uuid:
                for idx, r in enumerate(rooms_with_uuid):
                    u = r.get('uuid')
                    if u:
                        uuid_to_index[u] = idx

            # Build upload map: index -> list[UploadedFile]
            upload_map = {}
            # Pattern A: 'room_image' as a list (ordered)
            files_list = request.FILES.getlist('room_image')
            if files_list:
                for idx, f in enumerate(files_list):
                    upload_map.setdefault(idx, []).append(f)

            # Pattern B: explicit indexed fields: room_image_1, room_image_2, ...
            if not files_list:
                for idx in range(len(rooms)):
                    key = f'room_image_{idx+1}'
                    indexed_list = request.FILES.getlist(key)
                    if indexed_list:
                        upload_map[idx] = indexed_list

            # Pattern C: bracketed names from frontend forms (index-based)
            # e.g., 'room_images[0]' or 'room_details[2][room_image]'
            if not upload_map:
                for key, file_list in request.FILES.lists():
                    m1 = regex.match(r"^room_images\[(\d+)\]$", key)
                    m2 = regex.match(r"^room_details\[(\d+)\]\[room_image\]$", key)
                    if m1 or m2:
                        idx = int((m1 or m2).group(1))
                        for f in file_list:
                            upload_map.setdefault(idx, []).append(f)

            # Pattern D: by uuid: room_images_by_uuid[<uuid>]
            for key, file_list in request.FILES.lists():
                mu = regex.match(r"^room_images_by_uuid\[([0-9a-fA-F-]{36})\]$", key)
                if mu:
                    uuid_key = mu.group(1)
                    if uuid_key in uuid_to_index:
                        idx = uuid_to_index[uuid_key]
                        for f in file_list:
                            upload_map.setdefault(idx, []).append(f)

            slug_name = slugify(hostel.name or 'hostel')

            # If no uploads provided, retain existing images and skip
            if upload_map:
                updated_any = False
                for idx, room in enumerate(rooms_with_uuid):
                    # Normalize existing room_image to list
                    existing_images = room.get('room_image')
                    if isinstance(existing_images, str):
                        existing_images = [existing_images]
                    if existing_images is None:
                        existing_images = []

                    # Determine room number for pathing
                    room_number = str(room.get('number_in_room', idx))

                    # Save all files for this index
                    new_urls = []
                    for f in upload_map.get(idx, []) or []:
                        file_name = f.name
                        s3_path = f"room_images/{slug_name}/{room_number}/{file_name}"
                        # Save to default storage (S3 in dev/prod)
                        try:
                            saved_path = default_storage.save(s3_path, f)
                            logger.debug("[RoomImageUpload] Saved %s to %s", file_name, saved_path)
                            try:
                                url = default_storage.url(saved_path)
                            except Exception:
                                # Fallback to path if URL resolution not available
                                url = saved_path
                            logger.debug("[RoomImageUpload] URL resolved: %s", url)
                            new_urls.append(url)
                        except Exception as ex:
                            logger.warning("[RoomImageUpload][ERROR] Failed saving %s -> %s: %s", file_name, s3_path, ex)

                    if new_urls:
                        # Prefer uploaded files: override any JSON-provided filename/null
                        room['room_image'] = new_urls
                        updated_any = True
                    else:
                        # Retain existing images if no new upload for this room
                        room['room_image'] = existing_images

                if updated_any:
                    hostel.room_details = rooms_with_uuid
                    hostel.save(update_fields=['room_details'])
            else:
                # No uploads; if parsed_rooms exists and differs, persist it
                if parsed_rooms is not None:
                    hostel.room_details = rooms_with_uuid
                    hostel.save(update_fields=['room_details'])
        except Exception as e:
            # Do not fail whole request on image processing error
            logger.warning("[update_or_create_hostel] Error processing room images: %s", e)
        
        # Serialize and return the hostel data
        hostel_data = HostelSerializer(hostel).data
        
        return Response({
            'status': 'success',
            'message': 'Hostel updated successfully' if is_update else 'Hostel created successfully',
            'hostel': hostel_data,
            'is_update': is_update
        }, status=status.HTTP_200_OK)
        
    except Manager.DoesNotExist:
        return Response({
            'status': 'error', 
            'message': 'User is not a manager'
        }, status=403)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        # Use logger.exception to capture stack trace without risking stdout flush errors
        logger.exception("Server error in update_or_create_hostel: %s", e)
        
        # Return more specific error messages
        if "campus" in str(e).lower():
            return Response({
                'status': 'error', 
                'message': 'Invalid campus location. Please select a valid campus.'
            }, status=400)
        elif "validation" in str(e).lower():
            return Response({
                'status': 'error', 
                'message': 'Invalid data provided. Please check your input and try again.'
            }, status=400)
        elif "permission" in str(e).lower():
            return Response({
                'status': 'error', 
                'message': 'Permission denied. Please contact support.'
            }, status=403)
        else:
            return Response({
                'status': 'error', 
                'message': f'Server error: {str(e)}'
            }, status=500)
    
import os
from decouple import config
PAYSTACK_SECRET_KEY = config('PAYSTACK_SECRET_KEY')
import requests as re
from rest_framework.permissions import AllowAny
from payment_account.models import PaymentAccount

@api_view(['GET', 'POST'])
@require_verified_account_api
def get_banks(request): 
    if request.method == "POST":
        account_request = re.post('https://api.paystack.co/subaccount/', headers={
            "authorization": f'Bearer {PAYSTACK_SECRET_KEY}',
            "content-type": "application/json"}, 
            json = {
                "business_name": request.data.get('accountHolderName'),
                "settlement_bank": request.data.get('bankId'),
                "account_number": request.data.get('accountNumber'),
                "percentage_charge": 0.8,
            })
        
        if account_request.json().get('status') is True:
            manager = Manager.objects.get(user=request.user)
            paystack_data = account_request.json().get('data')
            
            try: 
                verification = PaymentAccount.objects.get(manager=manager)
                if verification: 
                    verification.bank_id = paystack_data.get('id')
                    verification.account_number = paystack_data.get('account_number')
                    verification.account_name = paystack_data.get('account_name')
                    verification.account_code = paystack_data.get('subaccount_code')
                    verification.save()
                    
                    # Update Manager model with payment setup
                    manager.paystack_subaccount_id = paystack_data.get('subaccount_code')
                    manager.bank_account_setup = True
                    manager.payment_currency = 'GHS'  # Default to Ghana Cedis
                    manager.save()
                    
                    return Response({'status': 'success', 'data': account_request.json()})
            except:
                account_instance = PaymentAccount.objects.create(
                    manager = manager,
                    bank_id = paystack_data.get('id'),
                    account_number = paystack_data.get('account_number'),
                    account_name = paystack_data.get('account_name'),
                    account_code = paystack_data.get('subaccount_code'),
                )
                account_instance.save()
                
                # Update Manager model with payment setup
                manager.paystack_subaccount_id = paystack_data.get('subaccount_code')
                manager.bank_account_setup = True
                manager.payment_currency = 'GHS'  # Default to Ghana Cedis
                manager.save()
                
                return Response({'status': 'success', 'data': account_request.json()})

        else: 
            return Response({
                'status': 'error',
                'message': account_request.json().get('message')
            }, status=400)



    bank_request = re.get('https://api.paystack.co/bank?country=ghana', headers={
        "authorization": f'Bearer ${PAYSTACK_SECRET_KEY}',
        "content-type": "application/json",
    })

    data = bank_request.json()['data']

    response = []

    account_data = None

    account_instance = PaymentAccount.objects.filter(manager=Manager.objects.get(user=request.user)).first()
    if account_instance:
        account_data = {
            'account_number': account_instance.account_number,
            'account_name': account_instance.account_name,
            'bank_id': account_instance.bank_id,
        }

    for item in data: 
        response.append({
            'name': item['name'],
            'id': item['id'],
        })

    return Response({'status': 'success', "response": response, "data": account_data})


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def get_manager_reservations(request):
    """
    Get all reservations for hostels managed by the authenticated manager
    """
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        hostels = Hostel.objects.filter(manager=manager)
        
        reservations_data = []
        for hostel in hostels:
            reservations = Reservation.objects.filter(hostel=hostel).order_by('-created_at')
            for reservation in reservations:
                # Get room label from hostel room details
                room_label = 'Standard Room'  # Default fallback
                try:
                    if reservation.hostel and reservation.hostel.room_details:
                        import json
                        rooms = reservation.hostel.room_details
                        if isinstance(rooms, str):
                            rooms = json.loads(rooms)
                        
                        # Find the room with matching UUID
                        for room in rooms:
                            if room.get('uuid') == reservation.room_uuid:
                                room_label = room.get('room_label', 'Standard Room')
                                break
                except (ValueError, TypeError, KeyError):
                    pass
                
                reservations_data.append({
                    'id': reservation.id,
                    'user': {
                        'id': reservation.user.id,
                        'username': reservation.user.username,
                        'email': reservation.user.email,
                        'first_name': reservation.user.first_name,
                        'last_name': reservation.user.last_name,
                    },
                    'hostel': {
                        'id': reservation.hostel.id,
                        'name': reservation.hostel.name,
                    },
                    'reservee_date': reservation.reservee_date,
                    'expiry_date': reservation.expiry_date,
                    'room_uuid': reservation.room_uuid,
                    'room_label': room_label,
                    'status': reservation.status,
                    'amount': float(reservation.amount) if reservation.amount else None,
                    'deposit_amount': float(reservation.deposit_amount) if reservation.deposit_amount else None,
                    'is_paid': reservation.is_paid,
                    'reference': reservation.reference,
                    'created_at': reservation.created_at,
                    'updated_at': reservation.updated_at,
                    'is_expired': reservation.expiry_date < date.today() if reservation.expiry_date else False,
                })
        
        return Response({
            'status': 'success',
            'reservations': reservations_data,
            'count': len(reservations_data)
        })
    except Manager.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User is not a manager'
        }, status=403)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def get_payments(request):
    """
    Get all payments for manager's hostels
    """
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        hostels = Hostel.objects.filter(manager=manager)
        
        payments = []
        for hostel in hostels:
            # Get payments from Consumer objects (tenants who have paid)
            consumers = Consumer.objects.filter(hostel=hostel, is_active=True)
            for consumer in consumers:
                payments.append({
                    'id': consumer.id,
                    'user': {
                        'id': consumer.user.id,
                        'username': consumer.user.username,
                        'email': consumer.user.email,
                    },
                    'amount': float(consumer.amount) if consumer.amount else 0,
                    'reference': consumer.reference,
                    'date_created': consumer.date_created,
                    'hostel': {
                        'id': consumer.hostel.id,
                        'name': consumer.hostel.name,
                    },
                    'room_uuid': consumer.room_uuid,
                    'status': 'paid'
                })
        
        return Response({
            'status': 'success',
            'payments': payments,
            'count': len(payments)
        })
    except Manager.DoesNotExist:
        return Response({'status': 'error', 'message': 'User is not a manager'}, status=403)
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def confirm_payment(request):
    """
    Confirm payment for a reservation and automatically create Consumer if not exists
    This endpoint sets is_paid=True and creates Consumer object
    """
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        reservation_id = request.data.get('reservation_id')
        
        if not reservation_id:
            return Response({
                'status': 'error',
                'message': 'reservation_id is required'
            }, status=400)
        
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                hostel__manager=manager,
                status__in=['pending', 'confirmed']
            )
        except Reservation.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Reservation not found or not in pending/confirmed status'
            }, status=404)
        
        # Set payment as confirmed and update status if pending
        reservation.is_paid = True
        if reservation.status == 'pending':
            reservation.status = 'confirmed'
        reservation.save()
        
        # Send email notification
        try:
            from email_service.action_notifications import notify_admin_payment_confirmed, notify_manager_payment_received
            notify_admin_payment_confirmed(request.user, reservation)
            # Create a payment-like object for manager notification
            class PaymentObj:
                def __init__(self, reservation):
                    self.id = reservation.id
                    self.amount = reservation.amount
                    self.user = reservation.user
                    self.reference = reservation.reference
                    self.created_at = reservation.created_at
            payment_obj = PaymentObj(reservation)
            notify_manager_payment_received(manager.user, payment_obj)
        except Exception as email_error:
            logger.error(f"Failed to send email notification for payment confirmation: {str(email_error)}")
        
        # Check and update room capacity after payment confirmation
        check_and_update_room_capacity(reservation.hostel)
        
        # Check if Consumer already exists for this user and room
        existing_consumer = Consumer.objects.filter(
            user=reservation.user,
            hostel=reservation.hostel,
            room_uuid=reservation.room_uuid,
            is_active=True
        ).first()
        
        consumer = None
        if not existing_consumer:
            # Create Consumer (tenant) from reservation
            consumer = Consumer.objects.create(
                user=reservation.user,
                hostel=reservation.hostel,
                room_uuid=reservation.room_uuid,
                amount=reservation.amount,
                reference=reservation.reference,
                is_active=True
            )
        else:
            consumer = existing_consumer
        
        return Response({
            'status': 'success',
            'message': 'Payment confirmed successfully',
            'consumer_created': consumer is not None,
            'consumer': {
                'id': consumer.id if consumer else existing_consumer.id,
                'user': {
                    'id': consumer.user.id if consumer else existing_consumer.user.id,
                    'username': consumer.user.username if consumer else existing_consumer.user.username,
                    'email': consumer.user.email if consumer else existing_consumer.user.email,
                },
                'room_uuid': consumer.room_uuid if consumer else existing_consumer.room_uuid,
                'amount': float(consumer.amount) if consumer and consumer.amount else (float(existing_consumer.amount) if existing_consumer and existing_consumer.amount else None),
                'is_active': consumer.is_active if consumer else existing_consumer.is_active,
                'reference': consumer.reference if consumer else existing_consumer.reference,
                'hostel': {
                    'id': consumer.hostel.id if consumer else existing_consumer.hostel.id,
                    'name': consumer.hostel.name if consumer else existing_consumer.hostel.name,
                }
            } if consumer or existing_consumer else None
        })
    except Manager.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User is not a manager'
        }, status=403)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@require_verified_account_api
def cancel_reservation(request):
    """
    Cancel a reservation (manager action)
    """
    try:
        # Get the Manager instance from the User
        manager = Manager.objects.get(user=request.user)
        reservation_id = request.data.get('reservation_id')
        
        if not reservation_id:
            return Response({
                'status': 'error',
                'message': 'reservation_id is required'
            }, status=400)
        
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                hostel__manager=manager
            )
        except Reservation.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Reservation not found'
            }, status=404)
        
        # Update reservation status
        reservation.status = 'cancelled'
        reservation.save()
        
        # Send email notification
        try:
            from email_service.action_notifications import notify_admin_reservation_cancelled
            notify_admin_reservation_cancelled(request.user, reservation)
        except Exception as email_error:
            logger.error(f"Failed to send email notification for reservation cancellation: {str(email_error)}")
        
        return Response({
            'status': 'success',
            'message': 'Reservation cancelled successfully'
        })
    except Manager.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User is not a manager'
        }, status=403)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


