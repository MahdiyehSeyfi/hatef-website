import { useMemo, useState } from "react";

import { getCurrentUser } from "../../services/authService";
import { createContactRequest } from "../../services/contactRequestService";
import { addSupportTicket } from "../../services/supportService";

import contactIllustration from "../../assets/vectors/support.svg";

import Button from "../ui/Button/Button";
import FormField from "../ui/FormField/FormField";
import FormMessage from "../ui/FormMessage/FormMessage";
import Input from "../ui/Input/Input";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Textarea from "../ui/Textarea/Textarea";

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
        <SectionHeader title={title} />

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="نام و نام خانوادگی"
            htmlFor={`${id}-full-name`}
            required
          >
            <Input
              id={`${id}-full-name`}
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="نام و نام خانوادگی"
              value={formValues.fullName}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="ایمیل" htmlFor={`${id}-email`} required>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="شماره تماس" htmlFor={`${id}-phone`} required>
            <Input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="شماره تماس"
              value={formValues.phone}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="موضوع" htmlFor={`${id}-subject`} required>
            <Input
              id={`${id}-subject`}
              name="subject"
              type="text"
              placeholder="موضوع پیام"
              value={formValues.subject}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="متن پیام" htmlFor={`${id}-message`} required>
            <Textarea
              id={`${id}-message`}
              name="message"
              rows="8"
              placeholder="متن پیام"
              value={formValues.message}
              onChange={handleChange}
              required
            />
          </FormField>

          {submitStatus && (
            <FormMessage
              tone="success"
              className="contact-form__status"
              role="status"
            >
              {submitStatus}
            </FormMessage>
          )}

          {submitError && (
            <FormMessage
              tone="danger"
              className="contact-form__status"
              role="alert"
            >
              {submitError}
            </FormMessage>
          )}

          <div className="contact-form__actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              mobileFullWidth
              className="contact-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ارسال..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactFormSection;
