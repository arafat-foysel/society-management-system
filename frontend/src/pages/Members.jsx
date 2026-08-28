import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../services/api";

const ROLE_OPTIONS = [
    "President",
    "Secretary",
    "Treasurer",
    "Executive Member",
    "General Member",
];

const STATUS_OPTIONS = ["Active", "Inactive"];

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nid_number: "",
    father_name: "",
    mother_name: "",
    address: "",
    joining_date: "",
    entry_fee: "",
    role: "General Member",
    status: "Active",
};

function Members() {
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);

    const [formData, setFormData] = useState(EMPTY_FORM);

    const [editingMember, setEditingMember] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [roleFilter, setRoleFilter] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/members/");

            console.log("Members API status:", response.status);

            const data = await response.json();

            console.log("Members API response:", data);

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    JSON.stringify(data) ||
                    "Failed to load members."
                );
            }

            setMembers(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Error loading members:", err);

            setError(
                err.message || "Failed to load members."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function resetForm() {
        setFormData(EMPTY_FORM);
        setEditingMember(null);
        setShowForm(false);
    }

    function openAddForm() {
        setEditingMember(null);
        setFormData(EMPTY_FORM);
        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function startEdit(member) {
        setEditingMember(member);

        setFormData({
            first_name: member.first_name || "",
            last_name: member.last_name || "",
            email: member.email || "",
            phone: member.phone || "",
            nid_number: member.nid_number || "",
            father_name: member.father_name || "",
            mother_name: member.mother_name || "",
            address: member.address || "",
            joining_date: member.joining_date || "",
            entry_fee: member.entry_fee || "",
            role: member.role || "General Member",
            status: member.status || "Active",
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function viewMember(member) {
        navigate(`/members/${member.id}/`);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const endpoint = editingMember
                ? `/members/${editingMember.id}/`
                : "/members/";

            const method = editingMember ? "PUT" : "POST";

            const response = await apiFetch(endpoint, {
                method,
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Member API error:", data);

                const message =
                    typeof data === "object"
                        ? Object.entries(data)
                              .map(([field, messages]) => {
                                  const text = Array.isArray(messages)
                                      ? messages.join(", ")
                                      : messages;

                                  return `${field}: ${text}`;
                              })
                              .join(" | ")
                        : "Failed to save member.";

                throw new Error(message);
            }

            if (editingMember) {
                setMembers((previous) =>
                    previous.map((member) =>
                        member.id === editingMember.id
                            ? data
                            : member
                    )
                );

                setSuccess("Member updated successfully.");
            } else {
                setMembers((previous) => [
                    ...previous,
                    data,
                ]);

                setSuccess("Member created successfully.");
            }

            setFormData(EMPTY_FORM);
            setEditingMember(null);
            setShowForm(false);
        } catch (err) {
            console.error("Error saving member:", err);

            setError(
                err.message || "Failed to save member."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteMember(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await apiFetch(
                `/members/${id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.detail ||
                    "Failed to delete member."
                );
            }

            setMembers((previous) =>
                previous.filter(
                    (member) => member.id !== id
                )
            );

            if (editingMember?.id === id) {
                resetForm();
            }

            setSuccess("Member deleted successfully.");
        } catch (err) {
            console.error("Error deleting member:", err);

            setError(
                err.message || "Failed to delete member."
            );
        }
    }

    const filteredMembers = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        return members.filter((member) => {
            const fullName =
                `${member.first_name || ""} ${
                    member.last_name || ""
                }`.toLowerCase();

            const matchesSearch =
                !search ||
                fullName.includes(search) ||
                (member.email || "")
                    .toLowerCase()
                    .includes(search) ||
                (member.phone || "")
                    .toLowerCase()
                    .includes(search) ||
                (member.nid_number || "")
                    .toLowerCase()
                    .includes(search);

            const matchesRole =
                !roleFilter ||
                member.role === roleFilter;

            const matchesStatus =
                !statusFilter ||
                member.status === statusFilter;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [
        members,
        searchTerm,
        roleFilter,
        statusFilter,
    ]);

    function clearFilters() {
        setSearchTerm("");
        setRoleFilter("");
        setStatusFilter("");
    }

    return (
        <div className="page members-page">

            {/* PAGE HEADER */}

            <div className="page-header">

                <div>
                    <h1>Members</h1>

                    <p>
                        Manage society members and
                        their information.
                    </p>
                </div>

                {!showForm && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={openAddForm}
                    >
                        + Add Member
                    </button>
                )}

            </div>


            {/* SUCCESS MESSAGE */}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}


            {/* ERROR MESSAGE */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="content-card">

                    <div className="card-header">

                        <div>
                            <h2>
                                {editingMember
                                    ? "Edit Member"
                                    : "Add Member"}
                            </h2>

                            <p>
                                {editingMember
                                    ? "Update member information."
                                    : "Enter the member's information below."}
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

                            <div className="form-group">
                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="nid_number">
                                    NID Number
                                </label>

                                <input
                                    id="nid_number"
                                    name="nid_number"
                                    type="text"
                                    value={formData.nid_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="father_name">
                                    Father Name
                                </label>

                                <input
                                    id="father_name"
                                    name="father_name"
                                    type="text"
                                    value={formData.father_name}
                                    onChange={handleInputChange}
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="mother_name">
                                    Mother Name
                                </label>

                                <input
                                    id="mother_name"
                                    name="mother_name"
                                    type="text"
                                    value={formData.mother_name}
                                    onChange={handleInputChange}
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="joining_date">
                                    Joining Date
                                </label>

                                <input
                                    id="joining_date"
                                    name="joining_date"
                                    type="date"
                                    value={formData.joining_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="entry_fee">
                                    Entry Fee
                                </label>

                                <input
                                    id="entry_fee"
                                    name="entry_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.entry_fee}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="role">
                                    Role
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {ROLE_OPTIONS.map(
                                        (role) => (
                                            <option
                                                key={role}
                                                value={role}
                                            >
                                                {role}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="form-group">
                                <label htmlFor="status">
                                    Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {STATUS_OPTIONS.map(
                                        (status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="form-group form-group-full">
                                <label htmlFor="address">
                                    Address
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    rows="4"
                                    value={formData.address}
                                    onChange={handleInputChange}
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
                                    : editingMember
                                    ? "Update Member"
                                    : "Add Member"}
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


            {/* MEMBER LIST */}

            <div className="content-card">

                <div className="card-header">

                    <div>
                        <h2>Member List</h2>

                        <p>
                            Showing{" "}
                            <strong>
                                {filteredMembers.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {members.length}
                            </strong>{" "}
                            members
                        </p>
                    </div>

                </div>


                {/* FILTERS */}

                <div className="filters">

                    <div className="filter-group search-filter">

                        <label htmlFor="member-search">
                            Search
                        </label>

                        <input
                            id="member-search"
                            type="text"
                            placeholder="Search by name, email, phone or NID..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="filter-group">

                        <label htmlFor="role-filter">
                            Role
                        </label>

                        <select
                            id="role-filter"
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                All Roles
                            </option>

                            {ROLE_OPTIONS.map(
                                (role) => (
                                    <option
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </option>
                                )
                            )}
                        </select>

                    </div>


                    <div className="filter-group">

                        <label htmlFor="status-filter">
                            Status
                        </label>

                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                All Statuses
                            </option>

                            {STATUS_OPTIONS.map(
                                (status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>
                                )
                            )}
                        </select>

                    </div>


                    <div className="filter-action">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>


                {/* TABLE */}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading members...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="empty-state">
                        <h3>No members found</h3>

                        <p>
                            Try changing your search
                            or filters.
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredMembers.map(
                                    (member) => (
                                        <tr
                                            key={member.id}
                                        >

                                            <td>
                                                {member.id}
                                            </td>

                                            <td>
                                                <div className="member-name">
                                                    {member.first_name}{" "}
                                                    {member.last_name}
                                                </div>
                                            </td>

                                            <td>
                                                {member.email || "-"}
                                            </td>

                                            <td>
                                                {member.phone}
                                            </td>

                                            <td>
                                                <span className="role-badge">
                                                    {member.role}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        member.status ===
                                                        "Active"
                                                            ? "status-badge status-active"
                                                            : "status-badge status-inactive"
                                                    }
                                                >
                                                    {member.status}
                                                </span>
                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        className="table-button"
                                                        onClick={() =>
                                                            viewMember(
                                                                member
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-button"
                                                        onClick={() =>
                                                            startEdit(
                                                                member
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-button table-button-danger"
                                                        onClick={() =>
                                                            deleteMember(
                                                                member.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

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

export default Members;