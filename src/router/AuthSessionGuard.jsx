import { useEffect } from "react";
import { useNavigate } from "react-router";

import { logoutUser } from "../services/authService";

function AuthSessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleDocumentClick(event) {
      const logoutElement = event.target.closest?.(
        "[data-auth-logout='true'], .innovator-dashboard__profile-logout",
      );

      if (!logoutElement) {
        return;
      }

      event.preventDefault();
      logoutUser();
      navigate("/auth", { replace: true });
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [navigate]);

  return null;
}

export default AuthSessionGuard;
