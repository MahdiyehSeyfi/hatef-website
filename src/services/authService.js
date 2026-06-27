import { MOCK_USERS } from "../data/mockUsers";
import { ROLE_DASHBOARD_PATHS } from "../constants/roles";

const CURRENT_USER_STORAGE_KEY = "hatef-current-user-id";
const REGISTERED_USERS_STORAGE_KEY = "hatef-registered-users";
const USER_PROFILE_OVERRIDES_STORAGE_KEY = "hatef-user-profile-overrides";
const USER_CREDENTIAL_OVERRIDES_STORAGE_KEY = "hatef-user-credential-overrides";
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
};

const BUILT_IN_TEST_USERS = [
  {
    id: "user-instructor-1",
    username: "instructor",
    password: "123456",
    firstName: "مدرس",
    lastName: "هاتف",
    fullName: "مدرس رویداد هاتف",
    email: "instructor@hatef.ir",
    mobile: "09120000005",
    role: "instructor",
    organization: "مرکز آموزش و رویداد هاتف",
    expertise: "طراحی دوره، برگزاری کارگاه و مدیریت رویداد",
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
  const fullName = normalizeText(user.fullName || user.name);

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
    user.fullName,
    `${firstName} ${lastName}`.trim(),
  );

  return {
    ...user,
    firstName,
    lastName,
    fullName: normalizedFullName,
    name: normalizedFullName,
    mobile: normalizeText(user.mobile || user.phone),
    phone: normalizeText(user.phone || user.mobile),
    email: normalizeText(user.email),
    organization: normalizeText(user.organization),
    expertise: normalizeText(user.expertise),
    avatarLetter: getAvatarLetter({
      ...user,
      firstName,
      fullName: normalizedFullName,
    }),
  };
}

function readRegisteredUsers() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      REGISTERED_USERS_STORAGE_KEY,
    );
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.map(normalizeUserProfile)
      : [];
  } catch {
    return [];
  }
}

function writeRegisteredUsers(users) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    REGISTERED_USERS_STORAGE_KEY,
    JSON.stringify(users.map(normalizeUserProfile)),
  );
}

function readProfileOverrides() {
  if (!canUseStorage()) {
    return {};
  }

  const storedValue = window.localStorage.getItem(
    USER_PROFILE_OVERRIDES_STORAGE_KEY,
  );

  if (!storedValue) {
    return {};
  }

  const parsedValue = safeParseJson(storedValue, {});
  return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
}

function writeProfileOverrides(overrides) {
  if (!canUseStorage()) {
    return overrides;
  }

  window.localStorage.setItem(
    USER_PROFILE_OVERRIDES_STORAGE_KEY,
    JSON.stringify(overrides || {}),
  );

  return overrides;
}

function readCredentialOverrides() {
  if (!canUseStorage()) {
    return {};
  }

  const storedValue = window.localStorage.getItem(
    USER_CREDENTIAL_OVERRIDES_STORAGE_KEY,
  );

  if (!storedValue) {
    return {};
  }

  const parsedValue = safeParseJson(storedValue, {});
  return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
}

function writeCredentialOverrides(overrides) {
  if (!canUseStorage()) {
    return overrides;
  }

  window.localStorage.setItem(
    USER_CREDENTIAL_OVERRIDES_STORAGE_KEY,
    JSON.stringify(overrides || {}),
  );

  return overrides;
}

function getStoredPasswordOverride(userId) {
  if (!userId) {
    return "";
  }

  const credentialOverrides = readCredentialOverrides();
  const credentialPassword = credentialOverrides[userId]?.password;

  if (credentialPassword) {
    return String(credentialPassword);
  }

  const profileOverrides = readProfileOverrides();
  const legacyProfilePassword = profileOverrides[userId]?.password;

  return legacyProfilePassword ? String(legacyProfilePassword) : "";
}

function writeStoredPasswordOverride(userId, password) {
  if (!userId || !password) {
    return null;
  }

  const credentialOverrides = readCredentialOverrides();

  return writeCredentialOverrides({
    ...credentialOverrides,
    [userId]: {
      ...(credentialOverrides[userId] || {}),
      password: String(password),
      updatedAt: new Date().toISOString(),
    },
  });
}

function applyStoredUserData(user) {
  if (!user?.id) {
    return user;
  }

  const profileOverrides = readProfileOverrides();
  const safeProfileOverride = removePasswordField(
    profileOverrides[user.id] || {},
  );
  const passwordOverride = getStoredPasswordOverride(user.id);

  return normalizeUserProfile({
    ...user,
    ...safeProfileOverride,
    id: user.id,
    role: user.role,
    username: safeProfileOverride.username || user.username,
    password: passwordOverride || user.password,
  });
}

