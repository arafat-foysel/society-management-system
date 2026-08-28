import { useEffect, useState } from "react";

import { apiFetch } from "../services/api";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const normalizeMonth = (month) => {
    if (!month) return "";

    const value = String(month).trim();

    const numericMonth = value.replace(/^0+/, "");

    const monthMap = {
        "1": "January",
        "2": "February",
        "3": "March",
        "4": "April",
        "5": "May",
        "6": "June",
        "7": "July",
        "8": "August",
        "9": "September",
        "10": "October",
        "11": "November",
        "12": "December",
    };

    return monthMap[numericMonth] || value;
};

const getEmptyForm = () => ({
    member: "",
    year: new Date().getFullYear(),
    month: "",
    amount: "",
    fine: "0",
    extra: "0",
    payment_date: "",
    remarks: "",
});

function Deposits() {
    const [members, setMembers] = useState([]);
    const [deposits, setDeposits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState(getEmptyForm());

    // =========================================================
    // LOAD MEMBERS
    // =========================================================

    const loadMembers = async () => {
        try {
            const response = await apiFetch("/members/");

            if (!response.ok) {
                throw new Error("Failed to load members.");
            }

            const data = await response.json();

            setMembers(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Error loading members:", err);

            setError("Failed to load members.");
        }
    };

    // =========================================================
    // LOAD DEPOSITS
    // =========================================================

    const loadDeposits = async () => {
        try {
            const response = await apiFetch("/deposits/");

            if (!response.ok) {
                throw new Error("Failed to load deposits.");
            }

            const data = await response.json();

            setDeposits(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Error loading deposits:", err);

            setError("Failed to load deposits.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadMembers();
        loadDeposits();
    }, []);

    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // OPEN ADD FORM
    // =========================================================

    const openAddForm = () => {
        setEditingId(null);

        setFormData(getEmptyForm());

        setMessage("");
        setError("");

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // RESET / CLOSE FORM
    // =========================================================

    const resetForm = () => {
        setFormData(getEmptyForm());

        setEditingId(null);

        setMessage("");
        setError("");

        setShowForm(false);
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!formData.member) {
            setError("Please select a member.");
            return;
        }

        if (!formData.year) {
            setError("Please enter the year.");
            return;
        }

        if (!formData.month) {
            setError("Please select a month.");
            return;
        }

        if (!formData.amount) {
            setError("Please enter the amount.");
            return;
        }

        if (!formData.payment_date) {
            setError("Please select the payment date.");
            return;
        }

        const amount = String(formData.amount).replace(",", ".");
        const fine = String(formData.fine || "0").replace(",", ".");
        const extra = String(formData.extra || "0").replace(",", ".");

        const payload = {
            member: Number(formData.member),
            year: Number(formData.year),
            month: normalizeMonth(formData.month),
            amount,
            fine,
            extra,
            payment_date: formData.payment_date,
            remarks: formData.remarks,
        };

        try {
            setSaving(true);

            let response;

            // =================================================
            // UPDATE EXISTING DEPOSIT
            // =================================================

            if (editingId) {
                response = await apiFetch(
                    `/deposits/${editingId}/`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );
            }

            // =================================================
            // CREATE NEW DEPOSIT
            // =================================================

            else {
                response = await apiFetch(
                    "/deposits/",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );
            }

            const data = await response.json();

            if (!response.ok) {
                console.error("Django error:", data);

                throw new Error(
                    data.detail ||
                    JSON.stringify(data)
                );
            }

            setMessage(
                editingId
                    ? "Deposit updated successfully!"
                    : "Deposit added successfully!"
            );

            setFormData(getEmptyForm());

            setEditingId(null);

            setShowForm(false);

            await loadDeposits();

        } catch (err) {
            console.error("Error saving deposit:", err);

            setError(
                `Failed to save deposit: ${err.message}`
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = (deposit) => {
        setEditingId(deposit.id);

        setFormData({
            member: String(deposit.member),

            year: deposit.year,

            month: normalizeMonth(deposit.month),

            amount: deposit.amount ?? "",

            fine: deposit.fine ?? "0",

            extra: deposit.extra ?? "0",

            payment_date:
                deposit.payment_date ?? "",

            remarks:
                deposit.remarks ?? "",
        });

        setMessage("");
        setError("");

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this deposit?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await apiFetch(
                `/deposits/${id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                let data = {};

                try {
                    data = await response.json();
                } catch {
                    data = {};
                }

                throw new Error(
                    data.detail ||
                    JSON.stringify(data)
                );
            }

            setMessage(
                "Deposit deleted successfully!"
            );

            await loadDeposits();

        } catch (err) {
            console.error(
                "Error deleting deposit:",
                err
            );

            setError(
                `Failed to delete deposit: ${err.message}`
            );
        }
    };

    // =========================================================
    // MEMBER NAME
    // =========================================================

    const getMemberName = (deposit) => {
        if (deposit.member_name) {
            return deposit.member_name;
        }

        const member = members.find(
            (item) =>
                Number(item.id) ===
                Number(deposit.member)
        );

        if (member) {
            return `${member.first_name} ${member.last_name}`;
        }

        return `Member #${deposit.member}`;
    };

    // =========================================================
    // TOTALS
    // =========================================================

    const totalAmount = deposits.reduce(
        (total, deposit) =>
            total + Number(deposit.amount || 0),
        0
    );

    const totalFine = deposits.reduce(
        (total, deposit) =>
            total + Number(deposit.fine || 0),
        0
    );

    const totalExtra = deposits.reduce(
        (total, deposit) =>
            total + Number(deposit.extra || 0),
        0
    );

    const grandTotal =
        totalAmount +
        totalFine +
        totalExtra;

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <h1>Deposits</h1>

                        <p>
                            Manage member deposits and
                            payments.
                        </p>
                    </div>
                </div>

                <div className="content-card">
                    <div className="empty-state">
                        <p>
                            Loading deposits...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="page deposits-page">

            {/* PAGE HEADER */}

            <div className="page-header">

                <div>
                    <h1>Deposits</h1>

                    <p>
                        Manage member deposits and
                        payment records.
                    </p>
                </div>

                {!showForm && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={openAddForm}
                    >
                        + Add Deposit
                    </button>
                )}

            </div>


            {/* MESSAGES */}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* SUMMARY CARDS */}

            <div className="deposit-summary-grid">

                {/* Total Deposits */}

                <div className="deposit-summary-card deposit-summary-card-with-icon">

                    <div className="deposit-summary-icon blue">

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

                    <div className="deposit-summary-content">

                        <span>
                            Total Deposits
                        </span>

                        <strong>
                            {deposits.length}
                        </strong>

                        <small>
                            Payment records
                        </small>

                    </div>

                </div>


                {/* Total Amount */}

                <div className="deposit-summary-card deposit-summary-card-with-icon">

                    <div className="deposit-summary-icon green">

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

                    <div className="deposit-summary-content">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            {totalAmount.toFixed(2)}
                        </strong>

                        <small>
                            Deposit amount
                        </small>

                    </div>

                </div>


                {/* Total Fine */}

                <div className="deposit-summary-card deposit-summary-card-with-icon">

                    <div className="deposit-summary-icon orange">

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

                    <div className="deposit-summary-content">

                        <span>
                            Total Fine
                        </span>

                        <strong>
                            {totalFine.toFixed(2)}
                        </strong>

                        <small>
                            Collected fines
                        </small>

                    </div>

                </div>


                {/* Grand Total */}

                <div className="deposit-summary-card deposit-summary-card-with-icon">

                    <div className="deposit-summary-icon purple">

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

                    <div className="deposit-summary-content">

                        <span>
                            Grand Total
                        </span>

                        <strong>
                            {grandTotal.toFixed(2)}
                        </strong>

                        <small>
                            Total collected
                        </small>

                    </div>

                </div>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="content-card">

                    <div className="card-header">

                        <div>

                            <h2>
                                {editingId
                                    ? "Edit Deposit"
                                    : "Add Deposit"}
                            </h2>

                            <p>
                                {editingId
                                    ? "Update the payment record."
                                    : "Enter the payment information below."}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={resetForm}
                        >
                            Close Form
                        </button>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            {/* MEMBER */}

                            <div className="form-group">

                                <label htmlFor="deposit-member">
                                    Member
                                </label>

                                <select
                                    id="deposit-member"
                                    name="member"
                                    value={formData.member}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Member
                                    </option>

                                    {members.map(
                                        (member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.first_name}{" "}
                                                {member.last_name}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* YEAR */}

                            <div className="form-group">

                                <label htmlFor="deposit-year">
                                    Year
                                </label>

                                <input
                                    id="deposit-year"
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    min="2000"
                                    max="2100"
                                    required
                                />

                            </div>


                            {/* MONTH */}

                            <div className="form-group">

                                <label htmlFor="deposit-month">
                                    Month
                                </label>

                                <select
                                    id="deposit-month"
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Month
                                    </option>

                                    {MONTHS.map(
                                        (month) => (
                                            <option
                                                key={month}
                                                value={month}
                                            >
                                                {month}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* PAYMENT DATE */}

                            <div className="form-group">

                                <label htmlFor="payment-date">
                                    Payment Date
                                </label>

                                <input
                                    id="payment-date"
                                    type="date"
                                    name="payment_date"
                                    value={
                                        formData.payment_date
                                    }
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* AMOUNT */}

                            <div className="form-group">

                                <label htmlFor="deposit-amount">
                                    Amount
                                </label>

                                <input
                                    id="deposit-amount"
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="2500.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />

                            </div>


                            {/* FINE */}

                            <div className="form-group">

                                <label htmlFor="deposit-fine">
                                    Fine
                                </label>

                                <input
                                    id="deposit-fine"
                                    type="number"
                                    name="fine"
                                    value={formData.fine}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* EXTRA */}

                            <div className="form-group">

                                <label htmlFor="deposit-extra">
                                    Extra
                                </label>

                                <input
                                    id="deposit-extra"
                                    type="number"
                                    name="extra"
                                    value={formData.extra}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* REMARKS */}

                            <div className="form-group form-group-full">

                                <label htmlFor="deposit-remarks">
                                    Remarks
                                </label>

                                <textarea
                                    id="deposit-remarks"
                                    name="remarks"
                                    rows="4"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Optional remarks..."
                                />

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Deposit"
                                    : "Add Deposit"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* DEPOSIT LIST */}

            <div className="content-card">

                <div className="card-header">

                    <div>

                        <h2>
                            Deposit List
                        </h2>

                        <p>
                            {deposits.length} payment
                            record
                            {deposits.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                </div>


                {deposits.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No deposits found
                        </h3>

                        <p>
                            Click "+ Add Deposit"
                            to create the first
                            payment record.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Member</th>

                                    <th>Year</th>

                                    <th>Month</th>

                                    <th>Amount</th>

                                    <th>Fine</th>

                                    <th>Extra</th>

                                    <th>Total</th>

                                    <th>Payment Date</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {deposits.map(
                                    (deposit) => {

                                        const total =
                                            Number(
                                                deposit.amount || 0
                                            ) +
                                            Number(
                                                deposit.fine || 0
                                            ) +
                                            Number(
                                                deposit.extra || 0
                                            );

                                        return (
                                            <tr
                                                key={
                                                    deposit.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        deposit.id
                                                    }
                                                </td>


                                                <td>

                                                    <div className="member-name">

                                                        {
                                                            getMemberName(
                                                                deposit
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        deposit.year
                                                    }
                                                </td>


                                                <td>

                                                    <span className="role-badge">

                                                        {
                                                            normalizeMonth(
                                                                deposit.month
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.amount ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.fine ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>


                                                <td>
                                                    {Number(
                                                        deposit.extra ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>


                                                <td>

                                                    <strong>
                                                        {total.toFixed(
                                                            2
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        deposit.payment_date ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="table-button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    deposit
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-button table-button-danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    deposit.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Deposits;