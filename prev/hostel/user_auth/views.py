from django.shortcuts import render, redirect
from .view_forms import View_user_login, View_user_signup
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth import get_user_model
from .decorators import require_verified_account

User = get_user_model()

from .models import Account_status, Gender

from django.db.models.signals import post_save
from django.dispatch import receiver


# Create your views here.
def user_signup(request):
    template = 'user_login/login.html'
    message = 'Sign Up Here'
    # provider_classes = registry.get_class_list()
    # providers = [{
    #     'name': provider.name,
    #     'id': provider.id,
    #     'icon': getattr(provider, 'icon', ''),  # icon might not exist
    # } for provider in provider_classes]
    providers = []
    forms = View_user_signup() 
    error_msg = ''
    if request.method == "POST":
        forms = View_user_signup(request.POST)
        if forms.is_valid():
            email = forms.cleaned_data['email']
            name = forms.cleaned_data.get('name', '')
            password = forms.cleaned_data['password']
            gender = forms.cleaned_data.get('gender')

            # Check if email already exists
            if User.objects.filter(email=email).exists():
                error_msg = 'An account with this email already exists. Please use a different email.'
            else:
                # Generate username from email (before @ symbol)
                username = email.split('@')[0]
                
                # Check if username already exists, if so append a number
                original_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1
                
                # Use name if provided, otherwise use username
                first_name = name if name else username
                
                user = User.objects.create(
                    username=username, 
                    email=email,
                    first_name=first_name
                ) 
                user.set_password(password)
                user.save()

                # Create Gender record if gender is provided
                if gender:
                    Gender.objects.create(user=user, gender=gender)

                user = authenticate(request, username=email, password=password)
                if user is not None: 
                    login(request, user)
                    return redirect('/dashboard/')
    context = {
        'forms' : forms,
        'msg': message,
        'error_msg': error_msg,
        'status': 'signup',
        'providers': providers,
    }
    return render(request, template, context)

@receiver(post_save, sender=User)
def create_account_status(sender, instance, created, **kwargs):
    if created:  # Only run when a new user is created
        Account_status.objects.create(user=instance)

# from allauth.socialaccount.providers import registry 

def user_login(request):
    template = 'user_login/login.html'
    message = 'Login Here'
    message2 = 'sign up here'
    error_msg = ''
    # provider_classes = registry.get_class_list()
    # providers = [{
    #     'name': provider.name,
    #     'id': provider.id,
    #     'icon': getattr(provider, 'icon', ''),  # icon might not exist
    # } for provider in provider_classes]
    providers = []

    forms = View_user_login()

    if request.method == "POST":
        forms = View_user_login(request.POST)
        if forms.is_valid():
            email = forms.cleaned_data['email']
            password = forms.cleaned_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('/dashboard/')
            else:
                error_msg = 'The Email or Password was invalid or not found in the database'

    context = {
        'forms': forms,
        'msg': message,
        'msg2': message2,
        'error_msg': error_msg,
        'status': 'login',
        'providers': providers,
    }

    return render(request, template, context)
def user_logout(request):
    logout(request)
    return redirect('landing_page')
    
