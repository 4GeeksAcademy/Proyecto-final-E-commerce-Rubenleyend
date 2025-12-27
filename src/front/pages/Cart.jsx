import React from "react";


export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * item.product.price_cents / 100, 0);

  return (
    <div>
      <h1>Carrito de Compras</h1>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.product.title}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    className="form-control"
                    style={{ width: "80px" }}
                    onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                  />
                </td>
                <td>${(item.product.price_cents * item.quantity / 100).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="fw-bold">Total</td>
              <td colSpan="2" className="fw-bold">${totalPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {cart.length > 0 && <button className="btn btn-success">Pagar</button>}
    </div>
  );
}
