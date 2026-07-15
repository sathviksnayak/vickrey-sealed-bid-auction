import api from "./api";

export async function createUser(wallet) {
    const response = await api.post("/users", {
        wallet
    });

    return response.data;
}

export async function getUser(wallet) {
    const response = await api.get(`/users/${wallet}`);
    return response.data;
}

export async function updateUser(wallet, data) {
    const response = await api.put(`/users/${wallet}`, data);
    return response.data;
}