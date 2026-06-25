import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import loginImage from "../../assets/images/login/login.png";

import "./AuthPage.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("login");
  const [forgotStep, setForgotStep] = useState("identify");
  const [selectedUserType, setSelectedUserType] = useState("innovator");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const isLogin = activeView === "login";
  const isRegister = activeView === "register";
  const isForgot = activeView === "forgot";

  useEffect(() => {
    document.body.classList.add("auth-page-is-open");

    return () => {
      document.body.classList.remove("auth-page-is-open");
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isRegister) {
      navigate(
        selectedUserType === "business"
          ? "/dashboard/business-collaboration"
          : "/dashboard/innovator",
      );
      return;
    }

    if (isLogin) {
      const normalizedIdentifier = loginIdentifier.trim().toLowerCase();

      if (
        normalizedIdentifier === "committee" ||
        normalizedIdentifier === "secretariat" ||
        normalizedIdentifier === "committee@example.com" ||
        normalizedIdentifier === "secretariat@example.com" ||
        normalizedIdentifier.includes("committee") ||
        normalizedIdentifier.includes("secretariat")
      ) {
        navigate("/dashboard/committee-secretariat");
        return;
      }

      if (
        normalizedIdentifier === "reviewer" ||
        normalizedIdentifier === "reviewer@example.com" ||
        normalizedIdentifier.includes("reviewer")
      ) {
        navigate("/dashboard/reviewer");
        return;
      }

      if (
        normalizedIdentifier === "instructor" ||
        normalizedIdentifier === "teacher" ||
        normalizedIdentifier === "event" ||
        normalizedIdentifier === "instructor@example.com" ||
        normalizedIdentifier.includes("instructor") ||
        normalizedIdentifier.includes("teacher")
      ) {
        navigate("/dashboard/instructor");
        return;
      }

      if (
        normalizedIdentifier === "business" ||
        normalizedIdentifier === "business@example.com" ||
        normalizedIdentifier.includes("business")
      ) {
        navigate("/dashboard/business-collaboration");
        return;
      }

      navigate("/dashboard/innovator");
    }
  };

  const openLogin = () => {
    setActiveView("login");
    setForgotStep("identify");
  };

  const openRegister = () => {
    setActiveView("register");
    setForgotStep("identify");
  };

  const openForgotPassword = () => {
    setActiveView("forgot");
    setForgotStep("identify");
  };

  return (
    <main className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-page__grid">
          <section className="auth-page__visual">
            <Link
              to="/"
              className="auth-page__logo-link"
              aria-label="بازگشت به صفحه اصلی"
            >
              <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
            </Link>

            <div className="auth-page__visual-inner">
              <img
                src={loginImage}
                alt="ورود و ثبت‌نام در سامانه هاتف"
                className="auth-page__image"
              />
            </div>
          </section>

          <section className="auth-page__form-side">
            <Link to="/" className="auth-page__back-link">
              <BackIcon />
              <span>بازگشت</span>
            </Link>

            <div
              className={`auth-card ${
                isLogin
                  ? "auth-card--login"
                  : isRegister
                    ? "auth-card--register"
                    : "auth-card--forgot"
              }`}
            >
              <div className="auth-card__tabs">
                <button
                  type="button"
                  className={`auth-card__tab ${
                    isLogin || isForgot ? "auth-card__tab--active" : ""
                  }`}
                  onClick={openLogin}
                >
                  ورود
                </button>

                <button
                  type="button"
                  className={`auth-card__tab ${
                    isRegister ? "auth-card__tab--active" : ""
                  }`}
                  onClick={openRegister}
                >
                  ثبت‌نام
                </button>
              </div>

              <div className="auth-card__forms-frame">
                <div
                  className={`auth-card__form-panel auth-card__form-panel--login ${
                    isLogin ? "auth-card__form-panel--active" : ""
                  }`}
                >
                  <div className="auth-card__header">
                    <h1>ورود به حساب کاربری</h1>
                  </div>

                  <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form__group">
                      <label htmlFor="login-email">ایمیل یا نام کاربری</label>
                      <input
                        id="login-email"
                        type="text"
                        value={loginIdentifier}
                        onChange={(event) =>
                          setLoginIdentifier(event.target.value)
                        }
                        placeholder="example@email.com یا reviewer"
                      />
                    </div>

                    <div className="auth-form__group">
                      <label htmlFor="login-password">رمز عبور</label>
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(event) =>
                          setLoginPassword(event.target.value)
                        }
                        placeholder="رمز عبور"
                      />
                    </div>

                    <div className="auth-form__row auth-form__row--between">
                      <label className="auth-checkbox">
                        <input type="checkbox" />
                        <span>مرا به خاطر بسپار</span>
                      </label>

                      <button
                        type="button"
                        className="auth-form__text-btn"
                        onClick={openForgotPassword}
                      >
                        فراموشی رمز عبور؟
                      </button>
                    </div>

                    <button type="submit" className="auth-form__submit">
                      ورود
                    </button>
                  </form>

                  <div className="auth-card__switch">
                    <span>حساب کاربری ندارید؟</span>

                    <button type="button" onClick={openRegister}>
                      ثبت‌نام کنید
                    </button>
                  </div>
                </div>

                <div
                  className={`auth-card__form-panel auth-card__form-panel--register ${
                    isRegister ? "auth-card__form-panel--active" : ""
                  }`}
                >
                  <div className="auth-card__header">
                    <h1>ثبت‌نام در سامانه</h1>
                  </div>

                  <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form__group">
                      <label htmlFor="register-name">نام و نام خانوادگی</label>
                      <input
                        id="register-name"
                        type="text"
                        placeholder="نام و نام خانوادگی"
                      />
                    </div>

                    <div className="auth-form__group">
                      <label htmlFor="register-email">ایمیل</label>
                      <input
                        id="register-email"
                        type="email"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="auth-form__group">
                      <label htmlFor="register-phone">شماره تماس</label>
                      <input
                        id="register-phone"
                        type="text"
                        placeholder="۰۹۱۲xxxxxxx"
                      />
                    </div>

                    <div className="auth-form__group">
                      <label htmlFor="register-password">رمز عبور</label>
                      <input
                        id="register-password"
                        type="password"
                        placeholder="رمز عبور"
                      />
                    </div>

                    <div className="auth-form__group">
                      <label>نوع کاربر</label>

                      <div className="auth-user-types">
                        <label className="auth-user-types__item">
                          <input
                            type="radio"
                            name="user-type"
                            value="innovator"
                            checked={selectedUserType === "innovator"}
                            onChange={() => setSelectedUserType("innovator")}
                          />
                          <span className="auth-user-types__box">
                            <strong>فناور</strong>
                          </span>
                        </label>

                        <label className="auth-user-types__item">
                          <input
                            type="radio"
                            name="user-type"
                            value="business"
                            checked={selectedUserType === "business"}
                            onChange={() => setSelectedUserType("business")}
                          />
                          <span className="auth-user-types__box">
                            <strong>همکار تجاری</strong>
                          </span>
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="auth-form__submit">
                      ثبت‌نام
                    </button>
                  </form>

                  <div className="auth-card__switch">
                    <span>قبلاً ثبت‌نام کرده‌اید؟</span>

                    <button type="button" onClick={openLogin}>
                      وارد شوید
                    </button>
                  </div>
                </div>

                <div
                  className={`auth-card__form-panel auth-card__form-panel--forgot ${
                    isForgot ? "auth-card__form-panel--active" : ""
                  }`}
                >
                  <div className="auth-card__header auth-card__header--forgot">
                    <h1>فراموشی رمز عبور</h1>
                    <p>
                      مراحل بازیابی رمز را کامل کنید تا بتوانید رمز جدید تعریف
                      کنید.
                    </p>
                  </div>

                  <div className="forgot-flow">
                    <div className="forgot-flow__steps">
                      <span
                        className={
                          forgotStep === "identify"
                            ? "forgot-flow__step forgot-flow__step--active"
                            : "forgot-flow__step"
                        }
                      >
                        ۱
                      </span>
                      <span
                        className={
                          forgotStep === "verify"
                            ? "forgot-flow__step forgot-flow__step--active"
                            : "forgot-flow__step"
                        }
                      >
                        ۲
                      </span>
                      <span
                        className={
                          forgotStep === "reset"
                            ? "forgot-flow__step forgot-flow__step--active"
                            : "forgot-flow__step"
                        }
                      >
                        ۳
                      </span>
                    </div>

                    {forgotStep === "identify" && (
                      <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__group">
                          <label htmlFor="forgot-email">
                            ایمیل یا شماره تماس
                          </label>
                          <input
                            id="forgot-email"
                            type="text"
                            placeholder="ایمیل یا شماره تماس خود را وارد کنید"
                          />
                        </div>

                        <p className="forgot-flow__hint">
                          کد تأیید برای ایمیل یا شماره تماس ثبت‌شده شما ارسال
                          می‌شود.
                        </p>

                        <button
                          type="button"
                          className="auth-form__submit"
                          onClick={() => setForgotStep("verify")}
                        >
                          ارسال کد تأیید
                        </button>
                      </form>
                    )}

                    {forgotStep === "verify" && (
                      <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__group">
                          <label htmlFor="forgot-code">کد تأیید</label>
                          <input
                            id="forgot-code"
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="کد ۶ رقمی"
                          />
                        </div>

                        <p className="forgot-flow__hint">
                          کد ارسال‌شده را وارد کنید. اگر کد را دریافت نکردید،
                          می‌توانید دوباره درخواست ارسال بدهید.
                        </p>

                        <div className="forgot-flow__actions">
                          <button
                            type="button"
                            className="auth-form__submit"
                            onClick={() => setForgotStep("reset")}
                          >
                            تأیید کد
                          </button>

                          <button
                            type="button"
                            className="forgot-flow__secondary"
                          >
                            ارسال مجدد کد
                          </button>
                        </div>
                      </form>
                    )}

                    {forgotStep === "reset" && (
                      <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__group">
                          <label htmlFor="new-password">رمز عبور جدید</label>
                          <input
                            id="new-password"
                            type="password"
                            placeholder="رمز عبور جدید"
                          />
                        </div>

                        <div className="auth-form__group">
                          <label htmlFor="confirm-password">
                            تکرار رمز عبور
                          </label>
                          <input
                            id="confirm-password"
                            type="password"
                            placeholder="تکرار رمز عبور جدید"
                          />
                        </div>

                        <button
                          type="button"
                          className="auth-form__submit"
                          onClick={() => setForgotStep("success")}
                        >
                          ثبت رمز جدید
                        </button>
                      </form>
                    )}

                    {forgotStep === "success" && (
                      <div className="forgot-flow__success">
                        <div className="forgot-flow__success-icon">
                          <CheckIcon />
                        </div>

                        <h2>رمز عبور با موفقیت تغییر کرد</h2>

                        <p>
                          اکنون می‌توانید با رمز جدید وارد حساب کاربری خود شوید.
                        </p>

                        <button
                          type="button"
                          className="auth-form__submit"
                          onClick={openLogin}
                        >
                          بازگشت به ورود
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="auth-card__switch auth-card__switch--forgot">
                    <span>رمز عبور را به خاطر آوردید؟</span>

                    <button type="button" onClick={openLogin}>
                      ورود به حساب
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
