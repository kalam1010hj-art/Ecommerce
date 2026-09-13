from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Stores account data that does not belong on Django's built-in User model."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=20, unique=True, db_index=True)

    def __str__(self):
        return f"{self.user.username} - {self.phone_number}"
