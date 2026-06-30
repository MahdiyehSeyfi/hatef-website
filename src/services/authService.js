import { supabase } from "../lib/supabaseClient";
import { ROLE_DASHBOARD_PATHS } from "../constants/roles";

const CURRENT_USER_STORAGE_KEY = "hatef-current-user-id";
const CURRENT_USER_PROFILE_STORAGE_KEY = "hatef-current-user-profile";
const REGISTERED_USERS_STORAGE_KEY = "hatef-registered-users";
const USER_PROFILE_OVERRIDES_STORAGE_KEY = "hatef-user-profile-overrides";
const USER_CREDENTIAL_OVERRIDES_STORAGE_KEY = "hatef-user-credential-overrides";
const USER_PROFILES_STORAGE_KEY = "hatef_user_profiles";
const PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY =
  "hatef_pending_activity_registration";

const FALLBACK_DASHBOARD_PATHS = {
  innovator: "/dashboard/innovator",
  reviewer: "/dashboard/reviewer",
  committee: "/dashboard/committee-secretariat",
  committee_secretariat: "/dashboard/committee-secretariat",
  business_partner: "/dashboard/business-collaboration",
  business: "/dashboard/business-collaboration",
  instructor: "/dashboard/instructor",
  event_organizer: "/dashboard/instructor",
  organizer: "/dashboard/instructor",
  support: "/dashboard/committee-secretariat",
  admin: "/dashboard/committee-secretariat",
};

const TEST_USERS = [
  {
    id: "test-innovator",
    username: "innovator@hatef.test",
    email: "innovator@hatef.test",
    fullName: "فناور تست",
    name: "فناور تست",
    role: "innovator",
    organization: "دانشگاه تهران",
    expertise: "فناوری",
    avatarLetter: "ف",
  },
  {
    id: "test-reviewer",
    username: "reviewer@hatef.test",
    email: "reviewer@hatef.test",
    fullName: "داور تست",
    name: "داور تست",
    role: "reviewer",
    organization: "دانشگاه تهران",
    expertise: "داوری تخصصی",
    avatarLetter: "د",
  },
  {
    id: "test-committee",
    username: "committee@hatef.test",
    email: "committee@hatef.test",
    fullName: "کمیته تست",
    name: "کمیته تست",
    role: "committee",
    organization: "دبیرخانه هاتف",
    expertise: "مدیریت فرایندها",
    avatarLetter: "ک",
  },
  {
    id: "test-business",
    username: "business@hatef.test",
    email: "business@hatef.test",
    fullName: "همکار تجاری تست",
    name: "همکار تجاری تست",
    role: "business_partner",
    organization: "شرکت تست",
    expertise: "همکاری تجاری",
    avatarLetter: "ه",
  },
  {
    id: "test-instructor",
    username: "instructor@hatef.test",
    email: "instructor@hatef.test",
    fullName: "مدرس تست",
    name: "مدرس تست",
    role: "instructor",
    organization: "مرکز آموزش تست",
    expertise: "آموزش و رویداد",
    avatarLetter: "م",
  },
];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeText(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function splitFullName(fullName = "") {
  const parts = normalizeText(fullName).split(" ").filter(Boolean);
  const [firstName = "", ...lastNameParts] = parts;

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function getFullName(user = {}) {
  const fullName = normalizeText(user.fullName || user.full_name || user.name);

  if (fullName) {
    return fullName;
  }

  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
}

function getAvatarLetter(user = {}) {
  const fullName = getFullName(user);
  return user.avatarLetter || user.firstName?.[0] || fullName?.[0] || "ک";
}

function removePasswordField(value = {}) {
  const { password, ...safeValue } = value;
  return safeValue;
}

function normalizeUserProfile(user = {}) {
  const fullName = getFullName(user);
  const splitName = splitFullName(fullName);
  const firstName = normalizeText(user.firstName, splitName.firstName);
  const lastName = normalizeText(user.lastName, splitName.lastName);
  const normalizedFullName = normalizeText(
    user.fullName || user.full_name,
    `${firstName} ${lastName}`.trim(),
  );

  return {
    ...user,
    id: user.id,
    firstName,
    lastName,
    fullName: normalizedFullName,
    full_name: normalizedFullName,
    name: normalizedFullName,
    username: normalizeText(user.username || user.email),
    mobile: normalizeText(user.mobile || user.phone),
    phone: normalizeText(user.phone || user.mobile),
    email: normalizeText(user.email),
    role: normalizeText(user.role, "innovator"),
    organization: normalizeText(user.organization),
    expertise: normalizeText(user.expertise),
    avatarUrl: normalizeText(user.avatarUrl || user.avatar_url),
    avatar_url: normalizeText(user.avatar_url || user.avatarUrl),
    avatarLetter: getAvatarLetter({
      ...user,
      firstName,
      fullName: normalizedFullName,
    }),
  };
}

function mapSupabaseProfile(profile = {}) {
  return normalizeUserProfile({
    id: profile.id,
    fullName: profile.full_name,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
    organization: profile.organization,
    mobile: profile.mobile,
    phone: profile.mobile,
    expertise: profile.expertise,
    avatarUrl: profile.avatar_url,
    avatar_url: profile.avatar_url,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  });
}

function getPendingActivityRegistrationPath() {
  if (!canUseStorage()) {
    return "";
  }

  const storedValue = window.localStorage.getItem(
    PENDING_ACTIVITY_REGISTRATION_STORAGE_KEY,
  );

  if (!storedValue) {
    return "";
  }

  const pendingRegistration = safeParseJson(storedValue, null);

  return pendingRegistration?.targetPath || "";
}

function readUserProfilesFromStorage() {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(USER_PROFILES_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  return Array.isArray(parsedValue)
    ? parsedValue.filter(Boolean).map(normalizeUserProfile)
    : [];
}

function getUserProfileKey(user = {}) {
  return String(user.id || user.email || user.username || "").trim();
}

function getUserEmailKey(user = {}) {
  return String(user.email || user.username || "")
    .trim()
    .toLowerCase();
}

function mergeUserProfiles(primaryUsers = [], fallbackUsers = []) {
  const usersByKey = new Map();
  const keyByEmail = new Map();

  function addUser(user, shouldOverrideSameEmail = false) {
    const normalizedUser = normalizeUserProfile(user);
    const key = getUserProfileKey(normalizedUser);
    const emailKey = getUserEmailKey(normalizedUser);

    if (!key) {
      return;
    }

    if (shouldOverrideSameEmail && emailKey && keyByEmail.has(emailKey)) {
      usersByKey.delete(keyByEmail.get(emailKey));
    }

    usersByKey.set(key, normalizedUser);

    if (emailKey) {
      keyByEmail.set(emailKey, key);
    }
  }

  fallbackUsers.filter(Boolean).forEach((user) => addUser(user, false));
  primaryUsers.filter(Boolean).forEach((user) => addUser(user, true));

  return Array.from(usersByKey.values());
}

function readCachedCurrentUser() {
  if (!canUseStorage()) {
    return null;
  }

  const storedValue = window.localStorage.getItem(
    CURRENT_USER_PROFILE_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  const parsedValue = safeParseJson(storedValue, null);

  return parsedValue ? normalizeUserProfile(parsedValue) : null;
}

function cacheCurrentUser(user) {
  if (!canUseStorage() || !user?.id) {
    return;
  }

  const safeUser = removePasswordField(normalizeUserProfile(user));

  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, safeUser.id);
  window.localStorage.setItem(
    CURRENT_USER_PROFILE_STORAGE_KEY,
    JSON.stringify(safeUser),
  );
}

function clearCurrentUserCache() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  window.localStorage.removeItem(CURRENT_USER_PROFILE_STORAGE_KEY);
}

async function fetchProfileByUserId(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message || "خطا در دریافت اطلاعات کاربر.");
  }

  return mapSupabaseProfile(data);
}

