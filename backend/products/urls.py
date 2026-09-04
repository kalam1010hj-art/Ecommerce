from django.urls import path
from .views import ProductView,ProductDetailView,ProductImageView,ProductImageDetailView

urlpatterns = [
    path('',ProductView.as_view()),
    path('info/<int:pk>/',ProductDetailView.as_view()),
    path('<int:pk>/image/',ProductImageView.as_view()),
    path('image/<int:id>/',ProductImageDetailView.as_view())
  
]
