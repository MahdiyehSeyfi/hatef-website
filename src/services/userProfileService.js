import {
  getCurrentUser,
  setCurrentUser,
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
  const directFullName = normalizeValue(
    user.fullName || user.full_name || user.name,
  );

  if (directFullName) {
    return directFullName;
  }

  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
}

function getAvatarLetter(profile = {}, fallback = "ک") {
  return (
    profile.avatarLetter ||
    profile.fullName?.[0] ||
    profile.firstName?.[0] ||
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

function shouldUpdatePassword(passwordData = {}) {
  return Boolean(
    String(passwordData.currentPassword || "").trim() ||
    String(passwordData.newPassword || "").trim() ||
    String(
      passwordData.confirmPassword || passwordData.repeatPassword || "",
    ).trim(),
  );
}

function warnProfileSyncError(error) {
  console.warn(
    "Dashboard profile sync failed:",
    error?.message || error || "Unknown error",
  );
}

function pickEditableValue(profileValue, currentValue = "") {
  if (Object.prototype.hasOwnProperty.call(profileValue || {}, "__never__")) {
    return "";
  }

  return normalizeValue(profileValue, currentValue);
}

export function buildDashboardProfile(user = {}, defaults = {}) {
  const fullName = getFullName(user) || getFullName(defaults);
  const splitName = splitFullName(fullName);

  const firstName = normalizeValue(user.firstName, splitName.firstName);
  const lastName = normalizeValue(user.lastName, splitName.lastName);

  const normalizedFullName = normalizeValue(
    user.fullName || user.full_name || user.name,
    fullName,
  );

  const actualRole = normalizeValue(
    user.role,
    defaults.authRole || defaults.role,
  );
  const roleLabel = getRoleLabel(
    actualRole,
    defaults.userRole || defaults.level || defaults.role || "کاربر سامانه",
  );

  const currentYear = getCurrentPersianYear();

  const mobile = normalizeValue(user.mobile || user.phone);
  const phone = normalizeValue(user.phone || user.mobile);
  const email = normalizeValue(user.email);

  return {
    ...defaults,
    ...user,

    firstName,
    lastName,
    fullName: normalizedFullName,
    full_name: normalizedFullName,
    name: normalizedFullName,

    mobile,
    phone,
    email,

    role: actualRole,
    authRole: actualRole,
    roleLabel,
    level: roleLabel,
    userRole: roleLabel,

    organization: normalizeValue(user.organization),
    expertise: normalizeValue(user.expertise),
    unit: normalizeValue(user.unit || user.organization),

    memberSince: normalizeValue(
      user.memberSince,
      defaults.memberSince || currentYear,
    ),
    membershipDuration: normalizeValue(
      user.membershipDuration,
      defaults.membershipDuration || "کمتر از ۱ سال",
    ),

    avatarPreview: normalizeValue(
      user.avatarPreview || user.avatarUrl || user.avatar_url,
    ),
    avatarUrl: normalizeValue(user.avatarUrl || user.avatar_url),
    avatar_url: normalizeValue(user.avatar_url || user.avatarUrl),
    avatarLetter: getAvatarLetter(
      {
        ...defaults,
        ...user,
        firstName,
        fullName: normalizedFullName,
      },
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

  const fullName = normalizeValue(
    profile.fullName || profile.full_name || profile.name,
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
  );

  const nextMobile = Object.prototype.hasOwnProperty.call(profile, "mobile")
    ? normalizeValue(profile.mobile)
    : Object.prototype.hasOwnProperty.call(profile, "phone")
      ? normalizeValue(profile.phone)
      : normalizeValue(currentUser?.mobile || currentUser?.phone);

  const nextPhone = Object.prototype.hasOwnProperty.call(profile, "phone")
    ? normalizeValue(profile.phone)
    : nextMobile;

  const nextOrganization = Object.prototype.hasOwnProperty.call(
    profile,
    "organization",
  )
    ? normalizeValue(profile.organization)
    : normalizeValue(currentUser?.organization);

  const nextExpertise = Object.prototype.hasOwnProperty.call(
    profile,
    "expertise",
  )
    ? normalizeValue(profile.expertise)
    : normalizeValue(currentUser?.expertise);

  const nextAvatarUrl = normalizeValue(
    profile.avatarUrl ||
      profile.avatar_url ||
      profile.avatarPreview ||
      currentUser?.avatarUrl ||
      currentUser?.avatar_url,
  );

  const nextUser = {
    ...(currentUser || {}),
    ...profile,
    id: currentUser?.id || profile.id,
    email: currentUser?.email || profile.email || "",
    role: currentUser?.role || profile.role || defaults.authRole || "",
    fullName,
    full_name: fullName,
    name: fullName,
    firstName: splitFullName(fullName).firstName,
    lastName: splitFullName(fullName).lastName,
    phone: nextPhone,
    mobile: nextMobile,
    organization: nextOrganization,
    expertise: nextExpertise,
    avatarUrl: nextAvatarUrl,
    avatar_url: nextAvatarUrl,
    avatarLetter: profile.avatarLetter || fullName?.[0] || "ک",
  };

  const nextDashboardProfile = buildDashboardProfile(nextUser, defaults);

  if (currentUser?.id) {
    setCurrentUser(nextUser);

    updateCurrentUserProfile({
      fullName,
      full_name: fullName,
      name: fullName,
      phone: nextPhone,
      mobile: nextMobile,
      organization: nextOrganization,
      expertise: nextExpertise,
      avatarUrl: nextAvatarUrl,
      avatar_url: nextAvatarUrl,
    }).catch(warnProfileSyncError);

    if (shouldUpdatePassword(passwordData)) {
      updateCurrentUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword:
          passwordData.confirmPassword || passwordData.repeatPassword,
      }).catch(warnProfileSyncError);
    }
  }

  return nextDashboardProfile;
}
