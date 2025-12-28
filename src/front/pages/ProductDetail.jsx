import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const priceEuros = useMemo(() => {
    const cents = product?.price_cents || 0;
    return (cents / 100).toFixed(2);
  }, [product]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch(`${store.backendUrl}/api/products/${id}`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "No se pudo cargar el producto");
        setProduct(data);
      } catch (e) {
        setError(e.message || "Error cargando el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
    // eslint-disable-next-line
  }, [id, store.backendUrl]);

  const addToCart = async () => {
    setError("");

    if (!store?.token) {
      navigate("/login");
      return;
    }

    try {
      setAdding(true);

      const resp = await fetch(`${store.backendUrl}/api/cart-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ product_id: Number(id), quantity: 1 }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "No se pudo añadir al carrito");

      // refrescar carrito (para navbar)
      const items = await fetch(`${store.backendUrl}/api/cart-items`, {
        headers: { Authorization: `Bearer ${store.token}` },
      }).then((r) => r.json());

      dispatch({ type: "set_cart", payload: items });
    } catch (e) {
      setError(e.message || "Error añadiendo al carrito");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-muted">Cargando producto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4" style={{ maxWidth: 980 }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/products" className="btn btn-outline-secondary">
          Volver a productos
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Producto no encontrado</div>
        <Link to="/products" className="btn btn-outline-secondary">
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 980 }}>
      <div className="mb-3">
        <Link to="/products" className="btn btn-sm btn-outline-secondary">
          ← Volver
        </Link>
      </div>

      <div className="card p-3">
        <div className="row g-4">
          <div className="col-md-5">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="img-fluid rounded"
                style={{ width: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                className="bg-light rounded d-flex align-items-center justify-content-center"
                style={{ height: 320 }}
              >
                <span className="text-muted">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="col-md-7">
            <h2 className="mb-2">{product.title}</h2>

            <div className="mb-3">
              <span className="badge bg-dark">{priceEuros} €</span>
            </div>

            <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
              {product.description || "Sin descripción"}
            </p>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={addToCart} disabled={adding}>
                {adding ? "Añadiendo..." : "Añadir al carrito"}
              </button>

              <button className="btn btn-outline-primary" onClick={() => navigate("/cart")}>
                Ir al carrito
              </button>
            </div>

            {!store?.token && (
              <div className="form-text mt-2">
                Para añadir al carrito necesitas iniciar sesión.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
