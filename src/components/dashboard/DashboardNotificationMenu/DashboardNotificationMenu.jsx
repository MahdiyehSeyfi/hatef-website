import { useEffect, useRef } from "react";

import DashboardNotificationTrigger from "../DashboardNotificationTrigger/DashboardNotificationTrigger";
import "./DashboardNotificationMenu.css";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21h4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function DashboardNotificationMenu({
  open,
  onOpenChange,
  unreadCount = 0,
  messages = [],
  onOpenMessages,
  onMarkAllRead,
  onMarkRead,
  onOpenMessage,
  onBeforeOpen,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open, onOpenChange]);

  return (
    <div className="innovator-dashboard__notification-menu dashboard-notification-menu" ref={menuRef}>
      <DashboardNotificationTrigger
        unreadCount={unreadCount}
        expanded={open}
        onClick={() => {
          onBeforeOpen?.();
          onOpenChange?.(!open);
        }}
      >
        <BellIcon />
      </DashboardNotificationTrigger>

      {open && (
        <div className="innovator-dashboard__notification-dropdown dashboard-notification-menu__dropdown">
          <div className="innovator-dashboard__notification-header dashboard-notification-menu__header">
            <strong>پیام‌های اخیر</strong>

            <div className="dashboard-notification-menu__actions">
              <button
                type="button"
                className="dashboard-notification-menu__icon-action"
                onClick={onOpenMessages}
                aria-label="رفتن به پیام‌ها و اعلانات"
                title="رفتن به پیام‌ها و اعلانات"
              >
                📨
              </button>
              <button
                type="button"
                className="dashboard-notification-menu__read-all"
                onClick={onMarkAllRead}
                disabled={unreadCount === 0}
              >
                خواندن همه
              </button>
            </div>

            <small>{unreadCount} خوانده‌نشده</small>
          </div>

          <div className="innovator-dashboard__notification-list dashboard-notification-menu__list">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`innovator-dashboard__notification-item dashboard-notification-menu__item ${message.isRead ? "innovator-dashboard__notification-item--read dashboard-notification-menu__item--read" : ""}`}
                onClick={() => onOpenMessage?.(message)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onOpenMessage?.(message);
                }}
              >
                <div>
                  <h4>{message.title}</h4>
                  <p>{message.sentAt}</p>
                </div>

                <button
                  type="button"
                  className="dashboard-notification-menu__read-item"
                  onClick={(event) => onMarkRead?.(message.id, event)}
                  disabled={message.isRead}
                >
                  {message.isRead ? "خوانده شد" : "خواندن"}
                </button>
              </article>
            ))}

            {messages.length === 0 && (
              <article className="innovator-dashboard__notification-item dashboard-notification-menu__item">
                <div>
                  <h4>اعلان جدیدی ندارید</h4>
                  <p>همه چیز خوانده شده است.</p>
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNotificationMenu;
