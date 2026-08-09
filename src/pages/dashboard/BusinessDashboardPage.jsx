import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import {
  addBusinessCollaborationRequest,
  BUSINESS_REQUESTS_STORAGE_KEY,
  deleteBusinessCollaborationRequest,
  getCurrentBusinessCollaborationRequests,
  getCurrentBusinessCollaborationHistory,
} from "../../services/businessService";

import {
  getNotificationsForCurrentUser,
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsRead,
} from "../../services/notificationService";

import { getPublishedCommercialOpportunityProjects } from "../../services/projectPublicationService";
import { fetchSitePublicationRequestsFromSupabase } from "../../services/supabaseSitePublicationService";
import {
  BUSINESS_FAVORITES_UPDATED_EVENT,
  fetchCurrentBusinessFavoriteIds,
  setBusinessFavoriteStatus,
} from "../../services/businessFavoriteService";

import {
  getCurrentDashboardProfile,
  saveCurrentDashboardProfile,
} from "../../services/userProfileService";

import Button from "../../components/ui/Button/Button";
import IconButton from "../../components/ui/IconButton/IconButton";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import {
  DashboardEmptyState,
  DashboardFAQ,
  DashboardMessages,
  DashboardNotificationMenu,
  DashboardPanel,
  DashboardProfileEdit,
  DashboardProfileMenu,
  DashboardProfileView,
  DashboardShell,
  DashboardStatCard,
  DashboardStatusBadge,
  DashboardSupportRequests,
} from "../../components/dashboard";
import DashboardFilterBar from "../../components/dashboard/DashboardFilterBar/DashboardFilterBar";
import DashboardList, { DashboardListItem } from "../../components/dashboard/DashboardList/DashboardList";

import "./InnovatorDashboardPage.css";
import "./BusinessDashboardPage.css";
import "../../components/dashboard/DashboardChrome/DashboardChrome.css";

const SITE_PUBLICATION_REQUESTS_STORAGE_KEY = "hatef_site_publication_requests";
const SITE_PUBLICATION_REQUESTS_UPDATED_EVENT =
  "hatef-site-publication-requests-updated";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: "🏠",
  },
  {
    id: "commercial-opportunities",
    label: "موقعیت‌های تجاری",
    icon: "💼",
  },
  {
    id: "favorites",
    label: "علاقه‌مندی‌ها",
    icon: "⭐",
  },
  {
    id: "requests",
    label: "درخواست‌ها و پشتیبانی",
    icon: "🗂",
    subItems: [
      {
        id: "collaboration-requests",
        label: "درخواست‌های همکاری",
      },
      {
        id: "support-tickets",
        label: "تیکت‌ها و پشتیبانی",
      },
    ],
  },
  {
    id: "messages",
    label: "پیام‌ها و اعلانات",
    icon: "🔔",
  },
  {
    id: "faq",
    label: "سوالات متداول",
    icon: "❓",
  },
];

const SECTION_DATA = {
  dashboard: {
    title: "داشبورد",
    primaryTitle: "نمای کلی همکاری تجاری",
    primaryItems: [
      {
        title: "آخرین موقعیت تجاری مشاهده‌شده",
        meta: "پروژه پایلوت سامانه مدیریت انرژی ساختمان",
        status: "جدید",
      },
      {
        title: "علاقه‌مندی‌های اخیر",
        meta: "۳ موقعیت تجاری به علاقه‌مندی‌ها اضافه شده است.",
        status: "فعال",
      },
      {
        title: "درخواست‌های همکاری",
        meta: "۱ درخواست در انتظار پیگیری است.",
        status: "پیگیری",
      },
    ],
    sideTitle: "میان‌برهای همکاری تجاری",
    sideItems: [
      "مشاهده موقعیت‌های تجاری",
      "علاقه‌مندی‌ها",
      "ثبت درخواست همکاری",
    ],
    actionLabel: "مشاهده موقعیت‌ها",
  },
  "commercial-opportunities": {
    title: "موقعیت‌های تجاری",
    primaryTitle: "موقعیت‌های تجاری پیشنهادی",
    primaryItems: [
      {
        title: "پروژه پایلوت سامانه مدیریت انرژی ساختمان",
        meta: "نیازمند شریک تجاری برای اجرای پایلوت",
        status: "جدید",
      },
      {
        title: "توسعه بازار برای محصول پایش کیفیت هوا",
        meta: "مناسب شرکت‌های فعال در تجهیزات شهری و محیط‌زیست",
        status: "پیشنهادی",
      },
      {
        title: "همکاری در تجاری‌سازی دستیار هوشمند صنعتی",
        meta: "در مرحله بررسی مدل همکاری",
        status: "در حال بررسی",
      },
    ],
    sideTitle: "فیلترهای پیشنهادی",
    sideItems: [
      "همه موقعیت‌ها",
      "موقعیت‌های جدید",
      "موقعیت‌های مناسب من",
      "فرصت‌های نزدیک به اقدام",
    ],
    actionLabel: "مشاهده همه موقعیت‌ها",
  },
  favorites: {
    title: "علاقه‌مندی‌ها",
    primaryTitle: "موقعیت‌های ذخیره‌شده",
    primaryItems: [
      {
        title: "سامانه پایش کیفیت هوا",
        meta: "ذخیره‌شده برای بررسی همکاری تجاری",
        status: "ذخیره‌شده",
      },
      {
        title: "پلتفرم مدیریت مصرف انرژی ساختمان",
        meta: "ذخیره‌شده برای مذاکره اولیه",
        status: "ذخیره‌شده",
      },
    ],
    sideTitle: "دسترسی سریع",
    sideItems: [
      "موقعیت‌های ذخیره‌شده",
      "موقعیت‌های بررسی‌شده",
      "حذف‌شده‌ها",
      "پیشنهادهای مشابه",
    ],
    actionLabel: "مدیریت علاقه‌مندی‌ها",
  },
  requests: {
    title: "درخواست‌ها و پشتیبانی",
    primaryTitle: "درخواست‌های اخیر",
    primaryItems: [
      {
        title: "سوال درباره شرایط همکاری تجاری",
        meta: "وضعیت: پاسخ داده شده",
        status: "پاسخ داده شده",
      },
      {
        title: "پیگیری مشکل مشاهده جزئیات موقعیت",
        meta: "وضعیت: در حال پیگیری",
        status: "در حال پیگیری",
      },
      {
        title: "درخواست راهنمایی برای ثبت علاقه‌مندی",
        meta: "وضعیت: در انتظار پیگیری",
        status: "در انتظار پیگیری",
      },
    ],
    sideTitle: "اقدامات پیشنهادی",
    sideItems: [
      "ثبت درخواست جدید",
      "مشاهده پاسخ پشتیبان",
      "پیگیری درخواست‌های قبلی",
    ],
    actionLabel: "ثبت درخواست",
  },
  messages: {
    title: "پیام‌ها و اعلانات",
    primaryTitle: "پیام‌های اخیر",
    primaryItems: [
      {
        title: "یک موقعیت تجاری جدید منتشر شد",
        meta: "امروز",
        status: "جدید",
      },
      {
        title: "پاسخ پشتیبان برای درخواست شما ثبت شد",
        meta: "دیروز",
        status: "پاسخ",
      },
      {
        title: "یک موقعیت پیشنهادی به علاقه‌مندی‌های شما نزدیک است",
        meta: "۲ روز پیش",
        status: "پیشنهاد",
      },
    ],
    sideTitle: "دسترسی سریع",
    sideItems: ["همه پیام‌ها", "خوانده‌نشده", "مهم"],
    actionLabel: "مشاهده پیام‌ها",
  },
  faq: {
    title: "سوالات متداول",
    primaryTitle: "سوالات پرتکرار",
    primaryItems: [
      {
        title: "چطور موقعیت تجاری را ذخیره کنم؟",
        meta: "راهنمای علاقه‌مندی‌ها",
        status: "راهنما",
      },
      {
        title: "چطور برای همکاری تجاری اقدام کنم؟",
        meta: "مراحل شروع همکاری",
        status: "همکاری",
      },
      {
        title: "درخواست پشتیبانی چه زمانی قابل حذف است؟",
        meta: "قوانین درخواست‌ها",
        status: "پشتیبانی",
      },
    ],
    sideTitle: "دسته‌بندی‌ها",
    sideItems: ["موقعیت‌های تجاری", "علاقه‌مندی‌ها", "درخواست‌ها", "پیام‌ها"],
    actionLabel: "مشاهده سوالات",
  },
  profile: {
    title: "پروفایل",
  },
  "edit-profile": {
    title: "ویرایش پروفایل",
  },
};

const BUSINESS_PROFILE = {
  firstName: "مهدی",
  lastName: "رضایی",
  fullName: "مهدی رضایی",
  mobile: "۰۹۱۲۱۲۳۴۵۶۷",
  email: "business.partner@example.com",
  role: "همکار تجاری",
  memberSince: "۱۴۰۴",
  membershipDuration: "۱ سال",
  avatarLetter: "م",
};

