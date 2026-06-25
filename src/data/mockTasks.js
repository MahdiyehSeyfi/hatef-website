import { TASK_STATUS } from "../constants/statuses";

export const MOCK_TASKS = [
  {
    id: "task-marketplace-1",
    planId: "plan-marketplace",
    createdBy: "user-committee-1",
    title: "تکمیل مدل تجاری طرح",
    managerMessage:
      "لطفاً مدل درآمدی، مشتریان هدف و مسیر ورود به بازار را دقیق‌تر تکمیل کنید.",
    deadlineDate: "1405/04/15",
    deadlineTime: "18:00",
    status: TASK_STATUS.ANSWERED_BY_INNOVATOR,
    innovatorResponseText:
      "مدل درآمدی شامل اشتراک سازمانی، خدمات مشاوره و کارمزد همکاری تجاری تکمیل شد.",
    innovatorFileUrl: "",
    managerFeedback: "",
    createdAt: "1405/03/29",
    respondedAt: "1405/04/03",
    finishedAt: "",
    updatedAt: "1405/04/03",
  },
  {
    id: "task-marketplace-2",
    planId: "plan-marketplace",
    createdBy: "user-committee-1",
    title: "ارسال برنامه زمان‌بندی اجرای اولیه",
    managerMessage: "برنامه زمان‌بندی سه‌ماهه اجرای اولیه محصول را ارسال کنید.",
    deadlineDate: "1405/04/20",
    deadlineTime: "16:00",
    status: TASK_STATUS.WAITING_FOR_INNOVATOR_REVIEW,
    innovatorResponseText: "",
    innovatorFileUrl: "",
    managerFeedback: "",
    createdAt: "1405/04/01",
    respondedAt: "",
    finishedAt: "",
    updatedAt: "1405/04/01",
  },
  {
    id: "task-energy-1",
    planId: "plan-energy-monitoring",
    createdBy: "user-committee-1",
    title: "اصلاح بخش تحلیل اقتصادی",
    managerMessage:
      "لطفاً هزینه‌های پیاده‌سازی، مدل فروش و شاخص بازگشت سرمایه را تکمیل کنید.",
    deadlineDate: "1405/04/18",
    deadlineTime: "18:00",
    status: TASK_STATUS.NEEDS_REVISION,
    innovatorResponseText:
      "نسخه اولیه تحلیل اقتصادی ارسال شد، اما بخش شاخص بازگشت سرمایه نیاز به تکمیل دارد.",
    innovatorFileUrl: "",
    managerFeedback:
      "بخش هزینه‌ها مناسب است، اما تحلیل بازگشت سرمایه باید عددی‌تر و دقیق‌تر شود.",
    createdAt: "1405/03/30",
    respondedAt: "1405/04/04",
    finishedAt: "",
    updatedAt: "1405/04/05",
  },
];
