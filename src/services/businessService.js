import { getCurrentUser } from "./authService";
import { addNotification } from "./notificationService";
import { getPlans } from "./planService";
import {
  syncBusinessCollaborationRequestToSupabase,
  syncBusinessCollaborationRequestUpdateToSupabase,
} from "./supabaseBusinessRequestService";

const BUSINESS_PARTNERS_STORAGE_KEY = "hatef_business_partners";
const BUSINESS_OPPORTUNITIES_STORAGE_KEY = "hatef_business_opportunities";
const BUSINESS_REQUESTS_STORAGE_KEY = "hatef_business_collaboration_requests";

const BUSINESS_REQUEST_STATUS = {
  WAITING: "در انتظار پیگیری",
  TRACKING: "در حال پیگیری",
  NEEDS_INFO: "نیازمند تکمیل اطلاعات",
  ANSWERED: "پاسخ داده شده",
};

let memoryPartners = [];
let memoryOpportunities = [];
let memoryRequests = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "business-request") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function getTodayPersianDate() {
  try {
    return new Date().toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
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

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function readCollection(storageKey, memoryItems) {
  if (!canUseStorage()) {
    return Array.isArray(memoryItems) ? memoryItems : [];
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  if (!Array.isArray(parsedValue)) {
    window.localStorage.setItem(storageKey, JSON.stringify([]));
    return [];
  }

  return parsedValue;
}

function writeCollection(storageKey, items, memorySetter) {
  const normalizedItems = Array.isArray(items) ? items : [];

  if (!canUseStorage()) {
    memorySetter(normalizedItems);
    return normalizedItems;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizedItems));
  return normalizedItems;
}

function normalizeArray(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[،,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "همکار تجاری"
  );
}

function getFinalStatusLabel(finalStatus) {
  const statusMap = {
    accepted: "قبول",
    weakAccepted: "قبول ضعیف",
    weak_accepted: "قبول ضعیف",
    rejected: "رد",
    weakRejected: "رد ضعیف",
    weak_rejected: "رد ضعیف",
    needsRevision: "نیازمند اصلاح",
    needs_revision: "نیازمند اصلاح",
    قبول: "قبول",
    "قبول ضعیف": "قبول ضعیف",
    رد: "رد",
    "رد ضعیف": "رد ضعیف",
    "نیازمند اصلاح": "نیازمند اصلاح",
  };

  return statusMap[finalStatus] || "منتشر شده";
}

function isFinalBusinessStatus(status) {
  return [
    BUSINESS_REQUEST_STATUS.ANSWERED,
    "پاسخ نهایی داده شده",
    "final_answered",
    "answered",
  ].includes(status);
}

function isNeedsInfoBusinessStatus(status) {
  return [
    BUSINESS_REQUEST_STATUS.NEEDS_INFO,
    "نیازمند اصلاح",
    "needs_info",
    "needs_revision",
  ].includes(status);
}

function normalizePartner(partner = {}) {
  return {
    id: partner.id || partner.userId || makeId("business"),
    userId: partner.userId || partner.id || "",
    name: partner.name || partner.fullName || "همکار تجاری",
    role: partner.role || "همکار تجاری",
    organization: partner.organization || partner.company || "ثبت نشده",
    field: partner.field || partner.expertise || "همکاری تجاری",
    email: partner.email || "ثبت نشده",
    phone: partner.phone || partner.mobile || "ثبت نشده",
    joinedAt:
      partner.joinedAt || partner.createdAt || getCurrentPersianDateTime(),
    viewedOpportunities: Number(partner.viewedOpportunities || 0),
    favoriteOpportunities: Number(partner.favoriteOpportunities || 0),
    activeCollaborations: Number(partner.activeCollaborations || 0),
  };
}

function normalizeOpportunity(opportunity = {}) {
  const field = opportunity.field || opportunity.category || "";
  const category = opportunity.category || opportunity.field || "";
  const summary = opportunity.summary || opportunity.description || "";

  return {
    id: opportunity.id || opportunity.planId || makeId("business-opportunity"),
    planId: opportunity.planId || opportunity.id || "",
    title: opportunity.title || "موقعیت همکاری تجاری",
    field,
    category,
    collaborationType: opportunity.collaborationType || "",
    stage: opportunity.stage || "منتشر شده برای همکاری تجاری",
    status: opportunity.status || "منتشر شده",
    owner: opportunity.owner || "",
    finalStatus: opportunity.finalStatus || "",
    finalStatusLabel:
      opportunity.finalStatusLabel ||
      getFinalStatusLabel(opportunity.finalStatus),
    publishedAt: opportunity.publishedAt || opportunity.date || "",
    date: opportunity.date || opportunity.publishedAt || "",
    trackingCode: opportunity.trackingCode || "",
    location: opportunity.location || "",
    estimatedSupport: opportunity.estimatedSupport || "",
    duration: opportunity.duration || "",
    summary,
    description: opportunity.description || opportunity.summary || "",
    descriptionHtml: opportunity.descriptionHtml || "",
    challenge: opportunity.challenge || "",
    solution: opportunity.solution || "",
    businessValue: opportunity.businessValue || "",
    collaborationReadiness: opportunity.collaborationReadiness || "",
    commercializationCapacity: opportunity.commercializationCapacity || "",
    requirements: normalizeArray(opportunity.requirements, []),
    tags: normalizeArray(opportunity.tags, []),
    reports: Array.isArray(opportunity.reports) ? opportunity.reports : [],
  };
}

function normalizeRequest(request = {}) {
  const normalizedStatus =
    request.status === "پاسخ نهایی داده شده"
      ? BUSINESS_REQUEST_STATUS.ANSWERED
      : request.status === "نیازمند اصلاح"
        ? BUSINESS_REQUEST_STATUS.NEEDS_INFO
        : request.status || BUSINESS_REQUEST_STATUS.WAITING;

  return {
    id: request.id || makeId(),
    partnerId: request.partnerId || request.partnerUserId || request.userId,
    partnerUserId: request.partnerUserId || request.userId || request.partnerId,
    opportunityId: request.opportunityId,
    title: request.title || "درخواست همکاری تجاری",
    opportunityTitle:
      request.opportunityTitle ||
      request.opportunityName ||
      request.title ||
      "موقعیت همکاری تجاری",
    opportunityField:
      request.opportunityField || request.field || "همکاری تجاری",
    collaborationType: request.collaborationType || "همکاری تجاری",
    message: request.message || request.description || "",
    sentAt: request.sentAt || request.createdAt || getCurrentPersianDateTime(),
    status: normalizedStatus,
    supportReply: request.supportReply || request.reply || "",
    repliedAt: request.repliedAt || "",
    revisionRound: Number(request.revisionRound || 0),
  };
}

function normalizePartners(partners) {
  return Array.isArray(partners) ? partners.map(normalizePartner) : [];
}

function normalizeOpportunities(opportunities) {
  return Array.isArray(opportunities)
    ? opportunities.map(normalizeOpportunity)
    : [];
}

function normalizeRequests(requests) {
  return Array.isArray(requests)
    ? requests
        .filter(
          (request) =>
            request &&
            (request.partnerId || request.partnerUserId || request.userId),
        )
        .map(normalizeRequest)
    : [];
}

function mapPlanToBusinessOpportunity(plan = {}) {
  const details = plan.businessOpportunityDetails || {};
  const field = details.field || details.category || plan.field || "";
  const summary = details.summary || details.description || "";
  const publishedAt = plan.businessPublishedAt || "";

  return normalizeOpportunity({
    id: plan.id,
    planId: plan.id,
    title: details.title || plan.title,
    field,
    category: details.category || details.field || field,
    collaborationType: details.collaborationType || "",
    stage: "منتشر شده برای همکاری تجاری",
    status: "منتشر شده",
    owner: details.owner || "دبیرخانه هاتف",
    finalStatus: plan.finalStatus,
    finalStatusLabel: getFinalStatusLabel(plan.finalStatus),
    publishedAt,
    date: publishedAt,
    trackingCode: plan.trackingCode || "",
    location: details.location || "",
    estimatedSupport: details.estimatedSupport || "",
    duration: details.duration || "",
    summary,
    description: details.description || details.summary || "",
    descriptionHtml: details.descriptionHtml || "",
    challenge: details.challenge || "",
    solution: details.solution || "",
    businessValue: details.businessValue || "",
    collaborationReadiness: details.collaborationReadiness || "",
    commercializationCapacity: details.commercializationCapacity || "",
    requirements: details.requirements || [],
    tags: details.tags || [],
    reports: details.reports || [],
  });
}

function getPlanDrivenBusinessOpportunities() {
  return getPlans()
    .filter(
      (plan) =>
        plan.resultsPublished &&
        plan.publishForBusiness &&
        plan.businessOpportunityPublished,
    )
    .map(mapPlanToBusinessOpportunity);
}

function findPlanByBusinessOpportunityId(opportunityId) {
  return (
    getPlans().find((plan) => String(plan.id) === String(opportunityId)) || null
  );
}

function getEmptyBusinessRequestStats(planId = "") {
  return {
    planId,
    total: 0,
    waiting: 0,
    tracking: 0,
    needsInfo: 0,
    answered: 0,
  };
}

function notifyInnovatorNewBusinessCollaborationRequest(request) {
  const plan = findPlanByBusinessOpportunityId(request.opportunityId);

  if (!plan?.innovatorId) {
    return;
  }

  addNotification({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "درخواست همکاری برای طرح شما ثبت شد",
    body: `برای طرح «${plan.title}» یک درخواست همکاری تجاری جدید ثبت شد.`,
    category: "همکاری تجاری",
    sourceType: "business-collaboration-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyPartnerRequestTracking(request) {
  addNotification({
    targetUserId: request.partnerUserId || request.partnerId,
    targetRole: "business",
    title: "درخواست همکاری در حال پیگیری است",
    body: `درخواست «${request.title}» توسط دبیرخانه مشاهده شد و وارد مرحله پیگیری شد.`,
    category: "همکاری تجاری",
    sourceType: "business-collaboration-request",
    sourceId: request.id,
    isImportant: false,
  });
}

function notifyPartnerRequestNeedsInfo(request) {
  addNotification({
    targetUserId: request.partnerUserId || request.partnerId,
    targetRole: "business",
    title: "درخواست نیازمند تکمیل اطلاعات است",
    body: `برای درخواست «${request.title}» پیام تکمیلی دبیرخانه ثبت شد. لطفاً اطلاعات خواسته‌شده را ارسال کنید.`,
    category: "همکاری تجاری",
    sourceType: "business-collaboration-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyPartnerRequestAnswered(request) {
  addNotification({
    targetUserId: request.partnerUserId || request.partnerId,
    targetRole: "business",
    title: "پاسخ نهایی درخواست همکاری ثبت شد",
    body: `برای درخواست «${request.title}» پاسخ دبیرخانه ثبت شد.`,
    category: "همکاری تجاری",
    sourceType: "business-collaboration-request",
    sourceId: request.id,
    isImportant: true,
  });
}

function notifyCommitteeRequestResubmitted(request) {
  addNotification({
    targetRole: "committee",
    title: "درخواست همکاری دوباره ارسال شد",
    body: `همکار تجاری اطلاعات تکمیلی درخواست «${request.title}» را ارسال کرد.`,
    category: "همکاران تجاری",
    sourceType: "business-collaboration-request",
    sourceId: request.id,
    isImportant: true,
  });
}

export function getBusinessPartners() {
  return normalizePartners(
    readCollection(BUSINESS_PARTNERS_STORAGE_KEY, memoryPartners),
  );
}

export function setBusinessPartners(partners) {
  const normalizedPartners = normalizePartners(partners);

  return writeCollection(
    BUSINESS_PARTNERS_STORAGE_KEY,
    normalizedPartners,
    (items) => {
      memoryPartners = items;
    },
  );
}

export function getBusinessOpportunityOverviews() {
  return getPlanDrivenBusinessOpportunities();
}

export function setBusinessOpportunityOverviews(opportunities) {
  const normalizedOpportunities = normalizeOpportunities(opportunities);

  return writeCollection(
    BUSINESS_OPPORTUNITIES_STORAGE_KEY,
    normalizedOpportunities,
    (items) => {
      memoryOpportunities = items;
    },
  );
}

export function getBusinessCollaborationRequests() {
  return normalizeRequests(
    readCollection(BUSINESS_REQUESTS_STORAGE_KEY, memoryRequests),
  );
}

export function setBusinessCollaborationRequests(requests) {
  const normalizedRequests = normalizeRequests(requests);

  return writeCollection(
    BUSINESS_REQUESTS_STORAGE_KEY,
    normalizedRequests,
    (items) => {
      memoryRequests = items;
    },
  );
}

export function isBusinessCollaborationRequestFinal(request) {
  return isFinalBusinessStatus(request?.status);
}

export function isBusinessCollaborationRequestEditable(request) {
  return isNeedsInfoBusinessStatus(request?.status);
}

export function getBusinessPartnerByUserId(userId) {
  return (
    getBusinessPartners().find(
      (partner) =>
        String(partner.userId) === String(userId) ||
        String(partner.id) === String(userId),
    ) || null
  );
}

export function createOrUpdateBusinessPartnerFromUser(user) {
  if (!user) {
    return null;
  }

  const partners = getBusinessPartners();
  const existingPartner = partners.find(
    (partner) =>
      String(partner.userId) === String(user.id) ||
      String(partner.id) === String(user.id) ||
      String(partner.email) === String(user.email),
  );

  const partnerData = normalizePartner({
    id: existingPartner?.id || user.id || makeId("business"),
    userId: user.id,
    name: getUserDisplayName(user),
    role: "همکار تجاری",
    organization: user.organization || user.company || "ثبت نشده",
    field: user.field || user.expertise || "همکاری تجاری",
    email: user.email || "ثبت نشده",
    phone: user.mobile || user.phone || "ثبت نشده",
    joinedAt:
      existingPartner?.joinedAt ||
      user.createdAt ||
      getCurrentPersianDateTime(),
    viewedOpportunities: existingPartner?.viewedOpportunities || 0,
    favoriteOpportunities: existingPartner?.favoriteOpportunities || 0,
    activeCollaborations: existingPartner?.activeCollaborations || 0,
  });

  const nextPartners = existingPartner
    ? partners.map((partner) =>
        String(partner.id) === String(existingPartner.id)
          ? partnerData
          : partner,
      )
    : [partnerData, ...partners];

  setBusinessPartners(nextPartners);

  return partnerData;
}

export function getCurrentBusinessPartner() {
  const currentUser = getCurrentUser?.();

  if (!currentUser) {
    return null;
  }

  return createOrUpdateBusinessPartnerFromUser(currentUser);
}

export function getBusinessPartnerProfiles() {
  const requests = getBusinessCollaborationRequests();

  return getBusinessPartners().map((partner) => {
    const partnerRequests = requests.filter(
      (request) =>
        String(request.partnerId) === String(partner.id) ||
        String(request.partnerUserId) === String(partner.userId),
    );

    const activeRequestCount = partnerRequests.filter(
      (request) => !isFinalBusinessStatus(request.status),
    ).length;

    return {
      ...partner,
      collaborationRequests: partnerRequests.length,
      activeCollaborations: Math.max(
        partner.activeCollaborations,
        activeRequestCount,
      ),
    };
  });
}

export function getBusinessCollaborationRequestsByPartnerId(partnerId) {
  return getBusinessCollaborationRequests().filter(
    (request) =>
      String(request.partnerId) === String(partnerId) ||
      String(request.partnerUserId) === String(partnerId),
  );
}

export function getCurrentBusinessCollaborationRequests() {
  const partner = getCurrentBusinessPartner();

  if (!partner) {
    return [];
  }

  return getBusinessCollaborationRequests().filter(
    (request) =>
      (String(request.partnerId) === String(partner.id) ||
        String(request.partnerUserId) === String(partner.userId)) &&
      !isFinalBusinessStatus(request.status),
  );
}

export function getCurrentBusinessCollaborationHistory() {
  const partner = getCurrentBusinessPartner();

  if (!partner) {
    return [];
  }

  return getBusinessCollaborationRequests().filter(
    (request) =>
      (String(request.partnerId) === String(partner.id) ||
        String(request.partnerUserId) === String(partner.userId)) &&
      isFinalBusinessStatus(request.status),
  );
}

export function getActiveBusinessCollaborationRequests() {
  return getBusinessCollaborationRequests().filter(
    (request) => !isFinalBusinessStatus(request.status),
  );
}

export function getBusinessCollaborationRequestHistory() {
  return getBusinessCollaborationRequests().filter((request) =>
    isFinalBusinessStatus(request.status),
  );
}

export function getBusinessCollaborationRequestStatsByPlanId(planId) {
  const normalizedPlanId = String(planId || "");

  if (!normalizedPlanId) {
    return getEmptyBusinessRequestStats(normalizedPlanId);
  }

  return getBusinessCollaborationRequests()
    .filter((request) => String(request.opportunityId) === normalizedPlanId)
    .reduce((stats, request) => {
      const nextStats = {
        ...stats,
        total: stats.total + 1,
      };

      if (request.status === BUSINESS_REQUEST_STATUS.WAITING) {
        nextStats.waiting += 1;
      } else if (request.status === BUSINESS_REQUEST_STATUS.TRACKING) {
        nextStats.tracking += 1;
      } else if (isNeedsInfoBusinessStatus(request.status)) {
        nextStats.needsInfo += 1;
      } else if (isFinalBusinessStatus(request.status)) {
        nextStats.answered += 1;
      }

      return nextStats;
    }, getEmptyBusinessRequestStats(normalizedPlanId));
}

export function getBusinessCollaborationRequestStatsForInnovator(innovatorId) {
  return getPlans()
    .filter((plan) => String(plan.innovatorId) === String(innovatorId))
    .map((plan) => ({
      planId: plan.id,
      planTitle: plan.title,
      trackingCode: plan.trackingCode || "",
      ...getBusinessCollaborationRequestStatsByPlanId(plan.id),
    }))
    .filter((item) => item.total > 0);
}

export function addBusinessCollaborationRequest(requestData = {}) {
  const partner =
    requestData.partnerId || requestData.partnerUserId
      ? null
      : getCurrentBusinessPartner();

  const partnerId = requestData.partnerId || partner?.id;
  const partnerUserId =
    requestData.partnerUserId || partner?.userId || partnerId;
  const requests = getBusinessCollaborationRequests();
  const opportunity = requestData.opportunity || null;

  const newRequest = normalizeRequest({
    ...requestData,
    id: requestData.id || makeId(),
    partnerId,
    partnerUserId,
    opportunityId:
      requestData.opportunityId || opportunity?.id || opportunity?.planId || "",
    title:
      requestData.title ||
      `درخواست همکاری برای ${
        opportunity?.title || requestData.opportunityTitle || "موقعیت همکاری"
      }`,
    opportunityTitle:
      requestData.opportunityTitle ||
      opportunity?.title ||
      "موقعیت همکاری تجاری",
    opportunityField:
      requestData.opportunityField || opportunity?.field || "همکاری تجاری",
    collaborationType:
      requestData.collaborationType ||
      opportunity?.collaborationType ||
      "همکاری تجاری",
    sentAt: requestData.sentAt || getCurrentPersianDateTime(),
    status: requestData.status || BUSINESS_REQUEST_STATUS.WAITING,
    supportReply: "",
    repliedAt: "",
    revisionRound: 0,
  });

  setBusinessCollaborationRequests([newRequest, ...requests]);

  addNotification({
    targetRole: "committee",
    title: "درخواست همکاری تجاری جدید",
    body: newRequest.title,
    category: "همکاران تجاری",
    sourceType: "business-collaboration-request",
    sourceId: newRequest.id,
    isImportant: true,
  });

  notifyInnovatorNewBusinessCollaborationRequest(newRequest);
  syncBusinessCollaborationRequestToSupabase(newRequest);

  return newRequest;
}

export function updateBusinessCollaborationRequest(requestId, updates = {}) {
  const requests = getBusinessCollaborationRequests();
  let updatedRequest = null;

  const updatedRequests = requests.map((request) => {
    if (String(request.id) !== String(requestId)) {
      return request;
    }

    updatedRequest = normalizeRequest({
      ...request,
      ...updates,
      id: request.id,
    });

    return updatedRequest;
  });

  setBusinessCollaborationRequests(updatedRequests);

  if (updatedRequest) {
    syncBusinessCollaborationRequestUpdateToSupabase(updatedRequest);
  }

  return updatedRequest;
}

export function markBusinessCollaborationRequestTracking(requestId) {
  const request = getBusinessCollaborationRequests().find(
    (item) => String(item.id) === String(requestId),
  );

  if (!request || request.status !== BUSINESS_REQUEST_STATUS.WAITING) {
    return request || null;
  }

  const updatedRequest = updateBusinessCollaborationRequest(requestId, {
    status: BUSINESS_REQUEST_STATUS.TRACKING,
  });

  if (updatedRequest) {
    notifyPartnerRequestTracking(updatedRequest);
  }

  return updatedRequest;
}

export function saveBusinessCollaborationRequestReply(
  requestId,
  replyText,
  options = {},
) {
  const nextStatus =
    options.status === BUSINESS_REQUEST_STATUS.NEEDS_INFO ||
    options.status === "needs-info"
      ? BUSINESS_REQUEST_STATUS.NEEDS_INFO
      : BUSINESS_REQUEST_STATUS.ANSWERED;

  const updatedRequest = updateBusinessCollaborationRequest(requestId, {
    status: nextStatus,
    supportReply: replyText,
    repliedAt: getCurrentPersianDateTime(),
  });

  if (updatedRequest) {
    if (nextStatus === BUSINESS_REQUEST_STATUS.NEEDS_INFO) {
      notifyPartnerRequestNeedsInfo(updatedRequest);
    } else {
      notifyPartnerRequestAnswered(updatedRequest);
    }
  }

  return updatedRequest;
}

export function saveBusinessCollaborationRequestNeedsInfo(
  requestId,
  replyText,
) {
  return saveBusinessCollaborationRequestReply(requestId, replyText, {
    status: BUSINESS_REQUEST_STATUS.NEEDS_INFO,
  });
}

export function resubmitBusinessCollaborationRequest(requestId, messageText) {
  const request = getBusinessCollaborationRequests().find(
    (item) => String(item.id) === String(requestId),
  );

  if (!request || !isNeedsInfoBusinessStatus(request.status)) {
    return request || null;
  }

  const nextRevisionRound = Number(request.revisionRound || 0) + 1;

  const updatedRequest = updateBusinessCollaborationRequest(requestId, {
    message: messageText || request.message,
    status: BUSINESS_REQUEST_STATUS.WAITING,
    supportReply: "",
    repliedAt: "",
    sentAt: getCurrentPersianDateTime(),
    revisionRound: nextRevisionRound,
  });

  if (updatedRequest) {
    notifyCommitteeRequestResubmitted(updatedRequest);
  }

  return updatedRequest;
}

export function deleteBusinessCollaborationRequest(requestId) {
  const requests = getBusinessCollaborationRequests();
  const targetRequest = requests.find(
    (request) => String(request.id) === String(requestId),
  );

  if (targetRequest && isFinalBusinessStatus(targetRequest.status)) {
    return requests;
  }

  const nextRequests = requests.filter(
    (request) => String(request.id) !== String(requestId),
  );

  setBusinessCollaborationRequests(nextRequests);

  return nextRequests;
}

export function clearBusinessData() {
  setBusinessPartners([]);
  setBusinessOpportunityOverviews([]);
  setBusinessCollaborationRequests([]);
  return true;
}

export {
  BUSINESS_PARTNERS_STORAGE_KEY,
  BUSINESS_OPPORTUNITIES_STORAGE_KEY,
  BUSINESS_REQUESTS_STORAGE_KEY,
  BUSINESS_REQUEST_STATUS,
};
