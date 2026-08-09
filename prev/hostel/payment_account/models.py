from django.db import models
from managers.models import Manager

# Create your models here.
class PaymentAccount(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, null=True, blank=True)
    bank_id = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    account_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    account_code = models.CharField(max_length=100)
    # Platform share percentage (e.g., 5.0 = 5% platform fee)
    platform_share_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00, help_text="Platform share percentage (e.g., 5.00 = 5%)")

    def __str__(self):
        return f"{self.manager} - {self.account_number}"

