import { useEffect, useState } from "react";
import {
    useSearchParams,
} from "react-router-dom";

import { apiFetch } from "../services/api";
import { getCurrentUser } from "../services/auth";


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

    if (!month) {
        return "";
    }

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


const getTodayDate = () => {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
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


const getStatusClass = (status) => {

    switch (status) {

        case "APPROVED":
            return "status-badge status-approved";

        case "PENDING":
            return "status-badge status-pending";

        case "REJECTED":
            return "status-badge status-rejected";

        default:
            return "status-badge";
    }
};


const getStatusLabel = (status) => {

    switch (status) {

        case "APPROVED":
            return "Approved";

        case "PENDING":
            return "Pending";

        case "REJECTED":
            return "Rejected";

        default:
            return status || "Unknown";
    }
};


const getOverviewStatusClass = (status) => {

    switch (status) {

        case "PAID":
            return "status-badge status-approved";

        case "PENDING":
            return "status-badge status-pending";

        case "PARTIAL":
            return "status-badge status-pending";

        case "DUE":
            return "status-badge status-rejected";

        default:
            return "status-badge";
    }
};


const getOverviewStatusLabel = (status) => {

    switch (status) {

        case "PAID":
            return "Paid";

        case "PENDING":
            return "Pending";

        case "PARTIAL":
            return "Partial";

        case "DUE":
            return "Due";

        default:
            return status || "Unknown";
    }
};


function Deposits() {

    const [searchParams, setSearchParams] =
        useSearchParams();


    const [members, setMembers] =
        useState([]);

    const [deposits, setDeposits] =
        useState([]);

    const [currentUser, setCurrentUser] =
        useState(null);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [loadingDuePayment, setLoadingDuePayment] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);

    const [formData, setFormData] =
        useState(
            getEmptyForm()
        );


    // =========================================================
    // MONTHLY PAYMENT OVERVIEW
    // ADMIN ONLY
    // =========================================================

    const [showOverview, setShowOverview] =
        useState(false);

    const [overviewYear, setOverviewYear] =
        useState(
            new Date().getFullYear()
        );

    const [overviewMonth, setOverviewMonth] =
        useState(
            new Date().getMonth() + 1
        );

    const [overview, setOverview] =
        useState(null);

    const [loadingOverview, setLoadingOverview] =
        useState(false);

    const [overviewError, setOverviewError] =
        useState("");


    const isAdmin =
        currentUser?.system_role ===
        "ADMIN";


    // =========================================================
    // LOAD MEMBERS
    // =========================================================

    const loadMembers = async () => {

        try {

            const response =
                await apiFetch(
                    "/members/"
                );

            if (!response.ok) {

                const data =
                    await response.json().catch(
                        () => ({})
                    );

                throw new Error(
                    data.detail ||
                    "Failed to load members."
                );
            }

            const data =
                await response.json();

            setMembers(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

        } catch (err) {

            console.error(
                "Error loading members:",
                err
            );

            setError(
                err.message ||
                "Failed to load members."
            );
        }
    };


    // =========================================================
    // LOAD DEPOSITS
    // =========================================================

    const loadDeposits = async () => {

        try {

            const response =
                await apiFetch(
                    "/deposits/"
                );

            if (!response.ok) {

                const data =
                    await response.json().catch(
                        () => ({})
                    );

                throw new Error(
                    data.detail ||
                    "Failed to load deposits."
                );
            }

            const data =
                await response.json();

            setDeposits(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

        } catch (err) {

            console.error(
                "Error loading deposits:",
                err
            );

            setError(
                err.message ||
                "Failed to load deposits."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // LOAD CURRENT USER
    // =========================================================

    const loadCurrentUser = async () => {

        try {

            const user =
                await getCurrentUser();

            setCurrentUser(user);

        } catch (err) {

            console.error(
                "Error loading current user:",
                err
            );

            setError(
                "Failed to load current user."
            );
        }
    };


    // =========================================================
    // LOAD MONTHLY PAYMENT OVERVIEW
    // =========================================================

    const loadMonthlyOverview = async (
        year = overviewYear,
        month = overviewMonth
    ) => {

        if (!isAdmin) {
            return;
        }

        try {

            setLoadingOverview(true);
            setOverviewError("");

            const response =
                await apiFetch(
                    `/deposits/monthly-overview/?year=${year}&month=${month}`
                );

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to load monthly payment overview."
                );
            }

            setOverview(data);

        } catch (err) {

            console.error(
                "Error loading monthly overview:",
                err
            );

            setOverviewError(
                err.message ||
                "Failed to load monthly payment overview."
            );

            setOverview(null);

        } finally {

            setLoadingOverview(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadMembers();

        loadDeposits();

        loadCurrentUser();

    }, []);


    // =========================================================
    // AUTOMATICALLY SELECT USER'S OWN MEMBER
    // =========================================================

    useEffect(() => {

        if (
            isAdmin ||
            !currentUser ||
            members.length === 0 ||
            editingId
        ) {
            return;
        }

        const ownMember =
            members.find(
                (member) =>
                    Number(member.user) ===
                    Number(currentUser.id)
            ) || members[0];

        if (
            ownMember &&
            !formData.member
        ) {

            setFormData(
                (previous) => ({
                    ...previous,
                    member: String(
                        ownMember.id
                    ),
                })
            );
        }

    }, [
        currentUser,
        members,
        isAdmin,
        editingId,
        formData.member,
    ]);


    // =========================================================
    // PAY NOW
    // =========================================================

    useEffect(() => {

        const payYear =
            searchParams.get(
                "pay_year"
            );

        const payMonth =
            searchParams.get(
                "pay_month"
            );

        if (
            isAdmin ||
            !currentUser ||
            members.length === 0 ||
            !payYear ||
            !payMonth
        ) {
            return;
        }

        const openDuePayment =
            async () => {

                try {

                    setLoadingDuePayment(
                        true
                    );

                    setMessage("");
                    setError("");

                    const response =
                        await apiFetch(
                            "/deposits/due/"
                        );

                    if (!response.ok) {

                        const data =
                            await response
                                .json()
                                .catch(
                                    () => ({})
                                );

                        throw new Error(
                            data.detail ||
                            "Failed to load due payment."
                        );
                    }

                    const data =
                        await response.json();

                    const normalizedMonth =
                        normalizeMonth(
                            payMonth
                        );

                    const duePayment =
                        (
                            data.due_payments ||
                            []
                        ).find(
                            (payment) =>
                                Number(
                                    payment.year
                                ) ===
                                    Number(
                                        payYear
                                    ) &&
                                normalizeMonth(
                                    payment.month_name
                                ) ===
                                    normalizedMonth
                        );

                    if (!duePayment) {

                        throw new Error(
                            `${normalizedMonth} ${payYear} is no longer due.`
                        );
                    }

                    if (
                        duePayment.status !==
                        "DUE"
                    ) {

                        throw new Error(
                            `${normalizedMonth} ${payYear} is currently ${duePayment.status.toLowerCase()}.`
                        );
                    }

                    const ownMember =
                        members.find(
                            (member) =>
                                Number(
                                    member.id
                                ) ===
                                Number(
                                    data.member
                                )
                        ) ||
                        members.find(
                            (member) =>
                                Number(
                                    member.user
                                ) ===
                                Number(
                                    currentUser.id
                                )
                        ) ||
                        members[0];

                    if (!ownMember) {

                        throw new Error(
                            "Your member account could not be found."
                        );
                    }

                    setEditingId(null);

                    setFormData({

                        member:
                            String(
                                ownMember.id
                            ),

                        year:
                            Number(
                                duePayment.year
                            ),

                        month:
                            normalizeMonth(
                                duePayment.month_name
                            ),

                        amount:
                            Number(
                                duePayment.remaining_amount ??
                                duePayment.expected_amount ??
                                0
                            ).toFixed(2),

                        fine: "0",

                        extra: "0",

                        payment_date:
                            getTodayDate(),

                        remarks:
                            `Payment for ${duePayment.month_name} ${duePayment.year}`,
                    });

                    setShowForm(true);

                    setSearchParams(
                        {},
                        {
                            replace: true,
                        }
                    );

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });

                } catch (err) {

                    console.error(
                        "Error opening due payment:",
                        err
                    );

                    setError(
                        err.message ||
                        "Failed to open due payment."
                    );

                    setSearchParams(
                        {},
                        {
                            replace: true,
                        }
                    );

                } finally {

                    setLoadingDuePayment(
                        false
                    );
                }
            };

        openDuePayment();

    }, [
        currentUser,
        members,
        isAdmin,
        searchParams,
        setSearchParams,
    ]);


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    // =========================================================
    // OPEN ADD FORM
    // =========================================================

    const openAddForm = () => {

        setEditingId(null);

        const ownMember =
            members.find(
                (member) =>
                    Number(member.user) ===
                    Number(currentUser?.id)
            ) || members[0];

        setFormData({

            ...getEmptyForm(),

            member:
                !isAdmin && ownMember
                    ? String(
                          ownMember.id
                      )
                    : "",
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
    // RESET / CLOSE FORM
    // =========================================================

    const resetForm = () => {

        setFormData(
            getEmptyForm()
        );

        setEditingId(null);

        setMessage("");
        setError("");

        setShowForm(false);
    };


    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setMessage("");
        setError("");

        if (!formData.member) {

            setError(
                "Please select a member."
            );

            return;
        }

        if (!formData.year) {

            setError(
                "Please enter the year."
            );

            return;
        }

        if (!formData.month) {

            setError(
                "Please select a month."
            );

            return;
        }

        if (!formData.amount) {

            setError(
                "Please enter the amount."
            );

            return;
        }

        if (!formData.payment_date) {

            setError(
                "Please select the payment date."
            );

            return;
        }

        const amount =
            String(
                formData.amount
            ).replace(",", ".");

        const fine =
            String(
                formData.fine || "0"
            ).replace(",", ".");

        const extra =
            String(
                formData.extra || "0"
            ).replace(",", ".");

        const payload = {

            member:
                Number(
                    formData.member
                ),

            year:
                Number(
                    formData.year
                ),

            month:
                normalizeMonth(
                    formData.month
                ),

            amount,

            fine,

            extra,

            payment_date:
                formData.payment_date,

            remarks:
                formData.remarks,
        };

        try {

            setSaving(true);

            let response;

            // =================================================
            // UPDATE EXISTING DEPOSIT
            // =================================================

            if (editingId) {

                response =
                    await apiFetch(
                        `/deposits/${editingId}/`,
                        {
                            method: "PUT",
                            body:
                                JSON.stringify(
                                    payload
                                ),
                        }
                    );

            }

            // =================================================
            // CREATE NEW DEPOSIT
            // =================================================

            else {

                response =
                    await apiFetch(
                        "/deposits/",
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    payload
                                ),
                        }
                    );
            }

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );

            if (!response.ok) {

                console.error(
                    "Django error:",
                    data
                );

                throw new Error(
                    data.detail ||
                    JSON.stringify(data)
                );
            }

            if (editingId) {

                setMessage(
                    "Deposit updated successfully!"
                );

            } else if (isAdmin) {

                setMessage(
                    "Deposit added successfully!"
                );

            } else {

                setMessage(
                    "Payment submitted successfully! Waiting for admin approval."
                );
            }

            setFormData(
                getEmptyForm()
            );

            setEditingId(null);

            setShowForm(false);

            await loadDeposits();

            if (isAdmin && showOverview) {

                await loadMonthlyOverview();
            }

        } catch (err) {

            console.error(
                "Error saving deposit:",
                err
            );

            setError(
                `Failed to save deposit: ${err.message}`
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // EDIT DEPOSIT
    // =========================================================

    const handleEdit = (
        deposit
    ) => {

        if (!isAdmin) {
            return;
        }

        setEditingId(
            deposit.id
        );

        setFormData({

            member:
                String(
                    deposit.member
                ),

            year:
                deposit.year,

            month:
                normalizeMonth(
                    deposit.month
                ),

            amount:
                deposit.amount ??
                "",

            fine:
                deposit.fine ??
                "0",

            extra:
                deposit.extra ??
                "0",

            payment_date:
                deposit.payment_date ??
                "",

            remarks:
                deposit.remarks ??
                "",
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
    // DELETE DEPOSIT
    // =========================================================

    const handleDelete = async (
        id
    ) => {

        if (!isAdmin) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this deposit?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setMessage("");

            const response =
                await apiFetch(
                    `/deposits/${id}/`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {

                let data = {};

                try {

                    data =
                        await response.json();

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

            if (showOverview) {

                await loadMonthlyOverview();
            }

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
    // APPROVE / REJECT PAYMENT
    // =========================================================

    const handleStatusChange =
        async (
            id,
            status
        ) => {

            if (!isAdmin) {
                return;
            }

            const action =
                status === "APPROVED"
                    ? "approve"
                    : "reject";

            const confirmed =
                window.confirm(
                    `Are you sure you want to ${action} this payment?`
                );

            if (!confirmed) {
                return;
            }

            try {

                setError("");
                setMessage("");

                const response =
                    await apiFetch(
                        `/deposits/${id}/`,
                        {
                            method: "PATCH",

                            body:
                                JSON.stringify(
                                    {
                                        status,
                                    }
                                ),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        JSON.stringify(
                            data
                        )
                    );
                }

                setMessage(
                    status ===
                        "APPROVED"
                        ? "Payment approved successfully!"
                        : "Payment rejected successfully!"
                );

                await loadDeposits();

                if (showOverview) {

                    await loadMonthlyOverview();
                }

            } catch (err) {

                console.error(
                    "Error changing deposit status:",
                    err
                );

                setError(
                    `Failed to ${action} payment: ${err.message}`
                );
            }
        };


    // =========================================================
    // MEMBER NAME
    // =========================================================

    const getMemberName = (
        deposit
    ) => {

        if (deposit.member_name) {
            return deposit.member_name;
        }

        const member =
            members.find(
                (item) =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        deposit.member
                    )
            );

        if (member) {

            return `${member.first_name} ${member.last_name}`;
        }

        return `Member #${deposit.member}`;
    };


    // =========================================================
    // OVERVIEW FILTER
    // =========================================================

    const handleOverviewLoad = async () => {

        await loadMonthlyOverview(
            Number(
                overviewYear
            ),
            Number(
                overviewMonth
            )
        );
    };


    // =========================================================
    // APPROVED / PENDING PAYMENTS
    // =========================================================

    const approvedDeposits =
        deposits.filter(
            (deposit) =>
                deposit.status ===
                "APPROVED"
        );

    const pendingDeposits =
        deposits.filter(
            (deposit) =>
                deposit.status ===
                "PENDING"
        );


    // =========================================================
    // FINANCIAL TOTALS
    // =========================================================

    const totalAmount =
        approvedDeposits.reduce(
            (
                total,
                deposit
            ) =>
                total +
                Number(
                    deposit.amount ||
                    0
                ),
            0
        );

    const totalFine =
        approvedDeposits.reduce(
            (
                total,
                deposit
            ) =>
                total +
                Number(
                    deposit.fine ||
                    0
                ),
            0
        );

    const totalExtra =
        approvedDeposits.reduce(
            (
                total,
                deposit
            ) =>
                total +
                Number(
                    deposit.extra ||
                    0
                ),
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

                        <h1>
                            {isAdmin
                                ? "Deposits"
                                : "My Deposits"}
                        </h1>

                        <p>
                            Loading
                            deposits...
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

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        {isAdmin
                            ? "Deposits"
                            : "My Deposits"}
                    </h1>

                    <p>
                        {isAdmin
                            ? "Manage member deposits and payment records."
                            : "View and submit your payment records."}
                    </p>

                </div>

                {!showForm && (

                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openAddForm
                        }
                    >
                        + Add Deposit
                    </button>

                )}

            </div>


            {/* =================================================
                PAY NOW LOADING
            ================================================= */}

            {loadingDuePayment && (

                <div className="success-message">
                    Preparing your payment...
                </div>

            )}


            {/* =================================================
                MESSAGES
            ================================================= */}

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


            {/* =================================================
                ADMIN MONTHLY PAYMENT OVERVIEW
            ================================================= */}

            {isAdmin && (

                <div className="content-card">

                    {/* =================================================
                        COLLAPSIBLE HEADER
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() => {

                            setShowOverview(
                                (previous) =>
                                    !previous
                            );

                            setOverviewError("");

                        }}
                        style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                    >

                        <div
                            className="card-header"
                            style={{
                                marginBottom:
                                    showOverview
                                        ? "20px"
                                        : "0",
                            }}
                        >

                            <div>

                                <h2>
                                    Monthly Payment Overview
                                </h2>

                                <p>
                                    {showOverview
                                        ? "Select a month to check the payment status of every member."
                                        : "Click to view the monthly payment statement."}
                                </p>

                            </div>


                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "8px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    flexShrink: 0,
                                }}
                            >
                                {showOverview
                                    ? "⌃"
                                    : "⌄"}
                            </span>

                        </div>

                    </button>


                    {/* =================================================
                        COLLAPSIBLE CONTENT
                    ================================================= */}

                    {showOverview && (

                        <>

                            {/* =================================================
                                FILTERS
                            ================================================= */}

                            <div className="filters">

                                <div className="filter-group">

                                    <label htmlFor="overview-year">
                                        Year
                                    </label>

                                    <select
                                        id="overview-year"
                                        value={
                                            overviewYear
                                        }
                                        onChange={(
                                            event
                                        ) => {

                                            setOverviewYear(
                                                event.target.value
                                            );

                                            setOverview(
                                                null
                                            );

                                            setOverviewError(
                                                ""
                                            );

                                        }}
                                    >

                                        {Array.from(
                                            {
                                                length: 10,
                                            },
                                            (
                                                _,
                                                index
                                            ) =>
                                                new Date().getFullYear() -
                                                index
                                        ).map(
                                            (
                                                year
                                            ) => (

                                                <option
                                                    key={
                                                        year
                                                    }
                                                    value={
                                                        year
                                                    }
                                                >
                                                    {
                                                        year
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="filter-group">

                                    <label htmlFor="overview-month">
                                        Month
                                    </label>

                                    <select
                                        id="overview-month"
                                        value={
                                            overviewMonth
                                        }
                                        onChange={(
                                            event
                                        ) => {

                                            setOverviewMonth(
                                                event.target.value
                                            );

                                            setOverview(
                                                null
                                            );

                                            setOverviewError(
                                                ""
                                            );

                                        }}
                                    >

                                        {MONTHS.map(
                                            (
                                                month,
                                                index
                                            ) => (

                                                <option
                                                    key={
                                                        month
                                                    }
                                                    value={
                                                        index + 1
                                                    }
                                                >
                                                    {
                                                        month
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="filter-action">

                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            handleOverviewLoad
                                        }
                                        disabled={
                                            loadingOverview
                                        }
                                    >
                                        {loadingOverview
                                            ? "Loading..."
                                            : "Load Overview"}
                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                OVERVIEW ERROR
                            ================================================= */}

                            {overviewError && (

                                <div className="login-error">
                                    {overviewError}
                                </div>

                            )}


                            {/* =================================================
                                OVERVIEW LOADING
                            ================================================= */}

                            {loadingOverview && !overview && (

                                <div
                                    style={{
                                        padding: "35px 20px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    Loading monthly payment overview...
                                </div>

                            )}


                            {/* =================================================
                                OVERVIEW
                            ================================================= */}

                            {overview && (

                                <>

                                    {/* MONTH HEADER */}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "20px",
                                            marginBottom: "20px",
                                            padding: "18px 20px",
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "10px",
                                        }}
                                    >

                                        <div>

                                            <div
                                                style={{
                                                    color: "#334155",
                                                    fontSize: "16px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {
                                                    overview.month_name
                                                }{" "}
                                                {
                                                    overview.year
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "4px",
                                                    color: "#64748b",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                Expected contribution per member
                                            </div>

                                        </div>

                                        <strong
                                            style={{
                                                color: "#1e293b",
                                                fontSize: "22px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {overview.expected_amount !==
                                            null
                                                ? `€ ${Number(
                                                      overview.expected_amount
                                                  ).toLocaleString(
                                                      "de-DE",
                                                      {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                      }
                                                  )}`
                                                : "No rate"}
                                        </strong>

                                    </div>


                                    {/* OVERVIEW SUMMARY */}

                                    <div className="deposit-summary-grid">

                                        <div className="deposit-summary-card">

                                            <span>
                                                Total Members
                                            </span>

                                            <strong>
                                                {
                                                    overview.summary
                                                        .total_members
                                                }
                                            </strong>

                                            <small>
                                                Members in society
                                            </small>

                                        </div>


                                        <div className="deposit-summary-card">

                                            <span>
                                                Paid
                                            </span>

                                            <strong>
                                                {
                                                    overview.summary
                                                        .paid
                                                }
                                            </strong>

                                            <small>
                                                Fully paid
                                            </small>

                                        </div>


                                        <div className="deposit-summary-card">

                                            <span>
                                                Pending
                                            </span>

                                            <strong>
                                                {
                                                    overview.summary
                                                        .pending
                                                }
                                            </strong>

                                            <small>
                                                Awaiting approval
                                            </small>

                                        </div>


                                        <div className="deposit-summary-card">

                                            <span>
                                                Due
                                            </span>

                                            <strong>
                                                {
                                                    overview.summary
                                                        .due
                                                }
                                            </strong>

                                            <small>
                                                No payment received
                                            </small>

                                        </div>

                                    </div>


                                    {/* PARTIAL NOTICE */}

                                    {overview.summary.partial >
                                        0 && (

                                        <div
                                            style={{
                                                marginBottom: "18px",
                                                padding: "12px 14px",
                                                border: "1px solid #fed7aa",
                                                borderRadius: "8px",
                                                background: "#fff7ed",
                                                color: "#c2410c",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {
                                                overview.summary
                                                    .partial
                                            }{" "}
                                            member
                                            {
                                                overview.summary
                                                    .partial !==
                                                1
                                                    ? "s have"
                                                    : " has"
                                            }{" "}
                                            a partial payment.
                                        </div>

                                    )}


                                    {/* MEMBER PAYMENT TABLE */}

                                    <div className="table-wrapper">

                                        <table className="data-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Member
                                                    </th>

                                                    <th>
                                                        Expected
                                                    </th>

                                                    <th>
                                                        Paid
                                                    </th>

                                                    <th>
                                                        Pending
                                                    </th>

                                                    <th>
                                                        Remaining
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {overview.members.map(
                                                    (
                                                        member
                                                    ) => (

                                                        <tr
                                                            key={
                                                                member.member_id
                                                            }
                                                        >

                                                            <td>

                                                                <div className="member-name">
                                                                    {
                                                                        member.member_name
                                                                    }
                                                                </div>

                                                            </td>

                                                            <td>
                                                                €{" "}
                                                                {Number(
                                                                    member.expected_amount
                                                                ).toLocaleString(
                                                                    "de-DE",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                            <td>
                                                                €{" "}
                                                                {Number(
                                                                    member.paid_amount
                                                                ).toLocaleString(
                                                                    "de-DE",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                            <td>
                                                                €{" "}
                                                                {Number(
                                                                    member.pending_amount
                                                                ).toLocaleString(
                                                                    "de-DE",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                            <td>
                                                                €{" "}
                                                                {Number(
                                                                    member.remaining_amount
                                                                ).toLocaleString(
                                                                    "de-DE",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                            <td>

                                                                <span
                                                                    className={getOverviewStatusClass(
                                                                        member.status
                                                                    )}
                                                                >
                                                                    {
                                                                        getOverviewStatusLabel(
                                                                            member.status
                                                                        )
                                                                    }
                                                                </span>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </>

                            )}

                        </>

                    )}

                </div>

            )}


            {/* =================================================
                EXISTING SUMMARY CARDS
            ================================================= */}

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
                            {
                                approvedDeposits.length
                            }
                        </strong>

                        <small>
                            Approved payments
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

                            <path d="M12 7v10" />

                            <path d="M15 9.5c0-1-1.3-1.5-3-1.5s-3 .5-3 1.5 1 1.5 3 2 3 1 3 2-1.3 1.5-3 1.5-3-.5-3-1.5" />

                        </svg>

                    </div>

                    <div className="deposit-summary-content">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            {totalAmount.toFixed(
                                2
                            )}
                        </strong>

                        <small>
                            Approved amount
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

                            <path d="M12 3l9 17H3L12 3z" />

                            <path d="M12 9v5" />

                            <path d="M12 17h.01" />

                        </svg>

                    </div>

                    <div className="deposit-summary-content">

                        <span>
                            Total Fine
                        </span>

                        <strong>
                            {totalFine.toFixed(
                                2
                            )}
                        </strong>

                        <small>
                            Approved fines
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
                                x="4"
                                y="3"
                                width="16"
                                height="18"
                                rx="2"
                            />

                            <path d="M8 7h8" />
                            <path d="M8 11h8" />
                            <path d="M8 15h2" />
                            <path d="M12 15h4" />

                        </svg>

                    </div>

                    <div className="deposit-summary-content">

                        <span>
                            Grand Total
                        </span>

                        <strong>
                            {grandTotal.toFixed(
                                2
                            )}
                        </strong>

                        <small>
                            Approved total
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                ADD / EDIT FORM
            ================================================= */}

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
                                    : isAdmin
                                    ? "Enter the payment information below."
                                    : "Submit a payment for admin approval."}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                resetForm
                            }
                        >
                            Close Form
                        </button>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="form-grid">

                            {/* MEMBER */}

                            <div className="form-group">

                                <label htmlFor="deposit-member">
                                    Member
                                </label>

                                <select
                                    id="deposit-member"
                                    name="member"
                                    value={
                                        formData.member
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        !isAdmin
                                    }
                                >

                                    <option value="">
                                        Select Member
                                    </option>

                                    {members.map(
                                        (
                                            member
                                        ) => (

                                            <option
                                                key={
                                                    member.id
                                                }
                                                value={
                                                    member.id
                                                }
                                            >
                                                {
                                                    member.first_name
                                                }{" "}
                                                {
                                                    member.last_name
                                                }
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
                                    value={
                                        formData.year
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                    value={
                                        formData.month
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Month
                                    </option>

                                    {MONTHS.map(
                                        (
                                            month
                                        ) => (

                                            <option
                                                key={
                                                    month
                                                }
                                                value={
                                                    month
                                                }
                                            >
                                                {
                                                    month
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* PAYMENT DATE */}

                            <div className="form-group">

                                <label htmlFor="deposit-payment-date">
                                    Payment Date
                                </label>

                                <input
                                    id="deposit-payment-date"
                                    type="date"
                                    name="payment_date"
                                    value={
                                        formData.payment_date
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                    value={
                                        formData.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                    value={
                                        formData.fine
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                    value={
                                        formData.extra
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                    value={
                                        formData.remarks
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Optional remarks..."
                                />

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={
                                    saving
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Deposit"
                                    : isAdmin
                                    ? "Add Deposit"
                                    : "Submit Payment"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                DEPOSIT LIST
            ================================================= */}

            <div className="content-card">

                <div className="card-header">

                    <div>

                        <h2>
                            {isAdmin
                                ? "Deposit List"
                                : "My Payment History"}
                        </h2>

                        <p>
                            {
                                deposits.length
                            }{" "}
                            payment
                            {
                                deposits.length !==
                                1
                                    ? "s"
                                    : ""
                            }
                        </p>

                    </div>

                </div>


                {deposits.length ===
                0 ? (

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

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Member
                                    </th>

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
                                        Total
                                    </th>

                                    <th>
                                        Payment Date
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

                                {deposits.map(
                                    (
                                        deposit
                                    ) => {

                                        const total =
                                            Number(
                                                deposit.amount ||
                                                0
                                            ) +
                                            Number(
                                                deposit.fine ||
                                                0
                                            ) +
                                            Number(
                                                deposit.extra ||
                                                0
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

                                                    <span
                                                        className={getStatusClass(
                                                            deposit.status
                                                        )}
                                                    >
                                                        {getStatusLabel(
                                                            deposit.status
                                                        )}
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="table-actions">

                                                        {isAdmin ? (

                                                            deposit.status ===
                                                            "PENDING" ? (

                                                                <>

                                                                    <button
                                                                        type="button"
                                                                        className="table-button"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                deposit.id,
                                                                                "APPROVED"
                                                                            )
                                                                        }
                                                                    >
                                                                        Approve
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="table-button table-button-danger"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                deposit.id,
                                                                                "REJECTED"
                                                                            )
                                                                        }
                                                                    >
                                                                        Reject
                                                                    </button>

                                                                </>

                                                            ) : (

                                                                <>

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

                                                                </>

                                                            )

                                                        ) : (

                                                            <span className="table-muted">
                                                                View only
                                                            </span>

                                                        )}

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