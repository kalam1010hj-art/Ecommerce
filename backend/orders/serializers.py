from rest_framework import serializers
from .models import Cart,CartItem
from .models import Address
from products.serializers import ProductSerializer

class AddressSerializer(serializers.ModelSerializer):
   class Meta:
      model = Address
      fields = "__all__"
      read_only_fields = ["user"]

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity"]

class CartItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ["product", "quantity"]
        
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ["id", "items", "created_at", "updated_at"]