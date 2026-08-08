import Button from "../ui/Button/Button";

import "./ViewAllButton.css";

function ViewAllButton({
  to = "",
  href = "",
  children = "مشاهده همه",
  showArrow = true,
}) {
  return (
    <Button
      to={to}
      href={href || (to ? "" : "#")}
      variant="outline"
      size="sm"
      width="compact"
      className="view-all-button"
      trailingIcon={showArrow ? "←" : null}
    >
      {children}
    </Button>
  );
}

export default ViewAllButton;
