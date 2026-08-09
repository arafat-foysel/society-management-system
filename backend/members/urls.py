from django.urls import path

from .views import (
    MemberListCreateAPIView,
    MemberRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path(
        "members/",
        MemberListCreateAPIView.as_view(),
        name="member-list-create",
    ),

    path(
        "members/<int:pk>/",
        MemberRetrieveUpdateDestroyAPIView.as_view(),
        name="member-detail",
    ),
]