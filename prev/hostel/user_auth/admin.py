from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Account_status, Gender, UserVerification, UserProfile

# Custom User Admin to show verification status
class UserAdmin(BaseUserAdmin):
    list_display = BaseUserAdmin.list_display + ('is_verified', 'verification_date')
    list_filter = BaseUserAdmin.list_filter + ('verification__account_verified',)
    
    def is_verified(self, obj):
        try:
            return obj.verification.account_verified
        except:
            return False
    is_verified.boolean = True
    is_verified.short_description = 'Verified'
    
    def verification_date(self, obj):
        try:
            return obj.verification.created_at
        except:
            return 'No verification record'
    verification_date.short_description = 'Verification Date'

# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register your models here.
admin.site.register(Account_status)
admin.site.register(Gender)

@admin.register(UserVerification)
class UserVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'account_verified', 'verification_token', 'created_at']
    list_filter = ['account_verified', 'created_at']
    search_fields = ['user__email', 'user__username', 'verification_token']
    readonly_fields = ['verification_token', 'created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone']
    search_fields = ['user__email', 'user__username', 'phone']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')