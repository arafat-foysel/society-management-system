from django.urls import path

from .views import (
    DepositListCreateAPIView,
    DepositRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path(
        "deposits/",
        DepositListCreateAPIView.as_view(),
        name="deposit-list-create",
    ),

    path(
        "deposits/<int:pk>/",
        DepositRetrieveUpdateDestroyAPIView.as_view(),
        name="deposit-detail",
    ),
]