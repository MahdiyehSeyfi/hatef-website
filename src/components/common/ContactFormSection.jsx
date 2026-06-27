import { useMemo, useState } from "react";

import { getCurrentUser } from "../../services/authService";
import { createContactRequest } from "../../services/contactRequestService";
import { addSupportTicket } from "../../services/supportService";

import contactIllustration from "../../assets/vectors/support.svg";

import "./ContactFormSection.css";

function getCurrentPageTitle(fallback = "فرم تماس سایت") {
  if (typeof document === "undefined") {
    return fallback;
  }

  const heading = document.querySelector("h1");
  const headingText = heading?.textContent?.trim();

  if (headingText) {
    return headingText;
  }

  return document.title || fallback;
}

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "کاربر سامانه"
  );
}

function buildLoggedInTicketMessage({ formValues, sourceTitle, relatedTitle }) {
  return [
    "این درخواست از فرم تماس سایت ثبت شده است.",
    sourceTitle ? `بخش ارسال‌کننده فرم: ${sourceTitle}` : "",
    relatedTitle ? `مورد مرتبط: ${relatedTitle}` : "",
    formValues.fullName ? `نام واردشده در فرم: ${formValues.fullName}` : "",
    formValues.email ? `ایمیل واردشده در فرم: ${formValues.email}` : "",
    formValues.phone ? `شماره تماس واردشده در فرم: ${formValues.phone}` : "",
    formValues.subject ? `موضوع فرم: ${formValues.subject}` : "",
    "",
    "متن پیام:",
    formValues.message || "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function ContactFormSection({
  id = "service-request-form",
  title = "فرم تماس",
  submitLabel = "ارسال",
  statusMessage = "درخواست شما ثبت شد و برای بررسی به دبیرخانه ارسال شد.",
  sourceType = "contact",
  sourceTitle = "",
  relatedId = "",
  relatedTitle = "",
  illustration = contactIllustration,
  showIllustration = true,
  className = "",
}) {
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedSourceTitle = useMemo(
    () => sourceTitle || getCurrentPageTitle(title),
    [sourceTitle, title],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormValues({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");
    setSubmitError("");

    try {
      const currentUser = getCurrentUser?.();

      if (currentUser?.id) {
        addSupportTicket(
          {
            title: formValues.subject || `درخواست از ${resolvedSourceTitle}`,
            message: buildLoggedInTicketMessage({
              formValues,
              sourceTitle: resolvedSourceTitle,
              relatedTitle,
            }),
            userId: currentUser.id,
            userName: getUserDisplayName(currentUser),
            userRole: currentUser.role,
            userLevel: currentUser.role,
            sourceType: "site-contact-form",
            sourceTitle: resolvedSourceTitle,
            relatedId,
            relatedTitle,
          },
          currentUser.role,
        );

        setSubmitStatus(
          "درخواست شما ثبت شد و از داخل داشبوردتان قابل پیگیری است.",
        );
        resetForm();
        return;
      }

      const request = createContactRequest({
        ...formValues,
        sourceType,
        sourceTitle: resolvedSourceTitle,
        relatedId,
        relatedTitle,
      });

      setSubmitStatus(`${statusMessage} کد پیگیری: ${request.requestNumber}`);
      resetForm();
    } catch (error) {
      setSubmitError(
        error?.message || "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`contact-page__form-section ${className}`.trim()}
      id={id}
    >
      {showIllustration && illustration && (
        <div className="contact-page__illustration">
          <img src={illustration} alt="تصویر پشتیبانی و پاسخ‌گویی" />
        </div>
      )}

      <div className="contact-form-wrapper">
        <div className="contact-page__section-heading">
          <h2>{title}</h2>
          <span />
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-form__field">
            <input
              id={`${id}-full-name`}
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="نام و نام خانوادگی"
              aria-label="نام و نام خانوادگی"
              value={formValues.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ایمیل"
              aria-label="ایمیل"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="شماره تماس"
              aria-label="شماره تماس"
              value={formValues.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              id={`${id}-subject`}
              name="subject"
              type="text"
              placeholder="موضوع"
              aria-label="موضوع"
              value={formValues.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-form__field contact-form__field--message">
            <textarea
              id={`${id}-message`}
              name="message"
              rows="8"
              placeholder="متن پیام"
              aria-label="متن پیام"
              value={formValues.message}
              onChange={handleChange}
              required
            />
          </div>

          {submitStatus && (
            <p className="contact-form__status" role="status">
              {submitStatus}
            </p>
          )}

          {submitError && (
            <p
              className="contact-form__status contact-form__status--error"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="contact-form__actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ارسال..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactFormSection;
