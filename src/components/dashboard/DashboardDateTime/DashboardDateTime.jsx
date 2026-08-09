import { useEffect, useState } from "react";

function DashboardDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const dateText = now.toLocaleDateString("fa-IR-u-ca-persian", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeText = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="innovator-dashboard__date-time">
      <span>تاریخ امروز</span>
      <strong>{dateText}</strong>
      <small>ساعت {timeText}</small>
    </div>
  );
}

export default DashboardDateTime;
