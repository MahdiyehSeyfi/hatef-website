import { Link } from "react-router";

import "./Breadcrumb.css";

function Breadcrumb({ items = [], className = "" }) {
  const classes = ["ui-breadcrumb", className].filter(Boolean).join(" ");

  return (
    <nav className={classes} aria-label="مسیر صفحه">
      <ol className="ui-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li className="ui-breadcrumb__item" key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link className="ui-breadcrumb__link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className="ui-breadcrumb__current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="ui-breadcrumb__separator" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
