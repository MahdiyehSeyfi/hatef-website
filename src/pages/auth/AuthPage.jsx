import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import loginImage from "../../assets/images/login/login.png";

import { USER_ROLES } from "../../constants/roles";
import {
  getDashboardPathByRole,
  loginWithCredentials,
  registerMockUser,
} from "../../services/authService";

import Button from "../../components/ui/Button/Button";
import Checkbox from "../../components/ui/Checkbox/Checkbox";
import FormField from "../../components/ui/FormField/FormField";
import Input from "../../components/ui/Input/Input";

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

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const user = await loginWithCredentials(identifier, password);

      if (!user) {
        window.alert("نام کاربری/ایمیل یا رمز عبور درست نیست.");
        return;
      }

      navigate(getDashboardPathByRole(user.role));
    } catch (error) {
      window.alert(error?.message || "نام کاربری/ایمیل یا رمز عبور درست نیست.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      const user = await registerMockUser({
        fullName: String(formData.get("fullName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        mobile: String(formData.get("mobile") || "").trim(),
        password: String(formData.get("password") || "").trim(),
        role: String(formData.get("role") || USER_ROLES.INNOVATOR).trim(),
      });

      if (!user) {
        window.alert(
          "ثبت‌نام انجام نشد. لطفاً اطلاعات ضروری را کامل کنید یا ایمیل تکراری وارد نکنید.",
        );
        return;
      }

      navigate(getDashboardPathByRole(user.role));
    } catch (error) {
      window.alert(
        error?.message ||
          "ثبت‌نام انجام نشد. لطفاً اطلاعات ضروری را کامل کنید یا ایمیل تکراری وارد نکنید.",
      );
    }
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
            <Button
              to="/"
              variant="ghost"
              size="sm"
              className="auth-page__back-link"
              leadingIcon={<BackIcon />}
            >
              بازگشت
            </Button>

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

                  <form className="auth-form" onSubmit={handleLogin}>
                    <FormField
                      label="ایمیل یا نام کاربری"
                      htmlFor="login-identifier"
                      required
                    >
                      <Input
                        id="login-identifier"
                        name="identifier"
                        type="text"
                        placeholder="ایمیل یا نام کاربری"
                        autoComplete="username"
                        required
                      />
                    </FormField>

                    <FormField
                      label="رمز عبور"
                      htmlFor="login-password"
                      required
                    >
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="رمز عبور"
                        autoComplete="current-password"
                        required
                      />
                    </FormField>

                    <div className="auth-form__row auth-form__row--between">
                      <Checkbox label="مرا به خاطر بسپار" />

                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={openForgotPassword}
                      >
                        فراموشی رمز عبور؟
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      className="auth-form__submit"
                    >
                      ورود
                    </Button>
                  </form>

                  <div className="auth-card__switch">
                    <span>حساب کاربری ندارید؟</span>

                    <Button type="button" variant="link" size="sm" onClick={openRegister}>
                      ثبت‌نام کنید
                    </Button>
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

                  <form className="auth-form" onSubmit={handleRegister}>
                    <FormField
                      label="نام و نام خانوادگی"
                      htmlFor="register-name"
                      required
                    >
                      <Input
                        id="register-name"
                        name="fullName"
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        required
                      />
                    </FormField>

                    <FormField
                      label="ایمیل"
                      htmlFor="register-email"
                      required
                    >
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        required
                      />
                    </FormField>

                    <FormField label="شماره تماس" htmlFor="register-phone">
                      <Input
                        id="register-phone"
                        name="mobile"
                        type="tel"
                        placeholder="۰۹۱۲xxxxxxx"
                      />
                    </FormField>

                    <FormField
                      label="رمز عبور"
                      htmlFor="register-password"
                      required
                    >
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="رمز عبور"
                        autoComplete="new-password"
                        required
                      />
                    </FormField>

                    <FormField label="نوع کاربر">
                      <div className="auth-user-types">
                        <label className="auth-user-types__item">
                          <input
                            type="radio"
                            name="role"
                            value={USER_ROLES.INNOVATOR}
                            defaultChecked
                          />
                          <span className="auth-user-types__box">
                            <strong>فناور</strong>
                          </span>
                        </label>

                        <label className="auth-user-types__item">
                          <input
                            type="radio"
                            name="role"
                            value={USER_ROLES.BUSINESS_PARTNER}
                          />
                          <span className="auth-user-types__box">
                            <strong>همکار تجاری</strong>
                          </span>
                        </label>
                      </div>
                    </FormField>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      className="auth-form__submit"
                    >
                      ثبت‌نام
                    </Button>
                  </form>

                  <div className="auth-card__switch">
                    <span>قبلاً ثبت‌نام کرده‌اید؟</span>

                    <Button type="button" variant="link" size="sm" onClick={openLogin}>
                      وارد شوید
                    </Button>
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
                        <FormField
                          label="ایمیل یا شماره تماس"
                          htmlFor="forgot-email"
                        >
                          <Input
                            id="forgot-email"
                            type="text"
                            placeholder="ایمیل یا شماره تماس خود را وارد کنید"
                          />
                        </FormField>

                        <p className="forgot-flow__hint">
                          کد تأیید برای ایمیل یا شماره تماس ثبت‌شده شما ارسال
                          می‌شود.
                        </p>

                        <Button
                          type="button"
                          variant="primary"
                          fullWidth
                          className="auth-form__submit"
                          onClick={() => setForgotStep("verify")}
                        >
                          ارسال کد تأیید
                        </Button>
                      </form>
                    )}

                    {forgotStep === "verify" && (
                      <form className="auth-form" onSubmit={handleSubmit}>
                        <FormField label="کد تأیید" htmlFor="forgot-code">
                          <Input
                            id="forgot-code"
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="کد ۶ رقمی"
                          />
                        </FormField>

                        <p className="forgot-flow__hint">
                          کد ارسال‌شده را وارد کنید. اگر کد را دریافت نکردید،
                          می‌توانید دوباره درخواست ارسال بدهید.
                        </p>

                        <div className="forgot-flow__actions">
                          <Button
                            type="button"
                            variant="primary"
                            className="auth-form__submit"
                            onClick={() => setForgotStep("reset")}
                          >
                            تأیید کد
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                          >
                            ارسال مجدد کد
                          </Button>
                        </div>
                      </form>
                    )}

                    {forgotStep === "reset" && (
                      <form className="auth-form" onSubmit={handleSubmit}>
                        <FormField
                          label="رمز عبور جدید"
                          htmlFor="new-password"
                        >
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="رمز عبور جدید"
                          />
                        </FormField>

                        <FormField
                          label="تکرار رمز عبور"
                          htmlFor="confirm-password"
                        >
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="تکرار رمز عبور جدید"
                          />
                        </FormField>

                        <Button
                          type="button"
                          variant="primary"
                          fullWidth
                          className="auth-form__submit"
                          onClick={() => setForgotStep("success")}
                        >
                          ثبت رمز جدید
                        </Button>
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

                        <Button
                          type="button"
                          variant="primary"
                          fullWidth
                          className="auth-form__submit"
                          onClick={openLogin}
                        >
                          بازگشت به ورود
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="auth-card__switch auth-card__switch--forgot">
                    <span>رمز عبور را به خاطر آوردید؟</span>

                    <Button type="button" variant="link" size="sm" onClick={openLogin}>
                      ورود به حساب
                    </Button>
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
