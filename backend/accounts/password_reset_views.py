import os

from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import Http404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class ForgotPasswordView(APIView):
    """Send a password-reset link to the user's email address."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        if not email:
            return Response({"detail": "Please enter your email address."}, status=400)

        form = PasswordResetForm(data={"email": email})
        if not form.is_valid():
            # Do not reveal whether an email belongs to an account.
            return Response({"detail": "If an account exists for this email, a reset link has been sent."})

        users = list(form.get_users(email))
        frontend_url = os.getenv("FRONTEND_URL", "https://ecommerce-nu-black-29.vercel.app").rstrip("/")

        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
            send_mail(
                subject="Reset your ShopCart password",
                message=(
                    f"Hi {user.first_name or user.username},\n\n"
                    "We received a request to reset your ShopCart password. "
                    "Use the link below to choose a new password:\n\n"
                    f"{reset_url}\n\n"
                    "This link is valid only once. If you did not request a password reset, "
                    "you can safely ignore this email.\n\n"
                    "ShopCart"
                ),
                from_email=os.getenv("DEFAULT_FROM_EMAIL", "webmaster@localhost"),
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response({"detail": "If an account exists for this email, a reset link has been sent."})


class ResetPasswordView(APIView):
    """Validate a reset token and set a new password."""

    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            from django.contrib.auth.models import User

            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise Http404("Invalid password reset link.")

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "This password reset link is invalid or has expired."}, status=400)

        form = SetPasswordForm(user=user, data={
            "new_password1": request.data.get("password", ""),
            "new_password2": request.data.get("confirm_password", ""),
        })
        if not form.is_valid():
            return Response({"detail": next(iter(form.errors.values()))[0]}, status=400)

        form.save()
        return Response({"detail": "Password reset successfully. You can now log in."})
