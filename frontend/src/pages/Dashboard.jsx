import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
    const [members, setMembers] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [membersResponse, depositsResponse] =
                    await Promise.all([
                        fetch("http://127.0.0.1:8000/api/members/"),
                        fetch("http://127.0.0.1:8000/api/deposits/"),
                    ]);

                if (!membersResponse.ok) {
                    throw new Error("Failed to load members.");
                }

                if (!depositsResponse.ok) {
                    throw new Error("Failed to load deposits.");
                }

                const membersData = await membersResponse.json();
                const depositsData = await depositsResponse.json();

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
            } catch (err) {
                console.error("Error loading dashboard:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const activeMembers = members.filter(
        (member) => member.status === "Active"
    ).length;

    const inactiveMembers = members.filter(
        (member) => member.status === "Inactive"
    ).length;

    const totalAmount = deposits.reduce(
        (total, deposit) => total + Number(deposit.amount || 0),
        0
    );

    const totalFine = deposits.reduce(
        (total, deposit) => total + Number(deposit.fine || 0),
        0
    );

    const totalExtra = deposits.reduce(
        (total, deposit) => total + Number(deposit.extra || 0),
        0
    );

    const grandTotal = totalAmount + totalFine + totalExtra;

    if (loading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="error-message">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page dashboard-page">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Society Management System overview</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-grid">

                <div className="dashboard-card">
                    <h3>Total Members</h3>
                    <div className="dashboard-number">
                        {members.length}
                    </div>
                    <Link to="/members">
                        View Members →
                    </Link>
                </div>

                <div className="dashboard-card">
                    <h3>Active Members</h3>
                    <div className="dashboard-number">
                        {activeMembers}
                    </div>
                    <span>Currently active</span>
                </div>

                <div className="dashboard-card">
                    <h3>Inactive Members</h3>
                    <div className="dashboard-number">
                        {inactiveMembers}
                    </div>
                    <span>Currently inactive</span>
                </div>

                <div className="dashboard-card">
                    <h3>Total Deposits</h3>
                    <div className="dashboard-number">
                        {deposits.length}
                    </div>
                    <Link to="/deposits">
                        View Deposits →
                    </Link>
                </div>

                <div className="dashboard-card">
                    <h3>Total Amount</h3>
                    <div className="dashboard-number">
                        {totalAmount.toFixed(2)}
                    </div>
                    <span>Deposit amount</span>
                </div>

                <div className="dashboard-card">
                    <h3>Total Fine</h3>
                    <div className="dashboard-number">
                        {totalFine.toFixed(2)}
                    </div>
                    <span>Collected fines</span>
                </div>

                <div className="dashboard-card">
                    <h3>Total Extra</h3>
                    <div className="dashboard-number">
                        {totalExtra.toFixed(2)}
                    </div>
                    <span>Extra payments</span>
                </div>

                <div className="dashboard-card">
                    <h3>Grand Total</h3>
                    <div className="dashboard-number">
                        {grandTotal.toFixed(2)}
                    </div>
                    <span>Total collected</span>
                </div>

            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">

                <h2>Quick Actions</h2>

                <div className="quick-actions">

                    <Link
                        to="/members"
                        className="quick-action"
                    >
                        Manage Members
                    </Link>

                    <Link
                        to="/deposits"
                        className="quick-action"
                    >
                        Manage Deposits
                    </Link>

                </div>

            </div>

            {/* Recent Deposits */}
            <div className="dashboard-section">

                <div className="section-header">

                    <h2>Recent Deposits</h2>

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
                                    <th>Member</th>
                                    <th>Year</th>
                                    <th>Month</th>
                                    <th>Amount</th>
                                    <th>Fine</th>
                                    <th>Extra</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {deposits.slice(0, 5).map((deposit) => (

                                    <tr key={deposit.id}>

                                        <td>
                                            {deposit.member_name || "-"}
                                        </td>

                                        <td>
                                            {deposit.year}
                                        </td>

                                        <td>
                                            {deposit.month}
                                        </td>

                                        <td>
                                            {Number(
                                                deposit.amount || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            {Number(
                                                deposit.fine || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            {Number(
                                                deposit.extra || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            {deposit.payment_date || "-"}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dashboard;