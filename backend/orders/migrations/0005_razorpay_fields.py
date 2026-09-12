from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0004_cartitem_unique_product_per_cart"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="razorpay_order_id",
            field=models.CharField(
                blank=True,
                max_length=100,
                null=True,
                unique=True,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="razorpay_payment_id",
            field=models.CharField(
                blank=True,
                max_length=100,
                null=True,
                unique=True,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="razorpay_signature",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
