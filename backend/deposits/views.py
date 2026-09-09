from rest_framework import generics

from rest_framework.response import Response

from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import PermissionDenied

from django.db.models import Sum

from accounts.permissions import IsSystemAdmin

from members.models import Member

from .models import Deposit

from .serializers import DepositSerializer

from .services import (
    get_due_payments_for_member,
    get_monthly_payment_overview,
)


class DepositListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = DepositSerializer

    def get_queryset(self):

        user = self.request.user

        if (
            user.system_role == "ADMIN"
            or user.is_superuser
        ):
            return Deposit.objects.all()

        return Deposit.objects.filter(
            member__user=user
        )

    def get_permissions(self):

        return [IsAuthenticated()]

    def perform_create(self, serializer):

        user = self.request.user

        if (
            user.system_role == "ADMIN"
            or user.is_superuser
        ):

            serializer.save(
                status="APPROVED"
            )

            return

        member_id = self.request.data.get(
            "member"
        )

        member = Member.objects.filter(
            id=member_id,
            user=user
        ).first()

        if not member:

            raise PermissionDenied(
                "You can only submit payments for your own member account."
            )

        serializer.save(
            member=member,
            status="PENDING"
        )


class DepositRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = DepositSerializer

    def get_queryset(self):

        user = self.request.user

        if (
            user.system_role == "ADMIN"
            or user.is_superuser
        ):

            return Deposit.objects.all()

        return Deposit.objects.filter(
            member__user=user
        )

    def get_permissions(self):

        if self.request.method == "GET":

            return [IsAuthenticated()]

        return [
            IsAuthenticated(),
            IsSystemAdmin(),
        ]


class DepositSummaryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        system_totals = Deposit.objects.filter(
            status="APPROVED"
        ).aggregate(
            amount=Sum("amount"),
            fine=Sum("fine"),
            extra=Sum("extra"),
        )

        system_grand_total = (
            (system_totals["amount"] or 0)
            + (system_totals["fine"] or 0)
            + (system_totals["extra"] or 0)
        )

        my_deposits = Deposit.objects.filter(
            member__user=user
        ).exclude(
            status="REJECTED"
        )

        my_totals = my_deposits.aggregate(
            amount=Sum("amount"),
            fine=Sum("fine"),
            extra=Sum("extra"),
        )

        my_total_submitted = (
            (my_totals["amount"] or 0)
            + (my_totals["fine"] or 0)
            + (my_totals["extra"] or 0)
        )

        my_approved = Deposit.objects.filter(
            member__user=user,
            status="APPROVED"
        ).aggregate(
            amount=Sum("amount"),
            fine=Sum("fine"),
            extra=Sum("extra"),
        )

        my_approved_total = (
            (my_approved["amount"] or 0)
            + (my_approved["fine"] or 0)
            + (my_approved["extra"] or 0)
        )

        my_pending = Deposit.objects.filter(
            member__user=user,
            status="PENDING"
        )

        return Response({

            "system_grand_total": system_grand_total,

            "my_total_submitted": my_total_submitted,

            "my_approved_total": my_approved_total,

            "my_pending_count": my_pending.count(),

        })


class DepositDuePaymentsAPIView(APIView):

    """
    Return due and pending monthly payments
    for the currently authenticated member.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        member = Member.objects.filter(
            user=user
        ).first()

        if not member:

            return Response({

                "member": None,

                "due_count": 0,

                "due_payments": [],

            })

        due_payments = get_due_payments_for_member(
            member
        )

        return Response({

            "member": member.id,

            "member_name": str(member),

            "due_count": sum(
                1
                for payment in due_payments
                if payment["status"] == "DUE"
            ),

            "due_payments": due_payments,

        })


class DepositMonthlyPaymentOverviewAPIView(APIView):

    """
    Return the payment status of every member
    for a selected year and month.

    Admin access only.
    """

    permission_classes = [
        IsAuthenticated,
        IsSystemAdmin,
    ]

    def get(self, request):

        year = request.query_params.get("year")
        month = request.query_params.get("month")

        if not year or not month:

            return Response(
                {
                    "detail": (
                        "Both year and month are required."
                    )
                },
                status=400,
            )

        try:

            year = int(year)
            month = int(month)

        except ValueError:

            return Response(
                {
                    "detail": (
                        "Year and month must be numbers."
                    )
                },
                status=400,
            )

        if month < 1 or month > 12:

            return Response(
                {
                    "detail": (
                        "Month must be between 1 and 12."
                    )
                },
                status=400,
            )

        if year < 2023:

            return Response(
                {
                    "detail": (
                        "Year must be 2023 or later."
                    )
                },
                status=400,
            )

        overview = get_monthly_payment_overview(
            year,
            month,
        )

        return Response(overview)