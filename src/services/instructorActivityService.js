import { getCurrentUser } from "./authService";
import { addNotificationOnce } from "./notificationService";
import {
  deleteInstructorActivityFromSupabase,
  syncInstructorActivityToSupabase,
  syncInstructorActivityUpdateToSupabase,
} from "./supabaseInstructorActivityService";

const INSTRUCTOR_ACTIVITIES_STORAGE_KEY = "hatef_instructor_activities";

const INSTRUCTOR_ACTIVITY_STATUS = {
  PENDING: "در انتظار تایید",
  PUBLISHED: "منتشر شده",
  REJECTED: "رد شده",
  NEEDS_REVISION: "نیازمند اصلاح",
};

const ACTIVITY_TYPES = {
  COURSE: "course",
  EVENT: "event",
};

let memoryActivities = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "instructor-activity") {
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

function getCurrentInstructorId() {
  const currentUser = getCurrentUser?.();

  return currentUser?.id || currentUser?.userId || currentUser?.email || "";
}

function getCurrentInstructorName() {
  const currentUser = getCurrentUser?.();

  return (
    currentUser?.fullName ||
    `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
    currentUser?.name ||
    "مدرس هاتف"
  );
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object") {
        return { ...item };
      }

      return item;
    });
  }

  return fallback;
}

function getStatusLabel(status) {
  const statusMap = {
    pending: INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    awaiting: INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    waiting: INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    "در انتظار بررسی": INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    "در انتظار تایید": INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    published: INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED,
    "منتشر شده": INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED,
    rejected: INSTRUCTOR_ACTIVITY_STATUS.REJECTED,
    "رد شده": INSTRUCTOR_ACTIVITY_STATUS.REJECTED,
    needsRevision: INSTRUCTOR_ACTIVITY_STATUS.NEEDS_REVISION,
    needs_revision: INSTRUCTOR_ACTIVITY_STATUS.NEEDS_REVISION,
    "نیازمند اصلاح": INSTRUCTOR_ACTIVITY_STATUS.NEEDS_REVISION,
  };

  return statusMap[status] || status || INSTRUCTOR_ACTIVITY_STATUS.PENDING;
}

function getActivityTypeLabel(type) {
  return type === ACTIVITY_TYPES.EVENT ? "رویداد" : "دوره";
}

function isFinalActivityStatus(status) {
  return [
    INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED,
    INSTRUCTOR_ACTIVITY_STATUS.REJECTED,
  ].includes(getStatusLabel(status));
}

function isEditableActivityStatus(status) {
  return getStatusLabel(status) === INSTRUCTOR_ACTIVITY_STATUS.NEEDS_REVISION;
}

function normalizeActivity(activity = {}) {
  const activityType =
    activity.type === ACTIVITY_TYPES.EVENT
      ? ACTIVITY_TYPES.EVENT
      : ACTIVITY_TYPES.COURSE;

  const now = getCurrentPersianDateTime();
  const normalizedStatus = getStatusLabel(activity.status);
  const instructorId =
    activity.instructorId || activity.createdBy || getCurrentInstructorId();

  return {
    ...activity,
    id: activity.id || makeId(activityType),
    type: activityType,
    title: normalizeString(
      activity.title,
      activityType === ACTIVITY_TYPES.EVENT ? "رویداد جدید" : "دوره جدید",
    ),
    summary: normalizeString(activity.summary),
    image: activity.image || "",
    status: normalizedStatus,
    secondaryStatus:
      normalizedStatus === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED
        ? activity.secondaryStatus || "در حال ثبت نام"
        : activity.secondaryStatus || "",
    statusFeedback: activity.statusFeedback || activity.feedback || "",
    createdAt: activity.createdAt || now,
    updatedAt: activity.updatedAt || activity.createdAt || now,
    reviewedAt: activity.reviewedAt || "",
    publishedAt:
      normalizedStatus === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED
        ? activity.publishedAt ||
          activity.reviewedAt ||
          activity.createdAt ||
          now
        : activity.publishedAt || "",
    instructorId,
    createdBy: activity.createdBy || instructorId,
    instructorName: activity.instructorName || getCurrentInstructorName(),
    revisionRound: Number(activity.revisionRound || 0),
    audiences: normalizeList(activity.audiences),
    outcomes: normalizeList(activity.outcomes),
    modules: normalizeList(activity.modules),
    instructors: normalizeList(activity.instructors),
    benefits: normalizeList(activity.benefits),
    faqs: normalizeList(activity.faqs),
    highlights: normalizeList(activity.highlights),
    agenda: normalizeList(activity.agenda),
    speakers: normalizeList(activity.speakers),
  };
}

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) {
    return [];
  }

  return activities.filter(Boolean).map(normalizeActivity);
}

function sortActivitiesByNewest(activities) {
  return [...activities].sort((firstActivity, secondActivity) => {
    const firstValue = String(
      firstActivity.createdAt || firstActivity.id || "",
    );
    const secondValue = String(
      secondActivity.createdAt || secondActivity.id || "",
    );

    return secondValue.localeCompare(firstValue, "fa");
  });
}

function writeActivitiesToStorage(activities) {
  const normalizedActivities = normalizeActivities(activities);

  if (!canUseStorage()) {
    memoryActivities = normalizedActivities;
    return normalizedActivities;
  }

  safeSetStorageItem(
    INSTRUCTOR_ACTIVITIES_STORAGE_KEY,
    JSON.stringify(normalizedActivities),
  );

  return normalizedActivities;
}

function readActivitiesFromStorage() {
  if (!canUseStorage()) {
    return memoryActivities;
  }

  const storedValue = window.localStorage.getItem(
    INSTRUCTOR_ACTIVITIES_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  if (!Array.isArray(parsedValue)) {
    return writeActivitiesToStorage([]);
  }

  return normalizeActivities(parsedValue);
}

function notifyCommitteeNewActivity(activity) {
  addNotificationOnce({
    targetRole: "committee",
    title: `${getActivityTypeLabel(activity.type)} جدید برای بررسی`,
    body: `${getActivityTypeLabel(activity.type)} «${activity.title}» توسط مدرس ثبت شد و نیازمند بررسی دبیرخانه است.`,
    category: "مدرس و رویداد",
    sourceType: "instructor-activity",
    sourceId: activity.id,
    eventKey: `committee-new-instructor-activity-${activity.id}-${activity.revisionRound || 0}`,
    isImportant: true,
  });
}

function notifyInstructorActivityDecision(activity) {
  if (!activity?.instructorId) {
    return;
  }

  addNotificationOnce({
    targetUserId: activity.instructorId,
    targetRole: "instructor",
    title: `وضعیت ${getActivityTypeLabel(activity.type)} شما تغییر کرد`,
    body: `${getActivityTypeLabel(activity.type)} «${activity.title}» با وضعیت «${activity.status}» ثبت شد.`,
    category: "مدرس و رویداد",
    sourceType: "instructor-activity",
    sourceId: activity.id,
    eventKey: `instructor-activity-decision-${activity.id}-${activity.status}-${activity.revisionRound || 0}`,
    isImportant: true,
  });
}

function updateActivityCollection(activityId, updater) {
  const activities = getInstructorActivities();
  let updatedActivity = null;

  const nextActivities = activities.map((activity) => {
    if (String(activity.id) !== String(activityId)) {
      return activity;
    }

    updatedActivity = normalizeActivity(updater(activity));
    return updatedActivity;
  });

  writeActivitiesToStorage(nextActivities);

  return updatedActivity;
}

export function getInstructorActivities() {
  return sortActivitiesByNewest(readActivitiesFromStorage());
}

export function setInstructorActivities(activities) {
  return writeActivitiesToStorage(activities);
}

export function getInstructorActivityById(activityId) {
  return (
    getInstructorActivities().find(
      (activity) => String(activity.id) === String(activityId),
    ) || null
  );
}

export function getInstructorActivitiesByInstructorId(instructorId) {
  return getInstructorActivities().filter(
    (activity) => String(activity.instructorId) === String(instructorId),
  );
}

export function getCurrentInstructorActivities() {
  return getInstructorActivitiesByInstructorId(getCurrentInstructorId());
}

export function getPendingInstructorActivities() {
  return getInstructorActivities().filter(
    (activity) => activity.status === INSTRUCTOR_ACTIVITY_STATUS.PENDING,
  );
}

export function getPublishedInstructorActivities() {
  return getInstructorActivities().filter(
    (activity) => activity.status === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED,
  );
}

export function addInstructorActivity(activityData = {}) {
  const activities = getInstructorActivities();

  const newActivity = normalizeActivity({
    ...activityData,
    id: activityData.id || makeId(activityData.type || ACTIVITY_TYPES.COURSE),
    status: INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    secondaryStatus: "",
    statusFeedback: "",
    createdAt: activityData.createdAt || getCurrentPersianDateTime(),
    updatedAt: getCurrentPersianDateTime(),
    instructorId: activityData.instructorId || getCurrentInstructorId(),
    instructorName: activityData.instructorName || getCurrentInstructorName(),
  });

  writeActivitiesToStorage([newActivity, ...activities]);
  notifyCommitteeNewActivity(newActivity);

  syncInstructorActivityToSupabase(newActivity).then((result) => {
    if (!result) {
      console.warn(
        "Instructor activity was saved locally but was not synced to Supabase.",
      );
    }
  });

  return newActivity;
}

export function updateInstructorActivity(activityId, updates = {}) {
  const updatedActivity = updateActivityCollection(activityId, (activity) => ({
    ...activity,
    ...updates,
    id: activity.id,
    type: updates.type || activity.type,
    instructorId: updates.instructorId || activity.instructorId,
    createdBy: updates.createdBy || activity.createdBy,
    createdAt: updates.createdAt || activity.createdAt,
    updatedAt: getCurrentPersianDateTime(),
  }));

  if (updatedActivity) {
    syncInstructorActivityUpdateToSupabase(updatedActivity).then((result) => {
      if (!result) {
        console.warn(
          "Instructor activity was updated locally but was not synced to Supabase.",
        );
      }
    });
  }

  return updatedActivity;
}

export function saveInstructorActivityDecision(
  activityId,
  status,
  feedback = "",
  options = {},
) {
  const normalizedStatus = getStatusLabel(status);

  const updatedActivity = updateInstructorActivity(activityId, {
    status: normalizedStatus,
    secondaryStatus:
      normalizedStatus === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED
        ? options.secondaryStatus || "در حال ثبت نام"
        : "",
    statusFeedback: feedback,
    reviewedAt: getCurrentPersianDateTime(),
    publishedAt:
      normalizedStatus === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED
        ? getCurrentPersianDateTime()
        : "",
  });

  if (updatedActivity) {
    notifyInstructorActivityDecision(updatedActivity);
  }

  return updatedActivity;
}

export function resubmitInstructorActivityRevision(activityId, updates = {}) {
  const activity = getInstructorActivityById(activityId);

  if (!activity || !isEditableActivityStatus(activity.status)) {
    return activity;
  }

  const nextRevisionRound = Number(activity.revisionRound || 0) + 1;

  const updatedActivity = updateInstructorActivity(activityId, {
    ...updates,
    status: INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    secondaryStatus: "",
    statusFeedback: "",
    reviewedAt: "",
    publishedAt: "",
    revisionRound: nextRevisionRound,
  });

  if (updatedActivity) {
    notifyCommitteeNewActivity(updatedActivity);
  }

  return updatedActivity;
}

export function deleteInstructorActivity(activityId) {
  const activities = getInstructorActivities();

  const targetActivity = activities.find(
    (activity) => String(activity.id) === String(activityId),
  );

  if (targetActivity && isFinalActivityStatus(targetActivity.status)) {
    return activities;
  }

  const nextActivities = activities.filter(
    (activity) => String(activity.id) !== String(activityId),
  );

  writeActivitiesToStorage(nextActivities);

  if (targetActivity) {
    deleteInstructorActivityFromSupabase(targetActivity);
  } else {
    deleteInstructorActivityFromSupabase(activityId);
  }

  return nextActivities;
}

export function getInstructorActivityStats() {
  const activities = getInstructorActivities();

  return {
    total: activities.length,
    courses: activities.filter(
      (activity) => activity.type === ACTIVITY_TYPES.COURSE,
    ).length,
    events: activities.filter(
      (activity) => activity.type === ACTIVITY_TYPES.EVENT,
    ).length,
    pending: activities.filter(
      (activity) => activity.status === INSTRUCTOR_ACTIVITY_STATUS.PENDING,
    ).length,
    published: activities.filter(
      (activity) => activity.status === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED,
    ).length,
    rejected: activities.filter(
      (activity) => activity.status === INSTRUCTOR_ACTIVITY_STATUS.REJECTED,
    ).length,
    needsRevision: activities.filter(
      (activity) =>
        activity.status === INSTRUCTOR_ACTIVITY_STATUS.NEEDS_REVISION,
    ).length,
  };
}

export function clearInstructorActivities() {
  return writeActivitiesToStorage([]);
}

export {
  ACTIVITY_TYPES,
  INSTRUCTOR_ACTIVITIES_STORAGE_KEY,
  INSTRUCTOR_ACTIVITY_STATUS,
};
