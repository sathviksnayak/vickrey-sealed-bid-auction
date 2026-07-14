import api from "./api";

export async function createBid(data) {
    const response = await api.post("/bids", data);
    return response.data;
}

export async function getMyBids(wallet) {
    const response = await api.get(`/my-bids/${wallet}`);
    return response.data;
}

export async function updateBid(address, data) {
    const response = await api.put(`/bids/${address}`, data);
    return response.data;
}