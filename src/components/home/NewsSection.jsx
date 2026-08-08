import { useEffect, useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import ViewAllButton from "../common/ViewAllButton";
import SectionHeader from "../ui/SectionHeader/SectionHeader";

import {
  getLatestPublicNewsItems,
  NEWS_UPDATED_EVENT,
} from "../../services/newsService";

import "./NewsSection.css";

const SMALL_NEWS_TITLE_MAX_LENGTH = 42;

function truncateText(value = "", maxLength = SMALL_NEWS_TITLE_MAX_LENGTH) {
  const normalizedValue = String(value || "").trim();
  const characters = Array.from(normalizedValue);

  if (characters.length <= maxLength) {
    return normalizedValue;
  }

  return `${characters.slice(0, maxLength).join("").trim()}...`;
}

function getNewsImage(newsItem) {
  return newsItem?.image || bannerImage;
}

function getNewsSummary(newsItem) {
  return (
    newsItem?.summary || newsItem?.description || "خلاصه خبر در دسترس نیست."
  );
}

function NewsSection() {
  const [latestNewsItems, setLatestNewsItems] = useState(() =>
    getLatestPublicNewsItems(5),
  );

  useEffect(() => {
    const refreshNewsItems = () => {
      setLatestNewsItems(getLatestPublicNewsItems(5));
    };

    window.addEventListener(NEWS_UPDATED_EVENT, refreshNewsItems);
    window.addEventListener("storage", refreshNewsItems);

    return () => {
      window.removeEventListener(NEWS_UPDATED_EVENT, refreshNewsItems);
      window.removeEventListener("storage", refreshNewsItems);
    };
  }, []);

  const featuredNews = latestNewsItems[0];
  const sideNewsItems = latestNewsItems.slice(1, 5);

  if (!featuredNews) {
    return null;
  }

  return (
    <section className="news-section" id="news">
      <div className="container">
        <SectionHeader
          title="آخرین اخبار و رویدادها"
          className="news-section__heading"
        />

        <div className="news-section__content">
          <article className="featured-news">
            <Link
              to={`/news/${featuredNews.id}`}
              className="featured-news__media"
            >
              <img
                className="featured-news__image"
                src={getNewsImage(featuredNews)}
                alt={featuredNews.title}
              />

              <div className="featured-news__overlay">
                <span className="featured-news__eyebrow">
                  {featuredNews.category || "آخرین خبر هاتف"}
                </span>

                <h3>{featuredNews.title}</h3>
              </div>
            </Link>
          </article>

          <div className="news-section__side">
            <div className="news-section__list">
              {sideNewsItems.map((item) => (
                <article className="news-list-item" key={item.id}>
                  <Link
                    to={`/news/${item.id}`}
                    className="news-list-item__image-link"
                  >
                    <img
                      className="news-list-item__image"
                      src={getNewsImage(item)}
                      alt={item.title}
                    />
                  </Link>

                  <div className="news-list-item__content">
                    <Link
                      to={`/news/${item.id}`}
                      className="news-list-item__title"
                      title={item.title}
                    >
                      {truncateText(item.title)}
                    </Link>

                    <p>{getNewsSummary(item)}</p>

                    <div className="news-list-item__meta">
                      <span>
                        {item.publishedAt || item.date || item.createdAt}
                      </span>

                      <Link
                        to={`/news/${item.id}`}
                        className="news-list-item__more"
                      >
                        ادامه مطلب
                        <span aria-hidden="true">←</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="news-section__footer">
              <ViewAllButton to="/news" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsSection;
