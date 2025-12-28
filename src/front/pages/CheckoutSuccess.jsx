import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function CheckoutSuccess() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [msg, setMsg] = useState("Pago completado ✅");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setError("");

      if (!store?.token) return;

      try {
        const res = await fetch(`${store.backendUrl}/api/checkout/success`, {
          method: "POST",
          headers: { Authorization: `Bearer ${store.token}` },
        });

        if (res.status === 401) {
          dispatch({ type: "logout" });
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo confirmar el pago");

        // deja el carrito vacío en el front
        dispatch({ type: "set_cart", payload: [] });

        setMsg(`Pago completado ✅ (${data.cleared} items vaciados del carrito)`);
      } catch (e) {
        setError(e.message || "Error");
      }
    };

    run();
    
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">Pago realizado</h2>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2">
        <Link className="btn btn-primary" to="/">Volver al Home</Link>
        <Link className="btn btn-outline-secondary" to="/products">Seguir comprando</Link>
      </div>
    </div>
  );
}
