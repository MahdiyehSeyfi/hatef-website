import { Link } from "react-router";
import { newsItems } from "../../data/newsData";
import "./NewsSidebar.css";

const sidebarGroups = [
  {
    id: 1,
    title: "آخرین اخبار",
    items: newsItems.slice(0, 6),
  },
  {
    id: 2,
    title: "مهم‌ترین خبرها",
    items: newsItems.slice(2, 8),
  },
  {
    id: 3,
    title: "آخرین رویدادها",
    items: newsItems.slice(4, 10),
  },
];

function NewsSidebar() {
  return (
    <aside className="news-sidebar">
      {sidebarGroups.map((group) => (
        <section className="news-sidebar__box" key={group.id}>
          <header className="news-sidebar__heading">
            <span />
            <h2>{group.title}</h2>
          </header>

          <ul className="news-sidebar__list">
            {group.items.map((newsItem) => (
              <li key={`${group.id}-${newsItem.id}`}>
                <Link to={`/news/${newsItem.id}`}>
                  <span className="news-sidebar__item-dot" />
                  <span>{newsItem.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

export default NewsSidebar;
