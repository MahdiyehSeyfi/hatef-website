import "./Card.css";

function Card({
  as: Component = "article",
  children,
  interactive = false,
  padding = "none",
  className = "",
  ...restProps
}) {
  const classes = [
    "ui-card",
    interactive ? "ui-card--interactive" : "",
    `ui-card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...restProps}>
      {children}
    </Component>
  );
}

export default Card;
