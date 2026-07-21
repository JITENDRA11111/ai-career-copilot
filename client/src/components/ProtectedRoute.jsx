import { Navigate } from "react-router-dom";
import Layout from "./Layout";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Token decoding failed:", e);
    return null;
  }
};

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    user = decodeToken(token);
    if (!user) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } else {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}
