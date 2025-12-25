import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      setErrorMsg("Backend URL no definida (.env)");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        setErrorMsg("Email o contraseña incorrectos");
        return;
      }

      const data = await response.json();

      // Guardar token
      localStorage.setItem("token", data.access_token);

      // Redirigir a home
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMsg("Error conectando con el backend");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Entrar</button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
