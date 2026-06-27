import { getCurrentUser } from "./authService";
import { addNotificationOnce } from "./notificationService";

const ACTIVITY_REGISTRATIONS_STORAGE_KEY = "hatef_activity_registrations";
const PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY =
  "hatef_pending_activity_registration";

let memoryRegistrations = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "activity-registration") {
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

function normalizeValue(value) {
  return String(value || "").trim();
}

function normalizeComparableValue(value) {
  return normalizeValue(value).toLowerCase();
}

function toEnglishDigits(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
}

function parseCapacity(value) {
  const normalizedValue = toEnglishDigits(value).replace(/,/g, "");
  const numberMatch = normalizedValue.match(/\d+/);

  return numberMatch ? Number(numberMatch[0]) : 0;
}

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    ""
  );
}

function getUserRoleLabel(role) {
  const roleMap = {
    innovator: "فناور",
    reviewer: "داور",
    committee: "کمیته",
    committee_secretariat: "کمیته",
    business_partner: "همکار تجاری",
    business: "همکار تجاری",
    instructor: "مدرس",
    event_organizer: "برگزارکننده رویداد",
    organizer: "برگزارکننده رویداد",
  };

  return roleMap[role] || "کاربر عمومی";
}

function normalizeRegistration(registration = {}) {
  const currentUser = getCurrentUser?.();
  const fullName =
    normalizeValue(registration.fullName) ||
    normalizeValue(registration.name) ||
    getUserDisplayName(currentUser) ||
    "کاربر مهمان";

  const email =
    normalizeValue(registration.email) || normalizeValue(currentUser?.email);
  const mobile =
    normalizeValue(registration.mobile) ||
    normalizeValue(registration.phone) ||
    normalizeValue(currentUser?.mobile) ||
    normalizeValue(currentUser?.phone);

  return {
    id: registration.id || makeId(),
    activityId: normalizeValue(registration.activityId),
    activityType: registration.activityType || "course",
    activityTitle: registration.activityTitle || "برنامه آموزشی",
    instructorId: registration.instructorId || "",
    userId: registration.userId || currentUser?.id || "guest",
    role: registration.role || currentUser?.role || "guest",
    roleLabel:
      registration.roleLabel ||
      getUserRoleLabel(registration.role || currentUser?.role),
    fullName,
    email,
    mobile,
    organization:
      normalizeValue(registration.organization) ||
      normalizeValue(currentUser?.organization) ||
      "ثبت نشده",
    note: normalizeValue(registration.note),
    registeredAt: registration.registeredAt || getCurrentPersianDateTime(),
  };
}

function normalizeRegistrations(registrations) {
  if (!Array.isArray(registrations)) {
    return [];
  }

  return registrations
    .filter((registration) => registration && registration.activityId)
    .map(normalizeRegistration);
}

