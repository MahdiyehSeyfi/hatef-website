import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";
import { CALLS_STORAGE_KEY, CALLS_UPDATED_EVENT } from "./callService";

const ID_MAP_STORAGE_KEY = "hatef_supabase_id_map";

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

function readCachedCalls() {
  if (!canUseStorage()) {
    return [];
  }

  return safeParseJson(window.localStorage.getItem(CALLS_STORAGE_KEY), []);
}

function writeCachedCalls(calls) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(calls || []));
  window.dispatchEvent(
    new CustomEvent(CALLS_UPDATED_EVENT, {
      detail: {
        calls: calls || [],
      },
    }),
  );
  window.dispatchEvent(
    new CustomEvent("hatef:calls-updated", {
      detail: {
        calls: calls || [],
      },
    }),
  );
}

function readIdMap() {
  if (!canUseStorage()) {
    return {};
  }

  const value = window.localStorage.getItem(ID_MAP_STORAGE_KEY);
  const parsedValue = safeParseJson(value, {});

  return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
}

function writeIdMap(idMap) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ID_MAP_STORAGE_KEY, JSON.stringify(idMap || {}));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function makeUuid() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getSupabaseId(entityType, localId) {
  const rawLocalId = String(localId || "").trim();

  if (!rawLocalId) {
    return makeUuid();
  }

  if (isUuid(rawLocalId)) {
    return rawLocalId;
  }

  const idMap = readIdMap();
  const mapKey = `${entityType}:${rawLocalId}`;

  if (idMap[mapKey]) {
    return idMap[mapKey];
  }

  const supabaseId = makeUuid();
  writeIdMap({
    ...idMap,
    [mapKey]: supabaseId,
  });

  return supabaseId;
}

function normalizeRole(role = "") {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function isManagerRole(user) {
  const role = normalizeRole(user?.role);
  return ["committee", "committee_secretariat", "admin", "support"].includes(
    role,
  );
}

function persianDigitsToEnglish(value = "") {
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
}

function normalizeTime(value) {
  const normalizedValue = persianDigitsToEnglish(value).trim();

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/(\d{1,2})\s*:?\s*(\d{1,2})?/);

  if (!match) {
    return null;
  }

  const hour = Math.min(Math.max(Number(match[1] || 0), 0), 23)
    .toString()
    .padStart(2, "0");
  const minute = Math.min(Math.max(Number(match[2] || 0), 0), 59)
    .toString()
    .padStart(2, "0");

  return `${hour}:${minute}:00`;
}

function normalizeDeadlineDate(value) {
  const normalizedValue = persianDigitsToEnglish(value).trim();

  if (!normalizedValue) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const parts = normalizedValue.split(/[\/\-.]/).map((part) => part.trim());

  if (parts.length === 3) {
    const [year, month, day] = parts;

    if (Number(year) >= 1700) {
      return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  return null;
}

function normalizeCallStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value === "published" || value.includes("منتشر")) {
    return "published";
  }

  if (value === "archived" || value.includes("آرشیو")) {
    return "archived";
  }

  if (value === "inactive" || value.includes("غیرفعال")) {
    return "inactive";
  }

  return "draft";
}

function normalizeField(call = {}) {
  return String(call.field || call.category || "")
    .replace(/^با\s+محوریت\s+/i, "")
    .replace(/^با محوریت /, "")
    .trim();
}

function normalizeImage(call = {}) {
  return String(
    call.image ||
      call.bannerPreview ||
      call.banner_preview ||
      call.bannerImage ||
      call.banner_image ||
      call.coverImage ||
      call.cover_image ||
      "",
  ).trim();
}

function formatPersianDate(value) {
  if (!value) {
    return "";
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

function mapSupabaseCallToLocal(call = {}) {
  const image = normalizeImage(call);

  return {
    id: call.id,
    title: call.title || "",
    subtitle: call.subtitle || "",
    field: call.field || "",
    description: call.description || "",
    moreDescription: call.more_description || "",
    deadlineDate: formatPersianDate(call.deadline_date),
    deadlineTime: call.deadline_time
      ? String(call.deadline_time).slice(0, 5)
      : "",
    status: call.status || "draft",
    pdfFileUrl: call.pdf_file_url || "",
    image,
    bannerPreview: image,
    bannerImage: image,
    coverImage: image,
    createdBy: call.created_by || "",
    createdAt: formatPersianDateTime(call.created_at),
    publishedAt: formatPersianDateTime(call.published_at),
    updatedAt: formatPersianDateTime(call.updated_at),
  };
}

function normalizeCallPayload(call = {}) {
  const status = normalizeCallStatus(call.status);
  const image = normalizeImage(call);

  return {
    id: getSupabaseId("call", call.id),
    title: call.title || "فراخوان جدید هاتف",
    subtitle: call.subtitle || "",
    field: normalizeField(call),
    description: call.heroDescription || call.description || "",
    more_description: call.moreDescription || call.more_description || "",
    deadline_date: normalizeDeadlineDate(call.deadlineDate || call.deadline),
    deadline_time: normalizeTime(call.deadlineTime),
    status,
    pdf_file_url: call.pdfFileUrl || call.pdfFileName || "",
    image,
    banner_preview: image,
    published_at:
      status === "published"
        ? new Date().toISOString()
        : call.publishedAt || null,
    updated_at: new Date().toISOString(),
  };
}

function upsertCallInLocalCache(call) {
  if (!call?.id) {
    return;
  }

  const cachedCalls = readCachedCalls();
  const localCall = mapSupabaseCallToLocal(call);
  const exists = cachedCalls.some(
    (item) => String(item.id) === String(call.id),
  );
  const nextCalls = exists
    ? cachedCalls.map((item) =>
        String(item.id) === String(call.id) ? localCall : item,
      )
    : [localCall, ...cachedCalls];

  writeCachedCalls(nextCalls);
}

export async function syncCallToSupabase(call = {}) {
  const user = getCurrentUser();

  if (!isManagerRole(user) || !call?.title) {
    return null;
  }

  const payload = normalizeCallPayload(call);

  const { data, error } = await supabase
    .from("calls")
    .upsert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase call sync failed:", error.message);
    return null;
  }

  upsertCallInLocalCache(data);

  return data;
}

export async function deleteCallFromSupabase(callId) {
  const user = getCurrentUser();

  if (!isManagerRole(user) || !callId) {
    return false;
  }

  const supabaseCallId = getSupabaseId("call", callId);

  const { error } = await supabase
    .from("calls")
    .delete()
    .eq("id", supabaseCallId);

  if (error) {
    console.error("Supabase call delete failed:", error.message);
    return false;
  }

  const cachedCalls = readCachedCalls();
  writeCachedCalls(
    cachedCalls.filter((call) => String(call.id) !== String(supabaseCallId)),
  );

  return true;
}
