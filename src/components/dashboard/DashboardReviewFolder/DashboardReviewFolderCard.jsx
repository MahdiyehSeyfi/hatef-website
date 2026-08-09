import "./DashboardReviewFolder.css";

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="dashboard-review-folder-card__svg"
    >
      <path
        d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h3.08c.6 0 1.17.24 1.6.66l1.16 1.16c.14.14.33.22.53.22H18A2.25 2.25 0 0 1 20.25 8.8v7.45A2.25 2.25 0 0 1 18 18.5H6a2.25 2.25 0 0 1-2.25-2.25v-9.5Z"
        fill="currentColor"
      />
      <path
        d="M4.1 9.1h15.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity=".38"
      />
    </svg>
  );
}

function DashboardReviewFolderCard({
  title,
  count = 0,
  tone = "brand",
  selected = false,
  className = "",
  ...restProps
}) {
  const classes = [
    "dashboard-review-folder-card",
    `dashboard-review-folder-card--${tone}`,
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
      aria-current={selected ? "true" : undefined}
      {...restProps}
    >
      <span className="dashboard-review-folder-card__icon">
        <FolderIcon />
      </span>
      <span className="dashboard-review-folder-card__content">
        <strong>{title}</strong>
        <span className="dashboard-review-folder-card__count">{count} طرح</span>
      </span>
    </button>
  );
}

export default DashboardReviewFolderCard;
