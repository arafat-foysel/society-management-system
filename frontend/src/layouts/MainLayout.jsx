import { useEffect, useState } from "react";
import {
    useLocation,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../services/auth";


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

    if (
        pathname === "/members"
    ) {
        return "Members";
    }

    if (
        pathname.startsWith(
            "/members/"
        )
    ) {
        return "Member Details";
    }

    if (
        pathname === "/deposits"
    ) {
        return "Deposits";
    }

    if (
        pathname === "/contributions"
    ) {
        return "Contribution Rates";
    }

    if (
        pathname === "/login"
    ) {
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


function MainLayout({
    children,
}) {

    const location =
        useLocation();

    const [currentUser, setCurrentUser] =
        useState(null);


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


    return (

        <div className="app-layout">

            <Sidebar />


            <main className="main-content">

                {/* =================================================
                    TOP HEADER
                ================================================= */}

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

                    {/* =================================================
                        BREADCRUMB
                    ================================================= */}

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


                    {/* =================================================
                        USER AREA
                    ================================================= */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >

                        {/* NOTIFICATION */}

                        <button
                            type="button"
                            aria-label="Notifications"
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

                        </button>


                        {/* DIVIDER */}

                        <div
                            style={{
                                width: "1px",
                                height: "34px",
                                background:
                                    "#e2e8f0",
                            }}
                        />


                        {/* USER */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "11px",
                            }}
                        >

                            {/* AVATAR */}

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


                            {/* NAME + ROLE */}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
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


                            {/* DROPDOWN */}

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


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                {children}

            </main>

        </div>

    );
}


export default MainLayout;