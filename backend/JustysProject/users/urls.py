from django.urls import path
from .views import RegisterView, LogoutView, VerifyOTPView, CustomTokenObtainPairView, ResendOTPView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('user/register/', RegisterView.as_view(), name='register'),
    path('user/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('user/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]