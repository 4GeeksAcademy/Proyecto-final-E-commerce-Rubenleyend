import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <p>No has iniciado sesión.</p>;

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <p><strong>Usuario:</strong> {user.username}</p>
    </div>
  );
}
