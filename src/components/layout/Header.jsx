import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import searchIcon from "../../assets/icons/search.svg";

import {
  getCurrentUser,
  getCurrentUserDashboardPath,
} from "../../services/authService";

import Button from "../ui/Button/Button";
import IconButton from "../ui/IconButton/IconButton";

import "./Header.css";

const HEADER_SCROLL_OFFSET = 118;

const navigationItems = [
  {
    label: "درباره ما",
    href: "/about",
    children: [
      {
        label: "ماموریت و چشم‌انداز",
        href: "/about#mission",
      },
      {
        label: "تاریخچه",
        href: "/about#history",
      },
      {
        label: "نمودار سازمانی",
        href: "/about#organization",
      },
      {
        label: "افراد و مدیران",
        href: "/about#people-managers",
      },
      {
        label: "سند راهبردی",
        href: "/about#strategic-document",
      },
    ],
  },
  {
    label: "حمایت پژوهشی",
    href: "/#research-support",
    children: [
      {
        label: "فراخوان‌ها",
        href: "/research-support/calls",
      },
      {
        label: "محورهای سال جاری",
        href: "/research-support/current-fields",
      },
      {
        label: "راهنمای ثبت‌نام",
        href: "/research-support/guide-eligibility",
      },
      {
        label: "شرایط احراز",
        href: "/research-support/guide-eligibility#eligibility",
      },
      {
        label: "شیوه‌نامه تدوین پروپوزال",
        href: "/research-support/guide-eligibility#proposal-guideline",
      },
      {
        label: "نظام داوری",
        href: "/research-support/review-evaluation",
      },
      {
        label: "معیارهای ارزیابی",
        href: "/research-support/review-evaluation#evaluation-criteria",
      },
    ],
  },
  {
    label: "همکاری‌های تجاری",
    href: "/#business",
    children: [
      {
        label: "فرصت‌های همکاری",
        href: "/business/opportunities",
      },
      {
        label: "دستاوردها و پروژه‌های موفق",
        href: "/business/successful-projects",
      },
      {
        label: "نحوه همکاری",
        href: "/business/collaboration",
      },
      {
        label: "مزایای همکاری",
        href: "/business/collaboration#benefits",
      },
      {
        label: "همکاران تجاری ما",
        href: "/business/collaboration#partners",
      },
      {
        label: "چارچوب‌های همکاری",
        href: "/business/collaboration#frameworks",
      },
      {
        label: "ارتباط جهت مشارکت",
        href: "/business/collaboration#participation-contact",
      },
    ],
  },
  {
    label: "خدمات ما",
    href: "/services/technology-guidance",
    children: [
      {
        label: "راهبری و هدایت فناور",
        href: "/services/technology-guidance",
      },
      {
        label: "خدمات مشاوره",
        href: "/services/consulting",
      },
      {
        label: "نقشه راه تجاری‌سازی",
        href: "/services/commercialization-roadmap",
      },
    ],
  },
  {
    label: "رویدادها",
    href: "/events",
    children: [
      {
        label: "رویدادها",
        href: "/events/all",
      },
      {
        label: "دوره‌های توانمندسازی",
        href: "/courses/all",
      },
    ],
  },
  {
    label: "اخبار",
    href: "/news",
  },
  {
    label: "مستندات",
    href: "/documents/forms",
    children: [
      {
        label: "فرم‌ها",
        href: "/documents/forms",
      },
      {
        label: "آیین‌نامه‌ها",
        href: "/documents/regulations",
      },
      {
        label: "قالب‌ها",
        href: "/documents/templates",
      },
    ],
  },
  {
    label: "تماس با ما",
    href: "/contact",
  },
];

