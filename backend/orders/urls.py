from django.urls import path
from .views import (
    CartView,
    AddressView,
    AddressDetailsView,
    CartItemDetailView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
)

urlpatterns = [
    path("", CartView.as_view()),
    path("address", AddressView.as_view()),
    path("address/<int:pk>", AddressDetailsView.as_view()),
    path("info/<int:pk>", CartItemDetailView.as_view()),
    path("payment/create/", CreateRazorpayOrderView.as_view()),
    path("payment/verify/", VerifyRazorpayPaymentView.as_view()),
]
