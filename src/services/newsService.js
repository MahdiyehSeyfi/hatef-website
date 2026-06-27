import { newsItems as staticNewsItems } from "../data/newsData";

const NEWS_STORAGE_KEY = "hatef_news_items";
const NEWS_PREVIEW_STORAGE_KEY = "hatef_news_preview_item";
const NEWS_UPDATED_EVENT = "hatef-news-updated";
const MAX_STORED_NEWS_ITEMS = 40;
const MAX_EMBEDDED_IMAGE_LENGTH = 320000;
const MAX_HTML_CONTENT_LENGTH = 160000;
const MAX_SUMMARY_LENGTH = 2500;

export const NEWS_CATEGORY_OPTIONS = [
  "اخبار و اطلاع‌رسانی",
  "فراخوان‌ها",
  "رویدادها",
  "دستاوردها",
  "حمایت‌ها و تسهیلات",
  "همکاری‌های فناورانه",
  "اطلاعیه‌های مهم",
];

let memoryNewsItems = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "news") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
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

function isEmbeddedImage(value = "") {
  return /^data:image\//i.test(String(value || ""));
}

function isQuotaError(error) {
  return (
    error?.name === "QuotaExceededError" ||
    error?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    String(error?.message || "")
      .toLowerCase()
      .includes("quota") ||
    String(error?.message || "").includes("exceeded the quota")
  );
}

