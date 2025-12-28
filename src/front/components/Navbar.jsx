import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Navbar() {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const cartItems = Array.isArray(store?.cartItems) ? store.cartItems : [];

  const cartCount = cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalPrice = cartItems.reduce(
    (acc, it) => acc + ((it.product?.price_cents || 0) * (it.quantity || 0)) / 100,
    0
  );

  const logout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  const handleUnauthorized = () => {
    dispatch({ type: "logout" });
    navigate("/login", { replace: true });
  };

  const refreshCart = async (token = store?.token) => {
    if (!token) return;

    const res = await fetch(`${store.backendUrl}/api/cart-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    //  token caducado
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    const items = await res.json();
    dispatch({ type: "set_cart", payload: items });
  };

  // recargar el usuario 
  const refreshMe = async (token = store?.token) => {
    if (!token) return;

    const meRes = await fetch(`${store.backendUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    //  token caducado
    if (meRes.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!meRes.ok) return;

    const me = await meRes.json();
    dispatch({ type: "set_me", payload: me });
  };

  // al recargar la página, si hay token, recargar carrito + usuario
  useEffect(() => {
    if (store?.token) {
      refreshCart(store.token);
      refreshMe(store.token);
    }
    
  }, [store?.token]);

  const removeItem = async (itemId) => {
    if (!store?.token) return;

    const res = await fetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${store.token}` },
    });

    // token caducado
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    await refreshCart();
  };

  const setQty = async (itemId, qty) => {
    if (!store?.token) return;

    if (qty < 1) {
      await removeItem(itemId);
      return;
    }

    const res = await fetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({ quantity: qty }),
    });

    //token caducado
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    await refreshCart();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Marketly</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
          </ul>

          <ul className="navbar-nav">
            {store?.token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    {store.user?.name ? `Hola, ${store.user.name}` : "Mi perfil"}
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <button
                    className="btn btn-dark nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    style={{ border: "none" }}
                    onClick={() => refreshCart()}
                  >
                    🛒 {cartCount}
                  </button>

                  <div className="dropdown-menu dropdown-menu-end p-3" style={{ minWidth: 360 }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Carrito</strong>
                      <Link to="/cart" className="btn btn-sm btn-outline-primary">
                        Ver carrito
                      </Link>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="text-muted">Carrito vacío</div>
                    ) : (
                      <>
                        <div style={{ maxHeight: 280, overflowY: "auto" }}>
                          {cartItems.map((it) => (
                            <div key={it.id} className="border-bottom pb-2 mb-2">
                              <div className="fw-semibold">{it.product?.title}</div>

                              <div className="d-flex justify-content-between align-items-center">
                                <div className="small text-muted">
                                  {(it.product?.price_cents || 0) / 100}€ / ud
                                </div>
                                <div className="small">
                                  <strong>
                                    {(((it.product?.price_cents || 0) * it.quantity) / 100).toFixed(2)}€
                                  </strong>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2 mt-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setQty(it.id, it.quantity - 1);
                                  }}
                                >
                                  –
                                </button>

                                <span className="fw-semibold">{it.quantity}</span>

                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setQty(it.id, it.quantity + 1);
                                  }}
                                >
                                  +
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger ms-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeItem(it.id);
                                  }}
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 d-flex justify-content-between">
                          <strong>Total:</strong>
                          <strong>{totalPrice.toFixed(2)}€</strong>
                        </div>

                        <button className="btn btn-primary w-100 mt-2" onClick={() => navigate("/cart")}>
                          Pagar
                        </button>
                      </>
                    )}
                  </div>
                </li>

                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
