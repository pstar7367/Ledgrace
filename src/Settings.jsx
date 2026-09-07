import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  Download,
  Grid2X2,
  Languages,
  Monitor,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { changePasswordRequest, getAccountsRequest, getNotificationsRequest, getProfileRequest, getSavingsGoalsRequest, getTransactionsRequest, updateProfileRequest } from "./authApi.js";
import { money, refreshExchangeRates } from "./preferences.js";
import { applyLanguage, getLanguageCode, getStoredLanguage, SUPPORTED_LANGUAGES, translate } from "./translation.js";

const DEFAULT_PREFERENCES = {
  theme: "Light",
  notifications: "Manage",
  currency: "NGN",
  numberFormat: "1,234.56",
  weekStartsOn: "Monday",
  language: "English",
  budgetPeriod: "Monthly",
  dateFormat: "MMM DD, YYYY",
  dashboardView: "Dashboard Overview",
  budgetAlerts: true,
  roundOff: "Nearest Naira (N1)",
  autoCategorize: true,
  suggestedInsights: true,
  hapticFeedback: false,
  animations: true,
  offlineAccess: true,
};

const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;
const LANGUAGE_LABEL_KEYS = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((language) => [language, `language_${language.toLowerCase()}`]),
);
const TIME_ZONE_OPTIONS = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC", "Africa/Lagos", "America/New_York", "Europe/London", "Asia/Kolkata"];
const CURRENCY_OPTIONS = [
  ["NGN", "currency_ngn"],
  ["USD", "currency_usd"],
  ["GBP", "currency_gbp"],
  ["EUR", "currency_eur"],
];
const TABS = ["General", "Account", "Notifications", "Privacy", "Connect & Sync", "Data & Export"];

function applyTheme(theme) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "Dark" || (theme === "System" && prefersDark);
  document.documentElement.dataset.appTheme = isDark ? "dark" : "light";
  document.documentElement.dataset.profileTheme = isDark ? "dim" : "light";
}

function downloadData(data) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  link.download = "ledgrace-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function SettingsCard({ title, description, children, className = "" }) {
  return <section className={`settings-card ${className}`}><div className="settings-card-heading"><div><h2>{title}</h2><p>{description}</p></div></div>{children}</section>;
}

function SettingsRow({ icon: Icon, label, detail, children }) {
  return <div className="settings-row"><span className="settings-row-icon"><Icon size={14} /></span><div className="settings-row-copy"><b>{label}</b><small>{detail}</small></div><div className="settings-row-control">{children}</div></div>;
}

function SettingsAction({ children, onClick, danger = false }) {
  return <button className={`settings-action ${danger ? "danger" : ""}`} type="button" onClick={onClick}>{children}<ChevronRight size={13} /></button>;
}

function Toggle({ checked, onChange }) {
  return <button className={`settings-toggle ${checked ? "on" : ""}`} type="button" role="switch" aria-checked={checked} onClick={onChange}><span /></button>;
}

function SelectControl({ value, onChange, children }) {
  return <select className="settings-select" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}

