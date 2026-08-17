from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
import os
import requests
import json

from django.db.models.signals import post_save
from django.dispatch import receiver

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.db import connection
from django.core.paginator import Paginator
from django.db.models import Q
from django.apps import apps
from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
import logging
from functools import wraps
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from .models import Hostel
from .add_hostel_forms import Views_addHostel
from ratings.models import (
    five_star,
    four_star,
    three_star,
    two_star,
    one_star
)

from managers.models import Manager
from location.models import Location
from reviews.models import Reviews

from django.utils.text import slugify
from django.core.files.storage import FileSystemStorage

from consumers.models import Consumer
from payments.models import Payment

from user_auth.models import Gender

logger = logging.getLogger(__name__)

def admin_required(view_func):
    """Decorator to ensure only admin users can access database management endpoints"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check for token authentication
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Token '):
            return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
        
        token_key = auth_header.split(' ')[1]
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Invalid token'}, status=401)
        
        # Check if user is staff (admin)
        if not user.is_staff:
            return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
        
        # Set the user on the request for the view function
        request.user = user
        return view_func(request, *args, **kwargs)
    return wrapper

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def admin_login(request):
    """
    Admin login endpoint that returns a token for admin users
    """
    email = request.data.get('email')
    password = request.data.get('password')
    is_admin = request.data.get('is_admin', False)
    
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
    
    # Check if user is staff (admin)
    if not user.is_staff:
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Create or get token for admin user
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'email': user.email,
        'username': user.username,
        'is_admin': True,
        'is_staff': user.is_staff,
        'status': 'success'
    }, status=status.HTTP_200_OK)

def get_all_models():
    """Get all Django models from all installed apps"""
    all_models = []
    for app_config in apps.get_app_configs():
        for model in app_config.get_models():
            # Skip Django's built-in models that we don't want to expose
            if model._meta.app_label in ['contenttypes', 'sessions', 'admin', 'auth']:
                continue
            all_models.append({
                'app_label': model._meta.app_label,
                'model_name': model._meta.model_name,
                'verbose_name': model._meta.verbose_name,
                'verbose_name_plural': model._meta.verbose_name_plural,
                'table_name': model._meta.db_table,
                'fields': [
                    {
                        'name': field.name,
                        'type': field.__class__.__name__,
                        'verbose_name': getattr(field, 'verbose_name', field.name),
                        'null': field.null,
                        'blank': field.blank,
                        'max_length': getattr(field, 'max_length', None),
                        'choices': getattr(field, 'choices', None),
                        'help_text': getattr(field, 'help_text', ''),
                        'is_foreign_key': isinstance(field, models.ForeignKey),
                        'is_many_to_many': isinstance(field, models.ManyToManyField),
                        'related_model': field.related_model._meta.label if hasattr(field, 'related_model') and field.related_model else None,
                    }
                    for field in model._meta.fields
                ]
            })
    return all_models

@csrf_exempt
@admin_required
@require_http_methods(["GET"])
def get_all_tables(request):
    """Get all available database tables with their structure"""
    try:
        models_info = get_all_models()
        return JsonResponse({
            'success': True,
            'tables': models_info,
            'count': len(models_info)
        })
    except Exception as e:
        logger.error(f"Error getting tables: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["GET"])
def get_table_data(request, app_label, model_name):
    """Get data from a specific table with pagination and filtering"""
    try:
        # Get the model
        model = apps.get_model(app_label, model_name)
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search = request.GET.get('search', '')
        ordering = request.GET.get('ordering', 'id')
        
        # Build queryset
        queryset = model.objects.all()
        
        # Apply search if provided
        if search:
            search_fields = []
            for field in model._meta.fields:
                if isinstance(field, (models.CharField, models.TextField)):
                    search_fields.append(f"{field.name}__icontains")
            
            if search_fields:
                search_q = Q()
                for field in search_fields:
                    search_q |= Q(**{field: search})
                queryset = queryset.filter(search_q)
        
        # Apply ordering
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Paginate results
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        data = []
        for obj in page_obj:
            obj_data = {}
            for field in model._meta.fields:
                value = getattr(obj, field.name)
                if isinstance(value, models.Model):
                    obj_data[field.name] = {
                        'id': value.pk,
                        'str': str(value)
                    }
                elif hasattr(value, 'all'):  # ManyToManyField
                    obj_data[field.name] = [{'id': item.pk, 'str': str(item)} for item in value.all()]
                elif isinstance(field, (models.FileField, models.ImageField)):  # FileField/ImageField
                    if value and hasattr(value, 'name') and value.name:
                        try:
                            obj_data[field.name] = {
                                'url': value.url,
                                'name': str(value)
                            }
                        except (ValueError, AttributeError):
                            obj_data[field.name] = {
                                'url': None,
                                'name': None
                            }
                    else:
                        obj_data[field.name] = {
                            'url': None,
                            'name': None
                        }
                else:
                    obj_data[field.name] = value
            obj_data['id'] = obj.pk
            data.append(obj_data)
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting table data: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["POST"])
def create_table_record(request, app_label, model_name):
    """Create a new record in a specific table"""
    try:
        model = apps.get_model(app_label, model_name)
        data = json.loads(request.body)
        
        # Handle foreign key fields
        for field in model._meta.fields:
            if isinstance(field, models.ForeignKey) and field.name in data:
                if isinstance(data[field.name], dict) and 'id' in data[field.name]:
                    data[field.name] = data[field.name]['id']
        
        # Create the object
        obj = model.objects.create(**data)
        
        # Return the created object
        obj_data = {}
        for field in model._meta.fields:
            value = getattr(obj, field.name)
            if isinstance(value, models.Model):
                obj_data[field.name] = {
                    'id': value.pk,
                    'str': str(value)
                }
            elif hasattr(value, 'all'):
                obj_data[field.name] = [{'id': item.pk, 'str': str(item)} for item in value.all()]
            else:
                obj_data[field.name] = value
        obj_data['id'] = obj.pk
        
        # Send email notification
        try:
            from email_service.action_notifications import notify_admin_record_created
            notify_admin_record_created(request.user, app_label, model_name, obj.pk, obj_data)
        except Exception as email_error:
            logger.error(f"Failed to send email notification for record creation: {str(email_error)}")
        
        return JsonResponse({
            'success': True,
            'data': obj_data
        })
        
    except Exception as e:
        logger.error(f"Error creating record: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["PUT"])
def update_table_record(request, app_label, model_name, record_id):
    """Update a record in a specific table"""
    try:
        model = apps.get_model(app_label, model_name)
        data = json.loads(request.body)
        
        # Get the object
        obj = model.objects.get(pk=record_id)
        
        # Handle foreign key fields
        for field in model._meta.fields:
            if isinstance(field, models.ForeignKey) and field.name in data:
                if isinstance(data[field.name], dict) and 'id' in data[field.name]:
                    data[field.name] = data[field.name]['id']
        
        # Update the object
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        obj.save()
        
        # Return the updated object
        obj_data = {}
        for field in model._meta.fields:
            value = getattr(obj, field.name)
            if isinstance(value, models.Model):
                obj_data[field.name] = {
                    'id': value.pk,
                    'str': str(value)
                }
            elif hasattr(value, 'all'):
                obj_data[field.name] = [{'id': item.pk, 'str': str(item)} for item in value.all()]
            else:
                obj_data[field.name] = value
        obj_data['id'] = obj.pk
        
        # Send email notification
        try:
            from email_service.action_notifications import notify_admin_record_updated
            notify_admin_record_updated(request.user, app_label, model_name, record_id, data)
        except Exception as email_error:
            logger.error(f"Failed to send email notification for record update: {str(email_error)}")
        
        return JsonResponse({
            'success': True,
            'data': obj_data
        })
        
    except Exception as e:
        logger.error(f"Error updating record: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["DELETE"])
def delete_table_record(request, app_label, model_name, record_id):
    """Delete a record from a specific table"""
    try:
        model = apps.get_model(app_label, model_name)
        obj = model.objects.get(pk=record_id)
        obj.delete()
        
        # Send email notification
        try:
            from email_service.action_notifications import notify_admin_record_deleted
            notify_admin_record_deleted(request.user, app_label, model_name, record_id)
        except Exception as email_error:
            logger.error(f"Failed to send email notification for record deletion: {str(email_error)}")
        
        return JsonResponse({
            'success': True,
            'message': 'Record deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting record: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["GET"])
def get_table_structure(request, app_label, model_name):
    """Get the structure/schema of a specific table"""
    try:
        model = apps.get_model(app_label, model_name)
        
        fields_info = []
        for field in model._meta.fields:
            field_info = {
                'name': field.name,
                'type': field.__class__.__name__,
                'verbose_name': getattr(field, 'verbose_name', field.name),
                'null': field.null,
                'blank': field.blank,
                'max_length': getattr(field, 'max_length', None),
                'choices': getattr(field, 'choices', None),
                'help_text': getattr(field, 'help_text', ''),
                'is_foreign_key': isinstance(field, models.ForeignKey),
                'is_many_to_many': isinstance(field, models.ManyToManyField),
                'related_model': field.related_model._meta.label if hasattr(field, 'related_model') and field.related_model else None,
                'default': str(getattr(field, 'default', None)) if getattr(field, 'default', None) is not None else None,
            }
            fields_info.append(field_info)
        
        return JsonResponse({
            'success': True,
            'model_info': {
                'app_label': model._meta.app_label,
                'model_name': model._meta.model_name,
                'verbose_name': model._meta.verbose_name,
                'verbose_name_plural': model._meta.verbose_name_plural,
                'table_name': model._meta.db_table,
                'fields': fields_info
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting table structure: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Original functions that were in the file
@login_required(login_url='user_signup')
def add_hostel(request):
    form = Views_addHostel()
    if request.method == "POST":
        form = Views_addHostel(request.POST, request.FILES)
        if form.is_valid():
            instance = form.save(commit=False)
            hidden_data = request.POST.get('hidden_data', '[]')  # Default to empty list JSON

            try:
                room_details = json.loads(hidden_data)
                print("Parsed room details:", room_details)
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                room_details = []

            instance.room_details = hidden_data
            instance.additional_details = request.POST.get('hidden_info_data', '')
            manager = Manager.objects.get(user=request.user)

            instance.manager = manager

            room_images = request.FILES.getlist('room_image')
            print("Room images:", room_images)

            count = 0
            for room_image in room_images:
                room_number = str(room_details[count]['number_in_room']) if isinstance(room_details, list) and count < len(room_details) else str(count)

                room_image_path = os.path.join(settings.MEDIA_ROOT, 'room_images', instance.name, room_number)
                os.makedirs(room_image_path, exist_ok=True)

                try:
                    image_path = os.path.join(room_image_path, room_image.name)
                    with open(image_path, 'wb+') as destination:
                        for chunk in room_image.chunks():
                            destination.write(chunk)
                    print(f"Image saved at: {image_path}")
                except Exception as e:
                    print(f"Error saving image {room_image.name}: {e}")

                count += 1

            instance.save()
            return redirect('read_hostels')

    return render(request, 'hq/add_hostel.html', {'form': form})

def read_hostel(request): 
    context = {}
    hostels = Hostel.objects.all().order_by("-ratings")
    campus = Location.objects.all()
    context['campus'] = campus

    if request.user.is_authenticated:
        try:
            gender_obj = Gender.objects.get(user=request.user)
            user_gender = gender_obj.gender.lower() if gender_obj.gender else None

            if user_gender:
                hostels = Hostel.objects.filter(
                    gender_type__in=[user_gender, 'mixed']
                ).order_by("-ratings")
                context['gender'] = user_gender
            else:
                context['gender'] = False
        except Gender.DoesNotExist:
            context['gender'] = False
        except Exception as e:
            print(f"Unexpected error fetching gender: {e}")
            context['gender'] = False

    if request.method == 'POST' and request.user.is_authenticated:
        gender_selected = request.POST.get('gender')
        if gender_selected:
            # Save or update user's gender
            gender_obj, created = Gender.objects.get_or_create(user=request.user)
            gender_obj.gender = gender_selected
            gender_obj.save()
            context['gender'] = gender_selected
            return redirect('read_hostels')
    context['hostels'] = hostels

    campus_list = []
    for obj in campus:
        campus_list.append(obj.campus)
    
    stars_list = [one_star, two_star, three_star, four_star, five_star]  

    for obj in hostels: 
        total_star = 0
        count2 = 0
    # Calculate the total star rating and count
        for i in range(len(stars_list)):
            count = stars_list[i].objects.filter(product=obj).count()
            counted_rate = stars_list[i].objects.filter(product=obj).count()
            count2 += counted_rate

            count = count * (i + 1) 
            total_star += count

        try: 
            total_rate = (total_star/count2) 
        except: 
            total_rate = 0

        obj.ratings = round(total_rate, 1)
        obj.save()
    
    context['campus_list'] = json.dumps(campus_list)
    return render(request, 'hq/read_hostels.html', context)

@login_required(login_url='user_signup')
def update_hostel(request, id):
    hostel_instance = Hostel.objects.get(id=id)

    if request.method == "POST":
        form = Views_addHostel(request.POST, request.FILES, instance=hostel_instance)
        if form.is_valid():
            instance = form.save(commit=False)
            hidden_data = request.POST.get('hidden_data', '[]')

            try:
                room_details = json.loads(hidden_data)
            except json.JSONDecodeError:
                room_details = []

            instance.room_details = hidden_data
            instance.additional_details = request.POST.get('hidden_info_data', '')
            manager = Manager.objects.get(user=request.user)
            instance.manager = manager

            # Get old hostel room details
            try:
                hostel_room_details = json.loads(hostel_instance.room_details)
            except:
                hostel_room_details = []

            # Handle room images
            room_images = request.FILES.getlist('room_image')
            if room_images:
                count = 0
                for room_image in room_images:
                    room_number = str(room_details[count]['number_in_room']) if isinstance(room_details, list) and count < len(room_details) else str(count)

                    room_image_path = os.path.join(settings.MEDIA_ROOT, 'room_images', instance.name, room_number)
                    os.makedirs(room_image_path, exist_ok=True)

                    try:
                        image_path = os.path.join(room_image_path, room_image.name)
                        with open(image_path, 'wb+') as destination:
                            for chunk in room_image.chunks():
                                destination.write(chunk)
                        print(f"Image saved at: {image_path}")
                    except Exception as e:
                        print(f"Error saving image {room_image.name}: {e}")

                    count += 1

            instance.save()
            return redirect('read_hostels')

    form = Views_addHostel(instance=hostel_instance)
    return render(request, 'hq/update_hostel.html', {'form': form, 'hostel': hostel_instance})

def search_hostel(request, rooms):
    context = {}
    hostels = Hostel.objects.all()
    campus = Location.objects.all()
    context['campus'] = campus

    if request.user.is_authenticated:
        try:
            gender_obj = Gender.objects.get(user=request.user)
            user_gender = gender_obj.gender.lower() if gender_obj.gender else None

            if user_gender:
                hostels = Hostel.objects.filter(
                    gender_type__in=[user_gender, 'mixed']
                )
                context['gender'] = user_gender
            else:
                context['gender'] = False
        except Gender.DoesNotExist:
            context['gender'] = False
        except Exception as e:
            print(f"Unexpected error fetching gender: {e}")
            context['gender'] = False

    # Filter hostels by room count
    filtered_hostels = []
    for hostel in hostels:
        try:
            room_details = json.loads(hostel.room_details) if hostel.room_details else []
            total_rooms = sum(room.get('number_in_room', 0) for room in room_details)
            if total_rooms >= rooms:
                filtered_hostels.append(hostel)
        except:
            continue

    context['hostels'] = filtered_hostels
    context['rooms'] = rooms

    campus_list = []
    for obj in campus:
        campus_list.append(obj.campus)
    
    stars_list = [one_star, two_star, three_star, four_star, five_star]  

    for obj in filtered_hostels: 
        total_star = 0
        count2 = 0
        for i in range(len(stars_list)):
            count = stars_list[i].objects.filter(product=obj).count()
            counted_rate = stars_list[i].objects.filter(product=obj).count()
            count2 += counted_rate
            count = count * (i + 1) 
            total_star += count

        try: 
            total_rate = (total_star/count2) 
        except: 
            total_rate = 0

        obj.ratings = round(total_rate, 1)
        obj.save()
    
    context['campus_list'] = json.dumps(campus_list)
    return render(request, 'hq/search_hostels.html', context)

def detail_hostel(request, id):
    hostel = Hostel.objects.get(id=id)
    context = {'hostel': hostel}
    
    # Get reviews for this hostel
    reviews = Reviews.objects.filter(hostel=hostel).order_by('-created_at')
    context['reviews'] = reviews
    
    # Calculate ratings
    stars_list = [one_star, two_star, three_star, four_star, five_star]  
    total_star = 0
    count2 = 0
    
    for i in range(len(stars_list)):
        count = stars_list[i].objects.filter(product=hostel).count()
        counted_rate = stars_list[i].objects.filter(product=hostel).count()
        count2 += counted_rate
        count = count * (i + 1) 
        total_star += count

    try: 
        total_rate = (total_star/count2) 
    except: 
        total_rate = 0

    hostel.ratings = round(total_rate, 1)
    hostel.save()
    
    return render(request, 'hq/detail_hostel.html', context)

def man_search(request):
    if request.method == 'POST':
        campus = request.POST.get('campus')
        rooms = request.POST.get('rooms')
        
        if campus and rooms:
            return redirect('search_hostel', rooms=int(rooms))
    
    campus = Location.objects.all()
    return render(request, 'hq/man_search.html', {'campus': campus})

def email_verified(request):
    return render(request, 'hq/email_verified.html')