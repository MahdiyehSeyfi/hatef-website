import { addNotification } from "./notificationService";
import {
  fetchSitePublicationRequestsFromSupabase,
  syncSitePublicationRequestToSupabase,
} from "./supabaseSitePublicationService";

const SITE_PUBLICATION_REQUESTS_STORAGE_KEY = "hatef_site_publication_requests";
const SITE_PUBLICATION_PREVIEW_STORAGE_KEY = "hatef_site_publication_preview";
const SITE_PUBLICATION_REQUESTS_UPDATED_EVENT =
  "hatef-site-publication-requests-updated";

export const SITE_PUBLICATION_STATUS = {
  WAITING_FOR_INNOVATOR: "در انتظار تکمیل فناور",
  SUBMITTED_TO_COMMITTEE: "ارسال شده برای بررسی کمیته",
  NEEDS_REVISION: "نیازمند اصلاح",
  PUBLISHED: "منتشر شده در سایت",
};

export const SITE_PUBLICATION_DESTINATIONS = {
  OPPORTUNITIES: "فرصت‌های همکاری",
  SUCCESSFUL_PROJECTS: "پروژه‌ها و دستاوردهای موفق",
};

export const SITE_PUBLICATION_TYPES = {
  COMMERCIAL_OPPORTUNITY: "موقعیت تجاری",
  SUCCESSFUL_PROJECT: "پروژه موفق",
};

export const SITE_PUBLICATION_DISPLAY_GROUPS = [
  "طرح‌های درخشان",
  "طرح‌های جدید",
  "طرح‌های در حال رشد",
];

export const SITE_PUBLICATION_FIELD_OPTIONS = [
  "انرژی و محیط زیست",
  "هوش مصنوعی و داده",
  "سلامت و تجهیزات پزشکی",
  "کشاورزی و صنایع غذایی",
  "صنعت و تولید پیشرفته",
  "آب، اقلیم و منابع طبیعی",
  "حمل‌ونقل و لجستیک",
  "فناوری مالی و کسب‌وکار دیجیتال",
  "آموزش و سرمایه انسانی",
  "سایر حوزه‌های فناورانه",
];

export const INVESTMENT_NEED_OPTIONS = [
  "بدون نیاز فوری به سرمایه",
  "نیازمند سرمایه اولیه",
  "نیازمند سرمایه برای پایلوت",
  "نیازمند سرمایه برای تولید نیمه‌صنعتی",
  "نیازمند سرمایه برای توسعه بازار",
  "نیازمند برآورد دقیق سرمایه",
];

export const COOPERATION_NEED_OPTIONS = [
  "سرمایه‌گذاری",
  "پایلوت صنعتی",
  "تولید مشترک",
  "توسعه بازار",
  "منتورینگ تخصصی",
  "دسترسی به آزمایشگاه یا داده",
  "اخذ مجوز و استاندارد",
  "همکاری پژوهشی",
];

let memoryRequests = [];
let memoryPreview = null;

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function getComparableDestination(value = "") {
  const normalized = String(value || "").trim();

  if (
    normalized === SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES ||
    normalized === SITE_PUBLICATION_TYPES.COMMERCIAL_OPPORTUNITY ||
    normalized === "business_opportunity" ||
    normalized === "opportunities" ||
    normalized === "موقعیت‌های تجاری"
  ) {
    return SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES;
  }

  if (
    normalized === SITE_PUBLICATION_DESTINATIONS.SUCCESSFUL_PROJECTS ||
    normalized === SITE_PUBLICATION_TYPES.SUCCESSFUL_PROJECT ||
    normalized === "successful_project" ||
    normalized === "successful_projects"
  ) {
    return SITE_PUBLICATION_DESTINATIONS.SUCCESSFUL_PROJECTS;
  }

  return normalized;
}

