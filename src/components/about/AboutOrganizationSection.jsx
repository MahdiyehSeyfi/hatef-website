import bannerImage from "../../assets/images/banner.png";
import SectionHeader from "../ui/SectionHeader/SectionHeader";

import "./AboutOrganizationSection.css";

const quickLinks = [
  {
    id: 1,
    title: "مدیر اجرایی",
    href: "#executive-manager",
  },
  {
    id: 2,
    title: "شورای راهبری",
    href: "#steering-council",
  },
  {
    id: 3,
    title: "کمیته علمی",
    href: "#scientific-committee",
  },
  {
    id: 4,
    title: "مدیران واحدها",
    href: "#department-managers",
  },
  {
    id: 5,
    title: "سند راهبردی",
    href: "#strategic-document",
  },
  {
    id: 6,
    title: "گزارش سالانه",
    href: "#annual-reports",
  },
];

function AboutOrganizationSection() {
  return (
    <section className="about-organization" id="organization">
      <div className="about-organization__heading">
        <SectionHeader title="نمودار سازمانی" />
      </div>

      <div className="about-organization__container">
        <div className="about-organization__layout">
          <div className="about-organization__visual">
            <img src={bannerImage} alt="نمودار سازمانی برنامه هاتف" />
          </div>

          <aside className="about-organization__navigation">
            <header className="about-organization__navigation-heading">
              <span />

              <h3>پیوندهای دسترسی سریع</h3>
            </header>

            <nav
              className="about-organization__links"
              aria-label="دسترسی سریع به بخش‌های درباره ما"
            >
              {quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="about-organization__link"
                >
                  <span>{link.title}</span>

                  <i aria-hidden="true">←</i>
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AboutOrganizationSection;
