import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../services/api";
import { getCurrentUser } from "../services/auth";


function Dashboard() {

    const [currentUser, setCurrentUser] = useState(null);

    const [members, setMembers] = useState([]);

    const [deposits, setDeposits] = useState([]);

    const [summary, setSummary] = useState(null);

    const [duePayments, setDuePayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================

    useEffect(() => {

        const loadDashboardData = async () => {

            try {

                setLoading(true);
                setError("");


                const userData =
                    await getCurrentUser();

                setCurrentUser(userData);


                const isAdmin =
                    userData?.system_role === "ADMIN";


                // =================================================
                // ADMIN
                // =================================================

                if (isAdmin) {

                    const [
                        membersResponse,
                        depositsResponse,
                    ] = await Promise.all([
                        apiFetch("/members/"),
                        apiFetch("/deposits/"),
                    ]);


                    if (!membersResponse.ok) {

                        throw new Error(
                            "Failed to load members."
                        );

                    }


                    if (!depositsResponse.ok) {

                        throw new Error(
                            "Failed to load deposits."
                        );

                    }


                    const membersData =
                        await membersResponse.json();

                    const depositsData =
                        await depositsResponse.json();


                    setMembers(
                        Array.isArray(membersData)
                            ? membersData
                            : membersData.results || []
                    );


                    setDeposits(
                        Array.isArray(depositsData)
                            ? depositsData
                            : depositsData.results || []
                    );

                }


                // =================================================
                // USER
                // =================================================

                else {

                    const [
                        depositsResponse,
                        summaryResponse,
                        dueResponse,
                    ] = await Promise.all([
                        apiFetch("/deposits/"),
                        apiFetch("/deposits/summary/"),
                        apiFetch("/deposits/due/"),
                    ]);


                    if (!depositsResponse.ok) {

                        throw new Error(
                            "Failed to load deposits."
                        );

                    }


                    if (!summaryResponse.ok) {

                        throw new Error(
                            "Failed to load deposit summary."
                        );

                    }


                    if (!dueResponse.ok) {

                        throw new Error(
                            "Failed to load due payments."
                        );

                    }


                    const depositsData =
                        await depositsResponse.json();

                    const summaryData =
                        await summaryResponse.json();

                    const dueData =
                        await dueResponse.json();


                    setDeposits(
                        Array.isArray(depositsData)
                            ? depositsData
                            : depositsData.results || []
                    );


                    setSummary(
                        summaryData
                    );


                    setDuePayments(
                        Array.isArray(
                            dueData?.due_payments
                        )
                            ? dueData.due_payments
                            : []
                    );

                }

            } catch (err) {

                console.error(
                    "Error loading dashboard:",
                    err
                );


                setError(
                    "Failed to load dashboard data."
                );

            } finally {

                setLoading(false);

            }

        };


        loadDashboardData();

    }, []);


    // =========================================================
    // USER ROLE
    // =========================================================

    const isAdmin =
        currentUser?.system_role === "ADMIN";


    // =========================================================
    // MEMBER COUNTS
    // =========================================================

    const activeMembers =
        members.filter(
            (member) =>
                member.status === "Active"
        ).length;


    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    const approvedDeposits =
        deposits.filter(
            (deposit) =>
                deposit.status === "APPROVED"
        );


    const pendingDeposits =
        deposits.filter(
            (deposit) =>
                deposit.status === "PENDING"
        );


    // =========================================================
    // ADMIN FINANCIAL TOTALS
    // =========================================================

    const totalAmount =
        approvedDeposits.reduce(
            (total, deposit) =>
                total +
                Number(
                    deposit.amount || 0
                ),
            0
        );


    const totalFine =
        approvedDeposits.reduce(
            (total, deposit) =>
                total +
                Number(
                    deposit.fine || 0
                ),
            0
        );


    const totalExtra =
        approvedDeposits.reduce(
            (total, deposit) =>
                total +
                Number(
                    deposit.extra || 0
                ),
            0
        );


    const grandTotal =
        totalAmount +
        totalFine +
        totalExtra;


    // =========================================================
    // USER SUMMARY
    // =========================================================

    const systemGrandTotal =
        Number(
            summary?.system_grand_total || 0
        );


    const myTotalSubmitted =
        Number(
            summary?.my_total_submitted || 0
        );


    const myPendingCount =
        Number(
            summary?.my_pending_count || 0
        );


    // =========================================================
    // ACTUAL DUE PAYMENT COUNT
    // =========================================================

    const duePaymentCount =
        duePayments.filter(
            (payment) =>
                payment.status === "DUE"
        ).length;


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="page">

                <div className="page-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Loading dashboard...
                        </p>

                    </div>

                </div>

            </div>
        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <div className="page">

                <div className="page-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p className="error-message">
                            {error}
                        </p>

                    </div>

                </div>

            </div>
        );

    }


    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <div className="page dashboard-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Society Management System
                        overview
                    </p>

                </div>

            </div>


            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            {isAdmin ? (

                <div className="dashboard-grid">


                    {/* TOTAL MEMBERS */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon blue">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Total Members
                            </h3>

                            <div className="dashboard-number">
                                {members.length}
                            </div>

                            <Link to="/members">
                                View Members →
                            </Link>

                        </div>

                    </div>


                    {/* ACTIVE MEMBERS */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon green">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="8"
                                    r="4"
                                />

                                <path d="M5 21v-1a7 7 0 0 1 14 0v1" />

                                <path d="m16 11 2 2 4-4" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Active Members
                            </h3>

                            <div className="dashboard-number">
                                {activeMembers}
                            </div>

                            <span>
                                Currently active
                            </span>

                        </div>

                    </div>


                    {/* WAITING FOR APPROVAL */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon orange">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 7v5l3 2" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Waiting for Approval
                            </h3>

                            <div className="dashboard-number">
                                {pendingDeposits.length}
                            </div>

                            <Link to="/deposits">
                                Review Payments →
                            </Link>

                        </div>

                    </div>


                    {/* TOTAL DEPOSITS */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon purple">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <rect
                                    x="4"
                                    y="3"
                                    width="16"
                                    height="18"
                                    rx="2"
                                />

                                <path d="M8 7h8" />

                                <path d="M8 11h8" />

                                <path d="M8 15h4" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Total Deposits
                            </h3>

                            <div className="dashboard-number">
                                {approvedDeposits.length}
                            </div>

                            <Link to="/deposits">
                                View Deposits →
                            </Link>

                        </div>

                    </div>


                    {/* TOTAL AMOUNT */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon green">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 6v12" />

                                <path d="M15 9.5c0-1-1.2-1.8-3-1.8s-3 .8-3 1.8 1.2 1.6 3 2.1 3 1 3 2.1-1.2 1.8-3 1.8-3-.8-3-1.8" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Total Amount
                            </h3>

                            <div className="dashboard-number">
                                {totalAmount.toFixed(2)}
                            </div>

                            <span>
                                Approved amount
                            </span>

                        </div>

                    </div>


                    {/* TOTAL FINE */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon orange">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 7v5" />

                                <path d="M12 16h.01" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Total Fine
                            </h3>

                            <div className="dashboard-number">
                                {totalFine.toFixed(2)}
                            </div>

                            <span>
                                Approved fines
                            </span>

                        </div>

                    </div>


                    {/* TOTAL EXTRA */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon blue">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 8v8" />

                                <path d="M8 12h8" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Total Extra
                            </h3>

                            <div className="dashboard-number">
                                {totalExtra.toFixed(2)}
                            </div>

                            <span>
                                Approved extra payments
                            </span>

                        </div>

                    </div>


                    {/* GRAND TOTAL */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon purple">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <rect
                                    x="5"
                                    y="2"
                                    width="14"
                                    height="20"
                                    rx="2"
                                />

                                <path d="M8 6h8" />

                                <path d="M8 10h2" />
                                <path d="M14 10h2" />

                                <path d="M8 14h2" />
                                <path d="M14 14h2" />

                                <path d="M8 18h2" />
                                <path d="M14 18h2" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Grand Total
                            </h3>

                            <div className="dashboard-number">
                                {grandTotal.toFixed(2)}
                            </div>

                            <span>
                                Approved total
                            </span>

                        </div>

                    </div>

                </div>

            ) : (

                /* =================================================
                   USER DASHBOARD
                ================================================= */

                <div className="dashboard-grid">


                    {/* SYSTEM GRAND TOTAL */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon purple">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <rect
                                    x="5"
                                    y="2"
                                    width="14"
                                    height="20"
                                    rx="2"
                                />

                                <path d="M8 6h8" />

                                <path d="M8 10h2" />
                                <path d="M14 10h2" />

                                <path d="M8 14h2" />
                                <path d="M14 14h2" />

                                <path d="M8 18h2" />
                                <path d="M14 18h2" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                System Grand Total
                            </h3>

                            <div className="dashboard-number">
                                {systemGrandTotal.toFixed(2)}
                            </div>

                            <span>
                                Total approved society balance
                            </span>

                        </div>

                    </div>


                    {/* MY TOTAL SUBMITTED */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon blue">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <rect
                                    x="4"
                                    y="3"
                                    width="16"
                                    height="18"
                                    rx="2"
                                />

                                <path d="M8 7h8" />

                                <path d="M8 11h8" />

                                <path d="M8 15h4" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                My Total Submitted
                            </h3>

                            <div className="dashboard-number">
                                {myTotalSubmitted.toFixed(2)}
                            </div>

                            <Link to="/deposits">
                                View My Payments →
                            </Link>

                        </div>

                    </div>


                    {/* =================================================
                        DUE PAYMENTS CARD
                    ================================================= */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon orange">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 7v5" />

                                <path d="M12 16h.01" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Due Payments
                            </h3>

                            <div className="dashboard-number">
                                {duePaymentCount}
                            </div>

                            <a
                                href="#due-payments"
                                style={{
                                    display: "inline-block",
                                    marginTop: "6px",
                                    textDecoration: "none",
                                }}
                            >
                                View Due Payments →
                            </a>

                        </div>

                    </div>


                    {/* WAITING FOR APPROVAL */}

                    <div className="dashboard-card dashboard-card-with-icon">

                        <div className="dashboard-card-icon orange">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 7v5l3 2" />

                            </svg>

                        </div>


                        <div className="dashboard-card-content">

                            <h3>
                                Waiting for Approval
                            </h3>

                            <div className="dashboard-number">
                                {myPendingCount}
                            </div>

                            <Link to="/deposits">
                                View My Payments →
                            </Link>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                USER DUE PAYMENTS
            ================================================= */}

            {!isAdmin && (

                <div
                    className="dashboard-section"
                    id="due-payments"
                    style={{
                        scrollMarginTop: "24px",
                    }}
                >

                    <div className="section-header">

                        <h2>
                            Due Payments
                        </h2>

                        <span>
                            {duePaymentCount} payment
                            {duePaymentCount !== 1
                                ? "s"
                                : ""} due
                        </span>

                    </div>


                    {duePayments.length === 0 ? (

                        <div className="content-card">

                            <p className="empty-state">
                                No due payments.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="table-wrapper"
                            style={{
                                maxHeight: "260px",
                                overflowY: "auto",
                            }}
                        >

                            <table
                                className="dashboard-table"
                                style={{
                                    margin: 0,
                                }}
                            >

                                <thead
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        background: "white",
                                    }}
                                >

                                    <tr>

                                        <th>
                                            Year
                                        </th>

                                        <th>
                                            Month
                                        </th>

                                        <th>
                                            Expected
                                        </th>

                                        <th>
                                            Paid
                                        </th>

                                        <th>
                                            Remaining
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {duePayments.map(
                                        (payment) => (

                                            <tr
                                                key={`${payment.year}-${payment.month}`}
                                            >

                                                <td>
                                                    {
                                                        payment.year
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        payment.month_name
                                                    }
                                                </td>

                                                <td>
                                                    {Number(
                                                        payment.expected_amount ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>
                                                    {Number(
                                                        payment.paid_amount ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>
                                                    {Number(
                                                        payment.remaining_amount ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            payment.status ===
                                                            "DUE"
                                                                ? "status-badge status-rejected"
                                                                : payment.status ===
                                                                  "PENDING"
                                                                ? "status-badge status-pending"
                                                                : "status-badge"
                                                        }
                                                    >

                                                        {
                                                            payment.status ===
                                                            "DUE"
                                                                ? "Due"
                                                                : payment.status ===
                                                                  "PENDING"
                                                                ? "Pending"
                                                                : payment.status
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    {payment.status ===
                                                    "DUE" ? (

                                                        <Link
                                                            to={`/deposits?pay_year=${payment.year}&pay_month=${encodeURIComponent(
                                                                payment.month_name
                                                            )}`}
                                                            className="primary-button"
                                                            style={{
                                                                display: "inline-block",
                                                                padding: "8px 14px",
                                                                textDecoration: "none",
                                                            }}
                                                        >
                                                            Pay Now
                                                        </Link>

                                                    ) : (

                                                        <span>
                                                            Waiting
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="dashboard-section">

                <h2>
                    Quick Actions
                </h2>


                <div className="quick-actions">

                    {isAdmin && (

                        <Link
                            to="/members"
                            className="quick-action"
                        >
                            Manage Members
                        </Link>

                    )}


                    <Link
                        to="/deposits"
                        className="quick-action"
                    >
                        {isAdmin
                            ? "Manage Deposits"
                            : "My Deposits"}
                    </Link>

                </div>

            </div>


            {/* =================================================
                RECENT DEPOSITS / PAYMENTS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-header">

                    <h2>
                        {isAdmin
                            ? "Recent Deposits"
                            : "My Recent Payments"}
                    </h2>

                    <Link to="/deposits">
                        View All
                    </Link>

                </div>


                {deposits.length === 0 ? (

                    <p className="empty-state">
                        No deposits found.
                    </p>

                ) : (

                    <div className="table-wrapper">

                        <table className="dashboard-table">

                            <thead>

                                <tr>

                                    {isAdmin && (

                                        <th>
                                            Member
                                        </th>

                                    )}

                                    <th>
                                        Year
                                    </th>

                                    <th>
                                        Month
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Fine
                                    </th>

                                    <th>
                                        Extra
                                    </th>

                                    <th>
                                        Payment Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {deposits
                                    .slice(0, 5)
                                    .map(
                                        (deposit) => (

                                            <tr
                                                key={
                                                    deposit.id
                                                }
                                            >

                                                {isAdmin && (

                                                    <td>
                                                        {
                                                            deposit.member_name ||
                                                            "-"
                                                        }
                                                    </td>

                                                )}


                                                <td>
                                                    {
                                                        deposit.year
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        deposit.month
                                                    }
                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.amount ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.fine ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.extra ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>


                                                <td>
                                                    {
                                                        deposit.payment_date ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            deposit.status ===
                                                            "APPROVED"
                                                                ? "status-badge status-approved"
                                                                : deposit.status ===
                                                                  "PENDING"
                                                                ? "status-badge status-pending"
                                                                : "status-badge status-rejected"
                                                        }
                                                    >

                                                        {
                                                            deposit.status ===
                                                            "APPROVED"
                                                                ? "Approved"
                                                                : deposit.status ===
                                                                  "PENDING"
                                                                ? "Pending"
                                                                : "Rejected"
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}


export default Dashboard;