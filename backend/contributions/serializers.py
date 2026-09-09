from rest_framework import serializers

from .models import MonthlyContribution


class MonthlyContributionSerializer(serializers.ModelSerializer):

    class Meta:
        model = MonthlyContribution

        fields = [
            "id",
            "effective_from",
            "amount",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]