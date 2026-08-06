from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model.
    We inherit everything from Django's AbstractUser
    so we can extend it later without changing the authentication system.
    """
    pass