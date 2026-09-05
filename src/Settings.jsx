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

const LANGUAGE_OPTIONS = ["Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Chinese", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Filipino", "Finnish", "French", "Galician", "Georgian", "German", "Greek", "Gujarati", "Hebrew", "Hindi", "Hungarian", "Icelandic", "Indonesian", "Irish", "Italian", "Japanese", "Kannada", "Kazakh", "Khmer", "Korean", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Macedonian", "Malay", "Malayalam", "Marathi", "Mongolian", "Nepali", "Norwegian", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Swahili", "Swedish", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Yoruba", "Zulu"];
const TIME_ZONE_OPTIONS = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC", "Africa/Lagos", "America/New_York", "Europe/London", "Asia/Kolkata"];
const CURRENCY_OPTIONS = [
  ["NGN", "Nigerian Naira (NGN)"],
  ["USD", "US Dollar (USD)"],
  ["GBP", "British Pound (GBP)"],
  ["EUR", "Euro (EUR)"],
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

function AccountSettings({ profile, onProfileUpdated, setStatus }) {
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
      const { data } = await updateProfileRequest(form);
      onProfileUpdated(data.user);
      setStatus("Account details updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update your account details.");
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
      setStatus("Password changed successfully.");
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || "Unable to change your password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleTwoFactor = async () => {
    setError("");
    try {
      const { data } = await updateProfileRequest({ twoFactorEnabled: !profile.twoFactorEnabled });
      onProfileUpdated(data.user);
      setStatus(data.user.twoFactorEnabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update two-factor authentication.");
    }
  };

  return <SettingsCard title="Account" description="Manage the personal information connected to your account.">
    <form className="settings-account-form" onSubmit={save}>
      <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} /></label>
      <label>Language<SelectControl value={form.language} onChange={(value) => setForm({ ...form, language: value })}>{LANGUAGE_OPTIONS.map((language) => <option key={language}>{language}</option>)}</SelectControl></label>
      <label>Time Zone<SelectControl value={form.timeZone} onChange={(value) => setForm({ ...form, timeZone: value })}><option value="">Select a time zone</option>{TIME_ZONE_OPTIONS.map((timeZone) => <option key={timeZone}>{timeZone}</option>)}</SelectControl></label>
      {error && <p className="settings-form-error" role="alert">{error}</p>}
      <button className="settings-save-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Account Details"}</button>
    </form>
    <div className="settings-row"><span className="settings-row-icon"><ShieldCheck size={14} /></span><div className="settings-row-copy"><b>Account Status</b><small>Your account verification status.</small></div><div className="settings-row-control"><strong className="settings-positive">{profile.verified ? "Active" : "Pending"}</strong></div></div>
    <section className="settings-account-section"><h3>Change Password</h3><p>Use your current password to choose a new one.</p><form className="settings-password-form" onSubmit={savePassword}><label>Current password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" /></label><label>New password<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength={8} autoComplete="new-password" /></label><label>Confirm new password<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength={8} autoComplete="new-password" /></label>{passwordError && <p className="settings-form-error" role="alert">{passwordError}</p>}<button className="settings-save-button" type="submit" disabled={passwordSaving}>{passwordSaving ? "Saving..." : "Save Password"}</button></form></section>
    <section className="settings-account-section"><h3>Two-Factor Authentication</h3><p>Require an additional verification step when signing in.</p><div className="settings-security-control"><div><b>{profile.twoFactorEnabled ? "Enabled" : "Disabled"}</b><small>{profile.twoFactorEnabled ? "Extra sign-in protection is active." : "Enable this protection for your account."}</small></div><Toggle checked={profile.twoFactorEnabled === true} onChange={toggleTwoFactor} /></div></section>
    <section className="settings-account-section"><h3>Login Activity</h3><p>Recent sign-ins to your account.</p>{profile.loginActivity?.length ? <div className="settings-login-list">{profile.loginActivity.slice(0, 5).map((activity, index) => <div className="settings-login-item" key={`${activity.at}-${index}`}><b>{index === 0 ? "Current sign-in" : "Previous sign-in"}</b><span>{new Date(activity.at).toLocaleString()}</span><small>{activity.ip || "IP unavailable"}</small></div>)}</div> : <div className="settings-login-item"><b>Current session</b><span>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "No recent sign-in recorded"}</span></div>}</section>
  </SettingsCard>;
}

