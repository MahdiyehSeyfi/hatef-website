import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import ViewAllButton from "../common/ViewAllButton";

import { allCollaborationProjects } from "../../data/collaborationProjectsData";
import { getPublishedSuccessfulProjectItems } from "../../services/projectPublicationService";

import "./AchievementsSection.css";

function getProjectPath(project) {
  return `/business/opportunities/${project.id}`;
}

function getProjectImage(project) {
  return project?.image || bannerImage;
}

function getProjectDescription(project) {
  const firstParagraph =
    project.summary ||
    project.description ||
    project.shortDescription ||
    "این پروژه در مسیر توسعه فناوری، همکاری صنعتی یا تجاری‌سازی به‌عنوان یکی از خروجی‌های موفق برنامه هاتف معرفی شده است.";

  const secondParagraph =
    project.successResult ||
    project.result ||
    project.field ||
    project.level ||
    "این دستاورد نشان‌دهنده ظرفیت طرح‌های فناورانه برای تبدیل شدن به محصول، همکاری یا خروجی قابل ارائه در زیست‌بوم فناوری است.";

  return [firstParagraph, `نتیجه/حوزه: ${secondParagraph}`];
}

function normalizePublishedProject(project) {
  return {
    ...project,
    image: project.image || bannerImage,
    successResult:
      project.successResult ||
      project.summary ||
      project.result ||
      "طرح منتشرشده توسط کمیته هاتف",
  };
}

function normalizeStaticProject(project, index) {
  const results = [
    "کاهش ۲۸٪ مصرف انرژی",
    "ورود به مرحله همکاری صنعتی",
    "استفاده در چند پروژه فناورانه",
    "کاهش آلایندگی و هزینه عملیاتی",
    "اتصال تیم فناور به شریک صنعتی",
    "افزایش پایداری فرآیند تولید",
  ];

  return {
    ...project,
    image: project.image || bannerImage,
    successYear: index < 2 ? "۱۴۰۵" : "۱۴۰۴",
    successResult: results[index] || "پروژه موفق برنامه هاتف",
  };
}

function getHomeSuccessfulProjects() {
  const publishedProjects = getPublishedSuccessfulProjectItems().map(
    normalizePublishedProject,
  );

  if (publishedProjects.length > 0) {
    return publishedProjects.slice(0, 6);
  }

  return allCollaborationProjects.slice(0, 6).map(normalizeStaticProject);
}

function AchievementsSection() {
  const projects = useMemo(() => getHomeSuccessfulProjects(), []);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeAchievement = projects[activeIndex];

  useEffect(() => {
    if (projects.length <= 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % projects.length;
      });
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, projects.length]);

  useEffect(() => {
    if (activeIndex > projects.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, projects.length]);

  if (!activeAchievement) {
    return null;
  }

  const activeAchievementPath = getProjectPath(activeAchievement);
  const activeAchievementDescription = getProjectDescription(activeAchievement);

  return (
    <section className="achievements-section" id="achievements">
      <header className="achievements-section__heading">
        <span className="achievements-section__heading-line" />

        <h2>دستاوردهای هاتف</h2>

        <span className="achievements-section__heading-line" />
      </header>

      <div className="achievements-section__body">
        <div className="achievements-section__content">
          <div
            key={`achievement-info-${activeAchievement.id}`}
            className="achievement-information"
          >
            <Link
              to={activeAchievementPath}
              className="achievement-information__title"
            >
              {activeAchievement.title}
            </Link>

            <div className="achievement-information__description">
              {activeAchievementDescription.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="achievement-information__footer">
              <ViewAllButton to="/business/successful-projects">
                همه دستاوردها
              </ViewAllButton>
            </div>
          </div>

          <div className="achievement-visual">
            <Link
              to={activeAchievementPath}
              className="achievement-visual__media"
            >
              <img
                key={`achievement-image-${activeAchievement.id}`}
                className="achievement-visual__image"
                src={getProjectImage(activeAchievement)}
                alt={activeAchievement.title}
              />

              <span className="achievement-visual__overlay">
                <span className="achievement-visual__view-button">
                  مشاهده دستاورد
                </span>
              </span>
            </Link>

            <div
              className="achievement-visual__dots"
              aria-label="انتخاب دستاورد"
            >
              {projects.map((achievement, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={achievement.id}
                    type="button"
                    className={`achievement-visual__dot ${
                      isActive ? "achievement-visual__dot--active" : ""
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`نمایش دستاورد ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AchievementsSection;
