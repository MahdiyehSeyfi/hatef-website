import Badge from "../../ui/Badge/Badge";
import { getDashboardStatusTone } from "./dashboardStatusTones";

function DashboardStatusBadge({
  status,
  children,
  tone,
  size = "sm",
  className = "",
  ...restProps
}) {
  const resolvedTone = tone || getDashboardStatusTone(status);

  return (
    <Badge tone={resolvedTone} size={size} className={className} {...restProps}>
      {children ?? status}
    </Badge>
  );
}

export default DashboardStatusBadge;
