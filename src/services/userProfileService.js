import {
  getCurrentUser,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from "./authService";

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function splitFullName(fullName = "") {
  const parts = normalizeValue(fullName).split(" ").filter(Boolean);
  const [firstName = "", ...lastNameParts] = parts;

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function getRoleLabel(role, fallback = "کاربر سامانه") {
  const value = String(role || "").toLowerCase();

  if (value.includes("instructor") || value.includes("organizer")) {
    return "مدرس/رویدادگر";
  }

  if (value.includes("business") || value.includes("commercial")) {
    return "همکار تجاری";
  }

  if (value.includes("review")) {
    return "داور";
  }

  if (value.includes("committee") || value.includes("secretariat")) {
    return "عضو کمیته و دبیرخانه";
  }

  if (value.includes("innovator")) {
    return "فناور";
  }

  return fallback;
}

function getFullName(user = {}) {
  const directFullName = normalizeValue(user.fullName || user.name);

  if (directFullName) {
    return directFullName;
  }

  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
}

function getAvatarLetter(profile = {}, fallback = "ک") {
  return (
    profile.avatarLetter ||
    profile.firstName?.[0] ||
    profile.fullName?.[0] ||
    fallback
  );
}

function getCurrentPersianYear() {
  try {
    const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
    }).formatToParts(new Date());
    return parts.find((part) => part.type === "year")?.value || "۱۴۰۵";
  } catch {
    return "۱۴۰۵";
  }
}

export function buildDashboardProfile(user = {}, defaults = {}) {
  const fullName = getFullName(user) || getFullName(defaults);
  const splitName = splitFullName(fullName);
  const firstName = normalizeValue(
    user.firstName,
    defaults.firstName || splitName.firstName,
  );
  const lastName = normalizeValue(
    user.lastName,
    defaults.lastName || splitName.lastName,
  );
  const normalizedFullName = normalizeValue(
    user.fullName,
    defaults.fullName || `${firstName} ${lastName}`.trim(),
  );
  const roleLabel = getRoleLabel(user.role, defaults.role || defaults.level);
  const currentYear = getCurrentPersianYear();

  return {
    ...defaults,
    ...user,
    firstName,
    lastName,
    fullName: normalizedFullName,
    name: normalizedFullName,
    mobile: normalizeValue(
      user.mobile || user.phone,
      defaults.mobile || defaults.phone,
    ),
    phone: normalizeValue(
      user.phone || user.mobile,
      defaults.phone || defaults.mobile,
    ),
    email: normalizeValue(user.email, defaults.email),
    role: normalizeValue(defaults.role, roleLabel),
    level: normalizeValue(defaults.level, roleLabel),
    userRole: roleLabel,
    organization: normalizeValue(user.organization, defaults.organization),
    expertise: normalizeValue(user.expertise, defaults.expertise),
    unit: normalizeValue(user.unit || user.organization, defaults.unit),
    memberSince: normalizeValue(
      user.memberSince,
      defaults.memberSince || currentYear,
    ),
    membershipDuration: normalizeValue(
      user.membershipDuration,
      defaults.membershipDuration || "کمتر از ۱ سال",
    ),
    avatarPreview: normalizeValue(user.avatarPreview, defaults.avatarPreview),
    avatarLetter: getAvatarLetter(
      { ...defaults, ...user, firstName, fullName: normalizedFullName },
      defaults.avatarLetter || "ک",
    ),
  };
}

export function getCurrentDashboardProfile(defaults = {}) {
  const currentUser = getCurrentUser?.();
  return buildDashboardProfile(currentUser || {}, defaults);
}

export function saveCurrentDashboardProfile(
  profile = {},
  defaults = {},
  passwordData = {},
) {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id) {
    return buildDashboardProfile(profile, defaults);
  }

  updateCurrentUserPassword({
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword:
      passwordData.confirmPassword || passwordData.repeatPassword,
  });

  const fullName = normalizeValue(
    profile.fullName,
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
  );

  const updatedUser = updateCurrentUserProfile({
    ...profile,
    fullName,
    name: fullName,
    phone: profile.phone || profile.mobile,
    mobile: profile.mobile || profile.phone,
    avatarLetter:
      profile.avatarLetter || profile.firstName?.[0] || fullName?.[0] || "ک",
  });

  return buildDashboardProfile(updatedUser || profile, defaults);
}
