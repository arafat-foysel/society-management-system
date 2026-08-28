import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";


// ===============================
// ICON COMPONENT
// ===============================

function Icon({ type }) {
    const icons = {
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
            </>
        ),

        userCircle: (
            <>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="9" r="3" />
                <path d="M7.5 19c.8-2.3 2.3-3.5 4.5-3.5s3.7 1.2 4.5 3.5" />
            </>
        ),

        email: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </>
        ),

        phone: (
            <>
                <path d="M6.5 3.5 9 3l2 5-2.2 1.5a15 15 0 0 0 3.2 3.2L13.5 11l5 2 .5 2.5c.3 1.5-.9 2.9-2.4 2.8C9.7 17.8 6.2 14.3 5.7 7.4 5.6 5.9 5 4.5 6.5 3.5Z" />
            </>
        ),

        id: (
            <>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
            </>
        ),

        family: (
            <>
                <circle cx="9" cy="8" r="3" />
                <circle cx="16" cy="10" r="2.5" />
                <path d="M3.5 20c0-4 2.3-6 5.5-6s5.5 2 5.5 6" />
                <path d="M14 15c2.5-.3 5 1.2 5 4" />
            </>
        ),

        calendar: (
            <>
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <path d="M8 3v4M16 3v4M4 10h16" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
            </>
        ),

        money: (
            <>
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <circle cx="12" cy="12.5" r="3" />
                <path d="M7 9h.01M17 16h.01" />
            </>
        ),

        crown: (
            <>
                <path d="m4 8 3 3 5-6 5 6 3-3-2 11H6L4 8Z" />
                <path d="M6 20h12" />
            </>
        ),

        shield: (
            <>
                <path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),

        location: (
            <>
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),

        document: (
            <>
                <path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M14 3v5h5M8 12h8M8 16h6" />
            </>
        ),

        dollar: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .9-3 2.2 0 3.3 6 1.4 6 4.7 0 1.4-1.3 2.3-3 2.3-1.3 0-2.4-.4-3.2-1.2" />
                <path d="M12 6v12" />
            </>
        ),

        warning: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6M12 16v.01" />
            </>
        ),

        calculator: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <rect x="8" y="6" width="8" height="4" rx="1" />
                <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
            </>
        ),

        edit: (
            <>
                <path d="m14 5 5 5" />
                <path d="M4 20l1.5-5.5L15.5 4.5a2.1 2.1 0 0 1 3 3L8.5 18.5 4 20Z" />
            </>
        ),
    };

    return (
        <svg
            className="member-detail-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[type]}
        </svg>
    );
}


// ===============================
// MEMBER DETAILS
// ===============================

