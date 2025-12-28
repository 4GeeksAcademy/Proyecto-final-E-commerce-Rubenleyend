import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Cart() {
  const { store, dispatch } = useGlobalReducer();

  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const load = async () => {
    setError("");
    const res = await fetch(`${store.backendUrl}/api/cart-items`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });

    // si el token caduca 
    if (res.status === 401) {
      dispatch({ type: "logout" });
      return;
    }

    const items = await res.json();
    dispatch({ type: "set_cart", payload: items });
  };

  useEffect(() => {
    load();
    // evita warning
  }, []);

  const setQty = async (itemId, qty) => {
    setError("");

    // Si llega a cero se borra
    if (qty <= 0) {
      const res = await fetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${store.token}` },
      });

      if (res.status === 401) {
        dispatch({ type: "logout" });
        return;
      }

      await load();
      return;
    }

    // SI es uno o mas actualiza
    const res = await fetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({ quantity: qty }),
    });

    if (res.status === 401) {
      dispatch({ type: "logout" });
      return;
    }

    await load();
  };

  const remove = async (itemId) => {
    setError("");

    const res = await fetch(`${store.backendUrl}/api/cart-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${store.token}` },
    });

    if (res.status === 401) {
      dispatch({ type: "logout" });
      return;
    }

    await load();
  };

  // Stripe Checkout
  const pay = async () => {
    setError("");
    setPaying(true);

    try {
      const res = await fetch(`${store.backendUrl}/api/checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      if (res.status === 401) {
        dispatch({ type: "logout" });
        throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo iniciar el pago");

      // redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || "Error iniciando el pago");
      setPaying(false);
    }
  };

  const total = store.cartItems.reduce(
    (acc, it) => acc + ((it.product?.price_cents || 0) * it.quantity) / 100,
    0
  );

  return (
    <div>
      <h2 className="mb-3">Carrito</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {store.cartItems.length === 0 ? (
        <div className="alert alert-secondary">Carrito vacío</div>
      ) : (
        <div className="card p-3">
          {store.cartItems.map((it) => (
            <div
              key={it.id}
              className="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <div>
                <div className="fw-semibold">{it.product?.title}</div>
                <div className="text-muted small">
                  {((it.product?.price_cents || 0) / 100).toFixed(2)}€ / unidad
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setQty(it.id, it.quantity - 1)}
                  aria-label="Reducir cantidad"
                >
                  -
                </button>

                <span className="fw-semibold">{it.quantity}</span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setQty(it.id, it.quantity + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => remove(it.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between mt-3">
            <strong>Total</strong>
            <strong>{total.toFixed(2)}€</strong>
          </div>

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={pay}
            disabled={paying || store.cartItems.length === 0}
          >
            {paying ? "Redirigiendo a pago..." : "Pagar"}
          </button>
        </div>
      )}
    </div>
  );
}
