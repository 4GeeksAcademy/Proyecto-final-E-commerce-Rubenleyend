import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Home() {
  const { store, dispatch } = useGlobalReducer();
  const [error, setError] = useState("");

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

  const featured = useMemo(() => {
    const list = Array.isArray(store.products) ? store.products : [];
    return list.slice(16, 22); 
  }, [store.products]);

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
          <h2 className="mb-1">Destacados</h2>
          <div className="text-muted">Una selección rápida para empezar</div>
        </div>

        <Link className="btn btn-outline-primary" to="/products">
          Ver catálogo completo
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {featured.map((p) => (
          <div className="col-12 col-md-6 col-lg-4" key={p.id}>
            <div className="card h-100">
              {p.image_url && (
                <img
                  src={p.image_url}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover" }}
                  alt={p.title}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.title}</h5>
                <p className="card-text text-muted" style={{ flex: 1 }}>
                  {p.description}
                </p>

                <div className="d-flex justify-content-between align-items-center">
                  <strong>{(p.price_cents / 100).toFixed(2)}€</strong>

                  <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary btn-sm" to={`/products/${p.id}`}>
                      Ver detalles
                    </Link>
                    <button className="btn btn-primary btn-sm" onClick={() => add(p.id)}>
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {featured.length === 0 && <div className="text-muted">No hay productos</div>}
      </div>
    </div>
  );
}
