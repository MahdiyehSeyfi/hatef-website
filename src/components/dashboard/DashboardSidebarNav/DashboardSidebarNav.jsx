import "./DashboardSidebarNav.css";

function DashboardSidebarNav({
  items,
  activeSection,
  activeSubItem,
  openMenuId,
  collapsed = false,
  onItemClick,
  onSubItemClick,
  className = "",
}) {
  const classes = ["dashboard-sidebar-nav", className].filter(Boolean).join(" ");

  return (
    <nav className={classes} aria-label="ناوبری داشبورد">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        const hasSubItems = Boolean(item.subItems?.length);
        const isOpen = openMenuId === item.id;

        return (
          <div className="dashboard-sidebar-nav__group innovator-dashboard__nav-group" key={item.id}>
            <button
              type="button"
              className={`dashboard-sidebar-nav__item innovator-dashboard__nav-item ${isActive ? "is-active innovator-dashboard__nav-item--active" : ""}`}
              onClick={() => onItemClick(item)}
              title={collapsed ? item.label : undefined}
              aria-expanded={hasSubItems ? isOpen : undefined}
            >
              <span className="dashboard-sidebar-nav__icon innovator-dashboard__nav-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span className="dashboard-sidebar-nav__text innovator-dashboard__nav-text">{item.label}</span>

              {hasSubItems && !collapsed ? (
                <span
                  className={`dashboard-sidebar-nav__chevron innovator-dashboard__nav-chevron ${isOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                >
                  <svg className={isOpen ? "innovator-dashboard__nav-chevron--open" : ""} viewBox="0 0 24 24">
                    <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </button>

            {hasSubItems && !collapsed ? (
              <div className={`dashboard-sidebar-nav__subnav innovator-dashboard__subnav ${isOpen ? "is-open innovator-dashboard__subnav--open" : ""}`}>
                {item.subItems.map((subItem) => (
                  <button
                    type="button"
                    key={subItem.id}
                    className={`dashboard-sidebar-nav__subitem innovator-dashboard__subnav-item ${activeSubItem === subItem.id ? "is-active innovator-dashboard__subnav-item--active" : ""}`}
                    onClick={() => onSubItemClick(item.id, subItem.id)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export default DashboardSidebarNav;
