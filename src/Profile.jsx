import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Globe2,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Percent,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { getAccountsRequest, getProfileRequest, getSavingsGoalsRequest, getTransactionsRequest, updateProfileRequest } from "./authApi.js";
import { money } from "./preferences.js";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("ledgrace_user")) || {};
  } catch {
    return {};
  }
}

function amount(value) {
  return Number(value || 0);
}

function initials(user) {
  return `${user.firstName?.[0] || "U"}${user.lastName?.[0] || ""}`.toUpperCase();
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateOnly(value) {
  if (!value) return "Not provided";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Not provided";
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function ProfileRow({ icon: Icon, label, value, tone = "blue", onClick }) {
  return (
    <button type="button" className="profile-row" onClick={onClick} disabled={!onClick}>
      <span className={`profile-row-icon ${tone}`}><Icon size={14} /></span>
      <b>{label}</b>
      <span>{value}</span>
      {onClick && <ChevronRight size={14} />}
    </button>
  );
}

export default function Profile({ topSearch = "" }) {
  const [profile, setProfile] = useState(() => readStoredUser());
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", state: "", country: "", bio: "" });
  const [photoDraft, setPhotoDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ledgrace_profile_preferences")) || {
        theme: "Light",
        notifications: "Manage",
        currency: "NGN",
        numberFormat: "1,234.56",
        weekStartsOn: "Monday",
      };
    } catch {
      return { theme: "Light", notifications: "Manage", currency: "NGN", numberFormat: "1,234.56", weekStartsOn: "Monday" };
    }
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [profileResponse, accountsResponse, goalsResponse, transactionsResponse] = await Promise.all([
          getProfileRequest(),
          getAccountsRequest(),
          getSavingsGoalsRequest(),
          getTransactionsRequest(),
        ]);
        if (!active) return;
        const nextProfile = { ...readStoredUser(), ...profileResponse.data.user };
        setProfile(nextProfile);
        setAccounts(accountsResponse.data.accounts || []);
        setGoals(goalsResponse.data.goals || []);
        setTransactions(transactionsResponse.data.transactions || []);
        localStorage.setItem("ledgrace_user", JSON.stringify({ ...readStoredUser(), ...nextProfile }));
        window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: nextProfile }));
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Unable to load your profile right now.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncProfile = (event) => setProfile((current) => ({ ...current, ...(event.detail || {}) }));
    window.addEventListener("ledgrace:profile-changed", syncProfile);
    return () => window.removeEventListener("ledgrace:profile-changed", syncProfile);
  }, []);

  const income = useMemo(() => transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + amount(item.amount), 0), [transactions]);
  const expenses = useMemo(() => transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + amount(item.amount), 0), [transactions]);
  const saved = Math.max(income - expenses, 0);
  const balance = accounts.reduce((sum, item) => sum + amount(item.currentBalance ?? item.startingBalance), 0);
  const completedGoals = goals.filter((goal) => amount(goal.savedAmount ?? goal.currentAmount) >= amount(goal.targetAmount ?? goal.amount ?? goal.goalAmount)).length;
  const isPremium = profile.subscriptionPlan === "premium" || profile.isPremium === true;
  const joinedDate = profile.createdAt || profile.updatedAt;
  const formatMoney = money.format;
  const profileSearchResults = useMemo(() => {
    const records = [
      ["Name", `${profile.firstName || ""} ${profile.lastName || ""}`],
      ["Email Address", profile.email || "Not available"],
      ["Phone Number", profile.phone || "Not provided"],
      ["State", profile.state || "Not provided"],
      ["Country", profile.country || "Not provided"],
      ["Bio", profile.bio || "No bio provided"],
      ["Membership", isPremium ? "Premium Plan" : "Free Plan"],
      ["Member Since", formatDate(joinedDate)],
      ["Total Saved", formatMoney(saved)],
      ["Available Balance", formatMoney(balance)],
      ["Savings Goals", `${goals.length} active`],
      ["Connected Accounts", `${accounts.length} connected`],
      ["Account Status", profile.verified ? "Verified" : "Email verification pending"],
    ];
    const query = topSearch.trim().toLowerCase();
    return query ? records.filter(([label, value]) => `${label} ${value}`.toLowerCase().includes(query)) : [];
  }, [accounts.length, balance, formatMoney, goals.length, isPremium, joinedDate, profile.bio, profile.country, profile.email, profile.firstName, profile.lastName, profile.phone, profile.state, profile.verified, saved, topSearch]);

  useEffect(() => {
    document.documentElement.dataset.profileTheme = preferences.theme.toLowerCase();
  }, [preferences.theme]);

  useEffect(() => {
    const syncPreferences = (event) => setPreferences(event.detail || preferences);
    window.addEventListener("ledgrace:preferences-changed", syncPreferences);
    return () => window.removeEventListener("ledgrace:preferences-changed", syncPreferences);
  }, [preferences]);

  const openSettings = () => window.location.assign("/settings");

  const openEditor = () => {
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
      state: profile.state || "",
      country: profile.country || "",
      bio: profile.bio || "",
    });
    setPhotoDraft(profile.avatar || "");
    setStatus("");
    setEditing(true);
  };

  const openBioEditor = () => {
    setForm((currentForm) => ({ ...currentForm, bio: profile.bio || "" }));
    setError("");
    setStatus("");
    setEditingBio(true);
  };

  const cancelEditor = () => {
    const storedProfile = readStoredUser();
    const restoredProfile = { ...profile, avatar: storedProfile.avatar || "" };
    setProfile(restoredProfile);
    setPhotoDraft(restoredProfile.avatar);
    window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: restoredProfile }));
    setEditing(false);
  };

  const cancelBioEditor = () => {
    setEditingBio(false);
    setStatus("");
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 1_800_000) {
      setError("Please choose an image smaller than 1.8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDraft(String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const profileDetails = { ...form };
      delete profileDetails.bio;
      const { data } = await updateProfileRequest({ ...profileDetails, avatar: photoDraft });
      const nextProfile = data.user;
      setProfile(nextProfile);
      localStorage.setItem("ledgrace_user", JSON.stringify({ ...readStoredUser(), ...nextProfile }));
      window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: nextProfile }));
      setEditing(false);
      setStatus("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveBio = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const { data } = await updateProfileRequest({ bio: form.bio });
      const nextProfile = data.user;
      setProfile(nextProfile);
      localStorage.setItem("ledgrace_user", JSON.stringify({ ...readStoredUser(), ...nextProfile }));
      window.dispatchEvent(new CustomEvent("ledgrace:profile-changed", { detail: nextProfile }));
      setEditingBio(false);
      setStatus("Bio updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your bio.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="profile-page"><div className="profile-loading"><UserRound size={34} /><h2>Loading your profile...</h2><p>Preparing your account information.</p></div></section>;

  return (
    <section className="profile-page">
      <style>{`
        .profile-page { color:#102348; min-width:0; padding:2px 0 28px; }
        :root[data-profile-theme="dim"] .profile-page { color:#dbe7f7; }
        :root[data-profile-theme="dim"] .profile-page .profile-card,
        :root[data-profile-theme="dim"] .profile-page .profile-side-card,
        :root[data-profile-theme="dim"] .profile-page .profile-search-results { border-color:#334a68; background:#172942; }
        :root[data-profile-theme="dim"] .profile-page h1,
        :root[data-profile-theme="dim"] .profile-page h2,
        :root[data-profile-theme="dim"] .profile-page b,
        :root[data-profile-theme="dim"] .profile-page .profile-stat b { color:#f3f7fd; }
        :root[data-profile-theme="dim"] .profile-page p,
        :root[data-profile-theme="dim"] .profile-page small,
        :root[data-profile-theme="dim"] .profile-page .profile-row > span:nth-child(3) { color:#a9bad0; }
        :root[data-app-theme="dark"] body #root .profile-page .profile-tabs button:not(.active) { color:#dbe9f8 !important; background:transparent !important; border:0 !important; border-bottom:2px solid transparent !important; }
        :root[data-app-theme="dark"] body #root .profile-page .profile-tabs button.active { color:#75b4ff !important; background:transparent !important; border:0 !important; border-bottom:2px solid #1458ed !important; }
        :root[data-app-theme="dark"] .profile-page .profile-button,
        :root[data-app-theme="dark"] .profile-page .profile-header-edit,
        :root[data-app-theme="dark"] .profile-page .profile-preference-control select { color:#dbe9f8 !important; background:#102540 !important; border-color:#416583 !important; }
        :root[data-app-theme="dark"] .profile-page .profile-card,
        :root[data-app-theme="dark"] .profile-page .profile-side-card,
        :root[data-app-theme="dark"] .profile-page .profile-search-results { background:#0b1c31 !important; border-color:#1c3959 !important; }
        :root[data-app-theme="dark"] .profile-page .profile-plan-ring { border-color:#1c3959; }
        :root[data-app-theme="dark"] .profile-page .profile-plan-ring::before { border-color:#1458ed; }
        .profile-header,.profile-heading-actions,.profile-tabs,.profile-card-title,.profile-person,.profile-stat-grid,.profile-row,.profile-quick-row,.profile-account-row { display:flex; align-items:center; }
        .profile-header { justify-content:space-between; gap:18px; margin-bottom:16px; }
        .profile-header h1 { display:flex; align-items:center; gap:8px; margin:0; font:800 27px/1.2 Manrope,sans-serif; }
        .profile-header p { margin:5px 0 0; color:#60728b; font-size:13px; }
        .profile-heading-actions { gap:10px; }
        .profile-search-results { display:grid; gap:0; margin-bottom:14px; padding:12px 14px; border:1px solid #dfe8f5; border-radius:10px; background:#fff; box-shadow:0 7px 18px rgba(25,61,111,.035); }
        .profile-search-results h2 { margin:0 0 8px; color:#102348; font-size:12px; }
        .profile-search-result { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-top:1px solid #edf1f6; font-size:10px; }
        .profile-search-result b { color:#294363; }.profile-search-result span { color:#60728b; text-align:right; }
        .profile-search-empty { margin:0; color:#60728b; font-size:10px; }
        .profile-button { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 13px; border:1px solid #d9e5f6; border-radius:8px; background:#fff; color:#1458ed; font-size:11px; font-weight:800; cursor:pointer; }
        .profile-header-edit { min-height:34px; padding:0 12px; border:1px solid #1458ed; border-radius:7px; background:#fff; color:#1458ed; font-size:10px; font-weight:800; }
        .profile-button.primary { color:#fff; background:#1458ed; border-color:#1458ed; }
        .profile-button:disabled { cursor:wait; opacity:.6; }
        .profile-tabs { gap:22px; margin-bottom:9px; border-bottom:1px solid #e5ebf4; }
        .profile-tabs button { min-height:35px; padding:0 2px 9px; border:0; border-bottom:2px solid transparent; background:transparent; color:#5b6f8b; font-size:10px; font-weight:800; cursor:pointer; }
        .profile-tabs button.active { color:#1458ed; border-bottom-color:#1458ed; }
        .profile-layout { display:grid; grid-template-columns:minmax(0,1fr) 235px; gap:14px; }
        .profile-main { min-width:0; display:grid; gap:14px; }
        .profile-card,.profile-side-card { border:1px solid #e3eaf4; border-radius:11px; background:#fff; box-shadow:0 7px 18px rgba(25,61,111,.035); }
        .profile-card { padding:12px 14px; }
        .profile-person { gap:12px; padding-bottom:10px; border-bottom:1px solid #edf1f6; }
        .profile-avatar-wrap { position:relative; flex:none; }
        .profile-avatar { width:72px; height:72px; display:grid; place-items:center; overflow:hidden; border-radius:50%; background:#dfe9fb; color:#1458ed; font:800 22px Manrope,sans-serif; }
        .profile-avatar img { width:100%; height:100%; object-fit:cover; }
        .profile-camera { position:absolute; right:-3px; bottom:0; display:grid; place-items:center; width:28px; height:28px; border:3px solid #fff; border-radius:50%; background:#1458ed; color:#fff; cursor:pointer; }
        .profile-person h2 { display:flex; align-items:center; gap:7px; margin:0; font:800 18px Manrope,sans-serif; }
        .profile-person p { margin:4px 0; color:#60728b; font-size:11px; }
        .profile-premium { display:inline-flex; align-items:center; gap:4px; padding:4px 7px; border-radius:999px; color:#1458ed; background:#edf4ff; font-size:9px; font-weight:800; }
        .profile-free { color:#60728b; background:#f1f4f8; }
        .profile-stat-grid { gap:10px; margin-left:auto; }
        .profile-stat { min-width:105px; padding:12px; border:1px solid #e7edf5; border-radius:9px; }
        .profile-stat small { display:block; color:#6a7d94; font-size:9px; font-weight:700; }
        .profile-stat b { display:block; margin-top:6px; color:#102348; font-size:14px; }
        .profile-stat span { display:block; margin-top:3px; color:#00a978; font-size:9px; font-weight:800; }
        .profile-columns { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .profile-card-title { justify-content:space-between; gap:10px; margin-bottom:9px; }
        .profile-card-title h2,.profile-side-card h2 { margin:0; color:#102348; font-size:13px; }
        .profile-card-title small { color:#60728b; font-size:9px; }
        .profile-row { width:100%; gap:9px; min-height:38px; padding:6px 0; border:0; border-top:1px solid #edf1f6; background:transparent; text-align:left; }
        .profile-preference-row { display:flex; align-items:center; gap:9px; min-height:38px; padding:6px 0; border-top:1px solid #edf1f6; }
        .profile-preference-row b { color:#294363; font-size:10px; }
        .profile-preference-control { margin-left:auto; }
        .profile-preference-control select { min-height:27px; max-width:125px; padding:0 6px; border:1px solid #dce5f1; border-radius:6px; color:#526984; background:#fff; font-size:9px; outline:0; cursor:pointer; }
        .profile-row:disabled { cursor:default; }
        .profile-row-icon { display:grid; place-items:center; width:25px; height:25px; flex:none; border-radius:7px; background:#edf4ff; color:#1458ed; }
        .profile-row-icon.green { color:#00a978; background:#e9faf2; }.profile-row-icon.orange { color:#f59e0b; background:#fff4df; }.profile-row-icon.purple { color:#8b5cf6; background:#f2ecff; }
        .profile-row b { color:#294363; font-size:10px; }.profile-row > span:nth-child(3) { margin-left:auto; color:#60728b; font-size:10px; text-align:right; }.profile-row > svg { flex:none; color:#7790ae; }
        .profile-side { display:grid; gap:14px; align-content:start; }.profile-side-card { padding:15px; }.profile-side-card h2 { margin-bottom:12px; }
        .profile-plan { display:grid; place-items:center; min-height:145px; border-bottom:1px solid #edf1f6; }.profile-plan-ring { position:relative; width:120px; height:64px; box-sizing:border-box; border:10px solid #e8eef7; border-bottom:0; border-radius:120px 120px 0 0; }.profile-plan-ring::before { position:absolute; inset:-10px; content:""; border:10px solid #1458ed; border-bottom:0; border-radius:120px 120px 0 0; }.profile-plan-ring > div { position:absolute; z-index:1; top:25px; left:0; display:grid; place-items:center; width:100%; text-align:center; }.profile-plan-ring strong { font-size:11px; }.profile-plan-ring small { margin-top:3px; color:#00a978; font-size:8px; font-weight:800; }
        .profile-plan-action { display:flex; justify-content:center; padding-top:12px; }
        .profile-check { display:flex; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid #edf1f6; color:#60728b; font-size:9px; }.profile-check b { color:#294363; }.profile-check span { color:#00a978; font-weight:800; }
        .profile-quick-row { width:100%; gap:8px; padding:9px 0; border:0; border-bottom:1px solid #edf1f6; background:transparent; color:#294363; font-size:10px; text-align:left; cursor:pointer; }.profile-quick-row svg:last-child { margin-left:auto; color:#7790ae; }.profile-quick-row.delete { color:#df3747; }
        .profile-account-row { gap:8px; padding:8px 0; border-bottom:1px solid #edf1f6; font-size:10px; }.profile-account-row span:first-child { display:grid; place-items:center; width:23px; height:23px; border-radius:7px; color:#f59e0b; background:#fff4df; }.profile-account-row b { flex:1; }.profile-account-row small { color:#00a978; font-size:8px; font-weight:800; }
        .profile-status { display:flex; align-items:center; gap:7px; margin:0 0 12px; padding:9px 12px; border-radius:7px; color:#16734c; background:#eafaf2; font-size:11px; }.profile-status-close { display:grid; place-items:center; margin-left:auto; padding:2px; border:0; background:transparent; color:#16734c; cursor:pointer; }.profile-error { margin:0 0 12px; padding:9px 12px; border-radius:7px; color:#b42330; background:#fff0f1; font-size:11px; }
        .profile-editor { display:grid; gap:12px; margin-top:14px; padding-top:14px; border-top:1px solid #edf1f6; }.profile-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }.profile-editor label { display:grid; gap:5px; color:#526984; font-size:10px; font-weight:800; }.profile-editor input,.profile-editor select,.profile-editor textarea { min-height:35px; padding:0 10px; border:1px solid #dce5f1; border-radius:7px; outline:0; color:#213957; font-size:11px; }.profile-editor textarea { min-height:72px; padding-top:9px; resize:vertical; }.profile-editor input:focus,.profile-editor select:focus,.profile-editor textarea:focus { border-color:#1458ed; box-shadow:0 0 0 3px #eaf1ff; }.profile-editor-actions { display:flex; justify-content:flex-end; gap:8px; }
        .profile-bio { margin-top:10px; padding-top:9px; border-top:1px solid #edf1f6; }.profile-bio-title { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:22px; }.profile-bio h3 { margin:0; color:#102348; font-size:12px; }.profile-bio p { margin:4px 0 0; color:#60728b; font-size:11px; line-height:1.4; }.profile-bio button { display:inline-flex; align-items:center; gap:4px; border:0; background:transparent; color:#1458ed; font-size:10px; font-weight:800; cursor:pointer; }
        .profile-loading { display:grid; place-items:center; min-height:260px; color:#60728b; text-align:center; }.profile-loading h2 { margin:12px 0 5px; color:#102348; font-size:20px; }.profile-loading p { margin:0; font-size:12px; }
        @media (max-width:900px) { .profile-layout { grid-template-columns:1fr; }.profile-side { grid-template-columns:repeat(2,minmax(0,1fr)); }.profile-side-card:last-child { grid-column:1/-1; } }
        @media (max-width:650px) { .profile-header { align-items:stretch; flex-direction:column; }.profile-heading-actions { justify-content:flex-start; }.profile-layout,.profile-columns,.profile-form-grid,.profile-side { grid-template-columns:1fr; }.profile-side-card:last-child { grid-column:auto; }.profile-person { align-items:flex-start; flex-wrap:wrap; }.profile-stat-grid { width:100%; margin-left:0; }.profile-stat { flex:1; min-width:0; }.profile-tabs { gap:13px; overflow:auto; }.profile-tabs button { white-space:nowrap; } }
      `}</style>
      <header className="profile-header">
        <div><h1>Profile <UserRound size={20} /></h1><p>Manage your personal information, preferences, and account settings.</p></div>
        <div className="profile-heading-actions"><button className="profile-header-edit" type="button" onClick={openEditor}><Pencil size={12} /> Edit Profile</button></div>
      </header>
      <nav className="profile-tabs" aria-label="Profile sections"><button className="active" type="button">Overview</button><button type="button" onClick={openEditor}>Personal Information</button><button type="button" onClick={() => document.getElementById("profile-preferences")?.scrollIntoView({ behavior: "smooth" })}>Preferences</button><button type="button" onClick={() => document.getElementById("profile-security")?.scrollIntoView({ behavior: "smooth" })}>Security</button><button type="button" onClick={() => document.getElementById("profile-privacy")?.scrollIntoView({ behavior: "smooth" })}>Privacy</button></nav>
      {error && <p className="profile-error">{error}</p>}
      {status && <p className="profile-status" role="status"><Check size={13} /> <span>{status}</span><button className="profile-status-close" type="button" onClick={() => setStatus("")} aria-label="Close status message"><X size={14} /></button></p>}
      {topSearch.trim() && <section className="profile-search-results"><h2>Profile Results ({profileSearchResults.length})</h2>{profileSearchResults.length ? profileSearchResults.map(([label, value]) => <div className="profile-search-result" key={label}><b>{label}</b><span>{value}</span></div>) : <p className="profile-search-empty">No profile information matches "{topSearch}".</p>}</section>}
      <div className="profile-layout">
        <main className="profile-main">
          <section className="profile-card">
            <div className="profile-person">
              <div className="profile-avatar-wrap"><div className="profile-avatar">{profile.avatar ? <img src={profile.avatar} alt={`${profile.firstName || "User"} profile`} /> : initials(profile)}</div><button className="profile-camera" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Change profile photo"><Camera size={13} /></button><input ref={fileInputRef} type="file" accept="image/*" capture="user" hidden onChange={choosePhoto} /></div>
              <div><h2>{profile.firstName} {profile.lastName} <span className={`profile-premium ${isPremium ? "" : "profile-free"}`}>{isPremium ? <Sparkles size={11} /> : <ShieldCheck size={11} />} {isPremium ? "Premium" : "Free Plan"}</span></h2><p>{profile.email}</p><p>{profile.phone || "Phone not provided"}</p><p>{profile.state || "State not provided"}, {profile.country || "Country not provided"}</p></div>
              <div className="profile-stat-grid"><div className="profile-stat"><small>Total Amount</small><b>{formatMoney(saved)}</b><span>Live balance</span></div><div className="profile-stat"><small>Goals Completed</small><b>{completedGoals}</b><span>{goals.length ? `${Math.round((completedGoals / goals.length) * 100)}% completion rate` : "No goals yet"}</span></div><div className="profile-stat"><small>Current Streak</small><b>{transactions.length ? `${Math.min(transactions.length, 365)} days` : "0 days"}</b><span>{transactions.length ? "Keep it up" : "Add activity"}</span></div></div>
            </div>
            {editing && <form className="profile-editor" onSubmit={saveProfile}><div className="profile-form-grid"><label>First name<input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Last name<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label><label>Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Not provided" /></label><label>State<input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} placeholder="Not provided" /></label><label>Country<input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Not provided" /></label></div><div className="profile-editor-actions"><button className="profile-button" type="button" onClick={cancelEditor}>Cancel</button><button className="profile-button primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div></form>}
            <div className="profile-bio"><div className="profile-bio-title"><h3>Bio</h3>{!editingBio && <button type="button" onClick={openBioEditor}><Pencil size={10} /> Edit Bio</button>}</div>{editingBio ? <form className="profile-editor" onSubmit={saveBio}><label>Bio<textarea value={form.bio} maxLength={500} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Tell us a little about yourself" /></label><div className="profile-editor-actions"><button className="profile-button" type="button" onClick={cancelBioEditor}>Cancel</button><button className="profile-button primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Bio"}</button></div></form> : <p>{profile.bio || "No bio provided yet."}</p>}</div>
          </section>
          <div className="profile-columns">
            <section className="profile-card"><div className="profile-card-title"><h2>Account Information</h2></div><ProfileRow icon={Mail} label="Email Address" value={profile.email || "Not available"} /><ProfileRow icon={Smartphone} label="Phone Number" value={profile.phone || "Not provided"} /><ProfileRow icon={MapPin} label="State" value={profile.state || "Not provided"} /><ProfileRow icon={Globe2} label="Country" value={profile.country || "Not provided"} /><ProfileRow icon={CalendarDays} label="Date of Birth" value={formatDateOnly(profile.dateOfBirth)} /><ProfileRow icon={Languages} label="Language" value={profile.language || "English"} /><ProfileRow icon={Clock3} label="Time Zone" value={profile.timeZone || "Not provided"} /><ProfileRow icon={CalendarDays} label="Member Since" value={formatDate(joinedDate)} /></section>
            <section className="profile-card" id="profile-preferences"><div className="profile-card-title"><h2>Preferences</h2><button className="profile-header-edit" type="button" onClick={openSettings}>Manage in Settings</button></div><ProfileRow icon={Sparkles} label="Theme" value={preferences.theme} /><ProfileRow icon={Bell} label="Notifications" value={preferences.notifications} /><ProfileRow icon={CircleDollarSign} label="Currency" value={preferences.currency} /><ProfileRow icon={Percent} label="Number Format" value={preferences.numberFormat} /><ProfileRow icon={CalendarDays} label="Week Starts On" value={preferences.weekStartsOn} /></section>
            <section className="profile-card"><div className="profile-card-title"><h2>Financial Profile</h2><small>From your live workspace</small></div><ProfileRow icon={WalletCards} label="Total Income" value={formatMoney(income)} tone="green" /><ProfileRow icon={PiggyBank} label="Total Saved" value={formatMoney(saved)} tone="purple" /><ProfileRow icon={Target} label="Savings Goals" value={`${goals.length} active`} tone="green" /><ProfileRow icon={WalletCards} label="Available Balance" value={formatMoney(balance)} tone="orange" /></section>
            <section className="profile-card" id="profile-security"><div className="profile-card-title"><h2>Security</h2><button className="profile-header-edit" type="button" onClick={openSettings}>Manage in Settings</button></div><ProfileRow icon={LockKeyhole} label="Password" value="Change in Settings" onClick={openSettings} /><ProfileRow icon={ShieldCheck} label="Two-Factor Authentication" value={profile.twoFactorEnabled ? "Enabled" : "Disabled"} /><ProfileRow icon={Smartphone} label="Login Activity" value={profile.lastLoginAt ? formatDate(profile.lastLoginAt) : "No recent sign-in"} /></section>
          </div>
        </main>
        <aside className="profile-side">
          <section className="profile-side-card"><h2>Account Summary</h2><div className="profile-plan"><div className="profile-plan-ring"><div><strong>{isPremium ? "Premium Plan" : "Free Plan"}</strong><small>{isPremium ? "Active" : "Current"}</small></div></div></div><div className="profile-check"><b>Plan Status</b><span>{isPremium ? "Active" : "Free"}</span></div><div className="profile-check"><b>Member Since</b><span>{formatDate(joinedDate)}</span></div><div className="profile-check"><b>Next Billing Date</b><span>{isPremium ? "Managed in plan" : "Not applicable"}</span></div><div className="profile-plan-action"><button className="profile-header-edit" type="button" onClick={() => window.location.assign("/pricing")}>{isPremium ? "Manage My Plan" : "View My Plan"}</button></div></section>
          <section className="profile-side-card"><h2>Connected Accounts</h2>{accounts.length ? accounts.slice(0, 3).map((account) => <div className="profile-account-row" key={account._id || account.id}><span><WalletCards size={12} /></span><b>{account.name || "Account"}</b><small>Connected</small></div>) : <p style={{ margin: 0, color: "#60728b", fontSize: 10 }}>No connected accounts yet.</p>}</section>
          <section className="profile-side-card" id="profile-privacy"><h2>Privacy</h2><p style={{ margin: 0, color: "#60728b", fontSize: 10, lineHeight: 1.5 }}>Your profile and financial records are loaded for your authenticated account.</p></section>
        </aside>
      </div>
    </section>
  );
}
