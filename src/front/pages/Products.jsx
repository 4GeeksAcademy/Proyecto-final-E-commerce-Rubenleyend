import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} - ${p.price_cents / 100}
            <button className="btn btn-sm btn-primary ms-2" onClick={() => addToCart(p)}>
              Añadir al carrito
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
