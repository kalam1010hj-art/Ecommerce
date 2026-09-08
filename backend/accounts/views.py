from rest_framework.response import Response
from rest_framework.views import APIView
from .serializer import UserSerializer,LoginSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
# Create your views here.

class RegisterView(APIView):
    permission_classes =[AllowAny]
    def post(self,request):
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=201)
        return Response(serializer.errors,status=401)
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = LoginSerializer(data = request.data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]
            user = authenticate(username= username,password = password)

            if user:
                loginSerializer = UserSerializer(user)
                token ,isCreated = Token.objects.get_or_create(user =user)

                return Response({
                    "user":loginSerializer.data,
                    "token":token.key
                    })
                
  
                
            return Response({"status":"Not logined or invalid cerdentials"})
        return Response(serializer.errors,status=401)