const searchItems = [
  {
    label: "درباره ما",
    href: "/about",
  },
  {
    label: "ماموریت و چشم‌انداز",
    href: "/about#mission",
  },
  {
    label: "تاریخچه هاتف",
    href: "/about#history",
  },
  {
    label: "نمودار سازمانی",
    href: "/about#organization",
  },
  {
    label: "افراد و مدیران",
    href: "/about#people-managers",
  },
  {
    label: "سند راهبردی",
    href: "/about#strategic-document",
  },
  {
    label: "حمایت پژوهشی",
    href: "/#research-support",
  },
  {
    label: "فراخوان‌ها",
    href: "/research-support/calls",
  },
  {
    label: "محورهای سال جاری",
    href: "/research-support/current-fields",
  },
  {
    label: "راهنمای ثبت‌نام",
    href: "/research-support/guide-eligibility",
  },
  {
    label: "شرایط احراز",
    href: "/research-support/guide-eligibility#eligibility",
  },
  {
    label: "شیوه‌نامه تدوین پروپوزال",
    href: "/research-support/guide-eligibility#proposal-guideline",
  },
  {
    label: "نظام داوری",
    href: "/research-support/review-evaluation",
  },
  {
    label: "معیارهای ارزیابی",
    href: "/research-support/review-evaluation#evaluation-criteria",
  },
  {
    label: "همکاری‌های تجاری",
    href: "/#business",
  },
  {
    label: "فرصت‌های همکاری",
    href: "/business/opportunities",
  },
  {
    label: "دستاوردها و پروژه‌های موفق",
    href: "/business/successful-projects",
  },
  {
    label: "نحوه همکاری",
    href: "/business/collaboration",
  },
  {
    label: "مزایای همکاری",
    href: "/business/collaboration#benefits",
  },
  {
    label: "همکاران تجاری ما",
    href: "/business/collaboration#partners",
  },
  {
    label: "چارچوب‌های همکاری",
    href: "/business/collaboration#frameworks",
  },
  {
    label: "ارتباط جهت مشارکت",
    href: "/business/collaboration#participation-contact",
  },
  {
    label: "خدمات ما",
    href: "/services/technology-guidance",
  },
  {
    label: "راهبری و هدایت فناور",
    href: "/services/technology-guidance",
  },
  {
    label: "خدمات مشاوره",
    href: "/services/consulting",
  },
  {
    label: "نقشه راه تجاری‌سازی",
    href: "/services/commercialization-roadmap",
  },
  {
    label: "رویدادها",
    href: "/events",
  },
  {
    label: "دوره‌های توانمندسازی",
    href: "/courses/all",
  },
  {
    label: "اخبار",
    href: "/news",
  },
  {
    label: "دستاوردهای هاتف",
    href: "/#achievements",
  },
  {
    label: "مستندات",
    href: "/documents/forms",
  },
  {
    label: "تماس با ما",
    href: "/contact",
  },
];

function getRouteParts(href) {
  if (!href.startsWith("/")) {
    return null;
  }

  const [pathnamePart, hashPart = ""] = href.split("#");

  return {
    pathname: pathnamePart || "/",
    hash: hashPart ? `#${hashPart}` : "",
  };
}

function scrollToHashTarget(hash) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (!hash) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });

        return;
      }

      const sectionId = decodeURIComponent(hash.replace("#", ""));
      const targetElement = document.getElementById(sectionId);

      if (!targetElement) {
        return;
      }

      const targetTop =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        HEADER_SCROLL_OFFSET;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        left: 0,
        behavior: "smooth",
      });
    });
  });
}

function scrollIfSamePage(href) {
  const routeParts = getRouteParts(href);

  if (!routeParts) {
    return;
  }

  if (window.location.pathname !== routeParts.pathname) {
    return;
  }

  scrollToHashTarget(routeParts.hash);
}

function SmartLink({ href, className, children, onClick, ...restProps }) {
  const isRouterLink = href.startsWith("/");

  const handleClick = (event) => {
    scrollIfSamePage(href);

    onClick?.(event);

    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
  };

  if (isRouterLink) {
    return (
      <Link
        to={href}
        className={className}
        onClick={handleClick}
        {...restProps}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...restProps}>
      {children}
    </a>
  );
}

