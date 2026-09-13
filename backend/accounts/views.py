import os
import re
import secrets
import string

import requests
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserSerializer, LoginSerializer


def normalize_phone(phone):
    """Return a simple E.164-style phone number, e.g. +919876543210."""
    phone = str(phone or "").strip().replace(" ", "").replace("-", "")
    if phone.startswith("00"):
        phone = "+" + phone[2:]
    if not phone.startswith("+"):
        phone = "+91" + phone
    if not re.fullmatch(r"\+[1-9]\d{7,14}", phone):
        raise ValueError("Enter a valid mobile number with country code.")
    return phone


def twilio_configured():
    return all(
        os.getenv(key)
        for key in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID")
    )


def twilio_url(path):
    return f"https://verify.twilio.com/v2/Services/{os.getenv('TWILIO_VERIFY_SERVICE_SID')}/{path}"


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


class SendMobileOTPView(APIView):
    """Send a one-time password using Twilio Verify."""

    permission_classes = [AllowAny]

    def post(self, request):
        if not twilio_configured():
            return Response({"detail": "Mobile OTP is not configured on the server yet."}, status=503)

        try:
            phone = normalize_phone(request.data.get("phone"))
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        try:
            response = requests.post(
                twilio_url("Verifications"),
                data={"To": phone, "Channel": "sms"},
                auth=(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN")),
                timeout=10,
            )
        except requests.RequestException:
            return Response({"detail": "Could not contact the SMS provider."}, status=502)

        if not response.ok:
            try:
                detail = response.json().get("message", "Unable to send OTP.")
            except ValueError:
                detail = "Unable to send OTP."
            return Response({"detail": detail}, status=400)

        return Response({"detail": "OTP sent successfully."})


class VerifyMobileOTPView(APIView):
    """Verify the OTP, create the account when necessary, and issue an auth token."""

    permission_classes = [AllowAny]

    def post(self, request):
        if not twilio_configured():
            return Response({"detail": "Mobile OTP is not configured on the server yet."}, status=503)

        try:
            phone = normalize_phone(request.data.get("phone"))
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        code = str(request.data.get("otp", "")).strip()
        if not re.fullmatch(r"\d{4,10}", code):
            return Response({"detail": "Enter the OTP sent to your mobile."}, status=400)

        try:
            response = requests.post(
                twilio_url("VerificationCheck"),
                data={"To": phone, "Code": code},
                auth=(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN")),
                timeout=10,
            )
        except requests.RequestException:
            return Response({"detail": "Could not contact the SMS provider."}, status=502)

        if not response.ok:
            try:
                detail = response.json().get("message", "OTP verification failed.")
            except ValueError:
                detail = "OTP verification failed."
            return Response({"detail": detail}, status=400)

        try:
            verification_status = response.json().get("status")
        except ValueError:
            verification_status = None

        if verification_status != "approved":
            return Response({"detail": "Invalid or expired OTP."}, status=401)

        profile = UserProfile.objects.select_related("user").filter(phone_number=phone).first()
        if profile:
            user = profile.user
        else:
            # New mobile users receive a normal Django account without a password login requirement.
            suffix = phone.replace("+", "")
            username = f"mobile_{suffix}"
            if User.objects.filter(username=username).exists():
                username = f"{username}_{secrets.token_hex(3)}"

            password = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
            user = User.objects.create_user(username=username, password=password)
            UserProfile.objects.create(user=user, phone_number=phone)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})
