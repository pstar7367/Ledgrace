import { useCallback, useEffect, useRef, useState } from "react";
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
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  changePasswordRequest,
  getAccountsRequest,
  getNotificationsRequest,
  getProfileRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
  updateProfileRequest,
} from "./authApi.js";
import {
  DEFAULT_PREFERENCES,
  applyPreferenceEffects,
  money,
  readPreferences as readCommittedPreferences,
  refreshExchangeRates,
} from "./preferences.js";
import {
  applyLanguage,
  getLanguageCode,
  getStoredLanguage,
  SUPPORTED_LANGUAGES,
  translate,
} from "./translation.js";

const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;
const LANGUAGE_LABEL_KEYS = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((language) => [language, `language_${language.toLowerCase()}`]),
);
const CURRENCY_OPTIONS = [
  ["NGN", "currency_ngn"],
  ["USD", "currency_usd"],
  ["GBP", "currency_gbp"],
  ["EUR", "currency_eur"],
];
const TABS = ["General", "Account", "Notifications", "Connect & Sync", "Data & Export"];

function applyTheme(theme) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "Dark" || (theme === "System" && prefersDark);
  document.documentElement.dataset.appTheme = isDark ? "dark" : "light";
  document.documentElement.dataset.profileTheme = isDark ? "dim" : "light";
}

