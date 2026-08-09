import DashboardProfileTrigger from "../DashboardProfileTrigger/DashboardProfileTrigger";
import "./DashboardProfileMenu.css";

function DashboardProfileMenu({
  profile,
  open,
  onOpenChange,
  onOpenProfile,
  onEditProfile,
  onLogout,
  onBeforeOpen,
}) {
  const primary = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const roleLabel = profile.level || profile.role || "کاربر";

  return (
    <div className="innovator-dashboard__profile-menu dashboard-profile-menu">
      <DashboardProfileTrigger
        primary={primary}
        secondary={`نوع کاربر: ${roleLabel}`}
        avatarSrc={profile.avatarPreview}
        avatarAlt={profile.fullName || "پروفایل کاربر"}
        fallback={profile.avatarLetter || profile.firstName?.[0] || profile.fullName?.[0] || "ف"}
        expanded={open}
        className="innovator-dashboard__profile-trigger"
        onClick={() => {
          onBeforeOpen?.();
          onOpenChange?.(!open);
        }}
      />

      {open && (
        <div className="innovator-dashboard__profile-dropdown dashboard-profile-menu__dropdown">
          <button type="button" onClick={onOpenProfile}>پروفایل</button>
          <button type="button" onClick={onEditProfile}>ویرایش پروفایل</button>
          <button type="button" className="innovator-dashboard__profile-logout dashboard-profile-menu__logout" onClick={onLogout}>
            خروج
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardProfileMenu;
