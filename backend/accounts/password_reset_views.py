import os

import requests
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.http import Http404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class ForgotPasswordView(APIView):
    """Send a password-reset link using the Resend email API."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        if not email:
            return Response({"detail": "Please enter your email address."}, status=400)

        form = PasswordResetForm(data={"email": email})
        if not form.is_valid():
            return Response({"detail": "If an account exists for this email, a reset link has been sent."})

        users = list(form.get_users(email))
        frontend_url = os.getenv("FRONTEND_URL", "https://ecommerce-nu-black-29.vercel.app").rstrip("/")
        resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
        from_email = os.getenv("DEFAULT_FROM_EMAIL", "onboarding@resend.dev").strip()

        if not resend_api_key:
            return Response({"detail": "Email service is not configured. Please try again later."}, status=503)

        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
            text = (
                f"Hi {user.first_name or user.username},\n\n"
                "We received a request to reset your ShopCart password. "
                "Use the link below to choose a new password:\n\n"
                f"{reset_url}\n\n"
                "This link is valid only once. If you did not request a password reset, "
                "you can safely ignore this email.\n\n"
                "ShopCart"
            )
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#222">
              <h2>Reset your ShopCart password</h2>
              <p>Hi {user.first_name or user.username},</p>
              <p>We received a request to reset your ShopCart password.</p>
              <p><a href="{reset_url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
              <p>If the button does not work, copy this link:</p>
              <p style="word-break:break-all">{reset_url}</p>
              <p>This link is valid only once. If you did not request a password reset, you can safely ignore this email.</p>
              <p>ShopCart</p>
            </div>
            """

            try:
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": from_email,
                        "to": [user.email],
                        "subject": "Reset your ShopCart password",
                        "text": text,
                        "html": html,
                    },
                    timeout=15,
                )
                response.raise_for_status()
            except requests.RequestException:
                return Response({"detail": "Unable to send the reset email. Please try again later."}, status=503)

        return Response({"detail": "If an account exists for this email, a reset link has been sent."})


class ResetPasswordView(APIView):
    """Validate a reset token and set a new password."""

    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
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
