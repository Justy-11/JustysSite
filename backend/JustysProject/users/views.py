from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.models import CustomUser as User, Page, Collection, Product
from .serializers import (
    RegisterSerializer, UserSerializer, PageSerializer,
    CollectionSerializer, ProductSerializer, ProfileSerializer,
    PublicPageSerializer, PublicProductSerializer, PublicCollectionSerializer,
    PublicProfileSerializer
)
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from datetime import timedelta
import re
from django.core.mail import send_mail
from decouple import config
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from allauth.socialaccount.models import SocialAccount
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
import csv
from io import TextIOWrapper
from django.http import QueryDict
import zipfile
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError
from decimal import Decimal
from django.http import Http404


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        """Override create to handle validation errors properly."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username')
        otp = request.data.get('otp')

        try:
            if re.match(r"[^@]+@[^@]+\.[^@]+", username_or_email):  # if it's an email
                user = User.objects.get(email=username_or_email.lower())
            else:
                user = User.objects.get(username=username_or_email)

            profile = user.profile

            if not profile.otp_created_at or timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                return Response({'error': 'OTP expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            if profile.check_otp(otp):
                profile.is_verified = True
                user.is_active = True
                profile.otp = ''
                profile.save()
                user.save()
                return Response({'message': 'Account verified successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username')
        
        try:
            if re.match(r"[^@]+@[^@]+\.[^@]+", username_or_email):
                user = User.objects.get(email=username_or_email.lower())
            else:
                user = User.objects.get(username=username_or_email)

            profile = user.profile

            if profile.otp_created_at and timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                new_otp = profile.generate_otp()

                send_mail(
                    subject='Your new verification code',
                    message=f'Your new OTP is {new_otp}',
                    from_email=config('EMAIL_HOST_USER'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                return Response({'message': 'OTP resent successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'OTP is still valid, please use the existing one.'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username', None)
        password = attrs.get('password', None)

        if not username_or_email or not password:
            raise AuthenticationFailed('Username or email and password are required.')

        user = None
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=username_or_email.lower())
            except User.DoesNotExist:
                raise AuthenticationFailed('User with this username/email does not exist.')

        if user.has_usable_password():
            if not user.check_password(password):
                raise AuthenticationFailed('Invalid credentials')
        else:
            if password:
                raise AuthenticationFailed('This account uses social login.')

        if not hasattr(user, 'profile') or not user.profile.is_verified:
            profile = user.profile

            if profile.otp_created_at and timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                
                new_otp = profile.generate_otp()

                send_mail(
                    subject='Your new verification code',
                    message=f'Your new OTP is {new_otp}',
                    from_email=config('EMAIL_HOST_USER'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                return {
                'is_verified': False,
                'message': 'Account not verified. OTP sent!! Please check your email.'
            }
            else:
                return {
                'is_verified': False,
                'message': 'OTP is still valid. Please check your email.'
            }
        
        attrs['username'] = user.username
        
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            
            frontend_url = config('FRONTEND_URL')
            reset_url = f"{frontend_url}/reset-password?token={token}&uid={uid}"
            
            send_mail(
                subject="Reset Your Password",
                message=f"Click the link to reset your password: {reset_url}",
                from_email=config('EMAIL_HOST_USER'),
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({"message": "Reset email sent."})
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=400)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        uidb64 = request.data.get("uid")
        password = request.data.get("password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password has been reset."})
            else:
                return Response({"error": "Invalid or expired token."}, status=400)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid request."}, status=400)


@login_required
def google_login_callback(request):
    user = request.user
    social_accounts = SocialAccount.objects.filter(user=user)
    social_account = social_accounts.first()

    if not social_account:
        print("No social account for user:", user)
        return redirect('http://localhost:5173/login/callback/?error=NoSocialAccount')
    
    token = SocialToken.objects.filter(account=social_account, account__provider='google').first()

    if token:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return redirect(f'http://localhost:5173/login/callback/?access_token={access_token}&refresh_token={refresh_token}')
    else:
        return redirect(f'http://localhost:5173/login/callback/?error=NoGoogleToken')


@csrf_exempt
def validate_google_token(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            google_access_token = data.get('access_token')
            print(f"Received Google access token: {google_access_token}")

            if not google_access_token:
                return JsonResponse({'detail': 'Access token is missing.'}, status=400)

            # Verify the JWT token
            try:
                token = AccessToken(google_access_token)
                user_id = token['user_id']
                user = User.objects.get(id=user_id)
                print(f"Token validated for user: {user.username}")
                return JsonResponse({'valid': True, 'user': {'id': user.id, 'username': user.username}})
            except Exception as e:
                print(f"Token validation failed: {str(e)}")
                return JsonResponse({'detail': 'Invalid token.', 'error': str(e)}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)
    return JsonResponse({'detail': 'Method not allowed.'}, status=405)


class LogoutView(generics.GenericAPIView):
    def post(self, request):
        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)


class PageDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PageSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try:
            return Page.objects.get(user=user)
        except Page.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        page = self.get_object()
        if page is None:
            return Response({}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(page)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        page = self.get_object()
        mutable_data = request.data.copy()

        if page is None:
            serializer = self.get_serializer(data=mutable_data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            serializer = self.get_serializer(page, data=mutable_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)


class AddProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        collection_name = request.data.get('collection', None)
        user = request.user

        products_data = []
        product_indices = set()
        
        for key in request.data:
            match = re.match(r'products\[(\d+)\]\[(\w+)\]', key)
            if match:
                index = int(match.group(1))
                product_indices.add(index)

        for index in sorted(product_indices):
            product = {
                'title': request.data.get(f'products[{index}][title]'),
                'description': request.data.get(f'products[{index}][description]', ''),
                'price': request.data.get(f'products[{index}][price]', ''),
                'stock': request.data.get(f'products[{index}][stock]', ''),
                'image': request.FILES.get(f'products[{index}][image]')
            }
            products_data.append(product)

        if not products_data:
            return Response({"error": "No products provided"}, status=status.HTTP_400_BAD_REQUEST)

        collection = None
        if collection_name:
            try:
                collection, created = Collection.objects.get_or_create(user=user, name=collection_name)
                if not created:
                    collection.updated_at = timezone.now()
                    collection.save()
            except Exception as e:
                return Response({"error": f"Failed to process collection: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        created_products = []

        for index, product_data in enumerate(products_data):
            try:
                price = product_data.get('price')
                price_decimal = None
                if price and price.strip():
                    try:
                        price_decimal = float(price)
                    except ValueError:
                        raise ValidationError(f"Invalid price format for product {index + 1}")

                stock = product_data.get('stock')
                stock_int = None
                if stock and stock.strip():
                    try:
                        stock_int = int(stock)
                    except ValueError:
                        raise ValidationError(f"Invalid stock format for product {index + 1}")

                serializer = ProductSerializer(data={
                    'title': product_data.get('title'),
                    'description': product_data.get('description', ''),
                    'price': price_decimal,
                    'stock': stock_int,
                    'image': product_data.get('image'),
                    'collection': collection.id if collection else None
                }, context={'request': request})

                if serializer.is_valid():
                    product = serializer.save(user=user)
                    created_products.append(product.title)
                else:
                    errors.append(f"Product {index + 1}: {serializer.errors}")

            except Exception as e:
                errors.append(f"Product {index + 1}: {str(e)}")

        if errors:
            return Response({
                "error": "Some products failed to save",
                "details": errors,
                "created": created_products
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "Products added successfully",
            "created": created_products
        }, status=status.HTTP_201_CREATED)


class AddProductsCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        collection_name = request.data.get('collection', None)
        csv_file = request.FILES.get('csv_file')
        zip_file = request.FILES.get('zip_file')
        user = request.user

        if not csv_file or not zip_file:
            return Response({"error": "Both CSV and ZIP files are required"}, status=status.HTTP_400_BAD_REQUEST)

        collection = None
        if collection_name:
            collection, created = Collection.objects.get_or_create(user=user, name=collection_name)
            if not created:
                collection.updated_at = timezone.now()
                collection.save()

        image_files = {}
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                for file_name in zip_ref.namelist():
                    if file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                        with zip_ref.open(file_name) as file:
                            content = file.read()
                            filename = os.path.basename(file_name)
                            path = f'product_images/{filename}'
                            if not default_storage.exists(path):
                                default_storage.save(path, ContentFile(content))
                            image_files[filename] = path
        except zipfile.BadZipFile:
            return Response({"error": "Invalid ZIP file"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Failed to process ZIP: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        created_products = []
        try:
            text_io = TextIOWrapper(csv_file.file, encoding='utf-8')
            reader = csv.DictReader(text_io)
            required_columns = {'Title', 'Image File Name'}
            if not all(col in reader.fieldnames for col in required_columns):
                missing = required_columns - set(reader.fieldnames)
                return Response({"error": f"Missing required columns: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

            for row_number, row in enumerate(reader, start=1):
                try:
                    image_filename = row.get('Image File Name')
                    image_path = None
                    if image_filename:
                        image_path = image_files.get(image_filename)
                        if not image_path or not default_storage.exists(image_path):
                            errors.append(f"Row {row_number}: Image file '{image_filename}' not found in ZIP.")
                            continue
                    
                    price = row.get('Price')
                    price_decimal = None
                    if price and price.strip():
                        try:
                            price_decimal = Decimal(price)
                        except (ValueError, TypeError):
                            errors.append(f"Row {row_number}: Invalid price format")
                            continue

                    stock = row.get('Stock')
                    stock_int = None
                    if stock and stock.strip():
                        try:
                            stock_int = int(stock)
                        except (ValueError, TypeError):
                            errors.append(f"Row {row_number}: Invalid stock format")
                            continue

                    product = Product(
                        user=user,
                        title=row.get('Title'),
                        description=row.get('Description', ''),
                        price=price_decimal,
                        stock=stock_int,
                        image=image_path if image_path else None,
                        collection=collection
                    )
                    product.save()
                    created_products.append(product.title)

                except (ValueError, TypeError) as e:
                    errors.append(f"Row {row_number}: Invalid data format: {str(e)}")
                except Exception as e:
                    errors.append(f"Row {row_number}: Failed to process product: {str(e)}")

        except Exception as e:
            errors.append(f"Failed to process CSV: {str(e)}")
        finally:
            if errors:
                for path in image_files.values():
                    if default_storage.exists(path) and path not in [getattr(p, 'image', None) for p in Product.objects.filter(title__in=created_products)]:
                        default_storage.delete(path)
                return Response({"error": "Failed to process CSV", "details": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Products added successfully from CSV", "created": created_products}, status=status.HTTP_201_CREATED)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.image and default_storage.exists(instance.image.path):
            default_storage.delete(instance.image.path)
        instance.delete()


class CollectionListView(generics.ListAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Products will have collection set to null due to SET_NULL
        instance.delete()


# Public API Views (No authentication required)
class PublicPagesListView(generics.ListAPIView):
    serializer_class = PublicPageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Page.objects.filter(is_published=True).select_related('user')


class PublicPageDetailView(generics.RetrieveAPIView):
    serializer_class = PublicPageSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Page.objects.filter(is_published=True).select_related('user')


class PublicProductsListView(generics.ListAPIView):
    serializer_class = PublicProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        page_id = self.kwargs.get('page_id')
        try:
            page = Page.objects.get(id=page_id, is_published=True)
            return Product.objects.filter(user=page.user)
        except Page.DoesNotExist:
            return Product.objects.none()


class PublicCollectionsListView(generics.ListAPIView):
    serializer_class = PublicCollectionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        page_id = self.kwargs.get('page_id')
        try:
            page = Page.objects.get(id=page_id, is_published=True)
            return Collection.objects.filter(user=page.user).prefetch_related('products')
        except Page.DoesNotExist:
            return Collection.objects.none()


class PublicProfileDetailView(generics.RetrieveAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        page_id = self.kwargs.get('page_id')
        try:
            page = Page.objects.get(id=page_id, is_published=True)
            return page.user.profile
        except Page.DoesNotExist:
            raise Http404("Page not found")


class PublishPageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            page = Page.objects.get(user=request.user)
            page.is_published = True
            page.save()
            return Response({
                'message': 'Page published successfully!',
                'shareable_link': f"{request.build_absolute_uri('/').rstrip('/')}/landingpage/{page.id}"
            }, status=status.HTTP_200_OK)
        except Page.DoesNotExist:
            return Response({
                'error': 'Page not found. Please create a page first.'
            }, status=status.HTTP_404_NOT_FOUND)