import { useState } from "react";

import "./AboutGovernanceSection.css";

const executiveManagers = [
  {
    id: 1,
    name: "مهدیه سیفی",
    position: "عضو کمیته راهبری هاتف",
    initials: "م‌س",
    tone: "cyan",
    description:
      "مدیر اجرایی برنامه هاتف با سابقه فعالیت در حوزه سیاست‌گذاری فناوری، توسعه همکاری میان دانشگاه و صنعت و هدایت برنامه‌های پژوهشی و فناورانه.",
  },
  {
    id: 2,
    name: "محمد کریمی",
    position: "عضو کمیته راهبری هاتف",
    initials: "م‌ک",
    tone: "blue",
    description:
      "فعال در زمینه توسعه کسب‌وکارهای دانش‌بنیان، تجاری‌سازی فناوری و ایجاد ارتباط مؤثر میان پژوهشگران، صنایع و سرمایه‌گذاران.",
  },
];

const steeringMembers = [
  {
    id: 1,
    name: "علی رضایی",
    position: "عضو کمیته راهبری هاتف",
    initials: "ع‌ر",
    tone: "gray",
  },
  {
    id: 2,
    name: "محمد حسینی",
    position: "عضو کمیته راهبری هاتف",
    initials: "م‌ح",
    tone: "cyan",
  },
  {
    id: 3,
    name: "سارا احمدی",
    position: "عضو کمیته راهبری هاتف",
    initials: "س‌ا",
    tone: "gold",
  },
  {
    id: 4,
    name: "رضا محمدی",
    position: "عضو کمیته راهبری هاتف",
    initials: "ر‌م",
    tone: "blue",
  },
  {
    id: 5,
    name: "مریم حیدری",
    position: "عضو کمیته راهبری هاتف",
    initials: "م‌ح",
    tone: "green",
  },
  {
    id: 6,
    name: "فاطمه کریمی",
    position: "عضو کمیته راهبری هاتف",
    initials: "ف‌ک",
    tone: "purple",
  },
];

const scientificMembers = [
  {
    id: 1,
    name: "مهدیه سیفی",
    position: "عضو کمیته علمی هاتف",
    initials: "م‌س",
    tone: "gold",
  },
  {
    id: 2,
    name: "علی رضایی",
    position: "عضو کمیته علمی هاتف",
    initials: "ع‌ر",
    tone: "gray",
  },
];

const departmentManagers = [
  {
    id: 1,
    name: "سارا احمدی",
    position: "مدیر واحد پژوهش",
    initials: "س‌ا",
    tone: "cyan",
  },
  {
    id: 2,
    name: "محمد کریمی",
    position: "مدیر واحد تجاری‌سازی",
    initials: "م‌ک",
    tone: "blue",
  },
  {
    id: 3,
    name: "مریم حیدری",
    position: "مدیر واحد ارتباط با صنعت",
    initials: "م‌ح",
    tone: "green",
  },
  {
    id: 4,
    name: "رضا محمدی",
    position: "مدیر واحد سرمایه‌گذاری",
    initials: "ر‌م",
    tone: "gray",
  },
];

const roadmapItems = [
  {
    id: 1,
    title: "اهداف سند راهبردی هاتف",
    description:
      "این سند جهت‌گیری‌های کلان برنامه هاتف را در حوزه حمایت از پژوهشگران، توسعه فناوری، تجاری‌سازی دستاوردها و ارتباط میان دانشگاه و صنعت مشخص می‌کند.",
  },
  {
    id: 2,
    title: "اولویت‌های علمی و فناورانه",
    description:
      "اولویت‌های علمی و فناورانه براساس مسائل واقعی کشور، ظرفیت دانشگاه‌ها، نیاز صنایع و قابلیت توسعه بازار تعیین می‌شوند.",
  },
  {
    id: 3,
    title: "فرآیند ارزیابی و حمایت",
    description:
      "طرح‌ها پس از بررسی علمی، فنی، اقتصادی و اجرایی وارد مراحل منتورینگ، توسعه نمونه اولیه، جذب سرمایه و تجاری‌سازی می‌شوند.",
  },
];

