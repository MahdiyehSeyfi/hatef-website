import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import bannerImage from "../../assets/images/banner.png";

import "./InnovatorDashboardPage.css";
import "./CommitteeSecretariatDashboardPage.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: "🏠",
  },
  {
    id: "calls-management",
    label: "مدیریت فراخوان‌ها",
    icon: "📣",
    subItems: [
      {
        id: "create-call",
        label: "ساخت جدید",
      },
      {
        id: "current-calls",
        label: "فراخوان‌های جاری",
      },
      {
        id: "calls-history",
        label: "تاریخچه فراخوان‌ها",
      },
    ],
  },
  {
    id: "plans-management",
    label: "مدیریت طرح‌ها",
    icon: "🧾",
    subItems: [
      {
        id: "current-plans",
        label: "طرح‌های جاری",
      },
      {
        id: "final-decisions",
        label: "تعیین وضعیت نهایی",
      },
      {
        id: "accepted-plans",
        label: "طرح‌های قبول شده",
      },
      {
        id: "plans-history",
        label: "تاریخچه طرح‌ها",
      },
    ],
  },
  {
    id: "reviewers-management",
    label: "مدیریت داوران",
    icon: "⚖️",
    subItems: [
      {
        id: "reviewers-info",
        label: "اطلاعات داوران",
      },
      {
        id: "reviewer-feedbacks",
        label: "بازخوردهای داوران",
      },
    ],
  },
  {
    id: "business-management",
    label: "مدیریت همکاران تجاری",
    icon: "🤝",
    subItems: [
      {
        id: "business-partners-info",
        label: "اطلاعات همکاران تجاری",
      },
      {
        id: "business-collaboration-requests",
        label: "درخواست‌های همکاری",
      },
    ],
  },
  {
    id: "events-management",
    label: "مدیریت رویدادها",
    icon: "🎓",
    subItems: [
      {
        id: "instructors-info",
        label: "اطلاعات مدرسین",
      },
      {
        id: "activities-management",
        label: "دوره‌ها و رویدادها",
      },
      {
        id: "execution-orders-management",
        label: "سفارش اجرا",
      },
    ],
  },
  {
    id: "received-requests",
    label: "درخواست‌های دریافتی",
    icon: "📥",
    subItems: [
      {
        id: "new-requests",
        label: "درخواست‌های جدید",
      },
      {
        id: "requests-history",
        label: "تاریخچه درخواست‌ها",
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
    description:
      "نمای کلی فعالیت‌های دبیرخانه، درخواست‌های دریافتی و وضعیت پیگیری‌ها.",
  },
  "create-call": {
    title: "ساخت فراخوان جدید",
    description:
      "اطلاعات صفحه فراخوان را مرحله‌به‌مرحله تکمیل کنید و در پایان پیش‌نویس یا منتشر کنید.",
  },
  "current-calls": {
    title: "فراخوان‌های جاری",
    description:
      "فراخوان‌های فعال و پیش‌نویس را مدیریت، ویرایش، حذف یا منتشر کنید.",
  },
  "calls-history": {
    title: "تاریخچه فراخوان‌ها",
    description:
      "همه فراخوان‌های سال‌های مختلف را با فیلتر زمانی و وضعیت مرور کنید.",
  },
  "new-requests": {
    title: "درخواست‌های جدید",
    description:
      "درخواست‌هایی که از طرف کاربران مختلف ارسال شده و هنوز پاسخ نهایی نگرفته‌اند.",
  },
  "requests-history": {
    title: "تاریخچه درخواست‌ها",
    description: "درخواست‌هایی که پاسخ دبیرخانه برای آن‌ها ارسال شده است.",
  },
  "calls-management": {
    title: "مدیریت فراخوان‌ها",
    description:
      "این بخش در مرحله‌های بعدی برای تعریف، ویرایش و پایش فراخوان‌ها تکمیل می‌شود.",
  },
  "plans-management": {
    title: "مدیریت طرح‌ها",
    description:
      "پایش طرح‌های جاری، تعیین وضعیت نهایی و مرور تاریخچه طرح‌های ارسال‌شده.",
  },
  "current-plans": {
    title: "طرح‌های جاری",
    description:
      "طرح‌های ارسال‌شده را مانند نمای داور مرور کنید و پرونده هر طرح را ببینید.",
  },
  "final-decisions": {
    title: "تعیین وضعیت نهایی",
    description:
      "بازخورد دبیرخانه و کمیته راهبری را ثبت و وضعیت نهایی طرح‌ها را مشخص کنید.",
  },
  "accepted-plans": {
    title: "طرح‌های قبول شده",
    description:
      "این بخش در مرحله بعد برای مدیریت طرح‌های قبول و قبول ضعیف تکمیل می‌شود.",
  },
  "plans-history": {
    title: "تاریخچه طرح‌ها",
    description:
      "همه طرح‌های تعیین‌تکلیف‌شده و سوابق وضعیت نهایی را مرور کنید.",
  },
  "reviewers-management": {
    title: "مدیریت داوران",
    description: "پایش اطلاعات داوران و مرور بازخوردهای ثبت‌شده برای طرح‌ها.",
  },
  "reviewers-info": {
    title: "اطلاعات داوران",
    description: "اطلاعات کاربری داوران و آمار مشارکت آن‌ها در بررسی طرح‌ها.",
  },
  "reviewer-feedbacks": {
    title: "بازخوردهای داوران",
    description:
      "همه طرح‌هایی که حداقل یک بازخورد داور دارند، همراه با متن بازخوردها.",
  },
  "business-management": {
    title: "مدیریت همکاران تجاری",
    description:
      "مدیریت اطلاعات همکاران تجاری و پیگیری درخواست‌های همکاری ثبت‌شده برای موقعیت‌های تجاری.",
  },
  "business-partners-info": {
    title: "اطلاعات همکاران تجاری",
    description:
      "اطلاعات کاربری همکاران تجاری و آمار مشارکت آن‌ها در مشاهده، علاقه‌مندی و درخواست همکاری.",
  },
  "business-collaboration-requests": {
    title: "درخواست‌های همکاری",
    description:
      "درخواست‌های ثبت‌شده برای موقعیت‌های تجاری را مشاهده کنید و برای هر درخواست پیام ثبت کنید.",
  },
  "events-management": {
    title: "مدیریت رویدادها",
    description:
      "مدیریت مدرسین، بررسی دوره‌ها و رویدادهای ساخته‌شده و تعریف سفارش‌های اجرا.",
  },
  "instructors-info": {
    title: "اطلاعات مدرسین",
    description:
      "اطلاعات مدرسین و رویدادگرها همراه با آمار مشارکت و عملکرد آموزشی.",
  },
  "activities-management": {
    title: "دوره‌ها و رویدادها",
    description:
      "بررسی دوره‌ها و رویدادهای ساخته‌شده، ثبت بازخورد، رد یا انتشار نهایی.",
  },
  "execution-orders-management": {
    title: "سفارش اجرا",
    description:
      "ساخت سفارش اجرای دوره یا رویداد و پیگیری وضعیت پذیرش آن توسط مدرسین و رویدادگرها.",
  },
  messages: {
    title: "پیام‌ها و اعلانات",
    description: "مشاهده و مدیریت پیام‌های سامانه و اطلاعیه‌های مهم.",
  },
  faq: {
    title: "سوالات متداول",
    description: "راهنمای سریع کار با داشبورد عضو کمیته و دبیرخانه.",
  },
  profile: {
    title: "پروفایل",
    description: "مشاهده اطلاعات حساب کاربری دبیرخانه.",
  },
  "edit-profile": {
    title: "ویرایش پروفایل",
    description: "ویرایش اطلاعات حساب کاربری و تنظیم رمز عبور.",
  },
};

const INITIAL_PROFILE = {
  firstName: "مهدی",
  lastName: "رضایی",
  mobile: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "secretariat@example.com",
  role: "عضو کمیته و دبیرخانه",
  unit: "دبیرخانه برنامه هاتف",
  avatarLetter: "م",
};

const CALL_DETAILS_PREVIEW_CSS =
  ":root { --color-white:#ffffff; --color-primary:#0a274f; --color-secondary:#00adea; --color-accent:#01d2c9; --color-warning:#f9bd31; --color-black:#111111; --color-muted:#6b7280; --container-padding:65px; }\n* { box-sizing: border-box; }\nbody { margin:0; font-family: IRANSans, Tahoma, Arial, sans-serif; direction:rtl; background:#ffffff; }\na { text-decoration:none; }\n.call-details {\n  --call-details-width: 1360px;\n\n  padding: 38px 0 82px;\n\n  background-color: #ffffff;\n}\n\n.call-details__container {\n  width: min(calc(100% - 170px), var(--call-details-width));\n\n  margin-inline: auto;\n}\n\n/* Hero */\n\n.call-details__hero {\n  margin-bottom: 78px;\n}\n\n.call-details__hero-image {\n  position: relative;\n\n  height: 390px;\n\n  overflow: hidden;\n\n  background-color: var(--color-primary);\n  box-shadow: 0 18px 48px rgba(20, 44, 74, 0.08);\n}\n\n.call-details__hero-image img {\n  width: 100%;\n  height: 100%;\n\n  display: block;\n\n  object-fit: cover;\n}\n\n.call-details__hero-status {\n  position: absolute;\n  right: 24px;\n  bottom: 18px;\n  z-index: 2;\n\n  display: flex;\n  align-items: center;\n  gap: 14px;\n\n  color: #ffffff;\n\n  font-size: 12px;\n  font-weight: 800;\n}\n\n.call-details__hero-content {\n  display: grid;\n  grid-template-columns: 220px minmax(0, 1fr);\n  gap: 54px;\n\n  padding-top: 22px;\n\n  direction: ltr;\n}\n\n.call-details__quick-actions {\n  display: grid;\n  gap: 10px;\n\n  align-content: start;\n\n  direction: rtl;\n}\n\n.call-details__quick-link,\n.call-details__submit-button {\n  min-height: 38px;\n\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n\n  border: 1px solid #cbd1d8;\n\n  color: #29323b;\n  background-color: #ffffff;\n\n  font-size: 12px;\n  font-weight: 700;\n\n  transition:\n    color 180ms ease,\n    border-color 180ms ease,\n    background-color 180ms ease,\n    transform 180ms ease;\n}\n\n.call-details__quick-link:hover {\n  color: var(--color-primary);\n  border-color: var(--color-accent);\n\n  transform: translateY(-2px);\n}\n\n.call-details__quick-link--download {\n  color: #111111;\n  background-color: #f8f8f8;\n}\n\n.call-details__submit-button {\n  border-color: var(--color-secondary);\n\n  color: #ffffff;\n  background-color: var(--color-secondary);\n}\n\n.call-details__submit-button:hover {\n  background-color: var(--color-primary);\n  border-color: var(--color-primary);\n\n  transform: translateY(-2px);\n}\n\n.call-details__hero-info {\n  direction: rtl;\n  text-align: right;\n}\n\n.call-details__meta {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  gap: 14px;\n\n  margin-bottom: 24px;\n}\n\n.call-details__number {\n  width: 32px;\n  height: 32px;\n\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  border: 2px solid var(--color-warning);\n  border-radius: 50%;\n\n  color: var(--color-warning);\n\n  font-size: 16px;\n  font-weight: 900;\n}\n\n.call-details__meta h1 {\n  margin: 0;\n\n  color: #050505;\n\n  font-size: 22px;\n  font-weight: 900;\n  line-height: 1.8;\n}\n\n.call-details__badge {\n  min-height: 30px;\n\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  padding: 5px 16px;\n\n  border-radius: 999px;\n\n  color: #111111;\n  background-color: var(--color-accent);\n\n  font-size: 12px;\n  font-weight: 900;\n\n  white-space: nowrap;\n}\n\n.call-details__badge--active {\n  background-color: var(--color-warning);\n}\n\n.call-details__hero-info p {\n  margin: 0 0 18px;\n\n  color: #2b333b;\n\n  font-size: 14px;\n  line-height: 2.25;\n}\n\n/* Main layout */\n\n.call-details__layout {\n  display: grid;\n  grid-template-columns: 320px minmax(0, 1fr);\n  gap: 78px;\n\n  align-items: start;\n\n  padding-top: 76px;\n\n  border-top: 1px solid #edf0f3;\n\n  direction: ltr;\n}\n\n.call-details__sidebar {\n  direction: rtl;\n}\n\n.call-details__main {\n  direction: rtl;\n}\n\n.call-details__article section {\n  margin-bottom: 70px;\n}\n\n.call-details__section-title {\n  display: flex;\n  align-items: center;\n  gap: 18px;\n\n  margin-bottom: 24px;\n\n  direction: rtl;\n}\n\n.call-details__section-title span {\n  width: 10px;\n  height: 10px;\n\n  flex: 0 0 auto;\n\n  border-radius: 50%;\n\n  background-color: var(--color-accent);\n}\n\n.call-details__section-title h2 {\n  margin: 0;\n\n  color: #050505;\n\n  font-size: 32px;\n  font-weight: 900;\n  line-height: 1.6;\n}\n\n.call-details__article p {\n  margin: 0 0 18px;\n\n  color: #27313a;\n\n  font-size: 14px;\n  line-height: 2.35;\n  text-align: justify;\n}\n\n/* CTA */\n\n.call-details__cta {\n  position: relative;\n\n  min-height: 270px;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  overflow: hidden;\n\n  margin: 50px 0 78px;\n\n  border-radius: 8px;\n\n  color: #ffffff;\n  background-color: #03192f;\n}\n\n.call-details__cta img {\n  position: absolute;\n  inset: 0;\n\n  width: 100%;\n  height: 100%;\n\n  object-fit: contain;\n  object-position: center;\n\n  background-color: #03192f;\n}\n\n.call-details__cta-overlay {\n  position: absolute;\n  inset: 0;\n\n  background: linear-gradient(\n    90deg,\n    rgba(0, 25, 48, 0.78),\n    rgba(4, 37, 72, 0.62)\n  );\n}\n\n.call-details__cta-content {\n  position: relative;\n  z-index: 1;\n\n  max-width: 760px;\n\n  padding: 36px 28px;\n\n  text-align: center;\n}\n\n.call-details__cta-content h2 {\n  margin: 0 0 18px;\n\n  color: #ffffff;\n\n  font-size: 31px;\n  font-weight: 900;\n  line-height: 1.6;\n}\n\n.call-details__cta-content p {\n  margin: 0 0 28px;\n\n  color: rgba(255, 255, 255, 0.88);\n\n  font-size: 14px;\n  line-height: 2;\n}\n\n.call-details__cta-actions {\n  display: flex;\n  justify-content: center;\n  gap: 24px;\n}\n\n.call-details__cta-actions a {\n  width: 170px;\n  min-height: 44px;\n\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  border: 1px solid rgba(255, 255, 255, 0.75);\n\n  color: #ffffff;\n\n  font-size: 13px;\n  font-weight: 800;\n\n  transition:\n    border-color 180ms ease,\n    background-color 180ms ease,\n    color 180ms ease,\n    transform 180ms ease;\n}\n\n.call-details__cta-actions a:first-child {\n  border-color: var(--color-secondary);\n\n  background-color: var(--color-secondary);\n}\n\n.call-details__cta-actions a:hover {\n  border-color: #ffffff;\n\n  color: var(--color-primary);\n  background-color: #ffffff;\n\n  transform: translateY(-3px);\n}\n\n/* FAQ */\n\n.call-details__faq {\n  padding-bottom: 40px;\n}\n\n.call-details__faq .call-details__section-title {\n  justify-content: flex-start;\n}\n\n.call-details__faq-list {\n  border-top: 1px solid #e5e9ed;\n}\n\n.call-details__faq-item {\n  border-bottom: 1px solid #e5e9ed;\n}\n\n.call-details__faq-item summary {\n  min-height: 66px;\n\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 30px;\n\n  padding: 8px 4px;\n\n  color: #111111;\n\n  font-size: 14px;\n  font-weight: 800;\n\n  cursor: pointer;\n\n  list-style: none;\n}\n\n.call-details__faq-item summary::-webkit-details-marker {\n  display: none;\n}\n\n.call-details__faq-item summary i {\n  color: #9aa2a8;\n\n  font-size: 26px;\n  font-style: normal;\n  font-weight: 300;\n\n  transition:\n    color 200ms ease,\n    transform 200ms ease;\n}\n\n.call-details__faq-item[open] summary i {\n  color: var(--color-accent);\n\n  transform: rotate(45deg);\n}\n\n.call-details__faq-item p {\n  margin: 0;\n\n  padding: 0 4px 24px;\n\n  color: #4b555d;\n\n  font-size: 13px;\n  line-height: 2.1;\n}\n\n/* Back */\n\n.call-details__back-wrap {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n\n  padding-top: 20px;\n\n  direction: rtl;\n}\n\n.call-details__back {\n  min-width: 190px;\n  min-height: 44px;\n\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  border: 1px solid #cbd1d8;\n\n  color: #27313a;\n  background-color: #ffffff;\n\n  font-size: 13px;\n  font-weight: 800;\n\n  transition:\n    color 180ms ease,\n    border-color 180ms ease,\n    background-color 180ms ease,\n    transform 180ms ease;\n}\n\n.call-details__back:hover {\n  color: #ffffff;\n  border-color: var(--color-primary);\n  background-color: var(--color-primary);\n\n  transform: translateY(-2px);\n}\n\n.call-details__page-id {\n  color: #8a9299;\n\n  font-size: 12px;\n  font-weight: 700;\n}\n\n@media (max-width: 1450px) {\n  .call-details {\n    --call-details-width: 1180px;\n  }\n\n  .call-details__container {\n    width: min(calc(100% - 120px), var(--call-details-width));\n  }\n\n  .call-details__hero-image {\n    height: 340px;\n  }\n\n  .call-details__layout {\n    grid-template-columns: 300px minmax(0, 1fr);\n    gap: 62px;\n  }\n\n  .call-details__section-title h2 {\n    font-size: 29px;\n  }\n}\n\n.call-details__sidebar-card { padding:20px; border:1px solid #edf0f3; border-radius:14px; background:#fafafa; }\n.call-details__sidebar-card h3 { margin:0 0 12px; color:#050505; font-size:17px; font-weight:900; }\n.call-details__sidebar-card p { margin:0 0 10px; color:#4b555d; font-size:12px; line-height:2; }\n";

const CALL_DEFAULT_FAQS = [
  {
    id: 1,
    question: "چه کسانی می‌توانند در این فراخوان شرکت کنند؟",
    answer:
      "پژوهشگران، تیم‌های فناور و صاحبان ایده مرتبط با محور فراخوان می‌توانند ثبت‌نام کنند.",
  },
  {
    id: 2,
    question: "مدارک موردنیاز برای ارسال طرح چیست؟",
    answer:
      "پروپوزال، اطلاعات تیم، مستندات فنی و فایل‌های پشتیبان مطابق راهنمای فراخوان دریافت می‌شود.",
  },
  {
    id: 3,
    question: "فرآیند بررسی طرح‌ها چگونه انجام می‌شود؟",
    answer:
      "طرح‌ها ابتدا توسط دبیرخانه بررسی اولیه شده و سپس در صورت احراز شرایط وارد داوری تخصصی می‌شوند.",
  },
];

const CALL_FORM_DEFAULT = {
  bannerFile: null,
  bannerPreview: "",
  title: "",
  category: "",
  number: "۱",
  deadline: "1405/05/05",
  heroDescription: "",
  pdfFileName: "",
  moreTitle: "توضیحات بیشتر فراخوان",
  moreDescription: "",
  isAnnualTheme: false,
  faqs: CALL_DEFAULT_FAQS,
};

const INITIAL_CALLS = [
  {
    id: 1,
    number: "۲",
    title: "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵",
    category: "با محوریت هوش مصنوعی",
    deadline: "1405/05/05",
    heroDescription:
      "این فراخوان با هدف حمایت از ایده‌ها و طرح‌های فناورانه دانشگاهی طراحی شده و تلاش می‌کند مسیر تبدیل پژوهش به محصول، خدمت یا راهکار کاربردی را کوتاه‌تر کند.",
    moreTitle: "محورهای پژوهشی سال جاری",
    moreDescription:
      "طرح‌های ارسالی باید **مسئله‌محور**، قابل توسعه و دارای ظرفیت تبدیل‌شدن به محصول یا خدمت باشند. پس از بررسی اولیه، طرح‌های واجد شرایط وارد مرحله ارزیابی تخصصی می‌شوند.",
    pdfFileName: "call-or-announcement-1405.pdf",
    bannerPreview: "",
    isAnnualTheme: true,
    faqs: CALL_DEFAULT_FAQS,
    status: "منتشر شده",
    createdAt: "1405/03/12",
    publishedAt: "1405/03/12",
    year: "1405",
  },
  {
    id: 2,
    number: "۱",
    title: "فراخوان حمایت از توسعه محصولات فناورانه دانشگاهی",
    category: "با محوریت تجاری‌سازی",
    deadline: "1405/04/20",
    heroDescription:
      "این فراخوان برای شناسایی طرح‌های آماده توسعه و اتصال آن‌ها به مسیر تجاری‌سازی منتشر می‌شود.",
    moreTitle: "توضیحات تکمیلی فراخوان",
    moreDescription:
      "متقاضیان می‌توانند اطلاعات طرح، تیم اجرایی، برنامه توسعه و مستندات پشتیبان را آماده کرده و پس از انتشار نهایی ارسال کنند.",
    pdfFileName: "",
    bannerPreview: "",
    isAnnualTheme: false,
    faqs: CALL_DEFAULT_FAQS,
    status: "پیش‌نویس",
    createdAt: "1405/03/18",
    publishedAt: "",
    year: "1405",
  },
  {
    id: 3,
    number: "۱",
    title: "فراخوان توسعه فناوری‌های سبز و محیط‌زیستی",
    category: "با محوریت فناوری سبز",
    deadline: "1404/10/30",
    heroDescription:
      "این فراخوان برای حمایت از طرح‌های سبز و محیط‌زیستی در سال گذشته منتشر شد.",
    moreTitle: "توضیحات فراخوان",
    moreDescription:
      "مهلت ارسال طرح برای این فراخوان پایان یافته و اطلاعات آن در تاریخچه نگهداری می‌شود.",
    pdfFileName: "green-call.pdf",
    bannerPreview: "",
    isAnnualTheme: false,
    faqs: CALL_DEFAULT_FAQS,
    status: "غیرفعال",
    createdAt: "1404/08/01",
    publishedAt: "1404/08/01",
    year: "1404",
  },
];

const CALL_STEPS = [
  "انتخاب و بنر",
  "اطلاعات اصلی",
  "فایل‌ها و توضیحات",
  "سوالات متداول",
  "بازبینی و انتشار",
];

const PLAN_FOLDERS = [
  { id: "priority", label: "دارای اولویت", tone: "priority" },
  { id: "needs-improvement", label: "نیازمند بهبود", tone: "improvement" },
  { id: "more-review", label: "بررسی بیشتر", tone: "review" },
];

const FINAL_PLAN_STATUSES = [
  "قبول",
  "قبول ضعیف",
  "رد",
  "رد ضعیف",
  "نیازمند اصلاح",
];

const PLAN_TITLES = [
  "سامانه هوشمند تشخیص خطای تجهیزات صنعتی",
  "پلتفرم تحلیل مصرف انرژی ساختمان",
  "راهکار پایش کیفیت هوای شهری",
  "دستیار هوشمند ارزیابی پروپوزال",
  "مدل پیش‌بینی خرابی در شبکه توزیع",
  "سامانه مدیریت داده‌های آزمایشگاهی",
  "ابزار بهینه‌سازی مصرف آب در گلخانه",
  "پلتفرم پایش سلامت تجهیزات پزشکی",
  "سیستم هوشمند اولویت‌بندی تعمیرات",
  "راهکار تحلیل ریسک زنجیره تأمین",
  "سامانه تشخیص ناهنجاری در خطوط تولید",
  "پلتفرم مدیریت انرژی در واحدهای صنعتی",
];

const PLAN_FIELDS = [
  "هوش مصنوعی",
  "انرژی و پایداری",
  "سلامت دیجیتال",
  "صنعت و تولید",
];

const REVIEWER_PROFILES = [
  {
    id: "reviewer-1",
    name: "دکتر نرگس احمدی",
    role: "داور تخصصی هوش مصنوعی",
    specialty: "هوش مصنوعی و تحلیل داده",
    email: "narges.ahmadi@example.com",
    phone: "09121230001",
    organization: "دانشگاه تهران",
  },
  {
    id: "reviewer-2",
    name: "دکتر پیمان رضایی",
    role: "داور انرژی و پایداری",
    specialty: "انرژی، پایداری و زیرساخت",
    email: "peyman.rezaei@example.com",
    phone: "09121230002",
    organization: "مرکز رشد فناوری‌های نو",
  },
  {
    id: "reviewer-3",
    name: "دکتر سارا محمدی",
    role: "داور سلامت دیجیتال",
    specialty: "سلامت دیجیتال و سامانه‌های داده‌محور",
    email: "sara.mohammadi@example.com",
    phone: "09121230003",
    organization: "هسته پژوهشی داده‌محور",
  },
  {
    id: "reviewer-4",
    name: "دکتر علی رضوانی",
    role: "داور صنعت و تولید",
    specialty: "صنعت، تولید و زنجیره تأمین",
    email: "ali.rezvani@example.com",
    phone: "09121230004",
    organization: "شرکت فناوران نوآور",
  },
  {
    id: "reviewer-5",
    name: "دکتر الهام کاظمی",
    role: "داور تجاری‌سازی فناوری",
    specialty: "تجاری‌سازی، مدل کسب‌وکار و بازار",
    email: "elham.kazemi@example.com",
    phone: "09121230005",
    organization: "شبکه مشاوران فناوری",
  },
];

const BUSINESS_PARTNERS = [
  {
    id: "business-1",
    name: "مهدی رضایی",
    role: "همکار تجاری",
    organization: "شرکت توسعه بازار نوآوران",
    field: "توسعه بازار و فروش سازمانی",
    email: "mehdi.rezaei@business.example.com",
    phone: "09121234567",
    joinedAt: "۱۴۰۴/۰۸/۱۸",
    viewedOpportunities: 18,
    favoriteOpportunities: 5,
    collaborationRequests: 4,
    activeCollaborations: 2,
  },
  {
    id: "business-2",
    name: "سارا احمدی",
    role: "همکار تجاری",
    organization: "هلدینگ سرمایه‌گذاری فناوری شرق",
    field: "سرمایه‌گذاری مشترک و پایلوت صنعتی",
    email: "sara.ahmadi@business.example.com",
    phone: "09124567890",
    joinedAt: "۱۴۰۴/۰۹/۰۵",
    viewedOpportunities: 12,
    favoriteOpportunities: 3,
    collaborationRequests: 2,
    activeCollaborations: 1,
  },
  {
    id: "business-3",
    name: "علی کریمی",
    role: "همکار تجاری",
    organization: "شرکت راهکارهای هوشمند صنعت",
    field: "هوش مصنوعی صنعتی و B2B",
    email: "ali.karimi@business.example.com",
    phone: "09127894561",
    joinedAt: "۱۴۰۴/۱۰/۱۲",
    viewedOpportunities: 24,
    favoriteOpportunities: 7,
    collaborationRequests: 5,
    activeCollaborations: 3,
  },
  {
    id: "business-4",
    name: "الهام محمدی",
    role: "همکار تجاری",
    organization: "گروه مشاوره تجاری‌سازی سلامت",
    field: "سلامت دیجیتال و توسعه بازار",
    email: "elham.mohammadi@business.example.com",
    phone: "09123334455",
    joinedAt: "۱۴۰۵/۰۱/۲۰",
    viewedOpportunities: 9,
    favoriteOpportunities: 2,
    collaborationRequests: 1,
    activeCollaborations: 0,
  },
];

const BUSINESS_OPPORTUNITIES_OVERVIEW = [
  {
    id: 1,
    title: "پروژه پایلوت سامانه مدیریت انرژی ساختمان",
    field: "انرژی و ساختمان هوشمند",
    collaborationType: "سرمایه‌گذاری مشترک",
    stage: "آماده مذاکره",
    owner: "مرکز رشد فناوری‌های انرژی",
  },
  {
    id: 2,
    title: "توسعه بازار محصول پایش کیفیت هوا",
    field: "محیط‌زیست و تجهیزات شهری",
    collaborationType: "توسعه بازار",
    stage: "در حال جذب همکار",
    owner: "تیم توسعه فناوری سلامت شهری",
  },
  {
    id: 3,
    title: "همکاری تجاری در دستیار هوشمند صنعتی",
    field: "هوش مصنوعی صنعتی",
    collaborationType: "تجاری‌سازی محصول",
    stage: "در حال بررسی",
    owner: "گروه توسعه راهکارهای هوشمند صنعتی",
  },
  {
    id: 4,
    title: "عرضه سامانه آموزش هوشمند سازمانی",
    field: "آموزش، منابع انسانی و هوش مصنوعی",
    collaborationType: "فروش سازمانی",
    stage: "جدید",
    owner: "تیم فناوری آموزش سازمانی",
  },
];

const INITIAL_BUSINESS_COLLABORATION_REQUESTS = [
  {
    id: 1,
    partnerId: "business-1",
    opportunityId: 1,
    title: "درخواست همکاری برای پروژه پایلوت سامانه مدیریت انرژی ساختمان",
    message:
      "برای اجرای پایلوت این سامانه در ساختمان‌های اداری علاقه‌مند به مذاکره هستیم و امکان معرفی دو محل اجرای اولیه را داریم.",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۱۰:۳۰",
    status: "در انتظار پیگیری",
    supportReply: "",
    repliedAt: "",
  },
  {
    id: 2,
    partnerId: "business-2",
    opportunityId: 2,
    title: "درخواست همکاری برای توسعه بازار محصول پایش کیفیت هوا",
    message:
      "لطفاً جزئیات بیشتری درباره مدل همکاری، نیازمندی‌های مالی و محدوده جغرافیایی بازار هدف ارسال کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۶:۲۰",
    status: "در حال پیگیری",
    supportReply:
      "درخواست شما توسط دبیرخانه دریافت شد و برای بررسی اولیه به واحد همکاری‌های تجاری ارجاع شد.",
    repliedAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۸:۰۰",
  },
  {
    id: 3,
    partnerId: "business-3",
    opportunityId: 3,
    title: "درخواست همکاری تجاری در دستیار هوشمند صنعتی",
    message:
      "شبکه ارتباطی مناسبی با چند کارخانه تولیدی داریم و برای طراحی سناریوی پایلوت صنعتی آماده گفت‌وگو هستیم.",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۳:۴۵",
    status: "پاسخ داده شده",
    supportReply:
      "برای شروع، لطفاً فهرست کارخانه‌های پیشنهادی و ظرفیت اجرای پایلوت را در جلسه هماهنگی اولیه مطرح کنید. زمان پیشنهادی جلسه از طریق پیام سامانه ارسال می‌شود.",
    repliedAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۵:۱۰",
  },
  {
    id: 4,
    partnerId: "business-4",
    opportunityId: 4,
    title: "درخواست همکاری برای عرضه سامانه آموزش هوشمند سازمانی",
    message:
      "در حوزه آموزش سازمانی فعال هستیم و می‌توانیم در معرفی محصول به شرکت‌های متوسط و بزرگ مشارکت کنیم.",
    sentAt: "۱۴۰۵/۰۳/۱۰ - ساعت ۰۹:۱۵",
    status: "در انتظار پیگیری",
    supportReply: "",
    repliedAt: "",
  },
];

const INITIAL_COMMITTEE_PLANS = Array.from({ length: 6 }, (_, index) => {
  const planNumber = index + 1;
  const hasReviewerFeedback = planNumber % 2 === 0 || planNumber % 5 === 0;
  const hasCommitteeReviewFeedback = planNumber % 3 === 0;
  const committeeReviewStatus =
    hasCommitteeReviewFeedback || planNumber % 4 === 0
      ? "بررسی شده"
      : "در انتظار بررسی";
  const finalStatus =
    planNumber === 1
      ? "قبول"
      : planNumber === 2
        ? "قبول ضعیف"
        : planNumber % 7 === 0
          ? "رد"
          : planNumber % 6 === 0
            ? "نیازمند اصلاح"
            : "";

  return {
    id: planNumber,
    trackingId: `HTF-1405-${String(planNumber).padStart(4, "0")}`,
    title: PLAN_TITLES[index % PLAN_TITLES.length],
    field: PLAN_FIELDS[index % PLAN_FIELDS.length],
    call:
      index % 3 === 0
        ? "فراخوان توسعه فناوری‌های انرژی"
        : "فراخوان هدایت اعتبارات توسعه فناوری",
    innovator: {
      name: ["مهدیه سیفی", "رضا احمدی", "سارا محمدی", "علی رضوانی"][index % 4],
      organization: [
        "دانشگاه تهران",
        "شرکت فناوران نوآور",
        "هسته پژوهشی داده‌محور",
        "مرکز رشد فناوری‌های نو",
      ][index % 4],
      phone: `0912${String(3000000 + index * 3179).slice(0, 7)}`,
      email: `innovator${planNumber}@example.com`,
    },
    sentAt: `1405/03/${String((planNumber % 24) + 1).padStart(2, "0")} - ساعت ${String((planNumber % 8) + 9).padStart(2, "0")}:30`,
    deadline: `1405/04/${String((planNumber % 20) + 5).padStart(2, "0")} - ساعت 18:00`,
    reviewerStatus: hasReviewerFeedback ? "بررسی شده" : "در انتظار بررسی",
    folders:
      planNumber % 9 === 0
        ? ["priority"]
        : planNumber % 7 === 0
          ? ["needs-improvement"]
          : planNumber % 6 === 0
            ? ["more-review"]
            : [],
    reviewerScore: hasReviewerFeedback ? ((planNumber % 5) + 1) * 15 : "",
    reviewerRecommendation: hasReviewerFeedback
      ? planNumber % 3 === 0
        ? "نیازمند اصلاح"
        : "قابل بررسی در مرحله بعد"
      : "",
    reviewerFeedback: hasReviewerFeedback
      ? {
          text: "طرح از نظر مسئله‌محوری قابل توجه است، اما برای تصمیم‌گیری دقیق‌تر لازم است مسیر اعتبارسنجی، شاخص‌های فنی و برنامه اجرای پایلوت شفاف‌تر شود.",
          createdAt: `1405/03/${String((planNumber % 20) + 2).padStart(2, "0")} - ساعت 12:15`,
        }
      : null,
    committeeReviewStatus,
    committeeReviewScore: hasCommitteeReviewFeedback
      ? ((planNumber % 5) + 1) * 12
      : "",
    committeeReviewRecommendation: hasCommitteeReviewFeedback
      ? planNumber % 2 === 0
        ? "دارای اولویت"
        : "نیازمند بررسی بیشتر"
      : "",
    committeeReviewFeedback: hasCommitteeReviewFeedback
      ? {
          text: "بازخورد دبیرخانه و کمیته راهبری درباره مسیر بررسی این طرح ثبت شده است. لازم است ابعاد اجرایی، خروجی مورد انتظار و ظرفیت تبدیل به محصول دقیق‌تر دنبال شود.",
          createdAt: `1405/03/${String((planNumber % 18) + 5).padStart(2, "0")} - ساعت 11:20`,
        }
      : null,
    committeeFeedback: finalStatus
      ? "بررسی دبیرخانه و کمیته راهبری انجام شد. نتیجه نهایی بر اساس نظر جمع‌بندی‌شده در سامانه ثبت شده است."
      : "",
    finalStatus,
    finalStatusDate: finalStatus
      ? `1405/04/${String((planNumber % 15) + 8).padStart(2, "0")}`
      : "",
    resultsPublished: false,
    proposalFile: `${String(planNumber).padStart(2, "0")}-proposal.pdf`,
  };
});

const INITIAL_ACCEPTED_PLAN_TASKS = {
  1: [
    {
      id: 1,
      title: "تکمیل برنامه زمان‌بندی اجرای پایلوت",
      deadline: "1405/04/15 - ساعت 18:00",
      managerMessage:
        "لطفاً برنامه زمان‌بندی اجرای پایلوت را با جزئیات فعالیت‌ها، خروجی هر مرحله و زمان تحویل هر بخش بارگذاری کنید.",
      userDescription: "",
      userFileName: "",
      participantStatus: "در انتظار بررسی فناور",
      managerFeedback: "",
      managerDecision: "",
      createdAt: "1405/03/20",
    },
    {
      id: 2,
      title: "مشاهده برنامه اجرایی اولیه",
      deadline: "1405/04/18 - ساعت 12:00",
      managerMessage:
        "این وظیفه برای مشاهده و آماده‌سازی پاسخ اولیه فناور ثبت شده است.",
      userDescription: "",
      userFileName: "",
      participantStatus: "مشاهده شده",
      managerFeedback: "",
      managerDecision: "",
      createdAt: "1405/03/21",
    },
    {
      id: 3,
      title: "ارسال مستندات فنی نمونه اولیه",
      deadline: "1405/04/22 - ساعت 20:00",
      managerMessage:
        "مستندات باید شامل معماری سامانه، ورودی‌ها، خروجی‌ها و نحوه اعتبارسنجی باشد.",
      userDescription: "نسخه اولیه مستندات برای بررسی ارسال شد.",
      userFileName: "prototype-documents.pdf",
      participantStatus: "پاسخ داده شده",
      managerFeedback: "",
      managerDecision: "",
      createdAt: "1405/03/22",
    },
    {
      id: 4,
      title: "اصلاح بخش معیارهای پذیرش",
      deadline: "1405/05/02 - ساعت 16:00",
      managerMessage:
        "لطفاً معیارهای پذیرش خروجی و شاخص‌های سنجش عملکرد را شفاف‌تر کنید.",
      userDescription: "نسخه اصلاح‌شده معیارهای پذیرش ارسال شد.",
      userFileName: "acceptance-criteria-v2.pdf",
      participantStatus: "در انتظار بررسی فناور",
      managerFeedback:
        "بخش معیارهای پذیرش هنوز نیازمند جزئیات بیشتر است. لطفاً شاخص‌های کمی را هم اضافه کنید.",
      managerDecision: "نیازمند اصلاح",
      reviewedAt: "1405/05/03",
      createdAt: "1405/04/24",
    },
    {
      id: 5,
      title: "تحویل نسخه نهایی پایلوت",
      deadline: "1405/05/18 - ساعت 17:00",
      managerMessage:
        "نسخه نهایی پایلوت و گزارش جمع‌بندی را برای بررسی پایانی ارسال کنید.",
      userDescription: "نسخه نهایی پایلوت و گزارش جمع‌بندی ارسال شد.",
      userFileName: "final-pilot-version.zip",
      participantStatus: "پایان یافته",
      managerFeedback:
        "نسخه نهایی دریافت و تأیید شد. این وظیفه پایان‌یافته محسوب می‌شود.",
      managerDecision: "پایان یافته",
      reviewedAt: "1405/05/19",
      createdAt: "1405/05/01",
    },
  ],
  2: [
    {
      id: 1,
      title: "بازنگری مدل اجرای پایلوت",
      deadline: "1405/04/10 - ساعت 16:00",
      managerMessage:
        "برای ادامه فرآیند، مدل اجرای پایلوت و محدوده آزمایش اولیه باید شفاف‌تر شود.",
      userDescription: "",
      userFileName: "",
      participantStatus: "در انتظار بررسی فناور",
      managerFeedback: "",
      managerDecision: "",
      createdAt: "1405/03/18",
    },
    {
      id: 2,
      title: "ارسال برنامه اعتبارسنجی فنی",
      deadline: "1405/04/28 - ساعت 18:00",
      managerMessage:
        "برنامه اعتبارسنجی باید شامل معیارهای عملکرد، روش آزمون و داده‌های موردنیاز باشد.",
      userDescription: "برنامه اعتبارسنجی ارسال شده و آماده بررسی است.",
      userFileName: "validation-plan.pdf",
      participantStatus: "پاسخ داده شده",
      managerFeedback: "",
      managerDecision: "",
      createdAt: "1405/04/01",
    },
    {
      id: 3,
      title: "تکمیل مستند بازار هدف",
      deadline: "1405/05/06 - ساعت 10:00",
      managerMessage:
        "لطفاً مستند بازار هدف، ذی‌نفعان اصلی و کاربردهای اولیه محصول را بارگذاری کنید.",
      userDescription: "فایل بازار هدف ارسال شد.",
      userFileName: "target-market.pdf",
      participantStatus: "پایان یافته",
      managerFeedback:
        "مستند بازار هدف از نظر ساختار قابل قبول است و وظیفه پایان یافته محسوب می‌شود.",
      managerDecision: "پایان یافته",
      reviewedAt: "1405/05/07",
      createdAt: "1405/04/20",
    },
  ],
};

function createAcceptedTask(title, deadlineDate, deadlineTime, managerMessage) {
  const cleanDate = deadlineDate.trim();
  const cleanTime = deadlineTime.trim();
  return {
    id: Date.now(),
    title: title.trim(),
    deadline:
      cleanDate && cleanTime
        ? `${cleanDate} - ساعت ${cleanTime}`
        : cleanDate || (cleanTime ? `ساعت ${cleanTime}` : ""),
    managerMessage: managerMessage.trim(),
    userDescription: "",
    userFileName: "",
    participantStatus: "در انتظار بررسی فناور",
    managerFeedback: "",
    managerDecision: "",
    createdAt: getCurrentSimplePersianDate(),
  };
}

function isAcceptedTaskFinished(task) {
  return (
    task?.participantStatus === "پایان یافته" ||
    task?.managerDecision === "پایان یافته"
  );
}

function getAcceptedTaskDisplayStatus(task) {
  if (!task) return "در انتظار بررسی فناور";
  if (isAcceptedTaskFinished(task)) return "پایان یافته";
  return task.participantStatus || "در انتظار بررسی فناور";
}

function getAcceptedTaskStatusClass(status) {
  if (status === "در انتظار بررسی فناور") return "waiting-user";
  if (status === "مشاهده شده") return "seen";
  if (status === "پاسخ داده شده") return "answered";
  if (status === "در انتظار تعیین تکلیف") return "manager-pending";
  if (status === "نیازمند اصلاح") return "revision";
  if (status === "پایان یافته") return "finished";
  return "default";
}

function getReviewerPlanAssignments(reviewerIndex, plans) {
  return plans.filter((plan, planIndex) => {
    if (planIndex % REVIEWER_PROFILES.length === reviewerIndex) return true;
    if ((plan.id + reviewerIndex) % 3 === 0) return true;
    return false;
  });
}

function getReviewerFeedbackItems(plan) {
  if (!plan) return [];

  const feedbackCount = Math.min(5, (plan.id % 4) + 1);
  const shouldHaveFeedback =
    Boolean(plan.reviewerFeedback) || plan.id % 2 === 0 || plan.id === 1;

  if (!shouldHaveFeedback) return [];

  const templates = [
    "طرح از نظر مسئله‌محوری و ارتباط با نیاز واقعی قابل توجه است، اما برای تصمیم‌گیری دقیق‌تر لازم است شاخص‌های فنی و مسیر اعتبارسنجی شفاف‌تر شود.",
    "نوآوری طرح در سطح قابل قبول ارزیابی می‌شود. پیشنهاد می‌شود تیم فناور برنامه اجرای پایلوت و منابع موردنیاز را دقیق‌تر ارائه کند.",
    "از منظر امکان اجرا، طرح ظرفیت ادامه بررسی دارد؛ با این حال بخش مدل درآمدی و مسیر بهره‌برداری نیازمند تکمیل و مستندسازی بیشتر است.",
    "مستندات فنی طرح قابل پیگیری است، اما در بخش ریسک‌های اجرایی و برنامه زمان‌بندی جزئیات کافی ارائه نشده است.",
    "پیشنهاد می‌شود قبل از تصمیم‌گیری نهایی، تیم فناور شواهد بیشتری درباره نمونه اولیه، داده‌های آزمون و معیارهای پذیرش ارائه کند.",
  ];

  return Array.from({ length: feedbackCount }, (_, index) => {
    const reviewer =
      REVIEWER_PROFILES[(plan.id + index - 1) % REVIEWER_PROFILES.length];
    const score = 62 + ((plan.id * 7 + index * 9) % 29);
    const recommendation =
      score >= 84
        ? "دارای اولویت"
        : score >= 72
          ? "قابل بررسی در مرحله بعد"
          : score >= 66
            ? "نیازمند اصلاح"
            : "نیازمند بررسی بیشتر";

    return {
      id: `${plan.id}-${reviewer.id}`,
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      reviewerRole: reviewer.role,
      specialty: reviewer.specialty,
      score,
      recommendation,
      createdAt: `1405/03/${String(10 + ((plan.id + index) % 17)).padStart(2, "0")} - ساعت ${String(9 + index).padStart(2, "0")}:30`,
      text:
        index === 0 && plan.reviewerFeedback?.text
          ? plan.reviewerFeedback.text
          : templates[index % templates.length],
    };
  });
}

function getReviewerParticipationStats(reviewer, reviewerIndex, plans) {
  const assignedPlans = getReviewerPlanAssignments(reviewerIndex, plans);
  const feedbacks = plans
    .flatMap((plan) => getReviewerFeedbackItems(plan))
    .filter((feedback) => feedback.reviewerId === reviewer.id);
  const reviewedPlanIds = new Set(
    feedbacks.map((feedback) => Number(String(feedback.id).split("-")[0])),
  );
  const reviewedPlansCount = reviewedPlanIds.size;
  const remainingPlans = Math.max(assignedPlans.length - reviewedPlansCount, 0);

  return {
    assignedPlans: assignedPlans.length,
    reviewedPlans: reviewedPlansCount,
    feedbacks: feedbacks.length,
    remainingPlans,
  };
}

function AcceptedTaskStatusBadge({ status }) {
  const cleanStatus = status || "در انتظار بررسی فناور";

  return (
    <span
      className={`accepted-projects__status accepted-projects__status--${getAcceptedTaskStatusClass(cleanStatus)}`}
    >
      {cleanStatus}
    </span>
  );
}

function splitAcceptedTaskDeadline(deadline = "") {
  const [datePart = "", timePart = ""] = String(deadline).split(" - ساعت ");
  return {
    deadlineDate: datePart.trim(),
    deadlineTime: timePart.trim(),
  };
}

function buildAcceptedTaskDeadline(deadlineDate, deadlineTime) {
  const cleanDate = deadlineDate.trim();
  const cleanTime = deadlineTime.trim();

  if (cleanDate && cleanTime) return `${cleanDate} - ساعت ${cleanTime}`;
  if (cleanDate) return cleanDate;
  if (cleanTime) return `ساعت ${cleanTime}`;
  return "";
}

function getAcceptedTaskFileHref(task) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `فایل نمونه ارسال‌شده برای وظیفه «${task.title}»`,
  )}`;
}

const INITIAL_RECEIVED_REQUESTS = [
  {
    id: 1,
    userName: "مهدیه سیفی",
    userLevel: "فناور",
    title: "مشکل در بارگذاری فایل پروپوزال",
    message:
      "هنگام بارگذاری فایل پروپوزال، سامانه خطا می‌دهد و فایل ثبت نمی‌شود. لطفاً راهنمایی کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    status: "در انتظار پیگیری",
    reply: "",
    repliedAt: "",
  },
  {
    id: 2,
    userName: "علی احمدی",
    userLevel: "داور",
    title: "عدم نمایش فایل یکی از طرح‌ها",
    message:
      "در صفحه جزئیات طرح، لینک دانلود پروپوزال برای یکی از طرح‌ها فعال نیست و نیاز به بررسی دارد.",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۴:۱۵",
    status: "در انتظار پیگیری",
    reply: "",
    repliedAt: "",
  },
  {
    id: 3,
    userName: "سارا محمدی",
    userLevel: "مدرس/رویدادگر",
    title: "درخواست راهنمایی برای انتشار دوره",
    message:
      "دوره ایجاد شده در وضعیت در انتظار تأیید مانده است. لطفاً وضعیت بررسی و مراحل بعدی را اعلام کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۰۹:۴۰",
    status: "در حال پیگیری",
    reply: "",
    repliedAt: "",
  },
  {
    id: 4,
    userName: "رضا کریمی",
    userLevel: "همکار تجاری",
    title: "پیگیری درخواست همکاری ثبت‌شده",
    message:
      "برای یکی از موقعیت‌های همکاری درخواست ثبت کرده‌ام و می‌خواهم بدانم چه زمانی بررسی می‌شود.",
    sentAt: "۱۴۰۵/۰۳/۱۵ - ساعت ۱۱:۲۰",
    status: "در انتظار پیگیری",
    reply: "",
    repliedAt: "",
  },
  {
    id: 5,
    userName: "نگار رحمانی",
    userLevel: "فناور",
    title: "ابهام در وضعیت طرح انتخاب‌شده",
    message:
      "وضعیت طرح من تغییر کرده اما پیام توضیحی برایم نمایش داده نمی‌شود. لطفاً علت تغییر وضعیت را بررسی کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۰ - ساعت ۱۵:۰۰",
    status: "پاسخ داده شده",
    reply:
      "وضعیت طرح شما به‌روزرسانی شد. توضیح تکمیلی در بخش پیام‌ها و اعلانات پنل کاربری قابل مشاهده است.",
    repliedAt: "۱۴۰۵/۰۳/۱۰ - ساعت ۱۷:۴۵",
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    title: "۳ درخواست جدید از کاربران دریافت شده است.",
    category: "درخواست‌ها",
    sentAt: "۱۴۰۵/۰۳/۱۵ - ساعت ۰۹:۱۵",
    isRead: false,
    isImportant: true,
    body: "در بخش درخواست‌های دریافتی، سه درخواست جدید از سطح‌های کاربری مختلف ثبت شده است.",
  },
  {
    id: 2,
    title: "یادآوری بررسی وضعیت دوره‌های در انتظار تأیید",
    category: "یادآوری",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۱۳:۳۰",
    isRead: false,
    isImportant: false,
    body: "چند دوره و رویداد در وضعیت در انتظار تأیید قرار دارند و نیازمند بررسی دبیرخانه هستند.",
  },
  {
    id: 3,
    title: "گزارش روزانه سامانه آماده شد",
    category: "اطلاعیه",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۸:۰۰",
    isRead: true,
    isImportant: false,
    body: "گزارش خلاصه درخواست‌ها، طرح‌ها و فعالیت کاربران برای امروز در سامانه ثبت شد.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "درخواست‌ها",
    question: "با باز کردن یک درخواست، وضعیت آن برای کاربر چه تغییری می‌کند؟",
    answer:
      "اگر درخواست در وضعیت در انتظار پیگیری باشد، با باز شدن توسط دبیرخانه به وضعیت در حال پیگیری تغییر می‌کند.",
  },
  {
    id: 2,
    category: "پاسخ‌دهی",
    question: "چه زمانی درخواست به تاریخچه منتقل می‌شود؟",
    answer:
      "پس از ارسال پاسخ نهایی از سمت دبیرخانه، وضعیت درخواست به پاسخ داده شده تغییر می‌کند و در تاریخچه نمایش داده می‌شود.",
  },
  {
    id: 3,
    category: "کاربران",
    question: "چرا سطح کاربری کنار هر درخواست نمایش داده می‌شود؟",
    answer:
      "برای اینکه دبیرخانه بداند درخواست از سمت فناور، داور، مدرس یا همکار تجاری ارسال شده و پاسخ متناسب‌تری ارائه کند.",
  },
  {
    id: 4,
    category: "پیام‌ها",
    question: "پیام‌های مهم کجا قابل مشاهده هستند؟",
    answer:
      "پیام‌های مهم هم در پنل پیام‌ها و اعلانات و هم از طریق آیکون اعلان بالای داشبورد قابل مشاهده هستند.",
  },
];

const DASHBOARD_EVENTS = [
  {
    id: 1,
    title: "بررسی درخواست‌های جدید کاربران",
    date: "۱۴۰۵/۰۳/۱۶",
    time: "۱۰:۰۰",
    type: "وظیفه روزانه",
  },
  {
    id: 2,
    title: "مرور دوره‌های در انتظار تأیید",
    date: "۱۴۰۵/۰۳/۱۶",
    time: "۱۲:۳۰",
    type: "یادآوری",
  },
  {
    id: 3,
    title: "هماهنگی با اعضای کمیته درباره فراخوان جدید",
    date: "۱۴۰۵/۰۳/۱۷",
    time: "۰۹:۰۰",
    type: "جلسه داخلی",
  },
];

const INSTRUCTOR_USERS = [
  {
    id: 1,
    name: "مریم نادری",
    role: "مدرس",
    specialty: "هوش مصنوعی و تحلیل داده",
    email: "maryam.naderi@example.com",
    mobile: "۰۹۱۲۴۵۶۷۸۹۰",
    organization: "دانشکده فنی دانشگاه تهران",
    activeActivities: 3,
    publishedActivities: 8,
    pendingActivities: 2,
    acceptedOrders: 4,
  },
  {
    id: 2,
    name: "رضا احمدی",
    role: "رویدادگر",
    specialty: "تجاری‌سازی و توسعه بازار",
    email: "reza.ahmadi@example.com",
    mobile: "۰۹۱۲۹۸۷۶۵۴۳",
    organization: "مرکز نوآوری هاتف",
    activeActivities: 2,
    publishedActivities: 6,
    pendingActivities: 1,
    acceptedOrders: 3,
  },
  {
    id: 3,
    name: "سارا محمدی",
    role: "مدرس",
    specialty: "مدیریت فناوری و محصول",
    email: "sara.mohammadi@example.com",
    mobile: "۰۹۱۲۳۳۳۴۴۵۵",
    organization: "شتاب‌دهنده نوآوری دانشگاهی",
    activeActivities: 4,
    publishedActivities: 11,
    pendingActivities: 3,
    acceptedOrders: 5,
  },
  {
    id: 4,
    name: "علی رضوانی",
    role: "مدرس و رویدادگر",
    specialty: "سرمایه‌گذاری و طراحی مدل کسب‌وکار",
    email: "ali.rezvani@example.com",
    mobile: "۰۹۱۲۸۸۸۷۷۶۶",
    organization: "شبکه همکاران تجاری هاتف",
    activeActivities: 1,
    publishedActivities: 5,
    pendingActivities: 1,
    acceptedOrders: 2,
  },
];

const INITIAL_COMMITTEE_ACTIVITIES = [
  {
    id: 1,
    type: "دوره",
    title: "دوره کاربردی هوش مصنوعی در تدوین پروپوزال",
    instructor: "مریم نادری",
    field: "هوش مصنوعی",
    startDate: "1405/04/12",
    capacity: "۳۰ نفر",
    registeredCount: 18,
    summary:
      "آموزش کاربردی ابزارهای هوش مصنوعی برای تحلیل مسئله، تدوین پروپوزال و آماده‌سازی مستندات طرح.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/18",
  },
  {
    id: 2,
    type: "رویداد",
    title: "نشست معرفی مسیر تجاری‌سازی طرح‌های منتخب",
    instructor: "رضا احمدی",
    field: "تجاری‌سازی",
    startDate: "1405/04/20",
    capacity: "۸۰ نفر",
    registeredCount: 43,
    summary:
      "رویدادی برای معرفی مسیرهای همکاری تجاری، سرمایه‌گذاری و توسعه بازار برای طرح‌های فناورانه.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/16",
  },
  {
    id: 6,
    type: "دوره",
    title: "دوره کاربردی مدیریت پروژه‌های فناورانه",
    instructor: "سارا محمدی",
    field: "مدیریت فناوری",
    startDate: "1405/04/26",
    capacity: "۳۵ نفر",
    registeredCount: 0,
    summary:
      "دوره‌ای برای آموزش برنامه‌ریزی اجرایی، کنترل پیشرفت، مدیریت ریسک و مستندسازی پروژه‌های فناورانه.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/19",
  },
  {
    id: 7,
    type: "رویداد",
    title: "وبینار آشنایی با مسیر جذب همکار تجاری",
    instructor: "علی رضوانی",
    field: "همکاری تجاری",
    startDate: "1405/04/30",
    capacity: "۱۰۰ نفر",
    registeredCount: 0,
    summary:
      "وبیناری برای توضیح مراحل ارتباط فناوران با همکاران تجاری، نحوه ارائه ارزش پیشنهادی و آماده‌سازی برای مذاکره.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/20",
  },
  {
    id: 8,
    type: "دوره",
    title: "کارگاه تدوین گزارش پیشرفت برای طرح‌های منتخب",
    instructor: "مریم نادری",
    field: "مستندسازی و گزارش‌دهی",
    startDate: "1405/05/06",
    capacity: "۲۸ نفر",
    registeredCount: 0,
    summary:
      "کارگاه عملی برای تهیه گزارش پیشرفت، تکمیل مستندات خروجی و آماده‌سازی فایل‌های قابل ارائه به کمیته راهبری.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/21",
  },
  {
    id: 9,
    type: "رویداد",
    title: "نشست تجربه‌نگاری تیم‌های موفق هاتف",
    instructor: "رضا احمدی",
    field: "تجربه‌نگاری و شبکه‌سازی",
    startDate: "1405/05/12",
    capacity: "۷۰ نفر",
    registeredCount: 0,
    summary:
      "نشستی برای ارائه تجربه تیم‌های موفق در مسیر ثبت طرح، داوری، اصلاح مستندات و ورود به مرحله همکاری تجاری.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/22",
  },
  {
    id: 3,
    type: "دوره",
    title: "کارگاه طراحی مدل کسب‌وکار برای تیم‌های فناور",
    instructor: "سارا محمدی",
    field: "مدیریت فناوری",
    startDate: "1405/05/02",
    capacity: "۲۵ نفر",
    registeredCount: 0,
    summary:
      "کارگاه عملی برای تعریف ارزش پیشنهادی، مشتری هدف، مدل درآمدی و برنامه ورود به بازار.",
    status: "رد شده",
    managerFeedback:
      "لطفاً بخش مخاطبان هدف و سرفصل‌های اجرایی را دقیق‌تر کنید و ددلاین ثبت‌نام را اضافه کنید.",
    createdAt: "1405/03/14",
  },
  {
    id: 4,
    type: "رویداد",
    title: "رویداد شبکه‌سازی فناوران و همکاران تجاری",
    instructor: "علی رضوانی",
    field: "همکاری تجاری",
    startDate: "1405/05/10",
    capacity: "۱۲۰ نفر",
    registeredCount: 74,
    summary:
      "فرصتی برای ارتباط مستقیم میان تیم‌های فناور، سرمایه‌گذاران و همکاران تجاری برنامه هاتف.",
    status: "منتشر شده",
    managerFeedback: "",
    createdAt: "1405/03/10",
    publishedAt: "1405/03/15",
  },
  {
    id: 5,
    type: "دوره",
    title: "دوره فشرده آماده‌سازی برای داوری تخصصی",
    instructor: "مریم نادری",
    field: "ارزیابی و داوری",
    startDate: "1405/02/28",
    capacity: "۲۰ نفر",
    registeredCount: 20,
    summary:
      "مرور چک‌لیست‌های ارزیابی، آماده‌سازی مستندات فنی و تمرین ارائه طرح برای جلسه داوری.",
    status: "منتشر شده",
    managerFeedback: "",
    createdAt: "1405/02/01",
    publishedAt: "1405/02/08",
  },
];

const EXTRA_PENDING_ACTIVITIES_FOR_REVIEW = [
  {
    id: 101,
    type: "دوره",
    title: "دوره کوتاه طراحی مسیر تجاری‌سازی برای فناوران",
    instructor: "سارا محمدی",
    field: "تجاری‌سازی",
    startDate: "1405/05/18",
    capacity: "۳۲ نفر",
    registeredCount: 0,
    summary:
      "دوره‌ای برای کمک به فناوران جهت تدوین مدل درآمدی، شناسایی بازار هدف و آماده‌سازی ارائه به همکاران تجاری.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/24",
  },
  {
    id: 102,
    type: "رویداد",
    title: "رویداد معرفی طرح‌های آماده ورود به بازار",
    instructor: "علی رضوانی",
    field: "شبکه‌سازی و بازار",
    startDate: "1405/05/22",
    capacity: "۹۰ نفر",
    registeredCount: 0,
    summary:
      "رویدادی برای ارائه طرح‌های منتخب به همکاران تجاری، سرمایه‌گذاران و نمایندگان واحدهای صنعتی.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/25",
  },
  {
    id: 103,
    type: "دوره",
    title: "کارگاه آماده‌سازی مستندات فنی برای داوری",
    instructor: "مریم نادری",
    field: "مستندسازی فنی",
    startDate: "1405/05/28",
    capacity: "۲۴ نفر",
    registeredCount: 0,
    summary:
      "کارگاهی برای آموزش تکمیل فایل‌های فنی، گزارش خروجی و مستندات تکمیلی موردنیاز برای بررسی طرح‌ها.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/26",
  },
  {
    id: 104,
    type: "رویداد",
    title: "نشست پرسش و پاسخ با کمیته راهبری",
    instructor: "رضا احمدی",
    field: "راهنمای مسیر هاتف",
    startDate: "1405/06/02",
    capacity: "۱۱۰ نفر",
    registeredCount: 0,
    summary:
      "نشستی برای پاسخ به پرسش‌های فناوران درباره مراحل بررسی، تعیین وضعیت نهایی و ورود به مرحله اجرای وظایف.",
    status: "در انتظار بررسی",
    managerFeedback: "",
    createdAt: "1405/03/27",
  },
];

const INITIAL_EXECUTION_ORDERS = [
  {
    id: 1,
    title: "طراحی دوره آماده‌سازی پروپوزال برای فراخوان هوش مصنوعی",
    summary:
      "یک دوره کوتاه برای تیم‌های فناور جهت آماده‌سازی فایل پروپوزال و مستندات تکمیلی.",
    subject: "دوره / هوش مصنوعی",
    deadlineDate: "1405/04/20",
    deadlineTime: "18:00",
    status: "قبول شده",
    acceptedBy: "مریم نادری",
    createdAt: "1405/03/12",
  },
  {
    id: 2,
    title: "برگزاری نشست معرفی فرصت‌های همکاری تجاری",
    summary:
      "یک رویداد آنلاین برای معرفی موقعیت‌های تجاری و مسیر همکاری با همکاران تجاری.",
    subject: "رویداد / همکاری تجاری",
    deadlineDate: "1405/04/28",
    deadlineTime: "16:00",
    status: "در انتظار پذیرش",
    acceptedBy: "",
    createdAt: "1405/03/18",
  },
  {
    id: 3,
    title: "کارگاه اصلاح مستندات طرح‌های نیازمند بهبود",
    summary:
      "کارگاه عملی برای طرح‌هایی که در مرحله داوری یا بررسی اولیه نیازمند اصلاح شناخته شده‌اند.",
    subject: "دوره / اصلاح مستندات",
    deadlineDate: "1405/05/05",
    deadlineTime: "12:00",
    status: "قبول شده",
    acceptedBy: "سارا محمدی",
    createdAt: "1405/03/20",
  },
];

const MANAGEMENT_ITEMS = [
  {
    id: "calls-management",
    title: "مدیریت فراخوان‌ها",
    description:
      "در مرحله بعد، تعریف فراخوان، زمان‌بندی، وضعیت انتشار و محورهای فراخوان در این بخش طراحی می‌شود.",
    items: ["تعریف فراخوان جدید", "مدیریت محورهای فراخوان", "تنظیم مهلت‌ها"],
  },
  {
    id: "plans-management",
    title: "مدیریت طرح‌ها",
    description:
      "در مرحله بعد، پایش وضعیت طرح‌ها، ارجاع به داوران و مشاهده پرونده طرح‌ها در این بخش طراحی می‌شود.",
    items: ["طرح‌های جدید", "ارجاع به داور", "نتایج و وضعیت‌ها"],
  },
  {
    id: "reviewers-management",
    title: "مدیریت داوران",
    description:
      "در مرحله بعد، تعریف داور، تخصیص طرح‌ها و بررسی عملکرد داوران در این بخش طراحی می‌شود.",
    items: ["افزودن داور", "طرح‌های اختصاص‌یافته", "گزارش عملکرد"],
  },
  {
    id: "business-management",
    title: "مدیریت همکاران تجاری",
    description:
      "اطلاعات همکاران تجاری و درخواست‌های همکاری از طریق زیرمنوهای این بخش مدیریت می‌شود.",
    items: ["اطلاعات همکاران تجاری", "درخواست‌های همکاری", "آمار مشارکت"],
  },
  {
    id: "events-management",
    title: "مدیریت رویدادها",
    description:
      "در مرحله بعد، تأیید دوره‌ها و رویدادها، وضعیت انتشار و گزارش ثبت‌نام‌ها در این بخش طراحی می‌شود.",
    items: ["دوره‌های در انتظار تأیید", "رویدادهای فعال", "گزارش ثبت‌نام"],
  },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      className={isOpen ? "innovator-dashboard__nav-chevron--open" : ""}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 10l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const dateText = now.toLocaleDateString("fa-IR-u-ca-persian", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeText = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="innovator-dashboard__date-time">
      <span>تاریخ امروز</span>
      <strong>{dateText}</strong>
      <small>ساعت {timeText}</small>
    </div>
  );
}

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

function getRequestStatusClass(status) {
  if (status === "پاسخ داده شده") return "answered";
  if (status === "در حال پیگیری") return "tracking";
  return "waiting";
}

function RequestStatusBadge({ status }) {
  return (
    <span
      className={`committee-dashboard__request-status committee-dashboard__request-status--${getRequestStatusClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function DashboardPanel({ requests, calls, plans, activities, orders }) {
  const waitingRequests = requests.filter(
    (request) => request.status === "در انتظار پیگیری",
  ).length;
  const trackingRequests = requests.filter(
    (request) => request.status === "در حال پیگیری",
  ).length;
  const unfinalizedPlans = plans.filter((plan) => !plan.finalStatus).length;
  const pendingActivities = activities.filter(
    (activity) => activity.status === "در انتظار بررسی",
  ).length;
  const rejectedActivities = activities.filter(
    (activity) => activity.status === "رد شده",
  ).length;
  const publishedActivities = activities.filter(
    (activity) => activity.status === "منتشر شده",
  ).length;
  const draftCalls = calls.filter((call) => call.status === "پیش‌نویس").length;
  const waitingOrders = orders.filter(
    (order) => order.status === "در انتظار پذیرش",
  ).length;

  const stats = [
    {
      label: "درخواست‌های نیازمند پاسخ",
      value: waitingRequests + trackingRequests,
      hint: "درخواست‌های جدید و در حال پیگیری",
    },
    {
      label: "طرح‌های بدون نتیجه نهایی",
      value: unfinalizedPlans,
      hint: "طرح‌هایی که هنوز تعیین تکلیف نشده‌اند",
    },
    {
      label: "دوره/رویداد در انتظار بررسی",
      value: pendingActivities,
      hint: "برنامه‌های ارسال‌شده توسط مدرسین",
    },
    {
      label: "سفارش‌های اجرا باز",
      value: waitingOrders,
      hint: "سفارش‌هایی که هنوز پذیرفته نشده‌اند",
    },
  ];

  const workbenchItems = [
    {
      title: "بررسی دوره‌ها و رویدادهای جدید",
      meta: `${toPersianDigits(pendingActivities)} برنامه در انتظار تصمیم انتشار یا رد`,
      status: pendingActivities ? "نیازمند اقدام" : "بدون مورد فوری",
    },
    {
      title: "تعیین وضعیت نهایی طرح‌ها",
      meta: `${toPersianDigits(unfinalizedPlans)} طرح هنوز وضعیت نهایی ندارد`,
      status: unfinalizedPlans ? "تکمیل شود" : "آماده انتشار نتایج",
    },
    {
      title: "پیگیری سفارش‌های اجرا",
      meta: `${toPersianDigits(waitingOrders)} سفارش در انتظار پذیرش مدرس یا رویدادگر`,
      status: waitingOrders ? "در انتظار پذیرش" : "همه تعیین تکلیف شده",
    },
    {
      title: "پاسخ به درخواست‌های دریافتی",
      meta: `${toPersianDigits(waitingRequests)} درخواست جدید و ${toPersianDigits(trackingRequests)} درخواست در حال پیگیری`,
      status:
        waitingRequests + trackingRequests ? "در جریان" : "بدون درخواست باز",
    },
  ];

  const calendarItems = [
    ...calls
      .filter((call) => call.deadline)
      .slice(0, 2)
      .map((call) => ({
        id: `call-${call.id}`,
        title: call.title,
        date: call.deadline,
        type: call.status === "پیش‌نویس" ? "فراخوان پیش‌نویس" : "مهلت فراخوان",
      })),
    ...plans
      .filter((plan) => !plan.finalStatus)
      .slice(0, 2)
      .map((plan) => ({
        id: `plan-${plan.id}`,
        title: plan.title,
        date: plan.deadline,
        type: "ددلاین بررسی طرح",
      })),
    ...orders
      .filter((order) => order.status === "در انتظار پذیرش")
      .slice(0, 2)
      .map((order) => ({
        id: `order-${order.id}`,
        title: order.title,
        date: `${order.deadlineDate} - ساعت ${order.deadlineTime}`,
        type: "ددلاین سفارش اجرا",
      })),
  ].slice(0, 5);

  return (
    <section className="committee-dashboard__dashboard">
      <div className="innovator-dashboard__summary-grid">
        {stats.map((item) => (
          <article
            key={item.label}
            className="innovator-dashboard__summary-card"
          >
            <span>{item.label}</span>
            <strong>{toPersianDigits(item.value)}</strong>
            <p>{item.hint}</p>
          </article>
        ))}
      </div>

      <section className="innovator-dashboard__hero committee-dashboard__hero">
        <div className="innovator-dashboard__hero-content">
          <span className="innovator-dashboard__hero-chip">
            میز کنترل دبیرخانه
          </span>
          <h2>نمای مدیریتی بخش‌های فعال سامانه هاتف</h2>
          <p>
            این داشبورد فقط مواردی را نشان می‌دهد که در همین پنل ساخته شده‌اند:
            فراخوان‌ها، طرح‌ها، داوران، همکاران تجاری، دوره‌ها و رویدادها،
            سفارش‌های اجرا و درخواست‌های دریافتی.
          </p>
        </div>

        <div className="innovator-dashboard__hero-side">
          <div className="innovator-dashboard__hero-block">
            <span>برنامه‌های منتشرشده</span>
            <strong>{toPersianDigits(publishedActivities)} مورد</strong>
          </div>
          <div className="innovator-dashboard__hero-block">
            <span>برنامه‌های رد شده</span>
            <strong>{toPersianDigits(rejectedActivities)} مورد</strong>
          </div>
        </div>
      </section>

      <div className="innovator-dashboard__content-grid">
        <div className="innovator-dashboard__stack">
          <section className="innovator-dashboard__panel innovator-dashboard__panel--wide">
            <header className="innovator-dashboard__panel-header">
              <div>
                <span>میزکار</span>
                <h3>کارهای کاربردی امروز</h3>
              </div>
            </header>

            <div className="committee-dashboard__workbench">
              {workbenchItems.map((item) => (
                <article
                  className="innovator-dashboard__feature-item"
                  key={item.title}
                >
                  <div className="innovator-dashboard__feature-text">
                    <h4>{item.title}</h4>
                    <p>{item.meta}</p>
                  </div>
                  <span className="innovator-dashboard__feature-status">
                    {item.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="innovator-dashboard__stack">
          <section className="innovator-dashboard__panel">
            <header className="innovator-dashboard__panel-header">
              <div>
                <span>تقویم</span>
                <h3>ددلاین‌ها و یادآوری‌ها</h3>
              </div>
            </header>

            <ul className="committee-dashboard__calendar-list">
              {calendarItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                  <small>{item.type}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="innovator-dashboard__panel">
            <header className="innovator-dashboard__panel-header">
              <div>
                <span>وضعیت سریع</span>
                <h3>خلاصه بخش‌های ساخته‌شده</h3>
              </div>
            </header>

            <ul className="innovator-dashboard__activity-list">
              <li>
                {toPersianDigits(calls.length)} فراخوان ثبت شده؛{" "}
                {toPersianDigits(draftCalls)} پیش‌نویس
              </li>
              <li>{toPersianDigits(plans.length)} طرح در مدیریت طرح‌ها</li>
              <li>
                {toPersianDigits(activities.length)} دوره/رویداد در پنل آموزشی
              </li>
              <li>{toPersianDigits(orders.length)} سفارش اجرا ثبت شده</li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}

function ReceivedRequestsPanel({ mode, requests, setRequests }) {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );

  const userLevels = useMemo(
    () => ["all", ...new Set(requests.map((request) => request.userLevel))],
    [requests],
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesMode =
        mode === "history"
          ? request.status === "پاسخ داده شده"
          : request.status !== "پاسخ داده شده";

      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        request.title.toLowerCase().includes(normalizedSearch) ||
        request.message.toLowerCase().includes(normalizedSearch) ||
        request.userName.toLowerCase().includes(normalizedSearch) ||
        request.userLevel.toLowerCase().includes(normalizedSearch);

      const matchesLevel =
        levelFilter === "all" || request.userLevel === levelFilter;

      return matchesMode && matchesSearch && matchesLevel;
    });
  }, [levelFilter, mode, requests, searchTerm]);

  const openRequest = (requestId) => {
    const targetRequest = requests.find((request) => request.id === requestId);

    if (!targetRequest) return;

    if (targetRequest.status === "در انتظار پیگیری") {
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "در حال پیگیری" }
            : request,
        ),
      );
    }

    setSelectedRequestId(requestId);
    setReplyText(targetRequest.reply || "");
  };

  const closeDetail = () => {
    setSelectedRequestId(null);
    setReplyText("");
  };

  const submitReply = () => {
    if (!selectedRequest || !replyText.trim()) return;

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: "پاسخ داده شده",
              reply: replyText.trim(),
              repliedAt: getCurrentPersianDateTime(),
            }
          : request,
      ),
    );

    closeDetail();
  };

  if (selectedRequest) {
    return (
      <section className="committee-dashboard__panel committee-dashboard__request-detail">
        <div className="committee-dashboard__panel-header committee-dashboard__detail-header">
          <div>
            <span>
              {mode === "history" ? "مشاهده پاسخ" : "پاسخ به درخواست"}
            </span>
            <h3>{selectedRequest.title}</h3>
            <p>
              ارسال‌کننده: {selectedRequest.userName} / سطح کاربری:{" "}
              {selectedRequest.userLevel}
            </p>
          </div>

          <button type="button" onClick={closeDetail}>
            <BackIcon />
            بازگشت
          </button>
        </div>

        <div className="committee-dashboard__request-detail-grid">
          <article>
            <span>سطح کاربری</span>
            <strong>{selectedRequest.userLevel}</strong>
          </article>
          <article>
            <span>وضعیت</span>
            <RequestStatusBadge status={selectedRequest.status} />
          </article>
          <article>
            <span>تاریخ ارسال</span>
            <strong>{selectedRequest.sentAt}</strong>
          </article>
          <article>
            <span>ارسال‌کننده</span>
            <strong>{selectedRequest.userName}</strong>
          </article>
        </div>

        <div className="committee-dashboard__request-body">
          <span>متن درخواست</span>
          <p>{selectedRequest.message}</p>
        </div>

        {selectedRequest.status === "پاسخ داده شده" && (
          <div className="committee-dashboard__reply-view">
            <span>پاسخ ارسال‌شده</span>
            <p>{selectedRequest.reply}</p>
            <small>{selectedRequest.repliedAt}</small>
          </div>
        )}

        {selectedRequest.status !== "پاسخ داده شده" && (
          <div className="committee-dashboard__reply-box">
            <label>
              <span>پاسخ دبیرخانه</span>
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="پاسخ نهایی را برای کاربر بنویسید..."
              />
            </label>

            <button
              type="button"
              disabled={!replyText.trim()}
              onClick={submitReply}
            >
              ارسال پاسخ
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="committee-dashboard__panel committee-dashboard__requests-panel">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>
            {mode === "history" ? "تاریخچه درخواست‌ها" : "درخواست‌های جدید"}
          </span>
          <h3>
            {mode === "history"
              ? "درخواست‌های پاسخ داده شده"
              : "درخواست‌های نیازمند پیگیری"}
          </h3>
        </div>
      </div>

      <div className="committee-dashboard__requests-toolbar">
        <label>
          <span>جستجو</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="جستجو در عنوان، متن یا نام کاربر..."
          />
        </label>

        <label>
          <span>سطح کاربری</span>
          <select
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value)}
          >
            {userLevels.map((level) => (
              <option value={level} key={level}>
                {level === "all" ? "همه کاربران" : level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="committee-dashboard__requests-list">
        {filteredRequests.map((request) => (
          <article
            className="committee-dashboard__request-card"
            key={request.id}
          >
            <div>
              <div className="committee-dashboard__request-title-row">
                <span className="committee-dashboard__user-level">
                  {request.userLevel}
                </span>
                <h4>{request.title}</h4>
              </div>

              <p>{request.message}</p>

              <div className="committee-dashboard__request-meta">
                <span>کاربر: {request.userName}</span>
                <span>{request.sentAt}</span>
              </div>
            </div>

            <RequestStatusBadge status={request.status} />

            <button type="button" onClick={() => openRequest(request.id)}>
              {mode === "history" ? "مشاهده پاسخ" : "مشاهده و پاسخ"}
            </button>
          </article>
        ))}

        {filteredRequests.length === 0 && (
          <div className="committee-dashboard__empty-state">
            موردی برای نمایش وجود ندارد.
          </div>
        )}
      </div>
    </section>
  );
}

function MessagesPanel() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [filter, setFilter] = useState("all");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId,
  );

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.isRead;
    if (filter === "important") return message.isImportant;
    return true;
  });

  const markAllAsRead = () => {
    setMessages((currentMessages) =>
      currentMessages.map((message) => ({ ...message, isRead: true })),
    );
  };

  const deleteAllMessages = () => {
    if (!window.confirm("آیا از حذف همه پیام‌ها مطمئن هستید؟")) return;
    setMessages([]);
    setSelectedMessageId(null);
  };

  const openMessage = (messageId) => {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message,
      ),
    );
    setSelectedMessageId(messageId);
  };

  const deleteMessage = (messageId) => {
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );

    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <div className="messages-panel__card messages-panel__detail-card">
          <div className="messages-panel__detail-header">
            <div>
              <span>{selectedMessage.category}</span>
              <h3>{selectedMessage.title}</h3>
              <p>{selectedMessage.sentAt}</p>
            </div>

            <button
              type="button"
              className="messages-panel__neutral-button"
              onClick={() => setSelectedMessageId(null)}
            >
              بازگشت
            </button>
          </div>

          <p className="messages-panel__detail-body">{selectedMessage.body}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="messages-panel">
      <div className="messages-panel__card">
        <header className="messages-panel__header">
          <div>
            <span>پیام‌ها و اعلانات</span>
            <h3>مرکز پیام‌های دبیرخانه</h3>
          </div>

          <div className="messages-panel__header-actions">
            <button
              type="button"
              className="messages-panel__neutral-button"
              onClick={markAllAsRead}
            >
              خواندن همه
            </button>
            <button
              type="button"
              className="messages-panel__delete-all"
              onClick={deleteAllMessages}
            >
              حذف همه
            </button>
          </div>
        </header>

        <div className="messages-panel__filters">
          <button
            type="button"
            className={filter === "all" ? "messages-panel__filter--active" : ""}
            onClick={() => setFilter("all")}
          >
            همه
            <strong>{messages.length}</strong>
          </button>
          <button
            type="button"
            className={
              filter === "unread" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("unread")}
          >
            خوانده‌نشده
            <strong>
              {messages.filter((message) => !message.isRead).length}
            </strong>
          </button>
          <button
            type="button"
            className={
              filter === "important" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("important")}
          >
            مهم
            <strong>
              {messages.filter((message) => message.isImportant).length}
            </strong>
          </button>
        </div>

        <div className="messages-panel__list">
          {filteredMessages.map((message) => (
            <article
              className={`messages-panel__message ${
                message.isRead ? "messages-panel__message--read" : ""
              }`}
              key={message.id}
            >
              <div>
                <span>{message.category}</span>
                <h4>{message.title}</h4>
                <p>{message.sentAt}</p>
              </div>

              <div className="messages-panel__card-actions">
                <button type="button" onClick={() => openMessage(message.id)}>
                  مشاهده
                </button>
                <button
                  type="button"
                  className="messages-panel__remove-message"
                  onClick={() => deleteMessage(message.id)}
                >
                  حذف
                </button>
              </div>
            </article>
          ))}

          {filteredMessages.length === 0 && (
            <div className="messages-panel__empty">
              پیامی برای نمایش وجود ندارد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqPanel() {
  const [openQuestionId, setOpenQuestionId] = useState(
    FAQ_ITEMS[0]?.id || null,
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    "all",
    ...new Set(FAQ_ITEMS.map((item) => item.category)),
  ];

  const filteredQuestions = FAQ_ITEMS.filter(
    (item) => categoryFilter === "all" || item.category === categoryFilter,
  );

  return (
    <section className="faq-panel">
      <div className="faq-panel__header">
        <span>سوالات متداول</span>
        <h3>راهنمای داشبورد دبیرخانه</h3>
      </div>

      <div className="faq-panel__filters">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              categoryFilter === category ? "faq-panel__filter--active" : ""
            }
            onClick={() => setCategoryFilter(category)}
          >
            {category === "all" ? "همه" : category}
          </button>
        ))}
      </div>

      <div className="faq-panel__list">
        {filteredQuestions.map((item) => {
          const isOpen = openQuestionId === item.id;

          return (
            <article
              className={`faq-panel__item ${isOpen ? "faq-panel__item--open" : ""}`}
              key={item.id}
            >
              <button
                type="button"
                onClick={() => setOpenQuestionId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
              </button>

              <div className="faq-panel__answer">
                <p>{item.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProfilePanel({ profile, onEdit }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__card">
        <button type="button" onClick={onEdit}>
          ویرایش پروفایل
        </button>

        <div className="profile-panel__head">
          <span className="profile-panel__avatar profile-panel__avatar--large">
            {profile.avatarLetter}
          </span>
          <h3>
            {profile.firstName} {profile.lastName}
          </h3>
          <p>{profile.role}</p>
        </div>

        <div className="profile-panel__grid">
          <article>
            <span>نام</span>
            <strong>{profile.firstName}</strong>
          </article>
          <article>
            <span>نام خانوادگی</span>
            <strong>{profile.lastName}</strong>
          </article>
          <article>
            <span>شماره موبایل</span>
            <strong>{profile.mobile}</strong>
          </article>
          <article>
            <span>ایمیل</span>
            <strong>{profile.email}</strong>
          </article>
          <article>
            <span>سطح کاربری</span>
            <strong>{profile.role}</strong>
          </article>
          <article>
            <span>واحد سازمانی</span>
            <strong>{profile.unit}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

function EditProfilePanel({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  const updateField = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  };

  const submitProfile = (event) => {
    event.preventDefault();

    onSave(formData);
  };

  return (
    <section className="profile-panel profile-panel--edit">
      <div className="profile-panel__card profile-panel__card--edit">
        <div className="profile-panel__edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات حساب کاربری</h3>
          </div>

          <button type="button" onClick={onCancel}>
            بازگشت
          </button>
        </div>

        <form onSubmit={submitProfile}>
          <div className="profile-panel__form-grid">
            <label>
              <span>نام</span>
              <input
                type="text"
                value={formData.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </label>
            <label>
              <span>نام خانوادگی</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </label>
            <label>
              <span>شماره موبایل</span>
              <input
                type="text"
                value={formData.mobile}
                onChange={(event) => updateField("mobile", event.target.value)}
              />
            </label>
            <label>
              <span>ایمیل</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </label>
            <label>
              <span>واحد سازمانی</span>
              <input
                type="text"
                value={formData.unit}
                onChange={(event) => updateField("unit", event.target.value)}
              />
            </label>
          </div>

          <div className="profile-panel__password-box">
            <span>تغییر رمز عبور</span>
            <p>
              این بخش نمایشی است و در اتصال به بک‌اند، اعتبارسنجی رمز فعال
              می‌شود.
            </p>
            <div className="profile-panel__form-grid">
              <label>
                <span>رمز فعلی</span>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(event) =>
                    setPasswordData((currentData) => ({
                      ...currentData,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>رمز جدید</span>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(event) =>
                    setPasswordData((currentData) => ({
                      ...currentData,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>تکرار رمز جدید</span>
                <input
                  type="password"
                  value={passwordData.repeatPassword}
                  onChange={(event) =>
                    setPasswordData((currentData) => ({
                      ...currentData,
                      repeatPassword: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="profile-panel__form-actions">
            <button type="button" onClick={onCancel}>
              انصراف
            </button>
            <button type="submit">ذخیره تغییرات</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function toPersianDigits(value) {
  return String(value ?? "").replace(
    /[0-9]/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
  );
}

function normalizeDateString(value) {
  return String(value || "")
    .trim()
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
}

function parseCallDate(value) {
  const normalized = normalizeDateString(value);
  const parts = normalized.split("/").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part)))
    return null;
  const [year, month, day] = parts;
  return year * 10000 + month * 100 + day;
}

function getCurrentSimplePersianDate() {
  return new Date()
    .toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
}

function getCallStatusClass(status) {
  if (status === "منتشر شده") return "published";
  if (status === "پیش‌نویس") return "draft";
  if (status === "غیرفعال") return "inactive";
  return "default";
}

function getPlanReviewStatusClass(status) {
  if (status === "بررسی شده") return "reviewed";
  return "waiting";
}

function getFinalPlanStatusClass(status) {
  if (status === "قبول") return "accepted";
  if (status === "قبول ضعیف") return "weak-accepted";
  if (status === "رد") return "rejected";
  if (status === "رد ضعیف") return "weak-rejected";
  if (status === "نیازمند اصلاح") return "revision";
  return "pending";
}

function getPlanFolderLabel(folderId) {
  return PLAN_FOLDERS.find((folder) => folder.id === folderId)?.label || "";
}

function getPlanFolderTone(folderId) {
  return PLAN_FOLDERS.find((folder) => folder.id === folderId)?.tone || "";
}

function getPlanHistoryYear(plan) {
  if (plan.id % 3 === 0) return "1403";
  if (plan.id % 2 === 0) return "1404";
  return "1405";
}

function getPlanCallType(plan) {
  return plan.call || "فراخوان هاتف";
}

function getPlanDownloadHref(plan) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(`فایل نمونه پروپوزال برای طرح ${plan.trackingId} - ${plan.title}`)}`;
}

function formatRichText(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "<p>در این بخش توضیحات تکمیلی فراخوان، شرایط شرکت، مسیر ارسال طرح و نکات مهم برای متقاضیان نمایش داده می‌شود.</p>";
  }

  return text
    .split(/\n{2,}/)
    .map((block) => {
      const cleanBlock = escapeHtml(block.trim()).replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>",
      );
      if (cleanBlock.startsWith("### ")) {
        return `<h3>${cleanBlock.replace(/^###\s*/, "")}</h3>`;
      }
      if (cleanBlock.startsWith("## ")) {
        return `<h2>${cleanBlock.replace(/^##\s*/, "")}</h2>`;
      }
      return `<p>${cleanBlock.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createCallFromForm(form, status, editingCall) {
  const now = getCurrentSimplePersianDate();

  return {
    id: editingCall?.id || Date.now(),
    number: form.number.trim() || "۱",
    title: form.title.trim() || "فراخوان جدید هاتف",
    category: form.category.trim() || "محور فراخوان",
    deadline: form.deadline.trim() || now,
    heroDescription: form.heroDescription.trim(),
    moreTitle: form.moreTitle?.trim() || "توضیحات بیشتر فراخوان",
    moreDescription: form.moreDescription.trim(),
    pdfFileName: form.pdfFileName,
    bannerPreview: form.bannerPreview,
    isAnnualTheme: form.isAnnualTheme,
    faqs: form.faqs,
    status,
    createdAt: editingCall?.createdAt || now,
    publishedAt:
      status === "منتشر شده"
        ? editingCall?.publishedAt || now
        : editingCall?.publishedAt || "",
    year: (form.deadline.trim() || now).slice(0, 4),
  };
}

function buildCallPreviewHtml(call) {
  const banner = call.bannerPreview || bannerImage;
  const pdfLink = call.pdfFileName || "نسخه PDF فراخوان یا اطلاعیه";
  const statusText =
    call.status === "منتشر شده" ? "در حال دریافت طرح" : "پیش‌نمایش فراخوان";
  const faqs = call.faqs?.length ? call.faqs : CALL_DEFAULT_FAQS;

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(call.title)}</title>
<style>${CALL_DETAILS_PREVIEW_CSS}</style>
</head>
<body>
<div class="call-details">
  <div class="call-details__container">
    <section class="call-details__hero">
      <div class="call-details__hero-image">
        <img src="${escapeHtml(banner)}" alt="${escapeHtml(call.title)}" />
        <div class="call-details__hero-status">
          <span class="call-details__badge call-details__badge--active">${escapeHtml(statusText)}</span>
          <span>مهلت تا: ${escapeHtml(toPersianDigits(call.deadline))}</span>
        </div>
      </div>
      <div class="call-details__hero-content">
        <aside class="call-details__quick-actions">
          <a href="#registration-guide" class="call-details__quick-link">راهنمای شرکت در طرح</a>
          <a href="#eligibility" class="call-details__quick-link">شرایط احراز و ارسال آثار</a>
          <a href="#download-pdf" class="call-details__quick-link call-details__quick-link--download"><span aria-hidden="true">↓</span>${escapeHtml(pdfLink)}</a>
          <a href="#submit-call" class="call-details__submit-button">ارسال طرح</a>
        </aside>
        <div class="call-details__hero-info">
          <div class="call-details__meta">
            <span class="call-details__number">${escapeHtml(toPersianDigits(call.number))}</span>
            <h1>${escapeHtml(call.title)}</h1>
            <span class="call-details__badge">${escapeHtml(call.category)}</span>
          </div>
          <p>${escapeHtml(call.heroDescription || "متن معرفی و توضیح بخش هیرو فراخوان در این بخش نمایش داده می‌شود.")}</p>
        </div>
      </div>
    </section>
    <div class="call-details__layout">
      <aside class="call-details__sidebar">
        <div class="call-details__sidebar-card">
          <h3>اطلاعات فراخوان</h3>
          <p><strong>وضعیت:</strong> ${escapeHtml(call.status)}</p>
          <p><strong>محوریت:</strong> ${escapeHtml(call.category)}</p>
          <p><strong>مهلت:</strong> ${escapeHtml(toPersianDigits(call.deadline))}</p>
          ${call.isAnnualTheme ? "<p><strong>نمایش در محورهای سال جاری:</strong> بله</p>" : ""}
        </div>
      </aside>
      <main class="call-details__main">
        <article class="call-details__article">
          <section id="registration-guide">
            <header class="call-details__section-title"><span></span><h2>${escapeHtml(call.moreTitle || (call.isAnnualTheme ? "محورهای پژوهشی سال جاری" : "توضیحات فراخوان"))}</h2></header>
            ${formatRichText(call.moreDescription)}
          </section>
          <section id="eligibility">
            <header class="call-details__section-title"><span></span><h2>شرایط احراز و ارسال آثار</h2></header>
            <p>متقاضیان لازم است اطلاعات طرح، اعضای تیم، سوابق مرتبط، برنامه اجرایی و مستندات موردنیاز را با دقت آماده و ارسال کنند.</p>
          </section>
        </article>
        <section class="call-details__faq">
          <header class="call-details__section-title"><span></span><h2>سوالات متداول</h2></header>
          <div class="call-details__faq-list">
            ${faqs.map((faq, index) => `<details class="call-details__faq-item" ${index === 0 ? "open" : ""}><summary><span>${escapeHtml(faq.question)}</span><i>+</i></summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}
          </div>
        </section>
      </main>
    </div>
  </div>
</div>
</body>
</html>`;
}

function openCallPreview(call) {
  const previewWindow = window.open("", "_blank");

  if (!previewWindow) {
    window.alert("مرورگر اجازه باز شدن پنجره پیش‌نمایش را نداد.");
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(buildCallPreviewHtml(call));
  previewWindow.document.close();
}

function CallStatusBadge({ status }) {
  return (
    <span
      className={`committee-call__status committee-call__status--${getCallStatusClass(status)}`}
    >
      {status}
    </span>
  );
}

function CallBuilderPanel({ editingCall, onSaveCall, onCancelEdit, notice }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...CALL_FORM_DEFAULT,
    ...(editingCall || {}),
    bannerFile: null,
    bannerPreview: editingCall?.bannerPreview || "",
    faqs: editingCall?.faqs?.length ? editingCall.faqs : CALL_DEFAULT_FAQS,
  }));

  useEffect(() => {
    setStep(0);
    setForm({
      ...CALL_FORM_DEFAULT,
      ...(editingCall || {}),
      bannerFile: null,
      bannerPreview: editingCall?.bannerPreview || "",
      faqs: editingCall?.faqs?.length ? editingCall.faqs : CALL_DEFAULT_FAQS,
    });
  }, [editingCall]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const updateFaq = (id, field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      faqs: currentForm.faqs.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq,
      ),
    }));
  };

  const addFaq = () => {
    setForm((currentForm) => {
      if (currentForm.faqs.length >= 10) return currentForm;
      return {
        ...currentForm,
        faqs: [
          ...currentForm.faqs,
          { id: Date.now(), question: "", answer: "" },
        ],
      };
    });
  };

  const removeFaq = (id) => {
    setForm((currentForm) => {
      if (currentForm.faqs.length <= 1) return currentForm;
      return {
        ...currentForm,
        faqs: currentForm.faqs.filter((faq) => faq.id !== id),
      };
    });
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateField("bannerFile", file);
    updateField("bannerPreview", URL.createObjectURL(file));
  };

  const handleFileName = (field, event) => {
    const file = event.target.files?.[0];
    updateField(field, file?.name || "");
  };

  const previewCall = createCallFromForm(
    form,
    editingCall?.status || "پیش‌نویس",
    editingCall,
  );
  const canGoNext =
    step !== 1 ||
    (form.title.trim() && form.category.trim() && form.deadline.trim());

  const saveAs = (status) => {
    const finalCall = createCallFromForm(form, status, editingCall);
    onSaveCall(finalCall, Boolean(editingCall));
  };

  return (
    <section className="committee-dashboard__panel committee-call-builder">
      <div className="committee-dashboard__panel-header committee-call-builder__header">
        <div>
          <span>{editingCall ? "ویرایش فراخوان" : "ساخت فراخوان"}</span>
          <h3>
            {editingCall
              ? `ویرایش «${editingCall.title}»`
              : "ساخت فراخوان جدید"}
          </h3>
          <p>
            اطلاعاتی را وارد کنید که در صفحه جزئیات فراخوان و در صورت انتخاب، در
            محورهای سال جاری منتشر می‌شود.
          </p>
        </div>
        {editingCall && (
          <button type="button" onClick={onCancelEdit}>
            انصراف از ویرایش
          </button>
        )}
      </div>

      {notice && (
        <div className="committee-dashboard__success-message">{notice}</div>
      )}

      <div className="committee-call-builder__steps">
        {CALL_STEPS.map((title, index) => (
          <button
            type="button"
            key={title}
            className={
              index === step ? "committee-call-builder__step--active" : ""
            }
            onClick={() => setStep(index)}
          >
            <span>{toPersianDigits(index + 1)}</span>
            {title}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="committee-call-builder__grid">
          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>بنر فراخوان</span>
            <input type="file" accept="image/*" onChange={handleBannerUpload} />
          </label>
          <div className="committee-call-builder__banner-preview committee-call-builder__field--full">
            <img src={form.bannerPreview || bannerImage} alt="پیش‌نمایش بنر" />
            <p>این تصویر در بالای صفحه فراخوان نمایش داده می‌شود.</p>
          </div>
          <label className="committee-call-builder__toggle committee-call-builder__field--full">
            <input
              type="checkbox"
              checked={form.isAnnualTheme}
              onChange={(event) =>
                updateField("isAnnualTheme", event.target.checked)
              }
            />
            <span>این فراخوان جزو محورهای سال جاری سایت منتشر شود</span>
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="committee-call-builder__grid">
          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>عنوان فراخوان</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="مثلاً فراخوان اولین دوره هدایت اعتبارات توسعه فناوری"
            />
          </label>
          <label className="committee-call-builder__field">
            <span>شماره فراخوان</span>
            <input
              value={form.number}
              onChange={(event) => updateField("number", event.target.value)}
              placeholder="مثلاً ۲"
            />
          </label>
          <label className="committee-call-builder__field">
            <span>مهلت ارسال طرح</span>
            <input
              value={form.deadline}
              onChange={(event) => updateField("deadline", event.target.value)}
              placeholder="1405/05/05"
            />
          </label>
          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>محوریت فراخوان</span>
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="مثلاً با محوریت هوش مصنوعی"
            />
          </label>
          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>متن توضیح بخش هیرو</span>
            <textarea
              value={form.heroDescription}
              onChange={(event) =>
                updateField("heroDescription", event.target.value)
              }
              placeholder="توضیح کوتاه و معرفی اصلی فراخوان..."
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="committee-call-builder__grid">
          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>نسخه PDF فراخوان یا اطلاعیه</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => handleFileName("pdfFileName", event)}
            />
            {form.pdfFileName && <small>{form.pdfFileName}</small>}
          </label>

          <label className="committee-call-builder__field committee-call-builder__field--full">
            <span>تیتر بخش توضیحات بیشتر</span>
            <input
              value={form.moreTitle}
              onChange={(event) => updateField("moreTitle", event.target.value)}
              placeholder="مثلاً محورهای پژوهشی سال جاری"
            />
          </label>

          <div className="committee-call-builder__field committee-call-builder__field--full committee-rich-editor">
            <span>توضیحات بیشتر فراخوان</span>
            <div className="committee-rich-editor__toolbar">
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "moreDescription",
                    `${form.moreDescription}${form.moreDescription ? "\n\n" : ""}## تیتر جدید`,
                  )
                }
              >
                تیتر
              </button>
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "moreDescription",
                    `${form.moreDescription}${form.moreDescription ? " " : ""}**متن بولد**`,
                  )
                }
              >
                بولد
              </button>
            </div>
            <textarea
              value={form.moreDescription}
              onChange={(event) =>
                updateField("moreDescription", event.target.value)
              }
              placeholder="متن کامل‌تر درباره شرایط، مدارک، اهداف و مسیر بررسی فراخوان... برای تیتر از ## و برای بولد از **متن** استفاده کنید."
            />
            <small>
              برای تیتر از دکمه «تیتر» و برای بولد کردن از دکمه «بولد» استفاده
              کنید؛ در پیش‌نمایش مثل متن ویرایش‌شده نمایش داده می‌شود.
            </small>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="committee-call-builder__repeat-list">
          <div className="committee-call-builder__repeat-head">
            <div>
              <span>سوالات متداول</span>
              <h4>تا ۱۰ سوال متداول قابل افزودن است.</h4>
            </div>
            <button
              type="button"
              onClick={addFaq}
              disabled={form.faqs.length >= 10}
            >
              افزودن سوال
            </button>
          </div>
          {form.faqs.map((faq, index) => (
            <article
              className="committee-call-builder__repeat-card"
              key={faq.id}
            >
              <div className="committee-call-builder__repeat-title">
                <strong>سوال {toPersianDigits(index + 1)}</strong>
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  disabled={form.faqs.length <= 1}
                >
                  حذف
                </button>
              </div>
              <label className="committee-call-builder__field">
                <span>عنوان سوال</span>
                <input
                  value={faq.question}
                  onChange={(event) =>
                    updateFaq(faq.id, "question", event.target.value)
                  }
                />
              </label>
              <label className="committee-call-builder__field">
                <span>پاسخ</span>
                <textarea
                  value={faq.answer}
                  onChange={(event) =>
                    updateFaq(faq.id, "answer", event.target.value)
                  }
                />
              </label>
            </article>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="committee-call-builder__review">
          <article>
            <img src={form.bannerPreview || bannerImage} alt="بنر فراخوان" />
            <div>
              <span>
                {form.isAnnualTheme ? "محور سال جاری" : "فراخوان عمومی"}
              </span>
              <h4>{form.title || "عنوان فراخوان وارد نشده است"}</h4>
              <p>{form.category || "محوریت فراخوان وارد نشده است"}</p>
              <small>مهلت ارسال: {toPersianDigits(form.deadline || "-")}</small>
            </div>
          </article>
          <div className="committee-call-builder__review-actions">
            <button type="button" onClick={() => openCallPreview(previewCall)}>
              پیش‌نمایش
            </button>
            <button
              type="button"
              className="committee-call-builder__draft"
              onClick={() => saveAs("پیش‌نویس")}
            >
              ذخیره پیش‌نویس
            </button>
            <button
              type="button"
              className="committee-call-builder__publish"
              onClick={() => saveAs("منتشر شده")}
            >
              انتشار نهایی
            </button>
          </div>
        </div>
      )}

      <div className="committee-call-builder__actions">
        <button
          type="button"
          onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
          disabled={step === 0}
        >
          مرحله قبل
        </button>
        <button
          type="button"
          onClick={() =>
            setStep((currentStep) =>
              Math.min(CALL_STEPS.length - 1, currentStep + 1),
            )
          }
          disabled={step === CALL_STEPS.length - 1 || !canGoNext}
        >
          مرحله بعد
        </button>
      </div>
    </section>
  );
}

function DateRangeFilter({ fromDate, toDate, setFromDate, setToDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasFilter = Boolean(fromDate || toDate);

  return (
    <div className="committee-call-filter">
      <button
        type="button"
        className="committee-call-filter__trigger"
        onClick={() => setIsOpen((current) => !current)}
      >
        {hasFilter
          ? `${toPersianDigits(fromDate || "...")} تا ${toPersianDigits(toDate || "...")}`
          : "فیلتر بازه زمانی"}
      </button>
      {hasFilter && (
        <button
          type="button"
          className="committee-call-filter__clear"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setIsOpen(false);
          }}
        >
          حذف فیلتر
        </button>
      )}
      {isOpen && (
        <div className="committee-call-filter__popover">
          <label>
            <span>تاریخ شروع</span>
            <input
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              placeholder="1405/01/01"
            />
          </label>
          <label>
            <span>تاریخ پایان</span>
            <input
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              placeholder="1405/12/29"
            />
          </label>
          <button type="button" onClick={() => setIsOpen(false)}>
            اعمال فیلتر
          </button>
        </div>
      )}
    </div>
  );
}

function CallListPanel({
  mode,
  calls,
  onEditCall,
  onDeleteCall,
  onPublishCall,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const allowedStatuses =
    mode === "history"
      ? ["all", "منتشر شده", "پیش‌نویس", "غیرفعال"]
      : ["all", "منتشر شده", "پیش‌نویس"];
  const baseCalls =
    mode === "history"
      ? calls
      : calls.filter((call) => call.status !== "غیرفعال");

  const filteredCalls = baseCalls.filter((call) => {
    const matchesStatus =
      statusFilter === "all" || call.status === statusFilter;
    const callDate = parseCallDate(
      call.publishedAt || call.createdAt || call.deadline,
    );
    const from = parseCallDate(fromDate);
    const to = parseCallDate(toDate);
    const matchesFrom = !from || !callDate || callDate >= from;
    const matchesTo = !to || !callDate || callDate <= to;
    return matchesStatus && matchesFrom && matchesTo;
  });

  return (
    <section className="committee-dashboard__panel committee-calls-list">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>
            {mode === "history" ? "آرشیو فراخوان‌ها" : "فراخوان‌های جاری"}
          </span>
          <h3>
            {mode === "history"
              ? "تاریخچه فراخوان‌ها"
              : "مدیریت فراخوان‌های جاری"}
          </h3>
          <p>
            {mode === "history"
              ? "همه فراخوان‌های منتشرشده، پیش‌نویس و غیرفعال در سال‌های مختلف."
              : "فراخوان‌های پیش‌نویس و منتشرشده را مدیریت کنید."}
          </p>
        </div>
      </div>

      <div className="committee-calls-list__toolbar">
        <div className="committee-calls-list__status-filters">
          {allowedStatuses.map((status) => (
            <button
              type="button"
              key={status}
              className={statusFilter === status ? "is-active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "همه" : status}
            </button>
          ))}
        </div>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </div>

      <div className="committee-calls-list__items">
        {filteredCalls.map((call) => (
          <article className="committee-call-card" key={call.id}>
            <div className="committee-call-card__media">
              <img src={call.bannerPreview || bannerImage} alt={call.title} />
            </div>
            <div className="committee-call-card__body">
              <div className="committee-call-card__head">
                <CallStatusBadge status={call.status} />
                {call.isAnnualTheme && (
                  <span className="committee-call-card__theme">
                    محور سال جاری
                  </span>
                )}
              </div>
              <h4>{call.title}</h4>
              <p>{call.category}</p>
              <div className="committee-call-card__meta">
                <span>مهلت: {toPersianDigits(call.deadline)}</span>
                <span>سال: {toPersianDigits(call.year)}</span>
                <span>ثبت: {toPersianDigits(call.createdAt)}</span>
              </div>
            </div>
            <div className="committee-call-card__actions">
              <button type="button" onClick={() => openCallPreview(call)}>
                پیش‌نمایش
              </button>
              {mode !== "history" && (
                <button type="button" onClick={() => onEditCall(call)}>
                  ویرایش
                </button>
              )}
              {mode !== "history" && call.status === "پیش‌نویس" && (
                <button
                  type="button"
                  className="committee-call-card__publish"
                  onClick={() => onPublishCall(call.id)}
                >
                  انتشار نهایی
                </button>
              )}
              {mode !== "history" && (
                <button
                  type="button"
                  className="committee-call-card__delete"
                  onClick={() => onDeleteCall(call.id)}
                >
                  حذف
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function normalizePlanReviewStatus(status) {
  return status === "بررسی شده" ? "بررسی شده" : "در انتظار بررسی";
}

function PlanReviewStatusBadge({ status }) {
  const normalizedStatus = normalizePlanReviewStatus(status);
  return (
    <span
      className={`committee-plan__status committee-plan__status--${getPlanReviewStatusClass(normalizedStatus)}`}
    >
      {normalizedStatus}
    </span>
  );
}

function FinalPlanStatusBadge({ status }) {
  return (
    <span
      className={`committee-plan__final-status committee-plan__final-status--${getFinalPlanStatusClass(status)}`}
    >
      {status || "تعیین نشده"}
    </span>
  );
}

function getCurrentPlanStatusLabel(status) {
  if (status === "all") return "همه";
  if (status === "waiting") return "بررسی نشده‌ها";
  if (status === "reviewed") return "بررسی شده‌ها";
  if (status === "no-feedback") return "بدون بازخورد";
  return status;
}

function getFinalPlanStatusLabel(status) {
  if (status === "all") return "همه";
  if (status === "no-final") return "بدون وضعیت نهایی";
  if (status === "no-feedback") return "بدون بازخورد";
  return status;
}

function getCurrentPlanStatusCount(plans, status) {
  if (status === "all") return plans.length;
  if (status === "waiting") {
    return plans.filter(
      (plan) =>
        normalizePlanReviewStatus(plan.committeeReviewStatus) ===
        "در انتظار بررسی",
    ).length;
  }
  if (status === "reviewed") {
    return plans.filter(
      (plan) =>
        normalizePlanReviewStatus(plan.committeeReviewStatus) === "بررسی شده",
    ).length;
  }
  if (status === "no-feedback") {
    return plans.filter((plan) => !plan.committeeReviewFeedback).length;
  }
  return 0;
}

function getFinalPlanStatusCount(plans, status) {
  if (status === "all") return plans.length;
  if (status === "no-final")
    return plans.filter((plan) => !plan.finalStatus).length;
  if (status === "no-feedback")
    return plans.filter((plan) => !plan.committeeFeedback).length;
  return plans.filter((plan) => plan.finalStatus === status).length;
}

function PlanFolderBoard({ plans, folderFilter, setFolderFilter }) {
  return (
    <div className="committee-plans__folders-board">
      <button
        type="button"
        className={
          folderFilter === "all"
            ? "committee-plans__folder-card committee-plans__folder-card--active"
            : "committee-plans__folder-card"
        }
        onClick={() => setFolderFilter("all")}
      >
        <span>📁</span>
        <strong>همه طرح‌ها</strong>
        <b>{toPersianDigits(plans.length)}</b>
        <small>نمایش همه پرونده‌ها</small>
      </button>
      {PLAN_FOLDERS.map((folder) => (
        <button
          type="button"
          key={folder.id}
          className={
            folderFilter === folder.id
              ? `committee-plans__folder-card committee-plans__folder-card--${folder.tone} committee-plans__folder-card--active`
              : `committee-plans__folder-card committee-plans__folder-card--${folder.tone}`
          }
          onDoubleClick={() => setFolderFilter(folder.id)}
          title="برای ورود به پوشه دوبار کلیک کنید"
        >
          <span>📂</span>
          <strong>{folder.label}</strong>
          <b>
            {toPersianDigits(
              plans.filter((plan) => plan.folders.includes(folder.id)).length,
            )}
          </b>
          <small>برای ورود به پوشه دوبار کلیک کنید</small>
        </button>
      ))}
    </div>
  );
}

function CommitteePlanList({
  plans,
  mode,
  onOpenPlan,
  onOpenDecision,
  onToggleFolder,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const isCurrentMode = mode === "current";
  const isFinalMode = mode === "final";
  const isHistoryMode = mode === "history";

  const statusOptions =
    isFinalMode || isHistoryMode
      ? ["all", "no-final", ...FINAL_PLAN_STATUSES, "no-feedback"]
      : ["all", "waiting", "reviewed", "no-feedback"];

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        plan.title.toLowerCase().includes(normalizedSearch) ||
        plan.trackingId.toLowerCase().includes(normalizedSearch) ||
        plan.innovator.name.toLowerCase().includes(normalizedSearch) ||
        plan.field.toLowerCase().includes(normalizedSearch);

      const matchesFolder =
        !isCurrentMode ||
        folderFilter === "all" ||
        plan.folders.includes(folderFilter);

      const matchesStatus = isCurrentMode
        ? statusFilter === "all" ||
          (statusFilter === "reviewed" &&
            normalizePlanReviewStatus(plan.committeeReviewStatus) ===
              "بررسی شده") ||
          (statusFilter === "waiting" &&
            normalizePlanReviewStatus(plan.committeeReviewStatus) ===
              "در انتظار بررسی") ||
          (statusFilter === "no-feedback" && !plan.committeeReviewFeedback)
        : statusFilter === "all" ||
          (statusFilter === "no-final" && !plan.finalStatus) ||
          (statusFilter === "no-feedback" && !plan.committeeFeedback) ||
          plan.finalStatus === statusFilter;

      return matchesSearch && matchesFolder && matchesStatus;
    });
  }, [folderFilter, isCurrentMode, plans, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPagePlans = filteredPlans.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const statusLabel = isCurrentMode
    ? getCurrentPlanStatusLabel(statusFilter)
    : getFinalPlanStatusLabel(statusFilter);

  return (
    <>
      {isCurrentMode && (
        <PlanFolderBoard
          plans={plans}
          folderFilter={folderFilter}
          setFolderFilter={(value) => {
            setFolderFilter(value);
            setCurrentPage(1);
          }}
        />
      )}

      <div className="committee-plans__toolbar">
        <label className="committee-plans__search">
          <span>جستجو</span>
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="شناسه، عنوان، نام فناور یا حوزه..."
          />
        </label>

        <div className="committee-plans__filter-group">
          <span>
            {isFinalMode || isHistoryMode ? "وضعیت نهایی" : "وضعیت بررسی"}
          </span>
          <div>
            {statusOptions.map((status) => {
              const count = isCurrentMode
                ? getCurrentPlanStatusCount(plans, status)
                : getFinalPlanStatusCount(plans, status);

              return (
                <button
                  type="button"
                  key={status}
                  className={statusFilter === status ? "is-active" : ""}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  <span>
                    {isCurrentMode
                      ? getCurrentPlanStatusLabel(status)
                      : getFinalPlanStatusLabel(status)}
                  </span>
                  <strong>{toPersianDigits(count)}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <label className="committee-plans__page-size">
          <span>تعداد نمایش</span>
          <select
            value={itemsPerPage}
            onChange={(event) => {
              setItemsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>۱۰ عدد</option>
            <option value={20}>۲۰ عدد</option>
            <option value={50}>۵۰ عدد</option>
            <option value={100}>۱۰۰ عدد</option>
          </select>
        </label>
      </div>

      <div className="committee-plans__list">
        {currentPagePlans.map((plan) => {
          const hasFeedback = isCurrentMode
            ? Boolean(plan.committeeReviewFeedback)
            : Boolean(plan.committeeFeedback);
          const isReviewed =
            isCurrentMode &&
            normalizePlanReviewStatus(plan.committeeReviewStatus) ===
              "بررسی شده";

          return (
            <article
              className={`committee-plan-card ${hasFeedback ? "committee-plan-card--has-feedback" : ""} ${isReviewed ? "committee-plan-card--reviewed" : ""}`}
              key={plan.id}
            >
              <div className="committee-plan-card__id">
                <span>شناسه</span>
                <strong>{plan.trackingId}</strong>
              </div>

              <div className="committee-plan-card__info">
                <div className="committee-plan-card__title-row">
                  {hasFeedback && (
                    <i
                      title={
                        isCurrentMode
                          ? "بازخورد این کاربر ثبت شده است"
                          : "بازخورد دبیرخانه و کمیته راهبری ثبت شده است"
                      }
                    />
                  )}
                  <h4>{plan.title}</h4>
                </div>
                <p>{plan.call}</p>
                <div className="committee-plan-card__meta">
                  <span>فناور: {plan.innovator.name}</span>
                  <span>حوزه: {plan.field}</span>
                  <span>ارسال: {toPersianDigits(plan.sentAt)}</span>
                  <span>ددلاین: {toPersianDigits(plan.deadline)}</span>
                </div>
                {isCurrentMode && plan.folders.length > 0 && (
                  <div className="committee-plan-card__folders">
                    {plan.folders.map((folderId) => (
                      <span
                        key={folderId}
                        className={`committee-plan-card__folder committee-plan-card__folder--${getPlanFolderTone(folderId)}`}
                      >
                        <strong>در فولدر:</strong>
                        <span>{getPlanFolderLabel(folderId)}</span>
                        {folderFilter === folderId && onToggleFolder && (
                          <button
                            type="button"
                            onClick={() => onToggleFolder(plan.id, folderId)}
                            aria-label={`حذف از پوشه ${getPlanFolderLabel(folderId)}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isCurrentMode ? (
                <PlanReviewStatusBadge status={plan.committeeReviewStatus} />
              ) : (
                <FinalPlanStatusBadge status={plan.finalStatus} />
              )}

              <div className="committee-plan-card__actions">
                {isFinalMode ? (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenDecision(plan.id, {
                        planIds: filteredPlans.map((item) => item.id),
                        statusFilter,
                        statusLabel,
                      })
                    }
                  >
                    تعیین وضعیت
                  </button>
                ) : (
                  <button type="button" onClick={() => onOpenPlan(plan.id)}>
                    {isCurrentMode
                      ? hasFeedback
                        ? "مشاهده / ویرایش بازخورد"
                        : "مشاهده و ثبت بازخورد"
                      : "مشاهده پرونده"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="committee-plans__pagination">
        <span>
          نمایش {toPersianDigits(currentPagePlans.length)} طرح از{" "}
          {toPersianDigits(filteredPlans.length)} مورد
        </span>
        <div>
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            قبلی
          </button>
          <strong>
            صفحه {toPersianDigits(safeCurrentPage)} از{" "}
            {toPersianDigits(totalPages)}
          </strong>
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            بعدی
          </button>
        </div>
      </div>
    </>
  );
}

function PlanDetailView({ plan, setPlans, onBack, readOnly = false }) {
  const [feedbackText, setFeedbackText] = useState(
    plan?.committeeReviewFeedback?.text || "",
  );
  const [recommendation, setRecommendation] = useState(
    plan?.committeeReviewRecommendation || "قابل بررسی در مرحله بعد",
  );
  const [score, setScore] = useState(plan?.committeeReviewScore || "");

  useEffect(() => {
    setFeedbackText(plan?.committeeReviewFeedback?.text || "");
    setRecommendation(
      plan?.committeeReviewRecommendation || "قابل بررسی در مرحله بعد",
    );
    setScore(plan?.committeeReviewScore || "");
  }, [plan]);

  if (!plan) return null;

  const toggleFolder = (folderId) => {
    if (readOnly || !setPlans) return;
    setPlans((currentPlans) =>
      currentPlans.map((item) => {
        if (item.id !== plan.id) return item;
        const hasFolder = item.folders.includes(folderId);
        return {
          ...item,
          folders: hasFolder
            ? item.folders.filter((id) => id !== folderId)
            : [...item.folders, folderId],
        };
      }),
    );
  };

  const saveFeedback = () => {
    if (readOnly || !setPlans || !feedbackText.trim()) return;

    setPlans((currentPlans) =>
      currentPlans.map((item) =>
        item.id === plan.id
          ? {
              ...item,
              committeeReviewStatus: "بررسی شده",
              committeeReviewRecommendation: recommendation,
              committeeReviewScore: score,
              committeeReviewFeedback: {
                text: feedbackText.trim(),
                createdAt: `${getCurrentSimplePersianDate()} - ثبت امروز`,
              },
            }
          : item,
      ),
    );
  };

  const deleteFeedback = () => {
    if (readOnly || !setPlans || !plan.committeeReviewFeedback) return;
    const confirmed = window.confirm("آیا از حذف بازخورد این طرح مطمئن هستید؟");
    if (!confirmed) return;

    setPlans((currentPlans) =>
      currentPlans.map((item) =>
        item.id === plan.id
          ? {
              ...item,
              committeeReviewRecommendation: "",
              committeeReviewScore: "",
              committeeReviewFeedback: null,
            }
          : item,
      ),
    );
    setFeedbackText("");
    setRecommendation("قابل بررسی در مرحله بعد");
    setScore("");
  };

  return (
    <section className="committee-dashboard__panel committee-plans__detail">
      <div className="committee-dashboard__panel-header committee-plans__detail-header">
        <div>
          <span>{readOnly ? "مشاهده پرونده" : "جزئیات طرح"}</span>
          <h3>{plan.title}</h3>
          <p>شناسه طرح: {plan.trackingId}</p>
        </div>
        <button type="button" onClick={onBack}>
          بازگشت به لیست
        </button>
      </div>

      <div className="committee-plans__detail-grid">
        <article>
          <span>فناور</span>
          <strong>{plan.innovator.name}</strong>
          <small>{plan.innovator.organization}</small>
        </article>
        <article>
          <span>حوزه</span>
          <strong>{plan.field}</strong>
          <small>{plan.call}</small>
        </article>
        <article>
          <span>تاریخ ارسال</span>
          <strong>{toPersianDigits(plan.sentAt)}</strong>
          <small>ددلاین: {toPersianDigits(plan.deadline)}</small>
        </article>
        <article>
          <span>وضعیت بررسی این کاربر</span>
          <PlanReviewStatusBadge status={plan.committeeReviewStatus} />
          {plan.committeeReviewFeedback && <small>بازخورد ثبت شده است</small>}
        </article>
      </div>

      <div className="committee-plans__review-layout">
        <div className="committee-plans__info-stack">
          <div className="committee-plans__info-card">
            <h4>اطلاعات فناور</h4>
            <dl>
              <div>
                <dt>نام</dt>
                <dd>{plan.innovator.name}</dd>
              </div>
              <div>
                <dt>موبایل</dt>
                <dd>{plan.innovator.phone}</dd>
              </div>
              <div>
                <dt>ایمیل</dt>
                <dd>{plan.innovator.email}</dd>
              </div>
            </dl>
          </div>

          {!readOnly && (
            <div className="committee-plans__info-card">
              <h4>پوشه‌های این کاربر</h4>
              <div className="committee-plans__folder-actions">
                {PLAN_FOLDERS.map((folder) => {
                  const isActive = plan.folders.includes(folder.id);
                  return (
                    <button
                      type="button"
                      key={folder.id}
                      className={
                        isActive
                          ? `committee-plans__folder-toggle committee-plans__folder-toggle--${folder.tone} committee-plans__folder-toggle--active`
                          : `committee-plans__folder-toggle committee-plans__folder-toggle--${folder.tone}`
                      }
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {isActive
                        ? `حذف از ${folder.label}`
                        : `افزودن به ${folder.label}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <a
            href={getPlanDownloadHref(plan)}
            download={plan.proposalFile}
            className="committee-plans__download-link"
          >
            دانلود پروپوزال
          </a>
        </div>

        <div className="committee-plans__feedback-card">
          <div className="committee-plans__feedback-head">
            <div>
              <span>بازخورد این کاربر</span>
              <h4>
                {readOnly
                  ? "مشاهده بازخورد"
                  : plan.committeeReviewFeedback
                    ? "ویرایش بازخورد"
                    : "ثبت بازخورد"}
              </h4>
            </div>
            {plan.committeeReviewFeedback && (
              <span
                className="committee-plans__feedback-dot"
                title="بازخورد ثبت‌شده"
                aria-label="بازخورد ثبت‌شده"
              />
            )}
          </div>

          <label>
            <span>متن بازخورد</span>
            <textarea
              value={feedbackText}
              readOnly={readOnly}
              onChange={(event) => setFeedbackText(event.target.value)}
              placeholder={
                readOnly
                  ? "بازخوردی برای این طرح ثبت نشده است."
                  : "بازخورد خود را درباره طرح وارد کنید..."
              }
            />
          </label>

          <div className="committee-plans__feedback-fields">
            <label>
              <span>پیشنهاد این کاربر</span>
              <select
                value={recommendation}
                disabled={readOnly}
                onChange={(event) => setRecommendation(event.target.value)}
              >
                <option>قابل بررسی در مرحله بعد</option>
                <option>نیازمند اصلاح</option>
                <option>دارای اولویت</option>
                <option>عدم پیشنهاد برای ادامه</option>
              </select>
            </label>
            <label>
              <span>امتیاز</span>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                disabled={readOnly}
                onChange={(event) => setScore(event.target.value)}
                placeholder="از ۰ تا ۱۰۰"
              />
            </label>
          </div>

          {plan.committeeReviewFeedback && (
            <div className="committee-plans__previous-feedback">
              <span>آخرین بازخورد</span>
              <p>{plan.committeeReviewFeedback.text}</p>
              <small>
                {toPersianDigits(plan.committeeReviewFeedback.createdAt)}
              </small>
            </div>
          )}

          {!readOnly && (
            <div className="committee-plans__feedback-actions">
              {plan.committeeReviewFeedback && (
                <button
                  type="button"
                  className="committee-plans__delete-feedback"
                  onClick={deleteFeedback}
                >
                  حذف بازخورد
                </button>
              )}
              <button
                type="button"
                className="committee-plans__save-decision"
                onClick={saveFeedback}
                disabled={!feedbackText.trim()}
              >
                {plan.committeeReviewFeedback
                  ? "ذخیره ویرایش بازخورد"
                  : "ذخیره بازخورد"}
              </button>
            </div>
          )}
          {readOnly && (
            <div className="committee-plans__readonly-note">
              این پرونده مربوط به تاریخچه است و فقط امکان مشاهده دارد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CurrentPlansPanel({ plans, setPlans }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const openPlan = (planId) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === planId &&
        normalizePlanReviewStatus(plan.committeeReviewStatus) ===
          "در انتظار بررسی"
          ? { ...plan, committeeReviewStatus: "بررسی شده" }
          : plan,
      ),
    );
    setSelectedPlanId(planId);
  };

  const toggleFolder = (planId, folderId) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        const hasFolder = plan.folders.includes(folderId);
        return {
          ...plan,
          folders: hasFolder
            ? plan.folders.filter((item) => item !== folderId)
            : [...plan.folders, folderId],
        };
      }),
    );
  };

  if (selectedPlan) {
    return (
      <PlanDetailView
        plan={selectedPlan}
        setPlans={setPlans}
        onBack={() => setSelectedPlanId(null)}
      />
    );
  }

  return (
    <section className="committee-dashboard__panel committee-plans">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>طرح‌های جاری</span>
          <h3>طرح‌های ارسال‌شده برای بررسی</h3>
          <p>
            این بخش مشابه نمای داور طراحی شده و برای مرور پرونده‌ها، پوشه‌بندی و
            ثبت بازخورد این کاربر استفاده می‌شود.
          </p>
        </div>
      </div>
      <CommitteePlanList
        plans={plans}
        mode="current"
        onOpenPlan={openPlan}
        onToggleFolder={toggleFolder}
      />
    </section>
  );
}

function FinalDecisionPanel({
  plans,
  setPlans,
  resultsPublished,
  setResultsPublished,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [finalStatus, setFinalStatus] = useState("قبول");
  const [notice, setNotice] = useState("");
  const [filteredDecisionContext, setFilteredDecisionContext] = useState({
    planIds: [],
    statusLabel: "همه",
    statusFilter: "all",
  });

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const allPlansFinalized = plans.every((plan) => Boolean(plan.finalStatus));

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedPlan) return;
    setFeedbackText(selectedPlan.committeeFeedback || "");
    setFinalStatus(selectedPlan.finalStatus || "قبول");
  }, [selectedPlan]);

  const openDecision = (planId, context = {}) => {
    const plan = plans.find((item) => item.id === planId);
    setSelectedPlanId(planId);
    setFeedbackText(plan?.committeeFeedback || "");
    setFinalStatus(plan?.finalStatus || "قبول");
    setFilteredDecisionContext({
      planIds: context.planIds || plans.map((item) => item.id),
      statusLabel: context.statusLabel || "همه",
      statusFilter: context.statusFilter || "all",
    });
  };

  const closeDecision = () => {
    setSelectedPlanId(null);
    setFeedbackText("");
    setFinalStatus("قبول");
  };

  const saveDecision = () => {
    if (!selectedPlan) return;
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
              committeeFeedback: feedbackText.trim(),
              finalStatus,
              finalStatusDate: getCurrentSimplePersianDate(),
              resultsPublished: false,
            }
          : plan,
      ),
    );
    setNotice("وضعیت نهایی و بازخورد دبیرخانه و کمیته راهبری ذخیره شد.");
  };

  const publishResults = () => {
    if (!allPlansFinalized) return;
    const confirmed = window.confirm(
      "بعد از انتشار نتایج، وضعیت نهایی برای فناوران قابل مشاهده می‌شود. آیا مطمئن هستید؟",
    );
    if (!confirmed) return;

    setPlans((currentPlans) =>
      currentPlans.map((plan) => ({ ...plan, resultsPublished: true })),
    );
    setResultsPublished(true);
    setNotice("نتایج نهایی برای فناوران منتشر شد.");
  };

  const currentIndex = selectedPlan
    ? filteredDecisionContext.planIds.indexOf(selectedPlan.id)
    : -1;
  const nextPlanId =
    currentIndex >= 0
      ? filteredDecisionContext.planIds[currentIndex + 1]
      : undefined;
  const nextButtonLabel = `طرح بعدی در ${filteredDecisionContext.statusLabel}`;

  if (selectedPlan) {
    return (
      <section className="committee-dashboard__panel committee-plans__detail">
        <div className="committee-dashboard__panel-header committee-plans__detail-header">
          <div>
            <span>تعیین وضعیت نهایی</span>
            <h3>{selectedPlan.title}</h3>
            <p>شناسه طرح: {selectedPlan.trackingId}</p>
          </div>
          <button type="button" onClick={closeDecision}>
            بازگشت به لیست
          </button>
        </div>

        {notice && (
          <div className="committee-dashboard__success-message">{notice}</div>
        )}

        <div className="committee-plans__detail-grid">
          <article>
            <span>فناور</span>
            <strong>{selectedPlan.innovator.name}</strong>
            <small>{selectedPlan.innovator.organization}</small>
          </article>
          <article>
            <span>حوزه</span>
            <strong>{selectedPlan.field}</strong>
            <small>{selectedPlan.call}</small>
          </article>
          <article>
            <span>تاریخ ارسال</span>
            <strong>{toPersianDigits(selectedPlan.sentAt)}</strong>
            <small>ددلاین: {toPersianDigits(selectedPlan.deadline)}</small>
          </article>
          <article>
            <span>وضعیت نهایی فعلی</span>
            <FinalPlanStatusBadge status={selectedPlan.finalStatus} />
            <small>
              {selectedPlan.resultsPublished
                ? "منتشر شده برای فناور"
                : "هنوز منتشر نشده"}
            </small>
          </article>
        </div>

        <div className="committee-plans__review-layout">
          <div className="committee-plans__info-stack">
            <div className="committee-plans__info-card">
              <h4>اطلاعات طرح</h4>
              <dl>
                <div>
                  <dt>فراخوان</dt>
                  <dd>{selectedPlan.call}</dd>
                </div>
                <div>
                  <dt>ارسال</dt>
                  <dd>{toPersianDigits(selectedPlan.sentAt)}</dd>
                </div>
                <div>
                  <dt>ددلاین</dt>
                  <dd>{toPersianDigits(selectedPlan.deadline)}</dd>
                </div>
              </dl>
            </div>
            <a
              href={getPlanDownloadHref(selectedPlan)}
              download={selectedPlan.proposalFile}
              className="committee-plans__download-link"
            >
              دانلود پروپوزال
            </a>
          </div>

          <div className="committee-plans__feedback-card">
            <div className="committee-plans__feedback-head">
              <div>
                <span>بازخورد دبیرخانه و کمیته راهبری</span>
                <h4>ثبت جمع‌بندی نهایی</h4>
              </div>
            </div>
            <label>
              <span>متن بازخورد</span>
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                placeholder="جمع‌بندی دبیرخانه و کمیته راهبری درباره طرح را وارد کنید..."
              />
            </label>
            <label>
              <span>اعلام وضعیت نهایی</span>
              <select
                value={finalStatus}
                onChange={(event) => setFinalStatus(event.target.value)}
              >
                {FINAL_PLAN_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <div className="committee-plans__decision-actions">
              <button
                type="button"
                className="committee-plans__save-decision"
                onClick={saveDecision}
                disabled={!feedbackText.trim()}
              >
                ذخیره وضعیت نهایی
              </button>
              <button
                type="button"
                className="committee-plans__next-plan-button"
                disabled={!nextPlanId}
                onClick={() =>
                  nextPlanId &&
                  openDecision(nextPlanId, filteredDecisionContext)
                }
              >
                {nextPlanId ? nextButtonLabel : `${nextButtonLabel} وجود ندارد`}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="committee-dashboard__panel committee-plans">
      <div className="committee-dashboard__panel-header committee-plans__publish-header">
        <div>
          <span>تعیین وضعیت نهایی</span>
          <h3>جمع‌بندی و اعلام نتیجه طرح‌ها</h3>
          <p>
            برای هر طرح یک بازخورد دبیرخانه و کمیته راهبری و یک وضعیت نهایی ثبت
            کنید.
          </p>
        </div>
        <button
          type="button"
          className={
            resultsPublished
              ? "committee-plans__publish-results committee-plans__publish-results--published"
              : "committee-plans__publish-results"
          }
          disabled={!allPlansFinalized || resultsPublished}
          onClick={publishResults}
          title={
            resultsPublished
              ? "نتایج قبلاً منتشر شده است"
              : !allPlansFinalized
                ? "همه طرح‌ها باید وضعیت نهایی داشته باشند"
                : "انتشار نتایج برای فناوران"
          }
        >
          {resultsPublished
            ? "نتایج قبلاً منتشر شده"
            : "انتشار نتایج برای فناوران"}
        </button>
      </div>

      {!allPlansFinalized && (
        <div className="committee-plans__warning">
          تا زمانی که وضعیت نهایی همه طرح‌ها مشخص نشود، امکان انتشار نتایج برای
          فناوران فعال نیست.
        </div>
      )}

      {resultsPublished && (
        <div className="committee-dashboard__success-message">
          نتایج این دوره قبلاً برای فناوران منتشر شده است.
        </div>
      )}
      {notice && (
        <div className="committee-dashboard__success-message">{notice}</div>
      )}

      <CommitteePlanList
        plans={plans}
        mode="final"
        onOpenDecision={openDecision}
      />
    </section>
  );
}

function AcceptedPlansPanel({ plans }) {
  const acceptedPlans = plans.filter((plan) =>
    ["قبول", "قبول ضعیف"].includes(plan.finalStatus),
  );
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [viewingPlanId, setViewingPlanId] = useState(null);
  const [tasksByPlan, setTasksByPlan] = useState(INITIAL_ACCEPTED_PLAN_TASKS);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    deadlineDate: "",
    deadlineTime: "",
    managerMessage: "",
  });
  const [taskFeedback, setTaskFeedback] = useState("");
  const [taskDecision, setTaskDecision] = useState("نیازمند اصلاح");
  const [taskEdit, setTaskEdit] = useState({
    deadlineDate: "",
    deadlineTime: "",
    managerMessage: "",
  });
  const [notice, setNotice] = useState("");

  const selectedPlan = acceptedPlans.find((plan) => plan.id === selectedPlanId);
  const viewingPlan = acceptedPlans.find((plan) => plan.id === viewingPlanId);
  const selectedPlanTasks = selectedPlan
    ? tasksByPlan[selectedPlan.id] || []
    : [];
  const selectedTask = selectedPlanTasks.find(
    (task) => task.id === selectedTaskId,
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedTask) return;
    const deadlineParts = splitAcceptedTaskDeadline(selectedTask.deadline);
    setTaskFeedback("");
    setTaskDecision(
      selectedTask.managerDecision === "پایان یافته"
        ? "پایان یافته"
        : "نیازمند اصلاح",
    );
    setTaskEdit({
      deadlineDate: deadlineParts.deadlineDate,
      deadlineTime: deadlineParts.deadlineTime,
      managerMessage: selectedTask.managerMessage || "",
    });
  }, [selectedTask]);

  const openPlan = (planId) => {
    setViewingPlanId(null);
    setSelectedPlanId(planId);
    setSelectedTaskId(null);
    setIsCreatingTask(false);
    setNotice("");
  };

  const openPlanView = (planId) => {
    setSelectedPlanId(null);
    setSelectedTaskId(null);
    setIsCreatingTask(false);
    setNotice("");
    setViewingPlanId(planId);
  };

  const closePlan = () => {
    setSelectedPlanId(null);
    setSelectedTaskId(null);
    setViewingPlanId(null);
    setIsCreatingTask(false);
    setNotice("");
  };

  const updateTask = (planId, taskId, updates) => {
    setTasksByPlan((currentTasks) => ({
      ...currentTasks,
      [planId]: (currentTasks[planId] || []).map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const createTask = (event) => {
    event.preventDefault();
    if (
      !selectedPlan ||
      !newTask.title.trim() ||
      !newTask.managerMessage.trim()
    )
      return;

    const task = createAcceptedTask(
      newTask.title,
      newTask.deadlineDate,
      newTask.deadlineTime,
      newTask.managerMessage,
    );

    setTasksByPlan((currentTasks) => ({
      ...currentTasks,
      [selectedPlan.id]: [task, ...(currentTasks[selectedPlan.id] || [])],
    }));

    setNewTask({
      title: "",
      deadlineDate: "",
      deadlineTime: "",
      managerMessage: "",
    });
    setIsCreatingTask(false);
    setNotice("وظیفه جدید برای فناور ثبت شد.");
  };

  const openTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsCreatingTask(false);
  };

  const saveTaskMeta = () => {
    if (!selectedPlan || !selectedTask || isAcceptedTaskFinished(selectedTask))
      return;

    updateTask(selectedPlan.id, selectedTask.id, {
      deadline: buildAcceptedTaskDeadline(
        taskEdit.deadlineDate,
        taskEdit.deadlineTime,
      ),
      managerMessage: taskEdit.managerMessage.trim(),
    });
    setNotice("ددلاین و پیام وظیفه به‌روزرسانی شد.");
  };

  const saveTaskReview = () => {
    if (
      !selectedPlan ||
      !selectedTask ||
      selectedTask.participantStatus !== "پاسخ داده شده" ||
      !taskFeedback.trim() ||
      isAcceptedTaskFinished(selectedTask)
    )
      return;

    if (taskDecision === "پایان یافته") {
      const confirmed = window.confirm(
        "با ثبت وضعیت پایان یافته، این وظیفه دیگر قابل تغییر نخواهد بود. آیا مطمئن هستید؟",
      );
      if (!confirmed) return;
    }

    updateTask(selectedPlan.id, selectedTask.id, {
      managerFeedback: taskFeedback.trim(),
      managerDecision: taskDecision,
      participantStatus:
        taskDecision === "پایان یافته"
          ? "پایان یافته"
          : "در انتظار بررسی فناور",
      reviewedAt: getCurrentSimplePersianDate(),
    });
    setTaskFeedback("");
    setNotice("بازخورد و وضعیت وظیفه ثبت شد.");
  };

  const getTaskCounts = (planId) => {
    const tasks = tasksByPlan[planId] || [];
    return {
      all: tasks.length,
      waiting: tasks.filter(
        (task) => task.participantStatus === "در انتظار بررسی فناور",
      ).length,
      seen: tasks.filter((task) => task.participantStatus === "مشاهده شده")
        .length,
      answered: tasks.filter(
        (task) => task.participantStatus === "پاسخ داده شده",
      ).length,
      undecided: tasks.filter(
        (task) =>
          task.participantStatus === "پاسخ داده شده" && !task.managerDecision,
      ).length,
    };
  };

  if (viewingPlan) {
    return (
      <PlanDetailView
        plan={viewingPlan}
        onBack={() => setViewingPlanId(null)}
        readOnly
      />
    );
  }

  if (selectedPlan && selectedTask) {
    const displayTaskStatus = getAcceptedTaskDisplayStatus(selectedTask);
    const isTaskFinished = isAcceptedTaskFinished(selectedTask);
    const canReview =
      selectedTask.participantStatus === "پاسخ داده شده" && !isTaskFinished;

    return (
      <section className="committee-dashboard__panel accepted-projects accepted-projects__task-detail">
        <div className="committee-dashboard__panel-header committee-plans__detail-header">
          <div>
            <span>بررسی وظیفه</span>
            <h3>{selectedTask.title}</h3>
            <p>{selectedPlan.title}</p>
          </div>
          <button type="button" onClick={() => setSelectedTaskId(null)}>
            بازگشت به وظایف
          </button>
        </div>

        {notice && (
          <div className="committee-dashboard__success-message">{notice}</div>
        )}

        <div className="accepted-projects__task-summary">
          <article>
            <span>ددلاین</span>
            <strong>
              {selectedTask.deadline
                ? toPersianDigits(selectedTask.deadline)
                : "بدون ددلاین"}
            </strong>
          </article>
          <article>
            <span>وضعیت مشاهده/پاسخ فناور</span>
            <AcceptedTaskStatusBadge status={displayTaskStatus} />
          </article>
          <article>
            <span>وضعیت بررسی مدیر</span>
            <AcceptedTaskStatusBadge
              status={selectedTask.managerDecision || "در انتظار تعیین تکلیف"}
            />
          </article>
        </div>

        {!isTaskFinished ? (
          <div className="accepted-projects__edit-task">
            <div className="accepted-projects__toolbar accepted-projects__toolbar--compact">
              <div>
                <h4>ویرایش ددلاین و پیام وظیفه</h4>
                <p>
                  تا قبل از پایان یافتن وظیفه، امکان اصلاح پیام مدیر و ددلاین
                  وجود دارد.
                </p>
              </div>
              <button
                type="button"
                onClick={saveTaskMeta}
                disabled={!taskEdit.managerMessage.trim()}
              >
                ذخیره تغییرات وظیفه
              </button>
            </div>
            <div className="accepted-projects__form-grid">
              <label>
                <span>تاریخ ددلاین</span>
                <input
                  value={taskEdit.deadlineDate}
                  onChange={(event) =>
                    setTaskEdit((current) => ({
                      ...current,
                      deadlineDate: event.target.value,
                    }))
                  }
                  placeholder="1405/04/15"
                />
              </label>
              <label>
                <span>ساعت ددلاین</span>
                <input
                  value={taskEdit.deadlineTime}
                  onChange={(event) =>
                    setTaskEdit((current) => ({
                      ...current,
                      deadlineTime: event.target.value,
                    }))
                  }
                  placeholder="18:00"
                />
              </label>
              <label className="accepted-projects__form-full">
                <span>پیام مدیر برای فناور</span>
                <textarea
                  value={taskEdit.managerMessage}
                  onChange={(event) =>
                    setTaskEdit((current) => ({
                      ...current,
                      managerMessage: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="committee-plans__readonly-note">
            این وظیفه پایان یافته است و امکان ویرایش ددلاین، پیام یا وضعیت آن
            وجود ندارد.
          </div>
        )}

        <div className="accepted-projects__task-grid">
          <div className="accepted-projects__box">
            <span>پیام ثبت‌شده برای فناور</span>
            <p>{selectedTask.managerMessage}</p>
          </div>
          <div className="accepted-projects__box accepted-projects__box--response">
            <span>پاسخ فناور</span>
            <p>
              {selectedTask.userDescription ||
                "هنوز پاسخی از طرف فناور ثبت نشده است."}
            </p>
            {selectedTask.userFileName ? (
              <a
                className="accepted-projects__file-download"
                href={getAcceptedTaskFileHref(selectedTask)}
                download={selectedTask.userFileName}
              >
                دانلود فایل ارسالی: {selectedTask.userFileName}
              </a>
            ) : (
              <strong>فایلی بارگذاری نشده است</strong>
            )}
          </div>
        </div>

        <div className="accepted-projects__review-card">
          <div>
            <span>بازخورد مدیر به فناور</span>
            <h4>تعیین تکلیف پاسخ وظیفه</h4>
          </div>

          {selectedTask.managerFeedback && (
            <div className="accepted-projects__feedback-display">
              <span>بازخورد ثبت‌شده</span>
              <p>{selectedTask.managerFeedback}</p>
              {selectedTask.reviewedAt && (
                <small>ثبت در {toPersianDigits(selectedTask.reviewedAt)}</small>
              )}
            </div>
          )}

          {!canReview && !isTaskFinished && (
            <div className="committee-plans__warning">
              تا زمانی که فناور پاسخ ندهد، امکان ثبت بازخورد و تعیین وضعیت نهایی
              وظیفه فعال نیست.
            </div>
          )}

          {isTaskFinished && (
            <div className="committee-plans__readonly-note">
              وضعیت این وظیفه پایان یافته است و ثبت بازخورد جدید برای آن غیرفعال
              است.
            </div>
          )}

          <label>
            <span>متن بازخورد جدید</span>
            <textarea
              value={taskFeedback}
              disabled={!canReview}
              onChange={(event) => setTaskFeedback(event.target.value)}
              placeholder={
                selectedTask.managerFeedback
                  ? "در صورت نیاز بازخورد جدید را وارد کنید..."
                  : "بازخورد خود را درباره پاسخ فناور وارد کنید..."
              }
            />
          </label>
          <label>
            <span>وضعیت نهایی وظیفه</span>
            <select
              value={taskDecision}
              disabled={!canReview}
              onChange={(event) => setTaskDecision(event.target.value)}
            >
              <option>نیازمند اصلاح</option>
              <option>پایان یافته</option>
            </select>
          </label>
          <button
            type="button"
            className="committee-plans__save-decision"
            disabled={!canReview || !taskFeedback.trim()}
            onClick={saveTaskReview}
          >
            ثبت بازخورد و وضعیت وظیفه
          </button>
        </div>
      </section>
    );
  }

  if (selectedPlan) {
    const counts = getTaskCounts(selectedPlan.id);
    return (
      <section className="committee-dashboard__panel accepted-projects">
        <div className="committee-dashboard__panel-header committee-plans__detail-header">
          <div>
            <span>صفحه طرح</span>
            <h3>{selectedPlan.title}</h3>
            <p>تعریف وظیفه برای فناور و بررسی پاسخ‌های ارسالی</p>
          </div>
          <button type="button" onClick={closePlan}>
            بازگشت به طرح‌های قبول‌شده
          </button>
        </div>

        {notice && (
          <div className="committee-dashboard__success-message">{notice}</div>
        )}

        <div className="accepted-projects__summary">
          <article>
            <span>وضعیت طرح</span>
            <FinalPlanStatusBadge status={selectedPlan.finalStatus} />
          </article>
          <article>
            <span>همه وظایف</span>
            <strong>{toPersianDigits(counts.all)} وظیفه</strong>
          </article>
          <article>
            <span>پاسخ داده شده</span>
            <strong>{toPersianDigits(counts.answered)} مورد</strong>
          </article>
          <article>
            <span>نیازمند بررسی</span>
            <strong>{toPersianDigits(counts.undecided)} مورد</strong>
          </article>
        </div>

        {!isCreatingTask ? (
          <div className="accepted-projects__toolbar">
            <div>
              <h4>وظایف تعریف‌شده برای فناور</h4>
              <p>
                در این بخش می‌توانید وظیفه جدید بسازید یا پاسخ‌های ارسال‌شده را
                بررسی کنید.
              </p>
            </div>
            <button type="button" onClick={() => setIsCreatingTask(true)}>
              ساخت وظیفه جدید
            </button>
          </div>
        ) : (
          <form
            className="accepted-projects__create-task"
            onSubmit={createTask}
          >
            <div className="accepted-projects__toolbar">
              <div>
                <h4>ساخت وظیفه جدید</h4>
                <p>تیتر، ددلاین و پیام وظیفه برای فناور ثبت می‌شود.</p>
              </div>
              <button type="button" onClick={() => setIsCreatingTask(false)}>
                انصراف
              </button>
            </div>
            <div className="accepted-projects__form-grid">
              <label>
                <span>تیتر وظیفه</span>
                <input
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>تاریخ ددلاین</span>
                <input
                  value={newTask.deadlineDate}
                  onChange={(event) =>
                    setNewTask((current) => ({
                      ...current,
                      deadlineDate: event.target.value,
                    }))
                  }
                  placeholder="1405/04/15"
                />
              </label>
              <label>
                <span>ساعت ددلاین</span>
                <input
                  value={newTask.deadlineTime}
                  onChange={(event) =>
                    setNewTask((current) => ({
                      ...current,
                      deadlineTime: event.target.value,
                    }))
                  }
                  placeholder="18:00"
                />
              </label>
              <label className="accepted-projects__form-full">
                <span>پیام وظیفه</span>
                <textarea
                  value={newTask.managerMessage}
                  onChange={(event) =>
                    setNewTask((current) => ({
                      ...current,
                      managerMessage: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button
              type="submit"
              className="committee-plans__save-decision"
              disabled={!newTask.title.trim() || !newTask.managerMessage.trim()}
            >
              ثبت وظیفه
            </button>
          </form>
        )}

        <div className="accepted-projects__tasks-grid">
          {selectedPlanTasks.length ? (
            selectedPlanTasks.map((task, index) => {
              const taskStatus = getAcceptedTaskDisplayStatus(task);
              return (
                <article className="accepted-projects__task-card" key={task.id}>
                  <div className="accepted-projects__task-card-top">
                    <div className="accepted-projects__task-title">
                      <span className="accepted-projects__task-order">
                        {toPersianDigits(String(index + 1))}
                      </span>
                      <h4>{task.title}</h4>
                    </div>
                    <AcceptedTaskStatusBadge status={taskStatus} />
                  </div>
                  <p>{task.managerMessage}</p>
                  <div className="accepted-projects__task-meta">
                    <span>
                      ددلاین:{" "}
                      {task.deadline
                        ? toPersianDigits(task.deadline)
                        : "بدون ددلاین"}
                    </span>
                    <span className="accepted-projects__task-meta-status">
                      <b>وضعیت بررسی:</b>
                      <AcceptedTaskStatusBadge
                        status={task.managerDecision || "در انتظار تعیین تکلیف"}
                      />
                    </span>
                  </div>
                  <button type="button" onClick={() => openTask(task.id)}>
                    {taskStatus === "پاسخ داده شده"
                      ? "بررسی پاسخ"
                      : "مشاهده وظیفه"}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="committee-plans__warning">
              هنوز وظیفه‌ای برای این طرح تعریف نشده است.
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="committee-dashboard__panel accepted-projects">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>طرح‌های قبول شده</span>
          <h3>طرح‌های آماده ورود به مسیر اجرا</h3>
          <p>
            طرح‌هایی که وضعیت نهایی آن‌ها قبول یا قبول ضعیف است، در این بخش برای
            تعریف وظایف فناور نمایش داده می‌شوند.
          </p>
        </div>
      </div>

      <div className="committee-plans__list">
        {acceptedPlans.length ? (
          acceptedPlans.map((plan) => {
            const counts = getTaskCounts(plan.id);
            return (
              <article className="committee-plan-card" key={plan.id}>
                <div className="committee-plan-card__id">
                  <span>شناسه</span>
                  <strong>{plan.trackingId}</strong>
                </div>
                <div className="committee-plan-card__info">
                  <div className="committee-plan-card__title-row">
                    <h4>{plan.title}</h4>
                  </div>
                  <p>{plan.call}</p>
                  <div className="committee-plan-card__meta">
                    <span>فناور: {plan.innovator.name}</span>
                    <span>تعداد وظایف: {toPersianDigits(counts.all)}</span>
                    <span>
                      پاسخ‌های نیازمند بررسی:{" "}
                      {toPersianDigits(counts.undecided)}
                    </span>
                  </div>
                </div>
                <FinalPlanStatusBadge status={plan.finalStatus} />
                <div className="committee-plan-card__actions">
                  <button type="button" onClick={() => openPlanView(plan.id)}>
                    مشاهده پرونده
                  </button>
                  <button type="button" onClick={() => openPlan(plan.id)}>
                    ورود به طرح
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="committee-plans__warning">
            فعلاً طرحی با وضعیت قبول یا قبول ضعیف ثبت نشده است.
          </div>
        )}
      </div>
    </section>
  );
}

function PlansHistoryPanel({ plans }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  if (selectedPlan) {
    return (
      <PlanDetailView
        plan={selectedPlan}
        onBack={() => setSelectedPlanId(null)}
        readOnly
      />
    );
  }

  return (
    <section className="committee-dashboard__panel committee-plans">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>تاریخچه طرح‌ها</span>
          <h3>مرور همه طرح‌های تعیین‌تکلیف‌شده</h3>
          <p>
            همه طرح‌های گذشته در این بخش فقط قابل مشاهده هستند و امکان ویرایش یا
            ثبت بازخورد ندارند.
          </p>
        </div>
      </div>
      <CommitteePlanList
        plans={plans}
        mode="history"
        onOpenPlan={setSelectedPlanId}
      />
    </section>
  );
}

function ReviewersInfoPanel({ plans }) {
  const [searchTerm, setSearchTerm] = useState("");

  const reviewerStats = REVIEWER_PROFILES.map((reviewer, index) => ({
    ...reviewer,
    stats: getReviewerParticipationStats(reviewer, index, plans),
  }));

  const filteredReviewers = reviewerStats.filter((reviewer) => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return true;
    return (
      reviewer.name.toLowerCase().includes(normalized) ||
      reviewer.role.toLowerCase().includes(normalized) ||
      reviewer.specialty.toLowerCase().includes(normalized) ||
      reviewer.email.toLowerCase().includes(normalized)
    );
  });

  const totals = reviewerStats.reduce(
    (summary, reviewer) => ({
      reviewedPlans: summary.reviewedPlans + reviewer.stats.reviewedPlans,
      feedbacks: summary.feedbacks + reviewer.stats.feedbacks,
      remainingPlans: summary.remainingPlans + reviewer.stats.remainingPlans,
      assignedPlans: summary.assignedPlans + reviewer.stats.assignedPlans,
    }),
    { reviewedPlans: 0, feedbacks: 0, remainingPlans: 0, assignedPlans: 0 },
  );

  return (
    <section className="committee-dashboard__panel committee-reviewers">
      <div className="committee-dashboard__panel-header committee-reviewers__header">
        <div>
          <span>اطلاعات داوران</span>
          <h3>فهرست داوران و آمار مشارکت</h3>
          <p>
            اطلاعات کاربری داوران، حوزه تخصصی و وضعیت مشارکت آن‌ها در بررسی
            طرح‌ها را ببینید.
          </p>
        </div>
        <label className="committee-reviewers__search">
          <span>جستجوی داور</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="نام، ایمیل یا حوزه تخصصی..."
          />
        </label>
      </div>

      <div className="committee-reviewers__summary-grid">
        <article>
          <span>تعداد داوران</span>
          <strong>{toPersianDigits(REVIEWER_PROFILES.length)}</strong>
          <p>اعضای فعال شبکه داوری</p>
        </article>
        <article>
          <span>طرح‌های بررسی‌شده</span>
          <strong>{toPersianDigits(totals.reviewedPlans)}</strong>
          <p>مجموع طرح‌هایی که حداقل یک بازخورد گرفته‌اند</p>
        </article>
        <article>
          <span>بازخوردهای ثبت‌شده</span>
          <strong>{toPersianDigits(totals.feedbacks)}</strong>
          <p>کل بازخوردهای ثبت‌شده توسط داوران</p>
        </article>
        <article>
          <span>طرح‌های باقی‌مانده</span>
          <strong>{toPersianDigits(totals.remainingPlans)}</strong>
          <p>طرح‌های اختصاص‌یافته اما بدون بازخورد</p>
        </article>
      </div>

      <div className="committee-reviewers__cards">
        {filteredReviewers.map((reviewer) => (
          <article key={reviewer.id} className="committee-reviewers__card">
            <div className="committee-reviewers__profile">
              <span className="committee-reviewers__avatar">
                {reviewer.name.slice(0, 1)}
              </span>
              <div>
                <h4>{reviewer.name}</h4>
                <p>{reviewer.role}</p>
                <small>{reviewer.organization}</small>
              </div>
            </div>

            <dl className="committee-reviewers__info-list">
              <div>
                <dt>حوزه تخصصی</dt>
                <dd>{reviewer.specialty}</dd>
              </div>
              <div>
                <dt>ایمیل</dt>
                <dd dir="ltr">{reviewer.email}</dd>
              </div>
              <div>
                <dt>موبایل</dt>
                <dd dir="ltr">{reviewer.phone}</dd>
              </div>
            </dl>

            <div className="committee-reviewers__stats-row">
              <div>
                <span>طرح بررسی‌شده</span>
                <strong>{toPersianDigits(reviewer.stats.reviewedPlans)}</strong>
              </div>
              <div>
                <span>بازخورد</span>
                <strong>{toPersianDigits(reviewer.stats.feedbacks)}</strong>
              </div>
              <div>
                <span>باقی‌مانده</span>
                <strong>
                  {toPersianDigits(reviewer.stats.remainingPlans)}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewerFeedbacksPanel({ plans }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const feedbackPlans = plans
    .map((plan) => ({
      ...plan,
      reviewerFeedbacks: getReviewerFeedbackItems(plan),
    }))
    .filter((plan) => plan.reviewerFeedbacks.length > 0);

  const fields = [...new Set(feedbackPlans.map((plan) => plan.field))];

  const filteredPlans = feedbackPlans.filter((plan) => {
    const normalized = searchTerm.trim().toLowerCase();
    const matchesField = fieldFilter === "all" || plan.field === fieldFilter;
    const matchesSearch =
      !normalized ||
      plan.title.toLowerCase().includes(normalized) ||
      plan.trackingId.toLowerCase().includes(normalized) ||
      plan.innovator.name.toLowerCase().includes(normalized) ||
      plan.call.toLowerCase().includes(normalized);

    return matchesField && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPagePlans = filteredPlans.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const resetPage = () => setCurrentPage(1);

  return (
    <section className="committee-dashboard__panel committee-reviewer-feedbacks">
      <div className="committee-dashboard__panel-header committee-reviewer-feedbacks__header">
        <div>
          <span>بازخوردهای داوران</span>
          <h3>طرح‌های دارای بازخورد داور</h3>
          <p>
            هر طرحی که حداقل یک بازخورد دارد در این بخش نمایش داده می‌شود؛ ممکن
            است هر طرح تا پنج بازخورد داور داشته باشد.
          </p>
        </div>
      </div>

      <div className="committee-reviewer-feedbacks__toolbar committee-reviewer-feedbacks__toolbar--with-size">
        <label>
          <span>جستجو</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPage();
            }}
            placeholder="شناسه، عنوان، فناور یا فراخوان..."
          />
        </label>
        <label>
          <span>حوزه</span>
          <select
            value={fieldFilter}
            onChange={(event) => {
              setFieldFilter(event.target.value);
              resetPage();
            }}
          >
            <option value="all">همه حوزه‌ها</option>
            {fields.map((field) => (
              <option value={field} key={field}>
                {field}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>تعداد نمایش</span>
          <select
            value={itemsPerPage}
            onChange={(event) => {
              setItemsPerPage(Number(event.target.value));
              resetPage();
            }}
          >
            <option value={10}>۱۰ عدد</option>
            <option value={20}>۲۰ عدد</option>
            <option value={50}>۵۰ عدد</option>
            <option value={100}>۱۰۰ عدد</option>
          </select>
        </label>
      </div>

      <div className="committee-reviewer-feedbacks__list">
        {currentPagePlans.map((plan) => (
          <article key={plan.id} className="committee-reviewer-feedbacks__plan">
            <div className="committee-reviewer-feedbacks__plan-head">
              <div>
                <span>{plan.trackingId}</span>
                <h4>{plan.title}</h4>
                <p>
                  {plan.call} / حوزه: {plan.field} / فناور:{" "}
                  {plan.innovator.name}
                </p>
              </div>
              <strong>
                {toPersianDigits(plan.reviewerFeedbacks.length)} بازخورد
              </strong>
            </div>

            <div className="committee-reviewer-feedbacks__grid">
              {plan.reviewerFeedbacks.map((feedback, index) => (
                <div
                  key={feedback.id}
                  className="committee-reviewer-feedbacks__item"
                >
                  <div className="committee-reviewer-feedbacks__reviewer">
                    <span>{toPersianDigits(index + 1)}</span>
                    <div>
                      <h5>{feedback.reviewerName}</h5>
                      <small>{feedback.reviewerRole}</small>
                    </div>
                  </div>
                  <p>{feedback.text}</p>
                  <div className="committee-reviewer-feedbacks__meta">
                    <span>امتیاز: {toPersianDigits(feedback.score)}</span>
                    <span>{feedback.recommendation}</span>
                    <span>{toPersianDigits(feedback.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="committee-reviewer-feedbacks__pagination">
        <span>
          نمایش {toPersianDigits(currentPagePlans.length)} طرح از{" "}
          {toPersianDigits(filteredPlans.length)} مورد
        </span>
        <div>
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            قبلی
          </button>
          <strong>
            صفحه {toPersianDigits(safeCurrentPage)} از{" "}
            {toPersianDigits(totalPages)}
          </strong>
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            بعدی
          </button>
        </div>
      </div>
    </section>
  );
}

function BusinessPartnersInfoPanel() {
  const [searchTerm, setSearchTerm] = useState("");

  const totals = BUSINESS_PARTNERS.reduce(
    (summary, partner) => ({
      viewedOpportunities:
        summary.viewedOpportunities + partner.viewedOpportunities,
      favoriteOpportunities:
        summary.favoriteOpportunities + partner.favoriteOpportunities,
      collaborationRequests:
        summary.collaborationRequests + partner.collaborationRequests,
      activeCollaborations:
        summary.activeCollaborations + partner.activeCollaborations,
    }),
    {
      viewedOpportunities: 0,
      favoriteOpportunities: 0,
      collaborationRequests: 0,
      activeCollaborations: 0,
    },
  );

  const filteredPartners = BUSINESS_PARTNERS.filter((partner) => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return true;
    return (
      partner.name.toLowerCase().includes(normalized) ||
      partner.organization.toLowerCase().includes(normalized) ||
      partner.field.toLowerCase().includes(normalized) ||
      partner.email.toLowerCase().includes(normalized)
    );
  });

  return (
    <section className="committee-dashboard__panel committee-business-partners">
      <div className="committee-dashboard__panel-header committee-business-partners__header">
        <div>
          <span>اطلاعات همکاران تجاری</span>
          <h3>فهرست همکاران تجاری و آمار مشارکت</h3>
          <p>
            اطلاعات کاربری، حوزه همکاری و آمار تعامل همکاران تجاری با موقعیت‌های
            تجاری را مشاهده کنید.
          </p>
        </div>
        <label className="committee-business-partners__search">
          <span>جستجوی همکار</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="نام، سازمان، حوزه یا ایمیل..."
          />
        </label>
      </div>

      <div className="committee-business-partners__summary-grid">
        <article>
          <span>تعداد همکاران</span>
          <strong>{toPersianDigits(BUSINESS_PARTNERS.length)}</strong>
          <p>همکاران تجاری ثبت‌شده در سامانه</p>
        </article>
        <article>
          <span>موقعیت‌های مشاهده‌شده</span>
          <strong>{toPersianDigits(totals.viewedOpportunities)}</strong>
          <p>مجموع بازدید از موقعیت‌های تجاری</p>
        </article>
        <article>
          <span>درخواست‌های همکاری</span>
          <strong>{toPersianDigits(totals.collaborationRequests)}</strong>
          <p>کل درخواست‌های ثبت‌شده توسط همکاران</p>
        </article>
        <article>
          <span>همکاری‌های فعال</span>
          <strong>{toPersianDigits(totals.activeCollaborations)}</strong>
          <p>درخواست‌هایی که وارد مرحله پیگیری شده‌اند</p>
        </article>
      </div>

      <div className="committee-business-partners__cards">
        {filteredPartners.map((partner) => (
          <article
            key={partner.id}
            className="committee-business-partners__card"
          >
            <div className="committee-business-partners__profile">
              <span className="committee-business-partners__avatar">
                {partner.name.slice(0, 1)}
              </span>
              <div>
                <h4>{partner.name}</h4>
                <p>{partner.role}</p>
                <small>{partner.organization}</small>
              </div>
            </div>

            <dl className="committee-business-partners__info-list">
              <div>
                <dt>حوزه همکاری</dt>
                <dd>{partner.field}</dd>
              </div>
              <div>
                <dt>ایمیل</dt>
                <dd dir="ltr">{partner.email}</dd>
              </div>
              <div>
                <dt>موبایل</dt>
                <dd dir="ltr">{partner.phone}</dd>
              </div>
              <div>
                <dt>عضویت</dt>
                <dd>{partner.joinedAt}</dd>
              </div>
            </dl>

            <div className="committee-business-partners__stats-row">
              <div>
                <span>مشاهده</span>
                <strong>{toPersianDigits(partner.viewedOpportunities)}</strong>
              </div>
              <div>
                <span>علاقه‌مندی</span>
                <strong>
                  {toPersianDigits(partner.favoriteOpportunities)}
                </strong>
              </div>
              <div>
                <span>درخواست همکاری</span>
                <strong>
                  {toPersianDigits(partner.collaborationRequests)}
                </strong>
              </div>
              <div>
                <span>فعال</span>
                <strong>{toPersianDigits(partner.activeCollaborations)}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BusinessCollaborationRequestsPanel() {
  const [requests, setRequests] = useState(
    INITIAL_BUSINESS_COLLABORATION_REQUESTS,
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );
  const selectedPartner = selectedRequest
    ? BUSINESS_PARTNERS.find(
        (partner) => partner.id === selectedRequest.partnerId,
      )
    : null;
  const selectedOpportunity = selectedRequest
    ? BUSINESS_OPPORTUNITIES_OVERVIEW.find(
        (opportunity) => opportunity.id === selectedRequest.opportunityId,
      )
    : null;

  const statusCounts = {
    all: requests.length,
    waiting: requests.filter((request) => request.status === "در انتظار پیگیری")
      .length,
    tracking: requests.filter((request) => request.status === "در حال پیگیری")
      .length,
    answered: requests.filter((request) => request.status === "پاسخ داده شده")
      .length,
  };

  const filteredRequests = requests.filter((request) => {
    const partner = BUSINESS_PARTNERS.find(
      (item) => item.id === request.partnerId,
    );
    const opportunity = BUSINESS_OPPORTUNITIES_OVERVIEW.find(
      (item) => item.id === request.opportunityId,
    );
    const normalized = searchTerm.trim().toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "waiting" && request.status === "در انتظار پیگیری") ||
      (statusFilter === "tracking" && request.status === "در حال پیگیری") ||
      (statusFilter === "answered" && request.status === "پاسخ داده شده");
    const matchesSearch =
      !normalized ||
      request.title.toLowerCase().includes(normalized) ||
      request.message.toLowerCase().includes(normalized) ||
      partner?.name.toLowerCase().includes(normalized) ||
      partner?.organization.toLowerCase().includes(normalized) ||
      opportunity?.title.toLowerCase().includes(normalized);

    return matchesStatus && matchesSearch;
  });

  const openRequest = (requestId) => {
    const targetRequest = requests.find((request) => request.id === requestId);
    if (!targetRequest) return;

    if (targetRequest.status === "در انتظار پیگیری") {
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "در حال پیگیری" }
            : request,
        ),
      );
    }

    setSelectedRequestId(requestId);
    setReplyText(targetRequest.supportReply || "");
  };

  const closeRequest = () => {
    setSelectedRequestId(null);
    setReplyText("");
  };

  const saveReply = () => {
    if (!selectedRequest || !replyText.trim()) return;

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: "پاسخ داده شده",
              supportReply: replyText.trim(),
              repliedAt: getCurrentPersianDateTime(),
            }
          : request,
      ),
    );
    setNotice("پاسخ درخواست همکاری با موفقیت ثبت شد.");
  };

  if (selectedRequest) {
    const activeRequest =
      requests.find((request) => request.id === selectedRequest.id) ||
      selectedRequest;
    const hasReply = Boolean(activeRequest.supportReply);

    return (
      <section className="committee-dashboard__panel committee-business-requests">
        <div className="committee-dashboard__panel-header committee-business-requests__header">
          <div>
            <span>جزئیات درخواست همکاری</span>
            <h3>{activeRequest.title}</h3>
            <p>
              پیام همکار تجاری را بررسی کنید، اطلاعات موقعیت را ببینید و پاسخ
              دبیرخانه را ثبت کنید.
            </p>
          </div>
          <button type="button" onClick={closeRequest}>
            بازگشت به درخواست‌ها
          </button>
        </div>

        {notice && (
          <div className="committee-business-requests__notice">{notice}</div>
        )}

        <div className="committee-business-requests__detail-grid">
          <article>
            <span>همکار تجاری</span>
            <strong>{selectedPartner?.name || "-"}</strong>
            <small>{selectedPartner?.organization}</small>
          </article>
          <article>
            <span>موقعیت تجاری</span>
            <strong>{selectedOpportunity?.title || activeRequest.title}</strong>
            <small>{selectedOpportunity?.field}</small>
          </article>
          <article>
            <span>نوع همکاری</span>
            <strong>{selectedOpportunity?.collaborationType || "-"}</strong>
            <small>{selectedOpportunity?.stage}</small>
          </article>
          <article>
            <span>وضعیت درخواست</span>
            <strong>{activeRequest.status}</strong>
            <small>{activeRequest.sentAt}</small>
          </article>
        </div>

        <div className="committee-business-requests__conversation">
          <article className="committee-business-requests__message committee-business-requests__message--user">
            <span>پیام همکار تجاری</span>
            <p>{activeRequest.message}</p>
          </article>

          <article className="committee-business-requests__message committee-business-requests__message--opportunity">
            <span>اطلاعات موقعیت</span>
            <h4>{selectedOpportunity?.title}</h4>
            <p>
              متولی: {selectedOpportunity?.owner} / وضعیت:{" "}
              {selectedOpportunity?.stage}
            </p>
          </article>

          {hasReply && (
            <article className="committee-business-requests__message committee-business-requests__message--support">
              <span>آخرین پاسخ ثبت‌شده</span>
              <p>{activeRequest.supportReply}</p>
              <small>{activeRequest.repliedAt}</small>
            </article>
          )}
        </div>

        <label className="committee-business-requests__reply-box">
          <span>ثبت پیام برای این درخواست</span>
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="پاسخ یا پیام دبیرخانه برای همکار تجاری را بنویسید..."
          />
        </label>

        <div className="committee-business-requests__actions">
          <button
            type="button"
            onClick={saveReply}
            disabled={!replyText.trim()}
          >
            ثبت پاسخ و تغییر وضعیت به پاسخ داده شده
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="committee-dashboard__panel committee-business-requests">
      <div className="committee-dashboard__panel-header committee-business-requests__header">
        <div>
          <span>درخواست‌های همکاری</span>
          <h3>درخواست‌های ثبت‌شده برای موقعیت‌های تجاری</h3>
          <p>
            درخواست‌های همکاران تجاری را ببینید، موقعیت مربوطه را بررسی کنید و
            برای هر درخواست پیام ثبت کنید.
          </p>
        </div>
      </div>

      <div className="committee-business-requests__toolbar">
        <label>
          <span>جستجو</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="عنوان، همکار، سازمان یا موقعیت..."
          />
        </label>
        <div className="committee-business-requests__filters">
          <button
            type="button"
            className={statusFilter === "all" ? "is-active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            همه <strong>{toPersianDigits(statusCounts.all)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === "waiting" ? "is-active" : ""}
            onClick={() => setStatusFilter("waiting")}
          >
            در انتظار <strong>{toPersianDigits(statusCounts.waiting)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === "tracking" ? "is-active" : ""}
            onClick={() => setStatusFilter("tracking")}
          >
            در حال پیگیری{" "}
            <strong>{toPersianDigits(statusCounts.tracking)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === "answered" ? "is-active" : ""}
            onClick={() => setStatusFilter("answered")}
          >
            پاسخ داده شده{" "}
            <strong>{toPersianDigits(statusCounts.answered)}</strong>
          </button>
        </div>
      </div>

      <div className="committee-business-requests__list">
        {filteredRequests.map((request) => {
          const partner = BUSINESS_PARTNERS.find(
            (item) => item.id === request.partnerId,
          );
          const opportunity = BUSINESS_OPPORTUNITIES_OVERVIEW.find(
            (item) => item.id === request.opportunityId,
          );

          return (
            <article
              className="committee-business-requests__card"
              key={request.id}
            >
              <div className="committee-business-requests__card-main">
                <div className="committee-business-requests__card-title">
                  <h4>{request.title}</h4>
                  <span>{request.status}</span>
                </div>
                <p>{request.message}</p>
                <div className="committee-business-requests__meta">
                  <span>همکار: {partner?.name}</span>
                  <span>سازمان: {partner?.organization}</span>
                  <span>موقعیت: {opportunity?.title}</span>
                  <span>ارسال: {request.sentAt}</span>
                </div>
              </div>
              <div className="committee-business-requests__card-actions">
                <button type="button" onClick={() => openRequest(request.id)}>
                  مشاهده و پاسخ
                </button>
              </div>
            </article>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="committee-business-requests__empty">
            درخواستی با این فیلتر پیدا نشد.
          </div>
        )}
      </div>
    </section>
  );
}

function getActivityModerationStatusClass(status) {
  if (status === "منتشر شده") return "published";
  if (status === "رد شده") return "rejected";
  return "pending";
}

function getExecutionOrderStatusClass(status) {
  return status === "قبول شده" ? "accepted" : "waiting";
}

function ActivityModerationStatusBadge({ status }) {
  return (
    <span
      className={`committee-events__status committee-events__status--${getActivityModerationStatusClass(status)}`}
    >
      {status}
    </span>
  );
}

function ExecutionOrderStatusBadge({ status }) {
  return (
    <span
      className={`committee-events__status committee-events__status--${getExecutionOrderStatusClass(status)}`}
    >
      {status}
    </span>
  );
}

function InstructorsInfoPanel() {
  const totals = INSTRUCTOR_USERS.reduce(
    (summary, instructor) => ({
      activeActivities: summary.activeActivities + instructor.activeActivities,
      publishedActivities:
        summary.publishedActivities + instructor.publishedActivities,
      pendingActivities:
        summary.pendingActivities + instructor.pendingActivities,
      acceptedOrders: summary.acceptedOrders + instructor.acceptedOrders,
    }),
    {
      activeActivities: 0,
      publishedActivities: 0,
      pendingActivities: 0,
      acceptedOrders: 0,
    },
  );

  const stats = [
    {
      label: "مدرسین و رویدادگرها",
      value: INSTRUCTOR_USERS.length,
      hint: "کاربران آموزشی فعال",
    },
    {
      label: "دوره/رویداد جاری",
      value: totals.activeActivities,
      hint: "فعال یا در حال اجرا",
    },
    {
      label: "منتشرشده",
      value: totals.publishedActivities,
      hint: "کل برنامه‌های منتشرشده",
    },
    {
      label: "سفارش قبول‌شده",
      value: totals.acceptedOrders,
      hint: "سفارش‌های اجرای پذیرفته‌شده",
    },
  ];

  return (
    <section className="committee-events">
      <div className="reviewer-dashboard__stats-grid committee-events__stats">
        {stats.map((item) => (
          <article className="reviewer-dashboard__stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{toPersianDigits(item.value)}</strong>
            <p>{item.hint}</p>
          </article>
        ))}
      </div>

      <div className="committee-dashboard__panel committee-events__panel">
        <div className="committee-dashboard__panel-header">
          <div>
            <span>اطلاعات مدرسین</span>
            <h3>مدرسین و رویدادگرهای سامانه</h3>
            <p>
              اطلاعات کاربری و آمار مشارکت آموزشی هر مدرس یا رویدادگر را بررسی
              کنید.
            </p>
          </div>
        </div>

        <div className="committee-events__people-grid">
          {INSTRUCTOR_USERS.map((instructor) => (
            <article
              className="committee-events__person-card"
              key={instructor.id}
            >
              <div className="committee-events__person-head">
                <span className="committee-events__avatar">
                  {instructor.name.slice(0, 1)}
                </span>
                <div>
                  <strong>{instructor.name}</strong>
                  <p>
                    {instructor.role} / {instructor.specialty}
                  </p>
                </div>
              </div>

              <dl className="committee-events__person-info">
                <div>
                  <dt>ایمیل</dt>
                  <dd dir="ltr">{instructor.email}</dd>
                </div>
                <div>
                  <dt>موبایل</dt>
                  <dd dir="ltr">{instructor.mobile}</dd>
                </div>
                <div>
                  <dt>سازمان</dt>
                  <dd>{instructor.organization}</dd>
                </div>
              </dl>

              <div className="committee-events__person-stats">
                <span>
                  جاری: {toPersianDigits(instructor.activeActivities)}
                </span>
                <span>
                  منتشرشده: {toPersianDigits(instructor.publishedActivities)}
                </span>
                <span>
                  در انتظار تأیید:{" "}
                  {toPersianDigits(instructor.pendingActivities)}
                </span>
                <span>
                  سفارش پذیرفته: {toPersianDigits(instructor.acceptedOrders)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommitteeActivitiesPanel({ activities, setActivities }) {
  const [tab, setTab] = useState("pending");
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const pendingActivities = activities.filter(
    (activity) => activity.status === "در انتظار بررسی",
  );
  const rejectedActivities = activities.filter(
    (activity) => activity.status === "رد شده",
  );
  const publishedActivities = activities.filter(
    (activity) => activity.status === "منتشر شده",
  );
  const visibleActivities =
    tab === "published"
      ? publishedActivities
      : tab === "rejected"
        ? rejectedActivities
        : pendingActivities;
  const selectedActivity = activities.find(
    (activity) => activity.id === selectedActivityId,
  );

  const openActivity = (activity) => {
    setSelectedActivityId(activity.id);
    setFeedbackText(
      activity.status === "در انتظار بررسی"
        ? activity.managerFeedback || ""
        : "",
    );
  };

  const closeDetail = () => {
    setSelectedActivityId(null);
    setFeedbackText("");
  };

  const openActivityPreview = (activity) => {
    if (activity.status === "رد شده") return;

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      window.alert(
        "برای مشاهده پیش‌نمایش، اجازه باز شدن پنجره جدید را فعال کنید.",
      );
      return;
    }

    previewWindow.document.write(`<!doctype html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${activity.title}</title>
          <style>
            body { margin:0; padding:36px; background:#eef3f8; color:#173154; font-family:Tahoma, Arial, sans-serif; direction:rtl; }
            .page { max-width:980px; margin:0 auto; display:grid; gap:18px; }
            .hero { padding:30px; border-radius:28px; color:#fff; background:linear-gradient(135deg,#0e2f59,#19b4e9); }
            .hero span { display:inline-flex; padding:7px 12px; border-radius:999px; background:rgba(255,255,255,.16); font-size:12px; font-weight:800; }
            h1 { margin:18px 0 10px; font-size:30px; line-height:1.7; }
            p { margin:0; line-height:2.1; }
            .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
            .card { padding:16px; border:1px solid #e4edf5; border-radius:18px; background:#fff; }
            .card small { display:block; color:#84a0bc; font-weight:800; margin-bottom:8px; }
            .card strong { color:#10284b; }
          </style>
        </head>
        <body>
          <main class="page">
            <section class="hero">
              <span>${activity.type}</span>
              <h1>${activity.title}</h1>
              <p>${activity.summary}</p>
            </section>
            <section class="grid">
              <article class="card"><small>مدرس/رویدادگر</small><strong>${activity.instructor}</strong></article>
              <article class="card"><small>حوزه</small><strong>${activity.field}</strong></article>
              <article class="card"><small>شروع</small><strong>${activity.startDate}</strong></article>
              <article class="card"><small>ظرفیت</small><strong>${activity.capacity}</strong></article>
            </section>
          </main>
        </body>
      </html>`);
    previewWindow.document.close();
  };

  const publishActivity = (activityId) => {
    const confirmed = window.confirm(
      "آیا از انتشار نهایی این دوره یا رویداد مطمئن هستید؟",
    );
    if (!confirmed) return;

    setActivities((currentActivities) =>
      currentActivities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              status: "منتشر شده",
              publishedAt: getCurrentSimplePersianDate(),
              managerFeedback: "",
            }
          : activity,
      ),
    );
    setNotice("برنامه با موفقیت منتشر شد.");
    closeDetail();
    setTab("published");
  };

  const rejectActivity = (activityId) => {
    if (!feedbackText.trim()) {
      setNotice("برای رد دوره یا رویداد، ثبت بازخورد الزامی است.");
      return;
    }

    const confirmed = window.confirm(
      "این برنامه رد می‌شود و بازخورد برای مدرس/رویدادگر ارسال خواهد شد. ادامه می‌دهید؟",
    );
    if (!confirmed) return;

    setActivities((currentActivities) =>
      currentActivities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              status: "رد شده",
              managerFeedback: feedbackText.trim(),
            }
          : activity,
      ),
    );
    setNotice("برنامه رد شد و بازخورد برای مدرس/رویدادگر ثبت شد.");
    closeDetail();
    setTab("rejected");
  };

  if (selectedActivity) {
    const isPending = selectedActivity.status === "در انتظار بررسی";
    const isRejected = selectedActivity.status === "رد شده";
    const canPreview = !isRejected;

    return (
      <section className="committee-dashboard__panel committee-events__panel committee-events__detail">
        <div className="committee-dashboard__panel-header">
          <div>
            <span>
              {isPending
                ? `بررسی ${selectedActivity.type}`
                : `مشاهده ${selectedActivity.type}`}
            </span>
            <h3>{selectedActivity.title}</h3>
            <p>
              {selectedActivity.instructor} / {selectedActivity.field}
            </p>
          </div>
          <button
            type="button"
            className="committee-events__ghost-button"
            onClick={closeDetail}
          >
            بازگشت به لیست
          </button>
        </div>

        {notice && (
          <p className="committee-dashboard__notice committee-dashboard__notice--success">
            {notice}
          </p>
        )}

        <div className="committee-events__detail-grid">
          <article>
            <span>نوع</span>
            <strong>{selectedActivity.type}</strong>
          </article>
          <article>
            <span>وضعیت</span>
            <ActivityModerationStatusBadge status={selectedActivity.status} />
          </article>
          <article>
            <span>شروع</span>
            <strong>{selectedActivity.startDate}</strong>
          </article>
          <article>
            <span>ظرفیت</span>
            <strong>{selectedActivity.capacity}</strong>
          </article>
        </div>

        <div
          className={
            isPending
              ? "committee-events__detail-body"
              : "committee-events__detail-body committee-events__detail-body--single"
          }
        >
          <div className="committee-events__preview-card">
            <span>
              {canPreview ? "پیش‌نمایش و توضیح مختصر" : "توضیح مختصر"}
            </span>
            <p>{selectedActivity.summary}</p>
            {canPreview && (
              <button
                type="button"
                className="committee-events__preview-open"
                onClick={() => openActivityPreview(selectedActivity)}
              >
                👁 مشاهده پیش‌نمایش
              </button>
            )}
            {selectedActivity.managerFeedback && (
              <div className="committee-events__feedback-view">
                <strong>بازخورد ثبت‌شده برای مدرس/رویدادگر</strong>
                <p>{selectedActivity.managerFeedback}</p>
              </div>
            )}
          </div>

          {isPending && (
            <div className="committee-events__decision-card">
              <label>
                <span>بازخورد برای رد دوره/رویداد</span>
                <textarea
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  placeholder="اگر قصد رد کردن دارید، دلیل رد یا اصلاحات موردنظر را وارد کنید..."
                />
              </label>

              <div className="committee-events__actions">
                <button
                  type="button"
                  className="committee-events__success-button"
                  onClick={() => publishActivity(selectedActivity.id)}
                >
                  انتشار نهایی
                </button>
                <button
                  type="button"
                  className="committee-events__danger-button"
                  onClick={() => rejectActivity(selectedActivity.id)}
                  disabled={!feedbackText.trim()}
                >
                  رد و ارسال بازخورد
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="committee-dashboard__panel committee-events__panel">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>دوره‌ها و رویدادها</span>
          <h3>بررسی و انتشار برنامه‌های ساخته‌شده</h3>
          <p>
            مدرس یا رویدادگر برنامه را ارسال می‌کند؛ اینجا یا منتشر می‌شود یا با
            بازخورد رد می‌شود.
          </p>
        </div>
      </div>

      {notice && (
        <p className="committee-dashboard__notice committee-dashboard__notice--success">
          {notice}
        </p>
      )}

      <div className="committee-events__tabs committee-events__tabs--three">
        <button
          type="button"
          className={tab === "pending" ? "is-active" : ""}
          onClick={() => setTab("pending")}
        >
          در انتظار بررسی{" "}
          <strong>{toPersianDigits(pendingActivities.length)}</strong>
        </button>
        <button
          type="button"
          className={tab === "rejected" ? "is-active" : ""}
          onClick={() => setTab("rejected")}
        >
          رد شده‌ها{" "}
          <strong>{toPersianDigits(rejectedActivities.length)}</strong>
        </button>
        <button
          type="button"
          className={tab === "published" ? "is-active" : ""}
          onClick={() => setTab("published")}
        >
          منتشر شده‌ها{" "}
          <strong>{toPersianDigits(publishedActivities.length)}</strong>
        </button>
      </div>

      <div className="committee-events__activity-list">
        {visibleActivities.map((activity) => {
          const isRejected = activity.status === "رد شده";
          const isPending = activity.status === "در انتظار بررسی";

          return (
            <article
              className={`committee-events__activity-card committee-events__activity-card--${getActivityModerationStatusClass(activity.status)}`}
              key={activity.id}
            >
              <div className="committee-events__activity-main">
                <span>{activity.type}</span>
                <h4>{activity.title}</h4>
                <p>{activity.summary}</p>
                <div className="committee-events__meta-line">
                  <small>مدرس/رویدادگر: {activity.instructor}</small>
                  <small>حوزه: {activity.field}</small>
                  <small>شروع: {activity.startDate}</small>
                  <small>ظرفیت: {activity.capacity}</small>
                </div>
                {activity.managerFeedback && (
                  <div className="committee-events__inline-feedback">
                    بازخورد: {activity.managerFeedback}
                  </div>
                )}
              </div>
              <div className="committee-events__activity-actions">
                <ActivityModerationStatusBadge status={activity.status} />
                {!isRejected && (
                  <button
                    type="button"
                    className="committee-events__preview-button"
                    onClick={() => openActivityPreview(activity)}
                    title="پیش‌نمایش دوره یا رویداد"
                    aria-label="پیش‌نمایش دوره یا رویداد"
                  >
                    👁
                  </button>
                )}
                <button type="button" onClick={() => openActivity(activity)}>
                  {isPending ? "بررسی و تصمیم" : "مشاهده جزئیات"}
                </button>
              </div>
            </article>
          );
        })}

        {visibleActivities.length === 0 && (
          <div className="committee-events__empty-state">
            موردی برای این تب وجود ندارد.
          </div>
        )}
      </div>
    </section>
  );
}
function ExecutionOrdersManagementPanel({ orders, setOrders }) {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    subject: "",
    deadlineDate: "",
    deadlineTime: "",
  });
  const [notice, setNotice] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const submitOrder = (event) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.summary.trim() ||
      !form.subject.trim() ||
      !form.deadlineDate.trim()
    ) {
      setNotice("عنوان، توضیح، موضوع و تاریخ ددلاین را تکمیل کنید.");
      return;
    }

    setOrders((currentOrders) => [
      {
        id: Date.now(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        subject: form.subject.trim(),
        deadlineDate: form.deadlineDate.trim(),
        deadlineTime: form.deadlineTime.trim() || "--:--",
        status: "در انتظار پذیرش",
        acceptedBy: "",
        createdAt: getCurrentSimplePersianDate(),
      },
      ...currentOrders,
    ]);

    setForm({
      title: "",
      summary: "",
      subject: "",
      deadlineDate: "",
      deadlineTime: "",
    });
    setIsFormOpen(false);
    setNotice(
      "سفارش اجرا با موفقیت ثبت شد و برای مدرسین/رویدادگرها قابل مشاهده است.",
    );
  };

  return (
    <section className="committee-events committee-events__orders">
      <div className="committee-dashboard__panel committee-events__panel">
        <div className="committee-dashboard__panel-header">
          <div>
            <span>سفارش اجرا</span>
            <h3>ثبت و پیگیری سفارش‌های اجرای دوره یا رویداد</h3>
            <p>
              با ساخت سفارش جدید، مدرسین و رویدادگرها می‌توانند آن را بپذیرند و
              برای ساخت برنامه اقدام کنند.
            </p>
          </div>

          <button
            type="button"
            className="committee-events__order-toggle"
            onClick={() => setIsFormOpen((current) => !current)}
          >
            {isFormOpen ? "بستن فرم" : "ساخت سفارش جدید"}
          </button>
        </div>

        {notice && (
          <p className="committee-dashboard__notice committee-dashboard__notice--success">
            {notice}
          </p>
        )}

        {isFormOpen && (
          <form
            className="committee-events__order-form committee-events__order-form--slide"
            onSubmit={submitOrder}
          >
            <label>
              <span>تیتر سفارش</span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="مثلاً طراحی دوره آماده‌سازی پروپوزال"
              />
            </label>
            <label>
              <span>موضوع دوره یا رویداد</span>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="مثلاً دوره / هوش مصنوعی"
              />
            </label>
            <label>
              <span>تاریخ ددلاین ساخت</span>
              <input
                value={form.deadlineDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deadlineDate: event.target.value,
                  }))
                }
                placeholder="1405/05/05"
              />
            </label>
            <label>
              <span>ساعت ددلاین</span>
              <input
                value={form.deadlineTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deadlineTime: event.target.value,
                  }))
                }
                placeholder="18:00"
              />
            </label>
            <label className="committee-events__field-full">
              <span>توضیح مختصر</span>
              <textarea
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                placeholder="توضیح دهید چه نوع دوره یا رویدادی باید طراحی و اجرا شود..."
              />
            </label>
            <div className="committee-events__form-actions">
              <button type="submit">ثبت سفارش اجرا</button>
            </div>
          </form>
        )}
      </div>

      <div className="committee-dashboard__panel committee-events__panel">
        <div className="committee-dashboard__panel-header">
          <div>
            <span>سفارش‌های قبلی</span>
            <h3>پیگیری وضعیت سفارش‌های اجرا</h3>
            <p>
              مشخص است هر سفارش قبول شده یا هنوز در انتظار پذیرش مدرس/رویدادگر
              است.
            </p>
          </div>
        </div>

        <div className="committee-events__orders-list">
          {orders.map((order) => (
            <article key={order.id}>
              <div>
                <span>{order.subject}</span>
                <h4>{order.title}</h4>
                <p>{order.summary}</p>
                <div className="committee-events__meta-line">
                  <small>ثبت: {order.createdAt}</small>
                  <small>
                    ددلاین: {order.deadlineDate} - ساعت {order.deadlineTime}
                  </small>
                  {order.acceptedBy && (
                    <small>پذیرفته شده توسط: {order.acceptedBy}</small>
                  )}
                </div>
              </div>
              <ExecutionOrderStatusBadge status={order.status} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlaceholderManagementPanel({ sectionId }) {
  const item = MANAGEMENT_ITEMS.find(
    (managementItem) => managementItem.id === sectionId,
  );

  if (!item) return null;

  return (
    <section className="committee-dashboard__panel committee-dashboard__placeholder-panel">
      <div className="committee-dashboard__panel-header">
        <div>
          <span>در حال طراحی</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>

      <div className="committee-dashboard__placeholder-grid">
        {item.items.map((text) => (
          <article key={text}>
            <strong>{text}</strong>
            <p>جزئیات این بخش در مرحله بعدی تعریف و پیاده‌سازی می‌شود.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CommitteeSecretariatDashboardPage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState(() => [
    "calls-management",
  ]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [requests, setRequests] = useState(INITIAL_RECEIVED_REQUESTS);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [editingCall, setEditingCall] = useState(null);
  const [callNotice, setCallNotice] = useState("");
  const [callFormResetKey, setCallFormResetKey] = useState(0);
  const [plans, setPlans] = useState(INITIAL_COMMITTEE_PLANS);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [instructorActivities, setInstructorActivities] = useState(
    INITIAL_COMMITTEE_ACTIVITIES,
  );
  const [executionOrders, setExecutionOrders] = useState(
    INITIAL_EXECUTION_ORDERS,
  );

  useEffect(() => {
    setInstructorActivities((currentActivities) => {
      const hasPendingActivities = currentActivities.some(
        (activity) => activity.status === "در انتظار بررسی",
      );

      if (hasPendingActivities) {
        return currentActivities;
      }

      const existingActivityIds = new Set(
        currentActivities.map((activity) => activity.id),
      );
      const newPendingActivities = EXTRA_PENDING_ACTIVITIES_FOR_REVIEW.filter(
        (activity) => !existingActivityIds.has(activity.id),
      );

      if (!newPendingActivities.length) {
        return currentActivities;
      }

      return [...newPendingActivities, ...currentActivities];
    });
  }, []);

  const unreadNotificationCount =
    INITIAL_MESSAGES.filter((message) => !message.isRead).length +
    requests.filter((request) => request.status === "در انتظار پیگیری").length;

  const activeSectionData =
    SECTION_DATA[activeSection] || SECTION_DATA.dashboard;

  useEffect(() => {
    if (!callNotice) return undefined;
    const timer = window.setTimeout(() => setCallNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [callNotice]);

  const toggleMenu = (menuId) => {
    setExpandedMenus((currentMenus) =>
      currentMenus.includes(menuId) ? [] : [menuId],
    );
  };

  const handleNavigation = (item) => {
    if (item.subItems?.length) {
      const isAlreadyOpen = expandedMenus.includes(item.id);
      toggleMenu(item.id);

      if (isAlreadyOpen) {
        return;
      }

      if (item.subItems[0].id === "create-call") {
        setEditingCall(null);
      }
      setActiveSection(item.subItems[0].id);
      return;
    }

    setExpandedMenus([]);
    setActiveSection(item.id);
  };

  const handleSubNavigation = (parentId, subItemId) => {
    if (subItemId === "create-call") {
      setEditingCall(null);
    }
    setActiveSection(subItemId);
    setExpandedMenus([parentId]);
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <DashboardPanel
          requests={requests}
          calls={calls}
          plans={plans}
          activities={instructorActivities}
          orders={executionOrders}
        />
      );
    }

    if (activeSection === "create-call") {
      return (
        <CallBuilderPanel
          key={`${editingCall?.id || "new"}-${callFormResetKey}`}
          editingCall={editingCall}
          notice={callNotice}
          onCancelEdit={() => {
            setEditingCall(null);
            setActiveSection("current-calls");
          }}
          onSaveCall={(call, isEditing) => {
            setCalls((currentCalls) => {
              if (isEditing) {
                return currentCalls.map((item) =>
                  item.id === call.id ? call : item,
                );
              }
              return [call, ...currentCalls];
            });
            setEditingCall(null);
            setCallFormResetKey((key) => key + 1);
            setCallNotice(
              call.status === "منتشر شده"
                ? "فراخوان با موفقیت منتشر شد."
                : "فراخوان با موفقیت به‌صورت پیش‌نویس ذخیره شد.",
            );
            setActiveSection("create-call");
            setExpandedMenus(["calls-management"]);
          }}
        />
      );
    }

    if (activeSection === "current-calls") {
      return (
        <CallListPanel
          mode="current"
          calls={calls}
          onEditCall={(call) => {
            setEditingCall(call);
            setActiveSection("create-call");
          }}
          onDeleteCall={(callId) => {
            const confirmed = window.confirm(
              "آیا از حذف این فراخوان مطمئن هستید؟",
            );
            if (!confirmed) return;
            setCalls((currentCalls) =>
              currentCalls.filter((call) => call.id !== callId),
            );
          }}
          onPublishCall={(callId) => {
            setCalls((currentCalls) =>
              currentCalls.map((call) =>
                call.id === callId
                  ? {
                      ...call,
                      status: "منتشر شده",
                      publishedAt:
                        call.publishedAt || getCurrentSimplePersianDate(),
                    }
                  : call,
              ),
            );
          }}
        />
      );
    }

    if (activeSection === "calls-history") {
      return (
        <CallListPanel
          mode="history"
          calls={calls}
          onEditCall={() => {}}
          onDeleteCall={() => {}}
          onPublishCall={() => {}}
        />
      );
    }

    if (activeSection === "current-plans") {
      return <CurrentPlansPanel plans={plans} setPlans={setPlans} />;
    }

    if (activeSection === "final-decisions") {
      return (
        <FinalDecisionPanel
          plans={plans}
          setPlans={setPlans}
          resultsPublished={resultsPublished}
          setResultsPublished={setResultsPublished}
        />
      );
    }

    if (activeSection === "accepted-plans") {
      return <AcceptedPlansPanel plans={plans} />;
    }

    if (activeSection === "plans-history") {
      return <PlansHistoryPanel plans={plans} />;
    }

    if (activeSection === "reviewers-info") {
      return <ReviewersInfoPanel plans={plans} />;
    }

    if (activeSection === "reviewer-feedbacks") {
      return <ReviewerFeedbacksPanel plans={plans} />;
    }

    if (activeSection === "business-partners-info") {
      return <BusinessPartnersInfoPanel />;
    }

    if (activeSection === "business-collaboration-requests") {
      return <BusinessCollaborationRequestsPanel />;
    }

    if (activeSection === "instructors-info") {
      return <InstructorsInfoPanel />;
    }

    if (activeSection === "activities-management") {
      return (
        <CommitteeActivitiesPanel
          activities={instructorActivities}
          setActivities={setInstructorActivities}
        />
      );
    }

    if (activeSection === "execution-orders-management") {
      return (
        <ExecutionOrdersManagementPanel
          orders={executionOrders}
          setOrders={setExecutionOrders}
        />
      );
    }

    if (activeSection === "new-requests") {
      return (
        <ReceivedRequestsPanel
          mode="new"
          requests={requests}
          setRequests={setRequests}
        />
      );
    }

    if (activeSection === "requests-history") {
      return (
        <ReceivedRequestsPanel
          mode="history"
          requests={requests}
          setRequests={setRequests}
        />
      );
    }

    if (activeSection === "messages") {
      return <MessagesPanel />;
    }

    if (activeSection === "faq") {
      return <FaqPanel />;
    }

    if (activeSection === "profile") {
      return (
        <ProfilePanel
          profile={profile}
          onEdit={() => setActiveSection("edit-profile")}
        />
      );
    }

    if (activeSection === "edit-profile") {
      return (
        <EditProfilePanel
          profile={profile}
          onSave={(newProfile) => {
            setProfile(newProfile);
            setActiveSection("profile");
          }}
          onCancel={() => setActiveSection("profile")}
        />
      );
    }

    return <PlaceholderManagementPanel sectionId={activeSection} />;
  };

  return (
    <div
      className={`innovator-dashboard committee-dashboard ${
        isCollapsed ? "innovator-dashboard--collapsed" : ""
      }`}
    >
      <aside className="innovator-dashboard__sidebar">
        <div className="innovator-dashboard__sidebar-top">
          <div className="innovator-dashboard__sidebar-head">
            <button
              type="button"
              className="innovator-dashboard__menu-button"
              onClick={() => setIsCollapsed((currentValue) => !currentValue)}
              aria-label="باز و بسته کردن منو"
            >
              <MenuIcon />
            </button>

            <Link to="/" className="innovator-dashboard__brand">
              <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
              <span className="innovator-dashboard__brand-text">
                <strong>سامانه هاتف</strong>
              </span>
            </Link>
          </div>

          <nav className="innovator-dashboard__nav" aria-label="منوی داشبورد">
            {NAV_ITEMS.map((item) => {
              const isOpen = expandedMenus.includes(item.id);
              const hasSubItems = Boolean(item.subItems?.length);
              const isActive =
                activeSection === item.id ||
                item.subItems?.some((subItem) => subItem.id === activeSection);

              return (
                <div className="innovator-dashboard__nav-group" key={item.id}>
                  <button
                    type="button"
                    className={`innovator-dashboard__nav-item ${
                      isActive ? "innovator-dashboard__nav-item--active" : ""
                    }`}
                    onClick={() => handleNavigation(item)}
                    title={item.label}
                  >
                    <span className="innovator-dashboard__nav-icon">
                      {item.icon}
                    </span>
                    <span className="innovator-dashboard__nav-text">
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <span className="innovator-dashboard__nav-chevron">
                        <ChevronIcon isOpen={isOpen} />
                      </span>
                    )}
                  </button>

                  {hasSubItems && (
                    <div
                      className={`innovator-dashboard__subnav ${
                        isOpen ? "innovator-dashboard__subnav--open" : ""
                      }`}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          type="button"
                          key={subItem.id}
                          className={`innovator-dashboard__subnav-item ${
                            activeSection === subItem.id
                              ? "innovator-dashboard__subnav-item--active"
                              : ""
                          }`}
                          onClick={() =>
                            handleSubNavigation(item.id, subItem.id)
                          }
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="innovator-dashboard__main">
        <header className="innovator-dashboard__topbar">
          <div className="innovator-dashboard__topbar-title">
            <div className="innovator-dashboard__breadcrumb">
              <span>داشبورد</span>
              <i>/</i>
              <strong>{activeSectionData.title}</strong>
            </div>

            <h1>{activeSectionData.title}</h1>
            <p>{activeSectionData.description}</p>
          </div>

          <div className="innovator-dashboard__topbar-actions">
            <DashboardDateTime />

            <div className="innovator-dashboard__notification-menu">
              <button
                type="button"
                className="innovator-dashboard__notification-trigger"
                onClick={() =>
                  setIsNotificationOpen((currentValue) => !currentValue)
                }
                aria-label="اعلان‌ها"
              >
                <BellIcon />
                {unreadNotificationCount > 0 && (
                  <span>{unreadNotificationCount}</span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="innovator-dashboard__notification-dropdown">
                  <div className="innovator-dashboard__notification-header">
                    <strong>اعلان‌های جدید</strong>
                    <small>{unreadNotificationCount} مورد</small>
                  </div>

                  <div className="innovator-dashboard__notification-list">
                    {requests
                      .filter(
                        (request) => request.status === "در انتظار پیگیری",
                      )
                      .slice(0, 3)
                      .map((request) => (
                        <article
                          className="innovator-dashboard__notification-item"
                          key={request.id}
                        >
                          <div>
                            <h4>{request.title}</h4>
                            <p>
                              {request.userLevel} / {request.sentAt}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSection("new-requests");
                              setIsNotificationOpen(false);
                            }}
                          >
                            مشاهده
                          </button>
                        </article>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="innovator-dashboard__profile-menu">
              <button
                type="button"
                className="innovator-dashboard__profile-trigger"
                onClick={() =>
                  setIsProfileMenuOpen((currentValue) => !currentValue)
                }
              >
                <span className="innovator-dashboard__profile-text">
                  <strong>
                    {profile.firstName} {profile.lastName}
                  </strong>
                  <small>{profile.role}</small>
                </span>
                <span className="innovator-dashboard__top-avatar">
                  {profile.avatarLetter}
                </span>
                <span className="innovator-dashboard__profile-caret">⌄</span>
              </button>

              {isProfileMenuOpen && (
                <div className="innovator-dashboard__profile-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("profile");
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    مشاهده پروفایل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("edit-profile");
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    ویرایش پروفایل
                  </button>
                  <button
                    type="button"
                    className="innovator-dashboard__profile-logout"
                    onClick={() => navigate("/auth")}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default CommitteeSecretariatDashboardPage;
