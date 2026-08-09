import "./DashboardFilterBar.css";

/**
 * Canonical layout wrapper for dashboard search/filter controls.
 * Input, Select and DashboardTabs continue to own their own visuals.
 */
function DashboardFilterBar({
  as: Component = "div",
  className = "",
  children,
  ...restProps
}) {
  return (
    <Component
      className={["dashboard-filter-bar", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </Component>
  );
}

export default DashboardFilterBar;