function isSamePublicationRequest(first = {}, second = {}) {
  const firstId = String(first.supabaseId || first.id || "");
  const secondId = String(second.supabaseId || second.id || "");

  if (firstId && secondId && firstId === secondId) {
    return true;
  }

  const firstPlanId = String(first.planId || "");
  const secondPlanId = String(second.planId || "");

  if (
    isUuid(firstPlanId) &&
    isUuid(secondPlanId) &&
    firstPlanId === secondPlanId &&
    getComparableDestination(first.destination) ===
      getComparableDestination(second.destination)
  ) {
    return true;
  }

  const firstTrackingCode = String(first.trackingCode || "").trim();
  const secondTrackingCode = String(second.trackingCode || "").trim();

  if (
    firstTrackingCode &&
    secondTrackingCode &&
    firstTrackingCode === secondTrackingCode &&
    getComparableDestination(first.destination) ===
      getComparableDestination(second.destination)
  ) {
    return true;
  }

  const firstTitle = String(first.planTitle || first.title || "").trim();
  const secondTitle = String(second.planTitle || second.title || "").trim();

  return Boolean(
    firstTitle &&
    secondTitle &&
    firstTitle === secondTitle &&
    getComparableDestination(first.destination) ===
      getComparableDestination(second.destination),
  );
}

function mergeSyncedRequestIntoStorage(syncedRequest) {
  if (!syncedRequest) {
    return null;
  }

  const currentRequests = getSitePublicationRequests();
  const nextRequests = currentRequests.filter(
    (request) => !isSamePublicationRequest(request, syncedRequest),
  );
  const normalizedRequest = normalizeRequest(syncedRequest);

  writeRequests([normalizedRequest, ...nextRequests]);

  return normalizedRequest;
}

async function resolveRequestForSupabase(request = {}) {
  const normalizedRequest = normalizeRequest(request);

  if (
    isUuid(normalizedRequest.planId) &&
    isUuid(normalizedRequest.innovatorId)
  ) {
    return normalizedRequest;
  }

  const remoteRequests = await fetchSitePublicationRequestsFromSupabase();
  const matchedRemoteRequest = remoteRequests.find((remoteRequest) =>
    isSamePublicationRequest(normalizedRequest, remoteRequest),
  );

  if (!matchedRemoteRequest) {
    return normalizedRequest;
  }

  return normalizeRequest({
    ...matchedRemoteRequest,
    ...normalizedRequest,
    id: matchedRemoteRequest.id || normalizedRequest.id,
    supabaseId: matchedRemoteRequest.supabaseId || matchedRemoteRequest.id,
    planId: matchedRemoteRequest.planId || normalizedRequest.planId,
    innovatorId:
      matchedRemoteRequest.innovatorId || normalizedRequest.innovatorId,
    trackingCode:
      normalizedRequest.trackingCode || matchedRemoteRequest.trackingCode,
    planTitle: normalizedRequest.planTitle || matchedRemoteRequest.planTitle,
    destination:
      normalizedRequest.destination || matchedRemoteRequest.destination,
    publicationType:
      normalizedRequest.publicationType || matchedRemoteRequest.publicationType,
    draft: {
      ...(matchedRemoteRequest.draft || {}),
      ...(normalizedRequest.draft || {}),
    },
  });
}

export async function syncSitePublicationRequestNow(
  request,
  action = "upsert",
) {
  if (!request) {
    return null;
  }

  const resolvedRequest = await resolveRequestForSupabase(request);
  const syncedRequest = await syncSitePublicationRequestToSupabase(
    resolvedRequest,
    action,
  );

  if (!syncedRequest) {
    console.warn(
      "Supabase site publication request sync returned empty result.",
      {
        action,
        request: resolvedRequest,
      },
    );
    return null;
  }

  return mergeSyncedRequestIntoStorage(syncedRequest);
}

