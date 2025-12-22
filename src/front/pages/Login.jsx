import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // URL del backend desde la variable de entorno
      debugger
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) {
        console.error("Backend URL not defined in .env");
        setErrorMsg("Backend URL no definida. Revisa tu .env");
        return;
      }

      const response = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // o email según tu backend
      });

      if (!response.ok) {
        const text = await response.text(); // Para ver qué devuelve realmente
        console.error("Login failed:", response.status, text);
        setErrorMsg(`Login failed: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Guardar token 
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        alert("Login exitoso!");
      } else {
        setErrorMsg("Login fallido: token no recibido");
        console.error("Login response missing access_token:", data);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Error en la conexión con el backend");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
