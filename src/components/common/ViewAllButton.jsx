import { Link } from "react-router";

import "./ViewAllButton.css";

function ViewAllButton({
  to = "",
  href = "",
  children = "مشاهده همه",
  showArrow = true,
}) {
  const content = (
    <>
      {children}
      {showArrow ? <span aria-hidden="true">←</span> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="view-all-button">
        {content}
      </Link>
    );
  }

  return (
    <a href={href || "#"} className="view-all-button">
      {content}
    </a>
  );
}

export default ViewAllButton;