function GeneralSettings({ preferences, updatePreference, updateToggle, categories, profile, goals, accounts, transactions, totalSaved }) {
  const formatMoney = money.format;
  return <div className="settings-general-layout">
    <div className="settings-main-column">
      <SettingsCard title="General Settings" description="Manage your app experience and preferences.">
        <SettingsRow icon={Palette} label="Theme" detail="Choose your preferred appearance"><div className="settings-segmented">{["Light", "Dark", "System"].map((theme) => <button className={preferences.theme === theme ? "active" : ""} type="button" key={theme} onClick={() => updatePreference("theme", theme)}>{theme === "Light" ? <span>☼</span> : theme === "Dark" ? <span>☾</span> : <Monitor size={12} />}{theme}</button>)}</div></SettingsRow>
        <SettingsRow icon={CircleDollarSign} label="Currency" detail="Select your default currency"><SelectControl value={preferences.currency} onChange={(value) => updatePreference("currency", value)}>{CURRENCY_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectControl></SettingsRow>
        <SettingsRow icon={Languages} label="Language" detail="Choose your preferred language"><SelectControl value={preferences.language} onChange={(value) => updatePreference("language", value)}>{LANGUAGE_OPTIONS.map((language) => <option key={language}>{language}</option>)}</SelectControl></SettingsRow>
        <SettingsRow icon={CalendarDays} label="Date Format" detail="Select how dates are displayed"><SelectControl value={preferences.dateFormat} onChange={(value) => updatePreference("dateFormat", value)}><option>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></SelectControl></SettingsRow>
        <SettingsRow icon={CalendarDays} label="Week Starts On" detail="Choose the first day of your week"><SelectControl value={preferences.weekStartsOn} onChange={(value) => updatePreference("weekStartsOn", value)}><option>Monday</option><option>Sunday</option></SelectControl></SettingsRow>
        <SettingsRow icon={Grid2X2} label="Default Dashboard View" detail="Choose what you see when you log in"><SelectControl value={preferences.dashboardView} onChange={(value) => updatePreference("dashboardView", value)}><option>Dashboard Overview</option><option>Recent Transactions</option><option>Financial Summary</option></SelectControl></SettingsRow>
      </SettingsCard>
      <SettingsCard title="Display Preferences" description="Customize how information is displayed across the app.">
        <SettingsRow icon={Grid2X2} label="Compact Mode" detail="Show more content with less spacing"><Toggle checked={preferences.compactMode} onChange={() => updateToggle("compactMode")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label="Show Quick Stats on Dashboard" detail="Display summary cards on top of your dashboard"><Toggle checked={preferences.showQuickStats !== false} onChange={() => updateToggle("showQuickStats")} /></SettingsRow>
        <SettingsRow icon={SettingsIcon} label="Show Tooltips" detail="Show helpful tips and guidance"><Toggle checked={preferences.showTooltips !== false} onChange={() => updateToggle("showTooltips")} /></SettingsRow>
      </SettingsCard>
    </div>
    <div className="settings-main-column">
      <SettingsCard title="Financial Preferences" description="Set your financial tracking preferences.">
        <SettingsRow icon={CalendarDays} label="Default Budget Period" detail="The period used for new budgets"><SelectControl value={preferences.budgetPeriod} onChange={(value) => updatePreference("budgetPeriod", value)}><option>Monthly</option><option>Weekly</option><option>Yearly</option></SelectControl></SettingsRow>
        <SettingsRow icon={WalletCards} label="Income & Expense Categories" detail={`${categories.length} categories from your transactions`}><SettingsAction onClick={() => updatePreference("categoryNotice", Date.now())}>Manage Categories</SettingsAction></SettingsRow>
        <SettingsRow icon={Target} label="Savings Goal Settings" detail={`${goals.length} active goal${goals.length === 1 ? "" : "s"}`}><SettingsAction onClick={() => window.location.assign("/savings-goals")}>Manage Goals</SettingsAction></SettingsRow>
        <SettingsRow icon={Bell} label="Budget Alerts" detail="Get notified when spending approaches your budget"><Toggle checked={preferences.budgetAlerts !== false} onChange={() => updateToggle("budgetAlerts")} /></SettingsRow>
        <SettingsRow icon={CircleDollarSign} label="Round Off Transactions" detail="How transaction amounts are rounded"><SelectControl value={preferences.roundOff} onChange={(value) => updatePreference("roundOff", value)}><option>Nearest Naira (N1)</option><option>Nearest Ten (N10)</option><option>Do not round</option></SelectControl></SettingsRow>
      </SettingsCard>
      <SettingsCard title="App Preferences" description="Control how the app behaves.">
        <SettingsRow icon={Grid2X2} label="Auto-categorize Transactions" detail="Automatically categorize new transactions"><Toggle checked={preferences.autoCategorize !== false} onChange={() => updateToggle("autoCategorize")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label="Suggested Insights" detail="Receive helpful insights and tips"><Toggle checked={preferences.suggestedInsights !== false} onChange={() => updateToggle("suggestedInsights")} /></SettingsRow>
        <SettingsRow icon={Bell} label="Haptic Feedback" detail="Vibrate on important actions (mobile only)"><Toggle checked={preferences.hapticFeedback === true} onChange={() => updateToggle("hapticFeedback")} /></SettingsRow>
        <SettingsRow icon={Sparkles} label="Animations" detail="Enable smooth animations and transitions"><Toggle checked={preferences.animations !== false} onChange={() => updateToggle("animations")} /></SettingsRow>
        <SettingsRow icon={Cloud} label="Offline Access" detail="Allow limited access when offline"><Toggle checked={preferences.offlineAccess !== false} onChange={() => updateToggle("offlineAccess")} /></SettingsRow>
      </SettingsCard>
    </div>
    <aside className="settings-summary-column">
      <SettingsCard title="Account Summary" description=""><div className="settings-account-avatar"><UserRound size={28} /></div><h3 className="settings-account-name">{profile.firstName || "Account"} {profile.lastName || ""}</h3><span className="settings-plan-badge">{profile.subscriptionPlan === "premium" || profile.isPremium ? "Premium Plan" : "Free Plan"}</span><div className="settings-summary-list"><div><b>Member Since</b><strong>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not available"}</strong></div><div><b>Account Status</b><strong className="settings-positive">{profile.verified ? "Active" : "Pending"}</strong></div><div><b>Plan</b><strong>{profile.subscriptionPlan || "Free"}</strong></div><div><b>Tracked Accounts</b><strong>{accounts.length}</strong></div><div><b>Saved</b><strong>{formatMoney(totalSaved)}</strong></div><div><b>Transactions</b><strong>{transactions.length}</strong></div></div><SettingsAction onClick={() => window.location.assign("/profile")}>Manage Profile</SettingsAction></SettingsCard>
      <SettingsCard title="Quick Actions" description=""><button className="settings-quick-action" type="button" onClick={() => window.location.assign("/notifications")}><Bell size={14} /> Manage Notifications <ChevronRight size={13} /></button><button className="settings-quick-action" type="button" onClick={() => downloadData({ profile, accounts, goals, transactions })}><Download size={14} /> Download My Data <ChevronRight size={13} /></button></SettingsCard>
    </aside>
  </div>;
}

const settingsStyles = `
  .settings-page { width:100%; max-width:1180px; color:#102348; padding:2px 0 30px; }
  .settings-page-header { display:flex; align-items:center; margin-bottom:12px; }.settings-page-header h1 { display:flex; align-items:center; gap:8px; margin:0; font:800 23px/1.2 Manrope,sans-serif; }.settings-page-header h1 svg { color:#1458ed; }.settings-page-header p { margin:4px 0 0; color:#60728b; font-size:10px; }
  .settings-tabs { display:flex; gap:20px; overflow-x:auto; border-bottom:1px solid #e5ebf4; margin-bottom:14px; }.settings-tabs button { flex:0 0 auto; min-height:34px; padding:0 1px 8px; border:0; border-bottom:2px solid transparent; background:transparent; color:#536986; font-size:9px; font-weight:800; cursor:pointer; }.settings-tabs button.active { color:#1458ed; border-bottom-color:#1458ed; }
  .settings-general-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) 222px; gap:12px; align-items:start; }.settings-main-column,.settings-summary-column { display:grid; gap:12px; }.settings-card { min-width:0; padding:13px; border:1px solid #e3eaf4; border-radius:9px; background:#fff; box-shadow:0 7px 18px rgba(25,61,111,.035); }.settings-card-heading { margin-bottom:8px; }.settings-card h2 { margin:0; color:#102348; font-size:11px; }.settings-card-heading p { margin:2px 0 0; color:#60728b; font-size:8px; line-height:1.4; }.settings-row { display:grid; grid-template-columns:25px minmax(0,1fr) auto; align-items:center; gap:8px; min-height:43px; border-top:1px solid #edf1f6; }.settings-row-icon { display:grid; place-items:center; width:24px; height:24px; border-radius:7px; color:#1458ed; background:#edf4ff; }.settings-row-copy { min-width:0; }.settings-row-copy b { display:block; color:#294363; font-size:9px; }.settings-row-copy small { display:block; margin-top:2px; color:#60728b; font-size:7px; line-height:1.25; }.settings-row-control { display:flex; align-items:center; justify-content:flex-end; min-width:0; }.settings-row-control > span,.settings-summary-list strong { color:#294363; font-size:8px; font-weight:800; }.settings-select { width:122px; min-height:26px; padding:0 5px; border:1px solid #dce5f1; border-radius:5px; color:#526984; background:#fff; font-size:8px; outline:0; }.settings-segmented { display:flex; border:1px solid #c9d9f1; border-radius:5px; overflow:hidden; }.settings-segmented button { display:flex; align-items:center; gap:3px; min-height:25px; padding:0 6px; border:0; border-right:1px solid #dce5f1; background:#fff; color:#526984; font-size:8px; cursor:pointer; }.settings-segmented button:last-child { border-right:0; }.settings-segmented button.active { color:#1458ed; background:#edf4ff; }.settings-action { display:inline-flex; align-items:center; gap:2px; min-height:25px; padding:0 5px; border:0; background:transparent; color:#294363; font-size:8px; font-weight:800; white-space:nowrap; cursor:pointer; }.settings-action.danger { color:#df3747; }.settings-positive { color:#00a978 !important; }.settings-toggle { position:relative; width:28px; height:16px; padding:2px; border:0; border-radius:999px; background:#d6deeb; cursor:pointer; }.settings-toggle span { display:block; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(16,35,72,.2); transition:transform .18s ease; }.settings-toggle.on { background:#1458ed; }.settings-toggle.on span { transform:translateX(12px); }.settings-account-avatar { display:grid; place-items:center; width:48px; height:48px; margin:5px auto 7px; border-radius:50%; color:#1458ed; background:#edf4ff; }.settings-account-name { margin:0; color:#102348; text-align:center; font-size:12px; }.settings-plan-badge { display:block; width:max-content; margin:5px auto 12px; padding:3px 7px; border-radius:999px; color:#1458ed; background:#edf4ff; font-size:8px; font-weight:800; }.settings-summary-list { display:grid; gap:0; margin-bottom:8px; }.settings-summary-list div { display:flex; justify-content:space-between; gap:7px; padding:7px 0; border-top:1px solid #edf1f6; }.settings-summary-list b { color:#526984; font-size:8px; }.settings-summary-list strong { text-align:right; }.settings-summary-column .settings-action { width:100%; justify-content:center; min-height:28px; border:1px solid #1458ed; border-radius:5px; color:#1458ed; }.settings-quick-action { display:flex; align-items:center; gap:7px; width:100%; min-height:34px; padding:0; border:0; border-top:1px solid #edf1f6; background:transparent; color:#294363; font-size:9px; text-align:left; cursor:pointer; }.settings-quick-action svg:last-child { margin-left:auto; color:#7790ae; }.settings-status { display:flex; align-items:center; gap:7px; margin:0 0 12px; padding:8px 11px; border-radius:6px; color:#16734c; background:#eafaf2; font-size:9px; }.settings-status-close { display:grid; place-items:center; margin-left:auto; padding:2px; border:0; background:transparent; color:#16734c; cursor:pointer; }.settings-loading { display:grid; place-items:center; min-height:260px; color:#60728b; font-size:12px; }
  .settings-page p,.settings-page small { line-height:1.4 !important; }.settings-page-header p { font-size:11px !important; }.settings-tabs button { font-size:10px !important; }.settings-card h2 { font-size:13px !important; }.settings-card-heading p { font-size:10px !important; }.settings-row-copy b { font-size:11px !important; }.settings-row-copy small { font-size:9px !important; line-height:1.25 !important; }.settings-row-control > span,.settings-summary-list strong { font-size:10px !important; }.settings-select,.settings-segmented button { font-size:10px !important; }.settings-action { font-size:10px !important; }.settings-quick-action { font-size:11px !important; }.settings-status { font-size:11px !important; }.settings-loading { font-size:13px !important; }
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
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("ledgrace_token")) {
      return () => { active = false; };
    }
    Promise.all([getProfileRequest(), getAccountsRequest(), getSavingsGoalsRequest(), getTransactionsRequest(), getNotificationsRequest()])
      .then(([profileResponse, accountsResponse, goalsResponse, transactionsResponse, notificationsResponse]) => {
        if (!active) return;
        setProfile(profileResponse.data.user || {});
        setAccounts(accountsResponse.data.accounts || []);
        setGoals(goalsResponse.data.goals || []);
        setTransactions(transactionsResponse.data.transactions || []);
        setNotifications(notificationsResponse.data.notifications || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
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
    if (key === "theme") applyTheme(value);
    if (key === "currency") refreshExchangeRates();
    window.dispatchEvent(new CustomEvent("ledgrace:preferences-changed", { detail: next }));
    setStatus("Settings updated successfully.");
  };

  const updateToggle = (key) => updatePreference(key, !preferences[key]);
  const updateProfile = (nextProfile) => {
    setProfile(nextProfile);
    localStorage.setItem("ledgrace_user", JSON.stringify({ ...JSON.parse(localStorage.getItem("ledgrace_user") || "{}"), ...nextProfile }));
    window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: nextProfile }));
  };
  const navigate = (path) => window.location.assign(path);

  if (loading) return <section className="settings-page"><div className="settings-loading">Loading your settings...</div></section>;

  return (
    <section className="settings-page">
      <style>{settingsStyles}</style>
      <header className="settings-page-header"><div><h1>Settings <SettingsIcon size={20} /></h1><p>Manage your account, preferences and app settings.</p></div></header>
      <nav className="settings-tabs" aria-label="Settings sections">{TABS.map((tab) => <button className={activeTab === tab ? "active" : ""} type="button" key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
      {status && <p className="settings-status" role="status"><Check size={13} /><span>{status}</span><button className="settings-status-close" type="button" onClick={() => setStatus("")} aria-label="Close status message"><X size={14} /></button></p>}
      {activeTab === "General" && <GeneralSettings preferences={preferences} updatePreference={updatePreference} updateToggle={updateToggle} categories={categories} profile={profile} goals={goals} accounts={accounts} transactions={transactions} totalSaved={totalSaved} />}
      {activeTab === "Account" && <AccountSettings key={`${profile.dateOfBirth}|${profile.language}|${profile.timeZone}`} profile={profile} onProfileUpdated={updateProfile} setStatus={setStatus} />}
      {activeTab === "Notifications" && <SettingsCard title="Notifications" description="Review notification activity and alert preferences."><SettingsRow icon={Bell} label="Unread Notifications" detail="Notifications waiting for your attention."><strong>{unreadNotifications}</strong></SettingsRow><SettingsRow icon={Bell} label="Notification Center" detail="Review and manage all notifications."><SettingsAction onClick={() => navigate("/notifications")}>Open Notifications</SettingsAction></SettingsRow></SettingsCard>}
      {activeTab === "Privacy" && <SettingsCard title="Privacy" description="Your profile and financial records are available only to your authenticated account."><SettingsRow icon={ShieldCheck} label="Data Access" detail="Your data is protected by your authenticated session."><span>Protected</span></SettingsRow><SettingsRow icon={Download} label="Data Export" detail="Download a copy of your workspace data."><SettingsAction onClick={() => downloadData({ profile, accounts, goals, transactions })}>Download Data</SettingsAction></SettingsRow></SettingsCard>}
      {activeTab === "Connect & Sync" && <SettingsCard title="Connect & Sync" description="Your workspace data is connected to your authenticated account."><SettingsRow icon={Cloud} label="Connected Accounts" detail="Accounts available in your workspace."><strong>{accounts.length}</strong></SettingsRow><SettingsRow icon={RotateCcw} label="Last Sync" detail="Data is loaded from the workspace service when this page opens."><span>Live</span></SettingsRow></SettingsCard>}
      {activeTab === "Data & Export" && <SettingsCard title="Data & Export" description="Take your workspace data with you."><SettingsRow icon={Download} label="Download My Data" detail="Export your profile, accounts, goals, and transactions."><SettingsAction onClick={() => downloadData({ profile, accounts, goals, transactions })}>Download Data</SettingsAction></SettingsRow><SettingsRow icon={ShieldCheck} label="Delete Account" detail="This action is not reversible. Contact support to continue."><SettingsAction danger onClick={() => window.confirm("Delete Account is not reversible. Please contact support to continue.")}>Delete Account</SettingsAction></SettingsRow></SettingsCard>}
    </section>
  );
}
