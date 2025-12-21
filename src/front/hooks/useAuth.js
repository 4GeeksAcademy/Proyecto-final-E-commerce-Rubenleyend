import { useState } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        return { success: true };
      } else {
        return { success: false, message: data.msg || "Error al hacer login" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return { token, login, logout };
};
