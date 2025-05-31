from rest_framework import serializers
from users.models import CustomUser as User, Page, Collection, Product
import re
from django.core.mail import send_mail
from decouple import config
import os
from django.core.files.storage import default_storage

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


class PageSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    banner_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Page
        fields = ['id', 'profile_image', 'banner_image', 'product_name', 'tagline', 'about', 'email', 'phone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        page = Page.objects.create(user=user, **validated_data)
        return page

    def update(self, instance, validated_data):
        for field in ['profile_image', 'banner_image']:
            if field in validated_data:
                old_image = getattr(instance, field)
                new_image_value = validated_data[field]
                if new_image_value and hasattr(new_image_value, 'file'):
                    if old_image and default_storage.exists(old_image.path) and old_image != new_image_value:
                        default_storage.delete(old_image.path)
                    setattr(instance, field, new_image_value)
                elif new_image_value is None or new_image_value == '':
                    if old_image and default_storage.exists(old_image.path):
                        default_storage.delete(old_image.path)
                    setattr(instance, field, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        user = self.context['request'].user
        if Collection.objects.filter(user=user, name=value).exists():
            raise serializers.ValidationError("A collection with this name already exists for this user.")
        return value


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'stock', 'image', 'collection', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']