function downloadData(data, format = "JSON") {
  const exportData = data;
  const isCsv = format === "CSV";
  const rows = isCsv
    ? Object.entries(exportData).flatMap(([section, values]) =>
        Array.isArray(values)
          ? values.map((value) => ({ section, ...value }))
          : [{ section, value: values }],
      )
    : [];
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csv = [
    headers,
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? ""))),
  ]
    .map((row) => row.join(","))
    .join("\n");
  const content = isCsv ? csv : JSON.stringify(exportData, null, 2);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([content], { type: isCsv ? "text/csv" : "application/json" }),
  );
  link.download = `ledgrace-data.${isCsv ? "csv" : "json"}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function SettingsCard({
  title,
  description,
  children,
  className = "",
  skipDomTranslation = false,
}) {
  return (
    <section
      className={`settings-card ${className}`}
      data-i18n-skip={skipDomTranslation ? "true" : undefined}
    >
      <div className="settings-card-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingsRow({ icon: Icon, label, detail, children }) {
  return (
    <div className="settings-row">
      <span className="settings-row-icon">
        <Icon size={14} />
      </span>
      <div className="settings-row-copy">
        <b>{label}</b>
        <small>{detail}</small>
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function SettingsAction({ children, onClick, danger = false }) {
  return (
    <button
      className={`settings-action ${danger ? "danger" : ""}`}
      type="button"
      onClick={onClick}
    >
      {children}
      <ChevronRight size={13} />
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`settings-toggle ${checked ? "on" : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

function SelectControl({ value, onChange, children }) {
  return (
    <select
      className="settings-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
}

function AccountSettings({ profile, setStatus, t }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await changePasswordRequest(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStatus(t("password_changed"));
    } catch (requestError) {
      setPasswordError(
        requestError.response?.data?.message || t("unable_change_password"),
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <SettingsCard title={t("account")} description={t("manage_account")}>
      <div className="settings-row">
        <span className="settings-row-icon">
          <ShieldCheck size={14} />
        </span>
        <div className="settings-row-copy">
          <b>{t("account_status")}</b>
          <small>{t("manage_account")}</small>
        </div>
        <div className="settings-row-control">
          <strong className="settings-positive">
            {profile.verified ? t("active") : t("pending")}
          </strong>
        </div>
      </div>
      <section className="settings-account-section">
        <h3>{t("change_password")}</h3>
        <p>{t("use_current_password")}</p>
        <form className="settings-password-form" onSubmit={savePassword}>
          <label>
            {t("current_password")}
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              autoComplete="current-password"
            />
          </label>
          <label>
            {t("new_password")}
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, newPassword: event.target.value })
              }
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label>
            {t("confirm_new_password")}
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
              }
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {passwordError && (
            <p className="settings-form-error" role="alert">
              {passwordError}
            </p>
          )}
          <button
            className="settings-save-button"
            type="submit"
            disabled={passwordSaving}
          >
            {passwordSaving ? t("saving") : t("save_password")}
          </button>
        </form>
      </section>
      <section className="settings-account-section">
        <h3>{t("login_activity")}</h3>
        <p>{t("recent_signins")}</p>
        {profile.loginActivity?.length ? (
          <div className="settings-login-list">
            {profile.loginActivity.slice(0, 5).map((activity, index) => (
              <div className="settings-login-item" key={`${activity.at}-${index}`}>
                <b>{index === 0 ? t("current_signin") : t("previous_signin")}</b>
                <span>{new Date(activity.at).toLocaleString()}</span>
                <small>{activity.ip || t("ip_unavailable")}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="settings-login-item">
            <b>{t("current_session")}</b>
            <span>
              {profile.lastLoginAt
                ? new Date(profile.lastLoginAt).toLocaleString()
                : t("no_recent_signin")}
            </span>
          </div>
        )}
      </section>
    </SettingsCard>
  );
}

function GeneralSettings({
  preferences,
  updatePreference,
  updateToggle,
  profile,
  goals,
  accounts,
  transactions,
  totalSaved,
  selectedLanguage,
  t,
}) {
  const formatMoney = money.format;
  const normalizedPlan = String(profile.subscriptionPlan || "")
    .trim()
    .toLowerCase();
  const isPremiumPlan =
    Boolean(profile.isPremium) ||
    ["premium", "pro", "premium plan", "pro plan"].includes(normalizedPlan) ||
    normalizedPlan.includes("premium") ||
    normalizedPlan.includes("pro");
  const planLabel = isPremiumPlan ? t("premium_plan") : t("free_plan");
  return (
    <div className="settings-general-layout">
      <div className="settings-main-column">
        <SettingsCard
          title={t("general_settings_title")}
          description={t("general_settings_desc")}
        >
          <SettingsRow icon={Palette} label={t("theme")} detail={t("choose_appearance")}>
            <div className="settings-segmented">
              {["Light", "Dark", "System"].map((theme) => (
                <button
                  className={preferences.theme === theme ? "active" : ""}
                  type="button"
                  key={theme}
                  onClick={() => updatePreference("theme", theme)}
                >
                  {theme === "Light" ? (
                    <span>☼</span>
                  ) : theme === "Dark" ? (
                    <span>☾</span>
                  ) : (
                    <Monitor size={12} />
                  )}
                  {t(theme.toLowerCase())}
                </button>
              ))}
            </div>
          </SettingsRow>
          <SettingsRow
            icon={CircleDollarSign}
            label={t("currency")}
            detail={t("select_currency")}
          >
            <SelectControl
              value={preferences.currency}
              onChange={(value) => updatePreference("currency", value)}
            >
              {CURRENCY_OPTIONS.map(([value, label]) => (
                <option value={value} key={value}>
                  {t(label)}
                </option>
              ))}
            </SelectControl>
          </SettingsRow>
          <SettingsRow
            icon={Languages}
            label={t("language")}
            detail={t("choose_language")}
          >
            <SelectControl
              value={preferences.language}
              onChange={(value) => updatePreference("language", value)}
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {t(LANGUAGE_LABEL_KEYS[language])}
                </option>
              ))}
            </SelectControl>
          </SettingsRow>
          <SettingsRow
            icon={CalendarDays}
            label={t("week_starts")}
            detail={t("choose_week_start")}
          >
            <SelectControl
              value={preferences.weekStartsOn}
              onChange={(value) => updatePreference("weekStartsOn", value)}
            >
              <option value="Monday">{t("monday")}</option>
              <option value="Sunday">{t("sunday")}</option>
            </SelectControl>
          </SettingsRow>
          <SettingsRow
            icon={Grid2X2}
            label={t("default_dashboard")}
            detail={t("choose_default_dashboard")}
          >
            <SelectControl
              value={preferences.dashboardView}
              onChange={(value) => updatePreference("dashboardView", value)}
            >
              <option value="Dashboard Overview">{t("dashboard_overview")}</option>
              <option value="Recent Transactions">{t("recent_transactions")}</option>
              <option value="Financial Summary">{t("financial_summary")}</option>
            </SelectControl>
          </SettingsRow>
        </SettingsCard>
        <SettingsCard
          title={t("display_preferences_title")}
          description={t("display_preferences_desc")}
        >
          <SettingsRow
            icon={Grid2X2}
            label={t("compact_mode")}
            detail={t("compact_mode_detail")}
          >
            <Toggle
              checked={preferences.compactMode}
              onChange={() => updateToggle("compactMode")}
            />
          </SettingsRow>
          <SettingsRow
            icon={Sparkles}
            label={t("quick_stats")}
            detail={t("quick_stats_detail")}
          >
            <Toggle
              checked={preferences.showQuickStats !== false}
              onChange={() => updateToggle("showQuickStats")}
            />
          </SettingsRow>
        </SettingsCard>
      </div>
      <div className="settings-main-column">
        <SettingsCard
          title={t("financial_preferences_title")}
          description={t("financial_preferences_desc")}
        >
          <SettingsRow
            icon={Target}
            label={t("savings_goal_settings")}
            detail={t("active_goals", { count: goals.length })}
          >
            <SettingsAction onClick={() => window.location.assign("/savings-goals")}>
              {t("manage_goals")}
            </SettingsAction>
          </SettingsRow>
          <SettingsRow
            icon={Bell}
            label={t("budget_alerts")}
            detail={t("budget_alerts_detail")}
          >
            <Toggle
              checked={preferences.budgetAlerts !== false}
              onChange={() => updateToggle("budgetAlerts")}
            />
          </SettingsRow>
        </SettingsCard>
        <SettingsCard
          title={t("app_preferences_title")}
          description={t("app_preferences_desc")}
        >
          <SettingsRow
            icon={Sparkles}
            label={t("suggested_insights")}
            detail={t("suggested_insights_detail")}
          >
            <Toggle
              checked={preferences.suggestedInsights !== false}
              onChange={() => updateToggle("suggestedInsights")}
            />
          </SettingsRow>
          <SettingsRow
            icon={Bell}
            label={t("haptic_feedback")}
            detail={t("haptic_feedback_detail")}
          >
            <Toggle
              checked={preferences.hapticFeedback === true}
              onChange={() => updateToggle("hapticFeedback")}
            />
          </SettingsRow>
          <SettingsRow
            icon={Sparkles}
            label={t("animations")}
            detail={t("animations_detail")}
          >
            <Toggle
              checked={preferences.animations !== false}
              onChange={() => updateToggle("animations")}
            />
          </SettingsRow>
        </SettingsCard>
      </div>
      <aside className="settings-summary-column">
        <SettingsCard
          title={t("account_summary_title")}
          description=""
          skipDomTranslation
        >
          <div className="settings-account-avatar">
            <UserRound size={28} />
          </div>
          <h3 className="settings-account-name">
            {profile.firstName || t("account")} {profile.lastName || ""}
          </h3>
          <span className="settings-plan-badge">{planLabel}</span>
          <div className="settings-summary-list">
            <div>
              <b>{t("member_since")}</b>
              <strong>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString(
                      getLanguageCode(selectedLanguage),
                      { month: "short", day: "numeric", year: "numeric" },
                    )
                  : t("not_available")}
              </strong>
            </div>
            <div>
              <b>{t("account_status")}</b>
              <strong className="settings-positive">
                {profile.verified ? t("active") : t("pending")}
              </strong>
            </div>
            <div>
              <b>{t("plan")}</b>
              <strong>{planLabel}</strong>
            </div>
            <div>
              <b>{t("tracked_accounts")}</b>
              <strong>{accounts.length}</strong>
            </div>
            <div>
              <b>{t("saved")}</b>
              <strong>{formatMoney(totalSaved)}</strong>
            </div>
            <div>
              <b>{t("transactions")}</b>
              <strong>{transactions.length}</strong>
            </div>
          </div>
          <SettingsAction onClick={() => window.location.assign("/profile")}>
            {t("manage_profile")}
          </SettingsAction>
        </SettingsCard>
        <SettingsCard title={t("quick_actions")} description="">
          <button
            className="settings-quick-action"
            type="button"
            onClick={() => window.location.assign("/notifications")}
          >
            <Bell size={14} /> {t("manage_notifications")} <ChevronRight size={13} />
          </button>
          <button
            className="settings-quick-action"
            type="button"
            onClick={() =>
              downloadData(
                { profile, accounts, goals, transactions },
                preferences.exportFormat,
              )
            }
          >
            <Download size={14} /> {t("download_my_data")} <ChevronRight size={13} />
          </button>
        </SettingsCard>
      </aside>
    </div>
  );
}

