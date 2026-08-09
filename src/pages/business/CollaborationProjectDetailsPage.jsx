import { useState } from "react";
import { useParams } from "react-router";

import ContactFormSection from "../../components/common/ContactFormSection";
import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import {
  allCollaborationProjects,
  getCollaborationProjectById,
} from "../../data/collaborationProjectsData";
import {
  getPublishedSitePublicationProjectById,
  getSitePublicationPreviewProject,
} from "../../services/projectPublicationService";

import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Button from "../../components/ui/Button/Button";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";
import IconButton from "../../components/ui/IconButton/IconButton";

import "./CollaborationProjectDetailsPage.css";

function SectionTitle({ children }) {
  return (
    <SectionHeader
      title={children}
      variant="subsection"
      className="collab-project-details__section-title"
    />
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

        {activeReport.text ? (
          <p>{activeReport.text}</p>
        ) : (
          <p className="collab-project-details__report-empty-text">
            برای این گزارش توضیح متنی ثبت نشده است.
          </p>
        )}

        {activeReport.fileUrl ? (
          <Button
            href={activeReport.fileUrl}
            variant="outline"
            size="sm"
            className="collab-project-details__report-download"
            download={activeReport.fileName || activeReport.title}
            target="_blank"
            rel="noreferrer"
          >
            دانلود فایل گزارش
            {activeReport.fileName ? ` (${activeReport.fileName})` : ""}
          </Button>
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

  const isPreviewProject = projectId === "preview";
  const publicationProject = isPreviewProject
    ? getSitePublicationPreviewProject()
    : getPublishedSitePublicationProjectById(projectId);

  const project =
    publicationProject ||
    getCollaborationProjectById(projectId) ||
    allCollaborationProjects[0];

  const relatedProjects = allCollaborationProjects.filter(
    (item) => item.group === project.group && item.id !== project.id,
  );

  const relatedProjectCarouselItems = relatedProjects.map((relatedProject) => ({
    ...relatedProject,
    path: `/business/opportunities/${relatedProject.id}`,
    statusLabel: relatedProject.badge,
    buttonLabel: "مشاهده جزئیات",
    firstMetaLabel: "تاریخ معرفی:",
    firstMetaValue: relatedProject.date || "تاریخ معرفی ثبت نشده",
    secondMetaLabel: "حوزه:",
    secondMetaValue: relatedProject.field || "حوزه نامشخص",
    thirdMetaLabel: "وضعیت:",
    thirdMetaValue: relatedProject.level || "وضعیت نامشخص",
  }));

  return (
    <main className="collab-project-details">
      <div className="collab-project-details__container collab-project-details__breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: "صفحه اصلی", to: "/" },
            { label: "فرصت‌های همکاری", to: "/business/opportunities" },
            { label: project.title },
          ]}
        />
      </div>

      <section className="collab-project-details__hero">
        <div className="collab-project-details__hero-image">
          <img src={project.image} alt={project.title} />
        </div>

        <IconButton
          type="button"
          variant={isFavorite ? "danger" : "outline"}
          size="md"
          className="collab-project-details__favorite"
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
        </IconButton>

        <div className="collab-project-details__hero-content">
          <span className="collab-project-details__eyebrow">
            {project.badge}
          </span>

          <h1>{project.title}</h1>

          <p>{project.summary}</p>

          <div className="collab-project-details__hero-actions">
            <Button href="#cooperation-request" variant="secondary" size="md" className="collab-project-details__hero-action">درخواست همکاری</Button>
            <Button to="/services/consulting" variant="inverse" size="md" className="collab-project-details__hero-action">درخواست مشاوره</Button>
          </div>
        </div>
      </section>

      <div className="collab-project-details__container">
        <section
          className={`collab-project-details__summary-grid ${
            publicationProject
              ? "collab-project-details__summary-grid--dynamic"
              : ""
          }`}
        >
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

              <Button
                href={project.proposalFile}
                variant="primary"
                size="md"
                fullWidth
                className="collab-project-details__download"
              >
                دانلود پروپوزال طرح
              </Button>
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
              {project.descriptionHtml ? (
                <div
                  className="collab-project-details__rich-text"
                  dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
                />
              ) : (
                <p>{project.description}</p>
              )}
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
              <ReportsTabs reports={project.reports || []} />
            </section>
          </div>
        </div>

        <section
          className="collab-project-details__cta"
          id="cooperation-request"
        >
          <div>
            <span className="collab-project-details__cta-eyebrow">شروع همکاری</span>
            <h2>برای همکاری روی این طرح اقدام کنید</h2>
            <p>
              اطلاعات شما برای بررسی اولیه ثبت می‌شود و پس از ارزیابی، مسیر
              همکاری، مشاوره یا سرمایه‌گذاری با شما هماهنگ خواهد شد.
            </p>
          </div>

          <div className="collab-project-details__cta-actions">
            <Button href="#project-contact-form" variant="secondary" size="md" fullWidth>
              ثبت درخواست همکاری
            </Button>
            <Button to="/services/consulting" variant="inverse" size="md" fullWidth>
              درخواست مشاوره
            </Button>
          </div>
        </section>

        <section
          className="collab-project-details__contact"
          id="project-contact-form"
        >
          <ContactFormSection
            id={`project-contact-form-${project.id}`}
            title="فرم تماس"
            submitLabel="ارسال درخواست"
            sourceType="collaboration-project"
            sourceTitle="فرصت همکاری / پروژه"
            relatedId={project.id}
            relatedTitle={project.title}
            statusMessage="درخواست همکاری شما برای این پروژه ثبت شد و برای بررسی به دبیرخانه ارسال شد."
          />
        </section>

        {relatedProjectCarouselItems.length > 0 && (
          <ActivitiesCarousel
            title="طرح‌های مشابه"
            items={relatedProjectCarouselItems}
            viewAllPath="/business/opportunities"
            viewAllLabel="مشاهده همه"
          />
        )}

        <div className="collab-project-details__back-wrap">
          <Button
            to="/business/opportunities"
            variant="outline"
            size="md"
            width="wide"
            className="collab-project-details__back"
          >
            بازگشت به فرصت‌های همکاری
          </Button>
        </div>
      </div>
    </main>
  );
}

export default CollaborationProjectDetailsPage;
