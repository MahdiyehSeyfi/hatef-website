import "./DashboardEmptyState.css";

function DashboardEmptyState({ icon = null, title, description, action = null, className = "" }) {
  const classes = ["dashboard-empty-state", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="status">
      {icon ? <div className="dashboard-empty-state__icon">{icon}</div> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? <div className="dashboard-empty-state__action">{action}</div> : null}
    </div>
  );
}

export default DashboardEmptyState;
