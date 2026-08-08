import "./SectionHeader.css";

function SectionHeader({
  title,
  as: Heading = "h2",
  eyebrow = "",
  description = "",
  action = null,
  variant = "section",
  tone = "brand",
  className = "",
}) {
  const classes = [
    "ui-section-header",
    `ui-section-header--${variant}`,
    `ui-section-header--${tone}`,
    action ? "ui-section-header--with-action" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="ui-section-header__content">
        {eyebrow ? (
          <span className="ui-section-header__eyebrow">{eyebrow}</span>
        ) : null}

        <div className="ui-section-header__title-row">
          <span className="ui-section-header__marker" aria-hidden="true" />
          <Heading className="ui-section-header__title">{title}</Heading>
        </div>

        {description ? (
          <p className="ui-section-header__description">{description}</p>
        ) : null}
      </div>

      <span className="ui-section-header__line" aria-hidden="true" />

      {action ? <div className="ui-section-header__action">{action}</div> : null}
    </div>
  );
}

export default SectionHeader;
