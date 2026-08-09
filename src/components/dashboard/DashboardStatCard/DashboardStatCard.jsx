import DashboardPanel from "../DashboardPanel/DashboardPanel";
import "./DashboardStatCard.css";

function DashboardStatCard({
  label,
  value,
  hint,
  icon = null,
  footer = null,
  tone = "default",
  className = "",
  ...restProps
}) {
  const classes = [
    "dashboard-stat-card",
    `dashboard-stat-card--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DashboardPanel as="article" padding="md" className={classes} {...restProps}>
      <div className="dashboard-stat-card__head">
        <div>
          <p className="dashboard-stat-card__label">{label}</p>
          <strong className="dashboard-stat-card__value">{value}</strong>
        </div>
        {icon ? <div className="dashboard-stat-card__icon">{icon}</div> : null}
      </div>

      {hint ? <p className="dashboard-stat-card__hint">{hint}</p> : null}
      {footer ? <div className="dashboard-stat-card__footer">{footer}</div> : null}
    </DashboardPanel>
  );
}

export default DashboardStatCard;