function AccountSettings({ profile, onProfileUpdated, onPreferencesSaved, setStatus, t }) {
  const [form, setForm] = useState({
    dateOfBirth: profile.dateOfBirth || "",
    language: profile.language || "English",
    timeZone: profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const currentPreferences = JSON.parse(localStorage.getItem("ledgrace_profile_preferences") || "{}");
      const { data } = await updateProfileRequest({
        ...form,
        preferences: { ...currentPreferences, language: form.language },
      });
      onProfileUpdated(data.user);
      onPreferencesSaved(data.user);
      setStatus(t("account_updated"));
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("unable_update_account"));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await changePasswordRequest(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStatus(t("password_changed"));
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || t("unable_change_password"));
    } finally {
      setPasswordSaving(false);
    }
  };

  return <SettingsCard title={t("account")} description={t("manage_account")}>
    <form className="settings-account-form" onSubmit={save}>
      <label>{t("date_of_birth")}<input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} /></label>
      <label>{t("language")}<SelectControl value={form.language} onChange={(value) => setForm({ ...form, language: value })}>{LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{t(LANGUAGE_LABEL_KEYS[language])}</option>)}</SelectControl></label>
      <label>{t("time_zone")}<SelectControl value={form.timeZone} onChange={(value) => setForm({ ...form, timeZone: value })}><option value="">{t("select_time_zone")}</option>{TIME_ZONE_OPTIONS.map((timeZone) => <option key={timeZone}>{timeZone}</option>)}</SelectControl></label>
      {error && <p className="settings-form-error" role="alert">{error}</p>}
      <button className="settings-save-button" type="submit" disabled={saving}>{saving ? t("saving") : t("save_account_details")}</button>
    </form>
    <div className="settings-row"><span className="settings-row-icon"><ShieldCheck size={14} /></span><div className="settings-row-copy"><b>{t("account_status")}</b><small>{t("manage_account")}</small></div><div className="settings-row-control"><strong className="settings-positive">{profile.verified ? t("active") : t("pending")}</strong></div></div>
    <section className="settings-account-section"><h3>{t("change_password")}</h3><p>{t("use_current_password")}</p><form className="settings-password-form" onSubmit={savePassword}><label>{t("current_password")}<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" /></label><label>{t("new_password")}<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength={8} autoComplete="new-password" /></label><label>{t("confirm_new_password")}<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength={8} autoComplete="new-password" /></label>{passwordError && <p className="settings-form-error" role="alert">{passwordError}</p>}<button className="settings-save-button" type="submit" disabled={passwordSaving}>{passwordSaving ? t("saving") : t("save_password")}</button></form></section>
    <section className="settings-account-section"><h3>{t("login_activity")}</h3><p>{t("recent_signins")}</p>{profile.loginActivity?.length ? <div className="settings-login-list">{profile.loginActivity.slice(0, 5).map((activity, index) => <div className="settings-login-item" key={`${activity.at}-${index}`}><b>{index === 0 ? t("current_signin") : t("previous_signin")}</b><span>{new Date(activity.at).toLocaleString()}</span><small>{activity.ip || t("ip_unavailable")}</small></div>)}</div> : <div className="settings-login-item"><b>{t("current_session")}</b><span>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : t("no_recent_signin")}</span></div>}</section>
  </SettingsCard>;
}

