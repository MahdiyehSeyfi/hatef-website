import "./DashboardTabs.css";

function DashboardTabs({
  items,
  value,
  onChange,
  ariaLabel = "تب‌های داشبورد",
  className = "",
}) {
  const classes = ["dashboard-tabs", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            className={`dashboard-tabs__item ${isActive ? "is-active" : ""}`}
            onClick={() => {
              if (!item.disabled) onChange(item.value);
            }}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className="dashboard-tabs__count">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default DashboardTabs;
