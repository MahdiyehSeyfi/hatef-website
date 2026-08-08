import "./FormMessage.css";

function FormMessage({
  children,
  tone = "neutral",
  className = "",
  role,
  ...restProps
}) {
  const classes = [
    "ui-form-message",
    `ui-form-message--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p
      className={classes}
      role={role ?? (tone === "danger" ? "alert" : undefined)}
      {...restProps}
    >
      {children}
    </p>
  );
}

export default FormMessage;
