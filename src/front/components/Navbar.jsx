import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart, totalItems, totalPrice, increment, decrement, removeFromCart, clearCart } = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Home</Link>
      <Link to="/products">Productos</Link>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        {user ? (
          <>
            <span>Hola, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowCart(prev => !prev)}>
            🛒 {totalItems}
          </button>

          {showCart && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "100%",
              background: "#fff",
              border: "1px solid #ccc",
              padding: "1rem",
              width: "300px",
              zIndex: 100
            }}>
              {cart.length === 0 ? (
                <p>El carrito está vacío</p>
              ) : (
                <>
                  <ul>
                    {cart.map(p => (
                      <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span>{p.title}</span>
                        <div>
                          <button onClick={() => decrement(p.id)}>-</button>
                          <span style={{ margin: "0 0.5rem" }}>{p.quantity}</span>
                          <button onClick={() => increment(p.id)}>+</button>
                          <button onClick={() => removeFromCart(p.id)} style={{ marginLeft: "0.5rem" }}>x</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p>Total: ${totalPrice.toFixed(2)}</p>
                  <button onClick={() => { alert("Pago simulado"); clearCart(); }}>Pagar</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
