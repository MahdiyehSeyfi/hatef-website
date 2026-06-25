import { Link, useParams } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import ctaBannerImage from "../../assets/images/banner-2.png";

import NewsSidebar from "../../components/news/NewsSidebar";

import { getCallById, getCalls } from "../../services/callService";
import { CALL_STATUS, CALL_STATUS_LABELS } from "../../constants/statuses";

import "./CallDetailsPage.css";

const quickLinks = [
  {
    id: 1,
    label: "راهنمای شرکت در طرح",
    href: "#registration-guide",
  },
  {
    id: 2,
    label: "شرایط احراز و ارسال آثار",
    href: "#eligibility",
  },
  {
    id: 3,
    label: "راهنمای تدوین پروپوزال",
    href: "#proposal-guide",
  },
  {
    id: 4,
    label: "نسخه PDF",
    href: "#download-pdf",
    download: true,
  },
];

const faqItems = [
  {
    id: 1,
    question: "چه کسانی می‌توانند در این فراخوان شرکت کنند؟",
    answer:
      "پژوهشگران، فناوران، تیم‌های نوآور و صاحبان ایده می‌توانند با توجه به شرایط اعلام‌شده در فراخوان، طرح خود را ثبت کنند.",
  },
  {
    id: 2,
    question: "طرح‌ها چگونه بررسی می‌شوند؟",
    answer:
      "طرح‌ها ابتدا از نظر کامل‌بودن مدارک بررسی می‌شوند و سپس وارد مرحله ارزیابی تخصصی، بررسی داوران و تصمیم‌گیری نهایی می‌شوند.",
  },
  {
    id: 3,
    question: "نتیجه طرح از کجا قابل مشاهده است؟",
    answer:
      "پس از انتشار نتایج توسط دبیرخانه، فناور می‌تواند نتیجه نهایی طرح خود را از طریق داشبورد کاربری مشاهده کند.",
  },
];

function toPersianNumber(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function getCallByRouteParam(callId) {
  const directCall = getCallById(callId);

  if (directCall) {
    return directCall;
  }

  const allCalls = getCalls();
  const numericIndex = Number(callId);

  if (Number.isInteger(numericIndex) && numericIndex > 0) {
    return allCalls[numericIndex - 1] || null;
  }

  return null;
}

function getCallNumber(call) {
  const allCalls = getCalls();
  const index = allCalls.findIndex((item) => item.id === call.id);

  if (index === -1) {
    return "۱";
  }

  return toPersianNumber(index + 1);
}

function getCallCategory(call) {
  return call.field ? `با محوریت ${call.field}` : "فراخوان برنامه هاتف";
}

function getCallDeadline(call) {
  if (!call.deadlineDate && !call.deadlineTime) {
    return "مهلت ارسال مشخص نشده است";
  }

  if (call.deadlineDate && call.deadlineTime) {
    return `مهلت تا: ${call.deadlineDate} ساعت ${call.deadlineTime}`;
  }

  return `مهلت تا: ${call.deadlineDate || call.deadlineTime}`;
}

function getCallSubmitStatus(call) {
  if (call.status === CALL_STATUS.PUBLISHED) {
    return "در حال دریافت طرح";
  }

  return CALL_STATUS_LABELS[call.status] || "وضعیت نامشخص";
}

function getCallStatusLabel(call) {
  if (call.status === CALL_STATUS.PUBLISHED) {
    return "در حال دریافت طرح‌ها";
  }

  return CALL_STATUS_LABELS[call.status] || "وضعیت نامشخص";
}

function mapCallDetails(call) {
  return {
    ...call,
    number: getCallNumber(call),
    category: getCallCategory(call),
    deadline: getCallDeadline(call),
    status: getCallStatusLabel(call),
    submitStatus: getCallSubmitStatus(call),
  };
}

function CallBadge({ children, variant = "default" }) {
  return (
    <span className={`call-details__badge call-details__badge--${variant}`}>
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <header className="call-details__section-title">
      <span />
      <h2>{children}</h2>
    </header>
  );
}

function QuickActions({ call }) {
  const links = quickLinks.map((item) => {
    if (item.download && call.pdfFileUrl) {
      return {
        ...item,
        href: call.pdfFileUrl,
      };
    }

    return item;
  });

  return (
    <aside className="call-details__quick-actions">
      {links.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`call-details__quick-link ${
            item.download ? "call-details__quick-link--download" : ""
          }`}
          target={item.download && call.pdfFileUrl ? "_blank" : undefined}
          rel={item.download && call.pdfFileUrl ? "noreferrer" : undefined}
        >
          {item.download && <span aria-hidden="true">↓</span>}
          {item.label}
        </a>
      ))}

      <a href="#submit-call" className="call-details__submit-button">
        ارسال طرح
      </a>
    </aside>
  );
}

function CallHero({ call }) {
  const isActive = call.status === CALL_STATUS.PUBLISHED;

  return (
    <section className="call-details__hero">
      <div className="call-details__hero-image">
        <img src={bannerImage} alt={call.title} />

        <div className="call-details__hero-status">
          <CallBadge variant={isActive ? "active" : "default"}>
            {call.submitStatus}
          </CallBadge>

          <span>{call.deadline}</span>
        </div>
      </div>

      <div className="call-details__hero-content">
        <QuickActions call={call} />

        <div className="call-details__hero-info">
          <div className="call-details__meta">
            <span className="call-details__number">{call.number}</span>

            <h1>{call.title}</h1>

            <CallBadge>{call.category}</CallBadge>
          </div>

          <p>{call.description}</p>

          <p>
            {call.moreDescription ||
              "این فراخوان با هدف حمایت از ایده‌ها و طرح‌های فناورانه دانشگاهی طراحی شده و تلاش می‌کند مسیر تبدیل پژوهش به محصول، خدمت یا راهکار کاربردی را کوتاه‌تر و دقیق‌تر کند."}
          </p>
        </div>
      </div>
    </section>
  );
}

