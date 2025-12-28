export const initialStore = () => ({
  backendUrl: import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "",
  user: null,
  token: localStorage.getItem("token") || null,
  products: [],
  cartItems: [], // items del backend: [{id, product, quantity, ...}]
});

async function apiFetch(url, options = {}) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!resp.ok) {
    const msg = (data && data.error) ? data.error : `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_products":
      return { ...store, products: action.payload };

    case "login_success":
      localStorage.setItem("token", action.payload.token);
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
      };

    case "logout":
      localStorage.removeItem("token");
      return { ...store, token: null, user: null, cartItems: [] };

    // Alias/Nombre
    case "set_me":
    case "set_user":
      return { ...store, user: action.payload };

    case "set_cart": {
      const raw = Array.isArray(action.payload) ? action.payload : [];

      // no cambia el payload
      const items = [...raw];

      // Orden por id
      items.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      return { ...store, cartItems: items };
    }

    // si no reconoce la acción, devuelve el store actual
    default:
      return store;
  }
}

export const actions = ({ getStore, setStore, dispatch }) => ({
  // PRODUCTS
  loadProducts: async () => {
    const store = getStore();
    const data = await apiFetch(`${store.backendUrl}/api/products`);
    dispatch({ type: "set_products", payload: data });
    return data;
  },

  // AUTH
  register: async (payload) => {
    const store = getStore();
    return await apiFetch(`${store.backendUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  login: async ({ email, password }) => {
    const store = getStore();
    const data = await apiFetch(`${store.backendUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    dispatch({
      type: "login_success",
      payload: { token: data.access_token, user: data.user },
    });

    // cargar carrito tras login
    await actions({ getStore, setStore, dispatch }).loadCart();

    return data;
  },

  loadMe: async () => {
    const store = getStore();
    if (!store.token) return null;
    const me = await apiFetch(`${store.backendUrl}/api/me`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    dispatch({ type: "set_me", payload: me });
    return me;
  },

  updateMe: async (payload) => {
    const store = getStore();
    const updated = await apiFetch(`${store.backendUrl}/api/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify(payload),
    });
    dispatch({ type: "set_me", payload: updated });
    return updated;
  },

  // CART backend
  loadCart: async () => {
    const store = getStore();
    if (!store.token) return [];
    const items = await apiFetch(`${store.backendUrl}/api/cart-items`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    dispatch({ type: "set_cart", payload: items });
    return items;
  },

  addToCart: async (productId, quantity = 1) => {
    const store = getStore();
    await apiFetch(`${store.backendUrl}/api/cart-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return await actions({ getStore, setStore, dispatch }).loadCart();
  },

  setCartItemQuantity: async (itemId, quantity) => {
    const store = getStore();
    await apiFetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return await actions({ getStore, setStore, dispatch }).loadCart();
  },

  removeCartItem: async (itemId) => {
    const store = getStore();
    await apiFetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${store.token}` },
    });
    return await actions({ getStore, setStore, dispatch }).loadCart();
  },

  logout: () => {
    dispatch({ type: "logout" });
  },
});
