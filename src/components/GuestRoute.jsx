import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const { user } = useAuth();

  // If already logged in → go to /home
  if (user) return <Navigate to="/home" />;

  return children;
}
