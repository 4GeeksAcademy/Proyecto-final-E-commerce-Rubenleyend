import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    debugger
    const fetchProducts = async () => {
      debugger
      if (!import.meta.env.VITE_BACKEND_URL) {
        setError("Backend URL no definida. Revisa tu .env");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/products`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h1>Productos</h1>
      {products.length === 0 && <p>No hay productos disponibles.</p>}
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.title} - ${(p.price_cents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
