import { useEffect, useState } from "react";

import {
    useLocation,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../services/auth";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notifications";


function HomeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
        </svg>
    );
}

function NotificationIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function getPageTitle(pathname) {
    if (
        pathname === "/" ||
        pathname === "/dashboard"
    ) {
        return "Dashboard";
    }

    if (pathname === "/members") {
        return "Members";
    }

    if (pathname.startsWith("/members/")) {
        return "Member Details";
    }

    if (pathname === "/deposits") {
        return "Deposits";
    }

    if (pathname === "/contributions") {
        return "Contribution Rates";
    }

    if (pathname === "/login") {
        return "Login";
    }

    return "Page";
}

function getInitials(user) {
    if (!user) {
        return "U";
    }

    const firstName =
        user.first_name?.trim() || "";

    const lastName =
        user.last_name?.trim() || "";

    if (
        firstName &&
        lastName
    ) {
        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();
    }

    if (firstName) {
        return firstName
            .substring(0, 2)
            .toUpperCase();
    }

    if (user.username) {
        return user.username
            .substring(0, 2)
            .toUpperCase();
    }

    return "U";
}

function formatNotificationTime(createdAt) {
    if (!createdAt) {
        return "";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString();
}

function MainLayout({
    children,
}) {
    const location = useLocation();

    const [currentUser, setCurrentUser] =
        useState(null);

    const [notifications, setNotifications] =
        useState([]);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [notificationLoading, setNotificationLoading] =
        useState(false);

    const [notificationError, setNotificationError] =
        useState("");

    const [markingAllRead, setMarkingAllRead] =
        useState(false);

    useEffect(() => {
        const loadCurrentUser =
            async () => {
                const accessToken =
                    localStorage.getItem(
                        "access_token"
                    );

                if (!accessToken) {
                    setCurrentUser(null);
                    return;
                }

                try {
                    const user =
                        await getCurrentUser();

                    setCurrentUser(user);
                } catch (error) {
                    console.error(
                        "Failed to load current user:",
                        error
                    );
                }
            };

        loadCurrentUser();
    }, [
        location.pathname,
    ]);

    useEffect(() => {
        const loadNotifications =
            async () => {
                const accessToken =
                    localStorage.getItem(
                        "access_token"
                    );

                if (!accessToken) {
                    setNotifications([]);
                    return;
                }

                try {
                    setNotificationLoading(true);
                    setNotificationError("");

                    const data =
                        await getNotifications();

                    setNotifications(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Failed to load notifications:",
                        error
                    );

                    setNotificationError(
                        "Failed to load notifications."
                    );
                } finally {
                    setNotificationLoading(false);
                }
            };

        loadNotifications();
    }, [
        location.pathname,
    ]);

    const handleNotificationClick =
        async (notification) => {
            if (notification.is_read) {
                return;
            }

            try {
                await markNotificationAsRead(
                    notification.id
                );

                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (item) =>
                                item.id ===
                                notification.id
                                    ? {
                                        ...item,
                                        is_read: true,
                                    }
                                    : item
                        )
                );
            } catch (error) {
                console.error(
                    "Failed to mark notification as read:",
                    error
                );
            }
        };

    const handleMarkAllNotificationsAsRead =
        async () => {
            if (unreadCount === 0) {
                return;
            }

            try {
                setMarkingAllRead(true);

                await markAllNotificationsAsRead();

                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (notification) => ({
                                ...notification,
                                is_read: true,
                            })
                        )
                );
            } catch (error) {
                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );
            } finally {
                setMarkingAllRead(false);
            }
        };

    const pageTitle =
        getPageTitle(
            location.pathname
        );

    const displayName =
        currentUser
            ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
              currentUser.username ||
              "User"
            : "User";

    const roleLabel =
        currentUser?.system_role ===
        "ADMIN"
            ? "Administrator"
            : "Member";

    const initials =
        getInitials(
            currentUser
        );

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <header
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: "72px",
                        marginTop: "-32px",
                        marginLeft: "-36px",
                        marginRight: "-36px",
                        marginBottom: "32px",
                        padding:
                            "0 30px 0 36px",
                        background:
                            "rgba(255, 255, 255, 0.96)",
                        borderBottom:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 1px 3px rgba(15, 23, 42, 0.04)",
                        backdropFilter:
                            "blur(10px)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            minWidth: 0,
                        }}
                    >
                        <span
                            style={{
                                width: "20px",
                                height: "20px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                            }}
                        >
                            <HomeIcon />
                        </span>

                        <span
                            style={{
                                color: "#cbd5e1",
                                fontSize: "20px",
                                fontWeight: "300",
                            }}
                        >
                            /
                        </span>

                        <span
                            style={{
                                color: "#334155",
                                fontSize: "14px",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {pageTitle}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Notifications"
                                onClick={() =>
                                    setShowNotifications(
                                        (current) =>
                                            !current
                                    )
                                }
                                style={{
                                    position: "relative",
                                    width: "40px",
                                    height: "40px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "0",
                                    background:
                                        "transparent",
                                    borderRadius: "8px",
                                    color: "#475569",
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        display: "inline-flex",
                                    }}
                                >
                                    <NotificationIcon />
                                </span>

                                {unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "3px",
                                            right: "3px",
                                            minWidth: "17px",
                                            height: "17px",
                                            padding:
                                                "0 4px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "999px",
                                            background:
                                                "#dc2626",
                                            color: "#ffffff",
                                            fontSize: "10px",
                                            fontWeight: "700",
                                            lineHeight: "1",
                                            border:
                                                "2px solid #ffffff",
                                        }}
                                    >
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "48px",
                                        right: 0,
                                        width: "360px",
                                        maxWidth:
                                            "calc(100vw - 32px)",
                                        background:
                                            "#ffffff",
                                        border:
                                            "1px solid #e2e8f0",
                                        borderRadius:
                                            "12px",
                                        boxShadow:
                                            "0 12px 30px rgba(15, 23, 42, 0.12)",
                                        overflow: "hidden",
                                        zIndex: 200,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent:
                                                "space-between",
                                            padding:
                                                "14px 16px",
                                            borderBottom:
                                                "1px solid #e2e8f0",
                                            gap: "12px",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#1e293b",
                                                fontSize:
                                                    "14px",
                                            }}
                                        >
                                            Notifications
                                        </strong>

                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleMarkAllNotificationsAsRead
                                                }
                                                disabled={
                                                    markingAllRead
                                                }
                                                style={{
                                                    border: "0",
                                                    background:
                                                        "transparent",
                                                    color:
                                                        markingAllRead
                                                            ? "#94a3b8"
                                                            : "#2563eb",
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        "600",
                                                    cursor:
                                                        markingAllRead
                                                            ? "default"
                                                            : "pointer",
                                                    padding: 0,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {markingAllRead
                                                    ? "Marking..."
                                                    : "Mark all as read"}
                                            </button>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            maxHeight:
                                                "380px",
                                            overflowY:
                                                "auto",
                                        }}
                                    >
                                        {notificationLoading && (
                                            <div
                                                style={{
                                                    padding:
                                                        "24px 16px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#64748b",
                                                    fontSize:
                                                        "13px",
                                                }}
                                            >
                                                Loading notifications...
                                            </div>
                                        )}

                                        {!notificationLoading &&
                                            notificationError && (
                                                <div
                                                    style={{
                                                        padding:
                                                            "24px 16px",
                                                        textAlign:
                                                            "center",
                                                        color:
                                                            "#dc2626",
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >
                                                    {
                                                        notificationError
                                                    }
                                                </div>
                                            )}

                                        {!notificationLoading &&
                                            !notificationError &&
                                            notifications.length ===
                                                0 && (
                                                <div
                                                    style={{
                                                        padding:
                                                            "28px 16px",
                                                        textAlign:
                                                            "center",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >
                                                    No notifications yet.
                                                </div>
                                            )}

                                        {!notificationLoading &&
                                            !notificationError &&
                                            notifications.map(
                                                (
                                                    notification
                                                ) => (
                                                    <button
                                                        key={
                                                            notification.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }
                                                        style={{
                                                            width: "100%",
                                                            display:
                                                                "block",
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "14px 16px",
                                                            border:
                                                                "0",
                                                            borderBottom:
                                                                "1px solid #f1f5f9",
                                                            background:
                                                                notification.is_read
                                                                    ? "#ffffff"
                                                                    : "#f8fafc",
                                                            cursor:
                                                                notification.is_read
                                                                    ? "default"
                                                                    : "pointer",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "flex-start",
                                                                justifyContent:
                                                                    "space-between",
                                                                gap:
                                                                    "10px",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color:
                                                                        "#1e293b",
                                                                    fontSize:
                                                                        "13px",
                                                                    fontWeight:
                                                                        notification.is_read
                                                                            ? "600"
                                                                            : "700",
                                                                }}
                                                            >
                                                                {
                                                                    notification.title
                                                                }
                                                            </span>

                                                            {!notification.is_read && (
                                                                <span
                                                                    style={{
                                                                        width:
                                                                            "7px",
                                                                        height:
                                                                            "7px",
                                                                        flexShrink:
                                                                            0,
                                                                        marginTop:
                                                                            "5px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        background:
                                                                            "#2563eb",
                                                                    }}
                                                                />
                                                            )}
                                                        </div>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    "6px 0 0",
                                                                color:
                                                                    "#64748b",
                                                                fontSize:
                                                                    "12px",
                                                                lineHeight:
                                                                    "18px",
                                                            }}
                                                        >
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "7px",
                                                                color:
                                                                    "#94a3b8",
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        >
                                                            {formatNotificationTime(
                                                                notification.created_at
                                                            )}
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                width: "1px",
                                height: "34px",
                                background:
                                    "#e2e8f0",
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "11px",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "50%",
                                    background:
                                        "#e8eef8",
                                    color:
                                        "#334e78",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                }}
                            >
                                {initials}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: "2px",
                                    minWidth: 0,
                                }}
                            >
                                <span
                                    style={{
                                        color:
                                            "#1e293b",
                                        fontSize:
                                            "14px",
                                        fontWeight:
                                            "700",
                                        lineHeight:
                                            "18px",
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {displayName}
                                </span>

                                <span
                                    style={{
                                        color:
                                            "#64748b",
                                        fontSize:
                                            "12px",
                                        lineHeight:
                                            "15px",
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {roleLabel}
                                </span>
                            </div>

                            <button
                                type="button"
                                aria-label="User menu"
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "0",
                                    background:
                                        "transparent",
                                    color:
                                        "#64748b",
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                <span
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        display:
                                            "inline-flex",
                                    }}
                                >
                                    <ChevronDownIcon />
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

export default MainLayout;