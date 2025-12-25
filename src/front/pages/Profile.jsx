import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, email }),
    });
    if (res.ok) alert("Perfil actualizado");
  };

  return (
    <div>
      <h1>Perfil</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleUpdate}>Actualizar</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
