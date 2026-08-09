import { useState } from "react";

import Input from "../../ui/Input/Input";
import "./DashboardFAQ.css";

function DashboardFAQ({
  items = [],
  eyebrow = "سوالات متداول",
  title = "راهنمای سریع استفاده از داشبورد",
  description = "پاسخ سوالات پرتکرار درباره فراخوان‌ها، طرح‌ها، وظایف، درخواست‌ها و پیام‌های سامانه.",
}) {
  const categories = ["همه", ...new Set(items.map((item) => item.category))];
  const [activeCategory, setActiveCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [openQuestionId, setOpenQuestionId] = useState(items[0]?.id || null);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "همه" || item.category === activeCategory;
    const matchesSearch =
      item.question.includes(searchTerm) || item.answer.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="faq-panel dashboard-faq">
      <div className="faq-panel__panel dashboard-faq__panel">
        <div className="faq-panel__panel-header">
          <div>
            <span>{eyebrow}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>

        <div className="faq-panel__tools">
          <label>
            <span>جست‌وجو در سوالات</span>
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="عبارت موردنظر را وارد کنید..."
            />
          </label>

          <div
            className="faq-panel__categories"
            role="tablist"
            aria-label="دسته‌بندی سوالات متداول"
          >
            {categories.map((category) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                key={category}
                className={
                  activeCategory === category
                    ? "faq-panel__category--active"
                    : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-panel__list">
          {filteredItems.map((item) => {
            const isOpen = openQuestionId === item.id;

            return (
              <article
                className={`faq-panel__item ${
                  isOpen ? "faq-panel__item--open" : ""
                }`}
                key={item.id}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenQuestionId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  aria-expanded={isOpen}
                >
                  <span>{item.category}</span>
                  <strong>{item.question}</strong>
                  <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                </button>

                {isOpen ? <p>{item.answer}</p> : null}
              </article>
            );
          })}

          {filteredItems.length === 0 ? (
            <div className="faq-panel__empty">نتیجه‌ای پیدا نشد.</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default DashboardFAQ;