function syncSitePublicationRequestChange(request, action = "upsert") {
  if (!request) {
    return;
  }

  syncSitePublicationRequestNow(request, action).catch((error) => {
    console.warn(
      "Supabase site publication request sync failed:",
      error?.message || error,
    );
  });
}

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "site-publication") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeValue(value, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeTimestamp(value, fallback = 0) {
  const numericValue = Number(value || 0);

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
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

function sanitizeHtml(value = "") {
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

function normalizeStatus(status) {
  const value = normalizeValue(status);

  return Object.values(SITE_PUBLICATION_STATUS).includes(value)
    ? value
    : SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR;
}

function normalizeDestination(destination = "") {
  const value = normalizeValue(destination);

  return Object.values(SITE_PUBLICATION_DESTINATIONS).includes(value)
    ? value
    : SITE_PUBLICATION_DESTINATIONS.SUCCESSFUL_PROJECTS;
}

function normalizePublicationType(type = "", destination = "") {
  const value = normalizeValue(type);

  if (Object.values(SITE_PUBLICATION_TYPES).includes(value)) {
    return value;
  }

  return normalizeDestination(destination) ===
    SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES
    ? SITE_PUBLICATION_TYPES.COMMERCIAL_OPPORTUNITY
    : SITE_PUBLICATION_TYPES.SUCCESSFUL_PROJECT;
}

function normalizeField(field = "") {
  const value = normalizeValue(field);

  if (!value) {
    return "";
  }

  return SITE_PUBLICATION_FIELD_OPTIONS.includes(value)
    ? value
    : "سایر حوزه‌های فناورانه";
}

function normalizePercent(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return String(Math.max(0, Math.min(100, numericValue)));
}

function normalizeInvestmentNeed(value = "") {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return "";
  }

  return INVESTMENT_NEED_OPTIONS.includes(normalized)
    ? normalized
    : "نیازمند برآورد دقیق سرمایه";
}

function normalizeCooperationNeeds(value = []) {
  const items = Array.isArray(value) ? value : [value];

  return [
    ...new Set(
      items
        .flatMap((item) => String(item || "").split(/[،,\n]/))
        .map((item) => normalizeValue(item))
        .filter(Boolean),
    ),
  ];
}

function normalizeDisplayGroups(groups = []) {
  const items = Array.isArray(groups) ? groups : [groups];
  const normalizedItems = items
    .map((item) => normalizeValue(item))
    .filter(Boolean);

  if (normalizedItems.includes("همه")) {
    return [...SITE_PUBLICATION_DISPLAY_GROUPS];
  }

  const filtered = normalizedItems.filter((item) =>
    SITE_PUBLICATION_DISPLAY_GROUPS.includes(item),
  );

  return [...new Set(filtered)];
}

function normalizeReports(reports = []) {
  return (Array.isArray(reports) ? reports : [])
    .filter(Boolean)
    .map((report, index) => ({
      id: normalizeValue(report.id, `report-${index + 1}`),
      title: normalizeValue(report.title, `گزارش ${index + 1}`),
      status: normalizeValue(report.status, "تکمیل شده"),
      text: normalizeValue(report.text),
      type: report.fileUrl ? "file" : normalizeValue(report.type, "text"),
      fileName: normalizeValue(report.fileName),
      fileUrl: normalizeValue(report.fileUrl),
    }));
}

function normalizeDraft(draft = {}) {
  if (!draft || typeof draft !== "object") {
    return {
      title: "",
      summary: "",
      description: "",
      contentHtml: "",
      cooperationNeeds: [],
      cooperationNeedTypes: [],
      commercializationPercent: "",
      collaborationReadinessPercent: "",
      investmentNeed: "",
      field: "",
      image: "",
      reports: [],
      updatedAt: "",
      updatedAtTimestamp: 0,
    };
  }

  const contentHtml = sanitizeHtml(draft.contentHtml || draft.html || "");

  const cooperationNeedTypes = normalizeCooperationNeeds(
    draft.cooperationNeedTypes || draft.cooperationNeeds,
  );

  return {
    title: normalizeValue(draft.title),
    summary: normalizeValue(draft.summary),
    description: normalizeValue(
      draft.description,
      contentHtml ? htmlToPlainText(contentHtml) : "",
    ),
    contentHtml,
    cooperationNeeds: cooperationNeedTypes,
    cooperationNeedTypes,
    commercializationPercent: normalizePercent(draft.commercializationPercent),
    collaborationReadinessPercent: normalizePercent(
      draft.collaborationReadinessPercent,
    ),
    investmentNeed: normalizeInvestmentNeed(draft.investmentNeed),
    field: normalizeField(draft.field),
    image: normalizeValue(draft.image),
    reports: normalizeReports(draft.reports),
    updatedAt: normalizeValue(draft.updatedAt),
    updatedAtTimestamp: normalizeTimestamp(draft.updatedAtTimestamp, 0),
  };
}

function normalizeRequest(request = {}) {
  const nowTimestamp = Date.now();
  const destination = normalizeDestination(request.destination);

  const createdAtTimestamp = normalizeTimestamp(
    request.createdAtTimestamp || request.createdAtMs,
    nowTimestamp,
  );

  const updatedAtTimestamp = normalizeTimestamp(
    request.updatedAtTimestamp || request.updatedAtMs,
    createdAtTimestamp,
  );

  return {
    id: request.id || makeId(),
    planId: normalizeValue(request.planId),
    trackingCode: normalizeValue(request.trackingCode),
    planTitle: normalizeValue(request.planTitle, "طرح فناورانه"),
    field: normalizeField(request.field),
    callTitle: normalizeValue(request.callTitle || request.call),
    finalStatus: normalizeValue(request.finalStatus),
    committeeNote: normalizeValue(request.committeeNote),
    innovatorId: normalizeValue(request.innovatorId, "user-innovator-1"),
    innovatorName: normalizeValue(request.innovatorName, "فناور طرح"),
    innovatorOrganization: normalizeValue(request.innovatorOrganization),
    status: normalizeStatus(request.status),
    destination,
    publicationType: normalizePublicationType(
      request.publicationType || request.introducedType,
      destination,
    ),
    displayGroups: normalizeDisplayGroups(request.displayGroups),
    draft: normalizeDraft(request.draft),
    committeeFeedback: normalizeValue(request.committeeFeedback),
    publishedAt: normalizeValue(request.publishedAt),
    publishedAtTimestamp: normalizeTimestamp(request.publishedAtTimestamp, 0),
    createdAt: normalizeValue(request.createdAt, getCurrentPersianDateTime()),
    createdAtTimestamp,
    updatedAt: normalizeValue(
      request.updatedAt,
      request.createdAt || getCurrentPersianDateTime(),
    ),
    updatedAtTimestamp,
    notificationSent: normalizeBoolean(request.notificationSent),
    isVisibleToInnovator: request.isVisibleToInnovator !== false,
    isSitePublicationCandidate: normalizeBoolean(
      request.isSitePublicationCandidate ?? true,
    ),
  };
}

function normalizeRequests(requests) {
  return Array.isArray(requests)
    ? requests.filter(Boolean).map(normalizeRequest)
    : [];
}

function sortNewest(requests = []) {
  return [...requests].sort(
    (first, second) =>
      Number(second.updatedAtTimestamp || second.createdAtTimestamp || 0) -
      Number(first.updatedAtTimestamp || first.createdAtTimestamp || 0),
  );
}

function notifyUpdated() {
  if (typeof window === "undefined" || !window.dispatchEvent) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(SITE_PUBLICATION_REQUESTS_UPDATED_EVENT),
  );
}

function readRequests() {
  if (!canUseStorage()) {
    return memoryRequests;
  }

  const stored = window.localStorage.getItem(
    SITE_PUBLICATION_REQUESTS_STORAGE_KEY,
  );

  return stored ? normalizeRequests(safeParseJson(stored, [])) : [];
}

function writeRequests(requests) {
  const normalized = sortNewest(normalizeRequests(requests));

  if (!canUseStorage()) {
    memoryRequests = normalized;
    notifyUpdated();
    return normalized;
  }

  window.localStorage.setItem(
    SITE_PUBLICATION_REQUESTS_STORAGE_KEY,
    JSON.stringify(normalized),
  );

  notifyUpdated();
  return normalized;
}

function readPreviewRequest() {
  if (!canUseStorage()) {
    return memoryPreview;
  }

  const stored = window.localStorage.getItem(
    SITE_PUBLICATION_PREVIEW_STORAGE_KEY,
  );

  return stored ? normalizeRequest(safeParseJson(stored, null) || {}) : null;
}

function writePreviewRequest(request = {}) {
  const normalized = normalizeRequest({
    ...request,
    id: "preview",
    updatedAt: getCurrentPersianDateTime(),
    updatedAtTimestamp: Date.now(),
  });

  if (!canUseStorage()) {
    memoryPreview = normalized;
    notifyUpdated();
    return normalized;
  }

  window.localStorage.setItem(
    SITE_PUBLICATION_PREVIEW_STORAGE_KEY,
    JSON.stringify(normalized),
  );

  notifyUpdated();
  return normalized;
}

function getPlanId(plan = {}) {
  return normalizeValue(plan.sourceId || plan.planId || plan.id);
}

function getPlanTrackingCode(plan = {}) {
  return normalizeValue(plan.trackingId || plan.trackingCode || plan.code);
}

function getPlanTitle(plan = {}) {
  return normalizeValue(plan.title || plan.planTitle, "طرح فناورانه");
}

function getInnovatorIdFromPlan(plan = {}) {
  return normalizeValue(
    plan.innovatorId ||
      plan.ownerId ||
      plan.userId ||
      plan.senderId ||
      plan.innovator?.id ||
      "user-innovator-1",
  );
}

function getInnovatorNameFromPlan(plan = {}) {
  return normalizeValue(
    plan.innovatorName ||
      plan.senderName ||
      plan.userName ||
      plan.innovator?.name ||
      "فناور طرح",
  );
}

function getInnovatorOrganizationFromPlan(plan = {}) {
  return normalizeValue(
    plan.organization ||
      plan.innovatorOrganization ||
      plan.innovator?.organization,
  );
}

function notifyInnovatorCandidateCreated(request) {
  addNotification({
    targetUserId: request.innovatorId,
    targetRole: "innovator",
    title: "درخواست تکمیل اطلاعات طرح معرفی‌شده",
    body:
      request.destination === SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES
        ? `طرح «${request.planTitle}» برای معرفی به همکاران تجاری انتخاب شده است. لطفاً اطلاعات موقعیت تجاری را تکمیل و ارسال کنید.`
        : `طرح «${request.planTitle}» برای انتشار در سایت هاتف انتخاب شده است. لطفاً اطلاعات صفحه پروژه/دستاورد را تکمیل و ارسال کنید.`,
    category: "طرح‌های معرفی‌شده",
    sourceType: "site-publication-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyCommitteeDraftSubmitted(request) {
  addNotification({
    targetRole: "committee",
    title: "ارسال اطلاعات طرح معرفی‌شده توسط فناور",
    body: `فناور اطلاعات «${request.planTitle}» را برای بررسی کمیته ارسال کرد.`,
    category: "طرح‌های معرفی‌شده",
    sourceType: "site-publication-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyInnovatorRevisionRequested(request) {
  addNotification({
    targetUserId: request.innovatorId,
    targetRole: "innovator",
    title: "نیازمند اصلاح در اطلاعات طرح معرفی‌شده",
    body: `کمیته برای «${request.planTitle}» بازخورد اصلاحی ثبت کرد.`,
    category: "طرح‌های معرفی‌شده",
    sourceType: "site-publication-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyInnovatorPublished(request) {
  addNotification({
    targetUserId: request.innovatorId,
    targetRole: "innovator",
    title:
      request.destination === SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES
        ? "انتشار موقعیت تجاری طرح"
        : "انتشار صفحه طرح در سایت",
    body:
      request.destination === SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES
        ? `موقعیت تجاری طرح «${request.planTitle}» در پنل همکاران تجاری منتشر شد.`
        : `صفحه طرح «${request.planTitle}» در سایت هاتف منتشر شد.`,
    category: "طرح‌های معرفی‌شده",
    sourceType: "site-publication-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function makeIndicator(label, value, fallback = "ثبت نشده") {
  return {
    label,
    value: normalizeValue(value, fallback),
  };
}

function getFallbackImage() {
  return "/src/assets/images/banner/slide1.jpg";
}

function mapRequestToProject(request = {}) {
  const normalized = normalizeRequest(request);
  const draft = normalized.draft;

  const cooperationNeeds = draft.cooperationNeedTypes.length
    ? draft.cooperationNeedTypes
    : ["ثبت نشده"];

  return {
    id: normalized.id,
    title: normalizeValue(draft.title, normalized.planTitle),
    summary: normalizeValue(
      draft.summary,
      normalized.committeeNote || "این پروژه برای معرفی آماده‌سازی شده است.",
    ),
    description: normalizeValue(draft.description, "توضیحات طرح ثبت نشده است."),
    descriptionHtml: draft.contentHtml,
    image: normalizeValue(draft.image, getFallbackImage()),
    badge: normalizeValue(
      normalized.displayGroups?.[0],
      normalized.destination,
    ),
    publicationType: normalized.publicationType,
    displayGroups: normalized.displayGroups,
    group: normalizeValue(
      normalized.displayGroups?.[0],
      normalized.destination,
    ),
    field: normalizeValue(draft.field, normalized.field || "ثبت نشده"),
    date:
      normalized.publishedAt || normalized.updatedAt || normalized.createdAt,
    level: normalized.status,
    manager: "کمیته هاتف",
    proposalFile: "#",
    indicators: [
      makeIndicator(
        "آمادگی همکاری",
        draft.collaborationReadinessPercent
          ? `${draft.collaborationReadinessPercent}%`
          : "",
      ),
      makeIndicator(
        "ظرفیت تجاری‌سازی",
        draft.commercializationPercent
          ? `${draft.commercializationPercent}%`
          : "",
      ),
      makeIndicator("نیاز به سرمایه", draft.investmentNeed),
      makeIndicator("نیازمندی همکاری", cooperationNeeds[0]),
    ],
    cooperationNeeds,
    challenge: normalizeValue(
      draft.investmentNeed,
      "نیاز سرمایه یا بازار ثبت نشده است.",
    ),
    solution: normalizeValue(
      draft.description,
      "راهکار پیشنهادی در توضیحات پروژه ثبت شده است.",
    ),
    impact: normalizeValue(
      draft.summary,
      "اثرگذاری پروژه در خلاصه معرفی آمده است.",
    ),
    reports: draft.reports.length
      ? draft.reports
      : [
          {
            id: "report-1",
            title: "گزارش اولیه پروژه",
            status: "در حال تکمیل",
            text: "گزارشی برای این پروژه ثبت نشده است.",
            type: "text",
            fileName: "",
            fileUrl: "",
          },
        ],
  };
}

export function getSitePublicationRequests() {
  return sortNewest(readRequests());
}

export function getPlanSitePublicationRequestsByPlanId(planId) {
  const normalizedPlanId = String(planId || "");

  return getSitePublicationRequests().filter(
    (request) => String(request.planId) === normalizedPlanId,
  );
}

export function getPlanSitePublicationRequestByPlanId(planId, options = {}) {
  const normalizedPlanId = String(planId || "");
  const destination = options.destination
    ? normalizeDestination(options.destination)
    : "";

  return (
    getSitePublicationRequests().find((request) => {
      const isSamePlan = String(request.planId) === normalizedPlanId;
      const isSameDestination = destination
        ? request.destination === destination
        : true;

      return isSamePlan && isSameDestination;
    }) || null
  );
}

export function hasProjectPublicationCandidateForPlan(planId, options = {}) {
  return Boolean(getPlanSitePublicationRequestByPlanId(planId, options));
}

export function getSitePublicationRequestsByInnovator(innovatorId) {
  const normalizedInnovatorId = String(innovatorId || "");

  return getSitePublicationRequests().filter(
    (request) =>
      String(request.innovatorId) === normalizedInnovatorId &&
      request.isVisibleToInnovator !== false,
  );
}

export function upsertSitePublicationCandidateFromPlan(
  plan = {},
  options = {},
) {
  const planId = getPlanId(plan);

  if (!planId) {
    throw new Error("شناسه طرح برای ایجاد درخواست معرفی مشخص نیست.");
  }

  const destination = normalizeDestination(options.destination);

  const existingRequest = getPlanSitePublicationRequestByPlanId(planId, {
    destination,
  });

  const nowTimestamp = Date.now();
  const shouldNotifyInnovator = options.notifyInnovator !== false;
  const shouldSendNotification =
    shouldNotifyInnovator && !existingRequest?.notificationSent;

  const nextRequest = normalizeRequest({
    ...(existingRequest || {}),
    id: existingRequest?.id || makeId(),
    planId,
    trackingCode: getPlanTrackingCode(plan),
    planTitle: getPlanTitle(plan),
    field: normalizeValue(plan.field),
    callTitle: normalizeValue(plan.call || plan.callTitle),
    finalStatus: normalizeValue(options.finalStatus || plan.finalStatus),
    committeeNote: normalizeValue(
      options.committeeNote || plan.committeeFeedback,
    ),
    innovatorId: getInnovatorIdFromPlan(plan),
    innovatorName: getInnovatorNameFromPlan(plan),
    innovatorOrganization: getInnovatorOrganizationFromPlan(plan),
    status:
      existingRequest?.status || SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR,
    destination,
    publicationType: normalizePublicationType(
      options.publicationType,
      destination,
    ),
    displayGroups: existingRequest?.displayGroups || [],
    createdAt: existingRequest?.createdAt || getCurrentPersianDateTime(),
    createdAtTimestamp: existingRequest?.createdAtTimestamp || nowTimestamp,
    updatedAt: getCurrentPersianDateTime(),
    updatedAtTimestamp: nowTimestamp,
    notificationSent:
      existingRequest?.notificationSent || shouldSendNotification,
    isVisibleToInnovator:
      shouldNotifyInnovator || Boolean(existingRequest?.isVisibleToInnovator),
    isSitePublicationCandidate: true,
  });

  const otherRequests = getSitePublicationRequests().filter(
    (request) =>
      String(request.planId) !== String(planId) ||
      request.destination !== destination,
  );

  writeRequests([nextRequest, ...otherRequests]);

  syncSitePublicationRequestChange(nextRequest, "upsertCandidate");

  if (shouldSendNotification) {
    notifyInnovatorCandidateCreated(nextRequest);
  }

  return nextRequest;
}

export function cancelSitePublicationCandidate(planId, options = {}) {
  const normalizedPlanId = String(planId || "");
  const destination = options.destination
    ? normalizeDestination(options.destination)
    : "";

  const updatedRequests = getSitePublicationRequests().filter((request) => {
    const isSamePlan = String(request.planId) === normalizedPlanId;
    const isSameDestination = destination
      ? request.destination === destination
      : true;

    return !(isSamePlan && isSameDestination);
  });

  writeRequests(updatedRequests);
  return updatedRequests;
}

export function saveSitePublicationDraft(requestId, draftData = {}) {
  let updatedRequest = null;
  const nowTimestamp = Date.now();

  const updatedRequests = getSitePublicationRequests().map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    updatedRequest = normalizeRequest({
      ...request,
      draft: {
        ...request.draft,
        ...draftData,
        updatedAt: getCurrentPersianDateTime(),
        updatedAtTimestamp: nowTimestamp,
      },
      status:
        request.status === SITE_PUBLICATION_STATUS.PUBLISHED
          ? request.status
          : SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedRequest;
  });

  writeRequests(updatedRequests);

  if (updatedRequest) {
    syncSitePublicationRequestChange(updatedRequest, "saveDraft");
  }

  return updatedRequest;
}

export function submitSitePublicationDraft(requestId, draftData = {}) {
  let updatedRequest = null;
  const nowTimestamp = Date.now();

  const updatedRequests = getSitePublicationRequests().map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    updatedRequest = normalizeRequest({
      ...request,
      draft: {
        ...request.draft,
        ...draftData,
        updatedAt: getCurrentPersianDateTime(),
        updatedAtTimestamp: nowTimestamp,
      },
      status: SITE_PUBLICATION_STATUS.SUBMITTED_TO_COMMITTEE,
      committeeFeedback: "",
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedRequest;
  });

  writeRequests(updatedRequests);

  if (updatedRequest) {
    syncSitePublicationRequestChange(updatedRequest, "submit");
    notifyCommitteeDraftSubmitted(updatedRequest);
  }

  return updatedRequest;
}

export function saveSitePublicationPreviewItem(requestData = {}) {
  return writePreviewRequest(requestData);
}

export function getSitePublicationPreviewProject() {
  const preview = readPreviewRequest();

  return preview ? mapRequestToProject(preview) : null;
}

export function returnSitePublicationForRevision(requestId, feedback = "") {
  const normalizedFeedback = normalizeValue(feedback);

  if (!normalizedFeedback) {
    throw new Error("برای ارسال اصلاح، ثبت بازخورد الزامی است.");
  }

  let updatedRequest = null;
  const nowTimestamp = Date.now();

  const updatedRequests = getSitePublicationRequests().map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    updatedRequest = normalizeRequest({
      ...request,
      status: SITE_PUBLICATION_STATUS.NEEDS_REVISION,
      committeeFeedback: normalizedFeedback,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedRequest;
  });

  writeRequests(updatedRequests);

  if (updatedRequest) {
    syncSitePublicationRequestChange(updatedRequest, "return");
    notifyInnovatorRevisionRequested(updatedRequest);
  }

  return updatedRequest;
}

export function publishSitePublicationRequest(requestId, options = {}) {
  let updatedRequest = null;
  let shouldNotifyPublished = false;
  const nowTimestamp = Date.now();

  const hasDisplayGroupsOption = Object.prototype.hasOwnProperty.call(
    options,
    "displayGroups",
  );

  const updatedRequests = getSitePublicationRequests().map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    const wasAlreadyPublished =
      request.status === SITE_PUBLICATION_STATUS.PUBLISHED;

    shouldNotifyPublished = !wasAlreadyPublished;

    updatedRequest = normalizeRequest({
      ...request,
      destination: normalizeDestination(
        options.destination || request.destination,
      ),
      displayGroups: hasDisplayGroupsOption
        ? normalizeDisplayGroups(options.displayGroups)
        : normalizeDisplayGroups(request.displayGroups || []),
      status: SITE_PUBLICATION_STATUS.PUBLISHED,
      committeeFeedback: "",
      publishedAt: wasAlreadyPublished
        ? request.publishedAt || getCurrentPersianDateTime()
        : getCurrentPersianDateTime(),
      publishedAtTimestamp: wasAlreadyPublished
        ? request.publishedAtTimestamp || nowTimestamp
        : nowTimestamp,
      updatedAt: getCurrentPersianDateTime(),
      updatedAtTimestamp: nowTimestamp,
    });

    return updatedRequest;
  });

  writeRequests(updatedRequests);

  if (updatedRequest) {
    syncSitePublicationRequestChange(updatedRequest, "publish");
  }

  if (updatedRequest && shouldNotifyPublished) {
    notifyInnovatorPublished(updatedRequest);
  }

  return updatedRequest;
}

export function getPublishedSitePublicationRequests() {
  return getSitePublicationRequests().filter(
    (request) => request.status === SITE_PUBLICATION_STATUS.PUBLISHED,
  );
}

export function getPublishedSitePublicationProjects() {
  return getPublishedSuccessfulProjectItems();
}

export function getPublishedCommercialOpportunityProjects() {
  return getPublishedSitePublicationRequests()
    .filter(
      (request) =>
        request.destination === SITE_PUBLICATION_DESTINATIONS.OPPORTUNITIES,
    )
    .map(mapRequestToProject);
}

export function getPublishedSuccessfulProjectItems() {
  return getPublishedSitePublicationRequests()
    .filter(
      (request) =>
        request.destination ===
        SITE_PUBLICATION_DESTINATIONS.SUCCESSFUL_PROJECTS,
    )
    .map(mapRequestToProject);
}

export function getPublishedSitePublicationProjectById(projectId) {
  const request = getPublishedSitePublicationRequests().find(
    (item) =>
      String(item.id) === String(projectId || "") &&
      item.destination === SITE_PUBLICATION_DESTINATIONS.SUCCESSFUL_PROJECTS,
  );

  return request ? mapRequestToProject(request) : null;
}

export function getSitePublicationStats() {
  const requests = getSitePublicationRequests();

  return {
    total: requests.length,
    waitingForInnovator: requests.filter(
      (request) =>
        request.status === SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR,
    ).length,
    submittedToCommittee: requests.filter(
      (request) =>
        request.status === SITE_PUBLICATION_STATUS.SUBMITTED_TO_COMMITTEE,
    ).length,
    needsRevision: requests.filter(
      (request) => request.status === SITE_PUBLICATION_STATUS.NEEDS_REVISION,
    ).length,
    published: requests.filter(
      (request) => request.status === SITE_PUBLICATION_STATUS.PUBLISHED,
    ).length,
  };
}

export function clearSitePublicationRequests() {
  return writeRequests([]);
}

export {
  SITE_PUBLICATION_REQUESTS_STORAGE_KEY,
  SITE_PUBLICATION_PREVIEW_STORAGE_KEY,
  SITE_PUBLICATION_REQUESTS_UPDATED_EVENT,
};
