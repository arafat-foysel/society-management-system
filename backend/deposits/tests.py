from datetime import date
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from contributions.models import MonthlyContribution
from members.models import Member
from deposits.models import Deposit
from deposits.services import (
    get_applicable_contribution,
    get_due_payments_for_member,
)


class DepositServiceTests(TestCase):

    def setUp(self):
        # Historical contribution rates
        MonthlyContribution.objects.create(
            effective_from=date(2023, 7, 1),
            amount=Decimal("2500.00"),
        )

        MonthlyContribution.objects.create(
            effective_from=date(2026, 1, 1),
            amount=Decimal("3000.00"),
        )

        # Member joined later than the society start date.
        # This is intentional because joining_date must NOT
        # determine when monthly contributions become due.
        self.member = Member.objects.create(
            first_name="Test",
            last_name="Member",
            email="test-member@example.com",
            phone="0123456789",
            nid_number="TEST-NID-001",
            father_name="Test Father",
            mother_name="Test Mother",
            address="Test Address",
            joining_date=date(2025, 1, 1),
            entry_fee=Decimal("1000.00"),
            role="General Member",
            status="Active",
        )

    def test_applicable_contribution_uses_historical_rate(self):
        contribution_2023 = get_applicable_contribution(
            2023,
            7,
        )

        contribution_2025 = get_applicable_contribution(
            2025,
            12,
        )

        contribution_2026 = get_applicable_contribution(
            2026,
            1,
        )

        self.assertEqual(
            contribution_2023.amount,
            Decimal("2500.00"),
        )

        self.assertEqual(
            contribution_2025.amount,
            Decimal("2500.00"),
        )

        self.assertEqual(
            contribution_2026.amount,
            Decimal("3000.00"),
        )

    def test_approved_payment_removes_month_from_due_list(self):
        Deposit.objects.create(
            member=self.member,
            year=2026,
            month="January",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 1, 15),
            status="APPROVED",
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        january_due = [
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 1
        ]

        self.assertEqual(
            january_due,
            [],
        )

    def test_rejected_payment_does_not_count_as_paid(self):
        Deposit.objects.create(
            member=self.member,
            year=2026,
            month="January",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 1, 15),
            status="REJECTED",
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        january_due = next(
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 1
        )

        self.assertEqual(
            january_due["status"],
            "DUE",
        )

        self.assertEqual(
            january_due["paid_amount"],
            Decimal("0.00"),
        )

    def test_pending_payment_is_reported_as_pending(self):
        Deposit.objects.create(
            member=self.member,
            year=2026,
            month="January",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 1, 15),
            status="PENDING",
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        january_due = next(
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 1
        )

        self.assertEqual(
            january_due["status"],
            "PENDING",
        )

        self.assertEqual(
            january_due["pending_amount"],
            Decimal("3000.00"),
        )

    def test_partial_approved_payment_is_reported_as_partial(self):
        Deposit.objects.create(
            member=self.member,
            year=2026,
            month="January",
            amount=Decimal("1000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 1, 15),
            status="APPROVED",
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        january_due = next(
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 1
        )

        self.assertEqual(
            january_due["status"],
            "PARTIAL",
        )

        self.assertEqual(
            january_due["paid_amount"],
            Decimal("1000.00"),
        )

        self.assertEqual(
            january_due["remaining_amount"],
            Decimal("2000.00"),
        )

    def test_due_calculation_starts_from_july_2023_regardless_of_joining_date(self):
        due_payments = get_due_payments_for_member(
            self.member
        )

        july_2023 = next(
            payment
            for payment in due_payments
            if payment["year"] == 2023
            and payment["month"] == 7
        )

        self.assertEqual(
            july_2023["expected_amount"],
            Decimal("2500.00"),
        )

        self.assertEqual(
            july_2023["status"],
            "DUE",
        )

    def test_fine_and_extra_do_not_count_toward_contribution(self):
        Deposit.objects.create(
            member=self.member,
            year=2026,
            month="January",
            amount=Decimal("2500.00"),
            fine=Decimal("500.00"),
            extra=Decimal("500.00"),
            payment_date=date(2026, 1, 15),
            status="APPROVED",
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        january_due = next(
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 1
        )

        self.assertEqual(
            january_due["status"],
            "PARTIAL",
        )

        self.assertEqual(
            january_due["paid_amount"],
            Decimal("2500.00"),
        )

        self.assertEqual(
            january_due["remaining_amount"],
            Decimal("500.00"),
        )


class DepositApprovalAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="testadmin",
            password="Admin@123",
            email="admin@example.com",
            system_role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        self.user = User.objects.create_user(
            username="testuser",
            password="User@123",
            email="user@example.com",
            system_role="USER",
            is_staff=False,
            is_superuser=False,
        )

        self.member = Member.objects.create(
            user=self.user,
            first_name="Test",
            last_name="User",
            email="member@example.com",
            phone="0123456789",
            nid_number="API-TEST-NID-001",
            father_name="Test Father",
            mother_name="Test Mother",
            address="Test Address",
            joining_date=date(2025, 1, 1),
            entry_fee=Decimal("1000.00"),
            role="General Member",
            status="Active",
        )

        MonthlyContribution.objects.create(
            effective_from=date(2023, 7, 1),
            amount=Decimal("2500.00"),
        )

        MonthlyContribution.objects.create(
            effective_from=date(2026, 1, 1),
            amount=Decimal("3000.00"),
        )

    def get_deposit_payload(self):
        return {
            "member": self.member.id,
            "year": 2026,
            "month": "September",
            "amount": "3000.00",
            "fine": "0.00",
            "extra": "0.00",
            "payment_date": "2026-09-15",
            "remarks": "API test payment",
        }

    def test_user_submission_creates_pending_payment(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            "/api/deposits/",
            self.get_deposit_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        deposit = Deposit.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(
            deposit.member,
            self.member,
        )

        self.assertEqual(
            deposit.status,
            "PENDING",
        )

    def test_user_cannot_approve_payment(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {
                "status": "APPROVED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        deposit.refresh_from_db()

        self.assertEqual(
            deposit.status,
            "PENDING",
        )

    def test_user_cannot_delete_payment(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.delete(
            f"/api/deposits/{deposit.id}/"
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertTrue(
            Deposit.objects.filter(
                id=deposit.id
            ).exists()
        )

    def test_admin_can_approve_payment(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {
                "status": "APPROVED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        deposit.refresh_from_db()

        self.assertEqual(
            deposit.status,
            "APPROVED",
        )

    def test_admin_can_reject_payment(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {
                "status": "REJECTED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        deposit.refresh_from_db()

        self.assertEqual(
            deposit.status,
            "REJECTED",
        )

    def test_approved_payment_affects_due_calculation(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {
                "status": "APPROVED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        september_due = [
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 9
        ]

        self.assertEqual(
            september_due,
            [],
        )

    def test_rejected_payment_does_not_affect_due_calculation(self):
        deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {
                "status": "REJECTED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        due_payments = get_due_payments_for_member(
            self.member
        )

        september_due = next(
            payment
            for payment in due_payments
            if payment["year"] == 2026
            and payment["month"] == 9
        )

        self.assertEqual(
            september_due["status"],
            "DUE",
        )

        self.assertEqual(
            september_due["paid_amount"],
            Decimal("0.00"),
        )