from django.db import models
from django.contrib.auth.models import User, AbstractUser
import random
import hashlib
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True) 


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=64, blank=True, null=True)  # increase max_length for the hashed OTP
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    def generate_otp(self):
        # 6-digit OTP
        plain_otp = str(random.randint(100000, 999999))

        # Hash the OTP
        hashed_otp = hashlib.sha256(plain_otp.encode('utf-8')).hexdigest()

        self.otp = hashed_otp
        self.otp_created_at = timezone.now()
        self.save()

        return plain_otp

    def check_otp(self, otp):
        if not self.otp:
            return False
        hashed_otp = hashlib.sha256(otp.encode('utf-8')).hexdigest()
        return self.otp == hashed_otp