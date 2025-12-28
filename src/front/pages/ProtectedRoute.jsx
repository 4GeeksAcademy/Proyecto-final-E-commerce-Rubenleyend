import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function ProtectedRoute({ children }) {
  const { store } = useGlobalReducer();

  if (!store || !store.token) return <Navigate to="/login" replace />;

  return children;
}