function readRegistrationsFromStorage() {
  if (!canUseStorage()) {
    return memoryRegistrations;
  }

  const storedValue = window.localStorage.getItem(
    ACTIVITY_REGISTRATIONS_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  return normalizeRegistrations(parsedValue);
}

function writeRegistrationsToStorage(registrations) {
  const normalizedRegistrations = normalizeRegistrations(registrations);

  if (!canUseStorage()) {
    memoryRegistrations = normalizedRegistrations;
    return normalizedRegistrations;
  }

  window.localStorage.setItem(
    ACTIVITY_REGISTRATIONS_STORAGE_KEY,
    JSON.stringify(normalizedRegistrations),
  );

  return normalizedRegistrations;
}

function getContactKey(registration) {
  const email = normalizeComparableValue(registration.email);
  const mobile = normalizeComparableValue(registration.mobile);

  return email || mobile || normalizeComparableValue(registration.userId);
}

function isSameRegistrant(firstRegistration, secondRegistration) {
  const firstUserId = normalizeComparableValue(firstRegistration.userId);
  const secondUserId = normalizeComparableValue(secondRegistration.userId);

  if (firstUserId && firstUserId !== "guest" && firstUserId === secondUserId) {
    return true;
  }

  const firstContactKey = getContactKey(firstRegistration);
  const secondContactKey = getContactKey(secondRegistration);

  return Boolean(firstContactKey && firstContactKey === secondContactKey);
}

function getRegistrationActivityInfo(activity = {}) {
  return {
    activityId: activity.id || activity.activityId || "",
    activityType: activity.type || "course",
    activityTitle: activity.title || "برنامه آموزشی",
    instructorId: activity.instructorId || activity.createdBy || "",
    capacity: parseCapacity(activity.capacity),
  };
}

function getActivityPath(activity = {}, fallbackPath = "") {
  if (fallbackPath) {
    return fallbackPath;
  }

  const activityInfo = getRegistrationActivityInfo(activity);

  if (!activityInfo.activityId) {
    return "/";
  }

  return activityInfo.activityType === "event"
    ? `/events/${activityInfo.activityId}`
    : `/courses/${activityInfo.activityId}`;
}

function readPendingActivityRegistration() {
  if (!canUseStorage()) {
    return null;
  }

  const storedValue = window.localStorage.getItem(
    PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  const parsedValue = safeParseJson(storedValue, null);

  return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
}

function writePendingActivityRegistration(pendingRegistration) {
  if (!canUseStorage()) {
    return pendingRegistration;
  }

  window.localStorage.setItem(
    PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY,
    JSON.stringify(pendingRegistration),
  );

  return pendingRegistration;
}

export function savePendingActivityRegistration(
  activity = {},
  fallbackPath = "",
) {
  const activityInfo = getRegistrationActivityInfo(activity);

  if (!activityInfo.activityId) {
    return null;
  }

  return writePendingActivityRegistration({
    activityId: activityInfo.activityId,
    activityType: activityInfo.activityType,
    activityTitle: activityInfo.activityTitle,
    targetPath: getActivityPath(activity, fallbackPath),
    createdAt: getCurrentPersianDateTime(),
  });
}

export function getPendingActivityRegistration() {
  return readPendingActivityRegistration();
}

export function getPendingActivityRegistrationPath() {
  const pendingRegistration = readPendingActivityRegistration();

  return pendingRegistration?.targetPath || "";
}

export function clearPendingActivityRegistration() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY);
}

export function consumePendingActivityRegistrationForActivity(activity = {}) {
  const pendingRegistration = readPendingActivityRegistration();

  if (!pendingRegistration) {
    return false;
  }

  const activityInfo = getRegistrationActivityInfo(activity);
  const isSameActivity =
    String(pendingRegistration.activityId) ===
      String(activityInfo.activityId) &&
    String(pendingRegistration.activityType) ===
      String(activityInfo.activityType);

  if (!isSameActivity) {
    return false;
  }

  clearPendingActivityRegistration();
  return true;
}

function notifyInstructorNewRegistration(activity, registration) {
  const instructorId = activity?.instructorId || activity?.createdBy;

  if (!instructorId) {
    return;
  }

  addNotificationOnce({
    targetUserId: instructorId,
    targetRole: "instructor",
    title: "ثبت‌نام جدید برای برنامه شما",
    body: `${registration.fullName} برای «${activity.title}» ثبت‌نام کرد.`,
    category: "دوره‌ها و رویدادها",
    sourceType: "activity-registration",
    sourceId: registration.id,
    eventKey: `instructor-activity-registration-${registration.id}`,
    isImportant: true,
  });
}

export function getActivityRegistrations() {
  return readRegistrationsFromStorage();
}

export function setActivityRegistrations(registrations) {
  return writeRegistrationsToStorage(registrations);
}

export function getActivityRegistrationsByActivityId(activityId) {
  const normalizedActivityId = String(activityId || "");

  return getActivityRegistrations().filter(
    (registration) => String(registration.activityId) === normalizedActivityId,
  );
}

