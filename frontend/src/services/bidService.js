import api from "./api";

export async function createBid(data) {
    const response = await api.post("/bids", data);
    return response.data;
}

export async function getMyBids() {
    const response = await api.get(`/bids/my-bids/`);
    return response.data;
}

export async function updateBid(address, data) {
    const response = await api.put(`/bids/${address}`, data);
    return response.data;
}