const INITIAL_RECENT_MESSAGES = [
  {
    id: 1,
    title: "یک موقعیت تجاری جدید برای شما پیشنهاد شد.",
    time: "امروز",
    isRead: false,
  },
  {
    id: 2,
    title: "پاسخ پشتیبان برای درخواست شما ثبت شد.",
    time: "دیروز",
    isRead: false,
  },
  {
    id: 3,
    title: "یک موقعیت به علاقه‌مندی‌های شما اضافه شد.",
    time: "۲ روز پیش",
    isRead: true,
  },
];

const BUSINESS_OPPORTUNITIES = [
  {
    id: 1,
    title: "پروژه پایلوت سامانه مدیریت انرژی ساختمان",
    field: "انرژی و ساختمان هوشمند",
    category: "انرژی",
    collaborationType: "سرمایه‌گذاری مشترک",
    stage: "آماده مذاکره",
    location: "تهران",
    date: "۱۴۰۵/۰۳/۱۴ - ساعت ۱۰:۳۰",
    status: "جدید",
    estimatedSupport: "۸۰۰ میلیون تومان",
    duration: "۶ ماه",
    owner: "مرکز رشد فناوری‌های انرژی",
    summary:
      "این موقعیت برای اجرای پایلوت یک سامانه هوشمند مدیریت مصرف انرژی در ساختمان‌های اداری تعریف شده و نیازمند شریک تجاری برای اجرا، توسعه بازار و تأمین بخشی از هزینه‌های پایلوت است.",
    challenge:
      "مصرف انرژی در ساختمان‌های بزرگ بدون پایش هوشمند و تصمیم‌گیری داده‌محور، هزینه عملیاتی بالایی ایجاد می‌کند.",
    solution:
      "سامانه پیشنهادی با جمع‌آوری داده‌های مصرف، تحلیل الگوها و ارائه پیشنهادهای بهینه‌سازی، امکان کاهش مصرف و کنترل هزینه‌ها را فراهم می‌کند.",
    businessValue:
      "قابل ارائه به مجتمع‌های اداری، دانشگاه‌ها، سازمان‌های دولتی و شرکت‌های مدیریت ساختمان.",
    requirements: [
      "توان اجرای پایلوت در محیط واقعی",
      "شبکه ارتباطی با بهره‌برداران ساختمانی",
      "تجربه فروش یا توسعه بازار در حوزه انرژی",
    ],
    tags: ["پایلوت", "انرژی", "ساختمان هوشمند"],
  },
  {
    id: 2,
    title: "توسعه بازار محصول پایش کیفیت هوا",
    field: "محیط‌زیست و تجهیزات شهری",
    category: "محیط‌زیست",
    collaborationType: "توسعه بازار",
    stage: "در حال جذب همکار",
    location: "تهران و البرز",
    date: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۳:۲۰",
    status: "پیشنهادی",
    estimatedSupport: "۵۵۰ میلیون تومان",
    duration: "۴ ماه",
    owner: "تیم توسعه فناوری سلامت شهری",
    summary:
      "این موقعیت برای توسعه بازار محصول پایش کیفیت هوا در محیط‌های شهری، صنعتی و سازمانی طراحی شده است و به همکاری تجاری در معرفی، فروش و اجرای نمونه‌های اولیه نیاز دارد.",
    challenge:
      "سازمان‌ها و شهرها برای تصمیم‌گیری دقیق درباره آلودگی هوا نیازمند داده قابل اتکا و ابزار پایش محلی هستند.",
    solution:
      "محصول شامل دستگاه پایش، پنل تحلیلی و گزارش‌گیری دوره‌ای است که امکان تحلیل وضعیت و تصمیم‌گیری را فراهم می‌کند.",
    businessValue:
      "مناسب شهرداری‌ها، شهرک‌های صنعتی، مراکز درمانی و سازمان‌های محیط‌زیستی.",
    requirements: [
      "توان مذاکره با نهادهای شهری",
      "امکان مشارکت در فروش و استقرار اولیه",
      "آشنایی با بازار تجهیزات پایش یا محیط‌زیست",
    ],
    tags: ["کیفیت هوا", "تجهیزات شهری", "توسعه بازار"],
  },
  {
    id: 3,
    title: "همکاری تجاری در دستیار هوشمند صنعتی",
    field: "هوش مصنوعی صنعتی",
    category: "هوش مصنوعی",
    collaborationType: "تجاری‌سازی محصول",
    stage: "در حال بررسی",
    location: "سراسری",
    date: "۱۴۰۵/۰۳/۱۰ - ساعت ۱۶:۰۰",
    status: "در حال بررسی",
    estimatedSupport: "۱.۲ میلیارد تومان",
    duration: "۹ ماه",
    owner: "گروه توسعه راهکارهای هوشمند صنعتی",
    summary:
      "این موقعیت برای تجاری‌سازی یک دستیار هوشمند تحلیل داده‌های صنعتی تعریف شده است و به همکاری در فروش، شناخت بازار هدف و اجرای نمونه‌های اولیه صنعتی نیاز دارد.",
    challenge:
      "بسیاری از واحدهای صنعتی داده تولید می‌کنند اما ابزار ساده و قابل استفاده برای تحلیل سریع و تصمیم‌سازی ندارند.",
    solution:
      "دستیار هوشمند با تحلیل داده‌های عملیاتی، گزارش مدیریتی و هشدارهای کاربردی تولید می‌کند.",
    businessValue:
      "قابل ارائه به کارخانه‌ها، شرکت‌های تولیدی، خطوط مونتاژ و واحدهای نگهداشت و تعمیرات.",
    requirements: [
      "دسترسی به شبکه صنعتی یا تولیدی",
      "توان تعریف سناریوی پایلوت صنعتی",
      "تجربه فروش B2B یا راهکارهای سازمانی",
    ],
    tags: ["هوش مصنوعی", "صنعت", "B2B"],
  },
  {
    id: 4,
    title: "همکاری در عرضه سامانه آموزش هوشمند سازمانی",
    field: "آموزش، منابع انسانی و هوش مصنوعی",
    category: "آموزش",
    collaborationType: "فروش سازمانی",
    stage: "جدید",
    location: "سراسری",
    date: "۱۴۰۵/۰۳/۰۸ - ساعت ۱۴:۴۵",
    status: "جدید",
    estimatedSupport: "۴۰۰ میلیون تومان",
    duration: "۳ ماه",
    owner: "تیم فناوری آموزش سازمانی",
    summary:
      "این موقعیت برای معرفی و عرضه سامانه آموزش هوشمند به سازمان‌ها، شرکت‌ها و مراکز آموزشی ایجاد شده است.",
    challenge:
      "سازمان‌ها برای آموزش کارکنان به محتوای هدفمند، پایش پیشرفت و تحلیل نیاز آموزشی نیاز دارند.",
    solution:
      "سامانه با تحلیل سطح کاربر، مسیر یادگیری شخصی‌سازی‌شده و گزارش مدیریتی ارائه می‌دهد.",
    businessValue:
      "مناسب شرکت‌های آموزشی، مشاوران منابع انسانی و شبکه‌های فروش سازمانی.",
    requirements: [
      "ارتباط با سازمان‌ها یا مراکز آموزشی",
      "توان مذاکره و فروش سازمانی",
      "تجربه ارائه دمو یا اجرای پایلوت آموزشی",
    ],
    tags: ["آموزش", "منابع انسانی", "فروش سازمانی"],
  },
];

function findProjectIndicatorValue(project, label, fallback = "") {
  const targetIndicator = (project.indicators || []).find(
    (indicator) => indicator.label === label,
  );

  return targetIndicator?.value || fallback;
}

function mapPublishedProjectToBusinessOpportunity(project, index = 0) {
  const cooperationNeeds = Array.isArray(project.cooperationNeeds)
    ? project.cooperationNeeds.filter(Boolean)
    : [];

  const collaborationType = cooperationNeeds[0] || "همکاری تجاری";
  const investmentNeed = findProjectIndicatorValue(
    project,
    "نیاز به سرمایه",
    "",
  );
  const collaborationReadiness = findProjectIndicatorValue(
    project,
    "آمادگی همکاری",
    "",
  );
  const commercializationCapacity = findProjectIndicatorValue(
    project,
    "ظرفیت تجاری‌سازی",
    "",
  );

  return {
    id: `introduced-commercial-${project.id}`,
    sourceProjectId: project.id,
    isIntroducedCommercial: true,
    title: project.title || "موقعیت تجاری معرفی‌شده",
    field: project.field || "سایر حوزه‌های فناورانه",
    category: project.field || "سایر حوزه‌ها",
    collaborationType,
    stage: "منتشر شده برای همکار تجاری",
    date: project.date || "منتشر شده",
    status: index === 0 ? "جدید" : "منتشر شده",
    estimatedSupport: investmentNeed,
    collaborationReadiness,
    commercializationCapacity,
    summary:
      project.summary ||
      "این موقعیت تجاری پس از بررسی کمیته برای همکاری با همکاران تجاری منتشر شده است.",
    description: project.description || "",
    descriptionHtml: project.descriptionHtml || "",
    requirements: cooperationNeeds,
    tags: [
      "معرفی‌شده توسط کمیته",
      project.publicationType || "موقعیت تجاری",
      project.field || "",
      collaborationType,
    ].filter(Boolean),
    reports: Array.isArray(project.reports) ? project.reports : [],
  };
}

