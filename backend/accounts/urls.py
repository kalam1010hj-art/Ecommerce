from django.urls import path
from .views import RegisterView, LoginView, SendMobileOTPView, VerifyMobileOTPView
from .profile_views import ProfileView
from .password_reset_views import ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path("register", RegisterView.as_view()),
    path("login", LoginView.as_view()),
    path("forgot-password", ForgotPasswordView.as_view()),
    path("reset-password/<uidb64>/<token>", ResetPasswordView.as_view()),
    path("mobile/send-otp", SendMobileOTPView.as_view()),
    path("mobile/verify-otp", VerifyMobileOTPView.as_view()),
    path("profile", ProfileView.as_view()),
]
