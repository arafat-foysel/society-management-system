import { useState } from "react";

function MemberForm({ onMemberAdded }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [nidNumber, setNidNumber] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        const newMember = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,

            nid_number: nidNumber,

            father_name: "Test Father",
            mother_name: "Test Mother",
            address: "Test Address",
            joining_date: "2026-08-23",
            entry_fee: "500.00",
            role: "Executive Member",
            status: "Active",
        };

        fetch("http://127.0.0.1:8000/api/members/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newMember),
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    console.error("Django error:", data);

                    throw new Error(JSON.stringify(data));
                }

                return data;
            })
            .then((data) => {
                console.log("Member created:", data);

                // Tell the parent component about the new member
                onMemberAdded(data);

                // Clear form
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setNidNumber("");
            })
            .catch((error) => {
                console.error("Error creating member:", error);
                setError("Failed to create member. Check the console.");
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Member</h2>

            <div>
                <label>First Name</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                        setFirstName(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Last Name</label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                        setLastName(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Phone</label>
                <input
                    type="text"
                    value={phone}
                    onChange={(event) =>
                        setPhone(event.target.value)
                    }
                />
            </div>

            <div>
                <label>NID Number</label>
                <input
                    type="text"
                    value={nidNumber}
                    onChange={(event) =>
                        setNidNumber(event.target.value)
                    }
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">
                Add Member
            </button>
        </form>
    );
}

export default MemberForm;