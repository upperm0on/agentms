from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


# Create your models here.
class Manager(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Payment setup fields
    paystack_subaccount_id = models.CharField(max_length=100, blank=True, null=True, help_text="Paystack subaccount ID for payments")
    bank_account_setup = models.BooleanField(default=False, help_text="Whether bank account is set up for payments")
    payment_currency = models.CharField(max_length=3, blank=True, null=True, help_text="Currency for payments (e.g., GHS, USD, EUR)")
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
    
    @property
    def is_payment_ready(self):
        """Check if manager has complete payment setup"""
        return bool(
            self.paystack_subaccount_id and 
            self.bank_account_setup and 
            self.payment_currency
        )
    