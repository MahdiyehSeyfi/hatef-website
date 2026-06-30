import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import ViewAllButton from "../common/ViewAllButton";

import {
  getCurrentUser,
  getCurrentUserDashboardPath,
} from "../../services/authService";

import {
  CALLS_UPDATED_EVENT,
  getCalls,
  getPublishedCalls,
  hydrateCallsFromSupabase,
} from "../../services/callService";
import { CALL_STATUS, CALL_STATUS_LABELS } from "../../constants/statuses";

import "./SupportPlansSection.css";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function getCallPath(call) {
  return `/research-support/calls/${call.id}`;
}

function getCallCategory(call) {
  return call.field ? `با محوریت ${call.field}` : "فراخوان برنامه هاتف";
}

function getCallDeadline(call) {
  if (!call.deadlineDate && !call.deadlineTime) {
    return "مهلت ارسال مشخص نشده است";
  }

  if (call.deadlineDate && call.deadlineTime) {
    return `مهلت تا: ${call.deadlineDate} ساعت ${call.deadlineTime}`;
  }

  return `مهلت تا: ${call.deadlineDate || call.deadlineTime}`;
}

function getCallStatusLabel(call) {
  if (call.status === CALL_STATUS.PUBLISHED) {
    return "در حال دریافت طرح‌ها";
  }

  return CALL_STATUS_LABELS[call.status] || "وضعیت نامشخص";
}

function getCallDescription(call) {
  return (
    call.description ||
    call.summary ||
    call.moreDescription ||
    "فراخوان برنامه هاتف با هدف حمایت از طرح‌ها و محصولات فناورانه دانشگاهی منتشر شده است."
  );
}

function getCallImage(call) {
  return (
    call.image ||
    call.bannerPreview ||
    call.bannerImage ||
    call.coverImage ||
    bannerImage
  );
}

function getCallTimeValue(call) {
  const possibleDateValues = [
    call.publishedAt,
    call.updatedAt,
    call.createdAt,
    call.startDate,
    call.deadlineDate,
  ];

  for (const value of possibleDateValues) {
    const time = Date.parse(value);

    if (!Number.isNaN(time)) {
      return time;
    }
  }

  return 0;
}

function sortCallsNewestFirst(calls) {
  return [...calls].sort((firstCall, secondCall) => {
    return getCallTimeValue(secondCall) - getCallTimeValue(firstCall);
  });
}

function hasCurrentYearFlag(call) {
  return Boolean(
    call.isCurrentYear ||
    call.isCurrentYearField ||
    call.isCurrentField ||
    call.currentYear ||
    call.currentField ||
    call.showInCurrentFields ||
    call.isCurrentSupportPlan ||
    call.isFeatured ||
    call.featured ||
    call.currentAxis ||
    call.isAnnualPriority,
  );
}

function getMainCall() {
  const publishedCalls = sortCallsNewestFirst(getPublishedCalls());
  const allCalls = sortCallsNewestFirst(getCalls());

  const currentYearPublishedCall = publishedCalls.find(hasCurrentYearFlag);

  if (currentYearPublishedCall) {
    return currentYearPublishedCall;
  }

  const currentYearCall = allCalls.find(hasCurrentYearFlag);

  if (currentYearCall) {
    return currentYearCall;
  }

  return publishedCalls[0] || allCalls[0] || null;
}

function getPreviousCalls(mainCall) {
  if (!mainCall) {
    return [];
  }

  return sortCallsNewestFirst(getCalls())
    .filter((call) => call.id !== mainCall.id)
    .slice(0, 3);
}

function getCallNumber(call, calls) {
  const index = calls.findIndex((item) => item.id === call.id);

  if (index === -1) {
    return "۱";
  }

  return toPersianNumber(index + 1);
}

function SectionSubheading({ title, warning = false }) {
  return (
    <div className="support-plans__subheading">
      <div className="support-plans__subheading-label">
        <span
          className={`support-plans__subheading-dot ${
            warning ? "support-plans__subheading-dot--warning" : ""
          }`}
        />

        <h3>{title}</h3>
      </div>

      <span className="support-plans__subheading-line" />
    </div>
  );
}

function EmptySupportPlans() {
  return (
    <section className="support-plans" id="calls">
      <div className="container">
        <header className="support-plans__header">
          <h2>طرح حمایتی هاتف</h2>
          <span className="support-plans__header-accent" />
        </header>

        <SectionSubheading title="محورهای سال جاری" />

        <p
          style={{
            width: "min(100%, var(--support-content-width))",
            margin: "28px auto 0",
            color: "#454d58",
            fontSize: "14px",
            lineHeight: "2",
            textAlign: "right",
          }}
        >
          هنوز فراخوانی توسط دبیرخانه ثبت یا منتشر نشده است.
        </p>
      </div>
    </section>
  );
}

