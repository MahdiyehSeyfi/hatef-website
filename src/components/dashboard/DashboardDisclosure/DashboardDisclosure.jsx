import "./DashboardDisclosure.css";

function DashboardDisclosure({
  open = false,
  onToggle,
  eyebrow,
  title,
  children,
  className = "",
}) {
  const classes = [
    "dashboard-disclosure",
    open ? "is-open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <button
        type="button"
        className="dashboard-disclosure__trigger"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="dashboard-disclosure__copy">
          {eyebrow ? <span>{eyebrow}</span> : null}
          <strong>{title}</strong>
        </span>
        <span className="dashboard-disclosure__indicator" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="dashboard-disclosure__content">{children}</div> : null}
    </article>
  );
}

export default DashboardDisclosure;
