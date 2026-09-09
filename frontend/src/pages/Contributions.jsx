import { useEffect, useState } from "react";

import { apiFetch } from "../services/api";


function Contributions() {

    const [contributions, setContributions] = useState([]);

    const [effectiveFrom, setEffectiveFrom] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [editEffectiveFrom, setEditEffectiveFrom] =
        useState("");

    const [editAmount, setEditAmount] =
        useState("");


    // =========================================================
    // LOAD CONTRIBUTION RATES
    // =========================================================

    const loadContributions = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await apiFetch("/contributions/");

            if (!response.ok) {
                throw new Error(
                    "Failed to load contribution rates."
                );
            }

            const data =
                await response.json();

            setContributions(
                [...data].sort(
                    (a, b) =>
                        new Date(b.effective_from) -
                        new Date(a.effective_from)
                )
            );

        } catch (error) {

            console.error(
                "Failed to load contributions:",
                error
            );

            setError(
                error.message ||
                "Failed to load contribution rates."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadContributions();

    }, []);


    // =========================================================
    // ADD CONTRIBUTION RATE
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!effectiveFrom || !amount) {

            setError(
                "Please enter the effective date and monthly amount."
            );

            return;

        }

        try {

            setSaving(true);

            const response =
                await apiFetch("/contributions/", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        effective_from:
                            effectiveFrom,
                        amount:
                            amount,
                    }),
                });

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to add contribution rate."
                );

            }

            setSuccess(
                "Contribution rate added successfully."
            );

            setEffectiveFrom("");
            setAmount("");

            await loadContributions();

        } catch (error) {

            console.error(
                "Failed to add contribution:",
                error
            );

            setError(
                error.message ||
                "Failed to add contribution rate."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // START EDITING
    // =========================================================

    const handleEdit = (contribution) => {

        setError("");
        setSuccess("");

        setEditingId(contribution.id);

        setEditEffectiveFrom(
            contribution.effective_from
        );

        setEditAmount(
            contribution.amount
        );

    };


    // =========================================================
    // CANCEL EDIT
    // =========================================================

    const handleCancelEdit = () => {

        setEditingId(null);
        setEditEffectiveFrom("");
        setEditAmount("");

    };


    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleSaveEdit = async (id) => {

        setError("");
        setSuccess("");

        if (!editEffectiveFrom || !editAmount) {

            setError(
                "Please enter the effective date and monthly amount."
            );

            return;

        }

        try {

            setSaving(true);

            const response =
                await apiFetch(
                    `/contributions/${id}/`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            effective_from:
                                editEffectiveFrom,
                            amount:
                                editAmount,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to update contribution rate."
                );

            }

            setSuccess(
                "Contribution rate updated successfully."
            );

            handleCancelEdit();

            await loadContributions();

        } catch (error) {

            console.error(
                "Failed to update contribution:",
                error
            );

            setError(
                error.message ||
                "Failed to update contribution rate."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // DELETE CONTRIBUTION RATE
    // =========================================================

    const handleDelete = async (contribution) => {

        const confirmed =
            window.confirm(
                `Delete the contribution rate of €${formatAmount(
                    contribution.amount
                )} effective from ${formatDate(
                    contribution.effective_from
                )}?`
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");

        try {

            setSaving(true);

            const response =
                await apiFetch(
                    `/contributions/${contribution.id}/`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {

                let message =
                    "Failed to delete contribution rate.";

                try {

                    const data =
                        await response.json();

                    message =
                        data.detail ||
                        message;

                } catch {
                    // No response body.
                }

                throw new Error(message);

            }

            setSuccess(
                "Contribution rate deleted successfully."
            );

            if (
                editingId ===
                contribution.id
            ) {
                handleCancelEdit();
            }

            await loadContributions();

        } catch (error) {

            console.error(
                "Failed to delete contribution:",
                error
            );

            setError(
                error.message ||
                "Failed to delete contribution rate."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // FORMAT AMOUNT
    // =========================================================

    const formatAmount = (value) => {

        return Number(value).toLocaleString(
            "de-DE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (value) => {

        if (!value) {
            return "";
        }

        const date =
            new Date(`${value}T00:00:00`);

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );

    };


    // =========================================================
    // CURRENT RATE
    // =========================================================

    const currentRate =
        contributions.length > 0
            ? contributions[0]
            : null;


    return (

        <div className="page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Contribution Rates
                    </h1>

                    <p>
                        Manage historical and future monthly contribution amounts.
                    </p>

                </div>

            </div>


            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (

                <div
                    className="login-error"
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>

            )}

            {success && (

                <div
                    style={{
                        marginBottom: "20px",
                        padding: "12px 14px",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        background: "#f0fdf4",
                        color: "#15803d",
                        fontSize: "14px",
                    }}
                >
                    {success}
                </div>

            )}


            {/* =================================================
                CURRENT RATE
            ================================================= */}

            {currentRate && (

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                        padding: "20px 24px",
                        marginBottom: "24px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "14px",
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "6px",
                            }}
                        >

                            <span
                                style={{
                                    color: "#1e40af",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Current Monthly Contribution
                            </span>

                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    minHeight: "24px",
                                    padding: "3px 9px",
                                    borderRadius: "999px",
                                    background: "#dbeafe",
                                    color: "#1d4ed8",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                }}
                            >
                                CURRENT
                            </span>

                        </div>

                        <p
                            style={{
                                margin: 0,
                                color: "#64748b",
                                fontSize: "13px",
                            }}
                        >
                            Effective from{" "}
                            {formatDate(
                                currentRate.effective_from
                            )}
                        </p>

                    </div>


                    <strong
                        style={{
                            color: "#1e3a8a",
                            fontSize: "28px",
                            fontWeight: "750",
                            whiteSpace: "nowrap",
                        }}
                    >
                        € {formatAmount(currentRate.amount)}
                    </strong>

                </div>

            )}


            {/* =================================================
                ADD CONTRIBUTION RATE
            ================================================= */}

            <div className="content-card">

                <div className="card-header">

                    <div>

                        <h2>
                            Add Contribution Rate
                        </h2>

                        <p>
                            Set a new monthly amount that becomes effective from a specific date.
                        </p>

                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">

                            <label htmlFor="effective-from">
                                Effective From
                            </label>

                            <input
                                id="effective-from"
                                type="date"
                                value={effectiveFrom}
                                onChange={(event) =>
                                    setEffectiveFrom(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="amount">
                                Monthly Amount (€)
                            </label>

                            <input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(
                                        event.target.value
                                    )
                                }
                                placeholder="3000.00"
                            />

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Add Rate"}
                        </button>

                    </div>

                </form>

            </div>


            {/* =================================================
                RATE HISTORY
            ================================================= */}

            <div className="content-card">

                <div className="card-header">

                    <div>

                        <h2>
                            Rate History
                        </h2>

                        <p>
                            Historical contribution amounts used for monthly payment calculations.
                        </p>

                    </div>

                    {!loading && (

                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "28px",
                                padding: "4px 10px",
                                borderRadius: "999px",
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: "650",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {contributions.length}{" "}
                            {contributions.length === 1
                                ? "rate"
                                : "rates"}
                        </span>

                    )}

                </div>


                {loading ? (

                    <div
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "#64748b",
                        }}
                    >
                        Loading contribution rates...
                    </div>

                ) : contributions.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No contribution rates
                        </h3>

                        <p>
                            Add the first monthly contribution rate above.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Effective From
                                    </th>

                                    <th>
                                        Monthly Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {contributions.map(
                                    (contribution, index) => {

                                        const isCurrent =
                                            index === 0;

                                        return (

                                            <tr
                                                key={
                                                    contribution.id
                                                }
                                            >

                                                {editingId ===
                                                contribution.id ? (

                                                    <>
                                                        <td>

                                                            <input
                                                                type="date"
                                                                value={
                                                                    editEffectiveFrom
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setEditEffectiveFrom(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                style={{
                                                                    minWidth: "170px",
                                                                    padding: "9px 10px",
                                                                    border: "1px solid #cbd5e1",
                                                                    borderRadius: "8px",
                                                                    outline: "none",
                                                                }}
                                                            />

                                                        </td>


                                                        <td>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    editAmount
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setEditAmount(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                style={{
                                                                    width: "150px",
                                                                    padding: "9px 10px",
                                                                    border: "1px solid #cbd5e1",
                                                                    borderRadius: "8px",
                                                                    outline: "none",
                                                                }}
                                                            />

                                                        </td>


                                                        <td>

                                                            <span
                                                                style={{
                                                                    color: "#64748b",
                                                                    fontSize: "13px",
                                                                }}
                                                            >
                                                                Editing
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="table-actions">

                                                                <button
                                                                    type="button"
                                                                    className="primary-button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={() =>
                                                                        handleSaveEdit(
                                                                            contribution.id
                                                                        )
                                                                    }
                                                                >
                                                                    {saving
                                                                        ? "Saving..."
                                                                        : "Save"}
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="secondary-button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={
                                                                        handleCancelEdit
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </>

                                                ) : (

                                                    <>
                                                        <td>

                                                            <div
                                                                style={{
                                                                    color: "#1e293b",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    contribution.effective_from
                                                                )}
                                                            </div>

                                                            {isCurrent && (

                                                                <div
                                                                    style={{
                                                                        marginTop: "4px",
                                                                        color: "#64748b",
                                                                        fontSize: "12px",
                                                                    }}
                                                                >
                                                                    Current rate
                                                                </div>

                                                            )}

                                                        </td>


                                                        <td>

                                                            <strong
                                                                style={{
                                                                    color: "#1e293b",
                                                                    fontSize: "16px",
                                                                    fontWeight: "700",
                                                                }}
                                                            >
                                                                €{" "}
                                                                {formatAmount(
                                                                    contribution.amount
                                                                )}
                                                            </strong>

                                                            <div
                                                                style={{
                                                                    marginTop: "3px",
                                                                    color: "#94a3b8",
                                                                    fontSize: "12px",
                                                                }}
                                                            >
                                                                per month
                                                            </div>

                                                        </td>


                                                        <td>

                                                            {isCurrent ? (

                                                                <span
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        minHeight: "26px",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "999px",
                                                                        background: "#ecfdf5",
                                                                        color: "#047857",
                                                                        fontSize: "12px",
                                                                        fontWeight: "650",
                                                                    }}
                                                                >
                                                                    Active
                                                                </span>

                                                            ) : (

                                                                <span
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        minHeight: "26px",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "999px",
                                                                        background: "#f1f5f9",
                                                                        color: "#64748b",
                                                                        fontSize: "12px",
                                                                        fontWeight: "650",
                                                                    }}
                                                                >
                                                                    Historical
                                                                </span>

                                                            )}

                                                        </td>


                                                        <td>

                                                            <div className="table-actions">

                                                                <button
                                                                    type="button"
                                                                    className="secondary-button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            contribution
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="danger-button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            contribution
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </>

                                                )}

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


export default Contributions;