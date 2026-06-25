import projectImageOne from "../assets/images/slide-1.png";
import projectImageTwo from "../assets/images/slide-2.png";
import projectImageThree from "../assets/images/slide-3.png";
import projectImageFour from "../assets/images/slide-4.png";

function enrichProject(project) {
  return {
    ...project,
    summary:
      "این طرح با هدف توسعه یک راهکار فناورانه قابل همکاری طراحی شده و ظرفیت اتصال به صنعت، سرمایه‌گذار، مشاوران تخصصی و مسیر تجاری‌سازی را دارد.",
    description:
      "این طرح یکی از فرصت‌های همکاری برنامه هاتف است که می‌تواند با مشارکت نهادهای صنعتی، سرمایه‌گذاران، مشاوران فناوری و تیم‌های توسعه محصول وارد مسیر رشد شود. هدف اصلی، تبدیل ظرفیت پژوهشی و فناورانه به یک راهکار کاربردی، قابل توسعه و قابل ارائه در بازار است.",
    challenge:
      "چالش اصلی این طرح، تبدیل ایده یا نمونه فناورانه به یک محصول یا خدمت پایدار، قابل اجرا و قابل عرضه در محیط واقعی است.",
    solution:
      "راهکار پیشنهادی شامل راهبری تخصصی، بررسی بازار، تکمیل مدل همکاری، جذب شریک صنعتی و آماده‌سازی طرح برای توسعه یا تجاری‌سازی است.",
    impact:
      "اجرای موفق این طرح می‌تواند به کاهش هزینه‌ها، افزایش بهره‌وری، توسعه فناوری داخلی و ایجاد فرصت‌های همکاری میان دانشگاه و صنعت کمک کند.",
    readiness: "سطح آمادگی همکاری: متوسط رو به بالا",
    manager: "دفتر توسعه همکاری‌های تجاری هاتف",
    proposalFile: "#download-proposal",
    reports: [
      {
        id: 1,
        title: "گزارش امکان‌سنجی اولیه",
        status: "فایل آماده دریافت",
        type: "file",
        fileUrl: "#download-feasibility-report",
        text: "خلاصه گزارش امکان‌سنجی نشان می‌دهد این طرح از نظر نیاز بازار، ظرفیت اجرا و امکان توسعه اولیه در وضعیت مناسبی قرار دارد.",
      },
      {
        id: 2,
        title: "گزارش تحلیل بازار",
        status: "گزارش متنی",
        type: "text",
        fileUrl: "",
        text: "در حال حاضر فایل جداگانه‌ای برای این گزارش بارگذاری نشده است. بر اساس بررسی اولیه، بازار هدف شامل صنایع متوسط و بزرگ، مجموعه‌های فناور و شرکت‌های نیازمند راهکارهای هوشمند است.",
      },
      {
        id: 3,
        title: "گزارش مسیر همکاری",
        status: "نسخه اولیه متنی",
        type: "text",
        fileUrl: "",
        text: "مسیر همکاری پیشنهادی شامل جلسه شناخت نیاز، ارزیابی فنی، بررسی مدل همکاری، تعیین نقش شریک تجاری و تدوین برنامه اجرایی مشترک است.",
      },
    ],
    cooperationNeeds: [
      "سرمایه‌گذار یا شریک صنعتی",
      "مشاور تجاری‌سازی",
      "تیم توسعه محصول",
      "شبکه فروش یا بازار هدف",
    ],
    indicators: [
      {
        label: "آمادگی همکاری",
        value: "۸۰٪",
      },
      {
        label: "ظرفیت تجاری‌سازی",
        value: "۷۵٪",
      },
      {
        label: "نیاز به سرمایه",
        value: "متوسط",
      },
    ],
  };
}

