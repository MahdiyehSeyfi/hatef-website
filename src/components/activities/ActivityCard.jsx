import { Link } from "react-router";

import "./ActivityCard.css";

function getButtonLabel(item) {
  if (item.status === "registering") {
    return item.type === "event" ? "ثبت‌نام در رویداد" : "ثبت‌نام در دوره";
  }

  if (item.status === "past") {
    return item.type === "event"
      ? "گزارش و اطلاعات رویداد"
      : "گزارش و اطلاعات دوره";
  }

  return "اطلاعات بیشتر";
}

function getDetailsPath(item) {
  if (item.type === "course") {
    return `/courses/${item.id}`;
  }

  return `/events/${item.id}`;
}

function ActivityCard({ item }) {
  const detailsPath = getDetailsPath(item);

  return (
    <article className="activity-card">
      <Link
        to={detailsPath}
        className="activity-card__media"
        aria-label={`مشاهده ${item.title}`}
      >
        <img
          className="activity-card__image"
          src={item.image}
          alt={item.title}
        />
      </Link>

      <div className="activity-card__content">
        <Link to={detailsPath} className="activity-card__title">
          {item.title}
        </Link>

        <dl className="activity-card__details">
          <div>
            <dt>شروع از:</dt>
            <dd>{item.startDate}</dd>
          </div>

          <div>
            <dt>{item.type === "event" ? "دبیر:" : "مدرس:"}</dt>

            <dd>{item.instructor}</dd>
          </div>

          <div>
            <dt>برگزارکننده:</dt>
            <dd>{item.organizer}</dd>
          </div>
        </dl>

        <Link to={detailsPath} className="activity-card__button">
          {getButtonLabel(item)}
        </Link>
      </div>
    </article>
  );
}

export default ActivityCard;
