from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.models import CustomUser as User, Page, Collection, Product
from .serializers import (
    RegisterSerializer, UserSerializer, PageSerializer,
    CollectionSerializer, ProductSerializer, ProfileSerializer
)
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
import logging
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

logger = logging.getLogger(__name__)

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
            else:  # if it's a username
                user = User.objects.get(username=username_or_email)

            profile = user.profile

            # first check if OTP expired
            if not profile.otp_created_at or timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                return Response({'error': 'OTP expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            # check if OTP is correct
            if profile.check_otp(otp):
                profile.is_verified = True
                user.is_active = True
                profile.otp = ''  # clear OTP after verification
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
            if re.match(r"[^@]+@[^@]+\.[^@]+", username_or_email):  # if it's an email
                user = User.objects.get(email=username_or_email.lower())
            else:  # if it's a username
                user = User.objects.get(username=username_or_email)

            profile = user.profile

            # Check if OTP expired (based on 5-minute window)
            if profile.otp_created_at and timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                # OTP expired, regenerate a new one
                new_otp = profile.generate_otp()  # This will regenerate the OTP

                # Send the new OTP to the user via email
                send_mail(
                    subject='Your new verification code',
                    message=f'Your new OTP is {new_otp}',
                    from_email=config('EMAIL_HOST_USER'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                return Response({'message': 'OTP resent successfully!'}, status=status.HTTP_200_OK)
            else:
                # If OTP is still valid, inform user that they should use the previous OTP
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
            # first, try finding the user by username
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                # if not found, try finding the user by email
                user = User.objects.get(email=username_or_email.lower())
            except User.DoesNotExist:
                raise AuthenticationFailed('User with this username/email does not exist.')

        # check if user is a social login user
        if user.has_usable_password():
            if not user.check_password(password):
                raise AuthenticationFailed('Invalid credentials')
        else:
            # social login users don't need password
            if password:
                raise AuthenticationFailed('This account uses social login.')

        if not hasattr(user, 'profile') or not user.profile.is_verified:
            profile = user.profile

            if profile.otp_created_at and timezone.now() > profile.otp_created_at + timedelta(minutes=5):
                # OTP expired, regenerate a new one
                new_otp = profile.generate_otp()  # This will regenerate the OTP

                # Send the new OTP to the user via email
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
                # If OTP is still valid, inform user that they should use the previous OTP
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
        logger.debug("Raw request data: %s", mutable_data)

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
        products_data = request.data.get('products', [])
        user = request.user

        # Handle collection if provided
        collection = None
        if collection_name:
            collection, created = Collection.objects.get_or_create(user=user, name=collection_name)
            if not created:
                # If collection exists, update its updated_at timestamp
                collection.updated_at = timezone.now()
                collection.save()

        # Process products
        for product_data in products_data:
            image = product_data.get('image')
            serializer = ProductSerializer(data={
                'title': product_data.get('title'),
                'description': product_data.get('description', ''),
                'price': product_data.get('price'),
                'stock': product_data.get('stock', None),
                'image': image if image else None,
                'collection': collection.id if collection else None
            }, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save(user=user)

        return Response({"message": "Products added successfully"}, status=status.HTTP_201_CREATED)


class AddProductsCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        collection_name = request.data.get('collection', None)
        csv_file = request.FILES.get('csv_file')
        user = request.user

        if not csv_file:
            return Response({"error": "CSV file is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle collection if provided
        collection = None
        if collection_name:
            collection, created = Collection.objects.get_or_create(user=user, name=collection_name)
            if not created:
                collection.updated_at = timezone.now()
                collection.save()

        # Process CSV file
        try:
            text_io = TextIOWrapper(csv_file.file, encoding='utf-8')
            reader = csv.DictReader(text_io)
            for row in reader:
                serializer = ProductSerializer(data={
                    'title': row.get('Title'),
                    'description': row.get('Description', ''),
                    'price': row.get('Price'),
                    'stock': int(row.get('Stock')) if row.get('Stock') else None,
                    'image': None,  # CSV upload doesn't handle images in this implementation
                    'collection': collection.id if collection else None
                }, context={'request': request})
                serializer.is_valid(raise_exception=True)
                serializer.save(user=user)
        except Exception as e:
            return Response({"error": f"Failed to process CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Products added successfully from CSV"}, status=status.HTTP_201_CREATED)