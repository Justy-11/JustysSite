from rest_framework import serializers
from users.models import CustomUser as User, Profile, Page, Collection, Product
import re
from django.core.mail import send_mail
from decouple import config
import os
from django.core.files.storage import default_storage
from decimal import Decimal


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = { 'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data['username']
        instance.save()
        return instance

        
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

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', required=False)
    currency = serializers.ChoiceField(choices=[('LKR', 'LKR'), ('USD', 'USD')], default='LKR')

    class Meta:
        model = Profile
        fields = ['username', 'email', 'phone_number', 'street', 'city', 'state', 'zip_code', 'social_links', 'currency']
        read_only_fields = ['email']

    def validate_social_links(self, value):
        if not value:
            return ""
        urls = [url.strip() for url in value.split(',') if url.strip()]
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        for url in urls:
            if not url_pattern.match(url):
                raise serializers.ValidationError(f"Invalid URL: {url}")
        return ','.join(urls)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if 'username' in user_data:
            instance.user.username = user_data['username']
            instance.user.save()
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.street = validated_data.get('street', instance.street)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.zip_code = validated_data.get('zip_code', instance.zip_code)
        instance.social_links = validated_data.get('social_links', instance.social_links)
        instance.currency = validated_data.get('currency', instance.currency)
        instance.save()
        return instance


class PageSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    banner_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Page
        fields = ['id', 'profile_image', 'banner_image', 'product_name', 'tagline', 'about', 'email', 'phone', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('user', None)
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


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    collection = serializers.PrimaryKeyRelatedField(
        queryset=Collection.objects.none(),
        allow_null=True,
        required=False
    )
    collection_name = serializers.CharField(source='collection.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'stock', 'image', 'collection', 'collection_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'collection_name']
        extra_kwargs = {
            'user': {'write_only': True},
            'price': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'stock': {'required': False, 'allow_null': True}

        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'context' in kwargs and 'request' in kwargs['context']:
            self.fields['collection'].queryset = Collection.objects.filter(user=kwargs['context']['request'].user)

    def validate(self, data):
        if not data.get('title'):
            raise serializers.ValidationError({"title": "Title is required."})

        price = data.get('price')
        if price is not None:
            try:
                price = Decimal(str(price))
                if price < 0:
                    raise serializers.ValidationError({"price": "Price cannot be negative."})
                data['price'] = price
            except (ValueError, TypeError):
                raise serializers.ValidationError({"price": "Invalid price format."})

        stock = data.get('stock')
        if stock is not None:
            try:
                stock = int(stock)
                if stock < 0:
                    raise serializers.ValidationError({"stock": "Stock cannot be negative."})
                data['stock'] = stock
            except (ValueError, TypeError):
                raise serializers.ValidationError({"stock": "Invalid stock format."})

        return data

    def validate_image(self, value):
        if value:
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            if value.size > max_size:
                raise serializers.ValidationError(f"Image file size exceeds limit of {max_size / (1024 * 1024)}MB.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        try:
            product = Product.objects.create(
                user=user,
                title=validated_data['title'],
                description=validated_data.get('description', ''),
                price=validated_data.get('price'),
                stock=validated_data.get('stock'),
                image=validated_data.get('image'),
                collection=validated_data.get('collection')
            )
            return product
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create product: {str(e)}")

    def update(self, instance, validated_data):
        old_image = instance.image
        new_image = validated_data.get('image')
        if new_image and old_image and old_image != new_image:
            if default_storage.exists(old_image.path):
                default_storage.delete(old_image.path)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CollectionSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ['id', 'name', 'products', 'created_at', 'updated_at']
        read_only_fields = ['id', 'products', 'created_at', 'updated_at']

    def validate_name(self, value):
        user = self.context['request'].user
        if self.instance and self.instance.name == value:
            return value
        if Collection.objects.filter(user=user, name=value).exists():
            raise serializers.ValidationError("A collection with this name already exists for this user.")
        return value


class PublicPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'profile_image', 'banner_image', 'product_name', 'tagline', 'about', 'email', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


class PublicProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'stock', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class PublicCollectionSerializer(serializers.ModelSerializer):
    products = PublicProductSerializer(many=True, read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'products', 'created_at']
        read_only_fields = ['id', 'products', 'created_at']


class PublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['social_links', 'currency']
        read_only_fields = ['social_links', 'currency']