export function getUsers() {
  const storedProfiles = readUserProfilesFromStorage();

  if (storedProfiles.length) {
    return mergeUserProfiles(storedProfiles, TEST_USERS);
  }

  return TEST_USERS.map(normalizeUserProfile);
}

export function getUserById(userId) {
  const currentUser = getCurrentUser();

  if (currentUser?.id === userId) {
    return currentUser;
  }

  return getUsers().find((user) => user.id === userId) || null;
}

export function getCurrentUser() {
  return readCachedCurrentUser();
}

export function setCurrentUser(user) {
  cacheCurrentUser(user);
}

export async function refreshCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    clearCurrentUserCache();
    return null;
  }

  const profile = await fetchProfileByUserId(user.id);
  cacheCurrentUser(profile);

  return profile;
}

export async function loginAsUser(userId) {
  const testUser = getUsers().find((user) => user.id === userId);

  if (!testUser?.email) {
    return null;
  }

  return loginWithCredentials(testUser.email, "Test123456");
}

export async function loginWithCredentials(identifier, password) {
  const email = normalizeValue(identifier);
  const normalizedPassword = String(password || "").trim();

  if (!email || !normalizedPassword) {
    return null;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: normalizedPassword,
  });

  if (error) {
    throw new Error("ایمیل یا رمز عبور صحیح نیست.");
  }

  if (!data?.user?.id) {
    return null;
  }

  const profile = await fetchProfileByUserId(data.user.id);
  cacheCurrentUser(profile);

  return profile;
}

