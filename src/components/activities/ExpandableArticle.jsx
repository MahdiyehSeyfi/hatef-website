import { useState } from "react";
import "./ExpandableArticle.css";

function ExpandableArticle({ title, paragraphs }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="expandable-article">
      <div className="expandable-article__container">
        <h2>{title}</h2>

        <div
          className={`expandable-article__content ${
            isExpanded
              ? "expandable-article__content--expanded"
              : "expandable-article__content--collapsed"
          }`}
        >
          {paragraphs.map((paragraph, index) => (
            <p key={`${title}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <button
          type="button"
          className="expandable-article__button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "بستن مطلب" : "مطالعه کامل مطلب"}

          <span
            className={
              isExpanded
                ? "expandable-article__arrow expandable-article__arrow--open"
                : "expandable-article__arrow"
            }
            aria-hidden="true"
          >
            ↓
          </span>
        </button>
      </div>
    </section>
  );
}

export default ExpandableArticle;