export const shiningProjects = [
  {
    id: 1,
    image: projectImageOne,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "فناوری بومی جذب پیشرفته برای پالایش گازهای خطرناک صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "صنایع انرژی",
    level: "آماده همکاری",
    button: "مشاهده طرح",
  },
  {
    id: 2,
    image: projectImageTwo,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "سامانه هوشمند پایش مصرف انرژی در واحدهای صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "هوشمندسازی",
    level: "آماده سرمایه‌گذاری",
    button: "مشاهده طرح",
  },
  {
    id: 3,
    image: projectImageThree,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "محصول فناورانه مدیریت داده‌های پژوهشی و صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "فناوری اطلاعات",
    level: "آماده تجاری‌سازی",
    button: "مشاهده طرح",
  },
  {
    id: 4,
    image: projectImageFour,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "راهکار سبز برای کاهش آلاینده‌های محیط‌زیستی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "فناوری سبز",
    level: "آماده همکاری",
    button: "مشاهده طرح",
  },
  {
    id: 5,
    image: projectImageTwo,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "پلتفرم فناورانه پایش و مدیریت ریسک صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "ایمنی صنعتی",
    level: "آماده همکاری",
    button: "مشاهده طرح",
  },
  {
    id: 6,
    image: projectImageThree,
    badge: "طرح درخشان",
    group: "طرح‌های درخشان",
    title: "سامانه تحلیل هوشمند داده‌های تولید و بهره‌وری",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "تحلیل داده",
    level: "آماده سرمایه‌گذاری",
    button: "مشاهده طرح",
  },
].map(enrichProject);

export const newProjects = [
  {
    id: 7,
    image: projectImageTwo,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "پلتفرم تحلیل داده برای تصمیم‌سازی در پروژه‌های فناورانه",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "تحلیل داده",
    level: "در مرحله معرفی",
    button: "اطلاعات بیشتر",
  },
  {
    id: 8,
    image: projectImageThree,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "سامانه مدیریت زنجیره تأمین محصولات دانش‌بنیان",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "زنجیره تأمین",
    level: "نیازمند شریک تجاری",
    button: "اطلاعات بیشتر",
  },
  {
    id: 9,
    image: projectImageFour,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "راهکار فناورانه مدیریت منابع در صنایع کوچک و متوسط",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "مدیریت منابع",
    level: "در حال تکمیل",
    button: "اطلاعات بیشتر",
  },
  {
    id: 10,
    image: projectImageOne,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "محصول هوشمند پایش کیفیت محیط‌های صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "پایش صنعتی",
    level: "آماده بررسی",
    button: "اطلاعات بیشتر",
  },
  {
    id: 11,
    image: projectImageFour,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "طرح نوآورانه کاهش هزینه‌های انرژی در کارخانه‌ها",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "انرژی",
    level: "در حال معرفی",
    button: "اطلاعات بیشتر",
  },
  {
    id: 12,
    image: projectImageOne,
    badge: "طرح جدید",
    group: "طرح‌های جدید",
    title: "سامانه مدیریت هوشمند همکاری دانشگاه و صنعت",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "همکاری تجاری",
    level: "نیازمند همکار",
    button: "اطلاعات بیشتر",
  },
].map(enrichProject);

export const growingProjects = [
  {
    id: 13,
    image: projectImageThree,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "طرح توسعه محصول فناورانه برای بازارهای صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "توسعه محصول",
    level: "در حال رشد",
    button: "گزارش و اطلاعات طرح",
  },
  {
    id: 14,
    image: projectImageFour,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "سامانه هوشمند مدیریت مصرف و کاهش هزینه انرژی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "انرژی",
    level: "در حال جذب همکار",
    button: "گزارش و اطلاعات طرح",
  },
  {
    id: 15,
    image: projectImageOne,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "راهکار تجاری‌سازی فناوری‌های دانشگاهی منتخب",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "تجاری‌سازی",
    level: "در حال مذاکره",
    button: "گزارش و اطلاعات طرح",
  },
  {
    id: 16,
    image: projectImageTwo,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "طرح توسعه همکاری میان دانشگاه، صنعت و سرمایه‌گذاران",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "همکاری تجاری",
    level: "در حال توسعه",
    button: "گزارش و اطلاعات طرح",
  },
  {
    id: 17,
    image: projectImageThree,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "محصول فناورانه آماده ورود به بازار صنعتی",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "بازار صنعتی",
    level: "در حال رشد",
    button: "گزارش و اطلاعات طرح",
  },
  {
    id: 18,
    image: projectImageFour,
    badge: "در حال رشد",
    group: "طرح‌های در حال رشد",
    title: "طرح توسعه زیرساخت همکاری‌های تجاری فناورانه",
    date: "۱۴۰۵/۰۵/۰۵",
    field: "زیرساخت همکاری",
    level: "در حال جذب همکار",
    button: "گزارش و اطلاعات طرح",
  },
].map(enrichProject);

export const allCollaborationProjects = [
  ...shiningProjects,
  ...newProjects,
  ...growingProjects,
];

export function getCollaborationProjectById(projectId) {
  return allCollaborationProjects.find(
    (project) => String(project.id) === String(projectId),
  );
}
