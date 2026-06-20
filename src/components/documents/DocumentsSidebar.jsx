import { Link } from "react-router";
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
            <header className="documents-sidebar__box-heading">
              <span />
              <h2>{category.title}</h2>
            </header>

            <ul className="documents-sidebar__list">
              {sidebarItems.map((documentItem) => (
                <li key={documentItem.id}>
                  <Link to={`/documents/${category.slug}`}>
                    <span className="documents-sidebar__item-dot" />

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
