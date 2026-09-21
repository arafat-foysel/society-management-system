from datetime import date
from decimal import Decimal

from django.test import TestCase

from rest_framework.test import APIClient

from accounts.models import User
from deposits.models import Deposit
from members.models import Member
from notifications.models import Notification
from notifications.services import (
    create_payment_submitted_notification,
    create_payment_approved_notification,
    create_payment_rejected_notification,
)


class NotificationServiceTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="notificationuser",
            password="User@123",
            email="notification@example.com",
            system_role="USER",
        )

        self.member = Member.objects.create(
            user=self.user,
            first_name="Notification",
            last_name="User",
            email="notification-member@example.com",
            phone="0123456789",
            nid_number="NOTIFICATION-NID-001",
            father_name="Test Father",
            mother_name="Test Mother",
            address="Test Address",
            joining_date=date(2025, 1, 1),
            entry_fee=Decimal("1000.00"),
            role="General Member",
            status="Active",
        )

        self.deposit = Deposit.objects.create(
            member=self.member,
            year=2026,
            month="September",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 9, 15),
            status="PENDING",
        )

    def test_payment_submitted_notification_is_created(self):
        notification = create_payment_submitted_notification(
            self.deposit
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.deposit, self.deposit)
        self.assertEqual(
            notification.notification_type,
            "PAYMENT_SUBMITTED",
        )
        self.assertEqual(
            notification.title,
            "Payment Submitted",
        )
        self.assertIn(
            "September 2026",
            notification.message,
        )
        self.assertFalse(notification.is_read)

    def test_payment_approved_notification_is_created(self):
        notification = create_payment_approved_notification(
            self.deposit
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.deposit, self.deposit)
        self.assertEqual(
            notification.notification_type,
            "PAYMENT_APPROVED",
        )
        self.assertEqual(
            notification.title,
            "Payment Approved",
        )
        self.assertIn(
            "September 2026",
            notification.message,
        )
        self.assertFalse(notification.is_read)

    def test_payment_rejected_notification_is_created(self):
        notification = create_payment_rejected_notification(
            self.deposit
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.deposit, self.deposit)
        self.assertEqual(
            notification.notification_type,
            "PAYMENT_REJECTED",
        )
        self.assertEqual(
            notification.title,
            "Payment Rejected",
        )
        self.assertIn(
            "September 2026",
            notification.message,
        )
        self.assertFalse(notification.is_read)


class NotificationStatusTransitionTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="notificationadmin",
            password="Admin@123",
            email="admin-notification@example.com",
            system_role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        self.user = User.objects.create_user(
            username="notificationmember",
            password="User@123",
            email="member-notification@example.com",
            system_role="USER",
        )

        self.member = Member.objects.create(
            user=self.user,
            first_name="Notification",
            last_name="Member",
            email="member-notification@example.com",
            phone="0123456789",
            nid_number="NOTIFICATION-API-NID-001",
            father_name="Test Father",
            mother_name="Test Mother",
            address="Test Address",
            joining_date=date(2025, 1, 1),
            entry_fee=Decimal("1000.00"),
            role="General Member",
            status="Active",
        )

    def create_pending_deposit(self):
        return Deposit.objects.create(
            member=self.member,
            year=2026,
            month="October",
            amount=Decimal("3000.00"),
            fine=Decimal("0.00"),
            extra=Decimal("0.00"),
            payment_date=date(2026, 10, 15),
            status="PENDING",
        )

    def test_admin_approval_creates_notification(self):
        deposit = self.create_pending_deposit()

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {"status": "APPROVED"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        notification = Notification.objects.filter(
            deposit=deposit,
            notification_type="PAYMENT_APPROVED",
        ).first()

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)

    def test_admin_rejection_creates_notification(self):
        deposit = self.create_pending_deposit()

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {"status": "REJECTED"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        notification = Notification.objects.filter(
            deposit=deposit,
            notification_type="PAYMENT_REJECTED",
        ).first()

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)

    def test_edit_without_status_change_does_not_create_notification(
        self,
    ):
        deposit = self.create_pending_deposit()

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {"amount": "3500.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            Notification.objects.filter(
                deposit=deposit
            ).count(),
            0,
        )

    def test_repeated_approval_does_not_create_duplicate_notification(
        self,
    ):
        deposit = self.create_pending_deposit()

        self.client.force_authenticate(
            user=self.admin
        )

        first_response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {"status": "APPROVED"},
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            200,
        )

        second_response = self.client.patch(
            f"/api/deposits/{deposit.id}/",
            {"status": "APPROVED"},
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            200,
        )

        self.assertEqual(
            Notification.objects.filter(
                deposit=deposit,
                notification_type="PAYMENT_APPROVED",
            ).count(),
            1,
        )


class NotificationAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="apiuser",
            password="User@123",
            email="apiuser@example.com",
            system_role="USER",
        )

        self.other_user = User.objects.create_user(
            username="otherapiuser",
            password="User@123",
            email="otherapiuser@example.com",
            system_role="USER",
        )

        self.notification = Notification.objects.create(
            user=self.user,
            notification_type="PAYMENT_SUBMITTED",
            title="Payment Submitted",
            message="Your payment is waiting for approval.",
        )

        self.second_notification = Notification.objects.create(
            user=self.user,
            notification_type="PAYMENT_APPROVED",
            title="Payment Approved",
            message="Your payment has been approved.",
        )

        self.other_notification = Notification.objects.create(
            user=self.other_user,
            notification_type="PAYMENT_APPROVED",
            title="Payment Approved",
            message="Your payment has been approved.",
        )

    def test_user_can_list_own_notifications(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            "/api/notifications/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            2,
        )

        notification_ids = [
            item["id"]
            for item in response.data
        ]

        self.assertIn(
            self.notification.id,
            notification_ids,
        )

        self.assertIn(
            self.second_notification.id,
            notification_ids,
        )

    def test_user_cannot_see_other_users_notifications(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            "/api/notifications/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        notification_ids = [
            item["id"]
            for item in response.data
        ]

        self.assertNotIn(
            self.other_notification.id,
            notification_ids,
        )

    def test_user_can_mark_own_notification_as_read(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.patch(
            f"/api/notifications/{self.notification.id}/",
            {"is_read": True},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.notification.refresh_from_db()

        self.assertTrue(
            self.notification.is_read
        )

    def test_user_cannot_update_notification_message(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.patch(
            f"/api/notifications/{self.notification.id}/",
            {
                "message": "Changed by user",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.notification.refresh_from_db()

        self.assertEqual(
            self.notification.message,
            "Your payment is waiting for approval.",
        )

    def test_user_cannot_access_other_users_notification_detail(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            f"/api/notifications/{self.other_notification.id}/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_user_can_mark_all_own_notifications_as_read(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            "/api/notifications/mark-all-read/",
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["updated_count"],
            2,
        )

        self.notification.refresh_from_db()
        self.second_notification.refresh_from_db()
        self.other_notification.refresh_from_db()

        self.assertTrue(
            self.notification.is_read
        )

        self.assertTrue(
            self.second_notification.is_read
        )

        self.assertFalse(
            self.other_notification.is_read
        )

    def test_mark_all_read_when_no_unread_notifications(self):
        self.notification.is_read = True
        self.notification.save()

        self.second_notification.is_read = True
        self.second_notification.save()

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            "/api/notifications/mark-all-read/",
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["updated_count"],
            0,
        )