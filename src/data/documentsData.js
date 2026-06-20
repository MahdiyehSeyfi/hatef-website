const commonDocumentTitle =
  "درخواست فوری برای محکومیت و توقف حملات به مؤسسات آموزشی و پژوهشی";

export const documentsData = {
  forms: {
    slug: "forms",
    title: "فرم‌ها",
    groups: [
      {
        id: "forms-group-1",
        title: "فرم‌های شماره ۱",
        items: [
          {
            id: "form-1",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "form-2",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "form-3",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "form-4",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
      {
        id: "forms-group-2",
        title: "فرم‌های شماره ۲",
        items: [
          {
            id: "form-5",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "form-6",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
    ],
  },

  regulations: {
    slug: "regulations",
    title: "آیین‌نامه‌ها",
    groups: [
      {
        id: "regulations-group-2",
        title: "آیین‌نامه‌ها شماره ۲",
        items: [
          {
            id: "regulation-1",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "regulation-2",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "regulation-3",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "regulation-4",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
      {
        id: "regulations-group-1",
        title: "آیین‌نامه‌ها شماره ۱",
        items: [
          {
            id: "regulation-5",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "regulation-6",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
    ],
  },

  templates: {
    slug: "templates",
    title: "قالب‌ها",
    groups: [
      {
        id: "templates-group-2",
        title: "قالب‌ها شماره ۲",
        items: [
          {
            id: "template-1",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "template-2",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "template-3",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "template-4",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
      {
        id: "templates-group-1",
        title: "قالب‌ها شماره ۱",
        items: [
          {
            id: "template-5",
            title: commonDocumentTitle,
            fileUrl: "",
          },
          {
            id: "template-6",
            title: commonDocumentTitle,
            fileUrl: "",
          },
        ],
      },
    ],
  },
};

export const documentCategories = [
  {
    slug: "forms",
    title: "فرم‌ها",
  },
  {
    slug: "regulations",
    title: "آیین‌نامه‌ها",
  },
  {
    slug: "templates",
    title: "قالب‌ها",
  },
];

export function getDocumentCategory(categorySlug) {
  return documentsData[categorySlug];
}
