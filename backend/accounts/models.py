from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    SYSTEM_ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("USER", "User"),
    ]

    """
    Custom User model.

    We inherit everything from Django's AbstractUser
    so we can extend it later without changing the
    existing authentication system.
    """

    system_role = models.CharField(
        max_length=10,
        choices=SYSTEM_ROLE_CHOICES,
        default="USER",
    )