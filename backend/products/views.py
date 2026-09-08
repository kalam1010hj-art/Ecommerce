from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAdminUser,IsAuthenticated,IsAuthenticatedOrReadOnly
from .serializers import ProductSerializer,ProductImageSerializer,CategorySerializer
from .models import Product,ProductImage,Category
# Create your views here.

class ProductView(APIView):
    
    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]

    def get(self,request):
            products = Product.objects.all()
            category = request.query_params.get("category")
            search = request.query_params.get("search")
            min_price = request.query_params.get("min_price")
            max_price = request.query_params.get("max_price")

            ordering = request.query_params.get("ordering")

            allowed_orderings = [
                                    "price",
                                    "-price",
                                    "name",
                                    "-name",
                                    "created_at",
                                    "-created_at",
                                 ]
    
            if category:
                products = products.filter(category_id = category)
            if search:
                products = products.filter(name__icontains = search)
            if min_price:
                products = products.filter(price__gte = min_price)
            if max_price:
                products = products.filter(price__lte = max_price)

            if ordering in allowed_orderings:
                products = products.order_by(ordering)
            
            
            serializer = ProductSerializer(products, many=True)
    
            return Response(serializer.data)

    def post(self,request):

        serializer = ProductSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=201)
        return Response(serializer.errors, status=400)   
class ProductDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]
    def get(self, request, pk):
        try:
            product = Product.objects.get(id=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({"error":"got an error"},status=404)

    def put(self, request, pk):
       try:
        product = Product.objects.get(id=pk)

        serializer = ProductSerializer(
            product,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

       except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    def delete(self, request, pk):
     try:
        product = Product.objects.get(id=pk)
        product.delete()

        return Response(status=204)

     except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )
class ProductImageView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]
    def get(self,request,pk):
        images = ProductImage.objects.filter(product_id = pk)
        serializer = ProductImageSerializer(images,many = True)

        return Response(serializer.data)

    def post(self,request,pk):
        try:
            serializer = ProductImageSerializer(data = request.data)
            product = Product.objects.get(id = pk)
            if serializer.is_valid():
                serializer.save(product = product)
                return Response(serializer.data,status=201)
            return Response(serializer.errors,status=400)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=404
            )
class ProductImageDetailView(APIView):
    permission_classes = [IsAdminUser]
    def delete(self,request,pk):
        try:
           image = ProductImage.objects.get(id = pk)
           image.delete()
           return Response(status=204)
        except ProductImage.DoesNotExist:
             return Response(
                            {"error": "Product not found"},
                            status=404
                        )

class CategoryView(APIView):
    def get_permissions(self):
        if self.request.method =="GET":
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]

    def get(self,request):
        categorys = Category.objects.all()
        serializer = CategorySerializer(categorys,many = True)
        return Response(serializer.data)
    def post(self,request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=201)
        return Response(serializer.errors,status = 400)
class CategoryDetailsView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]
    def get(self,request,pk):
        try:
            category = Category.objects.get(id = pk)
            serializer = CategorySerializer(category)
            return Response(serializer.data)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"},status=404)
        
    def put(self,request,pk):
        try:
            category = Category.objects.get(id = pk)
            serializer = CategorySerializer(category,data =request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors,status=400)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"},
        status=404)

    def delete(self,request,pk):
        try:
            category = Category.objects.get(id = pk)
            category.delete()
            return Response(status=204)
        except Category.DoesNotExist:
            return Response({"error": "Category not found"},status=404)




