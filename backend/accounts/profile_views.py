from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserSerializer


class ProfileView(APIView):
    """Read and update the authenticated customer's profile."""

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_profile_data(self, user):
        profile = UserProfile.objects.filter(user=user).first()
        data = UserSerializer(user).data
        data.pop("password", None)
        data["phone_number"] = profile.phone_number if profile else ""
        data["date_joined"] = user.date_joined
        return data

    def get(self, request):
        return Response(self.get_profile_data(request.user))

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # Never allow the profile endpoint to change a password accidentally.
        serializer.validated_data.pop("password", None)
        serializer.save()

        phone = str(request.data.get("phone_number", "")).strip()
        if phone:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if UserProfile.objects.exclude(user=user).filter(phone_number=phone).exists():
                return Response({"phone_number": ["This mobile number is already in use."]}, status=400)
            profile.phone_number = phone
            profile.save(update_fields=["phone_number"])

        return Response(self.get_profile_data(user))