function MemberDetails() {

    const { id } = useParams();

    const [member, setMember] = useState(null);
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ===============================
    // LOAD MEMBER + DEPOSITS
    // ===============================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");

                const [memberResponse, depositsResponse] =
                    await Promise.all([
                        apiFetch(`/members/${id}/`),
                        apiFetch("/deposits/"),
                    ]);


                if (!memberResponse.ok) {
                    throw new Error("Failed to load member.");
                }

                if (!depositsResponse.ok) {
                    throw new Error("Failed to load deposits.");
                }


                const memberData =
                    await memberResponse.json();

                const depositsData =
                    await depositsResponse.json();


                setMember(memberData);


                const allDeposits =
                    Array.isArray(depositsData)
                        ? depositsData
                        : depositsData.results || [];


                const memberDeposits =
                    allDeposits.filter(
                        (deposit) =>
                            Number(deposit.member) === Number(id)
                    );


                setDeposits(memberDeposits);

            } catch (err) {

                console.error(
                    "Error loading member details:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load member details."
                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, [id]);


    // ===============================
    // LOADING
    // ===============================

    if (loading) {

        return (
            <div className="page">
                <div className="member-details-loading">
                    Loading member details...
                </div>
            </div>
        );

    }


    // ===============================
    // ERROR
    // ===============================

    if (error) {

        return (
            <div className="page">

                <div className="page-header">

                    <div>
                        <h1>Member Details</h1>

                        <p className="error-message">
                            {error}
                        </p>
                    </div>

                </div>

                <Link
                    to="/members"
                    className="secondary-button"
                >
                    ← Back to Members
                </Link>

            </div>
        );

    }


    if (!member) {

        return (
            <div className="page">

                <div className="page-header">
                    <h1>Member Details</h1>
                </div>

                <p>Member not found.</p>

                <Link
                    to="/members"
                    className="secondary-button"
                >
                    ← Back to Members
                </Link>

            </div>
        );

    }


    // ===============================
    // CALCULATIONS
    // ===============================

    const totalAmount = deposits.reduce(
        (sum, deposit) =>
            sum + Number(deposit.amount || 0),
        0
    );


    const totalFine = deposits.reduce(
        (sum, deposit) =>
            sum + Number(deposit.fine || 0),
        0
    );


    const totalExtra = deposits.reduce(
        (sum, deposit) =>
            sum + Number(deposit.extra || 0),
        0
    );


    const grandTotal =
        totalAmount +
        totalFine +
        totalExtra;


    // ===============================
    // MEMBER FIELD
    // ===============================

    const MemberField = ({
        icon,
        label,
        value,
        className = "",
    }) => (

        <div className={`member-info-item ${className}`}>

            <div className="member-info-icon">

                <Icon type={icon} />

            </div>

            <div className="member-info-content">

                <div className="member-info-label">
                    {label}
                </div>

                <div className="member-info-value">

                    {value || "N/A"}

                </div>

            </div>

        </div>

    );


    // ===============================
    // PAGE
    // ===============================

    return (

        <div className="page member-details-page">


            {/* =========================
                TOP ACTIONS
            ========================== */}

            <div className="member-details-actions">

                <Link
                    to="/members"
                    className="secondary-button"
                >
                    ← Back to Members
                </Link>


                <Link
                    to={`/members/${member.id}/edit`}
                    className="primary-button"
                >

                    <Icon type="edit" />

                    Edit Member

                </Link>

            </div>


            {/* =========================
                MEMBER INFORMATION
            ========================== */}

            <div className="member-details-card">

                <div className="member-details-card-header">

                    <div>

                        <h1>Member Information</h1>

                        <p>
                            Complete information about this member.
                        </p>

                    </div>

                </div>


                <div className="member-information-grid">


                    <MemberField
                        icon="user"
                        label="First Name"
                        value={member.first_name}
                    />


                    <MemberField
                        icon="userCircle"
                        label="Last Name"
                        value={member.last_name}
                    />


                    <MemberField
                        icon="email"
                        label="Email"
                        value={member.email}
                    />


                    <MemberField
                        icon="phone"
                        label="Phone"
                        value={member.phone}
                    />


                    <MemberField
                        icon="id"
                        label="NID Number"
                        value={member.nid_number}
                    />


                    <MemberField
                        icon="family"
                        label="Mother Name"
                        value={member.mother_name}
                    />


                    <MemberField
                        icon="family"
                        label="Father Name"
                        value={member.father_name}
                    />


                    <MemberField
                        icon="money"
                        label="Entry Fee"
                        value={
                            member.entry_fee !== null &&
                            member.entry_fee !== undefined
                                ? Number(member.entry_fee).toFixed(2)
                                : "0.00"
                        }
                    />


                    <MemberField
                        icon="calendar"
                        label="Joining Date"
                        value={member.joining_date}
                    />


                    <MemberField
                        icon="shield"
                        label="Status"
                        value={member.status}
                    />


                    <MemberField
                        icon="crown"
                        label="Role"
                        value={member.role}
                    />


                    <MemberField
                        icon="location"
                        label="Address"
                        value={member.address}
                        className="member-info-full"
                    />


                </div>

            </div>


            {/* =========================
                DEPOSIT SUMMARY
            ========================== */}

            <div className="member-summary-grid">


                {/* Total Deposits */}

                <div className="member-summary-card">

                    <div className="summary-icon summary-icon-blue">

                        <Icon type="document" />

                    </div>

                    <div>

                        <div className="summary-label">
                            Total Deposits
                        </div>

                        <div className="summary-number">
                            {deposits.length}
                        </div>

                        <div className="summary-description">
                            Payment records
                        </div>

                    </div>

                </div>


                {/* Total Amount */}

                <div className="member-summary-card">

                    <div className="summary-icon summary-icon-green">

                        <Icon type="dollar" />

                    </div>

                    <div>

                        <div className="summary-label">
                            Total Amount
                        </div>

                        <div className="summary-number">
                            {totalAmount.toFixed(2)}
                        </div>

                        <div className="summary-description">
                            Deposit amount
                        </div>

                    </div>

                </div>


                {/* Total Fine */}

                <div className="member-summary-card">

                    <div className="summary-icon summary-icon-orange">

                        <Icon type="warning" />

                    </div>

                    <div>

                        <div className="summary-label">
                            Total Fine
                        </div>

                        <div className="summary-number">
                            {totalFine.toFixed(2)}
                        </div>

                        <div className="summary-description">
                            Collected fines
                        </div>

                    </div>

                </div>


                {/* Grand Total */}

                <div className="member-summary-card">

                    <div className="summary-icon summary-icon-purple">

                        <Icon type="calculator" />

                    </div>

                    <div>

                        <div className="summary-label">
                            Grand Total
                        </div>

                        <div className="summary-number">
                            {grandTotal.toFixed(2)}
                        </div>

                        <div className="summary-description">
                            Total paid
                        </div>

                    </div>

                </div>


            </div>


            {/* =========================
                DEPOSIT HISTORY
            ========================== */}

            <div className="member-deposit-card">


                <div className="member-deposit-header">

                    <h2>Deposit History</h2>

                    <Link to="/deposits">
                        View All
                    </Link>

                </div>


                {deposits.length === 0 ? (

                    <div className="member-empty-deposits">

                        <div className="empty-deposit-icon">

                            <Icon type="document" />

                        </div>

                        <strong>
                            No deposits found for this member.
                        </strong>

                        <span>
                            Deposit records will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="dashboard-table">

                            <thead>

                                <tr>

                                    <th>Year</th>

                                    <th>Month</th>

                                    <th>Amount</th>

                                    <th>Fine</th>

                                    <th>Extra</th>

                                    <th>Total</th>

                                    <th>Payment Date</th>

                                    <th>Remarks</th>

                                </tr>

                            </thead>


                            <tbody>

                                {deposits.map((deposit) => {

                                    const amount =
                                        Number(
                                            deposit.amount || 0
                                        );

                                    const fine =
                                        Number(
                                            deposit.fine || 0
                                        );

                                    const extra =
                                        Number(
                                            deposit.extra || 0
                                        );

                                    const total =
                                        amount +
                                        fine +
                                        extra;


                                    return (

                                        <tr
                                            key={deposit.id}
                                        >

                                            <td>
                                                {deposit.year}
                                            </td>

                                            <td>
                                                {deposit.month}
                                            </td>

                                            <td>
                                                {amount.toFixed(2)}
                                            </td>

                                            <td>
                                                {fine.toFixed(2)}
                                            </td>

                                            <td>
                                                {extra.toFixed(2)}
                                            </td>

                                            <td>
                                                <strong>
                                                    {total.toFixed(2)}
                                                </strong>
                                            </td>

                                            <td>
                                                {deposit.payment_date || "-"}
                                            </td>

                                            <td>
                                                {deposit.remarks || "-"}
                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


        </div>

    );
}


export default MemberDetails;