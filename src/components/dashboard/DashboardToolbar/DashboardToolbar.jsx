import "./DashboardToolbar.css";

function DashboardToolbar({ children, className = "", compact = false, ...restProps }) {
  const classes = [
    "dashboard-toolbar",
    compact ? "dashboard-toolbar--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...restProps}>
      {children}
    </div>
  );
}

export default DashboardToolbar;
