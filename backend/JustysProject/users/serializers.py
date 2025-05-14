from rest_framework import serializers
from users.models import CustomUser as User
import re
from django.core.mail import send_mail
from decouple import config

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = { 'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

        
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        user = User.objects.create_user(**validated_data, email=email, is_active = False)

        profile = user.profile
        plain_otp = profile.generate_otp()

        send_mail(
            subject='Your verification code',
            message=f'Your OTP is {plain_otp}',
            from_email=config('EMAIL_HOST_USER'),
            recipient_list=[email],
            fail_silently=False,
        )

        return user