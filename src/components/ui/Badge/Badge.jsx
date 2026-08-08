import "./Badge.css";

function Badge({
  children,
  tone = "neutral",
  size = "sm",
  className = "",
  ...restProps
}) {
  const classes = [
    "ui-badge",
    `ui-badge--${tone}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...restProps}>
      {children}
    </span>
  );
}

export default Badge;
