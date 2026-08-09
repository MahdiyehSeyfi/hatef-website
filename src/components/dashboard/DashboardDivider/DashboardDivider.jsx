import "./DashboardDivider.css";

function DashboardDivider({ className = "", ...restProps }) {
  const classes = ["dashboard-divider", className].filter(Boolean).join(" ");
  return <hr className={classes} {...restProps} />;
}

export default DashboardDivider;
