import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { getCurrentUser } from "../services/auth";


function DashboardIcon() {

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


function MembersIcon() {

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

            <circle
                cx="12"
                cy="8"
                r="3"
            />

            <path d="M5 21c0-3.5 3.1-6 7-6s7 2.5 7 6" />

        </svg>

    );

}


function DepositsIcon() {

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

            <circle
                cx="12"
                cy="12"
                r="9"
            />

            <path d="M14.5 8.5c-.7-.6-1.6-.9-2.6-.9-1.5 0-2.5.8-2.5 1.9 0 1.2 1.1 1.7 2.7 2.1 1.6.4 2.8.9 2.8 2.2 0 1.2-1.1 2-2.7 2-1.1 0-2.1-.4-2.8-1" />

            <path d="M12 6.5v11" />

        </svg>

    );

}


function ContributionIcon() {

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

            <path d="M4 19h16" />

            <path d="M6 16V8" />

            <path d="M10 16V5" />

            <path d="M14 16v-6" />

            <path d="M18 16V7" />

        </svg>

    );

}


function LogoutIcon() {

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

            <path d="M10 4H5v16h5" />

            <path d="M14 8l4 4-4 4" />

            <path d="M18 12H9" />

        </svg>

    );

}


function Sidebar() {

    const navigate = useNavigate();

    const [currentUser, setCurrentUser] =
        useState(null);

    const [loadingUser, setLoadingUser] =
        useState(true);


    // =========================================================
    // LOAD CURRENT USER
    // =========================================================

    useEffect(() => {

        const loadCurrentUser = async () => {

            try {

                const user =
                    await getCurrentUser();

                setCurrentUser(user);

            } catch (error) {

                console.error(
                    "Failed to load current user:",
                    error
                );

            } finally {

                setLoadingUser(false);

            }

        };

        loadCurrentUser();

    }, []);


    // =========================================================
    // ROLE
    // =========================================================

    const isAdmin =
        currentUser?.system_role === "ADMIN";


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        navigate("/login");

    };


    return (

        <aside className="sidebar">

            {/* =================================================
                LOGO / BRAND
            ================================================= */}

            <div className="sidebar-header">

                <div className="sidebar-brand">

                    <img
                        src="/logo.png"
                        alt="Society Logo"
                        className="sidebar-logo"
                    />

                    <h2 className="sidebar-title">
                        Society
                    </h2>

                    <p className="sidebar-subtitle">
                        Management System
                    </p>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-nav">

                {/* =================================================
                    DASHBOARD
                ================================================= */}

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >

                    <span className="sidebar-icon">

                        <DashboardIcon />

                    </span>

                    <span>
                        Dashboard
                    </span>

                </NavLink>


                {/* =================================================
                    MEMBERS
                    ADMIN ONLY
                ================================================= */}

                {!loadingUser && isAdmin && (

                    <NavLink
                        to="/members"
                        className={({ isActive }) =>
                            isActive
                                ? "active"
                                : ""
                        }
                    >

                        <span className="sidebar-icon">

                            <MembersIcon />

                        </span>

                        <span>
                            Members
                        </span>

                    </NavLink>

                )}


                {/* =================================================
                    DEPOSITS
                ================================================= */}

                <NavLink
                    to="/deposits"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >

                    <span className="sidebar-icon">

                        <DepositsIcon />

                    </span>

                    <span>
                        {isAdmin
                            ? "Deposits"
                            : "My Deposits"}
                    </span>

                </NavLink>


                {/* =================================================
                    CONTRIBUTION RATES
                    ADMIN ONLY
                ================================================= */}

                {!loadingUser && isAdmin && (

                    <NavLink
                        to="/contributions"
                        className={({ isActive }) =>
                            isActive
                                ? "active"
                                : ""
                        }
                    >

                        <span className="sidebar-icon">

                            <ContributionIcon />

                        </span>

                        <span>
                            Contribution Rates
                        </span>

                    </NavLink>

                )}

            </nav>


            {/* =================================================
                BOTTOM LOGOUT
            ================================================= */}

            <div className="sidebar-footer">

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >

                    <span className="sidebar-icon">

                        <LogoutIcon />

                    </span>

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>

    );

}


export default Sidebar;