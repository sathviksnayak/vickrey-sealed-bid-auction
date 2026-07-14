import api from "./api";

export async function createAuction(data) {
    const response = await api.post("/auctions", data);
    return response.data;
}

export async function getAuctions() {
    const response = await api.get("/auctions");
    return response.data;
}

export async function getAuction(address) {
    const response = await api.get(`/auctions/${address}`);
    return response.data;
}

export async function getMyAuctions(wallet) {
    const response = await api.get(`/my-auctions/${wallet}`);
    return response.data;
}

export async function updateAuction(address, data) {
    const response = await api.put(`/auctions/${address}`, data);
    return response.data;
}