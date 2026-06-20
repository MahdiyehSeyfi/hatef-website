import { useState } from "react";
import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import searchIcon from "../../assets/icons/search.svg";
import "./Header.css";

const navigationItems = [
  {
    label: "درباره ما",
    href: "#about",
    children: [
      { label: "ماموریت و چشم‌انداز", href: "#mission" },
      { label: "تاریخچه", href: "#history" },
      { label: "چارت سازمانی", href: "#organization-chart" },
      { label: "افراد و مدیران", href: "#managers" },
      { label: "سند راهبردی", href: "#strategy" },
    ],
  },
  {
    label: "حمایت پژوهشی",
    href: "#research-support",
    children: [
      { label: "محورهای سال جاری", href: "#current-fields" },
      { label: "فراخوان‌ها", href: "#calls" },
      { label: "شرایط احراز", href: "#requirements" },
      { label: "راهنمای ثبت‌نام", href: "#registration-guide" },
      { label: "شیوه‌نامه تدوین پروپوزال", href: "#proposal-guide" },
      { label: "نظام داوری", href: "#review-system" },
      { label: "معیارهای ارزیابی", href: "#evaluation-criteria" },
    ],
  },
  {
    label: "همکاری‌های تجاری",
    href: "#business",
    children: [
      {
        label: "فرصت‌های همکاری",
        href: "#collaboration-opportunities",
        children: [
          {
            label: "فرصت‌های سرمایه‌گذاری",
            href: "#investment-opportunities",
          },
          {
            label: "فرصت‌های تجاری",
            href: "#commercial-opportunities",
          },
        ],
      },
      { label: "مزایای همکاری", href: "#collaboration-benefits" },
      {
        label: "دستاوردها و پروژه‌های موفق",
        href: "#successful-projects",
      },
      { label: "نحوه همکاری", href: "#collaboration-process" },
      { label: "همکاران تجاری ما", href: "#commercial-partners" },
      { label: "چارچوب‌های همکاری", href: "#collaboration-frameworks" },
      { label: "ارتباط جهت مشارکت", href: "#participation-contact" },
    ],
  },
  {
    label: "خدمات ما",
    href: "#services",
    children: [
      { label: "راهبری و هدایت فناور", href: "#technology-guidance" },
      { label: "خدمات مشاوره", href: "#consulting" },
      {
        label: "نقشه راه تجاری‌سازی",
        href: "#commercialization-roadmap",
      },
    ],
  },
  {
    label: "رویدادها",
    href: "#events",
    children: [
      { label: "رویدادها", href: "#events-list" },
      { label: "دوره‌های توانمندسازی", href: "#courses" },
    ],
  },
  {
    label: "اخبار",
    href: "#news",
  },
  {
    label: "مستندات",
    href: "#documents",
    children: [
      { label: "فرم‌ها", href: "#forms" },
      { label: "آیین‌نامه‌ها", href: "#regulations" },
      { label: "قالب‌ها", href: "#templates" },
    ],
  },
  {
    label: "تماس با ما",
    href: "#contact",
  },
];

const searchItems = [
  { label: "درباره ما", href: "#about" },
  { label: "ماموریت و چشم‌انداز", href: "#mission" },
  { label: "حمایت پژوهشی", href: "#research-support" },
  { label: "محورهای سال جاری", href: "#current-fields" },
  { label: "فراخوان‌ها", href: "#calls" },
  { label: "همکاری‌های تجاری", href: "#business" },
  { label: "فرصت‌های همکاری", href: "#collaboration-opportunities" },
  { label: "خدمات ما", href: "#services" },
  { label: "رویدادها", href: "#events" },
  { label: "دوره‌های توانمندسازی", href: "#courses" },
  { label: "اخبار", href: "#news" },
  { label: "دستاوردهای هاتف", href: "#achievements" },
  { label: "مستندات", href: "#documents" },
  { label: "تماس با ما", href: "#contact" },
];

function NavigationItem({ item, nested = false }) {
  const hasChildren = Boolean(item.children?.length);

  return (
    <li
      className={
        nested ? "site-header__submenu-item" : "site-header__menu-item"
      }
    >
      <a
        href={item.href}
        className={
          nested ? "site-header__submenu-link" : "site-header__menu-link"
        }
        aria-haspopup={hasChildren ? "true" : undefined}
      >
        {nested && <span className="site-header__submenu-dot" />}

        <span>{item.label}</span>

        {nested && hasChildren && (
          <span className="site-header__submenu-arrow">‹</span>
        )}
      </a>

      {hasChildren && (
        <ul className="site-header__submenu">
          {item.children.map((child) => (
            <NavigationItem key={child.label} item={child} nested />
          ))}
        </ul>
      )}
    </li>
  );
}

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim();

  const searchResults = normalizedQuery
    ? searchItems
        .filter((item) => item.label.includes(normalizedQuery))
        .slice(0, 6)
    : [];

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length === 0) {
      return;
    }

    window.location.hash = searchResults[0].href;
    closeSearch();
  };

  const handleResultClick = () => {
    closeSearch();
  };

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <a href="/" className="site-header__logo" aria-label="صفحه اصلی">
            <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
          </a>

          <nav className="site-header__navigation" aria-label="منوی اصلی">
            <ul className="site-header__menu">
              {navigationItems.map((item) => (
                <NavigationItem key={item.label} item={item} />
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <button
              className={`site-header__search ${
                isSearchOpen ? "site-header__search--active" : ""
              }`}
              type="button"
              aria-label="بازکردن جست‌وجو"
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((current) => !current)}
            >
              <img src={searchIcon} alt="" />
            </button>

            <a href="#login" className="site-header__login">
              ورود | ثبت‌نام
            </a>
          </div>
        </div>
      </header>

      <div className={`site-search ${isSearchOpen ? "site-search--open" : ""}`}>
        <div className="container site-search__inner">
          <form className="site-search__form" onSubmit={handleSearchSubmit}>
            <img className="site-search__icon" src={searchIcon} alt="" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="چه چیزی را جست‌وجو می‌کنید؟"
              aria-label="عبارت موردنظر برای جست‌وجو"
              autoFocus={isSearchOpen}
            />

            <button
              className="site-search__submit"
              type="submit"
              disabled={!searchResults.length}
            >
              جست‌وجو
            </button>

            <button
              className="site-search__close"
              type="button"
              onClick={closeSearch}
              aria-label="بستن جست‌وجو"
            >
              ×
            </button>
          </form>

          {normalizedQuery && (
            <div className="site-search__results">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <a
                    key={`${result.label}-${result.href}`}
                    href={result.href}
                    onClick={handleResultClick}
                    className="site-search__result"
                  >
                    <span className="site-search__result-dot" />
                    <span>{result.label}</span>
                  </a>
                ))
              ) : (
                <p className="site-search__empty">
                  نتیجه‌ای برای «{normalizedQuery}» پیدا نشد.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
