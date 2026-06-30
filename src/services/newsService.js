import { newsItems as staticNewsItems } from "../data/newsData";
import { supabase } from "../lib/supabaseClient";

const NEWS_STORAGE_KEY = "hatef_news_items";
const NEWS_PREVIEW_STORAGE_KEY = "hatef_news_preview_item";
const NEWS_UPDATED_EVENT = "hatef-news-updated";
const MAX_STORED_NEWS_ITEMS = 40;
const AUTO_HYDRATE_FLAG = "__HATEF_NEWS_AUTO_HYDRATE_STARTED__";

const NEWS_STATUS = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشر شده",
};

const DB_STATUS = {
  draft: "draft",
  published: "published",
  [NEWS_STATUS.DRAFT]: "draft",
  [NEWS_STATUS.PUBLISHED]: "published",
  "پیش نویس": "draft",
  پیش‌نویس: "draft",
  منتشرشده: "published",
  "منتشر شده": "published",
};

const LOCAL_STATUS = {
  draft: NEWS_STATUS.DRAFT,
  published: NEWS_STATUS.PUBLISHED,
  [NEWS_STATUS.DRAFT]: NEWS_STATUS.DRAFT,
  [NEWS_STATUS.PUBLISHED]: NEWS_STATUS.PUBLISHED,
  "پیش نویس": NEWS_STATUS.DRAFT,
  پیش‌نویس: NEWS_STATUS.DRAFT,
  منتشرشده: NEWS_STATUS.PUBLISHED,
  "منتشر شده": NEWS_STATUS.PUBLISHED,
};

export const NEWS_CATEGORY_OPTIONS = [
  "اخبار و اطلاع‌رسانی",
  "فراخوان‌ها و رویدادها",
  "دستاوردها و پروژه‌ها",
  "آموزش و توانمندسازی",
  "همکاری‌های راهبردی",
  "گزارش‌های دبیرخانه",
];

