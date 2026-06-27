import { addNotification } from "./notificationService";

const CONTACT_REQUESTS_STORAGE_KEY = "hatef_contact_requests";
const CONTACT_REQUESTS_UPDATED_EVENT = "hatef-contact-requests-updated";

export const CONTACT_REQUEST_STATUS = {
  NEW: "جدید",
  TRACKING: "در حال پیگیری",
  ANSWERED: "پاسخ داده شده",
};

let memoryContactRequests = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "contact-request") {
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

function normalizeStatus(status) {
  const value = normalizeValue(status);
  const validStatuses = Object.values(CONTACT_REQUEST_STATUS);

  if (validStatuses.includes(value)) {
    return value;
  }

  return CONTACT_REQUEST_STATUS.NEW;
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

function getCurrentPageInfo(pageInfo = {}) {
  if (typeof window === "undefined") {
    return {
      pageUrl: normalizeValue(pageInfo.pageUrl),
      pagePath: normalizeValue(pageInfo.pagePath),
    };
  }

  return {
    pageUrl: normalizeValue(pageInfo.pageUrl, window.location.href),
    pagePath: normalizeValue(
      pageInfo.pagePath,
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    ),
  };
}

function notifyContactRequestsUpdated() {
  if (typeof window === "undefined" || !window.dispatchEvent) {
    return;
  }

  window.dispatchEvent(new CustomEvent(CONTACT_REQUESTS_UPDATED_EVENT));
}

function normalizeContactRequest(request = {}) {
  const createdAtTimestamp = Number(request.createdAtTimestamp || Date.now());
  const updatedAtTimestamp = Number(
    request.updatedAtTimestamp ||
      request.repliedAtTimestamp ||
      createdAtTimestamp,
  );
  const pageInfo = getCurrentPageInfo(request);

  return {
    id: request.id || makeId(),
    requestNumber: normalizeValue(
      request.requestNumber,
      `CR-${String(createdAtTimestamp).slice(-8)}`,
    ),
    fullName: normalizeValue(request.fullName || request.name, "کاربر سایت"),
    email: normalizeValue(request.email),
    phone: normalizeValue(request.phone || request.mobile),
    subject: normalizeValue(request.subject, "درخواست تماس"),
    message: normalizeValue(request.message),
    sourceType: normalizeValue(request.sourceType, "contact"),
    sourceTitle: normalizeValue(request.sourceTitle, "فرم تماس سایت"),
    relatedId: normalizeValue(request.relatedId),
    relatedTitle: normalizeValue(request.relatedTitle),
    pageUrl: pageInfo.pageUrl,
    pagePath: pageInfo.pagePath,
    status: normalizeStatus(request.status),
    reply: normalizeValue(request.reply),
    replyBy: normalizeValue(request.replyBy),
    repliedAt: normalizeValue(request.repliedAt),
    repliedAtTimestamp: Number(request.repliedAtTimestamp || 0),
    createdAt: normalizeValue(request.createdAt, getCurrentPersianDateTime()),
    createdAtTimestamp,
    updatedAt: normalizeValue(
      request.updatedAt,
      request.createdAt || getCurrentPersianDateTime(),
    ),
    updatedAtTimestamp,
    origin: normalizeValue(request.origin, "guest-site-contact-form"),
    isGuestRequest: request.isGuestRequest !== false,
  };
}

function normalizeContactRequests(requests) {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.filter(Boolean).map(normalizeContactRequest);
}

function sortNewest(requests = []) {
  return [...requests].sort(
    (first, second) =>
      Number(second.createdAtTimestamp || 0) -
      Number(first.createdAtTimestamp || 0),
  );
}

function readStoredContactRequests() {
  if (!canUseStorage()) {
    return memoryContactRequests;
  }

  const storedValue = window.localStorage.getItem(CONTACT_REQUESTS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  return normalizeContactRequests(safeParseJson(storedValue, []));
}

function writeStoredContactRequests(requests) {
  const normalizedRequests = sortNewest(normalizeContactRequests(requests));

  if (!canUseStorage()) {
    memoryContactRequests = normalizedRequests;
    notifyContactRequestsUpdated();
    return normalizedRequests;
  }

  window.localStorage.setItem(
    CONTACT_REQUESTS_STORAGE_KEY,
    JSON.stringify(normalizedRequests),
  );

  notifyContactRequestsUpdated();
  return normalizedRequests;
}

function notifyCommitteeAboutGuestContactRequest(request) {
  addNotification({
    targetRole: "committee",
    title: "درخواست جدید از فرم تماس سایت",
    body: `${request.sourceTitle || "فرم تماس سایت"} - ${request.fullName || "کاربر سایت"}: ${request.subject}`,
    category: "درخواست‌ها",
    sourceType: "guest-contact-request",
    sourceId: request.id,
    isImportant: true,
  });
}

export function getContactRequests() {
  return sortNewest(readStoredContactRequests());
}

export function getContactRequestById(requestId) {
  return (
    getContactRequests().find(
      (request) => String(request.id) === String(requestId),
    ) || null
  );
}

export function createContactRequest(requestData = {}) {
  const nowTimestamp = Date.now();
  const newRequest = normalizeContactRequest({
    ...requestData,
    id: requestData.id || makeId(),
    status: CONTACT_REQUEST_STATUS.NEW,
    createdAt: requestData.createdAt || getCurrentPersianDateTime(),
    createdAtTimestamp: requestData.createdAtTimestamp || nowTimestamp,
    updatedAt: getCurrentPersianDateTime(),
    updatedAtTimestamp: nowTimestamp,
    origin: "guest-site-contact-form",
    isGuestRequest: true,
  });

  writeStoredContactRequests([newRequest, ...getContactRequests()]);
  notifyCommitteeAboutGuestContactRequest(newRequest);

  return newRequest;
}

export function updateContactRequest(requestId, updates = {}) {
  let updatedRequest = null;
  const nowTimestamp = Date.now();

  const updatedRequests = getContactRequests().map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    updatedRequest = normalizeContactRequest({
      ...request,
      ...updates,
      id: request.id,
      createdAt: request.createdAt,
      createdAtTimestamp: request.createdAtTimestamp,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedRequest;
  });

  writeStoredContactRequests(updatedRequests);
  return updatedRequest;
}

export function markContactRequestTracking(requestId) {
  return updateContactRequest(requestId, {
    status: CONTACT_REQUEST_STATUS.TRACKING,
  });
}

export function saveContactRequestReply(
  requestId,
  reply = "",
  replyBy = "کمیته هاتف",
) {
  const normalizedReply = normalizeValue(reply);

  if (!normalizedReply) {
    throw new Error("متن پاسخ را وارد کنید.");
  }

  const nowTimestamp = Date.now();

  return updateContactRequest(requestId, {
    status: CONTACT_REQUEST_STATUS.ANSWERED,
    reply: normalizedReply,
    replyBy,
    repliedAt: getCurrentPersianDateTime(),
    repliedAtTimestamp: nowTimestamp,
  });
}

export function deleteContactRequest(requestId) {
  const updatedRequests = getContactRequests().filter(
    (request) => String(request.id) !== String(requestId),
  );

  writeStoredContactRequests(updatedRequests);
  return updatedRequests;
}

export function getContactRequestStats() {
  const requests = getContactRequests();

  return {
    total: requests.length,
    new: requests.filter(
      (request) => request.status === CONTACT_REQUEST_STATUS.NEW,
    ).length,
    tracking: requests.filter(
      (request) => request.status === CONTACT_REQUEST_STATUS.TRACKING,
    ).length,
    answered: requests.filter(
      (request) => request.status === CONTACT_REQUEST_STATUS.ANSWERED,
    ).length,
  };
}

export function clearContactRequests() {
  return writeStoredContactRequests([]);
}

export { CONTACT_REQUESTS_STORAGE_KEY, CONTACT_REQUESTS_UPDATED_EVENT };
