from rest_framework import serializers
from users.models import CustomUser as User, Page, SocialLink, Collection, Product
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


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url']


class PageSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, required=False)
    profile_image = serializers.ImageField(required=False)
    banner_image = serializers.ImageField(required=False)

    class Meta:
        model = Page
        fields = ['id', 'profile_image', 'banner_image', 'product_name', 'tagline', 'about', 'email', 'phone', 'social_links', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        social_links_data = validated_data.pop('social_links', [])
        user = self.context['request'].user
        page = Page.objects.create(user=user, **validated_data)
        for link_data in social_links_data:
            SocialLink.objects.create(page=page, **link_data)
        return page

    def update(self, instance, validated_data):
        social_links_data = validated_data.pop('social_links', None)

        # Handle image updates and deletions
        for field in ['profile_image', 'banner_image']:
            if field in validated_data:
                old_image = getattr(instance, field)
                new_image = validated_data[field]
                # If a new image is uploaded, delete the old one
                if old_image and new_image and old_image != new_image:
                    if default_storage.exists(old_image.path):
                        default_storage.delete(old_image.path)
                # If the field is being cleared (set to None), delete the old image
                if old_image and new_image is None:
                    if default_storage.exists(old_image.path):
                        default_storage.delete(old_image.path)

        # Update scalar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update social links if provided
        if social_links_data is not None:
            instance.social_links.all().delete()
            for link_data in social_links_data:
                SocialLink.objects.create(page=instance, **link_data)

        return instance


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