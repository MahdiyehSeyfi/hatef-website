import { useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import {
  growingProjects,
  newProjects,
  shiningProjects,
} from "../../data/collaborationProjectsData";
import {
  getPublishedSuccessfulProjectItems,
  SITE_PUBLICATION_DISPLAY_GROUPS,
} from "../../services/projectPublicationService";

import ViewAllButton from "../../components/common/ViewAllButton";
import Badge from "../../components/ui/Badge/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Button from "../../components/ui/Button/Button";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";

import "./CollaborationOpportunitiesPage.css";

const articleParagraphs = [
  "فرصت‌های همکاری برنامه هاتف با هدف معرفی طرح‌های فناورانه، پژوهشی و تجاری‌سازی‌شده طراحی شده‌اند. این بخش بستری برای ارتباط میان صاحبان فناوری، دانشگاه، صنعت، سرمایه‌گذاران و مجموعه‌های تجاری فراهم می‌کند.",
  "طرح‌های معرفی‌شده در این صفحه بر اساس وضعیت توسعه، آمادگی برای همکاری، ظرفیت تجاری‌سازی و امکان جذب سرمایه یا شریک صنعتی دسته‌بندی شده‌اند.",
  "در بخش طرح‌های درخشان، پروژه‌هایی نمایش داده می‌شوند که از نظر بلوغ، کیفیت و ظرفیت همکاری در وضعیت مناسب‌تری قرار دارند. طرح‌های جدید، فرصت‌هایی هستند که به‌تازگی وارد مسیر معرفی شده‌اند و طرح‌های در حال رشد نیز پروژه‌هایی‌اند که در مسیر تکمیل، توسعه بازار یا جذب همکار قرار دارند.",
];

const INTRODUCED_GROUPS = {
  shining: SITE_PUBLICATION_DISPLAY_GROUPS[0],
  newest: SITE_PUBLICATION_DISPLAY_GROUPS[1],
  growing: SITE_PUBLICATION_DISPLAY_GROUPS[2],
};

function projectBelongsToGroup(project, groupTitle) {
  if (Array.isArray(project.displayGroups)) {
    return project.displayGroups.includes(groupTitle);
  }

  return project.group === groupTitle || project.badge === groupTitle;
}

function mergeGroupProjects(dynamicProjects, groupTitle, staticProjects) {
  const introducedProjects = dynamicProjects
    .filter((project) => projectBelongsToGroup(project, groupTitle))
    .map((project) => ({
      ...project,
      badge: groupTitle,
      button: project.button || "مشاهده جزئیات",
    }));

  return [...introducedProjects, ...staticProjects];
}

function SectionHeading({ title, subtitle }) {
  return (
    <SectionHeader
      title={title}
      description={subtitle}
      className="collab-opportunities__section-heading"
    />
  );
}

function ProjectCard({ project }) {
  return (
    <article className="collab-opportunities__card">
      <Link
        to={`/business/opportunities/${project.id}`}
        className="collab-opportunities__card-image"
      >
        <img src={project.image} alt={project.title} />
        <Badge
          tone="warning"
          size="sm"
          className="collab-opportunities__card-badge"
        >
          {project.badge}
        </Badge>
      </Link>

      <div className="collab-opportunities__card-body">
        <h3>
          <Link to={`/business/opportunities/${project.id}`}>
            {project.title}
          </Link>
        </h3>

        <ul>
          <li>تاریخ معرفی: {project.date}</li>
          <li>حوزه: {project.field}</li>
          <li>وضعیت: {project.level}</li>
        </ul>

        <Button
          to={`/business/opportunities/${project.id}`}
          variant="primary"
          size="sm"
          fullWidth
          className="collab-opportunities__card-button"
        >
          {project.button}
        </Button>
      </div>
    </article>
  );
}

function ProjectSection({ id, title, subtitle, projects }) {
  const [visibleCount, setVisibleCount] = useState(4);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  const handleShowMore = () => {
    setVisibleCount((current) => Math.min(current + 4, projects.length));
  };

  return (
    <section className="collab-opportunities__section" id={id}>
      <div className="collab-opportunities__container">
        <SectionHeading title={title} subtitle={subtitle} />

        <div className="collab-opportunities__cards">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {hasMore && (
          <div className="collab-opportunities__more-wrap">
            <ViewAllButton
              type="button"
              className="collab-opportunities__more"
              onClick={handleShowMore}
            >
              مشاهده بیشتر
            </ViewAllButton>
          </div>
        )}
      </div>
    </section>
  );
}

function OpportunitiesArticle() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="collab-opportunities__article">
      <div className="collab-opportunities__container">
        <div className="collab-opportunities__article-card">
          <span>همکاری تجاری با هاتف</span>

          <h2>فرصت‌های همکاری چگونه انتخاب و معرفی می‌شوند؟</h2>

          <div
            className={`collab-opportunities__article-content ${
              isExpanded
                ? "collab-opportunities__article-content--expanded"
                : "collab-opportunities__article-content--collapsed"
            }`}
          >
            {articleParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="collab-opportunities__article-button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            trailingIcon={isExpanded ? "↑" : "↓"}
          >
            {isExpanded ? "بستن مطلب" : "مطالعه بیشتر"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function CollaborationOpportunitiesPage() {
  const introducedProjects = getPublishedSuccessfulProjectItems();
  const shiningGroupProjects = mergeGroupProjects(
    introducedProjects,
    INTRODUCED_GROUPS.shining,
    shiningProjects,
  );
  const newGroupProjects = mergeGroupProjects(
    introducedProjects,
    INTRODUCED_GROUPS.newest,
    newProjects,
  );
  const growingGroupProjects = mergeGroupProjects(
    introducedProjects,
    INTRODUCED_GROUPS.growing,
    growingProjects,
  );
  const totalProjects =
    shiningGroupProjects.length +
    newGroupProjects.length +
    growingGroupProjects.length;

  return (
    <main className="collab-opportunities">
      <div className="collab-opportunities__container collab-opportunities__breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: "صفحه اصلی", to: "/" },
            { label: "فرصت‌های همکاری" },
          ]}
        />
      </div>

      <section className="collab-opportunities__hero">
        <img src={bannerImage} alt="" aria-hidden="true" />

        <div className="collab-opportunities__hero-overlay" />

        <div className="collab-opportunities__container collab-opportunities__hero-inner">
          <div className="collab-opportunities__hero-content">
            <span>همکاری‌های تجاری هاتف</span>

            <h1>فرصت‌های همکاری</h1>

            <p>
              در این صفحه، طرح‌های فناورانه و تجاری‌سازی‌شده در سه دسته طرح‌های
              درخشان، طرح‌های جدید و طرح‌های در حال رشد معرفی می‌شوند.
            </p>

            <div className="collab-opportunities__hero-actions">
              <Button href="#shining-projects" variant="inverse" size="md" className="collab-opportunities__hero-action">طرح‌های درخشان</Button>
              <Button href="#new-projects" variant="inverse" size="md" className="collab-opportunities__hero-action">طرح‌های جدید</Button>
              <Button href="#growing-projects" variant="inverse" size="md" className="collab-opportunities__hero-action">طرح‌های در حال رشد</Button>
            </div>
          </div>

          <div className="collab-opportunities__hero-stats">
            <div>
              <strong>{totalProjects}</strong>
              <span>طرح قابل همکاری</span>
            </div>

            <div>
              <strong>۳</strong>
              <span>دسته فرصت</span>
            </div>

            <div>
              <strong>+۱۶</strong>
              <span>همکار صنعتی</span>
            </div>
          </div>
        </div>
      </section>

      <ProjectSection
        id="shining-projects"
        title="طرح‌های درخشان"
        subtitle="طرح‌هایی با ظرفیت بالاتر برای همکاری، سرمایه‌گذاری یا تجاری‌سازی سریع‌تر."
        projects={shiningGroupProjects}
      />

      <ProjectSection
        id="new-projects"
        title="طرح‌های جدید"
        subtitle="فرصت‌هایی که به‌تازگی وارد مسیر معرفی، بررسی و توسعه همکاری شده‌اند."
        projects={newGroupProjects}
      />

      <ProjectSection
        id="growing-projects"
        title="طرح‌های در حال رشد"
        subtitle="طرح‌هایی که در مسیر تکمیل، توسعه بازار، جذب همکار یا ارتقای محصول قرار دارند."
        projects={growingGroupProjects}
      />

      <OpportunitiesArticle />
    </main>
  );
}

export default CollaborationOpportunitiesPage;
