import api from "./api";

export async function createNonce(wallet) {
  const response = await api.post("/auth/nonce", { wallet });
  return response.data;
}

export async function Login(data) {
  const response = await api.post("/auth/login", data); //data={wallet,signature}
  return response.data;
}

export async function checkAuthenticated() {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    await api.get("/auth/me");
    return true;
  } catch {
    localStorage.removeItem("token");
    return false;
  }
}