function SupportPlansSection() {
  const navigate = useNavigate();
  const [, setCallsVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refreshCalls = () => {
      if (!isMounted) {
        return;
      }

      setCallsVersion((currentVersion) => currentVersion + 1);
    };

    hydrateCallsFromSupabase({ force: true })
      .then(refreshCalls)
      .catch((error) => {
        console.warn(
          "Support plans hydration failed:",
          error?.message || error,
        );
      });

    window.addEventListener(CALLS_UPDATED_EVENT, refreshCalls);

    return () => {
      isMounted = false;
      window.removeEventListener(CALLS_UPDATED_EVENT, refreshCalls);
    };
  }, []);

  const allCalls = getCalls();
  const mainCall = getMainCall();

  if (!mainCall) {
    return <EmptySupportPlans />;
  }

  const previousCalls = getPreviousCalls(mainCall);
  const mainCallPath = getCallPath(mainCall);
  const mainCallNumber = getCallNumber(mainCall, allCalls);

  const handleSupportRequestClick = (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const dashboardPath = getCurrentUserDashboardPath();

    navigate(dashboardPath && dashboardPath !== "/" ? dashboardPath : "/");
  };

  return (
    <section className="support-plans" id="calls">
      <div className="container">
        <header className="support-plans__header">
          <h2>طرح حمایتی هاتف</h2>
          <span className="support-plans__header-accent" />
        </header>

        <SectionSubheading title="محورهای سال جاری" />

        <article className="current-plan">
          <div className="current-plan__media">
            <img
              className="current-plan__image"
              src={getCallImage(mainCall)}
              alt={mainCall.title}
            />

            <div className="current-plan__overlay">
              <div className="current-plan__overlay-content">
                <h3>{mainCall.title}</h3>

                <p>{getCallDescription(mainCall)}</p>

                <div className="current-plan__overlay-actions">
                  <a
                    href={mainCallPath}
                    className="current-plan__overlay-primary"
                    onClick={handleSupportRequestClick}
                  >
                    شرکت در هاتف
                  </a>

                  <div className="current-plan__overlay-secondary-actions">
                    <Link to="/research-support/guide-eligibility#registration-guide">
                      راهنمای ثبت‌نام
                    </Link>

                    <Link to="/research-support/guide-eligibility#eligibility">
                      شرایط احراز
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="current-plan__information">
            <div className="current-plan__title">
              <span className="current-plan__number">{mainCallNumber}</span>

              <Link to={mainCallPath} className="current-plan__title-link">
                {mainCall.title}
              </Link>

              <span className="current-plan__category">
                {getCallCategory(mainCall)}
              </span>
            </div>

            <div className="current-plan__details">
              <span className="current-plan__deadline">
                {getCallDeadline(mainCall)}
              </span>

              <span className="current-plan__status">
                {getCallStatusLabel(mainCall)}
              </span>
            </div>
          </div>
        </article>

        <div className="support-plans__previous-heading">
          <SectionSubheading title="فراخوان‌های دوره‌های پیشین" warning />
        </div>

        {previousCalls.length > 0 ? (
          <div className="previous-plans">
            {previousCalls.map((call) => {
              const previousCallPath = getCallPath(call);
              const previousCallNumber = getCallNumber(call, allCalls);

              return (
                <article className="previous-plan-card" key={call.id}>
                  <Link
                    to={previousCallPath}
                    className="previous-plan-card__media"
                  >
                    <img
                      className="previous-plan-card__image"
                      src={getCallImage(call)}
                      alt={call.title}
                    />

                    <div className="previous-plan-card__overlay">
                      <h4>{call.title}</h4>
                      <p>{getCallDescription(call)}</p>

                      <span className="previous-plan-card__overlay-button">
                        مشاهده جزئیات
                        <span aria-hidden="true">←</span>
                      </span>
                    </div>
                  </Link>

                  <div className="previous-plan-card__body">
                    <Link
                      to={previousCallPath}
                      className="previous-plan-card__title"
                    >
                      <span className="previous-plan-card__number">
                        {previousCallNumber}
                      </span>

                      <span>{call.title}</span>
                    </Link>

                    <p>{getCallDescription(call)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p
            style={{
              width: "min(100%, var(--support-content-width))",
              margin: "30px auto 0",
              color: "#454d58",
              fontSize: "14px",
              lineHeight: "2",
              textAlign: "right",
            }}
          >
            هنوز فراخوانی برای دوره‌های پیشین ثبت نشده است.
          </p>
        )}

        <div className="support-plans__footer">
          <ViewAllButton to="/research-support/calls#previous-calls" />
        </div>
      </div>
    </section>
  );
}

export default SupportPlansSection;
