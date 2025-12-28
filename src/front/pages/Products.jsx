import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Products() {
  const { store, dispatch } = useGlobalReducer();
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const resp = await fetch(`${store.backendUrl}/api/products`);
        const data = await resp.json();
        dispatch({ type: "set_products", payload: data });
      } catch {
        setError("No se pudieron cargar productos.");
      }
    };
    load();

  }, [store.backendUrl]);

  const filtered = useMemo(() => {
    const list = Array.isArray(store.products) ? store.products : [];
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter((p) => (p.title || "").toLowerCase().includes(query));
  }, [store.products, q]);

  const add = async (productId) => {
    if (!store.token) return alert("Debes hacer login para añadir al carrito");

    await fetch(`${store.backendUrl}/api/cart-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });

    const items = await fetch(`${store.backendUrl}/api/cart-items`, {
      headers: { Authorization: `Bearer ${store.token}` },
    }).then((r) => r.json());

    dispatch({ type: "set_cart", payload: items });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h2 className="mb-1">Catálogo</h2>
          <div className="text-muted">Explora todos los productos</div>
        </div>

        <div style={{ width: 320 }}>
          <input
            className="form-control"
            placeholder="Buscar por título..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th style={{ width: 120 }}>Precio</th>
            <th style={{ width: 260 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="d-flex align-items-center gap-2">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                      alt={p.title}
                    />
                  )}
                  <div>
                    <div className="fw-semibold">{p.title}</div>
                    <div className="small text-muted">{p.description}</div>
                  </div>
                </div>
              </td>

              <td>
                <strong>{(p.price_cents / 100).toFixed(2)}€</strong>
              </td>

              <td className="text-end">
                <div className="d-flex justify-content-end gap-2">
                  <Link className="btn btn-outline-secondary btn-sm" to={`/products/${p.id}`}>
                    Ver detalles
                  </Link>
                  <button className="btn btn-primary btn-sm" onClick={() => add(p.id)}>
                    Añadir al carrito
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="3" className="text-muted">
                No hay productos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