function truncateValue(value = "", maxLength = 0) {
  const normalizedValue = String(value || "");

  if (!maxLength || normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return normalizedValue.slice(0, maxLength);
}

function sanitizeNewsHtml(value = "") {
  return truncateValue(
    String(value || "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
      .replace(/href=("|')\s*javascript:[\s\S]*?\1/gi, 'href="#"')
      .replace(/src=("|')\s*javascript:[\s\S]*?\1/gi, 'src=""'),
    MAX_HTML_CONTENT_LENGTH,
  );
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
    .replace(/\n\s+/g, "\n")
    .trim();
}

function normalizeBody(value, summary = "", contentHtml = "") {
  if (Array.isArray(value)) {
    return value
      .map((paragraph) => normalizeValue(paragraph))
      .filter(Boolean)
      .slice(0, 20);
  }

  const sourceText = contentHtml
    ? htmlToPlainText(contentHtml)
    : normalizeValue(value);

  if (!sourceText) {
    return summary ? [summary] : [];
  }

  return sourceText
    .split(/\n{2,}/)
    .map((paragraph) => normalizeValue(paragraph))
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeStatus(status) {
  const value = normalizeValue(status);

  if (value === "منتشر شده" || value === "published" || value === "public") {
    return "منتشر شده";
  }

  return "پیش‌نویس";
}

function getDefaultImage() {
  return staticNewsItems?.[0]?.image || "";
}

function normalizeCategory(category = "") {
  const normalizedCategory = normalizeValue(category, NEWS_CATEGORY_OPTIONS[0]);

  if (NEWS_CATEGORY_OPTIONS.includes(normalizedCategory)) {
    return normalizedCategory;
  }

  return normalizedCategory;
}

function normalizeTimestamp(value, fallbackValue = 0) {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallbackValue;
}

function normalizeImageForRuntime(image = "") {
  const normalizedImage = normalizeValue(image);

  if (!normalizedImage) {
    return getDefaultImage();
  }

  return normalizedImage;
}

function normalizeImageForStorage(image = "", stripEmbeddedImages = false) {
  const normalizedImage = normalizeValue(image);

  if (!normalizedImage) {
    return "";
  }

  if (!isEmbeddedImage(normalizedImage)) {
    return normalizedImage;
  }

  if (
    stripEmbeddedImages ||
    normalizedImage.length > MAX_EMBEDDED_IMAGE_LENGTH
  ) {
    return "";
  }

  return normalizedImage;
}

function normalizeNewsDraftRevision(draftRevision = null) {
  if (!draftRevision || typeof draftRevision !== "object") {
    return null;
  }

  const contentHtml = sanitizeNewsHtml(
    draftRevision.contentHtml ||
      draftRevision.html ||
      (typeof draftRevision.body === "string" &&
      /<[^>]+>/.test(draftRevision.body)
        ? draftRevision.body
        : ""),
  );

  const bodyText = contentHtml ? htmlToPlainText(contentHtml) : "";

  const summary = truncateValue(
    normalizeValue(
      draftRevision.summary,
      bodyText ||
        (Array.isArray(draftRevision.body) ? draftRevision.body[0] : ""),
    ),
    MAX_SUMMARY_LENGTH,
  );

  const body = normalizeBody(
    draftRevision.body || draftRevision.content,
    summary,
    contentHtml,
  );

  return {
    title: normalizeValue(draftRevision.title, "خبر جدید هاتف"),
    summary,
    body,
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
      draftRevision.updatedAtTimestamp || draftRevision.updatedAtMs,
      Date.now(),
    ),
  };
}

function compactNewsDraftRevisionForStorage(
  draftRevision = null,
  options = {},
) {
  const normalizedDraftRevision = normalizeNewsDraftRevision(draftRevision);

  if (!normalizedDraftRevision) {
    return null;
  }

  return {
    ...normalizedDraftRevision,
    image: normalizeImageForStorage(
      normalizedDraftRevision.image,
      options.stripEmbeddedImages,
    ),
    summary: truncateValue(normalizedDraftRevision.summary, MAX_SUMMARY_LENGTH),
    contentHtml: truncateValue(
      normalizedDraftRevision.contentHtml,
      MAX_HTML_CONTENT_LENGTH,
    ),
    body: Array.isArray(normalizedDraftRevision.body)
      ? normalizedDraftRevision.body
          .map((paragraph) => truncateValue(paragraph, 5000))
          .slice(0, 20)
      : normalizedDraftRevision.body,
  };
}

function normalizeNewsItem(newsItem = {}) {
  const source = newsItem.source || "committee";
  const isStaticItem = source === "static";
  const nowTimestamp = Date.now();
  const fallbackTimestamp = isStaticItem ? 0 : nowTimestamp;

  const contentHtml = sanitizeNewsHtml(
    newsItem.contentHtml ||
      newsItem.html ||
      (typeof newsItem.body === "string" && /<[^>]+>/.test(newsItem.body)
        ? newsItem.body
        : ""),
  );

  const bodyText = contentHtml ? htmlToPlainText(contentHtml) : "";

  const summary = truncateValue(
    normalizeValue(
      newsItem.summary,
      bodyText || (Array.isArray(newsItem.body) ? newsItem.body[0] : ""),
    ),
    MAX_SUMMARY_LENGTH,
  );

  const body = normalizeBody(
    newsItem.body || newsItem.content,
    summary,
    contentHtml,
  );

  const status = normalizeStatus(newsItem.status);
  const createdAtTimestamp = normalizeTimestamp(
    newsItem.createdAtTimestamp || newsItem.createdAtMs,
    fallbackTimestamp,
  );
  const updatedAtTimestamp = normalizeTimestamp(
    newsItem.updatedAtTimestamp || newsItem.updatedAtMs,
    createdAtTimestamp,
  );
  const publishedAtTimestamp = normalizeTimestamp(
    newsItem.publishedAtTimestamp || newsItem.publishedAtMs,
    status === "منتشر شده" ? updatedAtTimestamp || createdAtTimestamp : 0,
  );

  const date = normalizeValue(
    newsItem.date || newsItem.publishedAt,
    status === "منتشر شده" ? getCurrentPersianDate() : "",
  );

  return {
    id: newsItem.id || makeId(),
    title: normalizeValue(newsItem.title, "خبر جدید هاتف"),
    summary,
    body,
    contentHtml,
    image: normalizeImageForRuntime(newsItem.image || newsItem.coverImage),
    date,
    views: Number(newsItem.views || 0),
    status,
    category: normalizeCategory(newsItem.category),
    isImportant: normalizeBoolean(
      newsItem.isImportant || newsItem.important || newsItem.featured,
    ),
    author: normalizeValue(newsItem.author, "دبیرخانه هاتف"),
    createdAt: normalizeValue(newsItem.createdAt, getCurrentPersianDateTime()),
    updatedAt: normalizeValue(newsItem.updatedAt),
    publishedAt: normalizeValue(
      newsItem.publishedAt,
      status === "منتشر شده" ? date || getCurrentPersianDate() : "",
    ),
    createdAtTimestamp,
    updatedAtTimestamp,
    publishedAtTimestamp,
    draftRevision: normalizeNewsDraftRevision(newsItem.draftRevision),
    source,
  };
}

function normalizeNewsItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(Boolean).map(normalizeNewsItem);
}

function compactNewsItemForStorage(newsItem = {}, options = {}) {
  const normalizedItem = normalizeNewsItem(newsItem);

  return {
    ...normalizedItem,
    image: normalizeImageForStorage(
      normalizedItem.image,
      options.stripEmbeddedImages,
    ),
    summary: truncateValue(normalizedItem.summary, MAX_SUMMARY_LENGTH),
    contentHtml: truncateValue(
      normalizedItem.contentHtml,
      MAX_HTML_CONTENT_LENGTH,
    ),
    body: Array.isArray(normalizedItem.body)
      ? normalizedItem.body
          .map((paragraph) => truncateValue(paragraph, 5000))
          .slice(0, 20)
      : normalizedItem.body,
    draftRevision: compactNewsDraftRevisionForStorage(
      normalizedItem.draftRevision,
      options,
    ),
  };
}

function prepareNewsItemsForStorage(items = [], options = {}) {
  return normalizeNewsItems(items)
    .slice(0, MAX_STORED_NEWS_ITEMS)
    .map((item) => compactNewsItemForStorage(item, options));
}

function notifyNewsUpdated() {
  if (typeof window === "undefined" || !window.dispatchEvent) {
    return;
  }

  window.dispatchEvent(new CustomEvent(NEWS_UPDATED_EVENT));
}

function saveJsonToStorage(key, value, friendlyMessage) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (!isQuotaError(error)) {
      throw error;
    }

    throw new Error(
      friendlyMessage ||
        "فضای ذخیره‌سازی مرورگر پر شده است. تصویر خبر را کوچک‌تر کنید یا چند داده آزمایشی قدیمی را پاک کنید.",
    );
  }
}

function readStoredNewsItems() {
  if (!canUseStorage()) {
    return memoryNewsItems;
  }

  const storedValue = window.localStorage.getItem(NEWS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  return normalizeNewsItems(safeParseJson(storedValue, []));
}

function writeStoredNewsItems(items) {
  const normalizedItems = normalizeNewsItems(items);
  const compactItems = prepareNewsItemsForStorage(normalizedItems);

  if (!canUseStorage()) {
    memoryNewsItems = compactItems;
    notifyNewsUpdated();
    return compactItems;
  }

  try {
    saveJsonToStorage(NEWS_STORAGE_KEY, compactItems);
  } catch (firstError) {
    if (canUseStorage()) {
      window.localStorage.removeItem(NEWS_PREVIEW_STORAGE_KEY);
    }

    try {
      const extraCompactItems = prepareNewsItemsForStorage(normalizedItems, {
        stripEmbeddedImages: true,
      });

      saveJsonToStorage(
        NEWS_STORAGE_KEY,
        extraCompactItems,
        "فضای ذخیره‌سازی مرورگر پر شده است. خبر بدون تصویر ذخیره شدنی نیست؛ چند داده آزمایشی قدیمی را پاک کنید یا از آدرس تصویر استفاده کنید.",
      );
      notifyNewsUpdated();
      return extraCompactItems;
    } catch (secondError) {
      throw new Error(
        secondError?.message ||
          firstError?.message ||
          "ذخیره خبر انجام نشد چون فضای مرورگر پر است.",
      );
    }
  }

  notifyNewsUpdated();
  return compactItems;
}

function readPreviewNewsItem() {
  if (!canUseStorage()) {
    return null;
  }

  const storedValue = window.localStorage.getItem(NEWS_PREVIEW_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  return normalizeNewsItem(safeParseJson(storedValue, null) || {});
}

function writePreviewNewsItem(newsItem) {
  const normalizedPreviewItem = normalizeNewsItem({
    ...newsItem,
    id: "preview",
    status: "پیش‌نویس",
    source: "preview",
    date: "پیش‌نمایش",
    publishedAt: "پیش‌نمایش",
    createdAtTimestamp: Date.now(),
    updatedAtTimestamp: Date.now(),
    publishedAtTimestamp: Date.now(),
  });

  if (canUseStorage()) {
    try {
      saveJsonToStorage(
        NEWS_PREVIEW_STORAGE_KEY,
        compactNewsItemForStorage(normalizedPreviewItem),
      );
    } catch (firstError) {
      try {
        saveJsonToStorage(
          NEWS_PREVIEW_STORAGE_KEY,
          compactNewsItemForStorage(normalizedPreviewItem, {
            stripEmbeddedImages: true,
          }),
          "فضای ذخیره‌سازی مرورگر پر شده است. پیش‌نمایش بدون تصویر باز می‌شود؛ برای تصویر از فایل کوچک‌تر یا آدرس تصویر استفاده کنید.",
        );
      } catch (secondError) {
        throw new Error(secondError?.message || firstError?.message);
      }
    }
  }

  notifyNewsUpdated();
  return normalizedPreviewItem;
}

function sortNewest(items = []) {
  return [...items].sort((first, second) => {
    const firstTimestamp = Number(
      first.publishedAtTimestamp ||
        first.updatedAtTimestamp ||
        first.createdAtTimestamp ||
        0,
    );
    const secondTimestamp = Number(
      second.publishedAtTimestamp ||
        second.updatedAtTimestamp ||
        second.createdAtTimestamp ||
        0,
    );

    if (firstTimestamp !== secondTimestamp) {
      return secondTimestamp - firstTimestamp;
    }

    const firstKey = first.publishedAt || first.date || first.createdAt || "";
    const secondKey =
      second.publishedAt || second.date || second.createdAt || "";

    return String(secondKey).localeCompare(String(firstKey));
  });
}

function getStaticNewsItems() {
  return normalizeNewsItems(
    (staticNewsItems || []).map((item, index) => ({
      ...item,
      status: "منتشر شده",
      isImportant: normalizeBoolean(
        item.isImportant || item.important || item.featured,
      ),
      source: "static",
      createdAtTimestamp: index + 1,
      updatedAtTimestamp: index + 1,
      publishedAtTimestamp: index + 1,
    })),
  );
}

export function getCommitteeNewsItems() {
  return sortNewest(readStoredNewsItems());
}

export function getPublishedCommitteeNewsItems() {
  return getCommitteeNewsItems().filter((item) => item.status === "منتشر شده");
}

export function getPublicNewsItems() {
  return sortNewest([
    ...getPublishedCommitteeNewsItems(),
    ...getStaticNewsItems(),
  ]);
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
    ? [...getCommitteeNewsItems(), ...getStaticNewsItems()]
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
  const status = options.publish ? "منتشر شده" : newsData.status;
  const nowTimestamp = Date.now();

  const newsItem = normalizeNewsItem({
    ...newsData,
    id: newsData.id || makeId(),
    status,
    createdAt: newsData.createdAt || getCurrentPersianDateTime(),
    updatedAt: getCurrentPersianDateTime(),
    createdAtTimestamp: newsData.createdAtTimestamp || nowTimestamp,
    updatedAtTimestamp: nowTimestamp,
    publishedAtTimestamp:
      status === "منتشر شده"
        ? newsData.publishedAtTimestamp || nowTimestamp
        : newsData.publishedAtTimestamp || 0,
    date:
      status === "منتشر شده"
        ? newsData.date || getCurrentPersianDate()
        : newsData.date || "",
    publishedAt:
      status === "منتشر شده"
        ? newsData.publishedAt || getCurrentPersianDate()
        : newsData.publishedAt || "",
  });

  writeStoredNewsItems([newsItem, ...getCommitteeNewsItems()]);

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
      updatedAtTimestamp: updates.updatedAtTimestamp || nowTimestamp,
    });

    return updatedNewsItem;
  });

  writeStoredNewsItems(updatedItems);

  return updatedNewsItem;
}

export function publishNewsItem(newsId) {
  const nowTimestamp = Date.now();

  return updateNewsItem(newsId, {
    status: "منتشر شده",
    date: getCurrentPersianDate(),
    publishedAt: getCurrentPersianDate(),
    publishedAtTimestamp: nowTimestamp,
    updatedAtTimestamp: nowTimestamp,
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

  const nowTimestamp = Date.now();

  return updateNewsItem(newsId, {
    ...revisionPayload,
    status: "منتشر شده",
    date: getCurrentPersianDate(),
    publishedAt: getCurrentPersianDate(),
    publishedAtTimestamp: nowTimestamp,
    updatedAtTimestamp: nowTimestamp,
    draftRevision: null,
  });
}

export function deleteNewsItem(newsId) {
  const updatedItems = getCommitteeNewsItems().filter(
    (item) => String(item.id) !== String(newsId),
  );

  writeStoredNewsItems(updatedItems);

  return updatedItems;
}

export function incrementNewsViews(newsId) {
  const targetNewsItem = getCommitteeNewsItems().find(
    (item) => String(item.id) === String(newsId),
  );

  if (!targetNewsItem) {
    return getNewsItemById(newsId);
  }

  return updateNewsItem(newsId, {
    views: Number(targetNewsItem.views || 0) + 1,
  });
}

export function getNewsStats() {
  const items = getCommitteeNewsItems();

  return {
    total: items.length,
    published: items.filter((item) => item.status === "منتشر شده").length,
    drafts: items.filter((item) => item.status === "پیش‌نویس").length,
    important: items.filter((item) => item.isImportant).length,
  };
}

export function compactNewsStorage() {
  const compactItems = prepareNewsItemsForStorage(getCommitteeNewsItems(), {
    stripEmbeddedImages: true,
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

export { NEWS_STORAGE_KEY, NEWS_PREVIEW_STORAGE_KEY, NEWS_UPDATED_EVENT };
