from rest_framework import serializers
from .models import Product,ProductImage,Category


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"
        read_only_fields = ["product"]
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(read_only = True,many =True)
    
    class Meta:
        model = Product
        fields = "__all__"

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        