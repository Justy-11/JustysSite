from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import hashlib
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True) 

    def __str__(self):
        return self.username

    # Allow users without passwords (for social login)
    def set_unusable_password(self):
        super().set_unusable_password()


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=64, blank=True, null=True)  # increase max_length for the hashed OTP
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    social_links = models.TextField(blank=True)  # Comma-separated URLs

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
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
        

class Page(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='page')
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banner_images/', blank=True, null=True)
    product_name = models.CharField(max_length=255, blank=True)
    tagline = models.CharField(max_length=255, blank=True)
    about = models.TextField(max_length=500, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Page"


class Collection(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'name')
        
    def __str__(self):
        return self.name


class Product(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='products')
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, blank=True, null=True, related_name='products')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(blank=True, null=True)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title