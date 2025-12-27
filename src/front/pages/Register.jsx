import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) {
        setErrorMsg("Backend URL no definida. Revisa tu .env");
        return;
      }

      const response = await fetch(`${backendUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setErrorMsg(`Registro fallido: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      login({ email: data.email });
      alert("Usuario registrado y logueado!");
    } catch (error) {
      setErrorMsg("Error en la conexión con el backend");
    }
  };

  return (
    <div>
      <h1>Registrar Usuario</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Usuario" className="form-control mb-2" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" className="form-control mb-2" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary">Registrar</button>
      </form>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
