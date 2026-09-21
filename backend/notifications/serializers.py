from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "deposit",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "deposit",
            "notification_type",
            "title",
            "message",
            "created_at",
            "updated_at",
        ]