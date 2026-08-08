import "./Textarea.css";

function Textarea({ className = "", invalid = false, ...restProps }) {
  const classes = ["ui-textarea", invalid ? "ui-textarea--invalid" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      className={classes}
      aria-invalid={invalid ? "true" : undefined}
      {...restProps}
    />
  );
}

export default Textarea;
