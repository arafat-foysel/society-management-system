from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsSystemAdmin

from .models import MonthlyContribution
from .serializers import MonthlyContributionSerializer


class MonthlyContributionListCreateAPIView(
    generics.ListCreateAPIView
):

    queryset = MonthlyContribution.objects.all()

    serializer_class = MonthlyContributionSerializer

    def get_permissions(self):

        if self.request.method == "POST":

            return [
                IsAuthenticated(),
                IsSystemAdmin(),
            ]

        return [
            IsAuthenticated()
        ]


class MonthlyContributionRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = MonthlyContribution.objects.all()

    serializer_class = MonthlyContributionSerializer

    def get_permissions(self):

        if self.request.method in [
            "PUT",
            "PATCH",
            "DELETE",
        ]:

            return [
                IsAuthenticated(),
                IsSystemAdmin(),
            ]

        return [
            IsAuthenticated()
        ]