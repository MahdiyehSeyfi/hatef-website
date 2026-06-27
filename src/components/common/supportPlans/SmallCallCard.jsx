import { Link } from "react-router";

function SmallCallCard({ call, image, callPath, callNumber, description }) {
  return (
    <article className="previous-plan-card">
      <Link to={callPath} className="previous-plan-card__media">
        <img
          className="previous-plan-card__image"
          src={image}
          alt={call.title}
        />

        <div className="previous-plan-card__overlay">
          <h4>{call.title}</h4>
          <p>{description}</p>

          <span className="previous-plan-card__overlay-button">
            مشاهده جزئیات
            <span aria-hidden="true">←</span>
          </span>
        </div>
      </Link>

      <div className="previous-plan-card__body">
        <Link to={callPath} className="previous-plan-card__title">
          <span className="previous-plan-card__number">{callNumber}</span>

          <span>{call.title}</span>
        </Link>

        <p>{description}</p>
      </div>
    </article>
  );
}

export default SmallCallCard;
