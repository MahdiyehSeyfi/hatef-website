import Textarea from "../../ui/Textarea/Textarea";
import "./DashboardFieldBlock.css";

function DashboardFieldBlock({ label, children, className = "", tone = "default", as: Component = "div" }) {
  return (
    <Component className={["dashboard-field-block", `dashboard-field-block--${tone}`, className].filter(Boolean).join(" ")}>
      {label ? <span className="dashboard-field-block__label">{label}</span> : null}
      <div className="dashboard-field-block__content">{children}</div>
    </Component>
  );
}

function DashboardReadOnlyField({ label, value, className = "", tone = "default" }) {
  return (
    <DashboardFieldBlock label={label} className={className} tone={tone}>
      <p>{value}</p>
    </DashboardFieldBlock>
  );
}

function DashboardTextareaField({ label, className = "", textareaProps = {} }) {
  return (
    <label className={["dashboard-textarea-field", className].filter(Boolean).join(" ")}>
      <span className="dashboard-field-block__label">{label}</span>
      <Textarea {...textareaProps} />
    </label>
  );
}

function DashboardAttachmentField({ label = "فایل ارسالی", fileName, emptyText = "هنوز فایلی بارگذاری نشده است", className = "", contentClassName = "", actions = null }) {
  return (
    <div className={["dashboard-attachment-field", className].filter(Boolean).join(" ")}>
      <div className={contentClassName}>
        <span className="dashboard-field-block__label">{label}</span>
        <strong>{fileName || emptyText}</strong>
      </div>
      {actions ? <div className="dashboard-attachment-field__actions">{actions}</div> : null}
    </div>
  );
}

export { DashboardAttachmentField, DashboardFieldBlock, DashboardReadOnlyField, DashboardTextareaField };
