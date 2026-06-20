import DocumentsQuickAccess from "../../components/documents/DocumentsQuickAccess";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";

import DocumentsSidebar from "../../components/documents/DocumentsSidebar";
import { getDocumentCategory } from "../../data/documentsData";

import "./DocumentsPage.css";

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
            <DocumentsQuickAccess activeCategory={category} />
            {downloadNotice && (
              <p className="documents-page__notice" role="status">
                {downloadNotice}

                <button
                  type="button"
                  onClick={() => setDownloadNotice("")}
                  aria-label="بستن پیام"
                >
                  ×
                </button>
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
                      <a
                        className="document-row__download"
                        href={documentItem.fileUrl || "#download"}
                        download={Boolean(documentItem.fileUrl)}
                        onClick={(event) => handleDownload(event, documentItem)}
                      >
                        <DownloadIcon />
                        <span>بارگیری</span>
                      </a>

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
