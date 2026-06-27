import { Navigate, useLocation } from "react-router";

import {
  getCurrentUser,
  getDashboardPathByRole,
} from "../services/authService";

function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const hasRoleRestriction =
    Array.isArray(allowedRoles) && allowedRoles.length > 0;
  const isAllowed =
    !hasRoleRestriction || allowedRoles.includes(currentUser.role);

  if (!isAllowed) {
    return <Navigate to={getDashboardPathByRole(currentUser.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
