from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListAPIView(generics.ListAPIView):
    """
    Return notifications belonging to the
    currently authenticated user.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )


class NotificationRetrieveUpdateAPIView(
    generics.RetrieveUpdateAPIView
):
    """
    Retrieve or update a notification belonging
    to the currently authenticated user.

    Users can only update is_read.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )


class NotificationMarkAllReadAPIView(APIView):
    """
    Mark all unread notifications belonging to
    the currently authenticated user as read.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(
            is_read=True
        )

        return Response({
            "detail": "All notifications marked as read.",
            "updated_count": updated_count,
        })