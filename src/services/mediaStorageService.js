import { supabase } from "../lib/supabaseClient";

export const SITE_MEDIA_BUCKET = "site-media";

const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1100;
const DEFAULT_QUALITY = 0.78;

function normalizeText(value = "") {
  return String(value || "").trim();
}

function getRandomToken() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function removeFileExtension(value = "") {
  return normalizeText(value).replace(/\.[^.]+$/g, "");
}

function toAsciiStorageSegment(value = "image", fallback = "image") {
  const normalizedValue = removeFileExtension(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return normalizedValue || fallback;
}

function normalizeFolder(folder = "general") {
  const safeFolder = normalizeText(folder)
    .split("/")
    .map((segment) => toAsciiStorageSegment(segment, "general"))
    .filter(Boolean)
    .join("/")
    .replace(/\/+/, "/")
    .replace(/^\/+|\/+$/g, "");

  return safeFolder || "general";
}

function normalizeUserFolder(userId = "anonymous") {
  return toAsciiStorageSegment(userId, "anonymous").slice(0, 80) || "anonymous";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("خواندن فایل تصویر انجام نشد."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromSource(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("پردازش تصویر انجام نشد."));
    image.src = source;
  });
}

function getScaledImageSize(width, height, maxWidth, maxHeight) {
  const safeWidth = Math.max(Number(width) || maxWidth, 1);
  const safeHeight = Math.max(Number(height) || maxHeight, 1);
  const ratio = Math.min(1, maxWidth / safeWidth, maxHeight / safeHeight);

  return {
    width: Math.max(Math.round(safeWidth * ratio), 1),
    height: Math.max(Math.round(safeHeight * ratio), 1),
  };
}

function canvasToBlob(canvas, type = "image/jpeg", quality = DEFAULT_QUALITY) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("فشرده‌سازی تصویر انجام نشد."));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function getUploadExtension(blob) {
  if (blob?.type === "image/svg+xml") return "svg";
  if (blob?.type === "image/png") return "png";
  if (blob?.type === "image/webp") return "webp";
  if (blob?.type === "image/gif") return "gif";
  return "jpg";
}

async function prepareImageBlob(file, options = {}) {
  if (!file) {
    throw new Error("فایل تصویر انتخاب نشده است.");
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error("فقط فایل تصویر قابل بارگذاری است.");
  }

  if (file.type === "image/svg+xml") {
    return new Blob([await file.text()], { type: "image/svg+xml" });
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImageFromSource(dataUrl);
  const size = getScaledImageSize(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    options.maxWidth || DEFAULT_MAX_WIDTH,
    options.maxHeight || DEFAULT_MAX_HEIGHT,
  );

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(image, 0, 0, size.width, size.height);

  return canvasToBlob(
    canvas,
    options.outputType || "image/jpeg",
    options.quality || DEFAULT_QUALITY,
  );
}

async function getActiveUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || "دریافت وضعیت ورود Supabase انجام نشد.");
  }

  if (!data?.user?.id) {
    throw new Error("برای آپلود تصویر باید با حساب Supabase وارد شده باشید.");
  }

  return data.user.id;
}

function buildStorageObjectPath({
  folder,
  userId,
  prefix,
  fileName,
  extension,
}) {
  const safeFolder = normalizeFolder(folder || "general");
  const safeUserId = normalizeUserFolder(userId);
  const safePrefix = toAsciiStorageSegment(prefix || "image", "image");
  const safeFileName = toAsciiStorageSegment(fileName || safePrefix, "image");
  const timestamp = Date.now();
  const randomToken = getRandomToken();

  return [
    safeFolder,
    safeUserId,
    `${timestamp}-${randomToken}-${safePrefix}-${safeFileName}.${extension}`,
  ].join("/");
}

export function isInlineDataImage(value = "") {
  return /^data:image\//i.test(String(value || ""));
}

export function isRemoteImageUrl(value = "") {
  return /^https?:\/\//i.test(String(value || ""));
}

export async function uploadImageFileToSiteMedia(file, options = {}) {
  const userId = await getActiveUserId();
  const imageBlob = await prepareImageBlob(file, options);
  const extension = getUploadExtension(imageBlob);
  const objectPath = buildStorageObjectPath({
    folder: options.folder || "general",
    userId,
    prefix: options.prefix || "image",
    fileName: file.name || options.prefix || "image",
    extension,
  });

  const { error } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .upload(objectPath, imageBlob, {
      cacheControl: "31536000",
      contentType: imageBlob.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    const errorStatus = error.statusCode || error.status || "";
    const statusText = errorStatus ? ` (${errorStatus})` : "";
    throw new Error(
      `${error.message || "بارگذاری تصویر در فضای ذخیره‌سازی انجام نشد."}${statusText}`,
    );
  }

  const { data } = supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .getPublicUrl(objectPath);

  return {
    url: data?.publicUrl || "",
    path: objectPath,
    bucket: SITE_MEDIA_BUCKET,
  };
}

export async function normalizeUploadedImageSource(file, options = {}) {
  const uploadedImage = await uploadImageFileToSiteMedia(file, options);
  return uploadedImage.url;
}
