from django.db import models


class Member(models.Model):
    ROLE_CHOICES = [
        ("President", "President"),
        ("Secretary", "Secretary"),
        ("Treasurer", "Treasurer"),
        ("Executive Member", "Executive Member"),
        ("General Member", "General Member"),
    ]

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20)
    nid_number = models.CharField(max_length=30, unique=True)

    father_name = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)

    address = models.TextField(blank=True)

    joining_date = models.DateField()
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"