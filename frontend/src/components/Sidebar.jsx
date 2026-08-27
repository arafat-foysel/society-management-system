import { NavLink, useNavigate } from "react-router-dom";

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
                    <span className="sidebar-icon">⌂</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/members"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    <span className="sidebar-icon">♙</span>
                    <span>Members</span>
                </NavLink>

                <NavLink
                    to="/deposits"
                    className={({ isActive }) =>
                        isActive ? "active" : ""
                    }
                >
                    <span className="sidebar-icon">৳</span>
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
                    <span className="sidebar-icon">↪</span>
                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;