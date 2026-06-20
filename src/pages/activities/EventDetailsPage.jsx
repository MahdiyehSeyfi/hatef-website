import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";

import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import ExpandableArticle from "../../components/activities/ExpandableArticle";

import {
  courseItems,
  eventItems,
  getEventById,
} from "../../data/activitiesData";

import facebookIcon from "../../assets/icons/contact/facebook.svg";
import instagramIcon from "../../assets/icons/contact/instagram.svg";
import telegramIcon from "../../assets/icons/contact/telegram.svg";
import twitterIcon from "../../assets/icons/contact/twitter.svg";
import whatsappIcon from "../../assets/icons/contact/whatsapp.svg";

import "./EventDetailsPage.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3v4M17 3v4M3.5 9h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7.5V12l3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="9"
        r="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 19c.3-4 2.2-6 5.5-6s5.2 2 5.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M15 6.2a2.7 2.7 0 0 1 0 5.2M16.5 13.3c2.5.5 3.8 2.4 4 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PresentationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 20l4-4 4 4M12 16v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 12.5 4 4L18 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const eventHighlights = [
  {
    id: 1,
    title: "ارائه تجربه‌های موفق",
    description:
      "آشنایی با تجربه‌های واقعی پژوهشگران، مدیران و مجموعه‌های فناور.",
  },
  {
    id: 2,
    title: "ارتباط با متخصصان",
    description:
      "فرصتی برای ارتباط مستقیم با سخنرانان، پژوهشگران و فعالان صنعت.",
  },
  {
    id: 3,
    title: "شبکه‌سازی حرفه‌ای",
    description:
      "ایجاد ارتباط میان دانشگاه، شرکت‌های دانش‌بنیان و سرمایه‌گذاران.",
  },
  {
    id: 4,
    title: "دسترسی به محتوای تخصصی",
    description: "دریافت محتوای علمی و کاربردی متناسب با نیازهای حوزه فناوری.",
  },
];

const eventAgenda = [
  {
    id: 1,
    time: "۰۸:۳۰",
    title: "پذیرش و ثبت‌نام شرکت‌کنندگان",
    description: "تحویل کارت ورود، بسته رویداد و راهنمای حضور در برنامه‌ها.",
  },
  {
    id: 2,
    time: "۰۹:۰۰",
    title: "افتتاحیه و معرفی برنامه هاتف",
    description: "معرفی اهداف رویداد، محورهای اصلی و فرصت‌های همکاری.",
  },
  {
    id: 3,
    time: "۱۰:۳۰",
    title: "پنل تخصصی دانشگاه و صنعت",
    description: "گفت‌وگوی مدیران و پژوهشگران درباره تجاری‌سازی فناوری.",
  },
  {
    id: 4,
    time: "۱۳:۳۰",
    title: "ارائه دستاوردها و شبکه‌سازی",
    description:
      "معرفی پروژه‌ها، مذاکره با مجموعه‌ها و شکل‌گیری همکاری‌های جدید.",
  },
];

const eventSpeakers = [
  {
    id: 1,
    initials: "م س",
    name: "مهدیه سیفی",
    role: "عضو کمیته راهبری هاتف",
    organization: "دانشگاه تهران",
  },
  {
    id: 2,
    initials: "ع ر",
    name: "علی رضایی",
    role: "مدیر توسعه فناوری",
    organization: "مرکز نوآوری دانشگاه تهران",
  },
  {
    id: 3,
    initials: "س ا",
    name: "سارا احمدی",
    role: "پژوهشگر و مدیر پروژه",
    organization: "معاونت پژوهشی دانشگاه تهران",
  },
];

const eventQuestions = [
  {
    id: 1,
    title: "شرکت در رویداد برای چه افرادی مناسب است؟",
    content:
      "پژوهشگران، دانشجویان، مدیران، صاحبان ایده، شرکت‌های دانش‌بنیان و فعالان حوزه فناوری می‌توانند در رویداد شرکت کنند.",
  },
  {
    id: 2,
    title: "آیا شرکت در رویداد نیازمند ثبت‌نام قبلی است؟",
    content:
      "بله، به‌دلیل محدودیت ظرفیت، ثبت‌نام اولیه از طریق سامانه ضروری است.",
  },
  {
    id: 3,
    title: "آیا برای شرکت‌کنندگان گواهی صادر می‌شود؟",
    content:
      "برای افرادی که حضور کامل و تأییدشده در برنامه داشته باشند، گواهی حضور صادر خواهد شد.",
  },
];

const articleParagraphs = [
  "رویدادهای برنامه هاتف بستری برای معرفی توانمندی‌های علمی، پژوهشی و فناورانه دانشگاه و ایجاد ارتباط مؤثر با صنعت فراهم می‌کنند.",
  "در این رویدادها، پژوهشگران و صاحبان ایده می‌توانند دستاوردهای خود را معرفی کرده و از تجربه متخصصان، مدیران و سرمایه‌گذاران استفاده کنند.",
  "هدف اصلی این برنامه‌ها تسهیل همکاری‌های مشترک، توسعه محصولات فناورانه و تبدیل یافته‌های دانشگاهی به راهکارهای قابل استفاده در جامعه و صنعت است.",
];

