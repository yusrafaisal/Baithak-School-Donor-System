import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function SearchTab() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const latestRequest = useRef(0); // ignores out-of-order responses

    const runSearch = useCallback(async (name) => {
        const requestId = ++latestRequest.current;
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (name.trim()) params.set("donor_name", name.trim());
            const qs = params.toString();
            const data = await api(`/donations/${qs ? `?${qs}` : ""}`);
            if (requestId === latestRequest.current) setResults(data);
        } catch (e) {
            if (requestId === latestRequest.current) {
                setResults([]);
                setError(e.message);
            }
        } finally {
            if (requestId === latestRequest.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        runSearch(""); // show recent donations when the tab opens
    }, [runSearch]);

    function handleSubmit(e) {
        e.preventDefault();
        runSearch(query);
    }

    async function handleDelete(donation) {
        const who = donation.donor_name || "this donor";
        const ok = window.confirm(
            `Delete the donation of ${Number(donation.total).toLocaleString()} from ${who}? This cannot be undone.`
        );
        if (!ok) return;

        setDeletingId(donation.id);
        setError("");
        try {
            await api(`/donations/${donation.id}`, { method: "DELETE" });
            setResults((prev) => prev.filter((d) => d.id !== donation.id));
        } catch (e) {
            setError(e.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by donor name"
                    style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && !error && results.length === 0 && <p>No donations found.</p>}

            {results.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th align="left">Date</th>
                            <th align="left">Donor</th>
                            <th align="left">Payment</th>
                            <th align="right">Total</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((d) => (
                            <tr key={d.id}>
                                <td>{d.date}</td>
                                <td>{d.donor_name || "Unknown donor"}</td>
                                <td>{d.payment_mode}</td>
                                <td align="right">{Number(d.total).toLocaleString()}</td>
                                <td align="right">
                                    <Link href={`/receipt/${d.id}`}>Receipt</Link>{" "}
                                    <button onClick={() => handleDelete(d)} disabled={deletingId === d.id}>
                                        {deletingId === d.id ? "Deleting..." : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}