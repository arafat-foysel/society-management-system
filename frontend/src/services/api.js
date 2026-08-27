const API_BASE_URL = "http://127.0.0.1:8000/api";

export const apiFetch = async (endpoint, options = {}) => {
    let accessToken = localStorage.getItem("access_token");

    const makeRequest = async (token) => {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    };

    // First request
    let response = await makeRequest(accessToken);

    // Access token expired
    if (response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            window.location.href = "/login";

            return response;
        }

        try {
            // Ask Django for a new access token
            const refreshResponse = await fetch(
                `${API_BASE_URL}/token/refresh/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                }
            );

            if (!refreshResponse.ok) {
                throw new Error("Refresh token expired.");
            }

            const refreshData = await refreshResponse.json();

            // Save new access token
            localStorage.setItem(
                "access_token",
                refreshData.access
            );

            accessToken = refreshData.access;

            // Retry original request
            response = await makeRequest(accessToken);
        } catch (error) {
            console.error("Token refresh failed:", error);

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            window.location.href = "/login";

            return response;
        }
    }

    return response;
};

export default API_BASE_URL;