function getAllBusinessOpportunities() {
  return getPublishedCommercialOpportunityProjects().map((project, index) =>
    mapPublishedProjectToBusinessOpportunity(project, index),
  );
}

const INITIAL_FAVORITES = [];

const INITIAL_SUPPORT_REQUESTS = [
  {
    id: 1,
    title: "سوال درباره شرایط همکاری تجاری",
    message:
      "برای اعلام علاقه‌مندی به یک موقعیت تجاری، آیا نیاز به بارگذاری مدرک یا معرفی‌نامه شرکت وجود دارد؟",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    status: "پاسخ داده شده",
    seenBySupport: true,
    supportReply:
      "در مرحله اول نیازی به بارگذاری مدرک نیست. پس از بررسی اولیه، در صورت نیاز مدارک تکمیلی از شما درخواست می‌شود.",
    repliedAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۱۰",
  },
  {
    id: 2,
    title: "پیگیری مشکل مشاهده جزئیات موقعیت",
    message:
      "هنگام ورود به جزئیات یکی از موقعیت‌های تجاری، صفحه به‌درستی بارگذاری نمی‌شود.",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۶:۲۰",
    status: "در حال پیگیری",
    seenBySupport: true,
    supportReply: "",
    repliedAt: "",
  },
  {
    id: 3,
    title: "درخواست راهنمایی برای ثبت علاقه‌مندی",
    message:
      "می‌خواهم یک موقعیت تجاری را ذخیره کنم اما نمی‌دانم بعد از ذخیره، مرحله بعدی چیست.",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۱۱:۰۰",
    status: "در انتظار پیگیری",
    seenBySupport: false,
    supportReply: "",
    repliedAt: "",
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    title: "موقعیت تجاری جدید منتشر شد",
    category: "موقعیت تجاری",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۰۹:۱۵",
    isRead: false,
    isImportant: true,
    body: "یک موقعیت تجاری جدید در حوزه انرژی و ساختمان هوشمند منتشر شده است که با علاقه‌مندی‌های شما هم‌خوانی دارد.",
  },
  {
    id: 2,
    title: "پاسخ پشتیبان ثبت شد",
    category: "پشتیبانی",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۵:۴۰",
    isRead: false,
    isImportant: false,
    body: "پاسخ پشتیبان برای یکی از درخواست‌های شما ثبت شده است. برای مشاهده جزئیات، به بخش درخواست‌ها و پشتیبانی مراجعه کنید.",
  },
  {
    id: 3,
    title: "موقعیت ذخیره‌شده به‌روزرسانی شد",
    category: "علاقه‌مندی‌ها",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۰۰",
    isRead: true,
    isImportant: false,
    body: "یکی از موقعیت‌هایی که در علاقه‌مندی‌های خود ذخیره کرده‌اید، اطلاعات جدیدی دریافت کرده است.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "موقعیت‌های تجاری",
    question: "چطور برای یک موقعیت تجاری اعلام علاقه‌مندی کنم؟",
    answer:
      "در بخش موقعیت‌های تجاری، موقعیت موردنظر را انتخاب کنید و آن را به علاقه‌مندی‌ها اضافه کنید. مراحل بعدی همکاری در نسخه‌های بعدی تکمیل می‌شود.",
  },
  {
    id: 2,
    category: "علاقه‌مندی‌ها",
    question: "علاقه‌مندی‌ها چه کاربردی دارند؟",
    answer:
      "علاقه‌مندی‌ها به شما کمک می‌کنند موقعیت‌های مهم را ذخیره کنید و بعداً راحت‌تر برای بررسی یا پیگیری به آن‌ها برگردید.",
  },
  {
    id: 3,
    category: "درخواست‌ها",
    question: "چه زمانی می‌توانم درخواست پشتیبانی را حذف کنم؟",
    answer:
      "اگر درخواست هنوز توسط پشتیبان مشاهده نشده باشد، امکان حذف وجود دارد. پس از مشاهده پشتیبان، درخواست قابل حذف نخواهد بود.",
  },
];

function getCurrentPersianDateTime() {
  const now = new Date();

  const date = now.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const time = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} - ساعت ${time}`;
}

function getOpportunityProposalHref(opportunity) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `پروپوزال نمونه برای موقعیت تجاری «${opportunity.title}»

${opportunity.summary}`,
  )}`;
}

function createCollaborationRequest(opportunity) {
  return {
    opportunityId: opportunity.id,
    title: `درخواست همکاری برای ${opportunity.title}`,
    opportunityTitle: opportunity.title,
    opportunityField: opportunity.field,
    collaborationType: opportunity.collaborationType,
    sentAt: getCurrentPersianDateTime(),
    status: "در انتظار پیگیری",
    seenBySupport: false,
    message: `درخواست همکاری برای موقعیت «${opportunity.title}» ثبت شده است.`,
    supportReply: "",
    repliedAt: "",
  };
}

function loadStoredCollaborationRequests() {
  const activeRequests = getCurrentBusinessCollaborationRequests();
  const historyRequests = getCurrentBusinessCollaborationHistory();
  const requestsById = new Map();

  [...activeRequests, ...historyRequests].forEach((request) => {
    const requestKey = String(
      request.id || request.supabaseId || request.title || "",
    );

    if (!requestKey) {
      return;
    }

    requestsById.set(requestKey, request);
  });

  return Array.from(requestsById.values());
}

const OPPORTUNITY_DETAIL_VISUALS = {
  1: {
    icon: "⚡",
    label: "Energy Pilot",
    gradient: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  },
  2: {
    icon: "🌿",
    label: "Air Quality",
    gradient: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
  },
  3: {
    icon: "🤖",
    label: "Industrial AI",
    gradient: "linear-gradient(135deg, #6366f1, #14b8a6)",
  },
  4: {
    icon: "🎓",
    label: "Smart Learning",
    gradient: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  },
};

function getOpportunityVisual(opportunity) {
  return (
    OPPORTUNITY_DETAIL_VISUALS[opportunity.id] || {
      icon: "💼",
      label: "Business Opportunity",
      gradient: "linear-gradient(135deg, #12345d, #19b4e9)",
    }
  );
}

function getOpportunityIndicators(opportunity) {
  if (opportunity.isIntroducedCommercial) {
    return [
      {
        label: "حوزه همکاری",
        value: opportunity.category,
      },
      {
        label: "نوع همکاری",
        value: opportunity.collaborationType,
      },
      {
        label: "نیاز به سرمایه",
        value: opportunity.estimatedSupport,
      },
      {
        label: "آمادگی همکاری",
        value: opportunity.collaborationReadiness,
      },
      {
        label: "ظرفیت تجاری‌سازی",
        value: opportunity.commercializationCapacity,
      },
    ].filter((indicator) => indicator.value);
  }

  return [
    {
      label: "حوزه همکاری",
      value: opportunity.category,
    },
    {
      label: "نوع همکاری",
      value: opportunity.collaborationType,
    },
    {
      label: "حمایت برآوردی",
      value: opportunity.estimatedSupport,
    },
    {
      label: "مدت پیشنهادی",
      value: opportunity.duration,
    },
  ];
}

function getOpportunityRoadmap(opportunity) {
  const roadmapMap = {
    1: [
      "توافق اولیه با شریک تجاری و تعیین محل پایلوت",
      "استقرار نسخه اولیه سامانه و اتصال داده‌های مصرف انرژی",
      "ارزیابی نتایج، محاسبه صرفه‌جویی و آماده‌سازی مدل فروش سازمانی",
    ],
    2: [
      "انتخاب بازار هدف و معرفی محصول به نهادهای شهری و صنعتی",
      "اجرای نمونه اولیه در یک نقطه منتخب و دریافت داده‌های واقعی",
      "تهیه بسته فروش، خدمات پس از فروش و برنامه توسعه بازار",
    ],
    3: [
      "تعریف سناریوی صنعتی و شناسایی داده‌های عملیاتی قابل تحلیل",
      "اجرای دمو یا پایلوت محدود در محیط صنعتی واقعی",
      "طراحی مدل درآمدی B2B و آماده‌سازی مسیر تجاری‌سازی محصول",
    ],
    4: [
      "انتخاب سازمان هدف و تعریف نیاز آموزشی کارکنان",
      "ارائه دمو، اجرای آزمایشی و دریافت بازخورد از کاربران واقعی",
      "طراحی بسته فروش سازمانی و مسیر توسعه قراردادهای بعدی",
    ],
  };

  return (
    roadmapMap[opportunity.id] || [
      "بررسی اولیه موقعیت و تعیین مدل همکاری",
      "اجرای پایلوت یا مذاکره تجاری با ذی‌نفعان اصلی",
      "جمع‌بندی نتایج و تصمیم‌گیری برای توسعه همکاری",
    ]
  );
}

function getOpportunityOutputs(opportunity) {
  return [
    `برنامه همکاری برای ${opportunity.collaborationType}`,
    "گزارش امکان‌سنجی تجاری و بازار هدف",
    "نقشه اقدام برای اجرای پایلوت یا توسعه بازار",
  ];
}

