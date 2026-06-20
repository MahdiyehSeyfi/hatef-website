import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import socialMediaImage from "../../assets/logos/social-media.png";
import "./Footer.css";

const firstLinks = [
  { label: "فراخوان‌ها", href: "#calls" },
  { label: "آیین‌نامه‌ها", href: "#regulations" },
  { label: "فرم‌ها", href: "#forms" },
  { label: "طرح‌های برگزیده", href: "#selected-projects" },
];

const secondLinks = [
  { label: "درباره ما", href: "#about" },
  { label: "تماس با ما", href: "#contact" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__overlay" />

      <div className="container site-footer__content">
        <div className="site-footer__links">
          <ul>
            {firstLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>
                  <span />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <ul>
            {secondLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>
                  <span />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__contact">
          <h3>دبیرخانه برنامه هدایت اعتبارات توسعه فناوری (هاتف)</h3>

          <p>
            پست الکترونیکی:
            <a href="mailto:uthatef@ut.ac.ir">uthatef@ut.ac.ir</a>
          </p>

          <img
            className="site-footer__social-media"
            src={socialMediaImage}
            alt="شبکه‌های اجتماعی برنامه هاتف"
          />
        </div>

        <div className="site-footer__brand">
          <img
            className="site-footer__logo"
            src={universityLogo}
            alt="لوگوی دانشگاه تهران"
          />

          <p>کلیه حقوق متعلق به دانشگاه تهران است.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
