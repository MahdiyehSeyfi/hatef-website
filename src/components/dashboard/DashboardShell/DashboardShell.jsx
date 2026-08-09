import { Link } from "react-router";

import DashboardDateTime from "../DashboardDateTime/DashboardDateTime";
import DashboardSidebarNav from "../DashboardSidebarNav/DashboardSidebarNav";
import "./DashboardShell.css";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function DashboardShell({
  collapsed = false,
  onToggleSidebar,
  logoSrc,
  logoAlt = "لوگوی دانشگاه تهران",
  brandTitle = "هاتف",
  brandTo = "/",
  navItems = [],
  activeSection,
  activeSubItem,
  openMenuId,
  onNavClick,
  onSubNavClick,
  title,
  topbarActions,
  children,
  className = "",
}) {
  const classes = [
    "innovator-dashboard",
    collapsed ? "innovator-dashboard--collapsed" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <main className={classes}>
      <aside className="innovator-dashboard__sidebar">
        <div className="innovator-dashboard__sidebar-top">
          <div className="innovator-dashboard__sidebar-head">
            <button
              type="button"
              className="innovator-dashboard__menu-button dashboard-shell__menu-button"
              onClick={onToggleSidebar}
              aria-label="باز و بسته کردن منوی داشبورد"
            >
              <MenuIcon />
            </button>

            <Link to={brandTo} className="innovator-dashboard__brand">
              <img src={logoSrc} alt={logoAlt} />
              <div className="innovator-dashboard__brand-text">
                <strong>{brandTitle}</strong>
              </div>
            </Link>
          </div>

          <DashboardSidebarNav
            items={navItems}
            activeSection={activeSection}
            activeSubItem={activeSubItem}
            openMenuId={openMenuId}
            collapsed={collapsed}
            onItemClick={onNavClick}
            onSubItemClick={onSubNavClick}
            className="innovator-dashboard__nav"
          />
        </div>
      </aside>

      <section className="innovator-dashboard__main">
        <header className="innovator-dashboard__topbar">
          <div className="innovator-dashboard__topbar-title">
            <DashboardDateTime />
            <h1>{title}</h1>
          </div>

          <div className="innovator-dashboard__topbar-actions">
            {topbarActions}
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}

export default DashboardShell;
