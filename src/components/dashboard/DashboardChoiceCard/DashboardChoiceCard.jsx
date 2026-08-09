import "./DashboardChoiceCard.css";

function DashboardChoiceCard({
  selected = false,
  eyebrow,
  title,
  description,
  meta,
  className = "",
  ...restProps
}) {
  const classes = [
    "dashboard-choice-card",
    selected ? "is-selected" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={selected}
      {...restProps}
    >
      {eyebrow ? <span className="dashboard-choice-card__eyebrow">{eyebrow}</span> : null}
      <strong className="dashboard-choice-card__title">{title}</strong>
      {description ? <p className="dashboard-choice-card__description">{description}</p> : null}
      {meta ? <span className="dashboard-choice-card__meta">{meta}</span> : null}
    </button>
  );
}

export default DashboardChoiceCard;
