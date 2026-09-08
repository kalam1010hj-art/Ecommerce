from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CartItemSerializer,CartSerializer
from .models import CartItem,Cart

# Create your views here.

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
       try:
            cart,isCreated = Cart.objects.get_or_create(user = request.user)
            serializer = CartSerializer(cart)
            return Response(serializer.data)
       except Cart.DoesNotExist:
           return Response({"error":"No cart found"},status=404)
    def post(self,request):
        self.permission_classes = [IsAuthenticated]
        serializer  = CartItemSerializer(data =request.data)
        if serializer.is_valid():
            cart, Created = Cart.objects.get_or_create(user = request.user)
            product = serializer.validated_data["product"]
            quantity = serializer.validated_data["quantity"]
            cartItem ,created = CartItem.objects.get_or_create(
                product = product,
                cart = cart,
                defaults={
                    "quantity":quantity
                })
            if not created:
                cartItem.quantity += quantity
                cartItem.save()
            return Response(
            CartItemSerializer(cartItem).data,
            status=201
        )
        return Response(serializer.errors, status=400)
            

class CartItemDetailView(APIView):
    
    permission_classes = [IsAuthenticated]
    def put(self,request,pk):
        
        serializer = CartItemSerializer(data = request.data)
        if serializer.is_valid():

           
            quantity = serializer.validated_data["quantity"]

            try: 
                cartItem = CartItem.objects.get(id = pk,cart__user = request.user)

                cartItem.quantity = quantity
                cartItem.save()
            except CartItem.DoesNotExist:
                return Response(
                    {"error": "Cart item not found"},
                    status=404
                )

            return Response(CartItemSerializer(cartItem).data,)
        return Response(serializer.errors,status=400)
    def delete(self,request,pk):
      
        try:
            cartItem = CartItem.objects.get(cart__user = request.user,id = pk)
            cartItem.delete()
            return Response(status=204)
        except(CartItem.DoesNotExist):
            return Response({"error":"Not found"},status=404)
       

                    


        

        
