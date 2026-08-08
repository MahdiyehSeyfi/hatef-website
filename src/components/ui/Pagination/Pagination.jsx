import "./Pagination.css";

function Pagination({
  currentPage,
  pageCount,
  onPageChange,
  previousLabel = "صفحه قبل",
  nextLabel = "صفحه بعد",
  className = "",
}) {
  if (pageCount <= 1) {
    return null;
  }

  const classes = ["ui-pagination", className].filter(Boolean).join(" ");

  const changePage = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > pageCount ||
      pageNumber === currentPage
    ) {
      return;
    }

    onPageChange(pageNumber);
  };

  return (
    <nav className={classes} aria-label="صفحه‌بندی">
      <button
        type="button"
        className="ui-pagination__direction"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {previousLabel}
      </button>

      <div className="ui-pagination__pages">
        {Array.from({ length: pageCount }, (_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              className={`ui-pagination__page ${
                isActive ? "ui-pagination__page--active" : ""
              }`.trim()}
              onClick={() => changePage(pageNumber)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`صفحه ${pageNumber.toLocaleString("fa-IR")}`}
            >
              {pageNumber.toLocaleString("fa-IR")}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="ui-pagination__direction"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === pageCount}
      >
        {nextLabel}
      </button>
    </nav>
  );
}

export default Pagination;