export function getActivityRegistrationStats(activity = {}) {
  const { activityId, capacity } = getRegistrationActivityInfo(activity);
  const registrations = getActivityRegistrationsByActivityId(activityId);
  const total = registrations.length;
  const remaining = capacity > 0 ? Math.max(capacity - total, 0) : null;

  return {
    activityId,
    capacity,
    total,
    remaining,
    isFull: capacity > 0 && total >= capacity,
    registrations,
  };
}

export function isRegisteredForActivity(activity = {}, registrantData = {}) {
  const activityInfo = getRegistrationActivityInfo(activity);
  const normalizedRegistrant = normalizeRegistration({
    ...registrantData,
    activityId: activityInfo.activityId,
    activityType: activityInfo.activityType,
    activityTitle: activityInfo.activityTitle,
    instructorId: activityInfo.instructorId,
  });

  return getActivityRegistrationsByActivityId(activityInfo.activityId).some(
    (registration) => isSameRegistrant(registration, normalizedRegistrant),
  );
}

export function addActivityRegistration(activity = {}, registrantData = {}) {
  const currentUser = getCurrentUser?.();
  const activityInfo = getRegistrationActivityInfo(activity);

  if (!activityInfo.activityId) {
    return {
      success: false,
      reason: "activity_not_found",
      registration: null,
    };
  }

  if (!currentUser?.id) {
    return {
      success: false,
      reason: "login_required",
      registration: null,
    };
  }

  const registration = normalizeRegistration({
    ...registrantData,
    activityId: activityInfo.activityId,
    activityType: activityInfo.activityType,
    activityTitle: activityInfo.activityTitle,
    instructorId: activityInfo.instructorId,
    userId: currentUser.id,
    role: currentUser.role,
    fullName: getUserDisplayName(currentUser),
    email: currentUser.email || "",
    mobile: currentUser.mobile || currentUser.phone || "",
    organization: currentUser.organization || "ثبت نشده",
  });

  const registrations = getActivityRegistrations();
  const activityRegistrations = registrations.filter(
    (item) => String(item.activityId) === String(activityInfo.activityId),
  );

  const duplicateRegistration = activityRegistrations.find((item) =>
    isSameRegistrant(item, registration),
  );

  if (duplicateRegistration) {
    return {
      success: false,
      reason: "duplicate",
      registration: duplicateRegistration,
    };
  }

  if (
    activityInfo.capacity > 0 &&
    activityRegistrations.length >= activityInfo.capacity
  ) {
    return {
      success: false,
      reason: "capacity_full",
      registration: null,
    };
  }

  const nextRegistrations = [registration, ...registrations];
  writeRegistrationsToStorage(nextRegistrations);
  notifyInstructorNewRegistration(activity, registration);

  return {
    success: true,
    reason: "created",
    registration,
  };
}

export function getCurrentUserActivityRegistrations() {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id) {
    return [];
  }

  const comparableUserId = normalizeComparableValue(currentUser.id);
  const comparableEmail = normalizeComparableValue(currentUser.email);
  const comparableMobile = normalizeComparableValue(
    currentUser.mobile || currentUser.phone,
  );

  return getActivityRegistrations().filter((registration) => {
    const registrationUserId = normalizeComparableValue(registration.userId);
    const registrationEmail = normalizeComparableValue(registration.email);
    const registrationMobile = normalizeComparableValue(registration.mobile);

    return (
      registrationUserId === comparableUserId ||
      (comparableEmail && registrationEmail === comparableEmail) ||
      (comparableMobile && registrationMobile === comparableMobile)
    );
  });
}

export function getActivityRegistrationStatsForActivities(activities = []) {
  return activities.map((activity) => ({
    activityId: activity.id,
    title: activity.title,
    type: activity.type,
    ...getActivityRegistrationStats(activity),
  }));
}

export function clearActivityRegistrations() {
  return writeRegistrationsToStorage([]);
}

export {
  ACTIVITY_REGISTRATIONS_STORAGE_KEY,
  PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY,
};
