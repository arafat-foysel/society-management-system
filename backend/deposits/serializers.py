from rest_framework import serializers

from .models import Deposit


class DepositSerializer(serializers.ModelSerializer):

    member_name = serializers.CharField(
        source="member.__str__",
        read_only=True,
    )

    class Meta:
        model = Deposit
        fields = "__all__"
        read_only_fields = [
            "created_at",
            "updated_at",
        ]