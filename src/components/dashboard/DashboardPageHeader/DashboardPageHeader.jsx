import "./DashboardPageHeader.css";

function DashboardPageHeader({ eyebrow, title, description, action = null, className = "" }) {
  const classes = ["dashboard-page-header", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className="dashboard-page-header__copy">
        {eyebrow ? <span className="dashboard-page-header__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="dashboard-page-header__action">{action}</div> : null}
    </header>
  );
}

export default DashboardPageHeader;
