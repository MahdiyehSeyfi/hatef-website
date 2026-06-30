import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeParseJson(value, fallbackValue = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function findSessionInsideValue(value, depth = 0) {
  if (!value || typeof value !== "object" || depth > 5) {
    return null;
  }

  if (value.access_token && value.refresh_token && isUuid(value.user?.id)) {
    return value;
  }

  const knownContainers = [
    value.currentSession,
    value.session,
    value.data?.session,
    value.value,
  ];

  for (const candidate of knownContainers) {
    const session = findSessionInsideValue(candidate, depth + 1);

    if (session) {
      return session;
    }
  }

  for (const item of Object.values(value)) {
    if (item && typeof item === "object") {
      const session = findSessionInsideValue(item, depth + 1);

      if (session) {
        return session;
      }
    }
  }

  return null;
}

export function getStoredSupabaseSession() {
  if (!canUseStorage()) {
    return null;
  }

  const storageKeys = Object.keys(window.localStorage).filter(
    (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
  );

  for (const key of storageKeys) {
    const parsedValue = safeParseJson(window.localStorage.getItem(key));
    const session = findSessionInsideValue(parsedValue);

    if (session) {
      return session;
    }
  }

  return null;
}

export function getStoredSupabaseAccessToken() {
  return getStoredSupabaseSession()?.access_token || "";
}

export function getStoredSupabaseUserId() {
  const currentUser = getCurrentUser?.();

  if (isUuid(currentUser?.id)) {
    return currentUser.id;
  }

  if (isUuid(currentUser?.userId)) {
    return currentUser.userId;
  }

  return getStoredSupabaseSession()?.user?.id || "";
}

export async function getActiveSupabaseSession() {
  const sessionResult = await supabase.auth.getSession();

  if (
    sessionResult?.data?.session?.access_token &&
    isUuid(sessionResult?.data?.session?.user?.id)
  ) {
    return sessionResult.data.session;
  }

  const storedSession = getStoredSupabaseSession();

  if (storedSession?.access_token && storedSession?.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: storedSession.access_token,
      refresh_token: storedSession.refresh_token,
    });

    if (error) {
      console.warn("Supabase session restore failed:", error.message);
    }

    if (data?.session?.access_token) {
      return data.session;
    }

    return storedSession;
  }

  return null;
}

export async function getActiveSupabaseUserId() {
  const activeSession = await getActiveSupabaseSession();

  if (isUuid(activeSession?.user?.id)) {
    return activeSession.user.id;
  }

  const currentUser = getCurrentUser?.();

  if (isUuid(currentUser?.id)) {
    return currentUser.id;
  }

  if (isUuid(currentUser?.userId)) {
    return currentUser.userId;
  }

  return "";
}

export function buildEqFilter(column, value) {
  return `${column}=eq.${encodeURIComponent(String(value || ""))}`;
}

export async function supabaseRestRequest(
  tableName,
  {
    method = "GET",
    query = "",
    body = null,
    prefer = "return=representation",
  } = {},
) {
  const activeSession = await getActiveSupabaseSession();
  const accessToken =
    activeSession?.access_token || getStoredSupabaseAccessToken();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !accessToken) {
    return {
      data: null,
      error: {
        message: "missing_supabase_rest_session",
      },
      status: 0,
    };
  }

  const normalizedQuery = query
    ? query.startsWith("?")
      ? query
      : `?${query}`
    : "";

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}${normalizedQuery}`,
    {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    },
  );

  const responseText = await response.text();
  const data = responseText ? safeParseJson(responseText, responseText) : null;

  if (!response.ok) {
    return {
      data: null,
      error:
        data && typeof data === "object"
          ? data
          : {
              message: response.statusText || "Supabase REST request failed",
            },
      status: response.status,
    };
  }

  return {
    data,
    error: null,
    status: response.status,
  };
}
