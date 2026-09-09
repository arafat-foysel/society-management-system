from datetime import date
from decimal import Decimal

from django.utils import timezone

from contributions.models import MonthlyContribution
from deposits.models import Deposit
from members.models import Member


SOCIETY_START_DATE = date(2023, 7, 1)


MONTH_NUMBER_MAP = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}


def get_applicable_contribution(year, month):
    """
    Return the contribution rate applicable to a specific month.

    The latest contribution rate whose effective_from date is
    on or before the first day of the selected month is used.
    """

    month_start = date(year, month, 1)

    return (
        MonthlyContribution.objects
        .filter(effective_from__lte=month_start)
        .order_by("-effective_from")
        .first()
    )


def get_due_payments_for_member(member):
    """
    Calculate monthly payment status for a member.

    Rules:
    - Every member owes contributions starting from July 2023.
    - Member joining_date does not affect the due start date.
    - End at the current month.
    - For each month, use the latest contribution rate that was
      effective on or before that month.
    - APPROVED deposit amounts count as paid.
    - PENDING deposit amounts are shown as pending.
    - REJECTED deposits do not count.
    - Fine and extra do not count toward the monthly contribution.
    - Partial approved payments are reported as PARTIAL.
    - Fully paid months are not returned.
    """

    today = timezone.localdate()

    start_year = SOCIETY_START_DATE.year
    start_month = SOCIETY_START_DATE.month

    current_year = today.year
    current_month = today.month

    contributions = list(
        MonthlyContribution.objects.order_by("effective_from")
    )

    if not contributions:
        return []

    deposits = Deposit.objects.filter(
        member=member,
    ).exclude(
        status="REJECTED",
    )

    approved_totals = {}
    pending_totals = {}

    for deposit in deposits:

        month_number = MONTH_NUMBER_MAP.get(
            deposit.month
        )

        if month_number is None:
            continue

        key = (
            deposit.year,
            month_number,
        )

        deposit_amount = (
            deposit.amount or Decimal("0.00")
        )

        if deposit.status == "APPROVED":

            approved_totals[key] = (
                approved_totals.get(
                    key,
                    Decimal("0.00"),
                )
                + deposit_amount
            )

        elif deposit.status == "PENDING":

            pending_totals[key] = (
                pending_totals.get(
                    key,
                    Decimal("0.00"),
                )
                + deposit_amount
            )

    due_payments = []

    year = start_year
    month = start_month

    while (
        year < current_year
        or (
            year == current_year
            and month <= current_month
        )
    ):

        month_start = date(
            year,
            month,
            1,
        )

        applicable_contribution = None

        for contribution in contributions:

            if contribution.effective_from <= month_start:
                applicable_contribution = contribution
            else:
                break

        if applicable_contribution:

            expected_amount = (
                applicable_contribution.amount
            )

            approved_amount = approved_totals.get(
                (year, month),
                Decimal("0.00"),
            )

            pending_amount = pending_totals.get(
                (year, month),
                Decimal("0.00"),
            )

            remaining_amount = max(
                expected_amount - approved_amount,
                Decimal("0.00"),
            )

            if approved_amount >= expected_amount:

                status = "PAID"

            elif pending_amount > 0:

                status = "PENDING"

            elif approved_amount > 0:

                status = "PARTIAL"

            else:

                status = "DUE"

            if status != "PAID":

                due_payments.append(
                    {
                        "year": year,
                        "month": month,
                        "month_name": month_start.strftime(
                            "%B"
                        ),
                        "expected_amount": expected_amount,
                        "paid_amount": approved_amount,
                        "pending_amount": pending_amount,
                        "remaining_amount": remaining_amount,
                        "status": status,
                    }
                )

        month += 1

        if month > 12:
            month = 1
            year += 1

    return due_payments


def get_monthly_payment_overview(year, month):
    """
    Return the payment status for every society member
    for one selected year and month.

    Statuses:
    - PAID
    - PENDING
    - PARTIAL
    - DUE

    Every member is included, even when they have no deposit.
    """

    contribution = get_applicable_contribution(
        year,
        month,
    )

    if not contribution:

        return {
            "year": year,
            "month": month,
            "month_name": date(
                year,
                month,
                1,
            ).strftime("%B"),
            "expected_amount": None,
            "summary": {
                "total_members": 0,
                "paid": 0,
                "pending": 0,
                "partial": 0,
                "due": 0,
            },
            "members": [],
        }

    expected_amount = contribution.amount

    overview = []

    summary = {
        "total_members": 0,
        "paid": 0,
        "pending": 0,
        "partial": 0,
        "due": 0,
    }

    members = Member.objects.all().order_by(
        "first_name",
        "last_name",
    )

    for member in members:

        deposits = Deposit.objects.filter(
            member=member,
            year=year,
            month=date(
                year,
                month,
                1,
            ).strftime("%B"),
        ).exclude(
            status="REJECTED",
        )

        approved_amount = sum(
            (
                deposit.amount or Decimal("0.00")
                for deposit in deposits
                if deposit.status == "APPROVED"
            ),
            Decimal("0.00"),
        )

        pending_amount = sum(
            (
                deposit.amount or Decimal("0.00")
                for deposit in deposits
                if deposit.status == "PENDING"
            ),
            Decimal("0.00"),
        )

        remaining_amount = max(
            expected_amount - approved_amount,
            Decimal("0.00"),
        )

        if approved_amount >= expected_amount:

            status = "PAID"

        elif pending_amount > 0:

            status = "PENDING"

        elif approved_amount > 0:

            status = "PARTIAL"

        else:

            status = "DUE"

        summary["total_members"] += 1
        summary[status.lower()] += 1

        overview.append(
            {
                "member_id": member.id,
                "member_name": str(member),
                "expected_amount": expected_amount,
                "paid_amount": approved_amount,
                "pending_amount": pending_amount,
                "remaining_amount": remaining_amount,
                "status": status,
            }
        )

    return {
        "year": year,
        "month": month,
        "month_name": date(
            year,
            month,
            1,
        ).strftime("%B"),
        "expected_amount": expected_amount,
        "summary": summary,
        "members": overview,
    }