import { useEffect, useState } from "react";

export default function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/cart-items", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Carrito</h1>
      {items.length === 0 ? (
        <p>No hay items en el carrito.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.product.title} - Cantidad: {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


