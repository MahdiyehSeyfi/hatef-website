import { useEffect } from "react";
import { useNavigate } from "react-router";

import { logoutUser } from "../services/authService";

function AuthSessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleDocumentClick(event) {
      const logoutElement = event.target.closest?.(
        [
          "[data-auth-logout='true']",
          ".innovator-dashboard__profile-logout",
          ".business-dashboard__profile-logout",
          ".reviewer-dashboard__profile-logout",
          ".instructor-dashboard__profile-logout",
          ".committee-dashboard__profile-logout",
          ".committee-secretariat-dashboard__profile-logout",
        ].join(", "),
      );

      if (!logoutElement) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      logoutUser();
      navigate("/", { replace: true });
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [navigate]);

  return null;
}

export default AuthSessionGuard;
