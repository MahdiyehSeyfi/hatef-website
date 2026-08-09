import Badge from "../../ui/Badge/Badge";
import "./DashboardReviewFolder.css";

function DashboardReviewFolderBadge({
  label,
  tone = "brand",
  onRemove,
  removeLabel,
  className = "",
}) {
  return (
    <Badge
      tone={tone}
      size="sm"
      className={["dashboard-review-folder-badge", className].filter(Boolean).join(" ")}
    >
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          className="dashboard-review-folder-badge__remove"
          onClick={onRemove}
          aria-label={removeLabel || `حذف از پوشه ${label}`}
        >
          ×
        </button>
      ) : null}
    </Badge>
  );
}

export default DashboardReviewFolderBadge;
