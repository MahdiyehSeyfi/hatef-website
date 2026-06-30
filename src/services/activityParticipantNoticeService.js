import { getCurrentUser } from "./authService";
import {
  getActivityRegistrationsByActivityId,
  getCurrentUserActivityRegistrations,
} from "./activityRegistrationService";
import { addNotification } from "./notificationService";
import { syncActivityParticipantNoticeToSupabase } from "./supabaseActivityParticipantNoticeService";

const ACTIVITY_PARTICIPANT_NOTICES_STORAGE_KEY =
  "hatef_activity_participant_notices";

let memoryNotices = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "activity-participant-notice") {
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

function safeSetStorageItem(key, value) {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage:`, error);
    return false;
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

function normalizeMode(mode) {
  return mode === "targeted" ? "targeted" : "broadcast";
}

function getActivityTypeLabel(type) {
  return type === "event" ? "رویداد" : "دوره";
}

function getActivityTargetLabel(activity = {}) {
  const typeLabel = getActivityTypeLabel(activity.type);
  const title = activity.title || "برنامه آموزشی";

  return `${typeLabel}: ${title}`;
}

function normalizeNotice(notice = {}) {
  const mode = normalizeMode(notice.mode);
  const targetActivityIds = Array.isArray(notice.targetActivityIds)
    ? notice.targetActivityIds.map(String)
    : notice.activityId
      ? [String(notice.activityId)]
      : [];

  return {
    id: notice.id || makeId(),
    mode,
    title: normalizeValue(notice.title) || "اطلاعیه مدرس",
    message: normalizeValue(notice.message || notice.body),
    target: normalizeValue(notice.target) || "شرکت‌کنندگان برنامه",
    sentAt: notice.sentAt || notice.createdAt || getCurrentPersianDateTime(),
    recipients: Number(notice.recipients || 0),
    targetActivityIds,
    activityId: notice.activityId || targetActivityIds[0] || "",
    activityType: notice.activityType || "course",
    senderUserId: notice.senderUserId || "",
  };
}

function normalizeNotices(notices) {
  if (!Array.isArray(notices)) {
    return [];
  }

  return notices.filter(Boolean).map(normalizeNotice);
}

function readNotices() {
  if (!canUseStorage()) {
    return memoryNotices;
  }

  const storedValue = window.localStorage.getItem(
    ACTIVITY_PARTICIPANT_NOTICES_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  return normalizeNotices(safeParseJson(storedValue, []));
}

function writeNotices(notices) {
  const normalizedNotices = normalizeNotices(notices);

  if (!canUseStorage()) {
    memoryNotices = normalizedNotices;
    return normalizedNotices;
  }

  safeSetStorageItem(
    ACTIVITY_PARTICIPANT_NOTICES_STORAGE_KEY,
    JSON.stringify(normalizedNotices),
  );

  return normalizedNotices;
}

function sortNewest(notices) {
  return [...notices].sort((first, second) =>
    String(second.sentAt || "").localeCompare(String(first.sentAt || "")),
  );
}

function getRegistrantKey(registration = {}) {
  const userId = normalizeValue(registration.userId);
  const email = normalizeValue(registration.email).toLowerCase();
  const mobile = normalizeValue(registration.mobile).toLowerCase();

  return userId || email || mobile;
}

function dedupeRegistrations(registrations = []) {
  const registrationsByKey = new Map();

  registrations.forEach((registration) => {
    const key = getRegistrantKey(registration);

    if (!key) {
      return;
    }

    registrationsByKey.set(key, registration);
  });

  return Array.from(registrationsByKey.values());
}

function isActivityPublished(activity = {}) {
  return (
    activity.status === "منتشر شده" ||
    activity.status === "published" ||
    activity.publicStatus === "published"
  );
}

function getNoticeableActivities(activities = []) {
  return activities.filter(
    (activity) => activity?.id && isActivityPublished(activity),
  );
}

function getRegistrationsForActivities(activities = []) {
  const allRegistrations = activities.flatMap((activity) =>
    getActivityRegistrationsByActivityId(activity.id).map((registration) => ({
      ...registration,
      activityId: activity.id,
      activityType: activity.type || registration.activityType,
      activityTitle: activity.title || registration.activityTitle,
      instructorId:
        activity.instructorId ||
        activity.createdBy ||
        registration.instructorId,
    })),
  );

  return dedupeRegistrations(allRegistrations);
}

function notifyRecipients(notice, recipients = []) {
  recipients.forEach((recipient) => {
    if (!recipient.userId || recipient.userId === "guest") {
      return;
    }

    addNotification({
      targetUserId: recipient.userId,
      targetRole: recipient.role,
      title: notice.title,
      body: notice.message,
      category: "اطلاع‌رسانی دوره‌ها و رویدادها",
      sourceType: "activity-participant-notice",
      sourceId: notice.id,
      isImportant: true,
    });
  });
}

export function getActivityParticipantNotices() {
  return sortNewest(readNotices());
}

export function setActivityParticipantNotices(notices) {
  return writeNotices(notices);
}

export function getActivityParticipantNoticesByActivityId(activityId) {
  const normalizedActivityId = String(activityId || "");

  return getActivityParticipantNotices().filter((notice) =>
    notice.targetActivityIds.includes(normalizedActivityId),
  );
}

export function getActivityNoticeRecipientsCount(activity = {}) {
  if (!activity?.id || !isActivityPublished(activity)) {
    return 0;
  }

  return dedupeRegistrations(getActivityRegistrationsByActivityId(activity.id))
    .length;
}

export function getBroadcastActivityNoticeRecipientsCount(activities = []) {
  return getRegistrationsForActivities(getNoticeableActivities(activities))
    .length;
}

export function sendActivityParticipantNotice({
  mode = "broadcast",
  activity = null,
  activities = [],
  title = "",
  message = "",
} = {}) {
  const normalizedMode = normalizeMode(mode);
  const trimmedTitle = normalizeValue(title);
  const trimmedMessage = normalizeValue(message);

  if (!trimmedTitle || !trimmedMessage) {
    return {
      success: false,
      reason: "missing_content",
      notice: null,
      recipients: [],
    };
  }

  const targetActivities =
    normalizedMode === "targeted"
      ? activity?.id && isActivityPublished(activity)
        ? [activity]
        : []
      : getNoticeableActivities(activities);

  if (targetActivities.length === 0) {
    return {
      success: false,
      reason: "missing_activity",
      notice: null,
      recipients: [],
    };
  }

  const recipients = getRegistrationsForActivities(targetActivities);

  if (recipients.length === 0) {
    return {
      success: false,
      reason: "no_recipients",
      notice: null,
      recipients: [],
    };
  }

  const currentUser = getCurrentUser?.();
  const target =
    normalizedMode === "targeted"
      ? getActivityTargetLabel(targetActivities[0])
      : "همه ثبت‌نام‌کنندگان دوره‌ها و رویدادهای منتشرشده";

  const notice = normalizeNotice({
    id: makeId(),
    mode: normalizedMode,
    title: trimmedTitle,
    message: trimmedMessage,
    target,
    recipients: recipients.length,
    targetActivityIds: targetActivities.map((item) => String(item.id)),
    activityId: normalizedMode === "targeted" ? targetActivities[0].id : "",
    activityType:
      normalizedMode === "targeted"
        ? targetActivities[0].type || "course"
        : "all",
    senderUserId: currentUser?.id || "",
    sentAt: getCurrentPersianDateTime(),
  });

  writeNotices([notice, ...getActivityParticipantNotices()]);
  notifyRecipients(notice, recipients);
  syncActivityParticipantNoticeToSupabase(notice);

  return {
    success: true,
    reason: "sent",
    notice,
    recipients,
  };
}

export function getParticipantNoticesForCurrentUser() {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id) {
    return [];
  }

  const currentRegistrations = getCurrentUserActivityRegistrations();
  const registeredActivityIds = new Set(
    currentRegistrations.map((registration) => String(registration.activityId)),
  );

  return getActivityParticipantNotices().filter((notice) =>
    notice.targetActivityIds.some((activityId) =>
      registeredActivityIds.has(String(activityId)),
    ),
  );
}

export function getParticipantNoticesForCurrentUserByActivityId(activityId) {
  const normalizedActivityId = String(activityId || "");

  return getParticipantNoticesForCurrentUser().filter((notice) =>
    notice.targetActivityIds.includes(normalizedActivityId),
  );
}

export function clearActivityParticipantNotices() {
  return writeNotices([]);
}

export { ACTIVITY_PARTICIPANT_NOTICES_STORAGE_KEY };
