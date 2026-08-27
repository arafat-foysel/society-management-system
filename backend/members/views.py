from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Member
from .serializers import MemberSerializer


class MemberListCreateAPIView(generics.ListCreateAPIView):

    queryset = Member.objects.all()

    serializer_class = MemberSerializer

    permission_classes = [IsAuthenticated]


class MemberRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Member.objects.all()

    serializer_class = MemberSerializer

    permission_classes = [IsAuthenticated]