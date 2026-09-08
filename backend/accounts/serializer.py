from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self,Validated_data):
        user = User.objects.create_user(**Validated_data)
        return user
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length =200)
    password = serializers.CharField(max_length =200)
