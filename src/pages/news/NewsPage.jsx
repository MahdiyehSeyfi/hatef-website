import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import NewsSidebar from "../../components/news/NewsSidebar";
import Badge from "../../components/ui/Badge/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Pagination from "../../components/ui/Pagination/Pagination";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";
import {
  getPublicNewsItems,
  NEWS_UPDATED_EVENT,
} from "../../services/newsService";
import "./NewsPage.css";

const newsPerPage = 8;

function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [newsItems, setNewsItems] = useState(() => getPublicNewsItems());

  useEffect(() => {
    const refreshNewsItems = () => {
      setNewsItems(getPublicNewsItems());
      setCurrentPage(1);
    };

    refreshNewsItems();
    window.addEventListener(NEWS_UPDATED_EVENT, refreshNewsItems);
    window.addEventListener("storage", refreshNewsItems);

    return () => {
      window.removeEventListener(NEWS_UPDATED_EVENT, refreshNewsItems);
      window.removeEventListener("storage", refreshNewsItems);
    };
  }, []);

  const pageCount = Math.max(Math.ceil(newsItems.length / newsPerPage), 1);

  const visibleNews = useMemo(() => {
    const startIndex = (currentPage - 1) * newsPerPage;

    return newsItems.slice(startIndex, startIndex + newsPerPage);
  }, [currentPage, newsItems]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  const changePage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > pageCount) {
      return;
    }

    setCurrentPage(pageNumber);
  };

  return (
    <div className="news-list-page">
      <div className="news-list-page__container">
        <Breadcrumb
          className="news-list-page__breadcrumb"
          items={[
            { label: "صفحه اصلی", to: "/" },
            { label: "اخبار و اطلاع‌رسانی" },
          ]}
        />

        <div className="news-list-page__layout">
          <NewsSidebar />

          <section className="news-list-page__main">
            <SectionHeader
              as="h1"
              title="اخبار و اطلاع‌رسانی"
              className="news-list-page__heading"
            />

            <div className="news-list-page__items">
              {visibleNews.map((newsItem) => (
                <article className="news-list-page__item" key={newsItem.id}>
                  <div className="news-list-page__item-content">
                    <div className="news-list-page__labels">
                      <Badge tone="info">
                        {newsItem.category || "اخبار و اطلاع‌رسانی"}
                      </Badge>
                      {newsItem.isImportant && (
                        <Badge tone="warning">خبر مهم</Badge>
                      )}
                    </div>

                    <Link
                      to={`/news/${newsItem.id}`}
                      className="news-list-page__item-title"
                    >
                      {newsItem.title}
                    </Link>

                    <p>{newsItem.summary}</p>

                    <span className="news-list-page__date">
                      {newsItem.date ||
                        newsItem.publishedAt ||
                        newsItem.createdAt}
                    </span>
                  </div>

                  <Link
                    to={`/news/${newsItem.id}`}
                    className="news-list-page__image"
                  >
                    <img src={newsItem.image} alt={newsItem.title} />
                  </Link>
                </article>
              ))}
            </div>

            {newsItems.length === 0 && (
              <div className="news-list-page__empty">
                <h2>هنوز خبری منتشر نشده است</h2>
              </div>
            )}

            {newsItems.length > newsPerPage && (
              <Pagination
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={changePage}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
