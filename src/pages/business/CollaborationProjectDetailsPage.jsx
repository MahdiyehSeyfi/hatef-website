import { useState } from "react";
import { Link, useParams } from "react-router";

import ContactFormSection from "../../components/common/ContactFormSection";
import {
  allCollaborationProjects,
  getCollaborationProjectById,
} from "../../data/collaborationProjectsData";

import "./CollaborationProjectDetailsPage.css";

function SectionTitle({ children }) {
  return (
    <header className="collab-project-details__section-title">
      <span />
      <h2>{children}</h2>
    </header>
  );
}

function FavoriteIcon({ isFavorite }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.4s-7.2-4.5-9.2-9.2C1.4 8 3.3 4.8 6.6 4.5c1.9-.2 3.4.8 4.3 2.1.2.3.5.3.7 0 .9-1.3 2.4-2.3 4.3-2.1 3.3.3 5.2 3.5 3.8 6.7C19.2 15.9 12 20.4 12 20.4Z"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReportsTabs({ reports }) {
  const [activeReportId, setActiveReportId] = useState(reports[0]?.id);

  const activeReport =
    reports.find((report) => report.id === activeReportId) || reports[0];

  if (!activeReport) return null;

  return (
    <div className="collab-project-details__reports-tabs">
      <div className="collab-project-details__reports-nav" role="tablist">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            role="tab"
            aria-selected={report.id === activeReport.id}
            className={
              report.id === activeReport.id
                ? "collab-project-details__report-tab collab-project-details__report-tab--active"
                : "collab-project-details__report-tab"
            }
            onClick={() => setActiveReportId(report.id)}
          >
            <span>{report.title}</span>
            <small>{report.status}</small>
          </button>
        ))}
      </div>

      <div className="collab-project-details__report-panel" role="tabpanel">
        <span className="collab-project-details__report-label">
          {activeReport.type === "file" ? "گزارش قابل دانلود" : "گزارش متنی"}
        </span>

        <h3>{activeReport.title}</h3>

        <p>{activeReport.text}</p>

        {activeReport.fileUrl ? (
          <a href={activeReport.fileUrl}>دانلود فایل گزارش</a>
        ) : (
          <div className="collab-project-details__text-report-note">
            برای این گزارش فایل جداگانه‌ای بارگذاری نشده و اطلاعات به‌صورت متنی
            نمایش داده شده است.
          </div>
        )}
      </div>
    </div>
  );
}

function CollaborationProjectDetailsPage() {
  const { projectId } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  const project =
    getCollaborationProjectById(projectId) || allCollaborationProjects[0];

  const relatedProjects = allCollaborationProjects
    .filter((item) => item.group === project.group && item.id !== project.id)
    .slice(0, 3);

  return (
    <main className="collab-project-details">
      <section className="collab-project-details__hero">
        <div className="collab-project-details__hero-image">
          <img src={project.image} alt={project.title} />
        </div>

        <button
          type="button"
          className={`collab-project-details__favorite ${
            isFavorite ? "collab-project-details__favorite--active" : ""
          }`}
          onClick={() => setIsFavorite((current) => !current)}
          aria-label={
            isFavorite
              ? "حذف طرح از علاقه‌مندی‌ها"
              : "افزودن طرح به علاقه‌مندی‌ها"
          }
          title={
            isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
        >
          <FavoriteIcon isFavorite={isFavorite} />
        </button>

        <div className="collab-project-details__hero-content">
          <span className="collab-project-details__eyebrow">
            {project.badge}
          </span>

          <h1>{project.title}</h1>

          <p>{project.summary}</p>

          <div className="collab-project-details__hero-actions">
            <a href="#cooperation-request">درخواست همکاری</a>
            <a href="#consultation-request">درخواست مشاوره</a>
          </div>
        </div>
      </section>

      <div className="collab-project-details__container">
        <section className="collab-project-details__summary-grid">
          {project.indicators.map((indicator) => (
            <article key={indicator.label}>
              <strong>{indicator.value}</strong>
              <span>{indicator.label}</span>
            </article>
          ))}
        </section>

        <div className="collab-project-details__layout">
          <aside className="collab-project-details__sidebar">
            <div className="collab-project-details__info-card">
              <h2>اطلاعات کلیدی طرح</h2>

              <dl>
                <div>
                  <dt>گروه طرح</dt>
                  <dd>{project.group}</dd>
                </div>

                <div>
                  <dt>حوزه</dt>
                  <dd>{project.field}</dd>
                </div>

                <div>
                  <dt>تاریخ معرفی</dt>
                  <dd>{project.date}</dd>
                </div>

                <div>
                  <dt>وضعیت</dt>
                  <dd>{project.level}</dd>
                </div>

                <div>
                  <dt>متولی پیگیری</dt>
                  <dd>{project.manager}</dd>
                </div>
              </dl>

              <a
                href={project.proposalFile}
                className="collab-project-details__download"
              >
                دانلود پروپوزال طرح
              </a>
            </div>

            <div className="collab-project-details__info-card">
              <h2>نیازهای همکاری</h2>

              <ul>
                {project.cooperationNeeds.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="collab-project-details__main">
            <section>
              <SectionTitle>توضیحات طرح</SectionTitle>
              <p>{project.description}</p>
            </section>

            <section>
              <SectionTitle>چالش اصلی</SectionTitle>
              <p>{project.challenge}</p>
            </section>

            <section>
              <SectionTitle>راهکار پیشنهادی</SectionTitle>
              <p>{project.solution}</p>
            </section>

            <section>
              <SectionTitle>اثرگذاری و ظرفیت توسعه</SectionTitle>
              <p>{project.impact}</p>
            </section>

            <section>
              <SectionTitle>گزارش‌ها و مستندات</SectionTitle>
              <ReportsTabs reports={project.reports} />
            </section>
          </div>
        </div>

        <section
          className="collab-project-details__cta"
          id="cooperation-request"
        >
          <div>
            <span>شروع همکاری</span>
            <h2>برای همکاری روی این طرح اقدام کنید</h2>
            <p>
              اطلاعات شما برای بررسی اولیه ثبت می‌شود و پس از ارزیابی، مسیر
              همکاری، مشاوره یا سرمایه‌گذاری با شما هماهنگ خواهد شد.
            </p>
          </div>

          <div className="collab-project-details__cta-actions">
            <a href="#project-contact-form">ثبت درخواست همکاری</a>
            <a href="#project-contact-form" id="consultation-request">
              درخواست مشاوره
            </a>
          </div>
        </section>

        <section
          className="collab-project-details__contact"
          id="project-contact-form"
        >
          <ContactFormSection
            title="فرم تماس"
            submitLabel="ارسال درخواست"
            statusMessage="درخواست شما در نسخه نمایشی ثبت شد. ارسال واقعی پس از اتصال به سرور فعال می‌شود."
          />
        </section>

        {relatedProjects.length > 0 && (
          <section className="collab-project-details__related">
            <SectionTitle>طرح‌های مشابه</SectionTitle>

            <div className="collab-project-details__related-grid">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  to={`/business/opportunities/${relatedProject.id}`}
                >
                  <img src={relatedProject.image} alt={relatedProject.title} />
                  <span>{relatedProject.badge}</span>
                  <h3>{relatedProject.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="collab-project-details__back-wrap">
          <Link
            to="/business/opportunities"
            className="collab-project-details__back"
          >
            بازگشت به فرصت‌های همکاری
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CollaborationProjectDetailsPage;
