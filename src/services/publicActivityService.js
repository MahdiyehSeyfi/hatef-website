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

  if (normalizedStatus === "در حال برگزاری" || normalizedStatus === "ongoing") {
    return "ongoing";
  }

  if (
    normalizedStatus === "برگزار شده" ||
    normalizedStatus === "پایان یافته" ||
    normalizedStatus === "past"
  ) {
    return "past";
  }

  return "registering";
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

function mapInstructorCourseToPublicItem(activity) {
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
    startDate: normalizeString(activity.startDate, activity.createdAt || ""),
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
    source: "instructor",
  };
}

function mapInstructorEventToPublicItem(activity) {
  const status = normalizeActivityStatus(
    activity.secondaryStatus || activity.publicStatus || activity.status,
  );

  return {
    ...activity,
    id: activity.id,
    type: "event",
    title: normalizeString(activity.title, "رویداد هاتف"),
    image: getActivityImage(activity),
    status,
    startDate: normalizeString(
      activity.eventDate || activity.startDate,
      activity.createdAt || "",
    ),
    eventDate: normalizeString(
      activity.eventDate || activity.startDate,
      activity.createdAt || "",
    ),
    startTime: activity.startTime || "",
    endTime: activity.endTime || "",
    instructor:
      activity.secretaryName ||
      activity.instructorName ||
      activity.instructor ||
      "دبیر رویداد هاتف",
    secretaryName:
      activity.secretaryName ||
      activity.instructorName ||
      activity.instructor ||
      "دبیر رویداد هاتف",
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
  return [...getInstructorCourseItems(options), ...courseItems];
}

export function getPublicEventItems(options = {}) {
  return [...getInstructorEventItems(options), ...eventItems];
}

export function getPublicActivitiesByStatus(items, status) {
  return items.filter((item) => item.status === status);
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
