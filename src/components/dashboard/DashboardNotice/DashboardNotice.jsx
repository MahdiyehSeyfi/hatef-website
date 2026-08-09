import "./DashboardNotice.css";

function DashboardNotice({ tone = "info", title, children, action = null, className = "", ...restProps }) {
  const classes = [
    "dashboard-notice",
    `dashboard-notice--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={tone === "danger" ? "alert" : "status"} {...restProps}>
      <div className="dashboard-notice__content">
        {title ? <strong>{title}</strong> : null}
        {children ? <div className="dashboard-notice__body">{children}</div> : null}
      </div>
      {action ? <div className="dashboard-notice__action">{action}</div> : null}
    </div>
  );
}

export default DashboardNotice;
