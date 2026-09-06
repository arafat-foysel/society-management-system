import { apiFetch } from "./api";

export async function getCurrentUser() {
    const response = await apiFetch("/profile/");

    if (!response.ok) {
        throw new Error("Failed to load current user.");
    }

    return response.json();
}