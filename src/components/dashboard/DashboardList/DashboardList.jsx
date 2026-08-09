import DashboardPanel from "../DashboardPanel/DashboardPanel";
import "./DashboardList.css";

/**
 * Canonical dashboard list family.
 *
 * The first approved visual reference is Innovator > فراخوان‌ها > طرح‌های من.
 * Domain pages own their data/content, while this family owns row geometry,
 * surface, hover language and action alignment.
 */
export function DashboardList({
  as: Component = "div",
  className = "",
  children,
  ...restProps
}) {
  return (
    <Component
      className={["dashboard-list", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </Component>
  );
}

export function DashboardListItem({
  as = "article",
  className = "",
  interactive = true,
  children,
  ...restProps
}) {
  return (
    <DashboardPanel
      as={as}
      interactive={interactive}
      padding="sm"
      className={["dashboard-list__item", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </DashboardPanel>
  );
}

export function DashboardListIndex({ children, className = "", ...restProps }) {
  return (
    <span
      className={["dashboard-list__index", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </span>
  );
}

export function DashboardListMain({ children, className = "", ...restProps }) {
  return (
    <div
      className={["dashboard-list__main", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </div>
  );
}

export function DashboardListActions({ children, className = "", ...restProps }) {
  return (
    <div
      className={["dashboard-list__actions", className].filter(Boolean).join(" ")}
      {...restProps}
    >
      {children}
    </div>
  );
}

export default DashboardList;
