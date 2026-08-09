import Button from "../ui/Button/Button";

import "./ViewAllButton.css";

function ViewAllButton({
  to = "",
  href = "",
  children = "مشاهده همه",
  showArrow = true,
  className = "",
  ...restProps
}) {
  const classes = ["view-all-button", className].filter(Boolean).join(" ");

  return (
    <Button
      to={to}
      href={href}
      variant="outline"
      size="sm"
      width="compact"
      className={classes}
      trailingIcon={showArrow ? "←" : null}
      {...restProps}
    >
      {children}
    </Button>
  );
}

export default ViewAllButton;
