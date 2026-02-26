import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
