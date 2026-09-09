import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/auth";


function ProtectedRoute({
    children,
    adminOnly = false,
}) {

    const accessToken =
        localStorage.getItem("access_token");

    const [currentUser, setCurrentUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // =========================================================
    // NO LOGIN
    // =========================================================

    if (!accessToken) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


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

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

            } finally {

                setLoading(false);

            }

        };

        loadCurrentUser();

    }, []);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748b",
                }}
            >
                Loading...
            </div>
        );

    }


    // =========================================================
    // ADMIN-ONLY ACCESS
    // =========================================================

    if (
        adminOnly &&
        currentUser?.system_role !== "ADMIN"
    ) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    // =========================================================
    // ALLOW ACCESS
    // =========================================================

    return children;

}


export default ProtectedRoute;