import "./DashboardProfileTrigger.css";

function DashboardProfileTrigger({
  primary,
  secondary,
  avatarSrc = "",
  avatarAlt = "پروفایل کاربر",
  fallback = "ک",
  expanded = false,
  onClick,
  className = "",
}) {
  const classes = ["dashboard-profile-trigger", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-expanded={expanded}
    >
      <span className="dashboard-profile-trigger__text innovator-dashboard__profile-text">
        <strong>{primary}</strong>
        {secondary ? <small>{secondary}</small> : null}
      </span>

      {avatarSrc ? (
        <img
          className="dashboard-profile-trigger__avatar innovator-dashboard__top-avatar"
          src={avatarSrc}
          alt={avatarAlt}
        />
      ) : (
        <span className="dashboard-profile-trigger__avatar innovator-dashboard__top-avatar" aria-hidden="true">
          {fallback}
        </span>
      )}

      <span className="dashboard-profile-trigger__caret innovator-dashboard__profile-caret" aria-hidden="true">▾</span>
    </button>
  );
}

export default DashboardProfileTrigger;
