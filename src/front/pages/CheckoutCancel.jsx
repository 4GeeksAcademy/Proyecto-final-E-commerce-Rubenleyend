import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-3">Pago cancelado</h2>

      <div className="alert alert-warning">
        Has cancelado el pago. No se ha realizado ningún cargo.
      </div>

      <div className="d-flex gap-2">
        <Link className="btn btn-primary" to="/cart">
          Volver al carrito
        </Link>
        <Link className="btn btn-outline-secondary" to="/products">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
