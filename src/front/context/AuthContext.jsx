import React, { createContext, useState } from "react";

// Crear el contexto
export const AuthContext = createContext();

// Crear el proveedor de contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