function getOpportunitySupportPackage(opportunity) {
  return [
    `برآورد حمایت: ${opportunity.estimatedSupport}`,
    `بازه همکاری پیشنهادی: ${opportunity.duration}`,
    "امکان دریافت مشاوره تخصصی برای طراحی مدل همکاری",
    "بررسی اولیه توسط تیم توسعه همکاری‌های تجاری",
  ];
}

function getOpportunityReports(opportunity) {
  const uploadedReports = Array.isArray(opportunity.reports)
    ? opportunity.reports.filter(Boolean)
    : [];

  if (uploadedReports.length) {
    return uploadedReports.map((report, index) => ({
      id: report.id || `uploaded-report-${index + 1}`,
      title: report.title || `گزارش ${index + 1}`,
      status: report.status || "فایل بارگذاری‌شده",
      type: report.fileUrl ? "file" : report.type || "text",
      text: report.text || "",
      fileName: report.fileName || "",
      fileUrl: report.fileUrl || "",
    }));
  }

  if (opportunity.isIntroducedCommercial) {
    return [];
  }

  return [
    {
      id: "business-summary",
      title: "خلاصه تجاری موقعیت",
      status: "فایل آماده دانلود",
      type: "file",
      text: `${opportunity.summary} این گزارش برای شناخت سریع ارزش تجاری، مدل همکاری و ظرفیت توسعه این موقعیت آماده شده است.`,
      fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(
        `گزارش خلاصه تجاری موقعیت «${opportunity.title}»\n\n${opportunity.summary}\n\nارزش تجاری:\n${opportunity.businessValue}`,
      )}`,
    },
    {
      id: "market-fit",
      title: "تحلیل تناسب بازار",
      status: "نیازمند بررسی شریک",
      type: "text",
      text: `${opportunity.businessValue} در مرحله بعد، لازم است بازار هدف، مسیر فروش و ظرفیت شبکه همکار تجاری دقیق‌تر ارزیابی شود.`,
    },
    {
      id: "implementation",
      title: "طرح پیشنهادی اجرا",
      status: "پیش‌نویس اجرایی",
      type: "text",
      text: `برای اجرای این موقعیت در بازه ${opportunity.duration}، ابتدا باید محدوده همکاری، نقش شریک تجاری و شاخص‌های موفقیت مشخص شود.`,
    },
  ];
}

function OpportunityDetailSectionTitle({ eyebrow, title }) {
  return (
    <header className="business-opportunity-detail__section-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </header>
  );
}

function OpportunityReportsTabs({ reports }) {
  const [activeReportId, setActiveReportId] = useState(reports[0]?.id);
  const activeReport =
    reports.find((report) => report.id === activeReportId) || reports[0];

  if (!activeReport) {
    return null;
  }

  return (
    <div className="business-opportunity-detail__reports-tabs">
      <div className="business-opportunity-detail__reports-nav" role="tablist">
        {reports.map((report) => (
          <DashboardPanel
            as="button"
            type="button"
            interactive
            padding="sm"
            key={report.id}
            role="tab"
            aria-selected={report.id === activeReport.id}
            className={
              report.id === activeReport.id
                ? "business-opportunity-detail__report-tab business-opportunity-detail__report-tab--active"
                : "business-opportunity-detail__report-tab"
            }
            onClick={() => setActiveReportId(report.id)}
          >
            <span>{report.title}</span>
            <small>{report.status}</small>
          </DashboardPanel>
        ))}
      </div>

      <DashboardPanel
        className="business-opportunity-detail__report-panel"
        role="tabpanel"
        padding="md"
      >
        <span className="business-opportunity-detail__report-label">
          {activeReport.type === "file" ? "گزارش قابل دانلود" : "گزارش متنی"}
        </span>

        <h3>{activeReport.title}</h3>
        <p>{activeReport.text}</p>

        {activeReport.fileUrl ? (
          <Button
            href={activeReport.fileUrl}
            variant="outline"
            size="sm"
            width="content"
          >
            دانلود فایل گزارش
          </Button>
        ) : (
          <div className="business-opportunity-detail__text-note">
            این بخش در حال حاضر به‌صورت متنی نمایش داده شده و فایل جداگانه‌ای
            برای آن بارگذاری نشده است.
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}

function OpportunityRichText({ html, text }) {
  if (html) {
    return (
      <div
        className="business-opportunity-detail__rich-text"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <p>{text}</p>;
}

function getIntroducedInfoItems(opportunity) {
  return [
    { label: "حوزه", value: opportunity.field },
    { label: "نوع همکاری", value: opportunity.collaborationType },
    { label: "نیاز به سرمایه", value: opportunity.estimatedSupport },
    { label: "آمادگی همکاری", value: opportunity.collaborationReadiness },
    { label: "ظرفیت تجاری‌سازی", value: opportunity.commercializationCapacity },
    { label: "وضعیت", value: opportunity.stage },
    { label: "تاریخ انتشار", value: opportunity.date },
  ].filter((item) => item.value);
}

function OpportunityDetailPage({
  opportunity,
  opportunities = BUSINESS_OPPORTUNITIES,
  isFavorite = false,
  isRequested = false,
  onToggleFavorite,
  onRequestCooperation,
}) {
  const isIntroducedCommercial = Boolean(opportunity.isIntroducedCommercial);
  const visual = getOpportunityVisual(opportunity);
  const indicators = getOpportunityIndicators(opportunity);
  const roadmap = getOpportunityRoadmap(opportunity);
  const outputs = getOpportunityOutputs(opportunity);
  const supportPackage = getOpportunitySupportPackage(opportunity);
  const reports = getOpportunityReports(opportunity);
  const infoItems = isIntroducedCommercial
    ? getIntroducedInfoItems(opportunity)
    : [];
  const relatedItems = isIntroducedCommercial
    ? []
    : opportunities
        .filter(
          (item) =>
            item.category === opportunity.category &&
            item.id !== opportunity.id,
        )
        .slice(0, 3);

  return (
    <main className="business-opportunity-detail-page" dir="rtl">
      <section
        className="business-opportunity-detail__hero"
        style={{ "--opportunity-gradient": visual.gradient }}
      >
        <div className="business-opportunity-detail__hero-content">
          <span className="business-opportunity-detail__eyebrow">
            {opportunity.category}
          </span>

          <h1>{opportunity.title}</h1>
          <p>{opportunity.summary}</p>

          <div className="business-opportunity-detail__tags">
            {opportunity.tags.map((tag) => (
              <b key={tag}>{tag}</b>
            ))}
          </div>

          <div className="business-opportunity-detail__hero-actions">
            <Button
              type="button"
              variant={isRequested ? "outline" : "secondary"}
              size="sm"
              width="content"
              className="business-opportunity-detail__request-button"
              onClick={onRequestCooperation}
              title={
                isRequested
                  ? "برای لغو درخواست کلیک کنید"
                  : "ثبت درخواست همکاری"
              }
            >
              {isRequested ? "✓ درخواست ثبت شده - لغو" : "درخواست همکاری"}
            </Button>

            <Button
              href="?section=commercial-opportunities"
              variant="outline"
              size="sm"
              width="content"
              className="business-opportunity-detail__back-link"
            >
              بازگشت به موقعیت‌ها
            </Button>
          </div>
        </div>

        <aside className="business-opportunity-detail__visual-card">
          <IconButton
            type="button"
            variant="outline"
            size="md"
            className={
              isFavorite
                ? "business-opportunity-detail__favorite business-opportunity-detail__favorite--active"
                : "business-opportunity-detail__favorite"
            }
            onClick={() => onToggleFavorite?.(opportunity.id)}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
          >
            ★
          </IconButton>

          <div className="business-opportunity-detail__symbolic-image">
            <span>{visual.icon}</span>
            <strong>{visual.label}</strong>
          </div>

          <div className="business-opportunity-detail__hero-status">
            <span>وضعیت موقعیت</span>
            <strong>{opportunity.stage}</strong>
            <small>{opportunity.date}</small>
          </div>
        </aside>
      </section>

      <section className="business-opportunity-detail__stats">
        {indicators.map((indicator) => (
          <article key={indicator.label}>
            <strong>{indicator.value}</strong>
            <span>{indicator.label}</span>
          </article>
        ))}
      </section>

      <section className="business-opportunity-detail__layout">
        <aside className="business-opportunity-detail__sidebar">
          <div className="business-opportunity-detail__info-card">
            <h2>اطلاعات کلیدی موقعیت</h2>

            <dl>
              {isIntroducedCommercial ? (
                infoItems.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <dt>حوزه</dt>
                    <dd>{opportunity.field}</dd>
                  </div>

                  <div>
                    <dt>نوع همکاری</dt>
                    <dd>{opportunity.collaborationType}</dd>
                  </div>

                  <div>
                    <dt>محل اجرا</dt>
                    <dd>{opportunity.location}</dd>
                  </div>

                  <div>
                    <dt>متولی پیگیری</dt>
                    <dd>{opportunity.owner}</dd>
                  </div>

                  <div>
                    <dt>مدت همکاری</dt>
                    <dd>{opportunity.duration}</dd>
                  </div>
                </>
              )}
            </dl>

            <Button
              type="button"
              variant={isRequested ? "outline" : "secondary"}
              size="sm"
              fullWidth
              className="business-opportunity-detail__side-request"
              onClick={onRequestCooperation}
              title={
                isRequested
                  ? "برای لغو درخواست کلیک کنید"
                  : "ثبت درخواست همکاری"
              }
            >
              {isRequested ? "✓ درخواست ثبت شده - لغو" : "ثبت درخواست همکاری"}
            </Button>

            {!isIntroducedCommercial && (
              <Button
                href={getOpportunityProposalHref(opportunity)}
                download={`${opportunity.title}.txt`}
                variant="outline"
                size="sm"
                fullWidth
                className="business-opportunity-detail__side-download"
              >
                دانلود پروپوزال موقعیت
              </Button>
            )}
          </div>

          {opportunity.requirements.length > 0 && (
            <div className="business-opportunity-detail__info-card business-opportunity-detail__info-card--tinted">
              <h2>نیازمندی‌های همکاری</h2>

              <ul>
                {opportunity.requirements.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="business-opportunity-detail__main">
          <section>
            <OpportunityDetailSectionTitle
              eyebrow="شرح موقعیت"
              title="توضیحات موقعیت تجاری"
            />
            <OpportunityRichText
              html={opportunity.descriptionHtml}
              text={opportunity.description || opportunity.summary}
            />
          </section>

          {!isIntroducedCommercial && (
            <>
              <section className="business-opportunity-detail__three-grid">
                <article>
                  <span>چالش اصلی</span>
                  <h3>مسئله‌ای که این موقعیت حل می‌کند</h3>
                  <p>{opportunity.challenge}</p>
                </article>

                <article>
                  <span>راهکار پیشنهادی</span>
                  <h3>مدل پیشنهادی حل مسئله</h3>
                  <p>{opportunity.solution}</p>
                </article>

                <article>
                  <span>ارزش تجاری</span>
                  <h3>ظرفیت بازار و توسعه همکاری</h3>
                  <p>{opportunity.businessValue}</p>
                </article>
              </section>

              <section>
                <OpportunityDetailSectionTitle
                  eyebrow="مسیر اجرا"
                  title="نقشه پیشنهادی همکاری"
                />

                <div className="business-opportunity-detail__roadmap">
                  {roadmap.map((step, index) => (
                    <article key={step}>
                      <span>{index + 1}</span>
                      <p>{step}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="business-opportunity-detail__two-grid">
                <article>
                  <OpportunityDetailSectionTitle
                    eyebrow="خروجی‌ها"
                    title="خروجی‌های مورد انتظار"
                  />

                  <ul>
                    {outputs.map((output) => (
                      <li key={output}>{output}</li>
                    ))}
                  </ul>
                </article>

                <article>
                  <OpportunityDetailSectionTitle
                    eyebrow="حمایت"
                    title="بسته حمایت و همراهی"
                  />

                  <ul>
                    {supportPackage.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>
            </>
          )}

          {reports.length > 0 && (
            <section>
              <OpportunityDetailSectionTitle
                eyebrow="مستندات"
                title="گزارش‌ها و اطلاعات تکمیلی"
              />
              <OpportunityReportsTabs reports={reports} />
            </section>
          )}
        </div>
      </section>

      {relatedItems.length > 0 && (
        <section className="business-opportunity-detail__related">
          <OpportunityDetailSectionTitle
            eyebrow="پیشنهاد مشابه"
            title="موقعیت‌های مشابه"
          />

          <div className="business-opportunity-detail__related-grid">
            {relatedItems.map((item) => {
              const relatedVisual = getOpportunityVisual(item);

              return (
                <a
                  key={item.id}
                  href={`?opportunity=${item.id}`}
                  style={{ "--related-gradient": relatedVisual.gradient }}
                >
                  <div>
                    <span>{relatedVisual.icon}</span>
                  </div>
                  <b>{item.category}</b>
                  <h3>{item.title}</h3>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function DashboardHomePanel({
  collaborationRequestsCount = 0,
  collaborationRequests = [],
  favoritesCount = 0,
  opportunities = BUSINESS_OPPORTUNITIES,
  onOpenOpportunity,
}) {
  const activeOpportunitiesCount = opportunities.filter(
    (item) => item.status !== "غیرفعال",
  ).length;
  const answeredRequestsCount = collaborationRequests.filter(
    (request) => request.status === "پاسخ داده شده",
  ).length;
  const trackingRequestsCount = collaborationRequests.filter(
    (request) =>
      request.status === "در حال پیگیری" ||
      request.status === "نیازمند اطلاعات بیشتر",
  ).length;

  const stats = [
    {
      label: "موقعیت‌های فعال",
      value: activeOpportunitiesCount.toString(),
      hint: "موقعیت‌های قابل مشاهده",
    },
    {
      label: "علاقه‌مندی‌ها",
      value: favoritesCount.toString(),
      hint: "موقعیت ذخیره‌شده",
    },
    {
      label: "درخواست‌های همکاری",
      value: collaborationRequestsCount.toString(),
      hint: "ثبت‌شده توسط این حساب",
    },
    {
      label: "در حال پیگیری/پاسخ",
      value: (trackingRequestsCount + answeredRequestsCount).toString(),
      hint: "درخواست‌های فعال یا پاسخ‌داده‌شده",
    },
  ];

  const recentRequest = collaborationRequests[0];
  const newOpportunities = opportunities
    .filter((item) => item.status === "جدید" || item.status === "منتشر شده")
    .slice(0, 3);

  return (
    <section className="business-dashboard-home">
      <div className="business-dashboard-home__stats">
        {stats.map((item) => (
          <DashboardStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
          />
        ))}
      </div>

      <div className="business-dashboard-home__body">
        <DashboardPanel className="business-dashboard-home__recent-request" padding="md">
          <div className="business-dashboard-home__section-head">
            <span>درخواست اخیر</span>
            <h3>آخرین درخواست همکاری</h3>
          </div>

          {recentRequest ? (
            <DashboardPanel
              as="article"
              variant="subtle"
              padding="sm"
              className="business-dashboard-home__request-card"
            >
              <div>
                <strong>
                  {recentRequest.opportunityTitle || recentRequest.title}
                </strong>
                <p>{recentRequest.message}</p>
              </div>

              <div className="business-dashboard-home__request-meta">
                <DashboardStatusBadge status={recentRequest.status} />
                <small>{recentRequest.sentAt}</small>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                width="content"
                onClick={() => onOpenOpportunity?.(recentRequest.opportunityId)}
              >
                مشاهده موقعیت
              </Button>
            </DashboardPanel>
          ) : (
            <DashboardEmptyState
              title="هنوز درخواست همکاری ثبت نشده است"
              description="درخواست‌های جدید شما بعد از ثبت در این بخش نمایش داده می‌شوند."
            />
          )}
        </DashboardPanel>

        <DashboardPanel className="business-dashboard-home__new-opportunities" padding="md">
          <div className="business-dashboard-home__section-head">
            <span>پیشنهادهای جدید</span>
            <h3>موقعیت‌های جدید</h3>
          </div>

          <DashboardList className="business-dashboard-home__opportunity-list">
            {newOpportunities.map((item) => (
              <DashboardListItem
                as="button"
                type="button"
                key={item.id}
                className="business-dashboard-home__opportunity-item"
                onClick={() => onOpenOpportunity?.(item.id)}
              >
                <DashboardStatusBadge status={item.status} />
                <strong>{item.title}</strong>
                <small>{item.collaborationType}</small>
              </DashboardListItem>
            ))}
          </DashboardList>
        </DashboardPanel>
      </div>
    </section>
  );
}

function OpportunitiesPanel({
  favoriteIds,
  opportunities = BUSINESS_OPPORTUNITIES,
  onToggleFavorite,
  onOpenOpportunity,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [collaborationFilter, setCollaborationFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const categories = [
    "all",
    ...new Set(opportunities.map((item) => item.category).filter(Boolean)),
  ];
  const stages = [
    "all",
    ...new Set(opportunities.map((item) => item.stage).filter(Boolean)),
  ];
  const collaborationTypes = [
    "all",
    ...new Set(
      opportunities.map((item) => item.collaborationType).filter(Boolean),
    ),
  ];
  const locations = [
    "all",
    ...new Set(opportunities.map((item) => item.location).filter(Boolean)),
  ];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      [
        item.title,
        item.field,
        item.category,
        item.collaborationType,
        item.stage,
        item.location,
        item.summary,
        item.estimatedSupport,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStage = stageFilter === "all" || item.stage === stageFilter;
    const matchesCollaboration =
      collaborationFilter === "all" ||
      item.collaborationType === collaborationFilter;
    const matchesLocation =
      locationFilter === "all" || item.location === locationFilter;
    const matchesFavorite =
      !onlyFavorites ||
      favoriteIds.some((favoriteId) => String(favoriteId) === String(item.id));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStage &&
      matchesCollaboration &&
      matchesLocation &&
      matchesFavorite
    );
  });

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStageFilter("all");
    setCollaborationFilter("all");
    setLocationFilter("all");
    setOnlyFavorites(false);
  };

  return (
    <section className="business-opportunities">
      <DashboardPanel className="business-opportunities__panel" padding="md">
        <div className="business-opportunities__header">
          <div>
            <span>موقعیت‌های تجاری</span>
            <h3>جستجو و بررسی موقعیت‌های همکاری</h3>
            <p>
              موقعیت‌ها را بر اساس حوزه، نوع همکاری، مرحله، محل اجرا و عبارت
              جستجو فیلتر کنید.
            </p>
          </div>
        </div>

        <DashboardFilterBar className="business-opportunities__filters">
          <label className="business-opportunities__search">
            <span>جستجوی دقیق</span>
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="عنوان، حوزه، نوع همکاری یا توضیح..."
            />
          </label>

          <div className="business-opportunities__filter-grid">
            <label>
              <span>حوزه</span>
              <Select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "همه حوزه‌ها" : category}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <span>مرحله</span>
              <Select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage === "all" ? "همه مراحل" : stage}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <span>نوع همکاری</span>
              <Select
                value={collaborationFilter}
                onChange={(event) => setCollaborationFilter(event.target.value)}
              >
                {collaborationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "همه انواع" : type}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <span>محل اجرا</span>
              <Select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === "all" ? "همه شهرها" : location}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="business-opportunities__filter-actions">
            <Button
              type="button"
              variant={onlyFavorites ? "secondary" : "outline"}
              size="sm"
              width="content"
              onClick={() => setOnlyFavorites((current) => !current)}
            >
              فقط علاقه‌مندی‌ها
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              width="content"
              onClick={resetFilters}
            >
              پاک‌کردن فیلترها
            </Button>

            <span>{filteredOpportunities.length} موقعیت یافت شد</span>
          </div>
        </DashboardFilterBar>

        <div className="business-opportunities__grid">
          {filteredOpportunities.map((item) => {
            const isFavorite = favoriteIds.some(
              (favoriteId) => String(favoriteId) === String(item.id),
            );

            return (
              <DashboardPanel
                as="article"
                interactive
                padding="md"
                className="business-opportunities__card"
                key={item.id}
              >
                <div className="business-opportunities__card-top">
                  <DashboardStatusBadge status={item.status} />
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      isFavorite
                        ? "business-opportunities__favorite business-opportunities__favorite--active"
                        : "business-opportunities__favorite"
                    }
                    onClick={() => onToggleFavorite(item.id)}
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite
                        ? "حذف از علاقه‌مندی‌ها"
                        : "افزودن به علاقه‌مندی‌ها"
                    }
                  >
                    ★
                  </IconButton>
                </div>

                <h4>
                  <a
                    href={`?opportunity=${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="business-opportunities__title-link"
                  >
                    {item.title}
                  </a>
                </h4>
                <p>{item.summary}</p>

                <div className="business-opportunities__info-list">
                  {item.field && <span>{item.field}</span>}
                  {item.collaborationType && <span>{item.collaborationType}</span>}
                  {item.location && <span>{item.location}</span>}
                </div>

                <div className="business-opportunities__tags">
                  {(item.tags || []).map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>

                <div className="business-opportunities__footer">
                  <small>{item.date}</small>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    width="content"
                    onClick={() => onOpenOpportunity(item.id)}
                  >
                    مشاهده
                  </Button>
                </div>
              </DashboardPanel>
            );
          })}

          {filteredOpportunities.length === 0 && (
            <DashboardEmptyState
              title="موقعیتی پیدا نشد"
              description="فیلترها یا عبارت جستجو را تغییر دهید."
            />
          )}
        </div>
      </DashboardPanel>
    </section>
  );
}

