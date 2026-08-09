from rest_framework import generics

from .models import Deposit
from .serializers import DepositSerializer


class DepositListCreateAPIView(generics.ListCreateAPIView):
    queryset = Deposit.objects.all()
    serializer_class = DepositSerializer


class DepositRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Deposit.objects.all()
    serializer_class = DepositSerializer