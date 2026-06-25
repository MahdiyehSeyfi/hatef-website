export const USER_ROLES = {
  INNOVATOR: "innovator",
  REVIEWER: "reviewer",
  COMMITTEE: "committee",
  BUSINESS_PARTNER: "business_partner",
  INSTRUCTOR: "instructor",
  SUPPORT: "support",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [USER_ROLES.INNOVATOR]: "فناور",
  [USER_ROLES.REVIEWER]: "داور",
  [USER_ROLES.COMMITTEE]: "دبیرخانه / کمیته راهبری",
  [USER_ROLES.BUSINESS_PARTNER]: "همکار تجاری",
  [USER_ROLES.INSTRUCTOR]: "مدرس / رویدادگر",
  [USER_ROLES.SUPPORT]: "پشتیبان",
  [USER_ROLES.ADMIN]: "مدیر کل سامانه",
};

export const ROLE_DASHBOARD_PATHS = {
  [USER_ROLES.INNOVATOR]: "/dashboard/innovator",
  [USER_ROLES.REVIEWER]: "/dashboard/reviewer",
  [USER_ROLES.COMMITTEE]: "/dashboard/committee-secretariat",
  [USER_ROLES.BUSINESS_PARTNER]: "/dashboard/business-collaboration",
  [USER_ROLES.INSTRUCTOR]: "/dashboard/instructor",
  [USER_ROLES.SUPPORT]: "/dashboard/support",
  [USER_ROLES.ADMIN]: "/dashboard/admin",
};

export const PUBLIC_REGISTRATION_ROLES = [
  USER_ROLES.INNOVATOR,
  USER_ROLES.BUSINESS_PARTNER,
];