function FavoritesPanel({
  favoriteIds,
  opportunities = BUSINESS_OPPORTUNITIES,
  onToggleFavorite,
  onOpenOpportunity,
}) {
  const favoriteItems = opportunities.filter((item) =>
    favoriteIds.some((favoriteId) => String(favoriteId) === String(item.id)),
  );

  return (
    <section className="business-opportunities">
      <DashboardPanel className="business-opportunities__panel" padding="md">
        <div className="business-opportunities__header">
          <div>
            <span>علاقه‌مندی‌ها</span>
            <h3>موقعیت‌های ذخیره‌شده</h3>
            <p>
              موقعیت‌هایی که به علاقه‌مندی‌ها اضافه شده‌اند در این بخش نمایش
              داده می‌شوند.
            </p>
          </div>
        </div>

        <div className="business-opportunities__grid">
          {favoriteItems.map((item) => (
            <DashboardPanel
              as="article"
              interactive
              padding="md"
              className="business-opportunities__card"
              key={item.id}
            >
              <div className="business-opportunities__card-top">
                <DashboardStatusBadge status="ذخیره‌شده" />
                <IconButton
                  type="button"
                  variant="outline"
                  size="sm"
                  className="business-opportunities__favorite business-opportunities__favorite--active"
                  onClick={() => onToggleFavorite(item.id)}
                  aria-pressed="true"
                  aria-label="حذف از علاقه‌مندی‌ها"
                >
                  ★
                </IconButton>
              </div>

              <h4>
                <a
                  href={`?opportunity=${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="business-opportunities__title-link"
                >
                  {item.title}
                </a>
              </h4>
              <p>{item.summary}</p>

              <div className="business-opportunities__info-list">
                {item.field && <span>{item.field}</span>}
                {item.collaborationType && <span>{item.collaborationType}</span>}
                {item.location && <span>{item.location}</span>}
              </div>

              <div className="business-opportunities__footer">
                <small>{item.date}</small>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  width="content"
                  onClick={() => onOpenOpportunity(item.id)}
                >
                  مشاهده
                </Button>
              </div>
            </DashboardPanel>
          ))}

          {favoriteItems.length === 0 && (
            <DashboardEmptyState
              title="هنوز موقعیتی ذخیره نشده است"
              description="موقعیت‌های موردنظر را از بخش موقعیت‌های تجاری به علاقه‌مندی‌ها اضافه کنید."
            />
          )}
        </div>
      </DashboardPanel>
    </section>
  );
}

function CollaborationRequestsPanel({ requests, onOpenOpportunity }) {
  const [selectedRequestId, setSelectedRequestId] = useState("");

  const selectedRequest = requests.find(
    (request) =>
      String(request.id || "") === String(selectedRequestId || "") ||
      String(request.supabaseId || "") === String(selectedRequestId || ""),
  );

  if (selectedRequest) {
    const hasReply = Boolean(selectedRequest.supportReply);

    return (
      <section className="business-collaboration-requests">
        <DashboardPanel className="business-collaboration-requests__panel" padding="md">
          <div className="business-collaboration-requests__header">
            <div>
              <span>جزئیات درخواست همکاری</span>
              <h3>{selectedRequest.title}</h3>
              <p>ارسال شده در {selectedRequest.sentAt}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              width="content"
              onClick={() => setSelectedRequestId("")}
            >
              بازگشت به لیست درخواست‌ها
            </Button>
          </div>

          <div className="business-collaboration-requests__detail-grid">
            {[
              ["موقعیت تجاری", selectedRequest.opportunityTitle || selectedRequest.title],
              ["نوع همکاری", selectedRequest.collaborationType || "همکاری"],
              ["زمان ارسال", selectedRequest.sentAt],
              ["زمان پاسخ", hasReply ? selectedRequest.repliedAt : "هنوز پاسخ ثبت نشده"],
            ].map(([label, value]) => (
              <DashboardPanel as="article" variant="subtle" padding="sm" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </DashboardPanel>
            ))}
          </div>

          <div className="business-collaboration-requests__conversation">
            <DashboardPanel as="article" variant="subtle" padding="sm">
              <span>درخواست شما</span>
              <p>{selectedRequest.message}</p>
            </DashboardPanel>

            {hasReply ? (
              <DashboardPanel
                as="article"
                variant="subtle"
                padding="sm"
                className="business-collaboration-requests__reply"
              >
                <span>پاسخ کارشناس همکاری</span>
                <p>{selectedRequest.supportReply}</p>
              </DashboardPanel>
            ) : (
              <DashboardEmptyState
                title="در انتظار پیگیری"
                description="درخواست شما ثبت شده و هنوز پاسخی از کارشناس همکاری دریافت نشده است."
              />
            )}
          </div>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="business-collaboration-requests">
      <DashboardPanel className="business-collaboration-requests__panel" padding="md">
        <div className="business-collaboration-requests__header">
          <div>
            <span>درخواست‌های همکاری</span>
            <h3>درخواست‌های ثبت‌شده برای موقعیت‌های تجاری</h3>
            <p>
              درخواست‌هایی که از صفحه موقعیت‌های تجاری ثبت می‌کنید در این بخش
              نمایش داده می‌شوند.
            </p>
          </div>
        </div>

        <DashboardList className="business-collaboration-requests__list">
          {requests.map((request) => {
            const hasReply = Boolean(request.supportReply);

            return (
              <DashboardListItem
                as="article"
                className="business-collaboration-requests__card"
                key={request.id || request.supabaseId}
              >
                <div className="business-collaboration-requests__main">
                  <div className="business-collaboration-requests__title">
                    <h4>{request.opportunityTitle || request.title}</h4>
                    <DashboardStatusBadge status={request.status} />
                  </div>

                  <p>{request.message}</p>

                  {hasReply && (
                    <p>
                      <strong>پاسخ کارشناس:</strong> {request.supportReply}
                    </p>
                  )}

                  <div className="business-collaboration-requests__meta">
                    {request.opportunityField && <span>{request.opportunityField}</span>}
                    {request.collaborationType && <span>{request.collaborationType}</span>}
                    <span>ارسال: {request.sentAt}</span>
                    {hasReply && <span>پاسخ: {request.repliedAt}</span>}
                  </div>
                </div>

                <div className="business-collaboration-requests__actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    width="content"
                    onClick={() =>
                      setSelectedRequestId(request.id || request.supabaseId)
                    }
                  >
                    مشاهده درخواست
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    width="content"
                    onClick={() => onOpenOpportunity(request.opportunityId)}
                  >
                    مشاهده موقعیت
                  </Button>
                </div>
              </DashboardListItem>
            );
          })}

          {requests.length === 0 && (
            <DashboardEmptyState
              title="هنوز درخواست همکاری ثبت نشده است"
              description="از بخش موقعیت‌های تجاری وارد یک موقعیت شوید و درخواست همکاری ثبت کنید."
            />
          )}
        </DashboardList>
      </DashboardPanel>
    </section>
  );
}

function GenericDashboardContent({ currentSection }) {
  return (
    <>
      <section className="innovator-dashboard__hero">
        <div className="innovator-dashboard__hero-content">
          <span className="innovator-dashboard__hero-chip">
            پنل همکار تجاری
          </span>

          <h2>مدیریت موقعیت‌های تجاری، علاقه‌مندی‌ها و ارتباط با سامانه</h2>

          <p>
            این داشبورد برای مشاهده فرصت‌های همکاری، ذخیره موقعیت‌های مهم،
            پیگیری درخواست‌ها و دریافت پیام‌های سامانه طراحی شده است.
          </p>

          <div className="innovator-dashboard__hero-buttons">
            <Button type="button" variant="secondary" size="md">
              {currentSection.actionLabel}
            </Button>
            <Button type="button" variant="outline" size="md">
              سفارشی‌سازی داشبورد
            </Button>
          </div>
        </div>

        <div className="innovator-dashboard__hero-side">
          <div className="innovator-dashboard__hero-block">
            <span>کاربر فعال</span>
            <strong>همکار تجاری</strong>
          </div>
          <div className="innovator-dashboard__hero-block">
            <span>آخرین ورود</span>
            <strong>امروز</strong>
          </div>
          <div className="innovator-dashboard__hero-block">
            <span>دسترسی فعلی</span>
            <strong>{currentSection.title}</strong>
          </div>
        </div>
      </section>

      <section className="innovator-dashboard__content-grid">
        <DashboardPanel className="innovator-dashboard__panel innovator-dashboard__panel--wide" padding="md">
          <div className="innovator-dashboard__panel-header">
            <div>
              <span>بخش فعال</span>
              <h3>{currentSection.primaryTitle}</h3>
            </div>
            <Button type="button" variant="outline" size="sm" width="content">
              مشاهده همه
            </Button>
          </div>

          <div className="innovator-dashboard__feature-list">
            {currentSection.primaryItems.map((item) => (
              <DashboardPanel
                as="article"
                variant="subtle"
                padding="sm"
                key={item.title}
                className="innovator-dashboard__feature-item"
              >
                <div className="innovator-dashboard__feature-text">
                  <h4>{item.title}</h4>
                  <p>{item.meta}</p>
                </div>
                <DashboardStatusBadge status={item.status} />
              </DashboardPanel>
            ))}
          </div>
        </DashboardPanel>

        <div className="innovator-dashboard__stack">
          <DashboardPanel className="innovator-dashboard__panel" padding="md">
            <div className="innovator-dashboard__panel-header">
              <div>
                <span>میان‌برها</span>
                <h3>{currentSection.sideTitle}</h3>
              </div>
            </div>

            <ul className="innovator-dashboard__quick-list">
              {currentSection.sideItems.map((item) => (
                <li key={item}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    fullWidth
                  >
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      </section>
    </>
  );
}

function BusinessDashboardPage() {
  const navigate = useNavigate();

  const initialSectionFromUrl = new URLSearchParams(window.location.search).get(
    "section",
  );
  const initialActiveSection =
    initialSectionFromUrl === "commercial-opportunities"
      ? "commercial-opportunities"
      : "dashboard";

  const [activeSection, setActiveSection] = useState(initialActiveSection);
  const [activeSubItem, setActiveSubItem] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState(() =>
    getNotificationsForCurrentUser().slice(0, 3),
  );
  const [userProfile, setUserProfile] = useState(() =>
    getCurrentDashboardProfile(BUSINESS_PROFILE),
  );

  const saveUserProfile = (nextProfile, passwordData = {}) => {
    const savedProfile = saveCurrentDashboardProfile(
      nextProfile,
      BUSINESS_PROFILE,
      passwordData,
    );
    setUserProfile(savedProfile);
    return savedProfile;
  };
  const [favoriteIds, setFavoriteIds] = useState(() =>
    INITIAL_FAVORITES.map((item) => String(item.opportunityId)),
  );
  const [collaborationRequests, setCollaborationRequests] = useState(
    loadStoredCollaborationRequests,
  );

  const allBusinessOpportunities = useMemo(
    () => getAllBusinessOpportunities(),
    [contentResetKey],
  );

  useEffect(() => {
    let isMounted = true;

    fetchSitePublicationRequestsFromSupabase()
      .then((requests) => {
        if (!isMounted || !Array.isArray(requests)) {
          return;
        }

        window.localStorage.setItem(
          SITE_PUBLICATION_REQUESTS_STORAGE_KEY,
          JSON.stringify(requests),
        );

        window.dispatchEvent(
          new CustomEvent(SITE_PUBLICATION_REQUESTS_UPDATED_EVENT),
        );

        setContentResetKey((currentKey) => currentKey + 1);
      })
      .catch((error) => {
        console.warn(
          "Business opportunities hydration failed:",
          error?.message || error,
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const opportunityQueryId = new URLSearchParams(window.location.search).get(
    "opportunity",
  );
  const opportunityDetail = allBusinessOpportunities.find(
    (item) => String(item.id) === opportunityQueryId,
  );

  const currentSection = useMemo(
    () => SECTION_DATA[activeSection] || SECTION_DATA.dashboard,
    [activeSection],
  );

  const unreadMessagesCount = recentMessages.filter(
    (item) => !item.isRead,
  ).length;

  const requestedOpportunityIds = collaborationRequests.map(
    (request) => request.opportunityId,
  );

  useEffect(() => {
    let isMounted = true;

    const refreshFavoriteIds = () => {
      fetchCurrentBusinessFavoriteIds()
        .then((nextFavoriteIds) => {
          if (!isMounted) {
            return;
          }

          setFavoriteIds(nextFavoriteIds.map((itemId) => String(itemId)));
        })
        .catch((error) => {
          console.warn(
            "Business favorites hydration failed:",
            error?.message || error,
          );
        });
    };

    const handleFavoritesUpdated = (event) => {
      if (Array.isArray(event?.detail?.favoriteIds)) {
        setFavoriteIds(
          event.detail.favoriteIds.map((itemId) => String(itemId)),
        );
        return;
      }

      refreshFavoriteIds();
    };

    refreshFavoriteIds();
    window.addEventListener(
      BUSINESS_FAVORITES_UPDATED_EVENT,
      handleFavoritesUpdated,
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        BUSINESS_FAVORITES_UPDATED_EVENT,
        handleFavoritesUpdated,
      );
    };
  }, []);

  useEffect(() => {
    setCollaborationRequests(loadStoredCollaborationRequests());
  }, []);

  useEffect(() => {
    const refreshCollaborationRequests = () => {
      setCollaborationRequests(loadStoredCollaborationRequests());
    };

    const handleStorageChange = (event) => {
      if (event.key !== BUSINESS_REQUESTS_STORAGE_KEY) {
        return;
      }

      refreshCollaborationRequests();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "hatef:supabase-sync-complete",
      refreshCollaborationRequests,
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "hatef:supabase-sync-complete",
        refreshCollaborationRequests,
      );
    };
  }, []);

  const resetCurrentContent = () => {
    setContentResetKey((currentKey) => currentKey + 1);
  };

  const toggleFavorite = (opportunityId) => {
    const normalizedOpportunityId = String(opportunityId || "");
    const targetOpportunity = allBusinessOpportunities.find(
      (item) => String(item.id) === normalizedOpportunityId,
    );

    if (!normalizedOpportunityId) {
      return;
    }

    const shouldAddFavorite = !favoriteIds.some(
      (itemId) => String(itemId) === normalizedOpportunityId,
    );

    setFavoriteIds((currentIds) => {
      const normalizedCurrentIds = currentIds.map((itemId) => String(itemId));

      return shouldAddFavorite
        ? [...new Set([...normalizedCurrentIds, normalizedOpportunityId])]
        : normalizedCurrentIds.filter(
            (itemId) => itemId !== normalizedOpportunityId,
          );
    });

    setBusinessFavoriteStatus(
      normalizedOpportunityId,
      shouldAddFavorite,
      targetOpportunity || {},
    )
      .then((nextFavoriteIds) => {
        setFavoriteIds(nextFavoriteIds.map((itemId) => String(itemId)));
      })
      .catch((error) => {
        console.warn("Business favorite sync failed:", error?.message || error);

        setFavoriteIds((currentIds) => {
          const normalizedCurrentIds = currentIds.map((itemId) =>
            String(itemId),
          );

          return shouldAddFavorite
            ? normalizedCurrentIds.filter(
                (itemId) => itemId !== normalizedOpportunityId,
              )
            : [...new Set([...normalizedCurrentIds, normalizedOpportunityId])];
        });
      });
  };

  const toggleCollaborationRequest = (opportunityId) => {
    const targetOpportunity = allBusinessOpportunities.find(
      (item) => String(item.id) === String(opportunityId),
    );

    if (!targetOpportunity) {
      return;
    }

    const existingRequest = collaborationRequests.find(
      (request) => String(request.opportunityId) === String(opportunityId),
    );

    if (existingRequest) {
      deleteBusinessCollaborationRequest(existingRequest.id);
      setCollaborationRequests(loadStoredCollaborationRequests());
      return;
    }

    addBusinessCollaborationRequest(
      createCollaborationRequest(targetOpportunity),
    );
    setCollaborationRequests(loadStoredCollaborationRequests());
  };

  const openOpportunityInNewTab = (opportunityId) => {
    const targetUrl = `${window.location.origin}${window.location.pathname}?opportunity=${opportunityId}`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleLogout = () => {
    navigate("/auth");
  };

  const openInternalPage = (sectionId) => {
    setActiveSection(sectionId);
    setActiveSubItem("");
    setOpenMenuId("");
    setIsProfileMenuOpen(false);
    resetCurrentContent();
  };

  const handleNavClick = (item) => {
    const hasSubItems = Boolean(item.subItems?.length);
    const isSameOpenMenu = openMenuId === item.id;

    setActiveSection(item.id);
    resetCurrentContent();

    if (!hasSubItems) {
      setOpenMenuId("");
      setActiveSubItem("");
      return;
    }

    if (isSameOpenMenu) {
      setOpenMenuId("");
      setActiveSubItem(item.subItems[0].id);
      return;
    }

    setOpenMenuId(item.id);
    setActiveSubItem(item.subItems[0].id);
  };

  const handleSubNavClick = (parentId, subItemId) => {
    setActiveSection(parentId);
    setOpenMenuId(parentId);
    setActiveSubItem(subItemId);

    resetCurrentContent();
  };

  const refreshRecentMessages = () => {
    setRecentMessages(getNotificationsForCurrentUser().slice(0, 3));
  };

  const markMessageAsRead = (messageId, event) => {
    event?.stopPropagation();
    markNotificationAsRead(messageId);
    refreshRecentMessages();
  };

  const markAllRecentMessagesAsRead = (event) => {
    event?.stopPropagation();
    markAllNotificationsAsReadForCurrentUser();
    refreshRecentMessages();
  };

  const openMessagesCenter = (event) => {
    event?.stopPropagation();
    setIsNotificationOpen(false);
    setActiveSection("messages");
    setActiveSubItem("");
    setOpenMenuId("");
    resetCurrentContent();
  };

  const openNotificationTarget = (message) => {
    markNotificationAsRead(message.id);
    refreshRecentMessages();
    setIsNotificationOpen(false);

    if (message.sourceType === "business-collaboration-request") {
      setCollaborationRequests(loadStoredCollaborationRequests());
      setActiveSection("requests");
      setActiveSubItem("collaboration-requests");
      setOpenMenuId("requests");
      resetCurrentContent();
      return;
    }

    if (message.sourceType === "support-ticket") {
      setActiveSection("requests");
      setActiveSubItem("support-tickets");
      setOpenMenuId("requests");
      resetCurrentContent();
      return;
    }

    openInternalPage("messages");
  };

  const shouldShowDashboard = activeSection === "dashboard";
  const shouldShowOpportunities = activeSection === "commercial-opportunities";
  const shouldShowFavorites = activeSection === "favorites";
  const shouldShowCollaborationRequests =
    activeSection === "requests" && activeSubItem === "collaboration-requests";
  const shouldShowSupportTickets =
    activeSection === "requests" && activeSubItem === "support-tickets";
  const shouldShowMessages = activeSection === "messages";
  const shouldShowFaq = activeSection === "faq";
  const shouldShowProfile = activeSection === "profile";
  const shouldShowEditProfile = activeSection === "edit-profile";

  if (opportunityDetail) {
    return (
      <OpportunityDetailPage
        opportunity={opportunityDetail}
        opportunities={allBusinessOpportunities}
        isFavorite={favoriteIds.some(
          (itemId) => String(itemId) === String(opportunityDetail.id),
        )}
        isRequested={requestedOpportunityIds.some(
          (itemId) => String(itemId) === String(opportunityDetail.id),
        )}
        onToggleFavorite={toggleFavorite}
        onRequestCooperation={() =>
          toggleCollaborationRequest(opportunityDetail.id)
        }
      />
    );
  }

  return (
    <DashboardShell
      collapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
      logoSrc={universityLogo}
      navItems={NAV_ITEMS}
      activeSection={activeSection}
      activeSubItem={activeSubItem}
      openMenuId={openMenuId}
      onNavClick={handleNavClick}
      onSubNavClick={handleSubNavClick}
      title={currentSection.title || "داشبورد"}
      className="business-dashboard"
      topbarActions={
        <>
          <DashboardNotificationMenu
            open={isNotificationOpen}
            onOpenChange={setIsNotificationOpen}
            unreadCount={unreadMessagesCount}
            messages={recentMessages}
            onOpenMessages={openMessagesCenter}
            onMarkAllRead={markAllRecentMessagesAsRead}
            onMarkRead={markMessageAsRead}
            onOpenMessage={openNotificationTarget}
            onBeforeOpen={() => setIsProfileMenuOpen(false)}
          />
          <DashboardProfileMenu
            profile={userProfile}
            open={isProfileMenuOpen}
            onOpenChange={setIsProfileMenuOpen}
            onOpenProfile={() => openInternalPage("profile")}
            onEditProfile={() => openInternalPage("edit-profile")}
            onLogout={handleLogout}
            onBeforeOpen={() => setIsNotificationOpen(false)}
          />
        </>
      }
    >
      {shouldShowDashboard ? (
        <DashboardHomePanel
          key={`dashboard-${contentResetKey}`}
          collaborationRequestsCount={collaborationRequests.length}
          collaborationRequests={collaborationRequests}
          favoritesCount={favoriteIds.length}
          opportunities={allBusinessOpportunities}
          onOpenOpportunity={openOpportunityInNewTab}
        />
      ) : shouldShowOpportunities ? (
        <OpportunitiesPanel
          key={`opportunities-${contentResetKey}`}
          favoriteIds={favoriteIds}
          opportunities={allBusinessOpportunities}
          onToggleFavorite={toggleFavorite}
          onOpenOpportunity={openOpportunityInNewTab}
        />
      ) : shouldShowFavorites ? (
        <FavoritesPanel
          key={`favorites-${contentResetKey}`}
          favoriteIds={favoriteIds}
          opportunities={allBusinessOpportunities}
          onToggleFavorite={toggleFavorite}
          onOpenOpportunity={openOpportunityInNewTab}
        />
      ) : shouldShowCollaborationRequests ? (
        <CollaborationRequestsPanel
          key={`collaboration-requests-${contentResetKey}`}
          requests={collaborationRequests}
          onOpenOpportunity={openOpportunityInNewTab}
        />
      ) : shouldShowSupportTickets ? (
        <DashboardSupportRequests
          key={`support-tickets-${contentResetKey}`}
          supportRoleName="همکار تجاری"
        />
      ) : shouldShowMessages ? (
        <DashboardMessages key={`messages-${contentResetKey}`} />
      ) : shouldShowFaq ? (
        <DashboardFAQ
          key={`faq-${contentResetKey}`}
          items={FAQ_ITEMS}
          eyebrow="سوالات متداول"
          title="راهنمای سریع همکاری تجاری"
          description="پاسخ سوالات پرتکرار درباره موقعیت‌های تجاری، علاقه‌مندی‌ها، درخواست‌ها و پیام‌های سامانه."
        />
      ) : shouldShowProfile ? (
        <DashboardProfileView
          key={`profile-${contentResetKey}`}
          profile={userProfile}
          onEdit={() => openInternalPage("edit-profile")}
        />
      ) : shouldShowEditProfile ? (
        <DashboardProfileEdit
          key={`edit-profile-${contentResetKey}`}
          profile={userProfile}
          onSave={saveUserProfile}
          onCancel={() => openInternalPage("profile")}
        />
      ) : (
        <GenericDashboardContent
          key={`${activeSection}-${activeSubItem}-${contentResetKey}`}
          currentSection={currentSection}
        />
      )}
    </DashboardShell>
  );
}

export default BusinessDashboardPage;
