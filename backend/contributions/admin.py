from django.contrib import admin

from .models import MonthlyContribution


@admin.register(MonthlyContribution)
class MonthlyContributionAdmin(admin.ModelAdmin):

    list_display = (
        "effective_from",
        "amount",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-effective_from",
    )