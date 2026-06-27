import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import NewsSidebar from "../../components/news/NewsSidebar";
import {
  getNewsItemById,
  getNewsPreviewItem,
  incrementNewsViews,
  NEWS_UPDATED_EVENT,
} from "../../services/newsService";
import "./NewsDetailsPage.css";

function sanitizeNewsHtml(value = "") {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/href=("|')\s*javascript:[\s\S]*?\1/gi, 'href="#"');
}

function NewsDetailsPage() {
  const { newsId } = useParams();
  const location = useLocation();
  const isCommitteePreview =
    new URLSearchParams(location.search).get("preview") === "committee";
  const [copyStatus, setCopyStatus] = useState("");

  const readCurrentNewsItem = () => {
    if (isCommitteePreview && String(newsId || "") === "preview") {
      return getNewsPreviewItem();
    }

    return getNewsItemById(newsId, {
      includeDrafts: isCommitteePreview,
      includePreview: isCommitteePreview,
    });
  };

  const [newsItem, setNewsItem] = useState(readCurrentNewsItem);

  useEffect(() => {
    window.scrollTo(0, 0);

    const refreshNewsItem = () => {
      const currentNewsItem = readCurrentNewsItem();

      if (!currentNewsItem) {
        setNewsItem(null);
        return;
      }

      setNewsItem(currentNewsItem);
    };

    const currentNewsItem = readCurrentNewsItem();

    if (!currentNewsItem) {
      setNewsItem(null);
      return undefined;
    }

    if (isCommitteePreview) {
      setNewsItem(currentNewsItem);
    } else {
      setNewsItem(incrementNewsViews(newsId) || currentNewsItem);
    }

    window.addEventListener(NEWS_UPDATED_EVENT, refreshNewsItem);
    window.addEventListener("storage", refreshNewsItem);

    return () => {
      window.removeEventListener(NEWS_UPDATED_EVENT, refreshNewsItem);
      window.removeEventListener("storage", refreshNewsItem);
    };
  }, [newsId, location.search]);

  const newsHtml = useMemo(
    () => sanitizeNewsHtml(newsItem?.contentHtml || ""),
    [newsItem?.contentHtml],
  );

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
            <div className="news-article__title-row">
              <div>
                <span>{newsItem.category || "اخبار و اطلاع‌رسانی"}</span>
                {newsItem.isImportant && <strong>خبر مهم</strong>}
              </div>
              <h1>{newsItem.title}</h1>
            </div>

            <img
              className="news-article__image"
              src={newsItem.image}
              alt={newsItem.title}
            />

            <div className="news-article__meta">
              <div>
                <span>
                  تاریخ انتشار: {newsItem.date || newsItem.publishedAt}
                </span>
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
              {newsHtml ? (
                <div
                  className="news-article__rich-content"
                  dangerouslySetInnerHTML={{ __html: newsHtml }}
                />
              ) : (
                newsItem.body.map((paragraph, index) => (
                  <p key={`${newsItem.id}-${index}`}>{paragraph}</p>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default NewsDetailsPage;
