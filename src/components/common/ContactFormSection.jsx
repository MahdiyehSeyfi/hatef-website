import { useState } from "react";

import contactIllustration from "../../assets/vectors/support.svg";

import "../../pages/contact/ContactPage.css";

function SectionHeading({ children }) {
  return (
    <div className="contact-page__section-heading">
      <h2>{children}</h2>
      <span />
    </div>
  );
}

function ContactFormSection({
  title = "فرم تماس",
  submitLabel = "ارسال",
  statusMessage = "درخواست شما در نسخه نمایشی ثبت شد. ارسال واقعی پس از اتصال به سرور فعال می‌شود.",
}) {
  const [submitStatus, setSubmitStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSubmitStatus(statusMessage);

    form.reset();
  };

  return (
    <section className="contact-page__form-section" id="service-request-form">
      <div className="contact-page__illustration">
        <img src={contactIllustration} alt="تصویر پشتیبانی و پاسخ‌گویی" />
      </div>

      <div className="contact-form-wrapper">
        <SectionHeading>{title}</SectionHeading>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-form__field">
            <input
              id="service-full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="نام و نام خانوادگی"
              aria-label="نام و نام خانوادگی"
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              id="service-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ایمیل"
              aria-label="ایمیل"
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              id="service-subject"
              name="subject"
              type="text"
              placeholder="موضوع"
              aria-label="موضوع"
              required
            />
          </div>

          <div className="contact-form__field contact-form__field--message">
            <textarea
              id="service-message"
              name="message"
              rows="8"
              placeholder="متن پیام"
              aria-label="متن پیام"
              required
            />
          </div>

          {submitStatus && (
            <p className="contact-form__status" role="status">
              {submitStatus}
            </p>
          )}

          <div className="contact-form__actions">
            <button type="submit">{submitLabel}</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactFormSection;
