import { useState } from "react";

import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import DashboardNotice from "../DashboardNotice/DashboardNotice";
import DashboardPanel from "../DashboardPanel/DashboardPanel";
import "./DashboardProfile.css";

function ProfileAvatar({ profile, size = "normal" }) {
  return profile.avatarPreview ? (
    <img
      className={`profile-panel__avatar profile-panel__avatar--${size}`}
      src={profile.avatarPreview}
      alt={`${profile.firstName} ${profile.lastName}`}
    />
  ) : (
    <span className={`profile-panel__avatar profile-panel__avatar--${size}`}>
      {profile.avatarLetter || profile.firstName?.[0] || "ف"}
    </span>
  );
}

function DashboardProfileView({ profile, onEdit }) {
  return (
    <section className="profile-panel">
      <DashboardPanel className="profile-panel__card profile-panel__hero-card" padding="md">
        <ProfileAvatar profile={profile} size="large" />

        <div>
          <span>پروفایل کاربری</span>
          <h3>
            {profile.fullName ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
          </h3>
          <p>{profile.level || profile.role}</p>
        </div>

        <Button type="button" variant="outline" size="sm" width="content" onClick={onEdit}>
          ویرایش پروفایل
        </Button>
      </DashboardPanel>

      <div className="profile-panel__info-grid">
        {[
          ["نام و نام خانوادگی", profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim()],
          ["شماره موبایل", profile.mobile || profile.phone],
          ["ایمیل", profile.email],
          ["سطح کاربری", profile.level || profile.role],
          ["سابقه عضویت", `عضو از سال ${profile.memberSince} - به مدت ${profile.membershipDuration}`],
        ].map(([label, value]) => (
          <DashboardPanel as="article" padding="sm" variant="subtle" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </DashboardPanel>
        ))}
      </div>
    </section>
  );
}

function DashboardProfileEdit({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("avatarPreview", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setMessage("رمز عبور جدید و تکرار آن یکسان نیست.");
      return;
    }

    const nextProfile = {
      ...formData,
      fullName:
        formData.fullName ||
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
      avatarLetter:
        formData.firstName?.[0] ||
        formData.fullName?.[0] ||
        profile.avatarLetter ||
        "ف",
    };

    try {
      const savedProfile = onSave(nextProfile, passwordData);
      setFormData(savedProfile || nextProfile);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(
        passwordData.newPassword
          ? "اطلاعات پروفایل و رمز عبور با موفقیت ذخیره شد."
          : "تغییرات پروفایل با موفقیت ذخیره شد.",
      );
    } catch (error) {
      setMessage(error?.message || "ذخیره تغییرات با خطا روبه‌رو شد.");
    }
  };

  return (
    <section className="profile-panel">
      <DashboardPanel as="form" className="profile-panel__edit-card" padding="md" onSubmit={handleSubmit}>
        <div className="profile-panel__edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات کاربری و رمز عبور</h3>
          </div>

          <Button type="button" variant="outline" size="sm" width="content" onClick={onCancel}>
            بازگشت به پروفایل
          </Button>
        </div>

        <div className="profile-panel__avatar-edit">
          <ProfileAvatar profile={formData} size="large" />
          <label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            تغییر تصویر پروفایل
          </label>
        </div>

        <div className="profile-panel__form-grid">
          <label>
            <span>نام</span>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </label>

          <label>
            <span>نام خانوادگی</span>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </label>

          <label>
            <span>شماره موبایل</span>
            <Input
              type="text"
              value={formData.mobile || formData.phone || ""}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </label>

          <label>
            <span>ایمیل</span>
            <Input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
        </div>

        <div className="profile-panel__password-box">
          <div>
            <span>تغییر رمز عبور</span>
            <p>در صورت نیاز، رمز فعلی و رمز جدید را وارد کنید.</p>
          </div>

          <div className="profile-panel__form-grid">
            <label>
              <span>رمز عبور فعلی</span>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>رمز عبور جدید</span>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>تکرار رمز عبور جدید</span>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div className="profile-panel__form-actions">
          <Button type="button" variant="outline" size="sm" width="content" onClick={onCancel}>
            انصراف
          </Button>
          <Button type="submit" variant="primary" size="sm" width="content">ذخیره تغییرات</Button>
        </div>

        {message && (
          <DashboardNotice tone={message.includes("خطا") || message.includes("یکسان نیست") ? "danger" : "success"}>
            {message}
          </DashboardNotice>
        )}
      </DashboardPanel>
    </section>
  );
}

export { DashboardProfileEdit, DashboardProfileView, ProfileAvatar };
