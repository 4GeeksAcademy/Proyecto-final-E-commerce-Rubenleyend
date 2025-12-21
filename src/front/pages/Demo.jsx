import React, { useEffect, useState } from "react";

const Demo = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/cart-items", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCartItems(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Demo</h1>
      {cartItems.length === 0 ? (
        <p>No hay items en el carrito</p>
      ) : (
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.product.title} - Cantidad: {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Demo;
