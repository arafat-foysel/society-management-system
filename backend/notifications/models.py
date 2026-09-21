from django.conf import settings
from django.db import models

from deposits.models import Deposit


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ("PAYMENT_SUBMITTED", "Payment Submitted"),
        ("PAYMENT_APPROVED", "Payment Approved"),
        ("PAYMENT_REJECTED", "Payment Rejected"),
        ("PAYMENT_REMINDER", "Payment Reminder"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    deposit = models.ForeignKey(
        Deposit,
        on_delete=models.SET_NULL,
        related_name="notifications",
        null=True,
        blank=True,
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
    )

    title = models.CharField(
        max_length=200,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"