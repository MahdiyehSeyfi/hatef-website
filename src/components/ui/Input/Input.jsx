import "./Input.css";

function Input({ className = "", invalid = false, ...restProps }) {
  const classes = ["ui-input", invalid ? "ui-input--invalid" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      className={classes}
      aria-invalid={invalid ? "true" : undefined}
      {...restProps}
    />
  );
}

export default Input;
