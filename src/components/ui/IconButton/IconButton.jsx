import { Link } from "react-router";

import "./IconButton.css";

function IconButton({
  as: Component = null,
  to = "",
  href = "",
  children,
  variant = "outline",
  size = "md",
  shape = "circle",
  className = "",
  type = "button",
  ...restProps
}) {
  const classes = [
    "ui-icon-button",
    `ui-icon-button--${variant}`,
    `ui-icon-button--${size}`,
    `ui-icon-button--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (Component) {
    const componentProps = {
      ...restProps,
      ...(to ? { to } : {}),
      ...(href ? { href } : {}),
    };

    return (
      <Component className={classes} {...componentProps}>
        {children}
      </Component>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...restProps}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...restProps}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...restProps}>
      {children}
    </button>
  );
}

export default IconButton;
