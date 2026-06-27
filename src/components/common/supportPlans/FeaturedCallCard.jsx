import { Link } from "react-router";

function FeaturedCallCard({
  call,
  image,
  callPath,
  callNumber,
  category,
  deadline,
  statusLabel,
  description,
  onSupportRequestClick,
}) {
  return (
    <article className="current-plan">
      <div className="current-plan__media">
        <img className="current-plan__image" src={image} alt={call.title} />

        <div className="current-plan__overlay">
          <div className="current-plan__overlay-content">
            <h3>{call.title}</h3>

            <p>{description}</p>

            <div className="current-plan__overlay-actions">
              <a
                href={callPath}
                className="current-plan__overlay-primary"
                onClick={onSupportRequestClick}
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
          <span className="current-plan__number">{callNumber}</span>

          <Link to={callPath} className="current-plan__title-link">
            {call.title}
          </Link>

          <span className="current-plan__category">{category}</span>
        </div>

        <div className="current-plan__details">
          <span className="current-plan__deadline">{deadline}</span>

          <span className="current-plan__status">{statusLabel}</span>
        </div>
      </div>
    </article>
  );
}

export default FeaturedCallCard;