const socialLinks = [
  {
    id: 1,
    label: "فیسبوک",
    icon: facebookIcon,
  },
  {
    id: 2,
    label: "واتساپ",
    icon: whatsappIcon,
  },
  {
    id: 3,
    label: "توییتر",
    icon: twitterIcon,
  },
  {
    id: 4,
    label: "اینستاگرام",
    icon: instagramIcon,
  },
  {
    id: 5,
    label: "تلگرام",
    icon: telegramIcon,
  },
];

function getStatusLabel(status) {
  if (status === "registering") {
    return "ثبت‌نام فعال";
  }

  if (status === "ongoing") {
    return "در حال برگزاری";
  }

  return "برگزار شده";
}

function getActionLabel(status) {
  if (status === "registering") {
    return "ثبت‌نام در رویداد";
  }

  if (status === "ongoing") {
    return "مشاهده اطلاعات رویداد";
  }

  return "مشاهده گزارش رویداد";
}

function EventDetailsPage() {
  const { eventId } = useParams();

  const eventItem = getEventById(eventId);

  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [eventId]);

  if (!eventItem) {
    return <Navigate to="/events/all" replace />;
  }

  const relatedEvents = eventItems
    .filter((item) => item.id !== eventItem.id)
    .slice(0, 8);

  const relatedCourses = courseItems.slice(0, 8);

  const eventMeta = [
    {
      id: 1,
      title: "مدت رویداد",
      value: "یک روز",
      Icon: ClockIcon,
    },
    {
      id: 2,
      title: "تاریخ برگزاری",
      value: eventItem.startDate,
      Icon: CalendarIcon,
    },
    {
      id: 3,
      title: "نوع برگزاری",
      value: "حضوری",
      Icon: PresentationIcon,
    },
    {
      id: 4,
      title: "محل برگزاری",
      value: "دانشگاه تهران",
      Icon: LocationIcon,
    },
    {
      id: 5,
      title: "ظرفیت رویداد",
      value: "۱۲۰ نفر",
      Icon: UsersIcon,
    },
  ];

  return (
    <div className="event-details-page">
      <section className="event-details-hero">
        <div className="event-details-page__container">
          <nav className="event-details__breadcrumb" aria-label="مسیر صفحه">
            <Link to="/">صفحه اصلی</Link>

            <span>/</span>

            <Link to="/events/all">رویدادهای هاتف</Link>

            <span>/</span>

            <span>{eventItem.title}</span>
          </nav>

          <div className="event-details-hero__grid">
            <div className="event-details-hero__media">
              <img src={eventItem.image} alt={eventItem.title} />

              <div className="event-details-hero__badges">
                <span>{getStatusLabel(eventItem.status)}</span>

                <span>{eventItem.startDate}</span>
              </div>
            </div>

            <div className="event-details-hero__content">
              <span className="event-details-hero__eyebrow">
                رویداد تخصصی هاتف
              </span>

              <h1>{eventItem.title}</h1>

              <p>
                این رویداد با هدف ایجاد ارتباط میان پژوهشگران، صاحبان ایده،
                مدیران فناوری و فعالان صنعت برگزار می‌شود.
              </p>

              <p>
                شرکت‌کنندگان می‌توانند با تازه‌ترین دستاوردهای پژوهشی آشنا شوند
                و فرصت‌های همکاری جدیدی ایجاد کنند.
              </p>

              <a
                href="#event-registration"
                className="event-details-hero__button"
              >
                {getActionLabel(eventItem.status)}
              </a>
            </div>
          </div>

          <div className="event-details-meta">
            {eventMeta.map(({ id, title, value, Icon }) => (
              <article className="event-details-meta__item" key={id}>
                <span className="event-details-meta__icon">
                  <Icon />
                </span>

                <div>
                  <h2>{title}</h2>
                  <p>{value}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="event-details-content">
        <div className="event-details-page__container">
          <div className="event-details-content__grid">
            <aside className="event-details-sidebar">
              <div className="event-registration-card" id="event-registration">
                <div className="event-registration-card__header">
                  <span>{getStatusLabel(eventItem.status)}</span>

                  <span>ظرفیت محدود</span>
                </div>

                <h2>{eventItem.title}</h2>

                <dl className="event-registration-card__details">
                  <div>
                    <dt>دبیر رویداد:</dt>
                    <dd>{eventItem.instructor}</dd>
                  </div>

                  <div>
                    <dt>برگزارکننده:</dt>
                    <dd>{eventItem.organizer}</dd>
                  </div>

                  <div>
                    <dt>تاریخ برگزاری:</dt>
                    <dd>{eventItem.startDate}</dd>
                  </div>

                  <div>
                    <dt>ساعت برگزاری:</dt>
                    <dd>۰۸:۳۰ تا ۱۷:۰۰</dd>
                  </div>

                  <div>
                    <dt>نوع برگزاری:</dt>
                    <dd>حضوری</dd>
                  </div>

                  <div>
                    <dt>محل برگزاری:</dt>
                    <dd>دانشگاه تهران، سالن همایش‌های مرکزی</dd>
                  </div>
                </dl>

                <div className="event-registration-card__audience">
                  <h3>مناسب برای:</h3>

                  <div>
                    <span>
                      <CheckIcon />
                      پژوهشگران
                    </span>

                    <span>
                      <CheckIcon />
                      دانشجویان
                    </span>

                    <span>
                      <CheckIcon />
                      مدیران
                    </span>

                    <span>
                      <CheckIcon />
                      فعالان صنعت
                    </span>
                  </div>
                </div>

                <a
                  href="#registration-form"
                  className="event-registration-card__button"
                >
                  {getActionLabel(eventItem.status)}
                </a>
              </div>

              <div className="event-details-share">
                <span>به اشتراک‌گذاری این رویداد:</span>

                <div>
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href="#share-event"
                      aria-label={social.label}
                    >
                      <img src={social.icon} alt="" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <main className="event-details-article">
              <section className="event-content-section">
                <span className="event-content-section__eyebrow">
                  معرفی رویداد
                </span>

                <h2>محورهای پژوهشی سال جاری</h2>

                <p>
                  این رویداد بر توسعه فناوری‌های نوآورانه، تجاری‌سازی دستاوردهای
                  دانشگاهی و ایجاد همکاری میان پژوهشگران و صنعت تمرکز دارد.
                </p>

                <p>
                  شرکت‌کنندگان می‌توانند طرح‌ها و توانمندی‌های خود را معرفی کرده
                  و از تجربه مدیران، متخصصان و سرمایه‌گذاران بهره‌مند شوند.
                </p>
              </section>

              <section className="event-content-section">
                <span className="event-content-section__eyebrow">
                  مزایای حضور
                </span>

                <h2>چرا در این رویداد شرکت کنیم؟</h2>

                <div className="event-highlights">
                  {eventHighlights.map((highlight) => (
                    <article className="event-highlight" key={highlight.id}>
                      <span>
                        <CheckIcon />
                      </span>

                      <div>
                        <h3>{highlight.title}</h3>
                        <p>{highlight.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <span className="event-content-section__eyebrow">
                  برنامه رویداد
                </span>

                <h2>جدول زمان‌بندی برنامه‌ها</h2>

                <div className="event-agenda">
                  {eventAgenda.map((agendaItem) => (
                    <article className="event-agenda__item" key={agendaItem.id}>
                      <time>{agendaItem.time}</time>

                      <span className="event-agenda__marker" />

                      <div>
                        <h3>{agendaItem.title}</h3>
                        <p>{agendaItem.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <span className="event-content-section__eyebrow">
                  تیم علمی رویداد
                </span>

                <h2>سخنرانان و اعضای پنل</h2>

                <div className="event-speakers">
                  {eventSpeakers.map((speaker) => (
                    <article className="event-speaker" key={speaker.id}>
                      <span className="event-speaker__avatar">
                        {speaker.initials}
                      </span>

                      <div>
                        <h3>{speaker.name}</h3>
                        <p>{speaker.role}</p>
                        <span>{speaker.organization}</span>

                        <a href="#speaker-profile">مشاهده صفحه در دانشگاه</a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <span className="event-content-section__eyebrow">
                  راهنمای حضور
                </span>

                <h2>پرسش‌های متداول رویداد</h2>

                <div className="event-faq">
                  {eventQuestions.map((question, index) => {
                    const isOpen = openQuestion === index;

                    return (
                      <article
                        className={`event-faq__item ${
                          isOpen ? "event-faq__item--open" : ""
                        }`}
                        key={question.id}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenQuestion(isOpen ? null : index)}
                          aria-expanded={isOpen}
                        >
                          <span>{question.title}</span>

                          <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                        </button>

                        <div className="event-faq__answer">
                          <p>{question.content}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>
          </div>
        </div>
      </section>

      <section className="event-related-section">
        <div className="event-details-page__container">
          <ActivitiesCarousel
            key={`related-events-${eventItem.id}`}
            title="رویدادهای دیگر"
            items={relatedEvents}
            viewAllPath="/events/all"
            viewAllLabel="مشاهده همه رویدادها"
          />
        </div>
      </section>

      <section className="event-related-section event-related-section--courses">
        <div className="event-details-page__container">
          <ActivitiesCarousel
            key={`related-courses-${eventItem.id}`}
            title="دیگر دوره‌های هاتف"
            items={relatedCourses}
            viewAllPath="/courses/all"
            viewAllLabel="مشاهده همه دوره‌ها"
          />
        </div>
      </section>

      <ExpandableArticle
        title="درباره رویدادهای تخصصی هاتف"
        paragraphs={articleParagraphs}
      />
    </div>
  );
}

export default EventDetailsPage;