let memoryNewsItems = [];
let memoryPreviewItem = null;
let hydratePromise = null;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function canDispatchEvent() {
  return (
    typeof window !== "undefined" && typeof window.dispatchEvent === "function"
  );
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function safeParseJson(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveJsonToStorage(key, value) {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function normalizeValue(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeTimestamp(value, fallback = 0) {
  const numericValue = Number(value || 0);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return fallback;
}

function toTimestamp(value) {
  if (!value) return 0;

  if (typeof value === "number") {
    return normalizeTimestamp(value, 0);
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getCurrentPersianDate() {
  const now = new Date();

  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function getCurrentPersianDateTime() {
  const now = new Date();

  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString();
  }
}

function sanitizeNewsHtml(value = "") {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/href=("|')\s*javascript:[\s\S]*?\1/gi, 'href="#"')
    .replace(/src=("|')\s*javascript:[\s\S]*?\1/gi, 'src=""');
}

function htmlToPlainText(value = "") {
  return String(value || "")
    .replace(/<br\s*\/?>(\n)?/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeImageForRuntime(image = "") {
  return normalizeValue(image);
}

function getFallbackImage() {
  return staticNewsItems?.[0]?.image || "";
}

function normalizeCategory(category = "") {
  const normalizedCategory = normalizeValue(category, NEWS_CATEGORY_OPTIONS[0]);

  return NEWS_CATEGORY_OPTIONS.includes(normalizedCategory)
    ? normalizedCategory
    : NEWS_CATEGORY_OPTIONS[0];
}

function normalizeStatus(status = "") {
  const normalized = normalizeValue(status, NEWS_STATUS.DRAFT);
  return LOCAL_STATUS[normalized] || NEWS_STATUS.DRAFT;
}

function normalizeDbStatus(status = "") {
  const normalized = normalizeValue(status, "draft");
  return DB_STATUS[normalized] || "draft";
}

function normalizeBody(body = "", contentHtml = "") {
  if (Array.isArray(body)) {
    return body.map((paragraph) => normalizeValue(paragraph)).filter(Boolean);
  }

  const bodyText = htmlToPlainText(contentHtml || body);

  if (!bodyText) {
    return [];
  }

  return bodyText
    .split(/\n{2,}/)
    .map((paragraph) => normalizeValue(paragraph))
    .filter(Boolean);
}

function normalizeNewsDraftRevision(draftRevision = null) {
  if (!draftRevision || typeof draftRevision !== "object") {
    return null;
  }

  const contentHtml = sanitizeNewsHtml(
    draftRevision.contentHtml || draftRevision.html || draftRevision.body || "",
  );

  return {
    title: normalizeValue(draftRevision.title),
    summary: normalizeValue(draftRevision.summary),
    body: contentHtml || normalizeValue(draftRevision.body),
    contentHtml,
    image: normalizeImageForRuntime(
      draftRevision.image || draftRevision.coverImage,
    ),
    category: normalizeCategory(draftRevision.category),
    isImportant: normalizeBoolean(
      draftRevision.isImportant ||
        draftRevision.important ||
        draftRevision.featured,
    ),
    updatedAt: normalizeValue(
      draftRevision.updatedAt,
      getCurrentPersianDateTime(),
    ),
    updatedAtTimestamp: normalizeTimestamp(
      draftRevision.updatedAtTimestamp,
      Date.now(),
    ),
  };
}

function compactNewsDraftRevisionForStorage(draftRevision = null) {
  const normalizedDraftRevision = normalizeNewsDraftRevision(draftRevision);

  if (!normalizedDraftRevision) {
    return null;
  }

  return {
    title: normalizedDraftRevision.title,
    summary: normalizedDraftRevision.summary,
    body: normalizedDraftRevision.body,
    contentHtml: normalizedDraftRevision.contentHtml,
    image: normalizedDraftRevision.image,
    category: normalizedDraftRevision.category,
    isImportant: normalizedDraftRevision.isImportant,
    updatedAt: normalizedDraftRevision.updatedAt,
    updatedAtTimestamp: normalizedDraftRevision.updatedAtTimestamp,
  };
}

function normalizeNewsItem(newsItem = {}) {
  const source = normalizeValue(newsItem.source, "committee");

  const contentHtml = sanitizeNewsHtml(
    newsItem.contentHtml ||
      newsItem.html ||
      (typeof newsItem.body === "string" && /<[^>]+>/.test(newsItem.body)
        ? newsItem.body
        : ""),
  );

  const body = normalizeBody(newsItem.body || newsItem.content, contentHtml);
  const bodyText = htmlToPlainText(contentHtml) || body.join("\n\n");
  const status = normalizeStatus(newsItem.status);
  const nowTimestamp = Date.now();

  const createdAtTimestamp = normalizeTimestamp(
    newsItem.createdAtTimestamp ||
      newsItem.createdAtMs ||
      toTimestamp(newsItem.createdAt),
    nowTimestamp,
  );

  const updatedAtTimestamp = normalizeTimestamp(
    newsItem.updatedAtTimestamp ||
      newsItem.updatedAtMs ||
      toTimestamp(newsItem.updatedAt),
    createdAtTimestamp,
  );

  const publishedAtTimestamp = normalizeTimestamp(
    newsItem.publishedAtTimestamp ||
      newsItem.publishedAtMs ||
      toTimestamp(newsItem.publishedAt || newsItem.date),
    status === NEWS_STATUS.PUBLISHED ? updatedAtTimestamp : 0,
  );

  return {
    id: normalizeValue(newsItem.id, makeId()),
    title: normalizeValue(newsItem.title, "خبر جدید هاتف"),
    summary: normalizeValue(
      newsItem.summary,
      bodyText || "خلاصه خبر هنوز وارد نشده است.",
    ),
    body,
    contentHtml,
    image: normalizeImageForRuntime(newsItem.image || newsItem.coverImage),
    views: Number(newsItem.views || 0),
    status,
    category: normalizeCategory(newsItem.category),
    isImportant: normalizeBoolean(
      newsItem.isImportant || newsItem.important || newsItem.featured,
    ),
    author: normalizeValue(newsItem.author, "دبیرخانه هاتف"),
    source,
    createdAt: normalizeValue(newsItem.createdAt, getCurrentPersianDateTime()),
    updatedAt: normalizeValue(newsItem.updatedAt),
    publishedAt: normalizeValue(
      newsItem.publishedAt,
      status === NEWS_STATUS.PUBLISHED
        ? newsItem.date || getCurrentPersianDate()
        : "",
    ),
    date: normalizeValue(
      newsItem.date,
      status === NEWS_STATUS.PUBLISHED
        ? newsItem.publishedAt || getCurrentPersianDate()
        : "",
    ),
    createdAtTimestamp,
    updatedAtTimestamp,
    publishedAtTimestamp,
    draftRevision: normalizeNewsDraftRevision(newsItem.draftRevision),
    metadata:
      newsItem.metadata && typeof newsItem.metadata === "object"
        ? newsItem.metadata
        : {},
  };
}

function normalizeNewsItems(items) {
  return Array.isArray(items)
    ? items.filter(Boolean).map(normalizeNewsItem)
    : [];
}

function compactNewsItemForStorage(newsItem = {}, options = {}) {
  const normalizedItem = normalizeNewsItem(newsItem);
  const keepLargeImage = Boolean(options.keepLargeImage);

  return {
    id: normalizedItem.id,
    title: normalizedItem.title,
    summary: normalizedItem.summary,
    body: normalizedItem.body,
    contentHtml: normalizedItem.contentHtml,
    image: keepLargeImage ? normalizedItem.image : normalizedItem.image,
    views: normalizedItem.views,
    status: normalizedItem.status,
    category: normalizedItem.category,
    isImportant: normalizedItem.isImportant,
    author: normalizedItem.author,
    source: normalizedItem.source,
    createdAt: normalizedItem.createdAt,
    updatedAt: normalizedItem.updatedAt,
    publishedAt: normalizedItem.publishedAt,
    date: normalizedItem.date,
    createdAtTimestamp: normalizedItem.createdAtTimestamp,
    updatedAtTimestamp: normalizedItem.updatedAtTimestamp,
    publishedAtTimestamp: normalizedItem.publishedAtTimestamp,
    draftRevision: compactNewsDraftRevisionForStorage(
      normalizedItem.draftRevision,
    ),
    metadata: normalizedItem.metadata,
  };
}

function prepareNewsItemsForStorage(items = [], options = {}) {
  return normalizeNewsItems(items)
    .sort(sortByNewest)
    .slice(0, MAX_STORED_NEWS_ITEMS)
    .map((item) => compactNewsItemForStorage(item, options));
}

function notifyNewsUpdated() {
  if (!canDispatchEvent()) return;

  window.dispatchEvent(new CustomEvent(NEWS_UPDATED_EVENT));
}

function sortByNewest(first, second) {
  return (
    Number(
      second.publishedAtTimestamp ||
        second.updatedAtTimestamp ||
        second.createdAtTimestamp ||
        0,
    ) -
    Number(
      first.publishedAtTimestamp ||
        first.updatedAtTimestamp ||
        first.createdAtTimestamp ||
        0,
    )
  );
}

function sortNewest(items = []) {
  return [...items].sort(sortByNewest);
}

function readStoredNewsItems() {
  if (!canUseStorage()) {
    return memoryNewsItems;
  }

  const storedValue = window.localStorage.getItem(NEWS_STORAGE_KEY);
  return normalizeNewsItems(safeParseJson(storedValue, []));
}

function writeStoredNewsItems(items) {
  const compactItems = prepareNewsItemsForStorage(items);

  if (!canUseStorage()) {
    memoryNewsItems = compactItems;
    notifyNewsUpdated();
    return compactItems;
  }

  saveJsonToStorage(NEWS_STORAGE_KEY, compactItems);
  notifyNewsUpdated();
  return compactItems;
}

function readPreviewNewsItem() {
  if (!canUseStorage()) {
    return memoryPreviewItem;
  }

  const storedValue = window.localStorage.getItem(NEWS_PREVIEW_STORAGE_KEY);
  const parsed = safeParseJson(storedValue, null);

  return parsed ? normalizeNewsItem(parsed) : null;
}

function writePreviewNewsItem(newsItem) {
  const normalizedPreviewItem = normalizeNewsItem({
    ...newsItem,
    id: "preview",
    status: NEWS_STATUS.DRAFT,
    updatedAt: getCurrentPersianDateTime(),
    updatedAtTimestamp: Date.now(),
  });

  if (!canUseStorage()) {
    memoryPreviewItem = normalizedPreviewItem;
    notifyNewsUpdated();
    return normalizedPreviewItem;
  }

  saveJsonToStorage(
    NEWS_PREVIEW_STORAGE_KEY,
    compactNewsItemForStorage(normalizedPreviewItem, { keepLargeImage: true }),
  );
  notifyNewsUpdated();
  return normalizedPreviewItem;
}

function getStaticNewsItems() {
  return normalizeNewsItems(
    (staticNewsItems || []).map((item, index) => ({
      ...item,
      id: item.id || `static-news-${index + 1}`,
      source: "static",
      status: NEWS_STATUS.PUBLISHED,
      createdAtTimestamp: item.createdAtTimestamp || 1,
      updatedAtTimestamp: item.updatedAtTimestamp || 1,
      publishedAtTimestamp: item.publishedAtTimestamp || 1,
    })),
  );
}

function mergeNewsItems(primaryItems = [], secondaryItems = []) {
  const map = new Map();

  [...primaryItems, ...secondaryItems].forEach((item) => {
    const normalized = normalizeNewsItem(item);
    map.set(String(normalized.id), normalized);
  });

  return sortNewest([...map.values()]);
}

function mapNewsRowToLocalItem(row = {}) {
  const publishedTimestamp = toTimestamp(row.published_at);
  const updatedTimestamp = toTimestamp(row.updated_at);
  const createdTimestamp = toTimestamp(row.created_at);

  return normalizeNewsItem({
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.content_html,
    contentHtml: row.content_html,
    image: row.image,
    category: row.category,
    status: LOCAL_STATUS[row.status] || NEWS_STATUS.DRAFT,
    isImportant: row.is_important,
    views: row.views,
    author: row.author,
    source: row.source || "committee",
    draftRevision: row.draft_revision,
    metadata: row.metadata,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    publishedAt: row.published_at || "",
    date: row.published_at || "",
    createdAtTimestamp: createdTimestamp || Date.now(),
    updatedAtTimestamp: updatedTimestamp || createdTimestamp || Date.now(),
    publishedAtTimestamp: publishedTimestamp,
  });
}

function buildNewsRowPayload(newsItem = {}) {
  const normalized = normalizeNewsItem(newsItem);
  const dbStatus = normalizeDbStatus(normalized.status);

  const payload = {
    title: normalized.title,
    summary: normalized.summary,
    content_html:
      normalized.contentHtml ||
      (Array.isArray(normalized.body)
        ? normalized.body.map((item) => `<p>${item}</p>`).join("")
        : ""),
    image: normalized.image || "",
    category: normalized.category,
    status: dbStatus,
    is_important: normalized.isImportant,
    views: Number(normalized.views || 0),
    author: normalized.author,
    source: normalized.source || "committee",
    draft_revision: normalized.draftRevision || null,
    metadata: normalized.metadata || {},
    updated_at: new Date().toISOString(),
  };

  if (isUuid(normalized.id)) {
    payload.id = normalized.id;
  }

  if (dbStatus === "published") {
    payload.published_at = new Date().toISOString();
  } else if (!normalized.publishedAt) {
    payload.published_at = null;
  }

  return payload;
}

async function getActiveUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

async function fetchSiteNewsRowsFromSupabase() {
  const { data, error } = await supabase
    .from("site_news")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Supabase site_news fetch failed:", error.message);
    return null;
  }

  return Array.isArray(data) ? data : [];
}

async function syncNewsItemToSupabase(newsItem = {}, action = "upsert") {
  const normalized = normalizeNewsItem(newsItem);

  if (!isUuid(normalized.id)) {
    console.warn(
      "News sync skipped because news id is not UUID:",
      normalized.id,
    );
    return null;
  }

  const payload = buildNewsRowPayload(normalized);
  const userId = await getActiveUserId();

  if (userId) {
    if (action === "create") payload.created_by = userId;
    payload.updated_by = userId;

    if (normalizeDbStatus(normalized.status) === "published") {
      payload.published_by = userId;
    }
  }

  const { data, error } = await supabase
    .from("site_news")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.warn("Supabase site_news sync failed:", error.message);
    return null;
  }

  return data ? mapNewsRowToLocalItem(data) : normalized;
}

async function deleteNewsItemFromSupabase(newsItem = {}) {
  const id = typeof newsItem === "string" ? newsItem : newsItem?.id;

  if (!isUuid(id)) {
    return false;
  }

  const { error } = await supabase.from("site_news").delete().eq("id", id);

  if (error) {
    console.warn("Supabase site_news delete failed:", error.message);
    return false;
  }

  return true;
}

function syncNewsItemToSupabaseAsync(newsItem, action = "upsert") {
  syncNewsItemToSupabase(newsItem, action).then((syncedItem) => {
    if (!syncedItem) return;

    const merged = mergeNewsItems([syncedItem], getCommitteeNewsItems());
    writeStoredNewsItems(merged);
  });
}

export async function hydrateNewsItemsFromSupabase(options = {}) {
  if (hydratePromise && !options.force) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    const rows = await fetchSiteNewsRowsFromSupabase();

    if (!rows) {
      return getCommitteeNewsItems();
    }

    const items = rows.map(mapNewsRowToLocalItem);
    writeStoredNewsItems(items);
    return items;
  })().finally(() => {
    hydratePromise = null;
  });

  return hydratePromise;
}

export function getCommitteeNewsItems() {
  return sortNewest(readStoredNewsItems());
}

export function getPublishedCommitteeNewsItems() {
  return getCommitteeNewsItems().filter(
    (item) => item.status === NEWS_STATUS.PUBLISHED,
  );
}

export function getPublicNewsItems() {
  const committeeItems = getPublishedCommitteeNewsItems();

  if (committeeItems.length > 0) {
    return committeeItems;
  }

  return getStaticNewsItems();
}

export function getLatestPublicNewsItems(limit = 6) {
  return getPublicNewsItems().slice(0, limit);
}

export function getImportantPublicNewsItems(limit = 6) {
  return getPublicNewsItems()
    .filter((newsItem) => newsItem.isImportant)
    .slice(0, limit);
}

export function getEventPublicNewsItems(limit = 6) {
  return getLatestPublicNewsItems(limit);
}

export function getNewsItemById(newsId, options = {}) {
  const normalizedNewsId = String(newsId || "");

  if (normalizedNewsId === "preview" || options.includePreview) {
    const previewNewsItem = readPreviewNewsItem();

    if (previewNewsItem && normalizedNewsId === "preview") {
      return previewNewsItem;
    }
  }

  const items = options.includeDrafts
    ? mergeNewsItems(getCommitteeNewsItems(), getStaticNewsItems())
    : getPublicNewsItems();

  return items.find((item) => String(item.id) === normalizedNewsId) || null;
}

export function saveNewsPreviewItem(newsData = {}) {
  return writePreviewNewsItem(newsData);
}

export function getNewsPreviewItem() {
  return readPreviewNewsItem();
}

export function createNewsItem(newsData = {}, options = {}) {
  const nowTimestamp = Date.now();
  const status = options.publish
    ? NEWS_STATUS.PUBLISHED
    : normalizeStatus(newsData.status);

  const newsItem = normalizeNewsItem({
    ...newsData,
    id: newsData.id || makeId(),
    status,
    createdAt: newsData.createdAt || getCurrentPersianDateTime(),
    updatedAt: getCurrentPersianDateTime(),
    createdAtTimestamp: newsData.createdAtTimestamp || nowTimestamp,
    updatedAtTimestamp: nowTimestamp,
    publishedAtTimestamp:
      status === NEWS_STATUS.PUBLISHED
        ? newsData.publishedAtTimestamp || nowTimestamp
        : newsData.publishedAtTimestamp || 0,
    date:
      status === NEWS_STATUS.PUBLISHED
        ? newsData.date || getCurrentPersianDate()
        : newsData.date || "",
    publishedAt:
      status === NEWS_STATUS.PUBLISHED
        ? newsData.publishedAt || getCurrentPersianDate()
        : newsData.publishedAt || "",
  });

  writeStoredNewsItems([newsItem, ...getCommitteeNewsItems()]);
  syncNewsItemToSupabaseAsync(newsItem, "create");

  return newsItem;
}

export function updateNewsItem(newsId, updates = {}) {
  let updatedNewsItem = null;
  const nowTimestamp = Date.now();

  const updatedItems = getCommitteeNewsItems().map((item) => {
    if (String(item.id) !== String(newsId)) {
      return item;
    }

    updatedNewsItem = normalizeNewsItem({
      ...item,
      ...updates,
      id: item.id,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedNewsItem;
  });

  writeStoredNewsItems(updatedItems);

  if (updatedNewsItem) {
    syncNewsItemToSupabaseAsync(updatedNewsItem, "update");
  }

  return updatedNewsItem;
}

export function publishNewsItem(newsId) {
  const nowTimestamp = Date.now();

  return updateNewsItem(newsId, {
    status: NEWS_STATUS.PUBLISHED,
    publishedAt: getCurrentPersianDate(),
    date: getCurrentPersianDate(),
    publishedAtTimestamp: nowTimestamp,
    draftRevision: null,
  });
}

export function saveNewsDraftRevision(newsId, draftData = {}) {
  const targetNewsItem = getCommitteeNewsItems().find(
    (item) => String(item.id) === String(newsId),
  );

  if (!targetNewsItem) {
    return null;
  }

  return updateNewsItem(newsId, {
    draftRevision: {
      ...draftData,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: Date.now(),
    },
  });
}

export function publishNewsRevision(newsId, revisionData = null) {
  const targetNewsItem = getCommitteeNewsItems().find(
    (item) => String(item.id) === String(newsId),
  );

  if (!targetNewsItem) {
    return null;
  }

  const revisionPayload = revisionData || targetNewsItem.draftRevision;

  if (!revisionPayload) {
    return publishNewsItem(newsId);
  }

  return updateNewsItem(newsId, {
    ...revisionPayload,
    status: NEWS_STATUS.PUBLISHED,
    draftRevision: null,
    publishedAt: getCurrentPersianDate(),
    date: getCurrentPersianDate(),
    publishedAtTimestamp: Date.now(),
  });
}

export function deleteNewsItem(newsId) {
  const targetNewsItem = getCommitteeNewsItems().find(
    (item) => String(item.id) === String(newsId),
  );

  const updatedItems = getCommitteeNewsItems().filter(
    (item) => String(item.id) !== String(newsId),
  );

  writeStoredNewsItems(updatedItems);

  if (targetNewsItem) {
    deleteNewsItemFromSupabase(targetNewsItem);
  }

  return updatedItems;
}

export function incrementNewsViews(newsId) {
  const targetNewsItem = getCommitteeNewsItems().find(
    (item) => String(item.id) === String(newsId),
  );

  if (!targetNewsItem) {
    return getNewsItemById(newsId);
  }

  const updatedItem = updateNewsItem(newsId, {
    views: Number(targetNewsItem.views || 0) + 1,
  });

  return updatedItem || getNewsItemById(newsId);
}

export function getNewsStats() {
  const items = getCommitteeNewsItems();

  return {
    total: items.length,
    published: items.filter((item) => item.status === NEWS_STATUS.PUBLISHED)
      .length,
    draft: items.filter((item) => item.status !== NEWS_STATUS.PUBLISHED).length,
    important: items.filter((item) => item.isImportant).length,
  };
}

export function compactStoredNewsItems() {
  const compactItems = prepareNewsItemsForStorage(getCommitteeNewsItems(), {
    keepLargeImage: false,
  });

  if (canUseStorage()) {
    window.localStorage.removeItem(NEWS_PREVIEW_STORAGE_KEY);
    saveJsonToStorage(NEWS_STORAGE_KEY, compactItems);
  } else {
    memoryNewsItems = compactItems;
  }

  notifyNewsUpdated();
  return compactItems;
}

export function clearCommitteeNewsItems() {
  if (canUseStorage()) {
    window.localStorage.removeItem(NEWS_PREVIEW_STORAGE_KEY);
  }

  return writeStoredNewsItems([]);
}

function startAutoHydration() {
  if (typeof window === "undefined") return;

  const globalScope = typeof globalThis !== "undefined" ? globalThis : window;

  if (globalScope[AUTO_HYDRATE_FLAG]) {
    return;
  }

  globalScope[AUTO_HYDRATE_FLAG] = true;

  window.setTimeout(() => {
    hydrateNewsItemsFromSupabase({ force: true }).catch((error) => {
      console.warn("Auto hydrate site_news failed:", error?.message || error);
    });
  }, 0);
}

startAutoHydration();

export { NEWS_STORAGE_KEY, NEWS_PREVIEW_STORAGE_KEY, NEWS_UPDATED_EVENT };
