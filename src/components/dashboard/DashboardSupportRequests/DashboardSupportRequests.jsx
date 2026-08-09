import { useState } from "react";

import {
  addSupportTicket,
  deleteSupportTicket,
  getCurrentUserSupportTickets,
} from "../../../services/supportService";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Textarea from "../../ui/Textarea/Textarea";
import DashboardPanel from "../DashboardPanel/DashboardPanel";
import DashboardStatusBadge from "../DashboardStatusBadge/DashboardStatusBadge";
import "./DashboardSupportRequests.css";

function DashboardSupportRequests({ supportRoleName }) {
  const [requests, setRequests] = useState(() =>
    getCurrentUserSupportTickets(supportRoleName),
  );
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const refreshRequests = () => {
    setRequests(getCurrentUserSupportTickets(supportRoleName));
  };

  const selectedRequest = requests.find(
    (request) => String(request.id) === String(selectedRequestId),
  );

  const openNewRequest = () => {
    setMode("new");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
    refreshRequests();
  };

  const openList = () => {
    setMode("list");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
    refreshRequests();
  };

  const openRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setMode("view");
    refreshRequests();
  };

  const deleteRequest = (requestId) => {
    const targetRequest = requests.find(
      (request) => String(request.id) === String(requestId),
    );

    if (!targetRequest || targetRequest.seenBySupport) {
      return;
    }

    const confirmed = window.confirm("آیا از حذف این درخواست مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    deleteSupportTicket(requestId);
    refreshRequests();
  };

  const submitRequest = (event) => {
    event.preventDefault();

    if (!requestMessage.trim()) {
      return;
    }

    addSupportTicket(
      {
        title: requestTitle.trim() || "درخواست جدید",
        message: requestMessage.trim(),
      },
      supportRoleName,
    );

    openList();
  };

  if (mode === "new") {
    return (
      <section className="support-requests">
        <DashboardPanel as="div" className="support-requests__panel" padding="md">
          <div className="support-requests__panel-header">
            <div>
              <span>درخواست جدید</span>
              <h3>ثبت درخواست پشتیبانی</h3>
              <p>
                درخواست شما برای کمیته/دبیرخانه ثبت می‌شود و پاسخ آن در همین بخش
                و در پیام‌ها نمایش داده خواهد شد.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              width="content"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </Button>
          </div>

          <form className="support-requests__form" onSubmit={submitRequest}>
            <label>
              <span>عنوان درخواست</span>
              <Input
                type="text"
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                placeholder="مثلاً مشکل در بارگذاری فایل"
              />
            </label>

            <label>
              <span>متن درخواست</span>
              <Textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="متن درخواست خود را وارد کنید..."
              />
            </label>

            <div className="support-requests__form-actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                width="content"
                onClick={openList}
              >
                انصراف
              </Button>

              <Button type="submit" variant="primary" size="sm" width="content" disabled={!requestMessage.trim()}>
                ثبت درخواست
              </Button>
            </div>
          </form>
        </DashboardPanel>
      </section>
    );
  }

  if (mode === "view" && selectedRequest) {
    const hasReply = Boolean(
      selectedRequest.supportReply || selectedRequest.reply,
    );
    const canDelete = !selectedRequest.seenBySupport;

    return (
      <section className="support-requests">
        <DashboardPanel as="div" className="support-requests__panel" padding="md">
          <div className="support-requests__panel-header">
            <div>
              <span>جزئیات درخواست</span>
              <h3>{selectedRequest.title}</h3>
              <p>ارسال شده در {selectedRequest.sentAt}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              width="content"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </Button>
          </div>

          <div className="support-requests__detail-grid support-requests__detail-grid--compact">
            <div>
              <span>زمان ارسال</span>
              <strong>{selectedRequest.sentAt}</strong>
            </div>

            <div>
              <span>زمان پاسخ</span>
              <strong>
                {hasReply ? selectedRequest.repliedAt : "هنوز پاسخ ثبت نشده"}
              </strong>
            </div>
          </div>

          <div className="support-requests__conversation">
            <article className="support-requests__message support-requests__message--user">
              <span>پیام شما</span>
              <p>{selectedRequest.message}</p>
            </article>

            {hasReply ? (
              <article className="support-requests__message support-requests__message--support">
                <span>پاسخ کمیته/دبیرخانه</span>
                <p>{selectedRequest.supportReply || selectedRequest.reply}</p>
              </article>
            ) : (
              <article className="support-requests__empty-reply">
                هنوز پاسخی برای این درخواست ثبت نشده است.
              </article>
            )}
          </div>

          {canDelete && (
            <div className="support-requests__detail-actions">
              <Button
                type="button"
                variant="danger-soft"
                size="sm"
                width="content"
                onClick={() => {
                  deleteRequest(selectedRequest.id);
                  openList();
                }}
              >
                حذف درخواست
              </Button>
            </div>
          )}
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="support-requests">
      <DashboardPanel as="div" className="support-requests__panel" padding="md">
        <div className="support-requests__panel-header">
          <div>
            <span>درخواست‌ها</span>
            <h3>درخواست‌ها و پشتیبانی</h3>
            <p>
              درخواست‌های شما، وضعیت پیگیری و پاسخ‌های کمیته/دبیرخانه در این بخش
              نمایش داده می‌شود.
            </p>
          </div>

          <Button type="button" variant="secondary" size="sm" width="content" onClick={openNewRequest}>
            ثبت درخواست جدید
          </Button>
        </div>

        <div className="support-requests__list">
          {requests.map((request) => {
            const hasReply = Boolean(request.supportReply || request.reply);
            const canDelete = !request.seenBySupport;

            return (
              <DashboardPanel as="article" interactive className="support-requests__card" padding="sm" key={request.id}>
                <div className="support-requests__card-main">
                  <div className="support-requests__card-title">
                    <h4>{request.title}</h4>
                    {hasReply && (
                      <DashboardStatusBadge status="پاسخ داده شده">پاسخ دریافت شده</DashboardStatusBadge>
                    )}
                    {!hasReply && (
                      <DashboardStatusBadge status={request.status || "در انتظار پیگیری"} />
                    )}
                  </div>

                  <p>{request.message}</p>

                  <div className="support-requests__meta">
                    <span>ارسال: {request.sentAt}</span>
                    <span>
                      پاسخ: {hasReply ? request.repliedAt : "در انتظار پاسخ"}
                    </span>
                  </div>
                </div>

                <div className="support-requests__actions">
                  <Button type="button" variant="outline" size="sm" width="content" onClick={() => openRequest(request.id)}>
                    مشاهده
                  </Button>

                  {canDelete && (
                    <Button
                      type="button"
                      variant="danger-soft"
                      size="sm"
                      width="content"
                      onClick={() => deleteRequest(request.id)}
                    >
                      حذف
                    </Button>
                  )}
                </div>
              </DashboardPanel>
            );
          })}

          {requests.length === 0 && (
            <div className="support-requests__empty-reply">
              هنوز درخواستی ثبت نشده است.
            </div>
          )}
        </div>
      </DashboardPanel>
    </section>
  );
}

export default DashboardSupportRequests;
