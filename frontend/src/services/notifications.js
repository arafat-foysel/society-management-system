import { apiFetch } from "./api";


export async function getNotifications() {
    const response = await apiFetch(
        "/notifications/"
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load notifications."
        );
    }

    return response.json();
}


export async function markNotificationAsRead(
    notificationId
) {
    const response = await apiFetch(
        `/notifications/${notificationId}/`,
        {
            method: "PATCH",
            body: JSON.stringify({
                is_read: true,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to mark notification as read."
        );
    }

    return response.json();
}


export async function markAllNotificationsAsRead() {
    const response = await apiFetch(
        "/notifications/mark-all-read/",
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to mark all notifications as read."
        );
    }

    return response.json();
}