export async function registerMockUser({
  fullName,
  email,
  mobile,
  password,
  role,
}) {
  const trimmedFullName = String(fullName || "").trim();
  const trimmedEmail = String(email || "").trim();
  const trimmedMobile = String(mobile || "").trim();
  const trimmedPassword = String(password || "").trim();
  const normalizedRole = String(role || "innovator").trim();

  if (
    !trimmedFullName ||
    !trimmedEmail ||
    !trimmedPassword ||
    !normalizedRole
  ) {
    return null;
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: trimmedPassword,
    options: {
      data: {
        full_name: trimmedFullName,
        role: normalizedRole,
        mobile: trimmedMobile,
      },
    },
  });

  if (error) {
    throw new Error(error.message || "ثبت‌نام با خطا مواجه شد.");
  }

  if (!data?.user?.id) {
    return null;
  }

  const profile = await fetchProfileByUserId(data.user.id);
  cacheCurrentUser(profile);

  return profile;
}

export async function updateUserProfile(userId, updates = {}) {
  if (!userId) {
    return null;
  }

  const updatesWithoutPassword = removePasswordField(updates);
  const currentUser = getCurrentUser();

  const nextFullName = normalizeText(
    updatesWithoutPassword.fullName ||
      updatesWithoutPassword.full_name ||
      currentUser?.fullName,
  );

  const payload = {
    full_name: nextFullName,
    mobile: normalizeText(
      updatesWithoutPassword.mobile ||
        updatesWithoutPassword.phone ||
        currentUser?.mobile,
    ),
    organization: normalizeText(
      updatesWithoutPassword.organization || currentUser?.organization,
    ),
    expertise: normalizeText(
      updatesWithoutPassword.expertise || currentUser?.expertise,
    ),
    avatar_url: normalizeText(
      updatesWithoutPassword.avatarUrl ||
        updatesWithoutPassword.avatar_url ||
        currentUser?.avatarUrl,
    ),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "ویرایش اطلاعات کاربر با خطا مواجه شد.");
  }

  const updatedUser = mapSupabaseProfile(data);
  cacheCurrentUser(updatedUser);

  if (Object.prototype.hasOwnProperty.call(updates, "password")) {
    await supabase.auth.updateUser({
      password: String(updates.password || "").trim(),
    });
  }

  return updatedUser;
}

export async function updateCurrentUserProfile(updates = {}) {
  const currentUser = getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  return updateUserProfile(currentUser.id, updates);
}

export async function updateCurrentUserPassword({
  currentPassword = "",
  newPassword = "",
  confirmPassword = "",
} = {}) {
  const currentUser = getCurrentUser();
  const normalizedCurrentPassword = String(currentPassword || "").trim();
  const normalizedNewPassword = String(newPassword || "").trim();
  const normalizedConfirmPassword = String(confirmPassword || "").trim();

  if (!currentUser?.id || !currentUser?.email) {
    throw new Error("برای تغییر رمز عبور ابتدا باید وارد حساب کاربری شوید.");
  }

  if (!normalizedCurrentPassword) {
    throw new Error("رمز عبور فعلی را وارد کنید.");
  }

  if (!normalizedNewPassword || !normalizedConfirmPassword) {
    throw new Error("رمز عبور جدید و تکرار آن را وارد کنید.");
  }

  if (normalizedNewPassword !== normalizedConfirmPassword) {
    throw new Error("رمز عبور جدید و تکرار آن یکسان نیست.");
  }

  if (normalizedNewPassword === normalizedCurrentPassword) {
    throw new Error("رمز عبور جدید نباید با رمز فعلی یکسان باشد.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
    password: normalizedCurrentPassword,
  });

  if (signInError) {
    throw new Error("رمز عبور فعلی صحیح نیست.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: normalizedNewPassword,
  });

  if (updateError) {
    throw new Error(updateError.message || "تغییر رمز عبور با خطا مواجه شد.");
  }

  return {
    success: true,
    reason: "updated",
    user: currentUser,
  };
}

export function logoutUser() {
  clearCurrentUserCache();
  supabase.auth.signOut();
}

export function getDashboardPathByRole(role) {
  const pendingActivityPath = getPendingActivityRegistrationPath();

  if (pendingActivityPath) {
    return pendingActivityPath;
  }

  return ROLE_DASHBOARD_PATHS[role] || FALLBACK_DASHBOARD_PATHS[role] || "/";
}

export function getCurrentUserDashboardPath() {
  const user = getCurrentUser();

  if (!user) {
    return "/";
  }

  return getDashboardPathByRole(user.role);
}

export {
  CURRENT_USER_STORAGE_KEY,
  REGISTERED_USERS_STORAGE_KEY,
  USER_PROFILE_OVERRIDES_STORAGE_KEY,
  USER_CREDENTIAL_OVERRIDES_STORAGE_KEY,
};
