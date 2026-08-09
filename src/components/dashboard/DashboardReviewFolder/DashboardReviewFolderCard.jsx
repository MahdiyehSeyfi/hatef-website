import "./DashboardReviewFolder.css";

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
      {...restProps}
    >
      <strong>{title}</strong>
      <span>{count} طرح</span>
    </button>
  );
}

export default DashboardReviewFolderCard;
