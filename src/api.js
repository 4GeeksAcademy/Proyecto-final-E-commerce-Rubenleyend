const API_URL = "http://localhost:5000/api";

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getCartItems(token) {
  const res = await fetch(`${API_URL}/cart-items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

