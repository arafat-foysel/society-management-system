from notifications.models import Notification


def create_payment_submitted_notification(deposit):
    """
    Create an in-app notification when a member
    submits a payment for admin approval.
    """
    if not deposit.member.user:
        return None

    return Notification.objects.create(
        user=deposit.member.user,
        deposit=deposit,
        notification_type="PAYMENT_SUBMITTED",
        title="Payment Submitted",
        message=(
            f"Your payment for "
            f"{deposit.month} {deposit.year} "
            f"has been submitted and is waiting for admin approval."
        ),
    )


def create_payment_approved_notification(deposit):
    """
    Create an in-app notification when an admin
    approves a payment.
    """
    if not deposit.member.user:
        return None

    return Notification.objects.create(
        user=deposit.member.user,
        deposit=deposit,
        notification_type="PAYMENT_APPROVED",
        title="Payment Approved",
        message=(
            f"Your payment for "
            f"{deposit.month} {deposit.year} "
            f"has been approved."
        ),
    )


def create_payment_rejected_notification(deposit):
    """
    Create an in-app notification when an admin
    rejects a payment.
    """
    if not deposit.member.user:
        return None

    return Notification.objects.create(
        user=deposit.member.user,
        deposit=deposit,
        notification_type="PAYMENT_REJECTED",
        title="Payment Rejected",
        message=(
            f"Your payment for "
            f"{deposit.month} {deposit.year} "
            f"has been rejected."
        ),
    )