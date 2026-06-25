import { CALL_STATUS } from "../constants/statuses";

export const MOCK_CALLS = [
  {
    id: "call-ai-2026",
    title: "فراخوان حمایت از طرح‌های هوش مصنوعی و داده",
    subtitle:
      "حمایت از ایده‌های فناورانه در حوزه هوش مصنوعی، داده و تحول دیجیتال",
    field: "هوش مصنوعی و داده",
    description:
      "این فراخوان با هدف شناسایی، ارزیابی و حمایت از طرح‌های نوآورانه در حوزه هوش مصنوعی و تحلیل داده منتشر شده است.",
    moreDescription:
      "طرح‌ها باید دارای مسئله مشخص، راهکار فناورانه، تیم اجرایی و امکان توسعه تجاری باشند.",
    deadlineDate: "1405/04/30",
    deadlineTime: "18:00",
    status: CALL_STATUS.PUBLISHED,
    pdfFileUrl: "",
    createdBy: "user-committee-1",
    createdAt: "1405/03/01",
    publishedAt: "1405/03/05",
    updatedAt: "1405/03/05",
  },
  {
    id: "call-commercial-2026",
    title: "فراخوان تجاری‌سازی محصولات دانشگاهی",
    subtitle: "حمایت از تبدیل دستاوردهای پژوهشی به محصول قابل عرضه در بازار",
    field: "تجاری‌سازی",
    description:
      "این فراخوان برای طرح‌هایی است که نمونه اولیه، بازار هدف یا ظرفیت همکاری تجاری دارند.",
    moreDescription:
      "اولویت با طرح‌هایی است که امکان مذاکره با همکاران تجاری و توسعه بازار داشته باشند.",
    deadlineDate: "1405/05/15",
    deadlineTime: "16:00",
    status: CALL_STATUS.PUBLISHED,
    pdfFileUrl: "",
    createdBy: "user-committee-1",
    createdAt: "1405/03/10",
    publishedAt: "1405/03/12",
    updatedAt: "1405/03/12",
  },
  {
    id: "call-health-archive",
    title: "فراخوان فناوری‌های سلامت دیجیتال",
    subtitle: "نسخه آرشیوشده فراخوان سلامت دیجیتال",
    field: "سلامت دیجیتال",
    description:
      "این فراخوان مربوط به دوره قبلی حمایت از طرح‌های سلامت دیجیتال بوده است.",
    moreDescription: "این فراخوان در حال حاضر فعال نیست.",
    deadlineDate: "1404/12/20",
    deadlineTime: "15:00",
    status: CALL_STATUS.ARCHIVED,
    pdfFileUrl: "",
    createdBy: "user-committee-1",
    createdAt: "1404/11/01",
    publishedAt: "1404/11/05",
    updatedAt: "1404/12/21",
  },
];