function GeneralSettings({ preferences, updatePreference, updateToggle, categories, profile, goals, accounts, transactions, totalSaved, selectedLanguage, t }) {
  const formatMoney = money.format;
  return <div className="settings-general-layout">
    <div className="settings-main-column">
      <SettingsCard title={t("general_settings_title")} description={t("general_settings_desc")}>
        <SettingsRow icon={Palette} label={t("theme")} detail={t("choose_appearance")}><div className="settings-segmented">{["Light", "Dark", "System"].map((theme) => <button className={preferences.theme === theme ? "active" : ""} type="button" key={theme} onClick={() => updatePreference("theme", theme)}>{theme === "Light" ? <span>☼</span> : theme === "Dark" ? <span>☾</span> : <Monitor size={12} />}{t(theme.toLowerCase())}</button>)}</div></SettingsRow>
        <SettingsRow icon={CircleDollarSign} label={t("currency")} detail={t("select_currency")}><SelectControl value={preferences.currency} onChange={(value) => updatePreference("currency", value)}>{CURRENCY_OPTIONS.map(([value, label]) => <option value={value} key={value}>{t(label)}</option>)}</SelectControl></SettingsRow>
        <SettingsRow icon={Languages} label={t("language")} detail={t("choose_language")}><SelectControl value={preferences.language} onChange={(value) => updatePreference("language", value)}>{LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{t(LANGUAGE_LABEL_KEYS[language])}</option>)}</SelectControl></SettingsRow>
        <SettingsRow icon={CalendarDays} label={t("date_format")} detail={t("select_date_format")}><SelectControl value={preferences.dateFormat} onChange={(value) => updatePreference("dateFormat", value)}><option>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></SelectControl></SettingsRow>
        <SettingsRow icon={CalendarDays} label={t("week_starts")} detail={t("choose_week_start")}><SelectControl value={preferences.weekStartsOn} onChange={(value) => updatePreference("weekStartsOn", value)}><option value="Monday">{t("monday")}</option><option value="Sunday">{t("sunday")}</option></SelectControl></SettingsRow>
        <SettingsRow icon={Grid2X2} label={t("default_dashboard")} detail={t("choose_default_dashboard")}><SelectControl value={preferences.dashboardView} onChange={(value) => updatePreference("dashboardView", value)}><option value="Dashboard Overview">{t("dashboard_overview")}</option><option value="Recent Transactions">{t("recent_transactions")}</option><option value="Financial Summary">{t("financial_summary")}</option></SelectControl></SettingsRow>
      </SettingsCard>
      <SettingsCard title={t("display_preferences_title")} description={t("display_preferences_desc")}>
        <SettingsRow icon={Grid2X2} label={t("compact_mode")} detail={t("compact_mode_detail")}><Toggle checked={preferences.compactMode} onChange={() => updateToggle("compactMode")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label={t("quick_stats")} detail={t("quick_stats_detail")}><Toggle checked={preferences.showQuickStats !== false} onChange={() => updateToggle("showQuickStats")} /></SettingsRow>
        <SettingsRow icon={SettingsIcon} label={t("show_tooltips")} detail={t("tooltips_detail")}><Toggle checked={preferences.showTooltips !== false} onChange={() => updateToggle("showTooltips")} /></SettingsRow>
      </SettingsCard>
    </div>
    <div className="settings-main-column">
      <SettingsCard title={t("financial_preferences_title")} description={t("financial_preferences_desc")}>
        <SettingsRow icon={CalendarDays} label={t("default_budget_period")} detail={t("budget_period_detail")}><SelectControl value={preferences.budgetPeriod} onChange={(value) => updatePreference("budgetPeriod", value)}><option value="Monthly">{t("monthly")}</option><option value="Weekly">{t("weekly")}</option><option value="Yearly">{t("yearly")}</option></SelectControl></SettingsRow>
        <SettingsRow icon={WalletCards} label={t("income_expense_categories")} detail={t("categories_from_transactions", { count: categories.length })}><SettingsAction onClick={() => updatePreference("categoryNotice", Date.now())}>{t("manage_categories")}</SettingsAction></SettingsRow>
        <SettingsRow icon={Target} label={t("savings_goal_settings")} detail={t("active_goals", { count: goals.length })}><SettingsAction onClick={() => window.location.assign("/savings-goals")}>{t("manage_goals")}</SettingsAction></SettingsRow>
        <SettingsRow icon={Bell} label={t("budget_alerts")} detail={t("budget_alerts_detail")}><Toggle checked={preferences.budgetAlerts !== false} onChange={() => updateToggle("budgetAlerts")} /></SettingsRow>
        <SettingsRow icon={CircleDollarSign} label={t("round_off_transactions")} detail={t("round_off_detail")}><SelectControl value={preferences.roundOff} onChange={(value) => updatePreference("roundOff", value)}><option value="Nearest Naira (N1)">{t("nearest_naira")}</option><option value="Nearest Ten (N10)">{t("nearest_ten")}</option><option value="Do not round">{t("do_not_round")}</option></SelectControl></SettingsRow>
      </SettingsCard>
      <SettingsCard title={t("app_preferences_title")} description={t("app_preferences_desc")}>
        <SettingsRow icon={Grid2X2} label={t("auto_categorize")} detail={t("auto_categorize_detail")}><Toggle checked={preferences.autoCategorize !== false} onChange={() => updateToggle("autoCategorize")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label={t("suggested_insights")} detail={t("suggested_insights_detail")}><Toggle checked={preferences.suggestedInsights !== false} onChange={() => updateToggle("suggestedInsights")} /></SettingsRow>
        <SettingsRow icon={Bell} label={t("haptic_feedback")} detail={t("haptic_feedback_detail")}><Toggle checked={preferences.hapticFeedback === true} onChange={() => updateToggle("hapticFeedback")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label={t("animations")} detail={t("animations_detail")}><Toggle checked={preferences.animations !== false} onChange={() => updateToggle("animations")} /></SettingsRow>
        <SettingsRow icon={Cloud} label={t("offline_access")} detail={t("offline_access_detail")}><Toggle checked={preferences.offlineAccess !== false} onChange={() => updateToggle("offlineAccess")} /></SettingsRow>
      </SettingsCard>
    </div>
    <aside className="settings-summary-column">
      <SettingsCard title={t("account_summary_title")} description=""><div className="settings-account-avatar"><UserRound size={28} /></div><h3 className="settings-account-name">{profile.firstName || t("account")} {profile.lastName || ""}</h3><span className="settings-plan-badge">{profile.subscriptionPlan === "premium" || profile.isPremium ? t("premium_plan") : t("free_plan")}</span><div className="settings-summary-list"><div><b>{t("member_since")}</b><strong>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(getLanguageCode(selectedLanguage), { month: "short", day: "numeric", year: "numeric" }) : t("not_available")}</strong></div><div><b>{t("account_status")}</b><strong className="settings-positive">{profile.verified ? t("active") : t("pending")}</strong></div><div><b>{t("plan")}</b><strong>{profile.subscriptionPlan === "premium" ? t("premium") : t("free")}</strong></div><div><b>{t("tracked_accounts")}</b><strong>{accounts.length}</strong></div><div><b>{t("saved")}</b><strong>{formatMoney(totalSaved)}</strong></div><div><b>{t("transactions")}</b><strong>{transactions.length}</strong></div></div><SettingsAction onClick={() => window.location.assign("/profile")}>{t("manage_profile")}</SettingsAction></SettingsCard>
      <SettingsCard title={t("quick_actions")} description=""><button className="settings-quick-action" type="button" onClick={() => window.location.assign("/notifications")}><Bell size={14} /> {t("manage_notifications")} <ChevronRight size={13} /></button><button className="settings-quick-action" type="button" onClick={() => downloadData({ profile, accounts, goals, transactions })}><Download size={14} /> {t("download_my_data")} <ChevronRight size={13} /></button></SettingsCard>
    </aside>
  </div>;
}

const settingsStyles = `
  .settings-page { width:100%; max-width:1180px; color:#102348; padding:2px 0 30px; }
  .settings-page-header { display:flex; align-items:center; margin-bottom:12px; }.settings-page-header h1 { display:flex; align-items:center; gap:8px; margin:0; font:800 23px/1.2 Manrope,sans-serif; }.settings-page-header h1 svg { color:#1458ed; }.settings-page-header p { margin:4px 0 0; color:#60728b; font-size:10px; }
  .settings-tabs { display:flex; gap:20px; overflow-x:auto; border-bottom:1px solid #e5ebf4; margin-bottom:14px; }.settings-tabs button { flex:0 0 auto; min-height:34px; padding:0 1px 8px; border:0; border-bottom:2px solid transparent; background:transparent; color:#536986; font-size:9px; font-weight:800; cursor:pointer; }.settings-tabs button.active { color:#1458ed; border-bottom-color:#1458ed; }
  .settings-general-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) 222px; gap:12px; align-items:start; }.settings-main-column,.settings-summary-column { display:grid; gap:12px; }.settings-card { min-width:0; padding:13px; border:1px solid #e3eaf4; border-radius:9px; background:#fff; box-shadow:0 7px 18px rgba(25,61,111,.035); }.settings-card-heading { margin-bottom:8px; }.settings-card h2 { margin:0; color:#102348; font-size:11px; }.settings-card-heading p { margin:2px 0 0; color:#60728b; font-size:8px; line-height:1.4; }.settings-row { display:grid; grid-template-columns:25px minmax(0,1fr) auto; align-items:center; gap:8px; min-height:43px; border-top:1px solid #edf1f6; }.settings-row-icon { display:grid; place-items:center; width:24px; height:24px; border-radius:7px; color:#1458ed; background:#edf4ff; }.settings-row-copy { min-width:0; }.settings-row-copy b { display:block; color:#294363; font-size:9px; }.settings-row-copy small { display:block; margin-top:2px; color:#60728b; font-size:7px; line-height:1.25; }.settings-row-control { display:flex; align-items:center; justify-content:flex-end; min-width:0; }.settings-row-control > span,.settings-summary-list strong { color:#294363; font-size:8px; font-weight:800; }.settings-select { width:122px; min-height:26px; padding:0 5px; border:1px solid #dce5f1; border-radius:5px; color:#526984; background:#fff; font-size:8px; outline:0; }.settings-segmented { display:flex; border:1px solid #c9d9f1; border-radius:5px; overflow:hidden; }.settings-segmented button { display:flex; align-items:center; gap:3px; min-height:25px; padding:0 6px; border:0; border-right:1px solid #dce5f1; background:#fff; color:#526984; font-size:8px; cursor:pointer; }.settings-segmented button:last-child { border-right:0; }.settings-segmented button.active { color:#1458ed; background:#edf4ff; }.settings-action { display:inline-flex; align-items:center; gap:2px; min-height:25px; padding:0 5px; border:0; background:transparent; color:#294363; font-size:8px; font-weight:800; white-space:nowrap; cursor:pointer; }.settings-action.danger { color:#df3747; }.settings-positive { color:#00a978 !important; }.settings-toggle { position:relative; width:28px; height:16px; padding:2px; border:0; border-radius:999px; background:#d6deeb; cursor:pointer; }.settings-toggle span { display:block; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(16,35,72,.2); transition:transform .18s ease; }.settings-toggle.on { background:#1458ed; }.settings-toggle.on span { transform:translateX(12px); }.settings-account-avatar { display:grid; place-items:center; width:48px; height:48px; margin:5px auto 7px; border-radius:50%; color:#1458ed; background:#edf4ff; }.settings-account-name { margin:0; color:#102348; text-align:center; font-size:12px; }.settings-plan-badge { display:block; width:max-content; margin:5px auto 12px; padding:3px 7px; border-radius:999px; color:#1458ed; background:#edf4ff; font-size:8px; font-weight:800; }.settings-summary-list { display:grid; gap:0; margin-bottom:8px; }.settings-summary-list div { display:flex; justify-content:space-between; gap:7px; padding:7px 0; border-top:1px solid #edf1f6; }.settings-summary-list b { color:#526984; font-size:8px; }.settings-summary-list strong { text-align:right; }.settings-summary-column .settings-action { width:100%; justify-content:center; min-height:28px; border:1px solid #1458ed; border-radius:5px; color:#1458ed; }.settings-quick-action { display:flex; align-items:center; gap:7px; width:100%; min-height:34px; padding:0; border:0; border-top:1px solid #edf1f6; background:transparent; color:#294363; font-size:9px; text-align:left; cursor:pointer; }.settings-quick-action svg:last-child { margin-left:auto; color:#7790ae; }.settings-status { display:flex; align-items:center; gap:7px; margin:0 0 12px; padding:8px 11px; border-radius:6px; color:#16734c; background:#eafaf2; font-size:9px; }.settings-status-close { display:grid; place-items:center; margin-left:auto; padding:2px; border:0; background:transparent; color:#16734c; cursor:pointer; }.settings-loading { display:grid; place-items:center; min-height:260px; color:#60728b; font-size:12px; }
  .settings-page p,.settings-page small { line-height:1.4 !important; }.settings-page-header p { font-size:11px !important; }.settings-tabs button { font-size:10px !important; }.settings-card h2 { font-size:13px !important; }.settings-card-heading p { font-size:10px !important; }.settings-row-copy b { font-size:11px !important; }.settings-row-copy small { font-size:9px !important; line-height:1.25 !important; }.settings-row-control > span,.settings-summary-list strong { font-size:10px !important; }.settings-select,.settings-segmented button { font-size:10px !important; }.settings-action { font-size:10px !important; }.settings-quick-action { font-size:11px !important; }.settings-status { font-size:11px !important; }.settings-status.settings-error { color:#a62535; background:#fff0f1; }.settings-page-save { display:flex; justify-content:flex-end; margin-top:16px; padding-top:14px; border-top:1px solid #e5ebf4; }.settings-page-save button { min-height:34px; padding:0 14px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:11px; font-weight:800; cursor:pointer; }.settings-page-save button:disabled { opacity:.65; cursor:wait; }.settings-loading { font-size:13px !important; }
  .settings-account-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; padding:4px 0 12px; }.settings-account-form label { display:grid; gap:5px; color:#526984; font-size:10px; font-weight:800; }.settings-account-form input,.settings-account-form select { width:100%; min-height:35px; box-sizing:border-box; padding:0 8px; border:1px solid #dce5f1; border-radius:7px; color:#213957; background:#fff; font-size:10px; outline:0; }.settings-account-form input:focus,.settings-account-form select:focus { border-color:#1458ed; box-shadow:0 0 0 3px #eaf1ff; }.settings-form-error { grid-column:1/-1; margin:0; color:#c52d40; font-size:10px !important; }.settings-save-button { grid-column:1/-1; justify-self:end; min-height:30px; padding:0 10px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:10px; font-weight:800; cursor:pointer; }.settings-save-button:disabled { opacity:.65; cursor:wait; }
  .settings-account-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; padding:4px 0 12px; }.settings-account-form label,.settings-password-form label { display:grid; gap:5px; color:#526984; font-size:10px; font-weight:800; }.settings-account-form input,.settings-account-form select,.settings-password-form input { width:100%; min-height:35px; box-sizing:border-box; padding:0 8px; border:1px solid #dce5f1; border-radius:7px; color:#213957; background:#fff; font-size:10px; outline:0; }.settings-account-form input:focus,.settings-account-form select:focus,.settings-password-form input:focus { border-color:#1458ed; box-shadow:0 0 0 3px #eaf1ff; }.settings-form-error { grid-column:1/-1; margin:0; color:#c52d40; font-size:10px !important; }.settings-save-button { grid-column:1/-1; justify-self:end; min-height:30px; padding:0 10px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:10px; font-weight:800; cursor:pointer; }.settings-save-button:disabled { opacity:.65; cursor:wait; }.settings-account-section { margin-top:12px; padding-top:12px; border-top:1px solid #edf1f6; }.settings-account-section h3 { margin:0; color:#102348; font-size:12px; }.settings-account-section > p { margin:3px 0 9px; color:#60728b; font-size:10px !important; }.settings-password-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }.settings-security-control { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:9px 0; }.settings-security-control b,.settings-login-item b { display:block; color:#294363; font-size:10px; }.settings-security-control small,.settings-login-item small { display:block; margin-top:3px; color:#60728b; font-size:9px; }.settings-login-list { display:grid; gap:7px; }.settings-login-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 10px; padding:8px 9px; border:1px solid #edf1f6; border-radius:6px; }.settings-login-item span { color:#526984; font-size:9px; text-align:right; }.settings-login-item small { grid-column:1/-1; }
  @media (max-width:1050px) { .settings-general-layout { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }.settings-summary-column { grid-column:1/-1; grid-template-columns:repeat(2,minmax(0,1fr)); }.settings-summary-column .settings-card:first-child { grid-row:span 2; } }
  @media (max-width:680px) { .settings-page { padding-bottom:20px; }.settings-general-layout,.settings-summary-column,.settings-account-form,.settings-password-form { grid-template-columns:1fr; }.settings-summary-column { grid-column:auto; }.settings-summary-column .settings-card:first-child { grid-row:auto; }.settings-tabs { gap:14px; }.settings-row { grid-template-columns:25px minmax(0,1fr) auto; }.settings-select { width:105px; }.settings-segmented button { padding:0 4px; }.settings-row-copy small { max-width:150px; }.settings-login-item { grid-template-columns:1fr; }.settings-login-item span { text-align:left; } }
`;

function readPreferences() {
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem("ledgrace_profile_preferences")) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function Settings() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [activeTab, setActiveTab] = useState("General");
  const [profile, setProfile] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("ledgrace_token")));
  const [requestError, setRequestError] = useState("");
  const [status, setStatus] = useState("");
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguage());
  const t = (key, options = {}) => translate(key, selectedLanguage, options);

  useEffect(() => {
    const syncLanguage = (event) => {
      if (event.detail?.changedKey && event.detail.changedKey !== "language") return;
      const nextLanguage = event.detail?.language || getStoredLanguage();
      if (typeof nextLanguage === "string" && LANGUAGE_OPTIONS.includes(nextLanguage)) {
        setSelectedLanguage(nextLanguage);
      }
    };

    window.addEventListener("ledgrace:preferences-changed", syncLanguage);
    return () => window.removeEventListener("ledgrace:preferences-changed", syncLanguage);
  }, []);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("ledgrace_token")) {
      return () => { active = false; };
    }
    getProfileRequest()
      .then((profileResponse) => {
        if (!active) return;
        const nextProfile = profileResponse.data.user || {};
        const serverPreferences = nextProfile.preferences && typeof nextProfile.preferences === "object"
          ? nextProfile.preferences
          : {};
        const storedPreferences = JSON.parse(localStorage.getItem("ledgrace_profile_preferences") || "{}");
        const nextPreferences = {
          ...DEFAULT_PREFERENCES,
          ...serverPreferences,
          language: storedPreferences.language || serverPreferences.language || nextProfile.language || getStoredLanguage(),
        };
        setProfile(nextProfile);
        setPreferences(nextPreferences);
        setSelectedLanguage(nextPreferences.language);
        localStorage.setItem("ledgrace_profile_preferences", JSON.stringify(nextPreferences));
        localStorage.setItem("ledgrace_user", JSON.stringify({
          ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"),
          ...nextProfile,
          language: nextPreferences.language,
        }));
      })
      .catch((error) => {
        if (active) setRequestError(error.response?.data?.message || t("unable_load_settings"));
      })
      .finally(() => active && setLoading(false));

    Promise.allSettled([getAccountsRequest(), getSavingsGoalsRequest(), getTransactionsRequest(), getNotificationsRequest()])
      .then(([accountsResult, goalsResult, transactionsResult, notificationsResult]) => {
        if (!active) return;
        if (accountsResult.status === "fulfilled") setAccounts(accountsResult.value.data.accounts || []);
        if (goalsResult.status === "fulfilled") setGoals(goalsResult.value.data.goals || []);
        if (transactionsResult.status === "fulfilled") setTransactions(transactionsResult.value.data.transactions || []);
        if (notificationsResult.status === "fulfilled") setNotifications(notificationsResult.value.data.notifications || []);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  const categories = useMemo(() => Array.from(new Set(transactions.map((item) => item.category).filter(Boolean))), [transactions]);
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const totalSaved = Math.max(
    transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0) -
    transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    0,
  );

  const updatePreference = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem("ledgrace_profile_preferences", JSON.stringify(next));
    setRequestError("");
    if (key === "theme") applyTheme(value);
    if (key === "language") {
      setSelectedLanguage(value);
      applyLanguage(value, { announce: false });
      setProfile((current) => ({ ...current, language: value, preferences: next }));
      const profile = JSON.parse(localStorage.getItem("ledgrace_user") || "{}");
      if (profile && typeof profile === "object") {
        const nextProfile = { ...profile, language: value };
        localStorage.setItem("ledgrace_user", JSON.stringify(nextProfile));
      }

      // Language is applied locally first so the interface responds instantly,
      // then persisted on the existing authenticated profile for the next login.
      void Promise.resolve()
        .then(() => updateProfileRequest({ language: value, preferences: next }))
        .then(({ data }) => {
          const savedProfile = data.user || {};
          localStorage.setItem("ledgrace_user", JSON.stringify({
            ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"),
            ...savedProfile,
            language: savedProfile.language || value,
          }));
        })
        .catch(() => {
          // The local preference remains available and Save Changes can retry.
        });
    }
    if (key === "currency") refreshExchangeRates();
    window.dispatchEvent(new CustomEvent("ledgrace:preferences-changed", { detail: { ...next, changedKey: key } }));
    setStatus("");
  };

  const saveChanges = async () => {
    setSavingPreferences(true);
    setRequestError("");
    try {
      const { data } = await updateProfileRequest({ preferences });
      const savedProfile = data.user || {};
      const savedPreferences = {
        ...preferences,
        ...(savedProfile.preferences || {}),
        language: savedProfile.language || preferences.language,
      };
      setPreferences(savedPreferences);
      setProfile((current) => ({ ...current, ...savedProfile, preferences: savedPreferences }));
      setSelectedLanguage(savedPreferences.language);
      localStorage.setItem("ledgrace_profile_preferences", JSON.stringify(savedPreferences));
      localStorage.setItem("ledgrace_user", JSON.stringify({
        ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"),
        ...savedProfile,
        language: savedPreferences.language,
      }));
      setStatus(t("settings_updated"));
    } catch (error) {
      setRequestError(error.response?.data?.message || t("unable_save_settings"));
    } finally {
      setSavingPreferences(false);
    }
  };

  const updateToggle = (key) => updatePreference(key, !preferences[key]);
  const updateProfile = (nextProfile) => {
    setProfile(nextProfile);
    localStorage.setItem("ledgrace_user", JSON.stringify({ ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"), ...nextProfile }));
    window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: nextProfile }));
  };
  const navigate = (path) => window.location.assign(path);

  if (loading) return <section className="settings-page"><div className="settings-loading">{t("loading_settings")}</div></section>;

  return (
    <section className="settings-page">
      <style>{settingsStyles}</style>
      <header className="settings-page-header"><div><h1>{t("settings_title")} <SettingsIcon size={20} /></h1><p>{t("settings_tagline")}</p></div></header>
      <nav className="settings-tabs" aria-label={t("settings_sections")}>{TABS.map((tab) => <button className={activeTab === tab ? "active" : ""} type="button" key={tab} onClick={() => setActiveTab(tab)}>{tab === "General" ? t("general") : tab === "Account" ? t("account") : tab === "Notifications" ? t("notifications") : tab === "Privacy" ? t("privacy") : tab === "Connect & Sync" ? t("connect_sync") : t("data_export")}</button>)}</nav>
      {requestError && <p className="settings-status settings-error" role="alert"><span>{requestError}</span><button className="settings-status-close" type="button" onClick={() => setRequestError("")} aria-label={t("close_error_message")}><X size={14} /></button></p>}
      {status && <p className="settings-status" role="status"><Check size={13} /><span>{status}</span><button className="settings-status-close" type="button" onClick={() => setStatus("")} aria-label={t("close_status_message")}><X size={14} /></button></p>}
      {activeTab === "General" && <GeneralSettings preferences={preferences} updatePreference={updatePreference} updateToggle={updateToggle} categories={categories} profile={profile} goals={goals} accounts={accounts} transactions={transactions} totalSaved={totalSaved} selectedLanguage={selectedLanguage} t={t} />}
      {activeTab === "Account" && <AccountSettings key={`${profile.dateOfBirth}|${profile.language}|${profile.timeZone}`} profile={profile} onProfileUpdated={updateProfile} onPreferencesSaved={(savedProfile) => {
        const savedPreferences = { ...preferences, ...(savedProfile.preferences || {}), language: savedProfile.language || preferences.language };
        setPreferences(savedPreferences);
        setSelectedLanguage(savedPreferences.language);
        localStorage.setItem("ledgrace_profile_preferences", JSON.stringify(savedPreferences));
        applyLanguage(savedPreferences.language, { announce: false });
        window.dispatchEvent(new CustomEvent("ledgrace:preferences-changed", { detail: { ...savedPreferences, changedKey: "language" } }));
      }} setStatus={setStatus} t={t} />}
      {activeTab === "Notifications" && <SettingsCard title={t("notifications")} description={t("review_notification_activity")}><SettingsRow icon={Bell} label={t("unread_notifications")} detail={t("notifications_waiting")}><strong>{unreadNotifications}</strong></SettingsRow><SettingsRow icon={Bell} label={t("notification_center")} detail={t("review_notifications")}><SettingsAction onClick={() => navigate("/notifications")}>{t("open_notifications")}</SettingsAction></SettingsRow></SettingsCard>}
      {activeTab === "Privacy" && <SettingsCard title={t("privacy")} description={t("privacy_desc")}><SettingsRow icon={ShieldCheck} label={t("data_access")} detail={t("data_protected")}><span>{t("protected")}</span></SettingsRow><SettingsRow icon={Download} label={t("data_export_short")} detail={t("download_workspace_copy")}><SettingsAction onClick={() => downloadData({ profile, accounts, goals, transactions })}>{t("download_data")}</SettingsAction></SettingsRow></SettingsCard>}
      {activeTab === "Connect & Sync" && <SettingsCard title={t("connect_sync")} description={t("connect_sync")}><SettingsRow icon={Cloud} label={t("connected_accounts")} detail={t("connected_accounts_desc")}><strong>{accounts.length}</strong></SettingsRow><SettingsRow icon={RotateCcw} label={t("last_sync")} detail={t("last_sync_desc")}><span>{t("live")}</span></SettingsRow></SettingsCard>}
      {activeTab === "Data & Export" && <SettingsCard title={t("data_export")} description={t("export_workspace_desc")}><SettingsRow icon={Download} label={t("download_my_data")} detail={t("export_workspace_data")}><SettingsAction onClick={() => downloadData({ profile, accounts, goals, transactions })}>{t("download_data_btn")}</SettingsAction></SettingsRow><SettingsRow icon={ShieldCheck} label={t("delete_account")} detail={t("delete_account_detail")}><SettingsAction danger onClick={() => window.confirm(t("delete_account_warning"))}>{t("delete_account")}</SettingsAction></SettingsRow></SettingsCard>}
      <div className="settings-page-save"><button type="button" onClick={saveChanges} disabled={savingPreferences}>{savingPreferences ? t("saving") : t("save_changes")}</button></div>
    </section>
  );
}
