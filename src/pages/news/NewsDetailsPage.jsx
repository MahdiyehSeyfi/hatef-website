import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import NewsSidebar from "../../components/news/NewsSidebar";
import { getNewsById } from "../../data/newsData";
import "./NewsDetailsPage.css";

function NewsDetailsPage() {
  const { newsId } = useParams();
  const [copyStatus, setCopyStatus] = useState("");

  const newsItem = getNewsById(newsId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [newsId]);

  const copyNewsLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("لینک کپی شد.");
    } catch {
      setCopyStatus("امکان کپی خودکار لینک وجود ندارد.");
    }
  };

  if (!newsItem) {
    return (
      <div className="news-details-page">
        <div className="news-details-page__not-found">
          <h1>خبر موردنظر پیدا نشد</h1>
          <Link to="/news">بازگشت به اخبار</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="news-details-page">
      <div className="news-details-page__container">
        <nav className="news-details-page__breadcrumb" aria-label="مسیر صفحه">
          <Link to="/">صفحه اصلی</Link>
          <span>/</span>
          <Link to="/news">اخبار و اطلاع‌رسانی</Link>
          <span>/</span>
          <span>{newsItem.title}</span>
        </nav>

        <div className="news-details-page__layout">
          <NewsSidebar />

          <article className="news-article">
            <h1>{newsItem.title}</h1>

            <img
              className="news-article__image"
              src={newsItem.image}
              alt={newsItem.title}
            />

            <div className="news-article__meta">
              <div>
                <span>تاریخ انتشار: {newsItem.date}</span>
                <span>بازدید: {newsItem.views}</span>
              </div>

              <button type="button" onClick={copyNewsLink}>
                کپی لینک خبر
              </button>
            </div>

            {copyStatus && (
              <p className="news-article__copy-status">{copyStatus}</p>
            )}

            <div className="news-article__content">
              {newsItem.body.map((paragraph, index) => (
                <p key={`${newsItem.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default NewsDetailsPage;