const settingsStyles = `
  .settings-page { width:100%; max-width:1180px; color:#102348; padding:2px 0 30px; }
  .settings-page-header { display:flex; align-items:center; margin-bottom:12px; }.settings-page-header h1 { display:flex; align-items:center; gap:8px; margin:0; font:800 23px/1.2 Manrope,sans-serif; }.settings-page-header h1 svg { color:#1458ed; }.settings-page-header p { margin:4px 0 0; color:#60728b; font-size:10px; }
  .settings-tabs { display:flex; gap:20px; overflow-x:auto; border-bottom:1px solid #e5ebf4; margin-bottom:14px; }.settings-tabs button { flex:0 0 auto; min-height:34px; padding:0 1px 8px; border:0; border-bottom:2px solid transparent; background:transparent; color:#536986; font-size:9px; font-weight:800; cursor:pointer; }.settings-tabs button.active { color:#1458ed; border-bottom-color:#1458ed; }
  .settings-general-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) 222px; gap:12px; align-items:start; }.settings-main-column,.settings-summary-column { display:grid; gap:12px; }.settings-card { min-width:0; padding:13px; border:1px solid #e3eaf4; border-radius:9px; background:#fff; box-shadow:0 7px 18px rgba(25,61,111,.035); }.settings-card-heading { margin-bottom:8px; }.settings-card h2 { margin:0; color:#102348; font-size:11px; }.settings-card-heading p { margin:2px 0 0; color:#60728b; font-size:8px; line-height:1.4; }.settings-row { display:grid; grid-template-columns:25px minmax(0,1fr) auto; align-items:center; gap:8px; min-height:43px; border-top:1px solid #edf1f6; }.settings-row-icon { display:grid; place-items:center; width:24px; height:24px; border-radius:7px; color:#1458ed; background:#edf4ff; }.settings-row-copy { min-width:0; }.settings-row-copy b { display:block; color:#294363; font-size:9px; }.settings-row-copy small { display:block; margin-top:2px; color:#60728b; font-size:7px; line-height:1.25; }.settings-row-control { display:flex; align-items:center; justify-content:flex-end; min-width:0; }.settings-row-control > span,.settings-summary-list strong { color:#294363; font-size:8px; font-weight:800; }.settings-select { width:122px; min-height:26px; padding:0 5px; border:1px solid #dce5f1; border-radius:5px; color:#526984; background:#fff; font-size:8px; outline:0; }.settings-segmented { display:flex; border:1px solid #c9d9f1; border-radius:5px; overflow:hidden; }.settings-segmented button { display:flex; align-items:center; gap:3px; min-height:25px; padding:0 6px; border:0; border-right:1px solid #dce5f1; background:#fff; color:#526984; font-size:8px; cursor:pointer; }.settings-segmented button:last-child { border-right:0; }.settings-segmented button.active { color:#1458ed; background:#edf4ff; }.settings-action { display:inline-flex; align-items:center; gap:2px; min-height:25px; padding:0 5px; border:0; background:transparent; color:#294363; font-size:8px; font-weight:800; white-space:nowrap; cursor:pointer; }.settings-action.danger { color:#df3747; }.settings-positive { color:#00a978 !important; }.settings-toggle { position:relative; width:28px; height:16px; padding:2px; border:0; border-radius:999px; background:#d6deeb; cursor:pointer; }.settings-toggle span { display:block; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(16,35,72,.2); transition:transform .18s ease; }.settings-toggle.on { background:#1458ed; }.settings-toggle.on span { transform:translateX(12px); }.settings-account-avatar { display:grid; place-items:center; width:48px; height:48px; margin:5px auto 7px; border-radius:50%; color:#1458ed; background:#edf4ff; }.settings-account-name { margin:0; color:#102348; text-align:center; font-size:12px; }.settings-plan-badge { display:block; width:max-content; margin:5px auto 12px; padding:3px 7px; border-radius:999px; color:#1458ed; background:#edf4ff; font-size:8px; font-weight:800; }.settings-summary-list { display:grid; gap:0; margin-bottom:8px; }.settings-summary-list div { display:flex; justify-content:space-between; gap:7px; padding:7px 0; border-top:1px solid #edf1f6; }.settings-summary-list b { color:#526984; font-size:8px; }.settings-summary-list strong { text-align:right; }.settings-summary-column .settings-action { width:100%; justify-content:center; min-height:28px; border:1px solid #1458ed; border-radius:5px; color:#1458ed; }.settings-quick-action { display:flex; align-items:center; gap:7px; width:100%; min-height:34px; padding:0; border:0; border-top:1px solid #edf1f6; background:transparent; color:#294363; font-size:9px; text-align:left; cursor:pointer; }.settings-quick-action svg:last-child { margin-left:auto; color:#7790ae; }.settings-status { display:flex; align-items:center; gap:7px; margin:0 0 12px; padding:8px 11px; border-radius:6px; color:#16734c; background:#eafaf2; font-size:9px; }.settings-status-close { display:grid; place-items:center; margin-left:auto; padding:2px; border:0; background:transparent; color:#16734c; cursor:pointer; }.settings-loading { display:grid; place-items:center; min-height:260px; color:#60728b; font-size:12px; }
  .settings-page p,.settings-page small { line-height:1.4 !important; }.settings-page-header p { font-size:11px !important; }.settings-tabs button { font-size:10px !important; }.settings-card h2 { font-size:13px !important; }.settings-card-heading p { font-size:10px !important; }.settings-row-copy b { font-size:11px !important; }.settings-row-copy small { font-size:9px !important; line-height:1.25 !important; }.settings-row-control > span,.settings-summary-list strong { font-size:10px !important; }.settings-select,.settings-segmented button { font-size:10px !important; }.settings-action { font-size:10px !important; }.settings-quick-action { font-size:11px !important; }.settings-status { font-size:11px !important; }.settings-status.settings-error { color:#a62535; background:#fff0f1; }.settings-page-save { display:flex; justify-content:flex-end; margin-top:16px; padding-top:14px; border-top:1px solid #e5ebf4; }.settings-page-save button { min-height:34px; padding:0 14px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:11px; font-weight:800; cursor:pointer; }.settings-page-save button:disabled { opacity:z.65; cursor:wait; }.settings-loading { font-size:13px !important; }
  .settings-account-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; padding:4px 0 12px; }.settings-account-form label { display:grid; gap:5px; color:#526984; font-size:10px; font-weight:800; }.settings-account-form input,.settings-account-form select { width:100%; min-height:35px; box-sizing:border-box; padding:0 8px; border:1px solid #dce5f1; border-radius:7px; color:#213957; background:#fff; font-size:10px; outline:0; }.settings-account-form input:focus,.settings-account-form select:focus { border-color:#1458ed; box-shadow:0 0 0 3px #eaf1ff; }.settings-form-error { grid-column:1/-1; margin:0; color:#c52d40; font-size:10px !important; }.settings-save-button { grid-column:1/-1; justify-self:end; min-height:30px; padding:0 10px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:10px; font-weight:800; cursor:pointer; }.settings-save-button:disabled { opacity:.65; cursor:wait; }
  .settings-account-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; padding:4px 0 12px; }.settings-account-form label,.settings-password-form label { display:grid; gap:5px; color:#526984; font-size:10px; font-weight:800; }.settings-account-form input,.settings-account-form select,.settings-password-form input { width:100%; min-height:35px; box-sizing:border-box; padding:0 8px; border:1px solid #dce5f1; border-radius:7px; color:#213957; background:#fff; font-size:10px; outline:0; }.settings-account-form input:focus,.settings-account-form select:focus,.settings-password-form input:focus { border-color:#1458ed; box-shadow:0 0 0 3px #eaf1ff; }.settings-form-error { grid-column:1/-1; margin:0; color:#c52d40; font-size:10px !important; }.settings-save-button { grid-column:1/-1; justify-self:end; min-height:30px; padding:0 10px; border:0; border-radius:6px; color:#fff; background:#1458ed; font-size:10px; font-weight:800; cursor:pointer; }.settings-save-button:disabled { opacity:.65; cursor:wait; }.settings-account-section { margin-top:12px; padding-top:12px; border-top:1px solid #edf1f6; }.settings-account-section h3 { margin:0; color:#102348; font-size:12px; }.settings-account-section > p { margin:3px 0 9px; color:#60728b; font-size:10px !important; }.settings-password-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }.settings-security-control { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:9px 0; }.settings-security-control b,.settings-login-item b { display:block; color:#294363; font-size:10px; }.settings-security-control small,.settings-login-item small { display:block; margin-top:3px; color:#60728b; font-size:9px; }.settings-login-list { display:grid; gap:7px; }.settings-login-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 10px; padding:8px 9px; border:1px solid #edf1f6; border-radius:6px; }.settings-login-item span { color:#526984; font-size:9px; text-align:right; }.settings-login-item small { grid-column:1/-1; }
  @media (max-width:1050px) { .settings-general-layout { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }.settings-summary-column { grid-column:1/-1; grid-template-columns:repeat(2,minmax(0,1fr)); }.settings-summary-column .settings-card:first-child { grid-row:span 2; } }
  @media (max-width:680px) { .settings-page { padding-bottom:20px; }.settings-general-layout,.settings-summary-column,.settings-account-form,.settings-password-form { grid-template-columns:1fr; }.settings-summary-column { grid-column:auto; }.settings-summary-column .settings-card:first-child { grid-row:auto; }.settings-tabs { gap:14px; }.settings-row { grid-template-columns:25px minmax(0,1fr) auto; }.settings-select { width:105px; }.settings-segmented button { padding:0 4px; }.settings-row-copy small { max-width:150px; }.settings-login-item { grid-template-columns:1fr; }.settings-login-item span { text-align:left; } }
`;

