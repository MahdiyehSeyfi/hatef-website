import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import NewsSidebar from "../../components/news/NewsSidebar";
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
        <nav className="news-list-page__breadcrumb" aria-label="مسیر صفحه">
          <Link to="/">صفحه اصلی</Link>
          <span>/</span>
          <span>اخبار و اطلاع‌رسانی</span>
        </nav>

        <div className="news-list-page__layout">
          <NewsSidebar />

          <section className="news-list-page__main">
            <header className="news-list-page__heading">
              <div>
                <span />
                <h1>اخبار و اطلاع‌رسانی</h1>
              </div>

              <i />
            </header>

            <div className="news-list-page__items">
              {visibleNews.map((newsItem) => (
                <article className="news-list-page__item" key={newsItem.id}>
                  <div className="news-list-page__item-content">
                    <div className="news-list-page__labels">
                      <span>{newsItem.category || "اخبار و اطلاع‌رسانی"}</span>
                      {newsItem.isImportant && <strong>خبر مهم</strong>}
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
              <div className="news-details-page__not-found">
                <h1>هنوز خبری منتشر نشده است</h1>
              </div>
            )}

            {newsItems.length > newsPerPage && (
              <nav
                className="news-list-page__pagination"
                aria-label="صفحه‌بندی اخبار"
              >
                <button
                  type="button"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  صفحه قبل
                </button>

                <div>
                  {Array.from({ length: pageCount }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={
                          pageNumber === currentPage
                            ? "news-list-page__page--active"
                            : ""
                        }
                        onClick={() => changePage(pageNumber)}
                        aria-current={
                          pageNumber === currentPage ? "page" : undefined
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                >
                  صفحه بعد
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
