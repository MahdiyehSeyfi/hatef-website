import "./DashboardNotificationTrigger.css";

function DashboardNotificationTrigger({
  children,
  unreadCount = 0,
  expanded = false,
  onClick,
  ariaLabel = "نمایش پیام‌های اخیر",
}) {
  return (
    <button
      type="button"
      className="innovator-dashboard__notification-trigger dashboard-notification-trigger"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={expanded}
    >
      {children}
      {unreadCount > 0 && (
        <span className="dashboard-notification-trigger__badge" aria-hidden="true">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default DashboardNotificationTrigger;
