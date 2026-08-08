import ContactFormSection from "../../components/common/ContactFormSection";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";

import bannerImage from "../../assets/images/banner.png";
import facebookIcon from "../../assets/icons/contact/facebook.svg";
import instagramIcon from "../../assets/icons/contact/instagram.svg";
import telegramIcon from "../../assets/icons/contact/telegram.svg";
import twitterIcon from "../../assets/icons/contact/twitter.svg";
import whatsappIcon from "../../assets/icons/contact/whatsapp.svg";

import "./ContactPage.css";

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m4 7 8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.1 3.5 4.7 5.2c-.9.7-1.2 1.9-.7 2.9 2.5 5.4 6.5 9.4 11.9 11.9 1 .5 2.2.2 2.9-.7l1.7-2.4c.6-.8.4-1.9-.4-2.5l-3.1-2.2c-.7-.5-1.7-.4-2.3.2l-1.4 1.4a15.3 15.3 0 0 1-3.1-3.1l1.4-1.4c.6-.6.7-1.6.2-2.3L9.6 3.9c-.6-.8-1.7-1-2.5-.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7v5l3.5 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
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

const contactMethods = [
  {
    id: 1,
    title: "ایمیل",
    value: "uthatef@ut.ac.ir",
    href: "mailto:uthatef@ut.ac.ir",
    Icon: EmailIcon,
  },
  {
    id: 2,
    title: "تلفن تماس",
    value: "۰۲۱-۱۱۱۱۱۱۱۱",
    href: "tel:+982111111111",
    Icon: PhoneIcon,
  },
  {
    id: 3,
    title: "ساعات کاری",
    value: "۸ صبح الی ۱۶ بعد از ظهر",
    Icon: ClockIcon,
  },
  {
    id: 4,
    title: "دفتر مرکزی",
    value: "ایران، تهران، خیابان فردوسی",
    Icon: LocationIcon,
  },
];

const socialLinks = [
  {
    id: 1,
    label: "فیسبوک",
    href: "#facebook",
    icon: facebookIcon,
  },
  {
    id: 2,
    label: "واتساپ",
    href: "#whatsapp",
    icon: whatsappIcon,
  },
  {
    id: 3,
    label: "توییتر",
    href: "#twitter",
    icon: twitterIcon,
  },
  {
    id: 4,
    label: "اینستاگرام",
    href: "#instagram",
    icon: instagramIcon,
  },
  {
    id: 5,
    label: "تلگرام",
    href: "#telegram",
    icon: telegramIcon,
  },
];


function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-page__container">
        <Breadcrumb
          className="contact-page__breadcrumb"
          items={[
            { label: "صفحه اصلی", to: "/" },
            { label: "تماس با ما" },
          ]}
        />

        <section className="contact-page__banner">
          <img src={bannerImage} alt="" aria-hidden="true" />

          <div className="contact-page__banner-shade" />

          <div className="contact-page__banner-content">
            <span className="contact-page__eyebrow">ارتباط با هاتف</span>

            <h1>تماس با ما</h1>

            <p>
              برای ارسال پیام، پیگیری درخواست‌ها، دریافت راهنمایی و ارتباط با
              دبیرخانه برنامه هاتف، از مسیرهای ارتباطی زیر استفاده کنید.
            </p>
          </div>
        </section>

        <section className="contact-page__methods">
          <SectionHeader title="راه‌های ارتباطی" />

          <div className="contact-methods__grid">
            {contactMethods.map(({ id, title, value, href, Icon }) => (
              <article className="contact-method" key={id}>
                <div className="contact-method__icon">
                  <Icon />
                </div>

                <div className="contact-method__content">
                  <h3>{title}</h3>

                  {href ? <a href={href}>{value}</a> : <p>{value}</p>}
                </div>
              </article>
            ))}
          </div>

          <div className="contact-page__socials" aria-label="شبکه‌های اجتماعی">
            {socialLinks.map((socialLink) => (
              <a
                key={socialLink.id}
                href={socialLink.href}
                className="contact-page__social-link"
                aria-label={socialLink.label}
              >
                <img src={socialLink.icon} alt="" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <ContactFormSection
          id="contact-main-form"
          title="فرم تماس"
          submitLabel="ارسال"
          sourceType="contact"
          sourceTitle="تماس با ما"
          statusMessage="پیام شما ثبت شد و برای بررسی به دبیرخانه ارسال شد."
        />
      </div>
    </div>
  );
}

export default ContactPage;
