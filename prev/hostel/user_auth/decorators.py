from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib import messages
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


def require_verified_account(view_func):
    """
    Decorator for web views that requires the user to have a verified account
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in to access this page.')
            return redirect('user_login')
        
        # Check if user has verification record
        try:
            verification = request.user.verification
            if not verification.account_verified:
                messages.warning(request, 'Please verify your email address to access this page.')
                return redirect('user_login')
        except:
            # If no verification record exists, redirect to login
            messages.error(request, 'Account verification required. Please contact support.')
            return redirect('user_login')
        
        return view_func(request, *args, **kwargs)
    return wrapper


def require_verified_account_api(view_func):
    """
    Decorator for API views that requires the user to have a verified account
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'Please log in to access this resource'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has verification record
        try:
            verification = request.user.verification
            if not verification.account_verified:
                return Response({
                    'error': 'Account not verified',
                    'message': 'Please check your email and verify your account to continue. A verification link was sent to your email address.',
                    'account_verified': False,
                    'requires_verification': True
                }, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            # If no verification record exists, require verification
            return Response({
                'error': 'Account verification required',
                'message': 'Please check your email and verify your account to continue. If you haven\'t received a verification email, please contact support.',
                'account_verified': False,
                'requires_verification': True
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            # Log the error and require verification
            import traceback
            print(f"Verification check error: {e}")
            print(traceback.format_exc())
            return Response({
                'error': 'Account verification required',
                'message': 'Please check your email and verify your account to continue.',
                'account_verified': False,
                'requires_verification': True
            }, status=status.HTTP_403_FORBIDDEN)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def check_verification_status(user):
    """
    Helper function to check if a user's account is verified
    Returns tuple: (is_verified, message)
    """
    if not user.is_authenticated:
        return False, "User not authenticated"
    
    try:
        verification = user.verification
        if verification.account_verified:
            return True, "Account verified"
        else:
            return False, "Account not verified"
    except:
        return False, "No verification record found"
