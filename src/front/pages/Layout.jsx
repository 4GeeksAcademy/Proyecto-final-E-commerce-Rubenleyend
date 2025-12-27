import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * item.product.price_cents / 100, 0);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">E-Commerce</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
            </ul>
            <ul className="navbar-nav">
              {user ? (
                <>
                  <li className="nav-item"><span className="nav-link">Hola, {user.username}</span></li>
                  <li className="nav-item"><button className="btn btn-link nav-link" onClick={logout}>Logout</button></li>
                  <li className="nav-item dropdown">
                    <span className="nav-link dropdown-toggle" id="cartDropdown" role="button" data-bs-toggle="dropdown">
                      Carrito ({totalItems})
                    </span>
                    <ul className="dropdown-menu dropdown-menu-end p-3" aria-labelledby="cartDropdown" style={{ minWidth: "250px" }}>
                      {cart.length === 0 ? (
                        <li>Carrito vacío</li>
                      ) : (
                        <>
                          {cart.map(item => (
                            <li key={item.id}>{item.product.title} x {item.quantity} - ${(item.product.price_cents * item.quantity / 100).toFixed(2)}</li>
                          ))}
                          <li className="mt-2 fw-bold">Total: ${totalPrice.toFixed(2)}</li>
                          <li className="mt-2"><button className="btn btn-primary w-100">Pagar</button></li>
                        </>
                      )}
                    </ul>
                  </li>
                  <li className="nav-item"><Link className="nav-link" to="/profile">Perfil</Link></li>
                </>
              ) : (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Outlet />
      </div>
    </>
  );
}