function mergeUsers(...userGroups) {
  const usersByKey = new Map();

  userGroups.flat().forEach((user) => {
    if (!user?.id) {
      return;
    }

    usersByKey.set(normalizeValue(user.id), normalizeUserProfile(user));
  });

  return Array.from(usersByKey.values()).map(applyStoredUserData);
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

function updateRegisteredUserPasswordIfNeeded(userId, password) {
  const registeredUsers = readRegisteredUsers();
  const registeredUserExists = registeredUsers.some(
    (user) => String(user.id) === String(userId),
  );

  if (!registeredUserExists) {
    return;
  }

  writeRegisteredUsers(
    registeredUsers.map((user) =>
      String(user.id) === String(userId)
        ? normalizeUserProfile({ ...user, password })
        : user,
    ),
  );
}

export function getUsers() {
  return mergeUsers(MOCK_USERS, BUILT_IN_TEST_USERS, readRegisteredUsers());
}

export function getUserById(userId) {
  return getUsers().find((user) => user.id === userId) || null;
}

export function getCurrentUser() {
  if (!canUseStorage()) {
    return null;
  }

  const userId = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export function setCurrentUser(user) {
  if (!canUseStorage() || !user?.id) {
    return;
  }

  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
}

export function loginAsUser(userId) {
  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  setCurrentUser(user);

  return user;
}

export function loginWithCredentials(identifier, password) {
  const normalizedIdentifier = normalizeValue(identifier);
  const normalizedPassword = String(password || "").trim();

  if (!normalizedIdentifier || !normalizedPassword) {
    return null;
  }

  const user = getUsers().find((item) => {
    const identifiers = [
      item.username,
      item.email,
      item.mobile,
      item.phone,
    ].map(normalizeValue);

    return (
      identifiers.includes(normalizedIdentifier) &&
      String(item.password || "") === normalizedPassword
    );
  });

  if (!user) {
    return null;
  }

  setCurrentUser(user);

  return user;
}

export function registerMockUser({ fullName, email, mobile, password, role }) {
  const trimmedFullName = String(fullName || "").trim();
  const trimmedEmail = String(email || "").trim();
  const trimmedMobile = String(mobile || "").trim();
  const trimmedPassword = String(password || "").trim();

  if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !role) {
    return null;
  }

  const currentUsers = getUsers();
  const normalizedEmail = normalizeValue(trimmedEmail);

  const duplicateUser = currentUsers.find(
    (user) => normalizeValue(user.email) === normalizedEmail,
  );

  if (duplicateUser) {
    return null;
  }

  const { firstName, lastName } = splitFullName(trimmedFullName);
  const registeredUsers = readRegisteredUsers();

  const newUser = normalizeUserProfile({
    id: `user-${role}-${Date.now()}`,
    username: normalizedEmail,
    password: trimmedPassword,
    firstName: firstName || trimmedFullName,
    lastName,
    fullName: trimmedFullName,
    email: trimmedEmail,
    mobile: trimmedMobile,
    phone: trimmedMobile,
    role,
    organization:
      role === "business_partner"
        ? "همکار تجاری"
        : role === "instructor"
          ? "مرکز آموزش و رویداد هاتف"
          : "تیم فناور",
    expertise:
      role === "business_partner"
        ? "تجاری‌سازی و همکاری تجاری"
        : role === "instructor"
          ? "طراحی دوره و برگزاری رویداد"
          : "فناوری و نوآوری",
    avatarLetter: (firstName || trimmedFullName).charAt(0) || "ک",
  });

  writeRegisteredUsers([newUser, ...registeredUsers]);
  setCurrentUser(newUser);

  return newUser;
}

export function updateUserProfile(userId, updates = {}) {
  if (!userId) {
    return null;
  }

  const currentUser = getUserById(userId);

  if (!currentUser) {
    return null;
  }

  const updatesWithoutPassword = removePasswordField(updates);
  const existingPassword =
    getStoredPasswordOverride(userId) || currentUser.password;

  const nextUser = normalizeUserProfile({
    ...currentUser,
    ...updatesWithoutPassword,
    id: currentUser.id,
    role: currentUser.role,
    username: updatesWithoutPassword.username || currentUser.username,
    password: existingPassword,
  });

  const registeredUsers = readRegisteredUsers();
  const registeredUserExists = registeredUsers.some(
    (user) => String(user.id) === String(userId),
  );

  if (registeredUserExists) {
    writeRegisteredUsers(
      registeredUsers.map((user) =>
        String(user.id) === String(userId) ? nextUser : user,
      ),
    );
  }

  const profileOverrides = readProfileOverrides();
  writeProfileOverrides({
    ...profileOverrides,
    [userId]: {
      ...(profileOverrides[userId] || {}),
      ...removePasswordField(nextUser),
      id: userId,
      role: currentUser.role,
      username: nextUser.username,
    },
  });

  if (Object.prototype.hasOwnProperty.call(updates, "password")) {
    writeStoredPasswordOverride(userId, updates.password);
    updateRegisteredUserPasswordIfNeeded(userId, updates.password);
  }

  return getUserById(userId);
}

export function updateCurrentUserProfile(updates = {}) {
  const currentUser = getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  return updateUserProfile(currentUser.id, updates);
}

export function updateCurrentUserPassword({
  currentPassword = "",
  newPassword = "",
  confirmPassword = "",
} = {}) {
  const currentUser = getCurrentUser();
  const normalizedCurrentPassword = String(currentPassword || "").trim();
  const normalizedNewPassword = String(newPassword || "").trim();
  const normalizedConfirmPassword = String(confirmPassword || "").trim();
  const hasPasswordIntent = Boolean(
    normalizedCurrentPassword ||
    normalizedNewPassword ||
    normalizedConfirmPassword,
  );

  if (!hasPasswordIntent) {
    return {
      success: true,
      reason: "unchanged",
      user: currentUser,
    };
  }

  if (!currentUser?.id) {
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

  if (String(currentUser.password || "") !== normalizedCurrentPassword) {
    throw new Error("رمز عبور فعلی صحیح نیست.");
  }

  if (normalizedNewPassword === normalizedCurrentPassword) {
    throw new Error("رمز عبور جدید نباید با رمز فعلی یکسان باشد.");
  }

  writeStoredPasswordOverride(currentUser.id, normalizedNewPassword);
  updateRegisteredUserPasswordIfNeeded(currentUser.id, normalizedNewPassword);

  const updatedUser = updateUserProfile(currentUser.id, {
    password: normalizedNewPassword,
  });

  return {
    success: true,
    reason: "updated",
    user: updatedUser,
  };
}

export function logoutUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
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
