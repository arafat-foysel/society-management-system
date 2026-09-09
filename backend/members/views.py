from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsSystemAdmin

from .models import Member
from .serializers import MemberSerializer


class MemberListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = MemberSerializer

    def get_queryset(self):
        user = self.request.user

        # =====================================================
        # ADMIN can see every member
        # =====================================================

        if (
            user.system_role == "ADMIN"
            or user.is_superuser
        ):
            return Member.objects.all()

        # =====================================================
        # USER can see only their own member record
        # =====================================================

        return Member.objects.filter(
            user=user
        )

    def get_permissions(self):

        # =====================================================
        # GET
        # Authenticated users can view their allowed members
        # =====================================================

        if self.request.method == "GET":
            return [
                IsAuthenticated()
            ]

        # =====================================================
        # POST
        # Only ADMIN can create members
        # =====================================================

        return [
            IsAuthenticated(),
            IsSystemAdmin(),
        ]


class MemberRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = MemberSerializer

    def get_queryset(self):
        user = self.request.user

        # =====================================================
        # ADMIN can access every member
        # =====================================================

        if (
            user.system_role == "ADMIN"
            or user.is_superuser
        ):
            return Member.objects.all()

        # =====================================================
        # USER can access only their own member record
        # =====================================================

        return Member.objects.filter(
            user=user
        )

    def get_permissions(self):

        # =====================================================
        # GET
        # USER can view their own member
        # =====================================================

        if self.request.method == "GET":
            return [
                IsAuthenticated()
            ]

        # =====================================================
        # PUT / PATCH / DELETE
        # Only ADMIN can modify members
        # =====================================================

        return [
            IsAuthenticated(),
            IsSystemAdmin(),
        ]