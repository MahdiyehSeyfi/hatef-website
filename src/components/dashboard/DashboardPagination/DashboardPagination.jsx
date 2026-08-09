import Button from "../../ui/Button/Button";
import "./DashboardPagination.css";

function DashboardPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  summary = null,
  className = "",
}) {
  const classes = ["dashboard-pagination", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {summary ? <span className="dashboard-pagination__summary">{summary}</span> : <span />}

      <div className="dashboard-pagination__controls">
        <Button
          type="button"
          variant="outline"
          size="sm"
          width="content"
          disabled={currentPage <= 1}
          onClick={onPrevious}
        >
          قبلی
        </Button>

        <strong className="dashboard-pagination__status">
          صفحه {currentPage} از {totalPages}
        </strong>

        <Button
          type="button"
          variant="outline"
          size="sm"
          width="content"
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}

export default DashboardPagination;
