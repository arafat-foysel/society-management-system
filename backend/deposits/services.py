from datetime import date
from decimal import Decimal

from django.utils import timezone

from contributions.models import MonthlyContribution
from deposits.models import Deposit


SOCIETY_START_DATE = date(2023, 7, 1)


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

    # ---------------------------------------------------------
    # Load all historical contribution rates
    # ---------------------------------------------------------

    contributions = list(
        MonthlyContribution.objects.order_by("effective_from")
    )

    if not contributions:
        return []

    # ---------------------------------------------------------
    # Load member deposits
    # ---------------------------------------------------------

    deposits = Deposit.objects.filter(
        member=member,
    ).exclude(
        status="REJECTED",
    )

    approved_totals = {}
    pending_totals = {}

    # Convert month names to month numbers.
    month_number_map = {
        name: number
        for number, name in enumerate(
            [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
            start=1,
        )
    }

    for deposit in deposits:
        month_number = month_number_map.get(deposit.month)

        if month_number is None:
            continue

        key = (
            deposit.year,
            month_number,
        )

        # Only the actual contribution amount counts
        # toward the monthly contribution.
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

    # ---------------------------------------------------------
    # Calculate due payments
    # ---------------------------------------------------------

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

        # -----------------------------------------------------
        # Find the latest contribution rate that was already
        # effective for this month.
        # -----------------------------------------------------

        applicable_contribution = None

        for contribution in contributions:
            if contribution.effective_from <= month_start:
                applicable_contribution = contribution
            else:
                break

        if applicable_contribution:
            expected_amount = applicable_contribution.amount

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

            # Only unpaid/partially paid/pending months
            # are returned.
            if status != "PAID":
                due_payments.append(
                    {
                        "year": year,
                        "month": month,
                        "month_name": month_start.strftime("%B"),
                        "expected_amount": expected_amount,
                        "paid_amount": approved_amount,
                        "pending_amount": pending_amount,
                        "remaining_amount": remaining_amount,
                        "status": status,
                    }
                )

        # -----------------------------------------------------
        # Move to next month
        # -----------------------------------------------------

        month += 1

        if month > 12:
            month = 1
            year += 1

    return due_payments