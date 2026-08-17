"""
Add this code to your Django backend in hq/api_views.py
This creates a proper admin login endpoint
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login endpoint that checks for superuser privileges
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
    
    # If is_admin is True, check if user is actually a superuser (admin)
    if is_admin:
        if not user.is_superuser:
            return Response({
                'error': 'User is not an admin',
                'status': 'failed'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # User is an admin, proceed with login
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'email': user.email,
            'username': user.username,
            'is_admin': True,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'status': 'success'
        }, status=status.HTTP_200_OK)
    else:
        # Regular user login (not admin)
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'email': user.email,
            'username': user.username,
            'is_admin': False,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'status': 'success'
        }, status=status.HTTP_200_OK)
