import os
import re
import secrets

import requests
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserSerializer, LoginSerializer


def resend_configured():
    return bool(os.getenv("RESEND_API_KEY") and os.getenv("DEFAULT_FROM_EMAIL"))


def normalize_email(email):
    email = str(email or "").strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise ValueError("Enter a valid email address.")
    return email


def otp_cache_key(email):
    return f"email_otp:{email}"


def send_email_otp(email):
    otp = f"{secrets.randbelow(1_000_000):06d}"
    cache.set(otp_cache_key(email), otp, timeout=300)

    payload = {
        "from": os.getenv("DEFAULT_FROM_EMAIL"),
        "to": [email],
        "subject": "Your ShopCart verification code",
        "html": f"""
        <div style=\"font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px\">
          <h2 style=\"margin-bottom:8px\">ShopCart Email Verification</h2>
          <p>Use the verification code below to continue:</p>
          <div style=\"font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0\">{otp}</div>
          <p>This code expires in <strong>5 minutes</strong>.</p>
          <p style=\"color:#666;font-size:13px\">If you did not request this code, you can safely ignore this email.</p>
        </div>
        """,
    }

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={
                "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
    except requests.RequestException:
        cache.delete(otp_cache_key(email))
        return False, "Could not contact the email provider."

    if not response.ok:
        cache.delete(otp_cache_key(email))
        try:
            detail = response.json().get("message", "Unable to send OTP email.")
        except ValueError:
            detail = "Unable to send OTP email."
        return False, detail

    return True, None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]
            user = authenticate(username=username, password=password)

            if user:
                token, _ = Token.objects.get_or_create(user=user)
                return Response({"user": UserSerializer(user).data, "token": token.key})

            return Response({"detail": "Invalid credentials."}, status=401)
        return Response(serializer.errors, status=400)


class SendEmailOTPView(APIView):
    """Generate and send a one-time password to an existing user's email."""

    permission_classes = [AllowAny]

    def post(self, request):
        if not resend_configured():
            return Response({"detail": "Email OTP is not configured on the server yet."}, status=503)

        try:
            email = normalize_email(request.data.get("email"))
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        if not User.objects.filter(email__iexact=email, is_active=True).exists():
            return Response({"detail": "No active account is registered with this email."}, status=404)

        success, detail = send_email_otp(email)
        if not success:
            return Response({"detail": detail}, status=502)

        return Response({"detail": "OTP sent successfully to your email."})


class VerifyEmailOTPView(APIView):
    """Verify an email OTP and issue an authentication token."""

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = normalize_email(request.data.get("email"))
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        code = str(request.data.get("otp", "")).strip()
        if not re.fullmatch(r"\d{6}", code):
            return Response({"detail": "Enter the 6-digit OTP sent to your email."}, status=400)

        stored_otp = cache.get(otp_cache_key(email))
        if not stored_otp or not secrets.compare_digest(str(stored_otp), code):
            return Response({"detail": "Invalid or expired OTP."}, status=401)

        cache.delete(otp_cache_key(email))
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user:
            return Response({"detail": "No active account is registered with this email."}, status=404)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})
