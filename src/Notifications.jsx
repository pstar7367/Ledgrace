import { useEffect, useMemo, useState } from "react";
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

const typeLabels = {
  alert: "Alerts",
  reminder: "Reminders",
  update: "Updates",
  achievement: "Achievements",
};

const typeIcons = {
  alert: AlertTriangle,
  reminder: CalendarDays,
  update: Info,
  achievement: Trophy,
};

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayGroup(value) {
  const date = new Date(value);
  const today = new Date();
  const difference = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
      new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
      86400000,
  );
  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  if (difference <= 7) return "This Week";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupNotifications(items) {
  return items.reduce((groups, item) => {
    const group = dayGroup(item.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

export default function Notifications({ topSearch = "" }) {
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
              "Unable to load your notifications.",
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
  }, []);

  const counts = useMemo(
    () =>
      Object.keys(typeLabels).reduce(
        (result, type) => ({
          ...result,
          [type]: notifications.filter((item) => item.type === type).length,
        }),
        {},
      ),
    [notifications],
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
  const grouped = groupNotifications(pagedVisible);
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
          "Unable to update this notification.",
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
          "Unable to update notification states.",
      );
    }
  };

  if (loading)
    return (
      <section className="notifications-page">
        <div className="notifications-empty">
          <Bell />
          <h2>Loading your notifications...</h2>
          <p>Checking your latest account activity.</p>
        </div>
      </section>
    );

  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <div>
          <h1>
            Notifications <Bell size={20} />
          </h1>
          <p>
            Stay updated with important alerts, reminders and account activity.
          </p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel="Select notifications date"
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
                All ({notifications.length})
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
              {unreadCount ? "Mark as read" : "Mark as unread"}
            </button>
            <button
              className="notification-settings"
              aria-label="Notification settings"
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
              <h2>No notifications found</h2>
              <p>New account activity will appear here when it is recorded.</p>
            </div>
          )}
          {visible.length > visibleLimit && (
            <button
              className="load-notifications"
              type="button"
              onClick={() => setVisibleLimit((limit) => limit + 8)}
            >
              Load More Notifications <ChevronRight size={14} />
            </button>
          )}
        </main>
        <aside className="notifications-side">
          <section className="notification-side-panel">
            <h2>Notification Summary</h2>
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
            <h2>Notification Preferences</h2>
            <p>Manage the notification activity recorded for your account.</p>
            {[
              { label: "Account Activity", type: "update", icon: ShieldCheck },
              {
                label: "Bills & Reminders",
                type: "reminder",
                icon: CalendarDays,
              },
              {
                label: "Goals & Achievements",
                type: "achievement",
                icon: Trophy,
              },
              {
                label: "Transaction Alerts",
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
                    {counts[item.type] || 0} recorded notification
                    {counts[item.type] === 1 ? "" : "s"}
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
                ? `${notifications.length} notification${notifications.length === 1 ? "" : "s"} are stored for this account.`
                : "Your notification history is empty."}
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function NotificationRow({ item, onRead }) {
  const Icon = typeIcons[item.type] || Bell;
  return (
    <article
      className={item.read ? "notification-row read" : "notification-row"}
      onClick={() => !item.read && onRead(item._id)}
    >
      <span className={item.type}>
        <Icon />
      </span>
      <div>
        <b>{item.title}</b>
        <p>{item.detail}</p>
        <em>{typeLabels[item.type] || "Update"}</em>
      </div>
      <time>{formatTime(item.createdAt)}</time>
      {!item.read && <i aria-label="Unread notification" />}
      {item.read && <Check size={14} className="read-check" />}
    </article>
  );
}
