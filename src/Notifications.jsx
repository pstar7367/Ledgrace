import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Info,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markAllNotificationsUnreadRequest,
  markNotificationReadRequest,
} from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const typeIcons = {
  alert: AlertTriangle,
  reminder: CalendarDays,
  update: Info,
  achievement: Trophy,
};

const notificationMessageKeys = {
  "Welcome back to Ledgrace": "notification_welcome_back_title",
};

const notificationDetailKeys = {
  "You have successfully signed in to your account.": "notification_signed_in_detail",
};

function localizedNotification(item, t) {
  return {
    ...item,
    title: notificationMessageKeys[item.title]
      ? t(notificationMessageKeys[item.title], { defaultValue: item.title })
      : item.title,
    detail: notificationDetailKeys[item.detail]
      ? t(notificationDetailKeys[item.detail], { defaultValue: item.detail })
      : item.detail,
  };
}

function formatTime(value, language) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(language, { hour: "numeric", minute: "2-digit" });
}

function dayGroup(value, t, language) {
  const date = new Date(value);
  const today = new Date();
  const difference = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
      new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
      86400000,
  );
  if (difference === 0) return t("today");
  if (difference === 1) return t("yesterday");
  if (difference <= 7) return t("this_week");
  return date.toLocaleDateString(language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupNotifications(items, t, language) {
  return items.reduce((groups, item) => {
    const group = dayGroup(item.createdAt, t, language);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

export default function Notifications({ topSearch = "" }) {
  const { t, i18n } = useTranslation();
  const typeLabels = useMemo(
    () => ({
      alert: t("notification_alerts"),
      reminder: t("notification_reminders"),
      update: t("notification_updates"),
      achievement: t("notification_achievements"),
    }),
    [t],
  );
  const [notifications, setNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [filter, setFilter] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const response = await getNotificationsRequest();
        if (active) setNotifications(response.data.notifications || []);
      } catch (requestError) {
        if (active)
          setError(
            requestError.response?.data?.message ||
              t("notifications_load_error"),
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const refresh = () => load(false);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, [t]);

  const counts = useMemo(
    () =>
      Object.keys(typeLabels).reduce(
        (result, type) => ({
          ...result,
          [type]: notifications.filter((item) => item.type === type).length,
        }),
        {},
      ),
    [notifications, typeLabels],
  );
  const selectedWeek = useMemo(() => {
    const start = new Date(`${selectedDate}T00:00:00`);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  }, [selectedDate]);
  const visible = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    return notifications.filter((item) => {
      const createdAt = new Date(item.createdAt);
      const matchesWeek =
        createdAt >= selectedWeek.start && createdAt < selectedWeek.end;
      const matchesType = filter === "all" || item.type === filter;
      const matchesQuery =
        !query ||
        `${item.title} ${item.detail} ${item.source}`
          .toLowerCase()
          .includes(query);
      return matchesWeek && matchesType && matchesQuery;
    });
  }, [filter, notifications, selectedWeek, topSearch]);
  const pagedVisible = visible.slice(0, visibleLimit);
  const grouped = groupNotifications(pagedVisible, t, i18n.language);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const markRead = async (id) => {
    try {
      await markNotificationReadRequest(id);
      setNotifications((items) =>
        items.map((item) => (item._id === id ? { ...item, read: true } : item)),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("notification_update_error"),
      );
    }
  };
  const toggleAllRead = async () => {
    try {
      if (unreadCount) {
        await markAllNotificationsReadRequest();
      } else {
        await markAllNotificationsUnreadRequest();
      }
      setNotifications((items) =>
        items.map((item) => ({ ...item, read: Boolean(unreadCount) })),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("notification_states_error"),
      );
    }
  };

  if (loading)
    return (
      <section className="notifications-page">
        <div className="notifications-empty">
          <Bell />
          <h2>{t("loading_notifications")}</h2>
          <p>{t("checking_activity")}</p>
        </div>
      </section>
    );

  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <div>
          <h1>
            {t("notifications")} <Bell size={20} />
          </h1>
          <p>
            {t("notifications_description")}
          </p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel={t("notifications_date")}
        />
      </header>
      {error && <p className="notifications-error">{error}</p>}
      <div className="notifications-layout">
        <main>
          <div className="notification-toolbar">
            <div className="notification-tabs">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                {t("all")} ({notifications.length})
              </button>
              {Object.entries(typeLabels).map(([type, label]) => {
                const Icon = typeIcons[type];
                return (
                  <button
                    className={filter === type ? "active" : ""}
                    key={type}
                    onClick={() => setFilter(type)}
                  >
                    <Icon size={13} /> {label} ({counts[type] || 0})
                  </button>
                );
              })}
            </div>
            <button
              className="mark-all-button"
              onClick={toggleAllRead}
              disabled={!notifications.length}
            >
              <CheckCheck size={14} />{" "}
              {unreadCount ? t("mark_all_read") : t("mark_all_unread")}
            </button>
            <button
              className="notification-settings"
              aria-label={t("notification_settings")}
            >
              <Settings size={16} />
            </button>
          </div>
          {Object.keys(grouped).length ? (
            Object.entries(grouped).map(([group, items]) => (
              <section className="notification-group" key={group}>
                <h2>{group}</h2>
                {items.map((item) => (
                  <NotificationRow
                    item={item}
                    key={item._id}
                    onRead={markRead}
                  />
                ))}
              </section>
            ))
          ) : (
            <div className="notifications-empty inline">
              <Bell />
              <h2>{t("no_notifications")}</h2>
              <p>{t("new_activity_here")}</p>
            </div>
          )}
          {visible.length > visibleLimit && (
            <button
              className="load-notifications"
              type="button"
              onClick={() => setVisibleLimit((limit) => limit + 8)}
            >
              {t("load_more_notifications")} <ChevronRight size={14} />
            </button>
          )}
        </main>
        <aside className="notifications-side">
          <section className="notification-side-panel">
            <h2>{t("notification_summary")}</h2>
            {Object.entries(typeLabels).map(([type, label]) => {
              const Icon = typeIcons[type];
              return (
                <div className="summary-notification-row" key={type}>
                  <span className={type}>
                    <Icon />
                  </span>
                  <b>{label}</b>
                  <strong>{counts[type] || 0}</strong>
                  <ChevronRight size={14} />
                </div>
              );
            })}
          </section>
          <section className="notification-side-panel notification-preferences">
            <h2>{t("notification_preferences")}</h2>
            <p>{t("notification_preferences_description")}</p>
            {[
              { label: t("account_activity"), type: "update", icon: ShieldCheck },
              {
                label: t("bills_reminders"),
                type: "reminder",
                icon: CalendarDays,
              },
              {
                label: t("goals_achievements"),
                type: "achievement",
                icon: Trophy,
              },
              {
                label: t("transaction_alerts"),
                type: "alert",
                icon: CircleDollarSign,
              },
            ].map((item) => (
              <div className="preference-row" key={item.label}>
                <span className={item.type}>
                  <item.icon />
                </span>
                <div>
                  <b>{item.label}</b>
                  <small>
                    {t("recorded_notifications", { count: counts[item.type] || 0 })}
                  </small>
                </div>
                <ChevronRight size={14} />
              </div>
            ))}
          </section>
          <section className="notification-side-panel notification-data-note">
            <Sparkles />
            <p>
              {notifications.length
                ? t("notifications_stored", { count: notifications.length })
                : t("notification_history_empty")}
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function NotificationRow({ item, onRead }) {
  const { t, i18n } = useTranslation();
  const Icon = typeIcons[item.type] || Bell;
  const translatedItem = localizedNotification(item, t);
  return (
    <article
      className={item.read ? "notification-row read" : "notification-row"}
      onClick={() => !item.read && onRead(item._id)}
    >
      <span className={item.type}>
        <Icon />
      </span>
      <div>
        <b>{translatedItem.title}</b>
        <p>{translatedItem.detail}</p>
        <em>{t(`notification_${item.type || "update"}`)}</em>
      </div>
      <time>{formatTime(item.createdAt, i18n.language)}</time>
      {!item.read && <i aria-label={t("unread_notification")} />}
      {item.read && <Check size={14} className="read-check" />}
    </article>
  );
}