function readPreferences() {
  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(localStorage.getItem("ledgrace_profile_preferences")),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function readExchangeRateTimestamp() {
  try {
    return (
      JSON.parse(localStorage.getItem("ledgrace_exchange_rates") || "{}").fetchedAt || ""
    );
  } catch {
    return "";
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
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("ledgrace_token")),
  );
  const [requestError, setRequestError] = useState("");
  const [status, setStatus] = useState("");
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [syncingRates, setSyncingRates] = useState(false);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(readExchangeRateTimestamp);
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguage());
  const committedPreferences = useRef(readCommittedPreferences());
  const committedLanguage = useRef(getStoredLanguage());
  const t = useCallback(
    (key, options = {}) => translate(key, selectedLanguage, options),
    [selectedLanguage],
  );

  useEffect(() => {
    return () => {
      applyPreferenceEffects(committedPreferences.current);
      applyTheme(committedPreferences.current.theme);
      window.dispatchEvent(
        new CustomEvent("ledgrace:preferences-changed", {
          detail: {
            ...committedPreferences.current,
            language: committedLanguage.current,
            changedKey: "restore",
          },
        }),
      );
      applyLanguage(committedLanguage.current, { announce: false, persist: false });
    };
  }, []);

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
    const syncProfile = (event) => {
      if (event.detail && typeof event.detail === "object") {
        setProfile((current) => ({ ...current, ...event.detail }));
      }
    };

    window.addEventListener("ledgrace:profile-changed", syncProfile);
    return () => window.removeEventListener("ledgrace:profile-changed", syncProfile);
  }, []);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("ledgrace_token")) {
      return () => {
        active = false;
      };
    }
    getProfileRequest()
      .then((profileResponse) => {
        if (!active) return;
        const nextProfile = profileResponse.data.user || {};
        const serverPreferences =
          nextProfile.preferences && typeof nextProfile.preferences === "object"
            ? nextProfile.preferences
            : {};
        const storedPreferences = JSON.parse(
          localStorage.getItem("ledgrace_profile_preferences") || "{}",
        );
        const nextPreferences = {
          ...DEFAULT_PREFERENCES,
          ...serverPreferences,
          ...storedPreferences,
          language:
            storedPreferences.language ||
            serverPreferences.language ||
            nextProfile.language ||
            getStoredLanguage(),
        };
        setProfile(nextProfile);
        setPreferences(nextPreferences);
        setSelectedLanguage(nextPreferences.language);
        applyPreferenceEffects(nextPreferences);
        committedPreferences.current = nextPreferences;
        committedLanguage.current = nextPreferences.language;
        localStorage.setItem(
          "ledgrace_profile_preferences",
          JSON.stringify(nextPreferences),
        );
        window.dispatchEvent(
          new CustomEvent("ledgrace:preferences-changed", {
            detail: { ...nextPreferences, changedKey: "load" },
          }),
        );
        localStorage.setItem(
          "ledgrace_user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"),
            ...nextProfile,
            language: nextPreferences.language,
          }),
        );
      })
      .catch((error) => {
        if (active)
          setRequestError(error.response?.data?.message || "Unable to load settings.");
      })
      .finally(() => active && setLoading(false));

    Promise.allSettled([
      getAccountsRequest(),
      getSavingsGoalsRequest(),
      getTransactionsRequest(),
      getNotificationsRequest(),
    ]).then(([accountsResult, goalsResult, transactionsResult, notificationsResult]) => {
      if (!active) return;
      if (accountsResult.status === "fulfilled")
        setAccounts(accountsResult.value.data.accounts || []);
      if (goalsResult.status === "fulfilled")
        setGoals(goalsResult.value.data.goals || []);
      if (transactionsResult.status === "fulfilled")
        setTransactions(transactionsResult.value.data.transactions || []);
      if (notificationsResult.status === "fulfilled")
        setNotifications(notificationsResult.value.data.notifications || []);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    const updateRateTimestamp = () => setRatesUpdatedAt(readExchangeRateTimestamp());
    window.addEventListener("ledgrace:exchange-rates-changed", updateRateTimestamp);
    return () =>
      window.removeEventListener("ledgrace:exchange-rates-changed", updateRateTimestamp);
  }, []);

  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const totalSaved = Math.max(
    transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0) -
      transactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    0,
  );

  const updatePreference = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    committedPreferences.current = next;
    localStorage.setItem("ledgrace_profile_preferences", JSON.stringify(next));
    setRequestError("");
    applyPreferenceEffects(next);
    if (key === "theme") applyTheme(value);
    if (key === "language") {
      committedLanguage.current = value;
      setSelectedLanguage(value);
      applyLanguage(value, { announce: false, persist: false });
      setProfile((current) => ({ ...current, language: value, preferences: next }));
    }
    if (key === "currency") refreshExchangeRates();
    window.dispatchEvent(
      new CustomEvent("ledgrace:preferences-changed", {
        detail: { ...next, changedKey: key },
      }),
    );
    setStatus("");
  };

  const saveChanges = async () => {
    setSavingPreferences(true);
    setRequestError("");
    try {
      const { data } = await updateProfileRequest({
        dateOfBirth: profile.dateOfBirth,
        language: profile.language || preferences.language,
        timeZone: profile.timeZone,
        preferences,
      });
      const savedProfile = data.user || {};
      const savedPreferences = {
        ...preferences,
        ...(savedProfile.preferences || {}),
        language: savedProfile.language || preferences.language,
      };
      setPreferences(savedPreferences);
      setProfile((current) => ({
        ...current,
        ...savedProfile,
        preferences: savedPreferences,
      }));
      setSelectedLanguage(savedPreferences.language);
      localStorage.setItem(
        "ledgrace_profile_preferences",
        JSON.stringify(savedPreferences),
      );
      const storedUser = {
        ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"),
        ...savedProfile,
        language: savedPreferences.language,
      };
      localStorage.setItem("ledgrace_user", JSON.stringify(storedUser));
      committedPreferences.current = savedPreferences;
      committedLanguage.current = savedPreferences.language;
      applyPreferenceEffects(savedPreferences);
      applyLanguage(savedPreferences.language, { announce: false, persist: false });
      window.dispatchEvent(
        new CustomEvent("ledgrace:profile-changed", { detail: storedUser }),
      );
      window.dispatchEvent(
        new CustomEvent("ledgrace:preferences-changed", {
          detail: { ...savedPreferences, changedKey: "save" },
        }),
      );
      setStatus(t("settings_updated"));
    } catch (error) {
      setRequestError(error.response?.data?.message || t("unable_save_settings"));
    } finally {
      setSavingPreferences(false);
    }
  };

  const updateToggle = (key) => updatePreference(key, !preferences[key]);
  const navigate = (path) => window.location.assign(path);

  const refreshRates = async () => {
    setSyncingRates(true);
    setRequestError("");
    try {
      const result = await refreshExchangeRates();
      if (!result)
        throw new Error("Exchange rates could not be refreshed. Please try again.");
      setRatesUpdatedAt(readExchangeRateTimestamp());
      setStatus("Exchange rates refreshed.");
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setSyncingRates(false);
    }
  };

  if (loading)
    return (
      <section className="settings-page">
        <div className="settings-loading">{t("loading_settings")}</div>
      </section>
    );

  return (
    <section className="settings-page" data-i18n-skip="true">
      <style>{settingsStyles}</style>
      <header className="settings-page-header">
        <div>
          <h1>
            {t("settings_title")} <SettingsIcon size={20} />
          </h1>
          <p>{t("settings_tagline")}</p>
        </div>
      </header>
      <nav className="settings-tabs" aria-label={t("settings_sections")}>
        {TABS.map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "General"
              ? t("general")
              : tab === "Account"
                ? t("account")
                : tab === "Notifications"
                  ? t("notifications")
                  : tab === "Connect & Sync"
                    ? t("connect_sync")
                    : t("data_export")}
          </button>
        ))}
      </nav>
      {requestError && (
        <p className="settings-status settings-error" role="alert">
          <span>{requestError}</span>
          <button
            className="settings-status-close"
            type="button"
            onClick={() => setRequestError("")}
            aria-label={t("close_error_message")}
          >
            <X size={14} />
          </button>
        </p>
      )}
      {status && (
        <p className="settings-status" role="status">
          <Check size={13} />
          <span>{status}</span>
          <button
            className="settings-status-close"
            type="button"
            onClick={() => setStatus("")}
            aria-label={t("close_status_message")}
          >
            <X size={14} />
          </button>
        </p>
      )}
      {activeTab === "General" && (
        <GeneralSettings
          preferences={preferences}
          updatePreference={updatePreference}
          updateToggle={updateToggle}
          profile={profile}
          goals={goals}
          accounts={accounts}
          transactions={transactions}
          totalSaved={totalSaved}
          selectedLanguage={selectedLanguage}
          t={t}
        />
      )}
      {activeTab === "Account" && (
        <AccountSettings profile={profile} setStatus={setStatus} t={t} />
      )}
      {activeTab === "Notifications" && (
        <SettingsCard
          title={t("notifications")}
          description={t("review_notification_activity")}
        >
          <SettingsRow
            icon={Bell}
            label={t("unread_notifications")}
            detail={t("notifications_waiting")}
          >
            <strong>{unreadNotifications}</strong>
          </SettingsRow>
          <SettingsRow
            icon={Bell}
            label="In-app notification panel"
            detail="Show or hide the notification bell in the workspace header."
          >
            <Toggle
              checked={preferences.inAppNotifications !== false}
              onChange={() => updateToggle("inAppNotifications")}
            />
          </SettingsRow>
          <SettingsRow
            icon={Bell}
            label={t("notification_center")}
            detail={t("review_notifications")}
          >
            <SettingsAction onClick={() => navigate("/notifications")}>
              {t("open_notifications")}
            </SettingsAction>
          </SettingsRow>
        </SettingsCard>
      )}
      {activeTab === "Connect & Sync" && (
        <SettingsCard
          title="Exchange-rate sync"
          description="Manage how often currency conversion rates refresh. This does not connect to or sync bank accounts."
        >
          <SettingsRow
            icon={WalletCards}
            label="Tracked accounts"
            detail="Accounts you manually track in Ledgrace."
          >
            <SettingsAction onClick={() => navigate("/accounts")}>
              {accounts.length} · {t("manage_account")}
            </SettingsAction>
          </SettingsRow>
          <SettingsRow
            icon={Cloud}
            label="Automatic rate refresh"
            detail="Refresh exchange rates for converted balances and reports."
          >
            <Toggle
              checked={preferences.autoSync !== false}
              onChange={() => updateToggle("autoSync")}
            />
          </SettingsRow>
          <SettingsRow
            icon={CalendarDays}
            label={t("sync_frequency")}
            detail="Used while automatic rate refresh is on."
          >
            <SelectControl
              value={preferences.syncFrequency}
              onChange={(value) => updatePreference("syncFrequency", value)}
            >
              <option value="Every 15 minutes">{t("every_15_minutes")}</option>
              <option value="Every hour">{t("every_hour")}</option>
              <option value="Daily">{t("daily")}</option>
            </SelectControl>
          </SettingsRow>
          <SettingsRow
            icon={Cloud}
            label="Last rate refresh"
            detail={
              ratesUpdatedAt
                ? new Date(ratesUpdatedAt).toLocaleString()
                : "No successful refresh recorded on this device."
            }
          >
            <button
              className="settings-action"
              type="button"
              onClick={refreshRates}
              disabled={syncingRates}
            >
              {syncingRates ? t("loading") : "Refresh now"}
              <ChevronRight size={13} />
            </button>
          </SettingsRow>
        </SettingsCard>
      )}
      {activeTab === "Data & Export" && (
        <SettingsCard title={t("data_export")} description={t("export_workspace_desc")}>
          <SettingsRow
            icon={Download}
            label={t("export_format")}
            detail={t("export_workspace_data")}
          >
            <SelectControl
              value={preferences.exportFormat}
              onChange={(value) => updatePreference("exportFormat", value)}
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
            </SelectControl>
          </SettingsRow>
          <SettingsRow
            icon={Download}
            label={t("download_my_data")}
            detail="Download the profile and finance records currently loaded in this workspace."
          >
            <SettingsAction
              onClick={() =>
                downloadData(
                  { profile, accounts, goals, transactions },
                  preferences.exportFormat,
                )
              }
            >
              {t("download_data_btn")}
            </SettingsAction>
          </SettingsRow>
        </SettingsCard>
      )}
      <div className="settings-page-save">
        <button type="button" onClick={saveChanges} disabled={savingPreferences}>
          {savingPreferences ? t("saving") : t("save_changes")}
        </button>
      </div>
    </section>
  );
}
