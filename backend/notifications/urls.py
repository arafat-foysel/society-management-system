from django.urls import path

from .views import (
    NotificationListAPIView,
    NotificationRetrieveUpdateAPIView,
    NotificationMarkAllReadAPIView,
)


urlpatterns = [
    path(
        "notifications/",
        NotificationListAPIView.as_view(),
        name="notification-list",
    ),

    path(
        "notifications/mark-all-read/",
        NotificationMarkAllReadAPIView.as_view(),
        name="notification-mark-all-read",
    ),

    path(
        "notifications/<int:pk>/",
        NotificationRetrieveUpdateAPIView.as_view(),
        name="notification-detail",
    ),
]