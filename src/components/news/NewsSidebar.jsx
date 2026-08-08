import { useEffect, useState } from "react";
import { Link } from "react-router";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import {
  getImportantPublicNewsItems,
  getLatestPublicNewsItems,
  NEWS_UPDATED_EVENT,
} from "../../services/newsService";
import "./NewsSidebar.css";

function NewsSidebarGroup({ group }) {
  return (
    <section className="news-sidebar__box">
      <SectionHeader
        title={group.title}
        variant="subsection"
        className="news-sidebar__heading"
      />

      <ul className="news-sidebar__list">
        {group.items.length === 0 ? (
          <li className="news-sidebar__empty">هنوز موردی ثبت نشده است.</li>
        ) : (
          group.items.map((newsItem) => (
            <li key={`${group.id}-${newsItem.id}`}>
              <Link to={`/news/${newsItem.id}`}>
                <span className="news-sidebar__item-dot" />
                <span>{newsItem.title}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function NewsSidebar() {
  const [latestNewsItems, setLatestNewsItems] = useState(() =>
    getLatestPublicNewsItems(6),
  );
  const [importantNewsItems, setImportantNewsItems] = useState(() =>
    getImportantPublicNewsItems(6),
  );

  useEffect(() => {
    const refreshSidebarNews = () => {
      setLatestNewsItems(getLatestPublicNewsItems(6));
      setImportantNewsItems(getImportantPublicNewsItems(6));
    };

    refreshSidebarNews();
    window.addEventListener(NEWS_UPDATED_EVENT, refreshSidebarNews);
    window.addEventListener("storage", refreshSidebarNews);

    return () => {
      window.removeEventListener(NEWS_UPDATED_EVENT, refreshSidebarNews);
      window.removeEventListener("storage", refreshSidebarNews);
    };
  }, []);

  const sidebarGroups = [
    {
      id: "latest",
      title: "آخرین اخبار",
      items: latestNewsItems,
    },
    {
      id: "important",
      title: "مهم‌ترین خبرها",
      items: importantNewsItems,
    },
  ];

  return (
    <aside className="news-sidebar">
      {sidebarGroups.map((group) => (
        <NewsSidebarGroup key={group.id} group={group} />
      ))}
    </aside>
  );
}

export default NewsSidebar;
