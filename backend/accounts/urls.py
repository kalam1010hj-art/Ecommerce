from django.urls import path
from .views import RegisterView, LoginView, SendMobileOTPView, VerifyMobileOTPView

urlpatterns = [
    path("register", RegisterView.as_view()),
    path("login", LoginView.as_view()),
    path("mobile/send-otp", SendMobileOTPView.as_view()),
    path("mobile/verify-otp", VerifyMobileOTPView.as_view()),
]
