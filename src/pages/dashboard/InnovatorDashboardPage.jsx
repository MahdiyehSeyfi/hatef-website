import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import "./InnovatorDashboardPage.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: "🏠",
  },
  {
    id: "calls",
    label: "فراخوان‌ها",
    icon: "📣",
    subItems: [
      {
        id: "submit-plan",
        label: "طرح‌های من",
      },
      {
        id: "selected-plans",
        label: "طرح‌های انتخاب‌شده",
      },
    ],
  },
  {
    id: "requests",
    label: "درخواست‌ها و پشتیبانی",
    icon: "🗂",
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

const CALL_OPTIONS = [
  {
    id: "ai-call",
    title: "فراخوان هدایت اعتبارات توسعه فناوری",
    field: "با محوریت هوش مصنوعی",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    status: "فعال",
  },
  {
    id: "energy-call",
    title: "فراخوان توسعه فناوری‌های انرژی",
    field: "انرژی، محیط‌زیست و پایداری",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    status: "فعال",
  },
  {
    id: "health-call",
    title: "فراخوان فناوری‌های سلامت دیجیتال",
    field: "سلامت، داده و هوشمندسازی",
    deadline: "۱۴۰۵/۰۶/۱۵ - ساعت ۲۰:۰۰",
    status: "جدید",
  },
];

const SECTION_DATA = {
  dashboard: {
    title: "داشبورد",
    primaryTitle: "نمای کلی داشبورد",
    primaryItems: [
      {
        title: "صفحه اصلی داشبورد در مرحله بعدی تکمیل می‌شود",
        meta: "این بخش بعداً به‌صورت کامل طراحی خواهد شد.",
        status: "در حال طراحی",
      },
    ],
    sideTitle: "میان‌برهای داشبورد",
    sideItems: ["مرور سریع وضعیت", "آخرین فعالیت‌ها", "اعلان‌های مهم"],
    actionLabel: "شروع کار",
  },
  calls: {
    title: "فراخوان‌ها",
    primaryTitle: "فراخوان‌های در دسترس",
    primaryItems: [
      {
        title: "فراخوان فعال هدایت اعتبارات توسعه فناوری (هاتف)",
        meta: "مهلت ثبت: ۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
        status: "فعال",
      },
      {
        title: "محورهای پژوهشی سال جاری",
        meta: "به‌روزرسانی: ۲ روز پیش",
        status: "جدید",
      },
      {
        title: "آیین‌نامه شرکت در فراخوان‌ها",
        meta: "راهنما و شرایط شرکت",
        status: "راهنما",
      },
    ],
    sideTitle: "کارهای سریع",
    sideItems: [
      "مشاهده فراخوان‌های فعال",
      "بررسی شرایط احراز",
      "دانلود شیوه‌نامه تدوین پروپوزال",
      "ثبت درخواست جدید",
    ],
    actionLabel: "ثبت درخواست جدید",
  },
  requests: {
    title: "درخواست‌ها و پشتیبانی",
    primaryTitle: "درخواست‌های اخیر",
    primaryItems: [
      {
        title: "مشکل در بارگذاری فایل پروپوزال",
        meta: "وضعیت: پاسخ داده شده",
        status: "پاسخ داده شده",
      },
      {
        title: "پیگیری مشکل ورود به پنل",
        meta: "وضعیت: در حال پیگیری",
        status: "در حال پیگیری",
      },
      {
        title: "درخواست راهنمایی برای تکمیل فرم",
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
        title: "نتیجه بررسی اولیه درخواست شما ثبت شد",
        meta: "دیروز",
        status: "مهم",
      },
      {
        title: "مهلت فراخوان هاتف به‌روزرسانی شد",
        meta: "۳ ساعت پیش",
        status: "جدید",
      },
      {
        title: "درخواست پشتیبانی شما به‌روزرسانی شد",
        meta: "۲ روز پیش",
        status: "اطلاعیه",
      },
    ],
    sideTitle: "دسترسی سریع",
    sideItems: [
      "مشاهده همه پیام‌ها",
      "پیام‌های خوانده‌نشده",
      "پیام‌های مهم",
      "تنظیمات دریافت اعلان",
    ],
    actionLabel: "مشاهده پیام‌ها",
  },
  faq: {
    title: "سوالات متداول",
    primaryTitle: "سوالات پرتکرار",
    primaryItems: [
      {
        title: "چگونه در یک فراخوان ثبت‌نام کنم؟",
        meta: "راهنمای شروع ثبت درخواست",
        status: "راهنما",
      },
      {
        title: "چه مدارکی برای ثبت درخواست لازم است؟",
        meta: "فهرست مدارک و شرایط",
        status: "مدارک",
      },
      {
        title: "چگونه وضعیت درخواست را پیگیری کنم؟",
        meta: "مراحل پیگیری و پاسخ‌دهی",
        status: "پیگیری",
      },
    ],
    sideTitle: "پیشنهاد برای توسعه",
    sideItems: [
      "افزودن دسته‌بندی سوالات",
      "نمایش سوالات محبوب",
      "جست‌وجوی هوشمند در سوالات",
      "ثبت سوال جدید",
    ],
    actionLabel: "ارسال سوال",
  },
  profile: {
    title: "پروفایل",
    primaryTitle: "اطلاعات پروفایل",
    primaryItems: [],
    sideTitle: "پروفایل",
    sideItems: [],
    actionLabel: "ویرایش پروفایل",
  },
  "edit-profile": {
    title: "ویرایش پروفایل",
    primaryTitle: "ویرایش اطلاعات کاربری",
    primaryItems: [],
    sideTitle: "ویرایش پروفایل",
    sideItems: [],
    actionLabel: "ذخیره تغییرات",
  },
};

const SUMMARY_CARDS = [
  {
    label: "طرح‌های ارسالی",
    value: "۸",
    hint: "کل طرح‌هایی که ثبت کرده‌اید",
  },
  {
    label: "طرح‌های قبول‌شده",
    value: "۲",
    hint: "طرح‌های قبول یا قبول ضعیف",
  },
  {
    label: "فراخوان‌های شرکت‌کرده",
    value: "۳",
    hint: "فراخوان‌هایی که در آن‌ها طرح دارید",
  },
  {
    label: "حمایت‌های دریافت‌شده",
    value: "۲",
    hint: "حمایت‌های فعال یا قابل پیگیری",
  },
];

const RECENT_ACTIVITY = [
  "فراخوان «هدایت اعتبارات توسعه فناوری» به داشبورد شما اضافه شد.",
  "یک پیام جدید درباره مهلت ثبت طرح دریافت کرده‌اید.",
  "وضعیت یکی از درخواست‌های شما به «در حال بررسی» تغییر کرد.",
];

const INITIAL_RECENT_MESSAGES = [
  {
    id: 1,
    title: "نتیجه بررسی اولیه درخواست شما ثبت شد.",
    time: "دیروز",
    isRead: false,
  },
  {
    id: 2,
    title: "مهلت فراخوان هاتف به‌روزرسانی شد.",
    time: "۳ ساعت پیش",
    isRead: false,
  },
  {
    id: 3,
    title: "درخواست پشتیبانی شما در حال پیگیری است.",
    time: "۲ روز پیش",
    isRead: false,
  },
];

const INITIAL_SUBMITTED_PLANS = [
  {
    id: 1,
    title: "سامانه هوشمند تحلیل داده‌های صنعتی",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    fileName: "industrial-ai-proposal.pdf",
    status: "دریافت شده",
  },
  {
    id: 2,
    title: "پلتفرم پایش مصرف انرژی",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۵/۰۲/۲۷ - ساعت ۱۴:۱۵",
    fileName: "energy-monitoring.zip",
    status: "در انتظار بررسی",
  },
  {
    id: 3,
    title: "ابزار تحلیل داده سلامت دیجیتال",
    callId: "health-call",
    call: "فراخوان فناوری‌های سلامت دیجیتال",
    deadline: "۱۴۰۵/۰۶/۱۵ - ساعت ۲۰:۰۰",
    date: "۱۴۰۵/۰۲/۱۰ - ساعت ۰۹:۴۵",
    fileName: "health-data-proposal.docx",
    status: "در حال بررسی",
  },
  {
    id: 4,
    title: "مدل پیش‌بینی تقاضای انرژی",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۵/۰۱/۲۸ - ساعت ۱۶:۲۰",
    fileName: "energy-demand-model.pdf",
    status: "داوری شده",
  },
  {
    id: 5,
    title: "سامانه تشخیص خطای تجهیزات",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۱/۱۵ - ساعت ۱۱:۰۰",
    fileName: "equipment-fault-detection.pdf",
    status: "رد",
    feedbacks: {
      secretariat:
        "مستندات طرح از نظر ساختار کلی قابل بررسی بود، اما برخی پیوست‌های اجرایی و برنامه زمان‌بندی نیاز به تکمیل داشت.",
      steering:
        "طرح از نظر مسئله‌محوری قابل توجه است، اما مسیر تجاری‌سازی و مدل بهره‌برداری به اندازه کافی شفاف ارائه نشده است.",
      reviewers: [
        {
          text: "از نظر فنی، نوآوری طرح نسبت به نمونه‌های موجود نیازمند تقویت و ارائه شواهد دقیق‌تر است.",
        },
        {
          text: "برنامه اجرایی طرح نیازمند جزئیات بیشتر در بخش اعتبارسنجی و آزمون میدانی است.",
        },
      ],
    },
  },
  {
    id: 6,
    title: "دستیار هوشمند تحلیل پروپوزال",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۱/۰۸ - ساعت ۱۲:۱۰",
    fileName: "proposal-ai-assistant.pdf",
    status: "رد ضعیف",
    feedbacks: {
      secretariat:
        "پرونده طرح کامل دریافت شده اما در بخش مستندات پشتیبان، نیاز به توضیح دقیق‌تر درباره خروجی مورد انتظار وجود دارد.",
      reviewers: [
        {
          text: "پیشنهاد می‌شود دامنه کاربرد، داده‌های موردنیاز و معیارهای سنجش عملکرد به‌صورت دقیق‌تر بازنویسی شود.",
        },
      ],
    },
  },
  {
    id: 7,
    title: "سامانه پایش هوشمند کیفیت هوا",
    callId: "health-call",
    call: "فراخوان فناوری‌های سلامت دیجیتال",
    deadline: "۱۴۰۵/۰۶/۱۵ - ساعت ۲۰:۰۰",
    date: "۱۴۰۴/۱۲/۲۲ - ساعت ۰۹:۳۰",
    fileName: "air-quality-monitoring.zip",
    status: "قبول",
    feedbacks: {
      secretariat:
        "مدارک طرح کامل، ساختارمند و مطابق الزامات فراخوان ارسال شده است.",
      steering:
        "طرح از نظر اثرگذاری، امکان اجرا و قابلیت توسعه در مسیر فناوری مورد تأیید قرار گرفته است.",
      reviewers: [
        {
          text: "سطح آمادگی فنی، منطق طراحی سامانه و قابلیت پیاده‌سازی طرح مناسب ارزیابی شده است.",
        },
        {
          text: "پیشنهاد می‌شود در مرحله اجرا، شاخص‌های سنجش اثرگذاری محیطی دقیق‌تر تعریف شود.",
        },
        {
          text: "مسیر توسعه نمونه اولیه و امکان اجرای پایلوت قابل قبول ارزیابی شده است.",
        },
      ],
    },
  },
  {
    id: 8,
    title: "پلتفرم مدیریت مصرف انرژی ساختمان",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۴/۱۲/۱۵ - ساعت ۱۵:۴۰",
    fileName: "building-energy-platform.docx",
    status: "قبول ضعیف",
    feedbacks: {
      steering:
        "طرح از نظر نیاز بازار و موضوع کلی قابل قبول است، اما مدل اجرای پایلوت باید دقیق‌تر شود.",
      reviewers: [
        {
          text: "پیشنهاد می‌شود معماری فنی، شاخص‌های عملکرد و برنامه اعتبارسنجی در نسخه بعدی تقویت شود.",
        },
      ],
    },
  },
];

const ACCEPTED_PLAN_STATUSES = ["قبول", "قبول ضعیف"];

const INITIAL_SELECTED_PLAN_TASKS = {
  7: [
    {
      id: 1,
      title: "تکمیل برنامه زمان‌بندی اجرای پایلوت",
      deadline: "۱۴۰۵/۰۴/۱۵ - ساعت ۱۸:۰۰",
      status: "در انتظار ارسال",
      isNew: true,
      managerMessage:
        "لطفاً برنامه زمان‌بندی اجرای پایلوت را با جزئیات فعالیت‌ها، خروجی هر مرحله و زمان تحویل هر بخش بارگذاری کنید.",
      managerFeedback: "",
      description: "",
      fileName: "",
    },
    {
      id: 2,
      title: "ارسال مستندات فنی نمونه اولیه",
      deadline: "۱۴۰۵/۰۴/۲۲ - ساعت ۲۰:۰۰",
      status: "ارسال شده",
      isNew: false,
      managerMessage:
        "مستندات باید شامل معماری سامانه، ورودی‌ها، خروجی‌ها و نحوه اعتبارسنجی باشد.",
      managerFeedback: "",
      description: "نسخه اولیه مستندات ارسال شده است.",
      fileName: "prototype-documents.pdf",
    },
    {
      id: 3,
      title: "بررسی مستندات ارسال‌شده توسط مدیر",
      deadline: "۱۴۰۵/۰۴/۲۹ - ساعت ۱۴:۰۰",
      status: "مشاهده شده",
      isNew: false,
      managerMessage:
        "این وظیفه پس از ارسال فایل توسط فناور، توسط مدیر مشاهده شده است.",
      managerFeedback:
        "فایل شما مشاهده شد. در صورت نیاز، وظیفه اصلاحی جداگانه تعریف خواهد شد.",
      description: "مستندات فنی ارسال شده و توسط مدیر مشاهده شده است.",
      fileName: "reviewed-documents.pdf",
    },
    {
      id: 4,
      title: "اصلاح مستندات اعتبارسنجی",
      deadline: "۱۴۰۵/۰۵/۱۸ - ساعت ۱۷:۰۰",
      status: "نیازمند اصلاح",
      isNew: false,
      managerMessage:
        "لطفاً نسخه اصلاح‌شده مستندات اعتبارسنجی را با توضیح تغییرات انجام‌شده ارسال کنید.",
      managerFeedback:
        "در نسخه قبلی، بخش معیارهای پذیرش و نحوه سنجش عملکرد کافی نبود. لطفاً این بخش‌ها را تکمیل کنید.",
      description: "در حال اصلاح مستندات طبق بازخورد مدیر هستیم.",
      fileName: "validation-documents.pdf",
    },
    {
      id: 5,
      title: "تحویل نسخه نهایی پایلوت",
      deadline: "",
      status: "پایان یافته",
      isNew: false,
      managerMessage:
        "این وظیفه پس از دریافت نسخه نهایی و بررسی مدیر پروژه خاتمه یافته است.",
      managerFeedback:
        "نسخه نهایی مورد تأیید قرار گرفت و این وظیفه پایان یافته است.",
      description: "نسخه نهایی پایلوت تحویل داده شد.",
      fileName: "final-pilot-version.zip",
    },
  ],
  8: [
    {
      id: 1,
      title: "بازنگری مدل اجرای پایلوت",
      deadline: "۱۴۰۵/۰۴/۱۰ - ساعت ۱۶:۰۰",
      status: "در انتظار ارسال",
      isNew: true,
      managerMessage:
        "برای ادامه فرآیند، مدل اجرای پایلوت و محدوده آزمایش اولیه باید شفاف‌تر شود.",
      managerFeedback: "",
      description: "",
      fileName: "",
    },
    {
      id: 2,
      title: "ارسال برنامه اعتبارسنجی فنی",
      deadline: "۱۴۰۵/۰۴/۲۸ - ساعت ۱۸:۰۰",
      status: "مشاهده شده",
      isNew: false,
      managerMessage:
        "برنامه اعتبارسنجی باید شامل معیارهای عملکرد، روش آزمون و داده‌های موردنیاز باشد.",
      managerFeedback:
        "فایل ارسال‌شده توسط مدیر مشاهده شد و فعلاً امکان تغییر مجدد ندارد.",
      description: "برنامه اعتبارسنجی ارسال شده و توسط مدیر مشاهده شده است.",
      fileName: "validation-plan.pdf",
    },
  ],
};

const INITIAL_SUPPORT_REQUESTS = [
  {
    id: 1,
    title: "مشکل در بارگذاری فایل پروپوزال",
    message:
      "هنگام بارگذاری فایل پروپوزال، سامانه خطا می‌دهد و فایل ثبت نمی‌شود. لطفاً راهنمایی کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    status: "پاسخ داده شده",
    seenBySupport: true,
    supportReply:
      "لطفاً حجم فایل را بررسی کنید و در صورت امکان فایل را به‌صورت PDF فشرده بارگذاری کنید. محدودیت فعلی سامانه ۲۰ مگابایت است.",
    repliedAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۱۰",
  },
  {
    id: 2,
    title: "پیگیری مشکل ورود به پنل",
    message:
      "گاهی هنگام ورود به پنل، صفحه دیر بارگذاری می‌شود و پیام خطای موقت نمایش داده می‌شود.",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۶:۲۰",
    status: "در حال پیگیری",
    seenBySupport: true,
    supportReply: "",
    repliedAt: "",
  },
  {
    id: 3,
    title: "درخواست راهنمایی برای تکمیل فرم",
    message:
      "برای تکمیل بخش توضیحات فنی فرم، نیاز به راهنمایی دارم. آیا نمونه‌ای برای تکمیل این بخش وجود دارد؟",
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
    title: "مهلت ارسال مدارک تکمیلی نزدیک است",
    category: "یادآوری",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۰۹:۱۵",
    isRead: false,
    isImportant: true,
    body: "برای یکی از طرح‌های شما وظیفه‌ای با ددلاین نزدیک تعریف شده است. لطفاً قبل از پایان مهلت، فایل یا توضیحات لازم را ارسال کنید.",
  },
  {
    id: 2,
    title: "نتیجه بررسی اولیه طرح ثبت شد",
    category: "پیام سامانه",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۵:۴۰",
    isRead: false,
    isImportant: false,
    body: "نتیجه بررسی اولیه یکی از طرح‌های شما در سامانه ثبت شده است. برای مشاهده جزئیات، به بخش طرح‌های من مراجعه کنید.",
  },
  {
    id: 3,
    title: "اطلاعیه به‌روزرسانی سامانه",
    category: "اطلاعیه",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۰۰",
    isRead: true,
    isImportant: false,
    body: "سامانه در نسخه جدید با بهبود سرعت بارگذاری داشبورد و اصلاح برخی خطاهای گزارش‌شده به‌روزرسانی شده است.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "فراخوان‌ها",
    question: "چطور می‌توانم برای یک فراخوان طرح ارسال کنم؟",
    answer:
      "از منوی فراخوان‌ها وارد بخش طرح‌های من شوید، فراخوان موردنظر را انتخاب کنید و سپس فایل پروپوزال یا مستندات طرح را بارگذاری کنید.",
  },
  {
    id: 2,
    category: "طرح‌ها",
    question: "بعد از ارسال طرح، آیا امکان ویرایش وجود دارد؟",
    answer:
      "امکان ویرایش یا حذف فقط برای طرح‌هایی وجود دارد که وضعیت آن‌ها «در انتظار بررسی» باشد. برای سایر وضعیت‌ها فقط امکان مشاهده طرح فعال است.",
  },
  {
    id: 3,
    category: "وظایف",
    question: "وظیفه‌ای که مدیر برای طرح تعریف می‌کند یعنی چه؟",
    answer:
      "وظیفه یک اقدام مشخص است که مدیر برای ادامه مسیر طرح تعریف می‌کند؛ مثل ارسال فایل تکمیلی، توضیح متنی، اصلاح مستندات یا تحویل یک خروجی مشخص.",
  },
  {
    id: 4,
    category: "درخواست‌ها",
    question: "چه زمانی می‌توانم درخواست پشتیبانی را حذف کنم؟",
    answer:
      "اگر درخواست هنوز توسط پشتیبان مشاهده نشده باشد، امکان حذف وجود دارد. پس از مشاهده پشتیبان، درخواست قابل حذف نخواهد بود.",
  },
  {
    id: 5,
    category: "پیام‌ها",
    question: "پیام‌های مهم کجا نمایش داده می‌شوند؟",
    answer:
      "پیام‌های مهم هم در بخش پیام‌ها و اعلانات نمایش داده می‌شوند و هم از طریق آیکون اعلان در بالای داشبورد قابل مشاهده هستند.",
  },
];

const INITIAL_USER_PROFILE = {
  firstName: "مهدیه",
  lastName: "سیفی",
  mobile: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "mahdieh.seyfi@example.com",
  level: "فناور",
  memberSince: "۱۴۰۴",
  membershipDuration: "۱ سال",
  avatarLetter: "م",
  avatarPreview: "",
};

const DASHBOARD_REMINDERS = [
  {
    id: 1,
    title: "ارسال پاسخ وظیفه جدید",
    date: "۱۴۰۵/۰۴/۱۵",
    time: "۱۸:۰۰",
    type: "ددلاین",
  },
  {
    id: 2,
    title: "پیگیری درخواست پشتیبانی",
    date: "۱۴۰۵/۰۳/۱۸",
    time: "۱۰:۰۰",
    type: "یادآوری",
  },
  {
    id: 3,
    title: "بازبینی فایل طرح انتخاب‌شده",
    date: "۱۴۰۵/۰۴/۲۲",
    time: "۲۰:۰۰",
    type: "ددلاین",
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

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v11m0 0l4-4m-4 4l-4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

function getPlanStatusClass(status) {
  const statusMap = {
    "دریافت شده": "received",
    "در انتظار بررسی": "waiting",
    "در حال بررسی": "reviewing",
    "داوری شده": "judged",
    رد: "rejected",
    "رد ضعیف": "weak-rejected",
    قبول: "accepted",
    "قبول ضعیف": "weak-accepted",
  };

  return statusMap[status] || "default";
}

function isFinalJudgementStatus(status) {
  return ["رد", "رد ضعیف", "قبول", "قبول ضعیف"].includes(status);
}

function isEditableSubmittedPlan(status) {
  return status === "در انتظار بررسی";
}

function getDownloadHref(plan) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `این فایل نمونه برای طرح «${plan.title}» است.`,
  )}`;
}

function getFeedbackItems(plan) {
  if (!plan?.feedbacks) {
    return [];
  }

  const items = [];

  if (plan.feedbacks.secretariat) {
    items.push({
      id: "secretariat",
      title: "بازخورد دبیرخانه",
      text: plan.feedbacks.secretariat,
    });
  }

  if (plan.feedbacks.steering) {
    items.push({
      id: "steering",
      title: "بازخورد کمیته راهبری",
      text: plan.feedbacks.steering,
    });
  }

  if (Array.isArray(plan.feedbacks.reviewers)) {
    plan.feedbacks.reviewers.forEach((reviewer, index) => {
      if (!reviewer?.text) {
        return;
      }

      items.push({
        id: `reviewer-${index + 1}`,
        title: `بازخورد داور ${index + 1}`,
        text: reviewer.text,
      });
    });
  }

  return items;
}

function getTaskStatusClass(status) {
  const statusMap = {
    "در انتظار ارسال": "waiting-send",
    "ارسال شده": "submitted",
    "مشاهده شده": "viewed",
    "نیازمند اصلاح": "revision",
    "پایان یافته": "finished",
  };

  return statusMap[status] || "default";
}

function isLockedTaskStatus(status) {
  return ["مشاهده شده", "پایان یافته"].includes(status);
}

function getNearestTaskDeadline(tasks) {
  const activeTask = tasks.find(
    (task) => task.deadline && task.status !== "پایان یافته",
  );

  return activeTask?.deadline || "ددلاین فعالی وجود ندارد";
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

function StatusBadge({ status, className = "" }) {
  const isJudged = status === "داوری شده";

  return (
    <span
      className={`submit-plan__status submit-plan__status--${getPlanStatusClass(
        status,
      )} ${className}`}
    >
      {status}

      {isJudged && (
        <span className="submit-plan__status-info" tabIndex={0}>
          i
          <span className="submit-plan__status-tooltip">
            وضعیت دقیق این طرح پس از تأیید نهایی و انتشار نتایج اعلام خواهد شد.
          </span>
        </span>
      )}
    </span>
  );
}

function SubmitPlanPanel() {
  const [mode, setMode] = useState("list");
  const [submitStep, setSubmitStep] = useState("select");
  const [selectedCallId, setSelectedCallId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [submittedPlans, setSubmittedPlans] = useState(INITIAL_SUBMITTED_PLANS);
  const [planTitle, setPlanTitle] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const selectedCall = CALL_OPTIONS.find((item) => item.id === selectedCallId);
  const hasFile = Boolean(uploadedFile || existingFileName);
  const feedbackItems = getFeedbackItems(selectedPlan);

  const resetForm = () => {
    setSubmitStep("select");
    setSelectedCallId("");
    setUploadedFile(null);
    setExistingFileName("");
    setPlanTitle("");
    setSelectedPlan(null);
    setEditingPlanId(null);
    setSubmitMessage("");
  };

  const openNewPlan = () => {
    resetForm();
    setMode("new");
  };

  const openList = () => {
    resetForm();
    setMode("list");
  };

  const openViewPlan = (plan) => {
    setSelectedPlan(plan);
    setMode("view");
    setSubmitMessage("");
  };

  const openEditPlan = (plan) => {
    if (!isEditableSubmittedPlan(plan.status)) {
      return;
    }

    setMode("edit");
    setSubmitStep("upload");
    setSelectedPlan(plan);
    setEditingPlanId(plan.id);
    setSelectedCallId(plan.callId);
    setPlanTitle(plan.title);
    setExistingFileName(plan.fileName);
    setUploadedFile(null);
    setSubmitMessage("");
  };

  const deletePlan = (planId) => {
    const targetPlan = submittedPlans.find((plan) => plan.id === planId);

    if (!targetPlan || !isEditableSubmittedPlan(targetPlan.status)) {
      return;
    }

    const confirmed = window.confirm("آیا از حذف این طرح مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    setSubmittedPlans((currentPlans) =>
      currentPlans.filter((plan) => plan.id !== planId),
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setUploadedFile(file || null);
    setExistingFileName("");
    setSubmitMessage("");
  };

  const removeCurrentFile = () => {
    setUploadedFile(null);
    setExistingFileName("");
  };

  const handleSubmitPlan = (event) => {
    event.preventDefault();

    if (!selectedCall || !hasFile) {
      return;
    }

    if (mode === "edit" && editingPlanId) {
      setSubmittedPlans((currentPlans) =>
        currentPlans.map((plan) =>
          plan.id === editingPlanId
            ? {
                ...plan,
                title: planTitle || plan.title,
                callId: selectedCall.id,
                call: selectedCall.title,
                deadline: selectedCall.deadline,
                fileName: uploadedFile?.name || existingFileName,
                date: "ویرایش شده: امروز - ساعت ۱۴:۳۰",
              }
            : plan,
        ),
      );

      setSubmitMessage("تغییرات طرح با موفقیت ذخیره شد.");
      setMode("list");
      resetForm();
      return;
    }

    const newPlan = {
      id: Date.now(),
      title: planTitle || "طرح جدید فناورانه",
      callId: selectedCall.id,
      call: selectedCall.title,
      deadline: selectedCall.deadline,
      date: "امروز - ساعت ۱۴:۳۰",
      fileName: uploadedFile.name,
      status: "دریافت شده",
    };

    setSubmittedPlans((currentPlans) => [newPlan, ...currentPlans]);
    setSubmitMessage("طرح شما با موفقیت ارسال شد.");
    setMode("list");
    resetForm();
  };

  return (
    <section className="submit-plan">
      {mode === "list" && (
        <div className="submit-plan__panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>طرح‌های ثبت‌شده</span>
              <h3>لیست طرح‌های ارسال‌شده توسط شما</h3>
            </div>

            <button type="button" onClick={openNewPlan}>
              ارسال طرح جدید
            </button>
          </div>

          <ol className="submit-plan__submitted-list">
            {submittedPlans.map((plan, index) => {
              const canModify = isEditableSubmittedPlan(plan.status);

              return (
                <li className="submit-plan__submitted-card" key={plan.id}>
                  <span className="submit-plan__order">{index + 1}</span>

                  <div className="submit-plan__submitted-info">
                    <h4>{plan.title}</h4>
                    <p>{plan.call}</p>
                    <small>تاریخ ارسال: {plan.date}</small>
                    <small>ددلاین فراخوان: {plan.deadline}</small>
                  </div>

                  <StatusBadge status={plan.status} />

                  <div className="submit-plan__actions">
                    <button
                      type="button"
                      className="submit-plan__action submit-plan__action--view"
                      onClick={() => openViewPlan(plan)}
                    >
                      مشاهده
                    </button>

                    {canModify && (
                      <>
                        <button
                          type="button"
                          className="submit-plan__action submit-plan__action--edit"
                          onClick={() => openEditPlan(plan)}
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          className="submit-plan__action submit-plan__action--delete"
                          onClick={() => deletePlan(plan.id)}
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {mode === "view" && selectedPlan && (
        <div className="submit-plan__panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>مشاهده طرح</span>
              <h3>{selectedPlan.title}</h3>
            </div>

            <button type="button" onClick={openList}>
              بازگشت به لیست
            </button>
          </div>

          <div className="submit-plan__view-card">
            <div>
              <span>فراخوان</span>
              <strong>{selectedPlan.call}</strong>
            </div>

            <div className="submit-plan__view-status">
              <span>وضعیت</span>
              <StatusBadge
                status={selectedPlan.status}
                className="submit-plan__status--inline"
              />
            </div>

            <div>
              <span>تاریخ ارسال</span>
              <strong>{selectedPlan.date}</strong>
            </div>

            <div>
              <span>ددلاین</span>
              <strong>{selectedPlan.deadline}</strong>
            </div>

            <div className="submit-plan__view-file">
              <div>
                <span>فایل پیوست</span>
                <strong>{selectedPlan.fileName}</strong>
              </div>

              <a
                href={getDownloadHref(selectedPlan)}
                download={selectedPlan.fileName}
              >
                <DownloadIcon />
                دانلود فایل
              </a>
            </div>
          </div>

          {isFinalJudgementStatus(selectedPlan.status) &&
            feedbackItems.length > 0 && (
              <section className="submit-plan__feedbacks">
                <div className="submit-plan__feedbacks-header">
                  <span>بازخوردها</span>
                  <h3>بازخوردهای ارزیابی طرح</h3>
                  <p>
                    بازخوردها بدون نمایش نام اعضای دبیرخانه، کمیته راهبری و
                    داوران برای شما نمایش داده می‌شوند.
                  </p>
                </div>

                <div className="submit-plan__feedback-grid">
                  {feedbackItems.map((item) => (
                    <article key={item.id}>
                      <span>{item.title}</span>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {isEditableSubmittedPlan(selectedPlan.status) && (
            <div className="submit-plan__footer-actions">
              <button type="button" onClick={() => openEditPlan(selectedPlan)}>
                ویرایش این طرح
              </button>
            </div>
          )}
        </div>
      )}

      {(mode === "new" || mode === "edit") && (
        <div className="submit-plan__panel">
          <div className="submit-plan__wizard">
            <button
              type="button"
              className={
                submitStep === "select"
                  ? "submit-plan__wizard-step submit-plan__wizard-step--active"
                  : "submit-plan__wizard-step"
              }
              onClick={() => setSubmitStep("select")}
            >
              ۱. انتخاب فراخوان
            </button>

            <button
              type="button"
              className={
                submitStep === "upload"
                  ? "submit-plan__wizard-step submit-plan__wizard-step--active"
                  : "submit-plan__wizard-step"
              }
              disabled={!selectedCallId}
              onClick={() => {
                if (selectedCallId) {
                  setSubmitStep("upload");
                }
              }}
            >
              ۲. بارگذاری و ارسال
            </button>
          </div>

          {submitStep === "select" && (
            <>
              <div className="submit-plan__panel-header">
                <div>
                  <span>مرحله اول</span>
                  <h3>نوع فراخوان را انتخاب کنید</h3>
                </div>
              </div>

              <div className="submit-plan__call-grid">
                {CALL_OPTIONS.map((call) => (
                  <button
                    type="button"
                    key={call.id}
                    className={
                      selectedCallId === call.id
                        ? "submit-plan__call-card submit-plan__call-card--active"
                        : "submit-plan__call-card"
                    }
                    onClick={() => setSelectedCallId(call.id)}
                  >
                    <span>{call.status}</span>
                    <h4>{call.title}</h4>
                    <p>{call.field}</p>
                    <strong>ددلاین: {call.deadline}</strong>
                  </button>
                ))}
              </div>

              <div className="submit-plan__footer-actions">
                <button type="button" onClick={openList}>
                  بازگشت
                </button>

                <button
                  type="button"
                  disabled={!selectedCallId}
                  onClick={() => setSubmitStep("upload")}
                >
                  ادامه به مرحله آپلود
                </button>
              </div>
            </>
          )}

          {submitStep === "upload" && selectedCall && (
            <form
              className="submit-plan__upload-form"
              onSubmit={handleSubmitPlan}
            >
              <div className="submit-plan__deadline-box">
                <span>
                  {mode === "edit" ? "ویرایش طرح" : "فراخوان انتخاب‌شده"}
                </span>
                <h4>{selectedCall.title}</h4>
                <p>{selectedCall.field}</p>
                <strong>ددلاین ارسال: {selectedCall.deadline}</strong>
              </div>

              <label className="submit-plan__input-group">
                <span>عنوان طرح</span>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(event) => setPlanTitle(event.target.value)}
                  placeholder="عنوان طرح را وارد کنید"
                />
              </label>

              {hasFile && (
                <div className="submit-plan__current-file">
                  <div>
                    <span>فایل فعلی</span>
                    <strong>{uploadedFile?.name || existingFileName}</strong>
                  </div>

                  <button type="button" onClick={removeCurrentFile}>
                    حذف فایل
                  </button>
                </div>
              )}

              <label className="submit-plan__upload-box">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={handleFileChange}
                />

                <span>
                  {hasFile
                    ? "برای جایگزینی فایل، فایل جدید انتخاب کنید"
                    : "فایل پروپوزال یا مستندات طرح را آپلود کنید"}
                </span>

                <strong>PDF, DOC, DOCX یا ZIP</strong>
              </label>

              <div className="submit-plan__footer-actions">
                <button
                  type="button"
                  onClick={() =>
                    mode === "edit" ? openList() : setSubmitStep("select")
                  }
                >
                  {mode === "edit"
                    ? "انصراف از ویرایش"
                    : "بازگشت به انتخاب فراخوان"}
                </button>

                <button
                  type="submit"
                  className={mode === "edit" ? "submit-plan__edit-submit" : ""}
                  disabled={!hasFile}
                >
                  {mode === "edit" ? "ذخیره تغییرات" : "ارسال طرح"}
                </button>
              </div>
            </form>
          )}

          {submitMessage && (
            <p className="submit-plan__success-message">{submitMessage}</p>
          )}
        </div>
      )}
    </section>
  );
}

function SelectedPlansPanel() {
  const acceptedPlans = INITIAL_SUBMITTED_PLANS.filter((plan) =>
    ACCEPTED_PLAN_STATUSES.includes(plan.status),
  );

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [projectTasks, setProjectTasks] = useState(INITIAL_SELECTED_PLAN_TASKS);
  const [taskSubmitMessage, setTaskSubmitMessage] = useState("");

  const selectedPlan = acceptedPlans.find((plan) => plan.id === selectedPlanId);
  const selectedPlanTasks = selectedPlan
    ? projectTasks[selectedPlan.id] || []
    : [];
  const selectedTask = selectedPlanTasks.find(
    (task) => task.id === selectedTaskId,
  );

  const openPlan = (planId) => {
    setSelectedPlanId(planId);
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const closePlan = () => {
    setSelectedPlanId(null);
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const updateTask = (planId, taskId, updates) => {
    setProjectTasks((currentTasks) => ({
      ...currentTasks,
      [planId]: (currentTasks[planId] || []).map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const openTask = (taskId) => {
    const task = selectedPlanTasks.find((item) => item.id === taskId);

    if (selectedPlan && task?.isNew) {
      updateTask(selectedPlan.id, taskId, {
        isNew: false,
      });
    }

    setSelectedTaskId(taskId);
    setTaskSubmitMessage("");
  };

  const closeTask = () => {
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const handleTaskFileChange = (planId, taskId, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateTask(planId, taskId, {
      fileName: file.name,
    });
  };

  const removeTaskFile = (planId, taskId) => {
    updateTask(planId, taskId, {
      fileName: "",
    });
  };

  const saveTaskResponse = (planId, taskId) => {
    updateTask(planId, taskId, {
      status: "ارسال شده",
      isNew: false,
    });

    setTaskSubmitMessage("پاسخ شما با موفقیت برای مدیر ارسال شد.");

    window.setTimeout(() => {
      setTaskSubmitMessage("");
      setSelectedTaskId(null);
    }, 1100);
  };

  if (selectedPlan && selectedTask) {
    const hasDeadline =
      selectedTask.deadline && selectedTask.status !== "پایان یافته";

    const taskIsLocked = isLockedTaskStatus(selectedTask.status);

    return (
      <section className="selected-plans">
        <div className="selected-plans__panel">
          <div className="selected-plans__panel-header">
            <div>
              <span>جزئیات وظیفه</span>
              <h3>{selectedTask.title}</h3>
              <p>{selectedPlan.title}</p>
            </div>

            <button
              type="button"
              className="selected-plans__back-button"
              onClick={closeTask}
            >
              <BackIcon />
              بازگشت به وظایف
            </button>
          </div>

          <div
            className={`selected-plans__task-detail-hero ${
              hasDeadline ? "" : "selected-plans__task-detail-hero--single"
            }`}
          >
            {hasDeadline && (
              <div>
                <span>ددلاین وظیفه</span>
                <strong>{selectedTask.deadline}</strong>
              </div>
            )}

            <div>
              <span>وضعیت وظیفه</span>
              <b
                className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                  selectedTask.status,
                )}`}
              >
                {selectedTask.status}
              </b>
            </div>
          </div>

          <div className="selected-plans__message-grid">
            <div>
              <span>پیام یا توضیحات مدیر</span>
              <p>{selectedTask.managerMessage || "پیامی ثبت نشده است."}</p>
            </div>

            <div>
              <span>بازخورد مدیر</span>
              <p>
                {selectedTask.managerFeedback ||
                  "هنوز بازخوردی از طرف مدیر ثبت نشده است."}
              </p>
            </div>
          </div>

          <label className="selected-plans__description">
            <span>توضیحات شما</span>
            <textarea
              value={selectedTask.description}
              readOnly={taskIsLocked}
              onChange={(event) =>
                updateTask(selectedPlan.id, selectedTask.id, {
                  description: event.target.value,
                })
              }
              placeholder="توضیحات خود را برای مدیر وارد کنید..."
            />
          </label>

          <div className="selected-plans__upload-row">
            <div className="selected-plans__file-box">
              <span>فایل ارسالی</span>

              {selectedTask.fileName ? (
                <strong>{selectedTask.fileName}</strong>
              ) : (
                <strong>هنوز فایلی بارگذاری نشده است</strong>
              )}
            </div>

            {!taskIsLocked && (
              <div className="selected-plans__task-actions">
                <label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(event) =>
                      handleTaskFileChange(
                        selectedPlan.id,
                        selectedTask.id,
                        event,
                      )
                    }
                  />
                  {selectedTask.fileName ? "ویرایش فایل" : "آپلود فایل"}
                </label>

                {selectedTask.fileName && (
                  <button
                    type="button"
                    onClick={() =>
                      removeTaskFile(selectedPlan.id, selectedTask.id)
                    }
                  >
                    حذف فایل
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    saveTaskResponse(selectedPlan.id, selectedTask.id)
                  }
                >
                  ارسال پاسخ
                </button>
              </div>
            )}
          </div>

          {taskIsLocked && (
            <div className="selected-plans__locked-note">
              این وظیفه قابل ویرایش، حذف فایل یا ارسال مجدد نیست.
            </div>
          )}

          {taskSubmitMessage && (
            <p className="selected-plans__success-message">
              {taskSubmitMessage}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (selectedPlan) {
    const selectedNearestDeadline = getNearestTaskDeadline(selectedPlanTasks);

    return (
      <section className="selected-plans">
        <div className="selected-plans__panel">
          <div className="selected-plans__panel-header">
            <div>
              <span>طرح انتخاب‌شده</span>
              <h3>{selectedPlan.title}</h3>
              <p>{selectedPlan.call}</p>
            </div>

            <button
              type="button"
              className="selected-plans__back-button"
              onClick={closePlan}
            >
              <BackIcon />
              بازگشت به طرح‌ها
            </button>
          </div>

          <div className="selected-plans__summary">
            <div>
              <span>وضعیت طرح</span>
              <StatusBadge
                status={selectedPlan.status}
                className="submit-plan__status--inline"
              />
            </div>

            <div>
              <span>تعداد وظایف</span>
              <strong>{selectedPlanTasks.length} وظیفه</strong>
            </div>

            <div>
              <span>نزدیک‌ترین ددلاین</span>
              <strong>{selectedNearestDeadline}</strong>
            </div>

            <div>
              <span>فایل اصلی طرح</span>
              <a
                href={getDownloadHref(selectedPlan)}
                download={selectedPlan.fileName}
              >
                <DownloadIcon />
                دانلود فایل
              </a>
            </div>
          </div>

          <section className="selected-plans__tasks">
            <div className="selected-plans__section-title">
              <span>وظایف</span>
              <h3>وظایف تعریف‌شده توسط مدیر سامانه</h3>
              <p>
                هر وظیفه شامل ددلاین، وضعیت، توضیحات مدیر، محل بارگذاری فایل و
                توضیحات شما است.
              </p>
            </div>

            <div className="selected-plans__task-card-grid">
              {selectedPlanTasks.map((task) => {
                const hasDeadline =
                  task.deadline && task.status !== "پایان یافته";

                return (
                  <article
                    className="selected-plans__task-preview-card"
                    key={task.id}
                  >
                    <div className="selected-plans__task-preview-top">
                      <div className="selected-plans__task-title-wrap">
                        <h4>
                          <span>{task.title}</span>

                          {task.isNew && (
                            <span className="selected-plans__new-label">
                              جدید
                            </span>
                          )}
                        </h4>
                      </div>

                      <span
                        className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {hasDeadline ? (
                      <div className="selected-plans__deadline-pill">
                        <span>ددلاین</span>
                        <strong>{task.deadline}</strong>
                      </div>
                    ) : (
                      <div
                        className="selected-plans__deadline-placeholder"
                        aria-hidden="true"
                      />
                    )}

                    <p>{task.managerMessage}</p>

                    <button type="button" onClick={() => openTask(task.id)}>
                      مشاهده وظیفه
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="selected-plans">
      <div className="selected-plans__panel">
        <div className="selected-plans__panel-header">
          <div>
            <span>طرح‌های انتخاب‌شده</span>
            <h3>طرح‌های قبول‌شده یا قبول ضعیف</h3>
            <p>
              این بخش فقط شامل طرح‌هایی است که نتیجه نهایی آن‌ها قبول یا قبول
              ضعیف اعلام شده است.
            </p>
          </div>
        </div>

        <div className="selected-plans__grid">
          {acceptedPlans.map((plan) => {
            const planTasks = projectTasks[plan.id] || [];
            const hasNewTask = planTasks.some((task) => task.isNew);
            const nearestDeadline = getNearestTaskDeadline(planTasks);

            return (
              <article className="selected-plans__card" key={plan.id}>
                <div className="selected-plans__card-top">
                  <StatusBadge
                    status={plan.status}
                    className="submit-plan__status--inline"
                  />

                  {hasNewTask && (
                    <span className="selected-plans__project-new-badge">
                      وظیفه جدید
                    </span>
                  )}
                </div>

                <h4>{plan.title}</h4>
                <p>{plan.call}</p>

                <div className="selected-plans__meta">
                  <span>تعداد وظایف: {planTasks.length} وظیفه</span>
                  <span>نزدیک‌ترین ددلاین: {nearestDeadline}</span>
                </div>

                <button type="button" onClick={() => openPlan(plan.id)}>
                  ورود به طرح
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SupportRequestsPanel() {
  const [requests, setRequests] = useState(INITIAL_SUPPORT_REQUESTS);
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );

  const openNewRequest = () => {
    setMode("new");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
  };

  const openList = () => {
    setMode("list");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
  };

  const openRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setMode("view");
  };

  const deleteRequest = (requestId) => {
    const targetRequest = requests.find((request) => request.id === requestId);

    if (!targetRequest || targetRequest.seenBySupport) {
      return;
    }

    const confirmed = window.confirm("آیا از حذف این درخواست مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== requestId),
    );
  };

  const submitRequest = (event) => {
    event.preventDefault();

    if (!requestMessage.trim()) {
      return;
    }

    const newRequest = {
      id: Date.now(),
      title: requestTitle.trim() || "درخواست جدید",
      message: requestMessage.trim(),
      sentAt: getCurrentPersianDateTime(),
      status: "در انتظار پیگیری",
      seenBySupport: false,
      supportReply: "",
      repliedAt: "",
    };

    setRequests((currentRequests) => [newRequest, ...currentRequests]);
    openList();
  };

  if (mode === "new") {
    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>درخواست جدید</span>
              <h3>ثبت درخواست پشتیبانی</h3>
              <p>
                درخواست شما به‌صورت متنی ثبت می‌شود و پس از مشاهده توسط پشتیبان،
                امکان حذف آن وجود نخواهد داشت.
              </p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <form className="support-requests__form" onSubmit={submitRequest}>
            <label>
              <span>عنوان درخواست</span>
              <input
                type="text"
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                placeholder="مثلاً مشکل در بارگذاری فایل"
              />
            </label>

            <label>
              <span>متن درخواست</span>
              <textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="متن درخواست خود را وارد کنید..."
              />
            </label>

            <div className="support-requests__form-actions">
              <button
                type="button"
                className="support-requests__neutral-button"
                onClick={openList}
              >
                انصراف
              </button>

              <button type="submit" disabled={!requestMessage.trim()}>
                ثبت درخواست
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (mode === "view" && selectedRequest) {
    const canDelete = !selectedRequest.seenBySupport;
    const hasReply = Boolean(selectedRequest.supportReply);

    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>جزئیات درخواست</span>
              <h3>{selectedRequest.title}</h3>
              <p>ارسال شده در {selectedRequest.sentAt}</p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <div className="support-requests__detail-grid support-requests__detail-grid--compact">
            <div>
              <span>زمان ارسال</span>
              <strong>{selectedRequest.sentAt}</strong>
            </div>

            <div>
              <span>زمان پاسخ</span>
              <strong>
                {hasReply ? selectedRequest.repliedAt : "هنوز پاسخ ثبت نشده"}
              </strong>
            </div>
          </div>

          <div className="support-requests__conversation">
            <article className="support-requests__message support-requests__message--user">
              <span>پیام شما</span>
              <p>{selectedRequest.message}</p>
            </article>

            {hasReply ? (
              <article className="support-requests__message support-requests__message--support">
                <span>پاسخ پشتیبان</span>
                <p>{selectedRequest.supportReply}</p>
              </article>
            ) : (
              <article className="support-requests__empty-reply">
                هنوز پاسخی برای این درخواست ثبت نشده است.
              </article>
            )}
          </div>

          {canDelete && (
            <div className="support-requests__detail-actions">
              <button
                type="button"
                className="support-requests__delete-button"
                onClick={() => {
                  deleteRequest(selectedRequest.id);
                  openList();
                }}
              >
                حذف درخواست
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="support-requests">
      <div className="support-requests__panel">
        <div className="support-requests__panel-header">
          <div>
            <span>درخواست‌ها</span>
            <h3>درخواست‌های پشتیبانی شما</h3>
            <p>
              درخواست‌های قبلی، وضعیت بررسی و پاسخ‌های پشتیبان در این بخش نمایش
              داده می‌شوند.
            </p>
          </div>

          <button type="button" onClick={openNewRequest}>
            ثبت درخواست جدید
          </button>
        </div>

        <div className="support-requests__list">
          {requests.map((request) => {
            const hasReply = Boolean(request.supportReply);
            const canDelete = !request.seenBySupport;

            return (
              <article className="support-requests__card" key={request.id}>
                <div className="support-requests__card-main">
                  <div className="support-requests__card-title">
                    <h4>{request.title}</h4>

                    {hasReply && (
                      <span className="support-requests__reply-badge">
                        پاسخ دریافت شده
                      </span>
                    )}

                    {!hasReply && request.status === "در انتظار پیگیری" && (
                      <span className="support-requests__waiting-badge">
                        در انتظار پیگیری
                      </span>
                    )}

                    {!hasReply && request.status === "در حال پیگیری" && (
                      <span className="support-requests__progress-badge">
                        در حال پیگیری
                      </span>
                    )}
                  </div>

                  <p>{request.message}</p>

                  <div className="support-requests__meta">
                    <span>ارسال: {request.sentAt}</span>
                    <span>
                      پاسخ: {hasReply ? request.repliedAt : "در انتظار پاسخ"}
                    </span>
                  </div>
                </div>

                <div className="support-requests__actions">
                  <button type="button" onClick={() => openRequest(request.id)}>
                    مشاهده
                  </button>

                  {canDelete && (
                    <button
                      type="button"
                      className="support-requests__delete-button"
                      onClick={() => deleteRequest(request.id)}
                    >
                      حذف
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MessagesPanel() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [filter, setFilter] = useState("all");

  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId,
  );

  const unreadCount = messages.filter((message) => !message.isRead).length;
  const importantCount = messages.filter(
    (message) => message.isImportant,
  ).length;

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") {
      return !message.isRead;
    }

    if (filter === "important") {
      return message.isImportant;
    }

    return true;
  });

  const openMessage = (messageId) => {
    setSelectedMessageId(messageId);

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message,
      ),
    );
  };

  const closeMessage = () => {
    setSelectedMessageId(null);
  };

  const markAllAsRead = () => {
    setMessages((currentMessages) =>
      currentMessages.map((message) => ({ ...message, isRead: true })),
    );
  };

  const deleteMessage = (messageId) => {
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );

    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
  };

  const deleteAllMessages = () => {
    const confirmed = window.confirm("آیا از حذف همه پیام‌ها مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    setMessages([]);
    setSelectedMessageId(null);
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <div className="messages-panel__panel">
          <div className="messages-panel__panel-header">
            <div>
              <span>{selectedMessage.category}</span>
              <h3>{selectedMessage.title}</h3>
              <p>{selectedMessage.sentAt}</p>
            </div>

            <button
              type="button"
              className="messages-panel__back-button"
              onClick={closeMessage}
            >
              بازگشت به پیام‌ها
            </button>
          </div>

          <article className="messages-panel__detail-card">
            {selectedMessage.isImportant && (
              <span className="messages-panel__important-badge">مهم</span>
            )}

            <p>{selectedMessage.body}</p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="messages-panel">
      <div className="messages-panel__panel">
        <div className="messages-panel__panel-header">
          <div>
            <span>پیام‌ها و اعلانات</span>
            <h3>لیست پیام‌های سامانه</h3>
            <p>
              اعلان‌ها، یادآوری‌ها و پیام‌های مرتبط با طرح‌ها و درخواست‌های شما
              در این بخش قرار می‌گیرند.
            </p>
          </div>

          <div className="messages-panel__header-actions">
            <button type="button" onClick={markAllAsRead}>
              خواندن همه
            </button>

            <button
              type="button"
              className="messages-panel__delete-all-button"
              onClick={deleteAllMessages}
              aria-label="حذف همه پیام‌ها"
              title="حذف همه پیام‌ها"
              disabled={messages.length === 0}
            >
              🗑
            </button>
          </div>
        </div>

        <div className="messages-panel__filters">
          <button
            type="button"
            className={filter === "all" ? "messages-panel__filter--active" : ""}
            onClick={() => setFilter("all")}
          >
            همه پیام‌ها
            <span className="messages-panel__filter-count">
              {messages.length}
            </span>
          </button>

          <button
            type="button"
            className={
              filter === "unread" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("unread")}
          >
            خوانده‌نشده
            <span className="messages-panel__filter-count">{unreadCount}</span>
          </button>

          <button
            type="button"
            className={
              filter === "important" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("important")}
          >
            مهم
            <span className="messages-panel__filter-count">
              {importantCount}
            </span>
          </button>
        </div>

        <div className="messages-panel__list">
          {filteredMessages.map((message) => (
            <article
              className={`messages-panel__card ${
                message.isRead ? "messages-panel__card--read" : ""
              }`}
              key={message.id}
            >
              <div className="messages-panel__card-main">
                <div className="messages-panel__title-row">
                  <h4>{message.title}</h4>

                  {!message.isRead && (
                    <span className="messages-panel__unread-badge">جدید</span>
                  )}

                  {message.isImportant && (
                    <span className="messages-panel__important-badge">مهم</span>
                  )}
                </div>

                <p>{message.body}</p>

                <div className="messages-panel__meta">
                  <span>{message.category}</span>
                  <span>{message.sentAt}</span>
                </div>
              </div>

              <div className="messages-panel__card-actions">
                <button
                  type="button"
                  className="messages-panel__view-button"
                  onClick={() => openMessage(message.id)}
                >
                  مشاهده پیام
                </button>

                <button
                  type="button"
                  className="messages-panel__delete-message-button"
                  onClick={() => deleteMessage(message.id)}
                  aria-label="حذف پیام"
                  title="حذف پیام"
                >
                  ×
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
  const categories = [
    "همه",
    ...new Set(FAQ_ITEMS.map((item) => item.category)),
  ];

  const [activeCategory, setActiveCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [openQuestionId, setOpenQuestionId] = useState(
    FAQ_ITEMS[0]?.id || null,
  );

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "همه" || item.category === activeCategory;

    const matchesSearch =
      item.question.includes(searchTerm) || item.answer.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? null : questionId,
    );
  };

  return (
    <section className="faq-panel">
      <div className="faq-panel__panel">
        <div className="faq-panel__panel-header">
          <div>
            <span>سوالات متداول</span>
            <h3>راهنمای سریع استفاده از داشبورد</h3>
            <p>
              پاسخ سوالات پرتکرار درباره فراخوان‌ها، طرح‌ها، وظایف، درخواست‌ها و
              پیام‌های سامانه.
            </p>
          </div>
        </div>

        <div className="faq-panel__tools">
          <label>
            <span>جست‌وجو در سوالات</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="عبارت موردنظر را وارد کنید..."
            />
          </label>

          <div className="faq-panel__categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "faq-panel__category--active"
                    : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-panel__list">
          {filteredItems.map((item) => {
            const isOpen = openQuestionId === item.id;

            return (
              <article
                className={`faq-panel__item ${
                  isOpen ? "faq-panel__item--open" : ""
                }`}
                key={item.id}
              >
                <button type="button" onClick={() => toggleQuestion(item.id)}>
                  <span>{item.category}</span>
                  <strong>{item.question}</strong>
                  <i>{isOpen ? "−" : "+"}</i>
                </button>

                {isOpen && <p>{item.answer}</p>}
              </article>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="faq-panel__empty">
              سوالی با این عبارت یا دسته‌بندی پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardHomePanel() {
  const submittedPlans = INITIAL_SUBMITTED_PLANS;
  const acceptedPlans = submittedPlans.filter((plan) =>
    ACCEPTED_PLAN_STATUSES.includes(plan.status),
  );

  const latestSubmittedPlan = submittedPlans[0];
  const latestSelectedPlan = acceptedPlans[0] || null;
  const participatedCallsCount = new Set(
    submittedPlans.map((plan) => plan.callId),
  ).size;

  const selectedPlanTasks = latestSelectedPlan
    ? INITIAL_SELECTED_PLAN_TASKS[latestSelectedPlan.id] || []
    : [];

  const activeDeadlines = selectedPlanTasks
    .filter((task) => task.deadline && task.status !== "پایان یافته")
    .slice(0, 3);

  const stats = [
    {
      label: "طرح‌های ارسالی",
      value: submittedPlans.length,
      hint: "کل طرح‌های ثبت‌شده",
    },
    {
      label: "طرح‌های قبول‌شده",
      value: acceptedPlans.length,
      hint: "قبول و قبول ضعیف",
    },
    {
      label: "فراخوان‌های شرکت‌کرده",
      value: participatedCallsCount,
      hint: "بر اساس طرح‌های ارسالی",
    },
    {
      label: "حمایت‌های دریافت‌شده",
      value: acceptedPlans.length,
      hint: "حمایت‌های قابل پیگیری",
    },
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-home__stats">
        {stats.map((item) => (
          <article className="dashboard-home__stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </article>
        ))}
      </div>

      <article className="dashboard-home__recent-card">
        <div>
          <span>طرح اخیر</span>
          <h3>{latestSubmittedPlan.title}</h3>
          <p>{latestSubmittedPlan.call}</p>
        </div>

        <div className="dashboard-home__recent-meta">
          <StatusBadge
            status={latestSubmittedPlan.status}
            className="submit-plan__status--inline"
          />
          <small>ارسال: {latestSubmittedPlan.date}</small>
        </div>
      </article>

      <div className="dashboard-home__workspace-grid">
        <section className="dashboard-home__selected-plan">
          {latestSelectedPlan ? (
            <>
              <div className="dashboard-home__section-head">
                <span>آخرین طرح انتخاب‌شده</span>
                <h3>{latestSelectedPlan.title}</h3>
                <p>{latestSelectedPlan.call}</p>
              </div>

              <div className="dashboard-home__selected-summary">
                <div>
                  <span>وضعیت</span>
                  <StatusBadge
                    status={latestSelectedPlan.status}
                    className="submit-plan__status--inline"
                  />
                </div>
                <div>
                  <span>تعداد وظایف</span>
                  <strong>{selectedPlanTasks.length} وظیفه</strong>
                </div>
                <div>
                  <span>نزدیک‌ترین ددلاین</span>
                  <strong>{getNearestTaskDeadline(selectedPlanTasks)}</strong>
                </div>
              </div>

              <div className="dashboard-home__task-mini-list">
                {selectedPlanTasks.slice(0, 3).map((task) => (
                  <article key={task.id}>
                    <div>
                      <h4>{task.title}</h4>
                      <span>{task.deadline || "بدون ددلاین فعال"}</span>
                    </div>
                    <b
                      className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                        task.status,
                      )}`}
                    >
                      {task.status}
                    </b>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="dashboard-home__empty-selected">
              هنوز طرح انتخاب‌شده‌ای برای نمایش وجود ندارد.
            </div>
          )}
        </section>

        <section className="dashboard-home__desk">
          <div className="dashboard-home__section-head">
            <span>میزکار</span>
            <h3>تقویم ددلاین‌ها و یادآوری‌ها</h3>
            <p>ددلاین‌های فعال و کارهای نزدیک را از این بخش پیگیری کنید.</p>
          </div>

          <div className="dashboard-home__deadline-calendar">
            {activeDeadlines.map((task) => (
              <article key={task.id}>
                <div>
                  <span>ددلاین</span>
                  <strong>{task.deadline}</strong>
                </div>
                <p>{task.title}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-home__reminders">
            {DASHBOARD_REMINDERS.map((reminder) => (
              <article key={reminder.id}>
                <div>
                  <span>{reminder.type}</span>
                  <strong>{reminder.date}</strong>
                </div>
                <p>{reminder.title}</p>
                <small>ساعت {reminder.time}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ProfileAvatar({ profile, size = "normal" }) {
  return profile.avatarPreview ? (
    <img
      className={`profile-panel__avatar profile-panel__avatar--${size}`}
      src={profile.avatarPreview}
      alt={`${profile.firstName} ${profile.lastName}`}
    />
  ) : (
    <span className={`profile-panel__avatar profile-panel__avatar--${size}`}>
      {profile.avatarLetter || profile.firstName?.[0] || "ف"}
    </span>
  );
}

function ProfilePanel({ profile, onEdit }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__card profile-panel__hero-card">
        <ProfileAvatar profile={profile} size="large" />

        <div>
          <span>پروفایل کاربری</span>
          <h3>
            {profile.firstName} {profile.lastName}
          </h3>
          <p>{profile.level}</p>
        </div>

        <button type="button" onClick={onEdit}>
          ویرایش پروفایل
        </button>
      </div>

      <div className="profile-panel__info-grid">
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
          <strong>{profile.level}</strong>
        </article>
        <article>
          <span>سابقه عضویت</span>
          <strong>
            عضو از سال {profile.memberSince} - به مدت{" "}
            {profile.membershipDuration}
          </strong>
        </article>
      </div>
    </section>
  );
}

function ProfileEditPanel({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateField("avatarPreview", URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setMessage("رمز عبور جدید و تکرار آن یکسان نیست.");
      return;
    }

    const nextProfile = {
      ...formData,
      avatarLetter: formData.firstName?.[0] || profile.avatarLetter || "ف",
    };

    onSave(nextProfile);
    setMessage("تغییرات پروفایل با موفقیت ذخیره شد.");
  };

  return (
    <section className="profile-panel">
      <form className="profile-panel__edit-card" onSubmit={handleSubmit}>
        <div className="profile-panel__edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات کاربری و رمز عبور</h3>
          </div>

          <button type="button" onClick={onCancel}>
            بازگشت به پروفایل
          </button>
        </div>

        <div className="profile-panel__avatar-edit">
          <ProfileAvatar profile={formData} size="large" />
          <label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            تغییر تصویر پروفایل
          </label>
        </div>

        <div className="profile-panel__form-grid">
          <label>
            <span>نام</span>
            <input
              type="text"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </label>

          <label>
            <span>نام خانوادگی</span>
            <input
              type="text"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
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
        </div>

        <div className="profile-panel__password-box">
          <div>
            <span>تغییر رمز عبور</span>
            <p>در صورت نیاز، رمز فعلی و رمز جدید را وارد کنید.</p>
          </div>

          <div className="profile-panel__form-grid">
            <label>
              <span>رمز عبور فعلی</span>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>تکرار رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
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

        {message && <p className="profile-panel__message">{message}</p>}
      </form>
    </section>
  );
}

function GenericDashboardContent({ currentSection, activeSubItem }) {
  const activeSubItemLabel = NAV_ITEMS.flatMap(
    (item) => item.subItems || [],
  ).find((subItem) => subItem.id === activeSubItem)?.label;

  return (
    <>
      <section className="innovator-dashboard__hero">
        <div className="innovator-dashboard__hero-content">
          <span className="innovator-dashboard__hero-chip">
            پنل اختصاصی فناور
          </span>

          <h2>مدیریت متمرکز فراخوان‌ها، درخواست‌ها و مسیر ارتباط با سامانه</h2>

          <p>
            این داشبورد برای مدیریت یکپارچه فعالیت‌های شما طراحی شده است؛ از
            مشاهده فراخوان‌ها و پیگیری درخواست‌ها تا دریافت اعلان‌ها، منابع
            آموزشی و پشتیبانی.
          </p>

          <div className="innovator-dashboard__hero-buttons">
            <button type="button">{currentSection.actionLabel}</button>

            <button type="button" className="innovator-dashboard__ghost-btn">
              سفارشی‌سازی داشبورد
            </button>
          </div>
        </div>

        <div className="innovator-dashboard__hero-side">
          <div className="innovator-dashboard__hero-block">
            <span>کاربر فعال</span>
            <strong>فناور</strong>
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

      <section className="innovator-dashboard__summary-grid">
        {SUMMARY_CARDS.map((card) => (
          <article
            key={card.label}
            className="innovator-dashboard__summary-card"
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="innovator-dashboard__content-grid">
        <div className="innovator-dashboard__panel innovator-dashboard__panel--wide">
          <div className="innovator-dashboard__panel-header">
            <div>
              <span>بخش فعال</span>
              <h3>{currentSection.primaryTitle}</h3>
            </div>

            <button type="button">مشاهده همه</button>
          </div>

          <div className="innovator-dashboard__feature-list">
            {currentSection.primaryItems.map((item) => (
              <article
                key={item.title}
                className="innovator-dashboard__feature-item"
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

          <div className="innovator-dashboard__placeholder-note">
            جزئیات و زیرمنوهای کامل این بخش در مرحله بعدی به داشبورد اضافه
            می‌شوند.
          </div>
        </div>

        <div className="innovator-dashboard__stack">
          <div className="innovator-dashboard__panel">
            <div className="innovator-dashboard__panel-header">
              <div>
                <span>زیرمنوی فعال</span>
                <h3>{activeSubItemLabel || currentSection.sideTitle}</h3>
              </div>
            </div>

            <ul className="innovator-dashboard__quick-list">
              {currentSection.sideItems.map((item) => (
                <li key={item}>
                  <button type="button">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="innovator-dashboard__panel">
            <div className="innovator-dashboard__panel-header">
              <div>
                <span>آخرین فعالیت‌ها</span>
                <h3>رویدادهای اخیر</h3>
              </div>
            </div>

            <ul className="innovator-dashboard__activity-list">
              {RECENT_ACTIVITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function InnovatorDashboardPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState(INITIAL_RECENT_MESSAGES);
  const [userProfile, setUserProfile] = useState(INITIAL_USER_PROFILE);

  const currentSection = useMemo(
    () => SECTION_DATA[activeSection],
    [activeSection],
  );

  const unreadMessagesCount = recentMessages.filter(
    (item) => !item.isRead,
  ).length;

  const resetCurrentContent = () => {
    setContentResetKey((currentKey) => currentKey + 1);
  };

  const openInternalPage = (sectionId) => {
    setActiveSection(sectionId);
    setActiveSubItem("");
    setOpenMenuId("");
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
    resetCurrentContent();
  };

  const handleLogout = () => {
    navigate("/auth");
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

  const markMessageAsRead = (messageId) => {
    setRecentMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message,
      ),
    );
  };

  const shouldShowSubmitPlan =
    activeSection === "calls" && activeSubItem === "submit-plan";

  const shouldShowSelectedPlans =
    activeSection === "calls" && activeSubItem === "selected-plans";

  const shouldShowDashboard = activeSection === "dashboard";
  const shouldShowRequests = activeSection === "requests";
  const shouldShowMessages = activeSection === "messages";
  const shouldShowFaq = activeSection === "faq";
  const shouldShowProfile = activeSection === "profile";
  const shouldShowEditProfile = activeSection === "edit-profile";

  return (
    <main
      className={`innovator-dashboard ${
        isSidebarCollapsed ? "innovator-dashboard--collapsed" : ""
      }`}
    >
      <aside className="innovator-dashboard__sidebar">
        <div className="innovator-dashboard__sidebar-top">
          <div className="innovator-dashboard__sidebar-head">
            <button
              type="button"
              className="innovator-dashboard__menu-button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label="باز و بسته کردن منوی داشبورد"
            >
              <MenuIcon />
            </button>

            <Link to="/" className="innovator-dashboard__brand">
              <img src={universityLogo} alt="لوگوی دانشگاه تهران" />

              <div className="innovator-dashboard__brand-text">
                <strong>هاتف</strong>
              </div>
            </Link>
          </div>

          <nav className="innovator-dashboard__nav">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const hasSubItems = Boolean(item.subItems?.length);
              const isOpen = openMenuId === item.id;

              return (
                <div className="innovator-dashboard__nav-group" key={item.id}>
                  <button
                    type="button"
                    className={`innovator-dashboard__nav-item ${
                      isActive ? "innovator-dashboard__nav-item--active" : ""
                    }`}
                    onClick={() => handleNavClick(item)}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="innovator-dashboard__nav-icon">
                      {item.icon}
                    </span>

                    <span className="innovator-dashboard__nav-text">
                      {item.label}
                    </span>

                    {hasSubItems && !isSidebarCollapsed && (
                      <span className="innovator-dashboard__nav-chevron">
                        <ChevronIcon isOpen={isOpen} />
                      </span>
                    )}
                  </button>

                  {hasSubItems && !isSidebarCollapsed && (
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
                            activeSubItem === subItem.id
                              ? "innovator-dashboard__subnav-item--active"
                              : ""
                          }`}
                          onClick={() => handleSubNavClick(item.id, subItem.id)}
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

      <section className="innovator-dashboard__main">
        <header className="innovator-dashboard__topbar">
          <div className="innovator-dashboard__topbar-title">
            <DashboardDateTime />

            <h1>{currentSection.title}</h1>
          </div>

          <div className="innovator-dashboard__topbar-actions">
            <div className="innovator-dashboard__notification-menu">
              <button
                type="button"
                className="innovator-dashboard__notification-trigger"
                onClick={() => {
                  setIsNotificationOpen((current) => !current);
                  setIsProfileMenuOpen(false);
                }}
                aria-label="نمایش پیام‌های اخیر"
              >
                <BellIcon />

                {unreadMessagesCount > 0 && <span>{unreadMessagesCount}</span>}
              </button>

              {isNotificationOpen && (
                <div className="innovator-dashboard__notification-dropdown">
                  <div className="innovator-dashboard__notification-header">
                    <strong>پیام‌های اخیر</strong>
                    <small>{unreadMessagesCount} خوانده‌نشده</small>
                  </div>

                  <div className="innovator-dashboard__notification-list">
                    {recentMessages.map((message) => (
                      <article
                        key={message.id}
                        className={`innovator-dashboard__notification-item ${
                          message.isRead
                            ? "innovator-dashboard__notification-item--read"
                            : ""
                        }`}
                      >
                        <div>
                          <h4>{message.title}</h4>
                          <p>{message.time}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => markMessageAsRead(message.id)}
                          disabled={message.isRead}
                        >
                          {message.isRead ? "خوانده شد" : "Read"}
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
                onClick={() => {
                  setIsProfileMenuOpen((current) => !current);
                  setIsNotificationOpen(false);
                }}
                aria-expanded={isProfileMenuOpen}
              >
                <span className="innovator-dashboard__profile-text">
                  <strong>مهدیه سیفی</strong>
                  <small>نوع کاربر: فناور</small>
                </span>

                <span className="innovator-dashboard__top-avatar">م</span>

                <span className="innovator-dashboard__profile-caret">▾</span>
              </button>

              {isProfileMenuOpen && (
                <div className="innovator-dashboard__profile-dropdown">
                  <button
                    type="button"
                    onClick={() => openInternalPage("profile")}
                  >
                    پروفایل
                  </button>
                  <button
                    type="button"
                    onClick={() => openInternalPage("edit-profile")}
                  >
                    ویرایش پروفایل
                  </button>
                  <button
                    type="button"
                    className="innovator-dashboard__profile-logout"
                    onClick={handleLogout}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {shouldShowDashboard ? (
          <DashboardHomePanel key={`dashboard-${contentResetKey}`} />
        ) : shouldShowSubmitPlan ? (
          <SubmitPlanPanel key={`submit-plan-${contentResetKey}`} />
        ) : shouldShowSelectedPlans ? (
          <SelectedPlansPanel key={`selected-plans-${contentResetKey}`} />
        ) : shouldShowRequests ? (
          <SupportRequestsPanel key={`requests-${contentResetKey}`} />
        ) : shouldShowMessages ? (
          <MessagesPanel key={`messages-${contentResetKey}`} />
        ) : shouldShowFaq ? (
          <FaqPanel key={`faq-${contentResetKey}`} />
        ) : shouldShowProfile ? (
          <ProfilePanel
            key={`profile-${contentResetKey}`}
            profile={userProfile}
            onEdit={() => openInternalPage("edit-profile")}
          />
        ) : shouldShowEditProfile ? (
          <ProfileEditPanel
            key={`edit-profile-${contentResetKey}`}
            profile={userProfile}
            onSave={setUserProfile}
            onCancel={() => openInternalPage("profile")}
          />
        ) : (
          <GenericDashboardContent
            key={`${activeSection}-${activeSubItem}-${contentResetKey}`}
            currentSection={currentSection}
            activeSubItem={activeSubItem}
          />
        )}
      </section>
    </main>
  );
}

export default InnovatorDashboardPage;
