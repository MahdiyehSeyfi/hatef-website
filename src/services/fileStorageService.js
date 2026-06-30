import { supabase } from "../lib/supabaseClient";

export const SITE_PUBLIC_FILES_BUCKET = "site-public-files";
export const SITE_PRIVATE_FILES_BUCKET = "site-private-files";

const PRIVATE_FILE_PREFIX = "private://";
const DEFAULT_PUBLIC_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_PRIVATE_MAX_SIZE = 20 * 1024 * 1024;

const PUBLIC_CALL_PDF_MIME_TYPES = new Set(["application/pdf"]);
const PRIVATE_FILE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

function getCryptoRandomToken() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
}

function toSafeSegment(value = "", fallback = "file") {
  const normalized = normalizeText(value);
  return normalized || fallback;
}

function getFileExtension(file = {}, fallback = "bin") {
  const fileName = String(file.name || "").trim();
  const nameExtension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  if (nameExtension) {
    return nameExtension;
  }

  const mimeType = String(file.type || "").toLowerCase();
  const mimeExtensionMap = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/zip": "zip",
    "application/x-zip-compressed": "zip",
  };

  return mimeExtensionMap[mimeType] || fallback;
}

function stripExtension(fileName = "") {
  const cleanFileName = String(fileName || "").trim();
  if (!cleanFileName.includes(".")) {
    return cleanFileName;
  }

  return cleanFileName.split(".").slice(0, -1).join(".");
}

function buildObjectPath(file, options = {}) {
  const folder = toSafeSegment(options.folder || "general", "general");
  const prefix = toSafeSegment(options.prefix || "file", "file");
  const ownerId = toSafeSegment(options.ownerId || "shared", "shared");
  const fileExtension = getFileExtension(file);
  const baseFileName = toSafeSegment(stripExtension(file.name), "document");
  const timestamp = Date.now();
  const token = getCryptoRandomToken();

  return [
    folder,
    ownerId,
    `${timestamp}-${token}-${prefix}-${baseFileName}.${fileExtension}`,
  ].join("/");
}

async function getActiveUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || "shared";
}

function validateFile(file, options = {}) {
  if (!(file instanceof File)) {
    throw new Error("فایل انتخاب‌شده معتبر نیست.");
  }

  const allowedMimeTypes = options.allowedMimeTypes;
  const mimeType = String(
    file.type || "application/octet-stream",
  ).toLowerCase();

  if (allowedMimeTypes?.size && !allowedMimeTypes.has(mimeType)) {
    throw new Error("نوع فایل انتخاب‌شده مجاز نیست.");
  }

  const maxSize = Number(options.maxSize || 0);
  if (maxSize > 0 && file.size > maxSize) {
    const maxSizeMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`حجم فایل نباید بیشتر از ${maxSizeMb} مگابایت باشد.`);
  }
}

async function uploadFile(file, options = {}) {
  validateFile(file, options);

  const bucket = options.bucket || SITE_PRIVATE_FILES_BUCKET;
  const ownerId = await getActiveUserId();
  const objectPath = buildObjectPath(file, {
    ...options,
    ownerId,
  });

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      cacheControl: "31536000",
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "آپلود فایل انجام نشد.");
  }

  let url = `${PRIVATE_FILE_PREFIX}${bucket}/${objectPath}`;

  if (options.publicFile) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    url = data?.publicUrl || "";
  }

  return {
    bucket,
    path: objectPath,
    url,
    fileName: file.name || objectPath.split("/").pop(),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function uploadCallPdfFile(file, options = {}) {
  return uploadFile(file, {
    ...options,
    bucket: SITE_PUBLIC_FILES_BUCKET,
    folder: options.folder || "calls",
    prefix: options.prefix || "call-pdf",
    publicFile: true,
    allowedMimeTypes: PUBLIC_CALL_PDF_MIME_TYPES,
    maxSize: options.maxSize || DEFAULT_PUBLIC_MAX_SIZE,
  });
}

export async function uploadPlanProposalFile(file, options = {}) {
  return uploadFile(file, {
    ...options,
    bucket: SITE_PRIVATE_FILES_BUCKET,
    folder: options.folder || "plans",
    prefix: options.prefix || "plan",
    publicFile: false,
    allowedMimeTypes: PRIVATE_FILE_MIME_TYPES,
    maxSize: options.maxSize || DEFAULT_PRIVATE_MAX_SIZE,
  });
}

export async function uploadTaskResponseFile(file, options = {}) {
  return uploadFile(file, {
    ...options,
    bucket: SITE_PRIVATE_FILES_BUCKET,
    folder: options.folder || "tasks",
    prefix: options.prefix || "task",
    publicFile: false,
    allowedMimeTypes: PRIVATE_FILE_MIME_TYPES,
    maxSize: options.maxSize || DEFAULT_PRIVATE_MAX_SIZE,
  });
}

export function isPrivateFileReference(value = "") {
  return String(value || "").startsWith(PRIVATE_FILE_PREFIX);
}

export function parsePrivateFileReference(value = "") {
  const rawValue = String(value || "").trim();

  if (!isPrivateFileReference(rawValue)) {
    return null;
  }

  const reference = rawValue.slice(PRIVATE_FILE_PREFIX.length);
  const [bucket, ...pathParts] = reference.split("/");
  const path = pathParts.join("/");

  if (!bucket || !path) {
    return null;
  }

  return { bucket, path };
}

export function getManagedFileDisplayName(value = "", fallback = "فایل") {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  if (
    rawValue.startsWith("http") ||
    rawValue.startsWith("data:") ||
    rawValue.startsWith("blob:")
  ) {
    try {
      const url = new URL(rawValue);
      return decodeURIComponent(url.pathname.split("/").pop() || fallback);
    } catch {
      return fallback;
    }
  }

  if (isPrivateFileReference(rawValue)) {
    const parsed = parsePrivateFileReference(rawValue);
    return decodeURIComponent(parsed?.path?.split("/").pop() || fallback);
  }

  return rawValue.split(/[\\/]/).pop() || fallback;
}

export async function getManagedFileDownloadUrl(value = "") {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  if (!isPrivateFileReference(rawValue)) {
    return rawValue;
  }

  const parsed = parsePrivateFileReference(rawValue);
  if (!parsed) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, 60 * 10);

  if (error) {
    throw new Error(error.message || "لینک دانلود فایل ساخته نشد.");
  }

  return data?.signedUrl || "";
}

export async function openManagedFile(value = "") {
  const downloadUrl = await getManagedFileDownloadUrl(value);

  if (!downloadUrl) {
    throw new Error("لینک فایل موجود نیست.");
  }

  window.open(downloadUrl, "_blank", "noopener,noreferrer");
}
