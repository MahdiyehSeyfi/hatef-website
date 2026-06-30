import { useEffect } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../lib/supabaseClient";
import { logoutUser, refreshCurrentUser } from "../services/authService";
import {
  startSupabaseLocalStorageBridge,
  stopSupabaseLocalStorageBridge,
} from "../services/supabaseLocalStorageBridge";

function AuthSessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function syncSupabaseSession() {
      try {
        const user = await refreshCurrentUser();

        if (user?.id) {
          startSupabaseLocalStorageBridge();
        }
      } catch {
        if (isMounted) {
          logoutUser();
          stopSupabaseLocalStorageBridge();
        }
      }
    }

    syncSupabaseSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "SIGNED_OUT" || !session?.user) {
        stopSupabaseLocalStorageBridge();
        return;
      }

      try {
        const user = await refreshCurrentUser();

        if (user?.id) {
          startSupabaseLocalStorageBridge();
        }
      } catch {
        logoutUser();
        stopSupabaseLocalStorageBridge();
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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
      stopSupabaseLocalStorageBridge();
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
