import { NavLink, useNavigate } from "react-router-dom";

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
            <circle cx="12" cy="8" r="3" />
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
            <circle cx="12" cy="12" r="9" />
            <path d="M14.5 8.5c-.7-.6-1.6-.9-2.6-.9-1.5 0-2.5.8-2.5 1.9 0 1.2 1.1 1.7 2.7 2.1 1.6.4 2.8.9 2.8 2.2 0 1.2-1.1 2-2.7 2-1.1 0-2.1-.4-2.8-1" />
            <path d="M12 6.5v11" />
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

    const handleLogout = () => {
        // Remove JWT tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // Redirect to login page
        navigate("/login");
    };

    return (
        <aside className="sidebar">

            {/* Logo / Brand */}
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

            {/* Navigation */}
            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    <span className="sidebar-icon">
                        <DashboardIcon />
                    </span>

                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/members"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    <span className="sidebar-icon">
                        <MembersIcon />
                    </span>

                    <span>Members</span>
                </NavLink>

                <NavLink
                    to="/deposits"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    <span className="sidebar-icon">
                        <DepositsIcon />
                    </span>

                    <span>Deposits</span>
                </NavLink>

            </nav>

            {/* Bottom Logout */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <span className="sidebar-icon">
                        <LogoutIcon />
                    </span>

                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;