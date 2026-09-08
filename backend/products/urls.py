from django.urls import path
from .views import ProductView,ProductDetailView,ProductImageView,ProductImageDetailView,CategoryView

urlpatterns = [
    path('',ProductView.as_view()),
    path('info/<int:pk>/',ProductDetailView.as_view()),
    path('<int:pk>/image/',ProductImageView.as_view()),
    path('image/<int:id>/',ProductImageDetailView.as_view()),
    path('category/',CategoryView.as_view())

  
]
