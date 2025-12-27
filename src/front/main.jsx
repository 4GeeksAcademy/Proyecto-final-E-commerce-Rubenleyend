import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

const Main = () => (
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
