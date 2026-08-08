import { useState } from "react";
import Button from "../ui/Button/Button";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import "./ExpandableArticle.css";

function ExpandableArticle({ title, paragraphs }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="expandable-article">
      <div className="expandable-article__container">
        <SectionHeader title={title} className="expandable-article__heading" />

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

        <Button
          type="button"
          variant="outline"
          size="md"
          width="wide"
          className="expandable-article__button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          trailingIcon={
            <span
              className={
                isExpanded
                  ? "expandable-article__arrow expandable-article__arrow--open"
                  : "expandable-article__arrow"
              }
            >
              ↓
            </span>
          }
        >
          {isExpanded ? "بستن مطلب" : "مطالعه کامل مطلب"}
        </Button>
      </div>
    </section>
  );
}

export default ExpandableArticle;
