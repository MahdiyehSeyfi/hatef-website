import "./Select.css";

function Select({ className = "", invalid = false, children, ...restProps }) {
  const classes = ["ui-select", invalid ? "ui-select--invalid" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <select
      className={classes}
      aria-invalid={invalid ? "true" : undefined}
      {...restProps}
    >
      {children}
    </select>
  );
}

export default Select;
