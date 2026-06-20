import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import searchIcon from "../../assets/icons/search.svg";
import "./Header.css";

const navigationItems = [
  { label: "درباره ما", href: "#about" },
  { label: "حمایت پژوهشی", href: "#research-support" },
  { label: "همکاری‌های تجاری", href: "#business" },
  { label: "خدمات ما", href: "#services" },
  { label: "رویدادها", href: "#events" },
  { label: "اخبار", href: "#news" },
  { label: "مستندات", href: "#documents" },
  { label: "تماس با ما", href: "#contact" },
];

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="/" className="site-header__logo" aria-label="صفحه اصلی">
          <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
        </a>

        <nav className="site-header__navigation" aria-label="منوی اصلی">
          <ul className="site-header__menu">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            className="site-header__search"
            type="button"
            aria-label="جست‌وجو"
          >
            <img src={searchIcon} alt="" />
          </button>

          <a href="#login" className="site-header__login">
            ورود | ثبت‌نام
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
