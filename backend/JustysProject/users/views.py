from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.models import CustomUser as User
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
from django.urls import reverse

logger = logging.getLogger(__name__)

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

        if not user.check_password(password):
            raise AuthenticationFailed('Invalid credentials')

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


class LogoutView(generics.GenericAPIView):
    def post(self, request):
        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)