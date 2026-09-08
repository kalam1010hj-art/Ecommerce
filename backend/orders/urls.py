from django.urls import path
from .views import CartView,AddressView,AddressDetailsView

urlpatterns = [
    path("",CartView.as_view()),
    path("address",AddressView.as_view()),
    path("address/<int:pk>",AddressDetailsView.as_view())


]
