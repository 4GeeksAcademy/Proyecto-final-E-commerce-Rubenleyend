import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const totalItems = cartItems.reduce((sum, p) => sum + p.quantity, 0);
  const totalPrice = cartItems.reduce((sum, p) => sum + p.quantity * p.price_cents / 100, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">E-Commerce</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Productos</Link></li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item"><span className="nav-link">Hola, {user.username}</span></li>
                <li className="nav-item"><button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button></li>
              </>
            ) : (
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
            )}
            <li className="nav-item dropdown">
              <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                Carrito ({totalItems})
              </span>
              <ul className="dropdown-menu dropdown-menu-end p-3" style={{ minWidth: '300px' }}>
                {cartItems.length === 0 && <li>Carrito vacío</li>}
                {cartItems.map(p => (
                  <li key={p.id}>
                    {p.title} x {p.quantity} = ${(p.quantity * p.price_cents / 100).toFixed(2)}
                  </li>
                ))}
                {cartItems.length > 0 && (
                  <>
                    <li>Total: ${totalPrice.toFixed(2)}</li>
                    <li><button className="btn btn-primary btn-sm mt-2 w-100">Pagar</button></li>
                  </>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
