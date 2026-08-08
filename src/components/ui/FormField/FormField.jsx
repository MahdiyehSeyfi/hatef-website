import "./FormField.css";

function FormField({
  label = "",
  htmlFor = "",
  helperText = "",
  error = "",
  required = false,
  children,
  className = "",
}) {
  const classes = ["ui-form-field", error ? "ui-form-field--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label ? (
        <label className="ui-form-field__label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="ui-form-field__required" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p className="ui-form-field__message ui-form-field__message--error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="ui-form-field__message">{helperText}</p>
      ) : null}
    </div>
  );
}

export default FormField;
