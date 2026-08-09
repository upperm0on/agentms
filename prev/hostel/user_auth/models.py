from django.db import models
import uuid
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User

# Create your models here.

class Account_status(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    ACCOUNT_STATUS_CHOICES = [('consumer', 'consumer'), ('manager', 'manager')]
    user_status = models.CharField(max_length=255, choices=ACCOUNT_STATUS_CHOICES, default='consumer', blank=True, null=True)

class Gender(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True)
    GENDER_CHOICES = [('male', 'male'), ('female', 'female')]
    gender = models.CharField(max_length=255, choices=GENDER_CHOICES, null=True, blank=True)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


class UserVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification')
    account_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.verification_token:
            self.verification_token = str(uuid.uuid4())
        super().save(*args, **kwargs)
    
    def send_verification_email(self):
        verification_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5317')}/verify-email/{self.verification_token}"
        
        # Create a more professional email template
        subject = 'Welcome to HostTels - Verify Your Account'
        message = f"""
Dear {self.user.username or self.user.email},

Welcome to HostTels! We're excited to have you join our community.

To complete your account setup and start booking hostels, please verify your email address by clicking the link below:

VERIFY YOUR ACCOUNT: {verification_url}

If the link doesn't work, you can copy and paste it into your browser.

 What happens next?
- Click the verification link above
- Your account will be activated immediately
- You can then login and start booking hostels
- Access all our premium features

⏰ This verification link will expire in 24 hours for security reasons.

❓ Need help?
If you didn't create an account with HostTels, please ignore this email.
If you're having trouble, contact our support team.

Best regards,
The HostTels Team

---
HostTels - Your Gateway to Quality Student Accommodation
📧 Email: support@hosttels.com
🌐 Website: https://hosttels.com
        """.strip()
        
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@hosttels.com'),
            recipient_list=[self.user.email],
            fail_silently=False,
        )
    
    def __str__(self):
        return f"Verification for {self.user.email}"