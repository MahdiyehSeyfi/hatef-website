import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";

import DocumentsSidebar from "../../components/documents/DocumentsSidebar";
import { getDocumentCategory } from "../../data/documentsData";

import Button from "../../components/ui/Button/Button";
import IconButton from "../../components/ui/IconButton/IconButton";

import "./DocumentsPage.css";

const documentAccessItems = [
  {
    id: "forms",
    title: "فرم‌ها",
    description: "فرم‌های موردنیاز برای ثبت، ارسال، بررسی و پیگیری درخواست‌ها",
    path: "/documents/forms",
  },
  {
    id: "regulations",
    title: "آیین‌نامه‌ها",
    description: "دستورالعمل‌ها، مقررات و چارچوب‌های رسمی برنامه هاتف",
    path: "/documents/regulations",
  },
  {
    id: "templates",
    title: "قالب‌ها",
    description: "قالب‌های استاندارد برای تهیه فایل‌ها، پیشنهادها و گزارش‌ها",
    path: "/documents/templates",
  },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="m7.5 10.5 4.5 4.5 4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 20h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentAccessIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M9 4.5h9.5L24 10v17.5H9V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M18.5 4.5V10H24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M12.5 15.5h7M12.5 20h7M12.5 24.5h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getCategoryDocumentsCount(categoryId) {
  const category = getDocumentCategory(categoryId);

  if (!category) {
    return 0;
  }

  return category.groups.reduce((totalCount, group) => {
    return totalCount + group.items.length;
  }, 0);
}

function DocumentsQuickAccessPanel({ activeCategory }) {
  const accessItems = useMemo(() => {
    return documentAccessItems.map((item) => ({
      ...item,
      count: getCategoryDocumentsCount(item.id),
    }));
  }, []);

  return (
    <section className="documents-page__quick-access">
      <div className="documents-page__quick-access-head">
        <span>مرکز مستندات هاتف</span>

        <h1>دسترسی سریع به مستندات</h1>

        <p>
          اسناد، فرم‌ها، آیین‌نامه‌ها و قالب‌های موردنیاز برنامه هاتف در این بخش
          دسته‌بندی شده‌اند تا دسترسی به فایل‌های موردنیاز سریع‌تر و ساده‌تر
          انجام شود.
        </p>
      </div>

      <div className="documents-page__quick-access-grid">
        {accessItems.map((item) => {
          const isActive = item.id === activeCategory;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`documents-page__quick-card ${
                isActive ? "documents-page__quick-card--active" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="documents-page__quick-card-icon">
                <DocumentAccessIcon />
              </span>

              <span className="documents-page__quick-card-content">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>

              <span className="documents-page__quick-card-count">
                {item.count} فایل
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DocumentsPage() {
  const { category } = useParams();
  const [downloadNotice, setDownloadNotice] = useState("");

  const currentCategory = getDocumentCategory(category);

  if (!currentCategory) {
    return <Navigate to="/documents/forms" replace />;
  }

  const handleDownload = (event, documentItem) => {
    if (documentItem.fileUrl) {
      return;
    }

    event.preventDefault();

    setDownloadNotice(
      `فایل «${documentItem.title}» هنوز به پروژه اضافه نشده است.`,
    );
  };

  return (
    <div className="documents-page">
      <div className="documents-page__container">
        <nav className="documents-page__breadcrumb" aria-label="مسیر صفحه">
          <Link to="/">صفحه اصلی</Link>

          <span>/</span>

          <span>مستندات</span>

          <span>/</span>

          <span>{currentCategory.title}</span>
        </nav>

        <div className="documents-page__layout">
          <DocumentsSidebar />

          <main className="documents-page__main">
            <DocumentsQuickAccessPanel activeCategory={category} />

            {downloadNotice && (
              <p className="documents-page__notice" role="status">
                {downloadNotice}

                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="documents-page__notice-close"
                  onClick={() => setDownloadNotice("")}
                  aria-label="بستن پیام"
                >
                  ×
                </IconButton>
              </p>
            )}

            {currentCategory.groups.map((group) => (
              <section className="document-group" key={group.id}>
                <header className="document-group__heading">
                  <h1>{group.title}</h1>
                  <span />
                </header>

                <div className="document-group__items">
                  {group.items.map((documentItem) => (
                    <article className="document-row" key={documentItem.id}>
                      <Button
                        className="document-row__download"
                        href={documentItem.fileUrl || "#download"}
                        variant="outline"
                        size="sm"
                        leadingIcon={<DownloadIcon />}
                        download={Boolean(documentItem.fileUrl)}
                        onClick={(event) => handleDownload(event, documentItem)}
                      >
                        بارگیری
                      </Button>

                      <div className="document-row__title">
                        <span />

                        <h2>{documentItem.title}</h2>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
