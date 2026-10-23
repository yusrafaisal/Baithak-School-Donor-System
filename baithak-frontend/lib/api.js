const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function api(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: options.body ? { "Content-Type": "application/json" } : {},
        });
    } catch {
        throw new Error("Cannot reach the server. Check that the backend is running.");
    }

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            if (typeof body.detail === "string") message = body.detail;
            else if (Array.isArray(body.detail)) message = body.detail.map((e) => e.msg).join(", ");
        } catch { }
        throw new Error(message);
    }

    return res.status === 204 ? null : res.json();
}