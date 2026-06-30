import { CALL_STATUS } from "../constants/statuses";
import { supabase } from "../lib/supabaseClient";

const CALLS_STORAGE_KEY = "hatef_calls";
const CALLS_UPDATED_EVENT = "hatef:calls-updated";

let memoryCalls = [];
let callsHydrationPromise = null;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function cloneCall(call) {
  return { ...call };
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

function getCallImage(call = {}) {
  return normalizeText(
    call.image ||
      call.bannerPreview ||
      call.banner_preview ||
      call.bannerImage ||
      call.banner_image ||
      call.coverImage ||
      call.cover_image,
  );
}

function normalizeCall(call = {}) {
  const image = getCallImage(call);

  return {
    id: call.id || "",
    title: call.title || "",
    subtitle: call.subtitle || "",
    field: call.field || "",
    description: call.description || "",
    moreDescription: call.moreDescription || call.more_description || "",
    deadlineDate: call.deadlineDate || call.deadline_date || "",
    deadlineTime: call.deadlineTime || call.deadline_time || "",
    status: call.status || CALL_STATUS.DRAFT,
    pdfFileUrl: call.pdfFileUrl || call.pdf_file_url || "",
    image,
    bannerPreview: image,
    bannerImage: image,
    coverImage: image,
    createdBy: call.createdBy || call.created_by || "",
    createdAt: call.createdAt || call.created_at || "",
    publishedAt: call.publishedAt || call.published_at || "",
    updatedAt: call.updatedAt || call.updated_at || "",
  };
}

function normalizeCalls(calls) {
  if (!Array.isArray(calls)) {
    return [];
  }

  return calls.filter(Boolean).map(normalizeCall);
}

function notifyCallsUpdated(calls = []) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CALLS_UPDATED_EVENT, {
      detail: {
        calls,
      },
    }),
  );
}

function writeCallsToStorage(calls = []) {
  const normalizedCalls = normalizeCalls(calls);
  memoryCalls = normalizedCalls;

  if (canUseStorage()) {
    window.localStorage.setItem(
      CALLS_STORAGE_KEY,
      JSON.stringify(normalizedCalls),
    );
  }

  notifyCallsUpdated(normalizedCalls);

  return normalizedCalls;
}

function readCallsFromStorage() {
  if (!canUseStorage()) {
    return memoryCalls;
  }

  const storedValue = window.localStorage.getItem(CALLS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  return normalizeCalls(safeParseJson(storedValue, []));
}

function getSourceCalls() {
  return readCallsFromStorage();
}

function formatPersianDate(value) {
  if (!value) {
    return "";
  }

  if (String(value).includes("/")) {
    return String(value);
  }

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(
      "fa-IR-u-ca-persian",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );
  } catch {
    return String(value);
  }
}

function formatPersianDateTime(value) {
  if (!value) {
    return "";
  }

  if (String(value).includes("/")) {
    return String(value);
  }

  try {
    return new Date(value).toLocaleString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function normalizeTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
}

function mapSupabaseCallToLocal(call = {}) {
  const image = getCallImage(call);

  return normalizeCall({
    id: call.id,
    title: call.title || "",
    subtitle: call.subtitle || "",
    field: call.field || "",
    description: call.description || "",
    moreDescription: call.more_description || "",
    deadlineDate: formatPersianDate(call.deadline_date),
    deadlineTime: normalizeTime(call.deadline_time),
    status: call.status || CALL_STATUS.DRAFT,
    pdfFileUrl: call.pdf_file_url || "",
    image,
    bannerPreview: image,
    bannerImage: image,
    coverImage: image,
    createdBy: call.created_by || "",
    createdAt: formatPersianDateTime(call.created_at),
    publishedAt: formatPersianDateTime(call.published_at),
    updatedAt: formatPersianDateTime(call.updated_at),
  });
}

export async function fetchCallsFromSupabase() {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      error.message || "دریافت فراخوان‌ها از Supabase انجام نشد.",
    );
  }

  return Array.isArray(data) ? data.map(mapSupabaseCallToLocal) : [];
}

export async function hydrateCallsFromSupabase(options = {}) {
  const force = Boolean(options.force);

  if (callsHydrationPromise && !force) {
    return callsHydrationPromise;
  }

  callsHydrationPromise = fetchCallsFromSupabase()
    .then((calls) => writeCallsToStorage(calls))
    .finally(() => {
      callsHydrationPromise = null;
    });

  return callsHydrationPromise;
}

export function getCalls() {
  return getSourceCalls().map(cloneCall);
}

export function getCallById(callId) {
  const call = getSourceCalls().find(
    (item) => String(item.id) === String(callId),
  );
  return call ? cloneCall(call) : null;
}

export function getPublishedCalls() {
  return getSourceCalls()
    .filter((call) => call.status === CALL_STATUS.PUBLISHED)
    .map(cloneCall);
}

export function getDraftCalls() {
  return getSourceCalls()
    .filter((call) => call.status === CALL_STATUS.DRAFT)
    .map(cloneCall);
}

export function getArchivedCalls() {
  return getSourceCalls()
    .filter((call) => call.status === CALL_STATUS.ARCHIVED)
    .map(cloneCall);
}

export function getCurrentCalls() {
  return getSourceCalls()
    .filter((call) =>
      [CALL_STATUS.PUBLISHED, CALL_STATUS.DRAFT].includes(call.status),
    )
    .map(cloneCall);
}

export function getCallsByStatus(status) {
  return getSourceCalls()
    .filter((call) => call.status === status)
    .map(cloneCall);
}

export function searchCalls(keyword) {
  const normalizedKeyword = String(keyword || "")
    .trim()
    .toLowerCase();

  if (!normalizedKeyword) {
    return getCalls();
  }

  return getSourceCalls()
    .filter((call) => {
      const searchableText = [
        call.title,
        call.subtitle,
        call.field,
        call.description,
        call.moreDescription,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    })
    .map(cloneCall);
}

export { CALLS_STORAGE_KEY, CALLS_UPDATED_EVENT };
