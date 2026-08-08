import "./Checkbox.css";

function Checkbox({
  label,
  className = "",
  inputClassName = "",
  ...restProps
}) {
  const classes = ["ui-checkbox", className].filter(Boolean).join(" ");
  const inputClasses = ["ui-checkbox__input", inputClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input type="checkbox" className={inputClasses} {...restProps} />
      <span className="ui-checkbox__control" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path
            d="M3.2 8.2 6.4 11.2 12.8 4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="ui-checkbox__label">{label}</span>
    </label>
  );
}

export default Checkbox;
