import { useState } from "react";
import {
  deleteAllNotificationsForCurrentUser,
  deleteNotification,
  getNotificationsForCurrentUser,
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsRead,
} from "../../../services/notificationService";
import Button from "../../ui/Button/Button";
import IconButton from "../../ui/IconButton/IconButton";
import DashboardEmptyState from "../DashboardEmptyState/DashboardEmptyState";
import DashboardPanel from "../DashboardPanel/DashboardPanel";
import DashboardStatusBadge from "../DashboardStatusBadge/DashboardStatusBadge";
import DashboardTabs from "../DashboardTabs/DashboardTabs";
import "./DashboardMessages.css";

function DashboardMessages({
  getMessages = getNotificationsForCurrentUser,
  markAllRead = markAllNotificationsAsReadForCurrentUser,
  deleteAll = deleteAllNotificationsForCurrentUser,
  markRead = markNotificationAsRead,
  deleteOne = deleteNotification,
  eyebrow = "پیام‌ها و اعلانات",
  title = "اعلان‌های سامانه",
  description =
    "اعلان‌های مربوط به درخواست‌ها، پاسخ‌ها، وظایف و فعالیت‌های جدید اینجا نمایش داده می‌شود.",
}) {
  const [messages, setMessages] = useState(() => getMessages());
  const [filter, setFilter] = useState("all");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const refreshMessages = () => {
    setMessages(getMessages());
  };

  const selectedMessage = messages.find(
    (message) => String(message.id) === String(selectedMessageId),
  );
  const unreadCount = messages.filter((message) => !message.isRead).length;
  const importantCount = messages.filter((message) => message.isImportant).length;

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.isRead;
    if (filter === "important") return message.isImportant;
    return true;
  });

  const handleMarkAllAsRead = () => {
    markAllRead();
    refreshMessages();
  };

  const handleDeleteAll = () => {
    if (!window.confirm("آیا از حذف همه پیام‌ها مطمئن هستید؟")) return;
    deleteAll();
    setSelectedMessageId(null);
    refreshMessages();
  };

  const openMessage = (messageId) => {
    markRead(messageId);
    setSelectedMessageId(messageId);
    refreshMessages();
  };

  const removeMessage = (messageId) => {
    deleteOne(messageId);
    if (String(selectedMessageId) === String(messageId)) {
      setSelectedMessageId(null);
    }
    refreshMessages();
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <DashboardPanel as="div" className="messages-panel__panel" padding="md">
          <div className="messages-panel__panel-header">
            <div>
              <span>جزئیات پیام</span>
              <h3>{selectedMessage.title}</h3>
              <p>
                {selectedMessage.category} / {selectedMessage.sentAt}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              width="content"
              onClick={() => {
                setSelectedMessageId(null);
                refreshMessages();
              }}
            >
              بازگشت
            </Button>
          </div>
          <DashboardPanel
            as="article"
            className="messages-panel__detail-card"
            variant="subtle"
            padding="md"
          >
            {selectedMessage.isImportant && (
              <DashboardStatusBadge tone="warning" status="مهم" />
            )}
            <p>{selectedMessage.body}</p>
          </DashboardPanel>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="messages-panel">
      <DashboardPanel as="div" className="messages-panel__panel" padding="md">
        <div className="messages-panel__panel-header">
          <div>
            <span>{eyebrow}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <div className="messages-panel__header-actions">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              width="content"
              onClick={handleMarkAllAsRead}
            >
              خواندن همه
            </Button>
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              onClick={handleDeleteAll}
              disabled={messages.length === 0}
              aria-label="حذف همه پیام‌ها"
            >
              ×
            </IconButton>
          </div>
        </div>

        <DashboardTabs
          className="messages-panel__filters"
          ariaLabel="فیلتر پیام‌ها"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "همه پیام‌ها", count: messages.length },
            { value: "unread", label: "خوانده‌نشده", count: unreadCount },
            { value: "important", label: "مهم", count: importantCount },
          ]}
        />

        <div className="messages-panel__list">
          {filteredMessages.map((message) => (
            <DashboardPanel
              as="article"
              padding="sm"
              interactive
              className={`messages-panel__card ${
                message.isRead ? "messages-panel__card--read" : ""
              }`}
              key={message.id}
            >
              <div className="messages-panel__card-main">
                <div className="messages-panel__title-row">
                  <h4>{message.title}</h4>
                  {!message.isRead && <DashboardStatusBadge status="جدید" />}
                  {message.isImportant && (
                    <DashboardStatusBadge tone="warning" status="مهم" />
                  )}
                </div>
                <p>{message.body}</p>
                <div className="messages-panel__meta">
                  <span>{message.category}</span>
                  <span>{message.sentAt}</span>
                </div>
              </div>
              <div className="messages-panel__card-actions messages-panel__actions">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  width="content"
                  onClick={() => openMessage(message.id)}
                >
                  مشاهده
                </Button>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => removeMessage(message.id)}
                  aria-label="حذف پیام"
                >
                  ×
                </IconButton>
              </div>
            </DashboardPanel>
          ))}
          {filteredMessages.length === 0 && (
            <DashboardEmptyState
              title="پیامی برای نمایش وجود ندارد"
              description="اعلان‌ها و پیام‌های جدید سامانه در این بخش نمایش داده می‌شوند."
            />
          )}
        </div>
      </DashboardPanel>
    </section>
  );
}

export default DashboardMessages;
