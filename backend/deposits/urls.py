from django.urls import path

from .views import (
    DepositListCreateAPIView,
    DepositRetrieveUpdateDestroyAPIView,
    DepositSummaryAPIView,
    DepositDuePaymentsAPIView,
    DepositMonthlyPaymentOverviewAPIView,
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

    path(
        "deposits/monthly-overview/",
        DepositMonthlyPaymentOverviewAPIView.as_view(),
        name="deposit-monthly-payment-overview",
    ),

]