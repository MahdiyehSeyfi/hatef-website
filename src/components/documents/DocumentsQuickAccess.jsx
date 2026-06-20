import { Link } from "react-router";
import "./DocumentsQuickAccess.css";

function FormsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3.5h7l4 4V20H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M14 3.5V8h4M10 12h5M10 15.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RegulationsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5h12v17H6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M9 8h6M9 12h6M9 16h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="m15.5 15.5 1.4 1.4 2.6-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 9h17M9 9v11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

const quickAccessItems = [
  {
    slug: "forms",
    title: "فرم‌ها",
    description: "فرم‌های اجرایی و اداری",
    Icon: FormsIcon,
    startColor: "#06b6d4",
    endColor: "#0284c7",
    shadowColor: "rgba(2, 132, 199, 0.3)",
  },
  {
    slug: "regulations",
    title: "آیین‌نامه‌ها",
    description: "ضوابط و دستورالعمل‌ها",
    Icon: RegulationsIcon,
    startColor: "#7c3aed",
    endColor: "#4f46e5",
    shadowColor: "rgba(79, 70, 229, 0.3)",
  },
  {
    slug: "templates",
    title: "قالب‌ها",
    description: "فایل‌های استاندارد و نمونه",
    Icon: TemplatesIcon,
    startColor: "#10b981",
    endColor: "#0f766e",
    shadowColor: "rgba(15, 118, 110, 0.3)",
  },
];

function DocumentsQuickAccess({ activeCategory }) {
  return (
    <section className="documents-quick-access">
      <header className="documents-quick-access__heading">
        <div>
          <span />
          <h2>پیوندهای دسترسی سریع</h2>
        </div>

        <i />
      </header>

      <div className="documents-quick-access__grid">
        {quickAccessItems.map(
          ({
            slug,
            title,
            description,
            Icon,
            startColor,
            endColor,
            shadowColor,
          }) => {
            const isActive = activeCategory === slug;

            return (
              <Link
                key={slug}
                to={`/documents/${slug}`}
                className={`documents-quick-access__card ${
                  isActive ? "documents-quick-access__card--active" : ""
                }`}
                style={{
                  "--quick-start": startColor,
                  "--quick-end": endColor,
                  "--quick-shadow": shadowColor,
                }}
              >
                <span className="documents-quick-access__icon">
                  <Icon />
                </span>

                <span className="documents-quick-access__content">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>

                <span
                  className="documents-quick-access__arrow"
                  aria-hidden="true"
                >
                  ←
                </span>
              </Link>
            );
          },
        )}
      </div>
    </section>
  );
}

export default DocumentsQuickAccess;
