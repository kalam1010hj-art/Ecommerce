from decimal import Decimal, ROUND_HALF_UP
import os

import razorpay
from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CartItemCreateSerializer,
    AddressSerializer,
)
from .models import CartItem, Cart, Address, Order, OrderItem


def get_razorpay_client():
    """Create the Razorpay client using server-only environment variables."""
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
        return None

    return razorpay.Client(auth=(key_id, key_secret))


class AddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class AddressDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            address = Address.objects.get(user=request.user, pk=pk)
            address.delete()
            return Response(status=204)
        except Address.DoesNotExist:
            return Response(
                {"error": "Hey i think you are not authorized to delete this address"},
                status=400,
            )

    def put(self, request, pk):
        try:
            address = Address.objects.get(user=request.user, pk=pk)
            serializer = AddressSerializer(address, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Address.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


# ============== Cart section ==============

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        serializer = CartItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            cart, _ = Cart.objects.get_or_create(user=request.user)
            product = serializer.validated_data["product"]
            quantity = serializer.validated_data["quantity"]
            cart_item, created = CartItem.objects.get_or_create(
                product=product,
                cart=cart,
                defaults={"quantity": quantity},
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            return Response(CartItemSerializer(cart_item).data, status=201)

        return Response(serializer.errors, status=400)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            quantity = serializer.validated_data["quantity"]

            try:
                cart_item = CartItem.objects.get(
                    id=pk,
                    cart__user=request.user,
                )
                cart_item.quantity = quantity
                cart_item.save()
            except CartItem.DoesNotExist:
                return Response({"error": "Cart item not found"}, status=404)

            return Response(CartItemSerializer(cart_item).data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(
                cart__user=request.user,
                id=pk,
            )
            cart_item.delete()
            return Response(status=204)
        except CartItem.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


# ============== Razorpay payment section ==============

class CreateRazorpayOrderView(APIView):
    """Create a local order and its matching Razorpay order."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        client = get_razorpay_client()
        key_id = os.getenv("RAZORPAY_KEY_ID")

        if not client or not key_id:
            return Response(
                {"error": "Razorpay is not configured on the server."},
                status=503,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = list(cart.items.select_related("product"))

        if not cart_items:
            return Response({"error": "Your cart is empty."}, status=400)

        # Never trust the amount sent by the browser. Calculate it from the DB.
        total = Decimal("0.00")
        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response(
                    {
                        "error": (
                            f"Only {item.product.stock} unit(s) of "
                            f"{item.product.name} are available."
                        )
                    },
                    status=400,
                )
            total += item.product.price * item.quantity

        total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        amount_paise = int(total * 100)

        if amount_paise <= 0:
            return Response({"error": "Invalid order amount."}, status=400)

        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    total_amount=total,
                    status="pending",
                )

                # Snapshot product and price so future price changes do not
                # alter an already-created customer's order.
                OrderItem.objects.bulk_create(
                    [
                        OrderItem(
                            order=order,
                            product=item.product,
                            quantity=item.quantity,
                            price=item.product.price,
                        )
                        for item in cart_items
                    ]
                )

                razorpay_order = client.order.create(
                    {
                        "amount": amount_paise,
                        "currency": "INR",
                        "receipt": f"order_{order.id}",
                    }
                )

                order.razorpay_order_id = razorpay_order["id"]
                order.save(update_fields=["razorpay_order_id", "updated_at"])

        except Exception as exc:
            return Response(
                {"error": "Unable to create the payment order.", "details": str(exc)},
                status=502,
            )

        return Response(
            {
                "key_id": key_id,
                "order_id": razorpay_order["id"],
                "local_order_id": order.id,
                "amount": amount_paise,
                "currency": "INR",
                "name": "Ecommerce Store",
                "description": f"Order #{order.id}",
            },
            status=201,
        )


class VerifyRazorpayPaymentView(APIView):
    """Verify Razorpay's signature and finalize the local order."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        client = get_razorpay_client()
        if not client:
            return Response(
                {"error": "Razorpay is not configured on the server."},
                status=503,
            )

        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all(
            [razorpay_order_id, razorpay_payment_id, razorpay_signature]
        ):
            return Response(
                {"error": "Incomplete Razorpay payment response."},
                status=400,
            )

        try:
            order = Order.objects.get(
                user=request.user,
                razorpay_order_id=razorpay_order_id,
            )
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        # Idempotency: a repeated success callback should not create a second
        # fulfillment or clear a different cart.
        if order.status in ["paid", "processing", "shipped", "delivered"]:
            return Response(
                {
                    "success": True,
                    "order_id": order.id,
                    "status": order.status,
                }
            )

        try:
            # Razorpay recommends verifying against the order ID stored on the
            # server, not blindly trusting the browser's order ID.
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": order.razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )

            payment = client.payment.fetch(razorpay_payment_id)

            expected_amount = int(
                order.total_amount.quantize(Decimal("0.01")) * 100
            )

            if payment.get("order_id") != order.razorpay_order_id:
                return Response({"error": "Payment order mismatch."}, status=400)

            if int(payment.get("amount", 0)) != expected_amount:
                return Response({"error": "Payment amount mismatch."}, status=400)

            if payment.get("currency") != "INR":
                return Response({"error": "Payment currency mismatch."}, status=400)

            if payment.get("status") != "captured":
                return Response(
                    {
                        "error": (
                            "Payment has not been captured yet. "
                            "Please check the Razorpay payment status."
                        )
                    },
                    status=400,
                )

            with transaction.atomic():
                order = Order.objects.select_for_update().get(
                    pk=order.pk,
                    user=request.user,
                )

                if order.status != "pending":
                    return Response(
                        {
                            "success": True,
                            "order_id": order.id,
                            "status": order.status,
                        }
                    )

                # Lock products while checking/decreasing stock so two paid
                # orders cannot oversell the same inventory.
                order_items = list(
                    order.items.select_related("product").select_for_update()
                )

                for item in order_items:
                    if item.quantity > item.product.stock:
                        return Response(
                            {
                                "error": (
                                    f"Not enough stock for {item.product.name}. "
                                    "Contact the store before placing another order."
                                )
                            },
                            status=409,
                        )

                for item in order_items:
                    item.product.stock -= item.quantity
                    item.product.save(update_fields=["stock", "updated_at"])

                order.status = "paid"
                order.razorpay_payment_id = razorpay_payment_id
                order.razorpay_signature = razorpay_signature
                order.save(
                    update_fields=[
                        "status",
                        "razorpay_payment_id",
                        "razorpay_signature",
                        "updated_at",
                    ]
                )

                # Cart is cleared only after successful server-side payment
                # verification and inventory update.
                CartItem.objects.filter(cart__user=request.user).delete()

        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"error": "Payment verification failed."},
                status=400,
            )
        except Exception as exc:
            return Response(
                {"error": "Unable to verify payment.", "details": str(exc)},
                status=502,
            )

        return Response(
            {
                "success": True,
                "order_id": order.id,
                "status": order.status,
                "payment_id": order.razorpay_payment_id,
            }
        )
