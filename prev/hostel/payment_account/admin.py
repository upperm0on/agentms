from django.contrib import admin
from .models import PaymentAccount

# Register your models here.

@admin.register(PaymentAccount)
class PaymentAccountAdmin(admin.ModelAdmin):
    list_display = ['manager', 'account_name', 'account_number', 'bank_id', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['manager__user__username', 'manager__user__email', 'account_name', 'account_number']
    readonly_fields = ['created_at', 'updated_at']