function NavigationItem({ item, nested = false, onNavigate }) {
  const hasChildren = Boolean(item.children?.length);

  return (
    <li
      className={
        nested ? "site-header__submenu-item" : "site-header__menu-item"
      }
    >
      <SmartLink
        href={item.href}
        onClick={onNavigate}
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
      </SmartLink>

      {hasChildren && (
        <ul className="site-header__submenu">
          {item.children.map((child) => (
            <NavigationItem
              key={child.label}
              item={child}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function getUserFullName(user = {}) {
  const fullName = String(user.fullName || user.name || "").trim();

  if (fullName) {
    return fullName;
  }

  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
}

function getUserAvatarLetter(user = {}) {
  const fullName = getUserFullName(user);

  return user.avatarLetter || user.firstName?.[0] || fullName?.[0] || "ک";
}

function AccountMenuLink({ currentUser, onNavigate }) {
  const dashboardPath = currentUser ? getCurrentUserDashboardPath() : "/auth";

  if (!currentUser) {
    return (
      <Button
        as={SmartLink}
        href="/auth"
        variant="inverse"
        size="sm"
        width="content"
        className="site-header__login"
        onClick={onNavigate}
      >
        ورود | ثبت‌نام
      </Button>
    );
  }

  const fullName = getUserFullName(currentUser) || "حساب کاربری";
  const avatarPreview = currentUser.avatarPreview || currentUser.avatar || "";

  return (
    <Button
      as={SmartLink}
      href={dashboardPath}
      variant="inverse"
      size="md"
      width="wide"
      className="site-header__login site-header__account"
      onClick={onNavigate}
      aria-label={`ورود به حساب کاربری ${fullName}`}
      title={fullName}
    >
      <span className="site-header__account-avatar">
        {avatarPreview ? (
          <img src={avatarPreview} alt="" />
        ) : (
          <span>{getUserAvatarLetter(currentUser)}</span>
        )}
      </span>

      <span className="site-header__account-name">{fullName}</span>
    </Button>
  );
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasMountedRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuLocked, setIsMenuLocked] = useState(false);

  useEffect(() => {
    const refreshCurrentUser = () => {
      setCurrentUser(getCurrentUser());
    };

    refreshCurrentUser();

    window.addEventListener("storage", refreshCurrentUser);
    window.addEventListener("focus", refreshCurrentUser);
    window.addEventListener("hatef-auth-change", refreshCurrentUser);

    return () => {
      window.removeEventListener("storage", refreshCurrentUser);
      window.removeEventListener("focus", refreshCurrentUser);
      window.removeEventListener("hatef-auth-change", refreshCurrentUser);
    };
  }, []);

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

  const closeNavigationMenu = () => {
    setIsMenuLocked(true);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const unlockNavigationMenu = () => {
    setIsMenuLocked(false);
  };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;

      if (location.hash) {
        scrollToHashTarget(location.hash);
      }

      return;
    }

    closeSearch();
    closeNavigationMenu();

    if (location.hash) {
      scrollToHashTarget(location.hash);
    }
  }, [location.pathname, location.hash]);

  const handleLogoClick = (event) => {
    event.preventDefault();

    closeSearch();
    closeNavigationMenu();

    navigate("/");

    scrollToHashTarget("");
  };

  const navigateToResult = (href) => {
    if (href.startsWith("/")) {
      navigate(href);

      const routeParts = getRouteParts(href);

      if (routeParts) {
        scrollToHashTarget(routeParts.hash);
      }

      return;
    }

    window.location.hash = href;
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length === 0) {
      return;
    }

    navigateToResult(searchResults[0].href);

    closeSearch();
    closeNavigationMenu();
  };

  const handleResultClick = () => {
    closeSearch();
    closeNavigationMenu();
  };

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link
            to="/"
            className="site-header__logo"
            aria-label="صفحه اصلی"
            onClick={handleLogoClick}
          >
            <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
          </Link>

          <nav
            className={`site-header__navigation ${
              isMenuLocked ? "site-header__navigation--locked" : ""
            }`}
            aria-label="منوی اصلی"
            onPointerEnter={unlockNavigationMenu}
            onPointerMove={unlockNavigationMenu}
            onMouseLeave={unlockNavigationMenu}
          >
            <ul className="site-header__menu">
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.label}
                  item={item}
                  onNavigate={closeNavigationMenu}
                />
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <IconButton
              className="site-header__search"
              variant="inverse"
              size="md"
              shape="rounded"
              type="button"
              aria-label="بازکردن جست‌وجو"
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((current) => !current)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 16l4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>

            <AccountMenuLink
              currentUser={currentUser}
              onNavigate={closeNavigationMenu}
            />
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

            <Button
              className="site-search__submit"
              type="submit"
              variant="primary"
              size="md"
              width="compact"
              disabled={!searchResults.length}
            >
              جست‌وجو
            </Button>

            <IconButton
              className="site-search__close"
              type="button"
              variant="ghost"
              size="md"
              shape="rounded"
              onClick={closeSearch}
              aria-label="بستن جست‌وجو"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </form>

          {normalizedQuery && (
            <div className="site-search__results">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <SmartLink
                    key={`${result.label}-${result.href}`}
                    href={result.href}
                    onClick={handleResultClick}
                    className="site-search__result"
                  >
                    <span className="site-search__result-dot" />

                    <span>{result.label}</span>
                  </SmartLink>
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
