import { Link } from "react-router";

import "./Button.css";

function Button({
  as: Component = null,
  to = "",
  href = "",
  children,
  variant = "primary",
  size = "md",
  width = "",
  fullWidth = false,
  mobileFullWidth = false,
  leadingIcon = null,
  trailingIcon = null,
  className = "",
  type = "button",
  ...restProps
}) {
  const defaultWidthBySize = {
    sm: "compact",
    md: "standard",
    lg: "wide",
  };

  const resolvedWidth =
    variant === "link"
      ? "content"
      : fullWidth
        ? "full"
        : width || defaultWidthBySize[size] || "standard";

  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    `ui-button--width-${resolvedWidth}`,
    fullWidth ? "ui-button--full-width" : "",
    mobileFullWidth ? "ui-button--mobile-full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {leadingIcon ? (
        <span className="ui-button__icon ui-button__icon--leading" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}

      <span className="ui-button__label">{children}</span>

      {trailingIcon ? (
        <span className="ui-button__icon ui-button__icon--trailing" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (Component) {
    const componentProps = {
      ...restProps,
      ...(to ? { to } : {}),
      ...(href ? { href } : {}),
    };

    return (
      <Component className={classes} {...componentProps}>
        {content}
      </Component>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...restProps}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...restProps}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...restProps}>
      {content}
    </button>
  );
}

export default Button;
