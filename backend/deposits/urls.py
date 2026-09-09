from django.urls import path

from .views import (
    DepositListCreateAPIView,
    DepositRetrieveUpdateDestroyAPIView,
    DepositSummaryAPIView,
    DepositDuePaymentsAPIView,
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
    path(
        "deposits/summary/",
        DepositSummaryAPIView.as_view(),
        name="deposit-summary",
    ),
    path(
        "deposits/due/",
        DepositDuePaymentsAPIView.as_view(),
        name="deposit-due-payments",
    ),
]