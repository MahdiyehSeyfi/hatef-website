import { MOCK_USERS } from "../data/mockUsers";
import { ROLE_DASHBOARD_PATHS } from "../constants/roles";

const CURRENT_USER_STORAGE_KEY = "hatef-current-user-id";
const REGISTERED_USERS_STORAGE_KEY = "hatef-registered-users";

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function readRegisteredUsers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      REGISTERED_USERS_STORAGE_KEY,
    );
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeRegisteredUsers(users) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    REGISTERED_USERS_STORAGE_KEY,
    JSON.stringify(users),
  );
}

export function getUsers() {
  return [...MOCK_USERS, ...readRegisteredUsers()];
}

export function getUserById(userId) {
  return getUsers().find((user) => user.id === userId) || null;
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const userId = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export function setCurrentUser(user) {
  if (typeof window === "undefined" || !user?.id) {
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
    const identifiers = [item.username, item.email, item.mobile].map(
      normalizeValue,
    );

    return (
      identifiers.includes(normalizedIdentifier) &&
      item.password === normalizedPassword
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

  const [firstName = trimmedFullName, ...lastNameParts] =
    trimmedFullName.split(" ");

  const lastName = lastNameParts.join(" ");
  const registeredUsers = readRegisteredUsers();

  const newUser = {
    id: `user-${role}-${Date.now()}`,
    username: normalizedEmail,
    password: trimmedPassword,
    firstName,
    lastName,
    fullName: trimmedFullName,
    email: trimmedEmail,
    mobile: trimmedMobile,
    role,
    organization: role === "business_partner" ? "همکار تجاری" : "تیم فناور",
    expertise:
      role === "business_partner"
        ? "تجاری‌سازی و همکاری تجاری"
        : "فناوری و نوآوری",
    avatarLetter: firstName.charAt(0) || "ک",
  };

  writeRegisteredUsers([newUser, ...registeredUsers]);
  setCurrentUser(newUser);

  return newUser;
}

export function logoutUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

export function getDashboardPathByRole(role) {
  return ROLE_DASHBOARD_PATHS[role] || "/";
}

export function getCurrentUserDashboardPath() {
  const user = getCurrentUser();

  if (!user) {
    return "/";
  }

  return getDashboardPathByRole(user.role);
}