const annualReports = [
  {
    id: 1,
    title: "گزارش عملکرد سالانه برنامه هدایت اعتبارات توسعه فناوری",
  },
  {
    id: 2,
    title: "گزارش ارزیابی و پایش طرح‌های پژوهشی و فناورانه",
  },
  {
    id: 3,
    title: "گزارش همکاری‌های دانشگاه، صنعت و سرمایه‌گذاران",
  },
  {
    id: 4,
    title: "گزارش محصولات و دستاوردهای تجاری‌سازی‌شده",
  },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonAvatar({ person, large = false }) {
  return (
    <div
      className={`about-person__avatar about-person__avatar--${person.tone} ${
        large ? "about-person__avatar--large" : ""
      }`}
      aria-hidden="true"
    >
      {person.initials}
    </div>
  );
}

function PersonProfile({ person }) {
  return (
    <article className="about-person">
      <PersonAvatar person={person} />

      <div className="about-person__content">
        <h4>{person.name}</h4>

        <strong>{person.position}</strong>

        <a href="#university-profile">صفحه در دانشگاه</a>
      </div>
    </article>
  );
}

function AboutGovernanceSection() {
  const [openRoadmapId, setOpenRoadmapId] = useState(null);

  const toggleRoadmap = (itemId) => {
    setOpenRoadmapId((currentId) => (currentId === itemId ? null : itemId));
  };

  return (
    <section className="about-governance" id="people-managers">
      <header className="about-governance__main-heading">
        <span />

        <h2>افراد و مدیران</h2>

        <span />
      </header>

      <div className="about-governance__container">
        <section className="about-governance__group" id="executive-manager">
          <header className="about-governance__subheading">
            <span />
            <h3>مدیران اجرایی</h3>
          </header>

          <div className="about-governance__executives">
            {executiveManagers.map((manager) => (
              <article className="about-executive" key={manager.id}>
                <PersonAvatar person={manager} large />

                <div className="about-executive__content">
                  <h4>{manager.name}</h4>

                  <strong>{manager.position}</strong>

                  <p>{manager.description}</p>

                  <a href="#university-profile">صفحه در دانشگاه</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-governance__group" id="steering-council">
          <header className="about-governance__subheading">
            <span />
            <h3>شورای راهبری</h3>
          </header>

          <p className="about-governance__group-description">
            شورای راهبری مسئول تعیین جهت‌گیری‌های کلان، بررسی اولویت‌های پژوهشی،
            نظارت بر عملکرد برنامه و ایجاد هماهنگی میان بخش‌های اجرایی، علمی و
            صنعتی هاتف است.
          </p>

          <div className="about-governance__people-grid">
            {steeringMembers.map((member) => (
              <PersonProfile key={member.id} person={member} />
            ))}
          </div>
        </section>

        <section className="about-governance__group" id="scientific-committee">
          <header className="about-governance__subheading">
            <span />
            <h3>کمیته علمی</h3>
          </header>

          <p className="about-governance__group-description">
            کمیته علمی وظیفه ارزیابی طرح‌ها، بررسی کیفیت علمی و فنی پیشنهادها و
            ارائه مشاوره تخصصی برای توسعه پروژه‌های منتخب را بر عهده دارد.
          </p>

          <div className="about-governance__people-grid about-governance__people-grid--small">
            {scientificMembers.map((member) => (
              <PersonProfile key={member.id} person={member} />
            ))}
          </div>
        </section>

        <section className="about-governance__group" id="department-managers">
          <header className="about-governance__subheading">
            <span />
            <h3>مدیران واحدها</h3>
          </header>

          <div className="about-governance__people-grid">
            {departmentManagers.map((manager) => (
              <PersonProfile key={manager.id} person={manager} />
            ))}
          </div>
        </section>
      </div>

      <section className="about-roadmap" id="strategic-document">
        <header className="about-governance__main-heading">
          <span />

          <h2>سند راهبردی هاتف</h2>

          <span />
        </header>

        <div className="about-roadmap__container">
          <div className="about-roadmap__accordion">
            {roadmapItems.map((item) => {
              const isOpen = openRoadmapId === item.id;

              return (
                <article
                  className={`about-roadmap__item ${
                    isOpen ? "about-roadmap__item--open" : ""
                  }`}
                  key={item.id}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleRoadmap(item.id)}
                  >
                    <span>{item.title}</span>

                    <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                  </button>

                  <div className="about-roadmap__answer">
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="about-roadmap__downloads">
            <h3>بارگیری سند راهبردی هاتف</h3>

            <div>
              <button type="button">
                <DownloadIcon />
                نسخه PDF
              </button>

              <button type="button">
                <DownloadIcon />
                نسخه DOCX
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="about-reports" id="annual-reports">
        <div className="about-reports__container">
          <header className="about-governance__subheading">
            <span />
            <h3>گزارش سالانه</h3>
          </header>

          <div className="about-reports__list">
            {annualReports.map((report) => (
              <article className="about-report" key={report.id}>
                <div className="about-report__title">
                  <span />
                  <p>{report.title}</p>
                </div>

                <div className="about-report__actions">
                  <button type="button">
                    <DownloadIcon />
                    نسخه PDF
                  </button>

                  <button type="button">
                    <DownloadIcon />
                    نسخه DOCX
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

export default AboutGovernanceSection;
