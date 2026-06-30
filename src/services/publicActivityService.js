import { courseItems, eventItems } from "../data/activitiesData";
import { getCurrentUser } from "./authService";
import {
  getInstructorActivities,
  INSTRUCTOR_ACTIVITY_STATUS,
} from "./instructorActivityService";

const PREVIEW_ALLOWED_ROLES = new Set([
  "committee",
  "committee_secretariat",
  "instructor",
  "event_organizer",
  "organizer",
]);

const PUBLIC_ACTIVITY_PREVIEW_DRAFTS_STORAGE_KEY =
  "hatef_public_activity_preview_drafts";

const ACTIVITY_STATUS_LABELS = {
  registering: "ثبت‌نام فعال",
  ongoing: "در حال برگزاری",
  past: "برگزار شده",
  "coming-soon": "به‌زودی",
};

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makePreviewId(type = "course") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `preview-${type}-${crypto.randomUUID()}`;
  }

  return `preview-${type}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function readPreviewDrafts() {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(
    PUBLIC_ACTIVITY_PREVIEW_DRAFTS_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  return Array.isArray(parsedValue) ? parsedValue : [];
}

function writePreviewDrafts(drafts) {
  if (!canUseStorage()) {
    return drafts;
  }

  window.localStorage.setItem(
    PUBLIC_ACTIVITY_PREVIEW_DRAFTS_STORAGE_KEY,
    JSON.stringify(drafts),
  );

  return drafts;
}

function normalizeRole(role) {
  return String(role || "").trim();
}

function normalizeActivityStatus(status) {
  const normalizedStatus = String(status || "").trim();

  if (
    normalizedStatus === "registering" ||
    normalizedStatus === "ثبت‌نام فعال" ||
    normalizedStatus === "ثبت نام فعال" ||
    normalizedStatus === "در حال ثبت‌نام" ||
    normalizedStatus === "در حال ثبت نام"
  ) {
    return "registering";
  }

  if (normalizedStatus === "در حال برگزاری" || normalizedStatus === "ongoing") {
    return "ongoing";
  }

  if (
    normalizedStatus === "برگزار شده" ||
    normalizedStatus === "برگزارشده" ||
    normalizedStatus === "پایان یافته" ||
    normalizedStatus === "پایان‌یافته" ||
    normalizedStatus === "past"
  ) {
    return "past";
  }

  if (
    normalizedStatus === "به‌زودی" ||
    normalizedStatus === "به زودی" ||
    normalizedStatus === "coming-soon" ||
    normalizedStatus === "comingSoon"
  ) {
    return "coming-soon";
  }

  return "registering";
}

function getActivityStatusLabel(status) {
  return ACTIVITY_STATUS_LABELS[status] || ACTIVITY_STATUS_LABELS.registering;
}

function normalizeString(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function normalizeList(value, fallback = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item, index) => {
      if (item && typeof item === "object") {
        return {
          id: item.id || `${index + 1}`,
          ...item,
        };
      }

      const title = normalizeString(item);

      return title
        ? {
            id: `${index + 1}`,
            title,
          }
        : null;
    })
    .filter(Boolean);
}

function isInstructorActivityPublished(activity) {
  return (
    activity?.status === INSTRUCTOR_ACTIVITY_STATUS.PUBLISHED ||
    activity?.status === "منتشر شده" ||
    activity?.status === "published"
  );
}

function canPreviewInstructorActivity() {
  const currentUser = getCurrentUser?.();
  const currentRole = normalizeRole(currentUser?.role);

  return PREVIEW_ALLOWED_ROLES.has(currentRole);
}

function shouldIncludeInstructorActivity(activity, options = {}) {
  if (isInstructorActivityPublished(activity)) {
    return true;
  }

  return Boolean(options.includePreview && canPreviewInstructorActivity());
}

function getActivityImage(activity) {
  return activity.image || activity.bannerImage || activity.coverImage || "";
}

function getActivityCapacity(activity) {
  const capacity = normalizeString(activity.capacity);
  return capacity || "";
}

function getCoursePath(activity) {
  return activity.path || `/courses/${activity.slug || activity.id}`;
}

function getEventPath(activity) {
  return activity.path || `/events/${activity.slug || activity.id}`;
}

function getCourseStartDate(activity) {
  return normalizeString(
    activity.startDate || activity.registrationDate,
    "زمان‌بندی اعلام نشده",
  );
}

function getEventStartDate(activity) {
  return normalizeString(
    activity.eventDate || activity.startDate || activity.date,
    "زمان‌بندی اعلام نشده",
  );
}

function normalizeCourseItem(activity) {
  const status = normalizeActivityStatus(
    activity.secondaryStatus || activity.publicStatus || activity.status,
  );

  return {
    ...activity,
    id: activity.id,
    type: "course",
    title: normalizeString(activity.title, "دوره آموزشی هاتف"),
    image: getActivityImage(activity),
    status,
    statusLabel: activity.statusLabel || getActivityStatusLabel(status),
    path: getCoursePath(activity),
    firstMetaLabel: activity.firstMetaLabel || "شروع از:",
    buttonLabel: activity.buttonLabel || "مشاهده دوره",
    startDate: getCourseStartDate(activity),
    startTime: activity.startTime || "",
    endDate: activity.endDate || "",
    endTime: activity.endTime || "",
    registrationDate: activity.registrationDate || "",
    registrationTime: activity.registrationTime || "",
    instructor:
      activity.mainInstructorName ||
      activity.instructorName ||
      activity.instructor ||
      "مدرس هاتف",
    organizer: activity.organizer || "برنامه هاتف دانشگاه تهران",
    duration: activity.duration || "تعیین نشده",
    format: activity.format || "تعیین نشده",
    level: activity.level || "عمومی",
    capacity: getActivityCapacity(activity),
    location: activity.location || "تعیین نشده",
    summary: activity.summary || "",
    introTitle: activity.introTitle || "معرفی دوره",
    introText: activity.introText || activity.summary || "",
    audiences: normalizeList(activity.audiences, []),
    outcomes: normalizeList(activity.outcomes, []),
    modules: normalizeList(activity.modules, []),
    instructors: normalizeList(activity.instructors, []),
    benefits: normalizeList(activity.benefits, []),
    faqs: normalizeList(activity.faqs, []),
  };
}

function normalizeEventItem(activity) {
  const status = normalizeActivityStatus(
    activity.secondaryStatus || activity.publicStatus || activity.status,
  );

  const eventDate = getEventStartDate(activity);
  const presenter =
    activity.presenter ||
    activity.presenterName ||
    activity.secretaryName ||
    activity.instructorName ||
    activity.instructor ||
    "ارائه‌دهنده رویداد";

  return {
    ...activity,
    id: activity.id,
    type: "event",
    title: normalizeString(activity.title, "رویداد هاتف"),
    image: getActivityImage(activity),
    status,
    statusLabel: activity.statusLabel || getActivityStatusLabel(status),
    path: getEventPath(activity),
    firstMetaLabel: activity.firstMetaLabel || "زمان:",
    buttonLabel: activity.buttonLabel || "مشاهده رویداد",
    startDate: eventDate,
    eventDate,
    startTime: activity.startTime || "",
    endTime: activity.endTime || "",
    presenter,
    instructor: presenter,
    secretaryName: presenter,
    organizer: activity.organizer || "برنامه هاتف دانشگاه تهران",
    duration: activity.duration || "تعیین نشده",
    format: activity.format || "تعیین نشده",
    capacity: getActivityCapacity(activity),
    location: activity.location || "تعیین نشده",
    summary: activity.summary || "",
    introTitle: activity.introTitle || "معرفی رویداد",
    introText: activity.introText || activity.summary || "",
    audiences: normalizeList(activity.audiences, []),
    highlights: normalizeList(activity.highlights, []),
    agenda: normalizeList(activity.agenda, []),
    speakers: normalizeList(activity.speakers, []),
    faqs: normalizeList(activity.faqs, []),
  };
}

function mapInstructorCourseToPublicItem(activity) {
  return {
    ...normalizeCourseItem(activity),
    source: "instructor",
  };
}

function mapInstructorEventToPublicItem(activity) {
  return {
    ...normalizeEventItem(activity),
    source: "instructor",
  };
}

function getPreviewDraftCourseItems(options = {}) {
  if (!options.includePreview || !canPreviewInstructorActivity()) {
    return [];
  }

  return readPreviewDrafts()
    .filter((activity) => activity.type === "course")
    .map(mapInstructorCourseToPublicItem);
}

function getPreviewDraftEventItems(options = {}) {
  if (!options.includePreview || !canPreviewInstructorActivity()) {
    return [];
  }

  return readPreviewDrafts()
    .filter((activity) => activity.type === "event")
    .map(mapInstructorEventToPublicItem);
}

function getInstructorCourseItems(options = {}) {
  return [
    ...getPreviewDraftCourseItems(options),
    ...getInstructorActivities()
      .filter((activity) => activity.type === "course")
      .filter((activity) => shouldIncludeInstructorActivity(activity, options))
      .map(mapInstructorCourseToPublicItem),
  ];
}

function getInstructorEventItems(options = {}) {
  return [
    ...getPreviewDraftEventItems(options),
    ...getInstructorActivities()
      .filter((activity) => activity.type === "event")
      .filter((activity) => shouldIncludeInstructorActivity(activity, options))
      .map(mapInstructorEventToPublicItem),
  ];
}

export function getPublicCourseItems(options = {}) {
  return [
    ...getInstructorCourseItems(options),
    ...courseItems.map((activity) => normalizeCourseItem(activity)),
  ];
}

export function getPublicEventItems(options = {}) {
  return [
    ...getInstructorEventItems(options),
    ...eventItems.map((activity) => normalizeEventItem(activity)),
  ];
}

export function getPublicActivitiesByStatus(items, status) {
  const normalizedStatus = normalizeActivityStatus(status);

  return items.filter((item) => {
    return normalizeActivityStatus(item.status) === normalizedStatus;
  });
}

export function getPublicCourseById(courseId, options = {}) {
  const normalizedCourseId = String(courseId || "");

  return (
    getPublicCourseItems(options).find(
      (course) => String(course.id) === normalizedCourseId,
    ) || null
  );
}

export function getPublicEventById(eventId, options = {}) {
  const normalizedEventId = String(eventId || "");

  return (
    getPublicEventItems(options).find(
      (eventItem) => String(eventItem.id) === normalizedEventId,
    ) || null
  );
}

export function savePublicActivityPreviewDraft(activity = {}) {
  if (!canUseStorage()) {
    return {
      ...activity,
      id: activity.id || makePreviewId(activity.type),
      status: activity.status || "در انتظار تایید",
    };
  }

  const type = activity.type === "event" ? "event" : "course";
  const previewDraft = {
    ...activity,
    id: activity.id || makePreviewId(type),
    type,
    status: activity.status || "در انتظار تایید",
    secondaryStatus: activity.secondaryStatus || "در حال ثبت نام",
    updatedAt: new Date().toISOString(),
    isPreviewDraft: true,
  };

  const otherDrafts = readPreviewDrafts().filter(
    (draft) => String(draft.id) !== String(previewDraft.id),
  );

  writePreviewDrafts([previewDraft, ...otherDrafts].slice(0, 20));

  return previewDraft;
}

export function isPreviewAllowedForInstructorActivity() {
  return canPreviewInstructorActivity();
}

export { PUBLIC_ACTIVITY_PREVIEW_DRAFTS_STORAGE_KEY };
