import api from "./api";

export async function createAuction(formData) {
  const response = await api.post("/auctions", formData);

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

export async function getMyAuctions() {
  const response = await api.get(`/auctions/my-auctions/`);
  return response.data;
}