function CallContent({ call }) {
  return (
    <article className="call-details__article">
      <section id="registration-guide">
        <SectionTitle>محورهای پژوهشی سال جاری</SectionTitle>

        <p>
          این فراخوان در حوزه <strong>{call.field}</strong> تعریف شده است و
          متقاضیان می‌توانند طرح‌های مرتبط با این محور را برای بررسی ارسال کنند.
        </p>

        <p>
          طرح‌های ارسالی باید مسئله‌محور، قابل اجرا، دارای ظرفیت توسعه و مرتبط
          با نیازهای واقعی جامعه، صنعت یا زیست‌بوم فناوری باشند.
        </p>
      </section>

      <section id="eligibility">
        <SectionTitle>شرایط احراز و ارسال آثار</SectionTitle>

        <p>
          متقاضیان لازم است اطلاعات طرح، اعضای تیم، سوابق مرتبط، برنامه اجرایی و
          مستندات موردنیاز را با دقت آماده کنند و در بازه زمانی اعلام‌شده ارسال
          کنند.
        </p>

        <p>
          پس از ثبت طرح، دبیرخانه ابتدا کامل‌بودن مدارک و ارتباط طرح با محور
          فراخوان را بررسی می‌کند. سپس طرح وارد مرحله ارزیابی تخصصی و داوری
          می‌شود.
        </p>

        <p>
          معیارهایی مانند نوآوری، امکان اجرا، ظرفیت توسعه، اثرگذاری و امکان
          تجاری‌سازی در بررسی طرح‌ها مورد توجه قرار می‌گیرد.
        </p>
      </section>

      <section id="proposal-guide">
        <SectionTitle>راهنمای تدوین پروپوزال</SectionTitle>

        <p>
          پروپوزال بهتر است شامل تعریف مسئله، راهکار پیشنهادی، نوآوری طرح، تیم
          اجرایی، زمان‌بندی، منابع موردنیاز، خروجی مورد انتظار و مسیر توسعه یا
          تجاری‌سازی باشد.
        </p>

        <p>
          هرچه مسیر اجرا، مزیت رقابتی و خروجی طرح شفاف‌تر نوشته شود، فرآیند
          بررسی و تصمیم‌گیری دقیق‌تر انجام خواهد شد.
        </p>
      </section>

      <section id="download-pdf">
        <SectionTitle>نسخه PDF فراخوان</SectionTitle>

        {call.pdfFileUrl ? (
          <p>
            نسخه PDF این فراخوان از طریق لینک نسخه PDF در بخش دسترسی سریع قابل
            دریافت است.
          </p>
        ) : (
          <p>
            برای این فراخوان هنوز فایل PDF جداگانه ثبت نشده است. اطلاعات اصلی
            فراخوان در همین صفحه قابل مشاهده است.
          </p>
        )}
      </section>
    </article>
  );
}

function CallCta() {
  return (
    <section className="call-details__cta" id="submit-call">
      <img src={ctaBannerImage} alt="" aria-hidden="true" />

      <div className="call-details__cta-overlay" />

      <div className="call-details__cta-content">
        <h2>برای ثبت طرح خود در این فراخوان اقدام کنید</h2>

        <p>
          پس از مطالعه شرایط فراخوان، می‌توانید از طریق داشبورد فناور طرح خود را
          ثبت و وضعیت بررسی آن را پیگیری کنید.
        </p>

        <div className="call-details__cta-actions">
          <Link to="/auth">ورود به سامانه</Link>
          <Link to="/research-support/guide-eligibility">راهنمای شرکت</Link>
        </div>
      </div>
    </section>
  );
}

function CallFaq() {
  return (
    <section className="call-details__faq">
      <SectionTitle>سوالات شما</SectionTitle>

      <div className="call-details__faq-list">
        {faqItems.map((faq) => (
          <details className="call-details__faq-item" key={faq.id}>
            <summary>
              <span>{faq.question}</span>
              <i aria-hidden="true">+</i>
            </summary>

            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CallNotFound() {
  return (
    <main className="call-details">
      <div className="call-details__container">
        <section className="call-details__article">
          <SectionTitle>فراخوان پیدا نشد</SectionTitle>

          <p>
            فراخوانی با این شناسه در سامانه ثبت نشده است یا ممکن است آدرس وارد
            شده اشتباه باشد.
          </p>

          <div className="call-details__back-wrap">
            <Link to="/research-support/calls" className="call-details__back">
              بازگشت به فهرست فراخوان‌ها
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function CallDetailsPage() {
  const { callId } = useParams();
  const selectedCall = getCallByRouteParam(callId);

  if (!selectedCall) {
    return <CallNotFound />;
  }

  const call = mapCallDetails(selectedCall);

  return (
    <main className="call-details">
      <div className="call-details__container">
        <CallHero call={call} />

        <div className="call-details__layout">
          <aside className="call-details__sidebar">
            <NewsSidebar />
          </aside>

          <div className="call-details__main">
            <CallContent call={call} />
          </div>
        </div>

        <CallCta />

        <CallFaq />

        <div className="call-details__back-wrap">
          <Link to="/research-support/calls" className="call-details__back">
            بازگشت به فهرست فراخوان‌ها
          </Link>

          <span className="call-details__page-id">
            شناسه فراخوان: {call.id}
          </span>
        </div>
      </div>
    </main>
  );
}

export default CallDetailsPage;
