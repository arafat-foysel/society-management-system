from django.contrib import admin
from .models import Deposit


@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "member",
        "year",
        "month",
        "amount",
        "payment_date",
    )

    list_filter = (
        "year",
        "month",
    )

    search_fields = (
        "member__first_name",
        "member__last_name",
        "member__phone",
    )