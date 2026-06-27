import { Link } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import "./Footer.css";

const footerColumns = [
  {
    title: "حمایت پژوهشی",
    links: [
      { label: "فراخوان‌های حمایت", to: "/research-support/calls" },
      { label: "محورهای سال جاری", to: "/research-support/current-fields" },
      {
        label: "راهنمای ثبت‌نام",
        to: "/research-support/guide-eligibility#registration-guide",
      },
      {
        label: "فرآیند داوری و ارزیابی",
        to: "/research-support/review-evaluation",
      },
    ],
  },
  {
    title: "همکاری تجاری",
    links: [
      { label: "معرفی همکاری تجاری", to: "/business/collaboration" },
      { label: "فرصت‌های همکاری", to: "/business/opportunities" },
      {
        label: "پروژه‌های موفق و دستاوردها",
        to: "/business/successful-projects",
      },
    ],
  },
  {
    title: "رویدادها و دوره‌ها",
    links: [
      { label: "همه رویدادها", to: "/events" },
      { label: "آرشیو رویدادها", to: "/events/all" },
      { label: "همه دوره‌ها", to: "/courses/all" },
    ],
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 4l14 16M19 4 5 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="7.3" cy="8" r="1.2" fill="currentColor" />
      <path
        d="M7.3 11v6M11 17v-6m0 2.4c.8-1.7 4.8-2.4 4.8 1.1V17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.4 4.2 3.8 10.6c-1.1.4-1.1 1 .2 1.4l4.2 1.3 1.6 5c.2.7.1 1 .8 1 .5 0 .8-.2 1.1-.5l2.1-2 4.4 3.2c.8.5 1.4.3 1.6-.8l2.8-13.3c.3-1.3-.5-1.9-1.4-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m8.3 13.2 9.2-5.7-7.1 7.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const socialLinks = [
  {
    id: 1,
    label: "اینستاگرام",
    href: "#instagram",
    Icon: InstagramIcon,
  },
  {
    id: 2,
    label: "شبکه اجتماعی ایکس",
    href: "#x",
    Icon: XIcon,
  },
  {
    id: 3,
    label: "لینکدین",
    href: "#linkedin",
    Icon: LinkedInIcon,
  },
  {
    id: 4,
    label: "تلگرام",
    href: "#telegram",
    Icon: TelegramIcon,
  },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__overlay" />
      <span className="site-footer__orb site-footer__orb--first" />
      <span className="site-footer__orb site-footer__orb--second" />

      <div className="container site-footer__content">
        <div className="site-footer__brand">
          <div className="site-footer__logo-frame">
            <img
              className="site-footer__logo"
              src={universityLogo}
              alt="لوگوی دانشگاه تهران"
            />
          </div>

          <h2>برنامه هاتف</h2>

          <p>
            هدایت اعتبارات توسعه فناوری با هدف اتصال دانشگاه، صنعت و زیست‌بوم
            نوآوری
          </p>
        </div>

        <nav className="site-footer__links" aria-label="لینک‌های فوتر">
          {footerColumns.map((column) => (
            <div className="site-footer__link-column" key={column.title}>
              <h3>{column.title}</h3>

              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>
                      <span />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="site-footer__contact-card">
          <span className="site-footer__contact-badge">دبیرخانه هاتف</span>

          <h3>ارتباط با برنامه هدایت اعتبارات توسعه فناوری</h3>

          <a className="site-footer__email" href="mailto:uthatef@ut.ac.ir">
            uthatef@ut.ac.ir
          </a>

          <div className="site-footer__socials" aria-label="شبکه‌های اجتماعی">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <a
                key={id}
                href={href}
                className="site-footer__social-link"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>کلیه حقوق متعلق به دانشگاه تهران است.</p>

        <Link to="/auth">ورود به سامانه</Link>
      </div>
    </footer>
  );
}

export default Footer;
