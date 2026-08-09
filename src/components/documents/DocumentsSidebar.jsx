import { Link } from "react-router";

import SectionHeader from "../ui/SectionHeader/SectionHeader";
import { documentCategories, documentsData } from "../../data/documentsData";

import "./DocumentsSidebar.css";

function DocumentsSidebar() {
  return (
    <aside className="documents-sidebar">
      {documentCategories.map((category) => {
        const categoryData = documentsData[category.slug];

        const sidebarItems = categoryData.groups
          .flatMap((group) => group.items)
          .slice(0, 5);

        return (
          <section className="documents-sidebar__box" key={category.slug}>
            <SectionHeader
              title={category.title}
              variant="subsection"
              className="documents-sidebar__box-heading"
            />

            <ul className="documents-sidebar__list">
              {sidebarItems.map((documentItem) => (
                <li key={documentItem.id}>
                  <Link to={`/documents/${category.slug}`}>
                    <span
                      className="documents-sidebar__item-dot"
                      aria-hidden="true"
                    />

                    <span>{documentItem.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </aside>
  );
}

export default DocumentsSidebar;
