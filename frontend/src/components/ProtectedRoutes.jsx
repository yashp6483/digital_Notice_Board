import { Navigate, Outlet } from "react-router-dom";

const isTokenExpiredOrInvalid = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || isTokenExpiredOrInvalid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
