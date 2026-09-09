from django.db import models
from members.models import Member


class Deposit(models.Model):

    MONTH_CHOICES = [
        ("January", "January"),
        ("February", "February"),
        ("March", "March"),
        ("April", "April"),
        ("May", "May"),
        ("June", "June"),
        ("July", "July"),
        ("August", "August"),
        ("September", "September"),
        ("October", "October"),
        ("November", "November"),
        ("December", "December"),
    ]

    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="deposits"
    )

    year = models.PositiveIntegerField()

    month = models.CharField(
        max_length=20,
        choices=MONTH_CHOICES
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    fine = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    extra = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_date = models.DateField()

    remarks = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=10,
        choices=[
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
            ("REJECTED", "Rejected"),
        ],
        default="APPROVED",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-year", "month"]

    def __str__(self):
        return f"{self.member.first_name} - {self.month} {self.year}"