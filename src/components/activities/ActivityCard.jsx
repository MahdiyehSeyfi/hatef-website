import { Link } from "react-router";

import fallbackImage from "../../assets/images/banner.png";
import Badge from "../ui/Badge/Badge";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";

import "./ActivityCard.css";

const ACTIVITY_STATUS_LABELS = {
  registering: "ثبت‌نام فعال",
  ongoing: "در حال برگزاری",
  past: "برگزار شده",
  "coming-soon": "به‌زودی",
};

function getActivityPath(item) {
  if (item.path) {
    return item.path;
  }

  const itemId = item.slug || item.id;

  if (item.type === "event") {
    return `/events/${itemId}`;
  }

  return `/courses/${itemId}`;
}

function getActivityStatusLabel(item) {
  if (item.statusLabel) {
    return item.statusLabel;
  }

  return ACTIVITY_STATUS_LABELS[item.status] || item.status || "ثبت‌نام فعال";
}

function getActivityImage(item) {
  return item.image || item.coverImage || item.bannerImage || fallbackImage;
}

function getActivityButtonLabel(item) {
  if (item.buttonLabel) {
    return item.buttonLabel;
  }

  return item.type === "event" ? "مشاهده رویداد" : "مشاهده دوره";
}

function getFirstMetaLabel(item) {
  if (item.firstMetaLabel) {
    return item.firstMetaLabel;
  }

  return item.type === "event" ? "زمان:" : "شروع از:";
}

function getFirstMetaValue(item) {
  return (
    item.startDate ||
    item.eventDate ||
    item.date ||
    item.registrationDate ||
    "زمان‌بندی اعلام نشده"
  );
}

function getSecondMetaLabel(item) {
  if (item.secondMetaLabel) {
    return item.secondMetaLabel;
  }

  return item.type === "event" ? "ارائه‌دهنده:" : "مدرس:";
}

function getSecondMetaValue(item) {
  if (item.secondMetaValue) {
    return item.secondMetaValue;
  }

  if (item.type === "event") {
    return (
      item.presenter ||
      item.presenterName ||
      item.secretaryName ||
      item.instructor ||
      "ارائه‌دهنده رویداد"
    );
  }

  return (
    item.instructor ||
    item.instructorName ||
    item.mainInstructorName ||
    "مدرس دوره"
  );
}

function getThirdMetaLabel(item) {
  if (item.thirdMetaLabel) {
    return item.thirdMetaLabel;
  }

  return "برگزارکننده:";
}

function getThirdMetaValue(item) {
  if (item.thirdMetaValue) {
    return item.thirdMetaValue;
  }

  return item.organizer || "برنامه هاتف";
}

function ActivityCard({ item, activity }) {
  const currentItem = item || activity;

  if (!currentItem) {
    return null;
  }

  const activityPath = getActivityPath(currentItem);
  const activityTitle = currentItem.title || "برنامه هاتف";
  const activityImage = getActivityImage(currentItem);
  const statusLabel = getActivityStatusLabel(currentItem);
  const buttonLabel = getActivityButtonLabel(currentItem);

  return (
    <Card as="article" interactive className="activity-card">
      <Link
        to={activityPath}
        className="activity-card__media"
        aria-label={`مشاهده ${activityTitle}`}
      >
        <img
          className="activity-card__image"
          src={activityImage}
          alt={activityTitle}
        />

        <Badge tone="warning" className="activity-card__status">
          {statusLabel}
        </Badge>
      </Link>

      <div className="activity-card__content">
        <Link to={activityPath} className="activity-card__title">
          {activityTitle}
        </Link>

        <dl className="activity-card__details">
          <div>
            <dt>{getFirstMetaLabel(currentItem)}</dt>
            <dd>{getFirstMetaValue(currentItem)}</dd>
          </div>

          <div>
            <dt>{getSecondMetaLabel(currentItem)}</dt>
            <dd>{getSecondMetaValue(currentItem)}</dd>
          </div>

          <div>
            <dt>{getThirdMetaLabel(currentItem)}</dt>
            <dd>{getThirdMetaValue(currentItem)}</dd>
          </div>
        </dl>

        <Button
          to={activityPath}
          variant="primary"
          size="sm"
          fullWidth
          className="activity-card__button"
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
}

export default ActivityCard;
