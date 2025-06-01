from django.urls import path
from .views import (
    RegisterView, LogoutView, VerifyOTPView, CustomTokenObtainPairView,
    ResendOTPView, ForgotPasswordView, ResetPasswordView,
    PageDetailView, AddProductsView, AddProductsCSVView,
    ProfileDetailView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('user/register/', RegisterView.as_view(), name='register'),
    path('user/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('user/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('page/', PageDetailView.as_view(), name='page_detail'),
    path('products/add/', AddProductsView.as_view(), name='add_products'),
    path('products/add-csv/', AddProductsCSVView.as_view(), name='add_products_csv'),
]