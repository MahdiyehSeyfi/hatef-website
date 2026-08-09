import Card from "../../ui/Card/Card";
import "./DashboardPanel.css";

function DashboardPanel({
  as = "section",
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  className = "",
  ...restProps
}) {
  const classes = [
    "dashboard-panel",
    `dashboard-panel--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      as={as}
      padding={padding}
      interactive={interactive}
      className={classes}
      {...restProps}
    >
      {children}
    </Card>
  );
}

export default DashboardPanel;
