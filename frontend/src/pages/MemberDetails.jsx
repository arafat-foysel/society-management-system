import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function MemberDetails() {

    const { id } = useParams();

    const [member, setMember] = useState(null);
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadData = async () => {

            try {

                const [memberResponse, depositsResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/members/${id}/`),
                        fetch(`${API_URL}/deposits/`),
                    ]);

                const memberData =
                    await memberResponse.json();

                const depositsData =
                    await depositsResponse.json();

                setMember(memberData);

                const allDeposits =
                    depositsData.results || depositsData;

                const memberDeposits =
                    allDeposits.filter(
                        (deposit) =>
                            Number(deposit.member) === Number(id)
                    );

                setDeposits(memberDeposits);

            } catch (error) {

                console.error(
                    "Error loading member:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadData();

    }, [id]);


    if (loading) {
        return <h1>Loading...</h1>;
    }


    if (!member) {
        return <h1>Member not found</h1>;
    }


    const totalPaid = deposits.reduce(
        (sum, deposit) =>
            sum + Number(deposit.amount || 0),
        0
    );

    const totalFine = deposits.reduce(
        (sum, deposit) =>
            sum + Number(deposit.fine || 0),
        0
    );


    return (

        <div>

            <h1>Member Details</h1>

            <Link to="/members">
                ← Back to Members
            </Link>


            <h2>
                {member.first_name} {member.last_name}
            </h2>


            <p>
                <strong>Email:</strong>{" "}
                {member.email || "N/A"}
            </p>

            <p>
                <strong>Phone:</strong>{" "}
                {member.phone}
            </p>

            <p>
                <strong>NID:</strong>{" "}
                {member.nid_number}
            </p>

            <p>
                <strong>Father:</strong>{" "}
                {member.father_name || "N/A"}
            </p>

            <p>
                <strong>Mother:</strong>{" "}
                {member.mother_name || "N/A"}
            </p>

            <p>
                <strong>Address:</strong>{" "}
                {member.address || "N/A"}
            </p>

            <p>
                <strong>Joining Date:</strong>{" "}
                {member.joining_date}
            </p>

            <p>
                <strong>Role:</strong>{" "}
                {member.role}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {member.status}
            </p>


            <h2>Deposit Summary</h2>

            <p>
                <strong>Total Deposits:</strong>{" "}
                {deposits.length}
            </p>

            <p>
                <strong>Total Paid:</strong>{" "}
                {totalPaid.toFixed(2)}
            </p>

            <p>
                <strong>Total Fine:</strong>{" "}
                {totalFine.toFixed(2)}
            </p>


            <h2>Deposit History</h2>


            {deposits.length === 0 ? (

                <p>No deposits found.</p>

            ) : (

                <table>

                    <thead>

                        <tr>
                            <th>Year</th>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Fine</th>
                            <th>Extra</th>
                            <th>Payment Date</th>
                            <th>Remarks</th>
                        </tr>

                    </thead>


                    <tbody>

                        {deposits.map((deposit) => (

                            <tr key={deposit.id}>

                                <td>
                                    {deposit.year}
                                </td>

                                <td>
                                    {deposit.month}
                                </td>

                                <td>
                                    {deposit.amount}
                                </td>

                                <td>
                                    {deposit.fine}
                                </td>

                                <td>
                                    {deposit.extra}
                                </td>

                                <td>
                                    {deposit.payment_date}
                                </td>

                                <td>
                                    {deposit.remarks}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>

    );
}

export default MemberDetails;