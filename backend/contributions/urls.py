from django.urls import path

from .views import (
    MonthlyContributionListCreateAPIView,
    MonthlyContributionRetrieveUpdateDestroyAPIView,
)


urlpatterns = [
    path(
        "contributions/",
        MonthlyContributionListCreateAPIView.as_view(),
        name="contribution-list-create",
    ),
    path(
        "contributions/<int:pk>/",
        MonthlyContributionRetrieveUpdateDestroyAPIView.as_view(),
        name="contribution-detail",
    ),
]
