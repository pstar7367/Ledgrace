import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  FileText,
  HeartPulse,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Plus,
  ReceiptText,
  Route,
  Search,
  Settings,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { Brand } from "./index.jsx";
import AccountsManager from "./AccountsManager.jsx";
import IncomeManager from "./IncomeManager.jsx";
import ExpensesManager from "./ExpensesManager.jsx";
import BudgetPlanner from "./BudgetPlanner.jsx";
import SavingsGoalsManager from "./SavingsGoalsManager.jsx";
import BillsAndSubscriptionsManager from "./BillsAndSubscriptionsManager.jsx";
import FinancialCalendar from "./FinancialCalendar.jsx";
import Analytics from "./Analytics.jsx";
import FinancialHealth from "./FinancialHealth.jsx";
import FinancialJourney from "./FinancialJourney.jsx";
import Insights from "./Insights.jsx";
import Reports from "./Reports.jsx";
import {
  createTransactionRequest,
  deleteTransactionRequest,
  getTransactionsRequest,
} from "./authApi.js";
import "./App.css";
import "./workspace-responsive.css";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const sidebarItems = [
  "Dashboard",
  "Accounts",
  "Income",
  "Expenses",
  "Budget Planner",
  "Savings Goals",
  "Bills & Subscriptions",
  "Financial Calendar",
  "Analytics",
  "Reports",
  "Financial Health",
  "Financial Journey",
  "Insights",
  "Goals & Achievements",
  "Notifications",
  "Profile",
  "Settings",
  "Help Center",
];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("ledgrace_user")) || {};
  } catch {
    return {};
  }
}

function readLegacyTransactions(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function getActiveFromPathname() {
  const pathname = window.location.pathname;
  if (pathname === "/accounts") return "Accounts";
  if (pathname === "/income") return "Income";
  if (pathname === "/expenses") return "Expenses";
  if (pathname === "/budget-planner") return "Budget Planner";
  if (pathname === "/savings-goals") return "Savings Goals";
  if (pathname === "/bills-subscriptions") return "Bills & Subscriptions";
  if (pathname === "/financial-calendar") return "Financial Calendar";
  if (pathname === "/analytics") return "Analytics";
  if (pathname === "/reports") return "Reports";
  if (pathname === "/financial-health") return "Financial Health";
  if (pathname === "/financial-journey") return "Financial Journey";
  if (pathname === "/insights") return "Insights";
  return "Dashboard";
}

function toDashboardTransaction(transaction) {
  return {
    ...transaction,
    id: transaction._id || transaction.id,
    clientId: transaction.clientId || transaction.id,
  };
}

function Sidebar({ menu, user, active, onSelect, onClose, profileOpen, setProfileOpen }) {
  const iconFor = (name) => {
    if (name === "Dashboard") return LayoutDashboard;
    if (name === "Accounts") return Landmark;
    if (name === "Income") return CircleDollarSign;
    if (name === "Expenses") return TrendingDown;
    if (name === "Budget Planner") return WalletCards;
    if (name === "Savings Goals") return Target;
    if (name === "Bills & Subscriptions") return ReceiptText;
    if (name === "Financial Calendar") return Calendar;
    if (name === "Analytics") return BarChart3;
    if (name === "Reports") return FileText;
    if (name === "Financial Health") return HeartPulse;
    if (name === "Financial Journey") return Route;
    if (name === "Insights") return Lightbulb;
    if (name === "Goals & Achievements") return Trophy;
    if (name === "Notifications") return Bell;
    if (name === "Profile") return UserRound;
    if (name === "Settings") return Settings;
    if (name === "Help Center") return CircleHelp;
    return WalletCards;
  };

  const initials = `${user.firstName?.[0] || "U"}${user.lastName?.[0] || ""}`;

  return (
    <aside className={menu ? "app-sidebar open" : "app-sidebar"}>
      <div className="sidebar-brand-row">
        <a href="/"><Brand /></a>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar"><X /></button>
      </div>

      <nav>
        {sidebarItems.map((name) => {
          const Icon = iconFor(name);
          return (
            <button
              key={name}
              className={active === name ? "selected" : ""}
              onClick={() => onSelect(name)}
            >
              <Icon />
              {name}
            </button>
          );
        })}
      </nav>

      <div className="dash-upgrade">
        <b>Go Premium</b>
        <p>Unlock advanced financial tools and insights.</p>
        <button onClick={() => onSelect("Go Premium")}>Upgrade Now</button>
      </div>

      <div className="dash-profile">
        <div className={profileOpen ? "dash-profile-menu open" : "dash-profile-menu"}>
          <button onClick={() => onSelect("Profile")}>View profile</button>
          <button
            onClick={() => {
              localStorage.removeItem("ledgrace_token");
              localStorage.removeItem("ledgrace_user");
              window.location.assign("/login");
            }}
          >
            Log out
          </button>
        </div>

        <button
          className="dash-profile-trigger"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <span>{initials}</span>
          <div>
            <b>{user.firstName ? `${user.firstName} ${user.lastName || ""}` : "My Profile"}</b>
            <small>{user.email || "Manage your account"}</small>
          </div>
          <ChevronDown className={profileOpen ? "up" : ""} />
        </button>
      </div>
    </aside>
  );
}

function Metric({ label, value, icon: Icon, good, expense }) {
  return (
    <article className="dash-metric">
      <span className={expense ? "expense" : good ? "income" : ""}><Icon /></span>
      <small>{label}</small>
      <strong>{typeof value === "number" ? money.format(value) : value}</strong>
    </article>
  );
}

export default function DashboardPage() {
  const user = readUser();
  const storageKey = `ledgrace_transactions_${user.email || "guest"}`;
  const [transactions, setTransactions] = useState(() => readLegacyTransactions(storageKey));
  const [workspaceError, setWorkspaceError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dashboardPeriod, setDashboardPeriod] = useState("month");
  const [active, setActive] = useState(() => getActiveFromPathname());
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => [{
    id: crypto.randomUUID(),
    title: "Welcome to Ledgrace",
    detail: "Your dashboard is ready for you.",
    time: "Just now",
    read: false,
  }]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "General",
  });

  const totals = useMemo(
    () => transactions.reduce(
      (summary, item) => ({
        income: summary.income + (item.type === "income" ? item.amount : 0),
        expenses: summary.expenses + (item.type === "expense" ? item.amount : 0),
      }),
      { income: 0, expenses: 0 },
    ),
    [transactions],
  );

  useEffect(() => {
    let isCurrent = true;

    const loadWorkspaceTransactions = async () => {
      const legacyTransactions = readLegacyTransactions(storageKey);

      try {
        const { data } = await getTransactionsRequest();
        const savedTransactions = data.transactions.map(toDashboardTransaction);
        const savedClientIds = new Set(savedTransactions.map((item) => item.clientId));
        const unsyncedLegacyTransactions = legacyTransactions.filter((item) => (
          !savedClientIds.has(item.clientId || item.id)
        ));

        if (unsyncedLegacyTransactions.length) {
          await Promise.all(unsyncedLegacyTransactions.map((item) => (
            createTransactionRequest({
              ...item,
              clientId: item.clientId || item.id || crypto.randomUUID(),
            })
          )));
          const refreshed = await getTransactionsRequest();
          if (isCurrent) {
            setTransactions(refreshed.data.transactions.map(toDashboardTransaction));
          }
          return;
        }

        if (isCurrent) {
          setTransactions(savedTransactions);
        }
      } catch (error) {
        if (isCurrent) {
          setTransactions(legacyTransactions);
          setWorkspaceError(
            error.response?.data?.message ||
              "We could not sync your workspace yet. Your existing browser records are still available.",
          );
        }
      }
    };

    loadWorkspaceTransactions();
    return () => {
      isCurrent = false;
    };
  }, [storageKey]);

  useEffect(() => {
    const receiveNotification = (event) => {
      setNotifications((items) => [{
        id: crypto.randomUUID(),
        title: event.detail?.title || "Account update",
        detail: event.detail?.detail || "Your financial information was updated.",
        time: "Just now",
        read: false,
      }, ...items]);
    };
    window.addEventListener("ledgrace:notification", receiveNotification);
    return () => window.removeEventListener("ledgrace:notification", receiveNotification);
  }, []);

  useEffect(() => {
    const removeDeletedTransaction = (event) => {
      if (event.detail?.action !== "deleted") return;
      setTransactions((items) => items.filter((item) => item.id !== event.detail.id));
    };

    window.addEventListener("ledgrace:transaction-changed", removeDeletedTransaction);
    return () => window.removeEventListener("ledgrace:transaction-changed", removeDeletedTransaction);
  }, []);

  useEffect(() => {
    const syncWorkspaceFromUrl = () => {
      setActive(getActiveFromPathname());
    };
    
    // Sync on mount in case URL was directly accessed
    syncWorkspaceFromUrl();
    
    // Listen for back/forward button
    window.addEventListener("popstate", syncWorkspaceFromUrl);
    return () => window.removeEventListener("popstate", syncWorkspaceFromUrl);
  }, []);

  const addTransaction = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title || !amount || amount <= 0) return;

    const transaction = {
      ...form,
      amount,
      clientId: crypto.randomUUID(),
      date: new Date().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    try {
      const { data } = await createTransactionRequest(transaction);
      const savedTransaction = toDashboardTransaction(data.transaction);
      setTransactions((items) => [savedTransaction, ...items]);
      setWorkspaceError("");
      window.dispatchEvent(new CustomEvent("ledgrace:transaction-changed", {
        detail: { action: "created", transaction: savedTransaction },
      }));
      window.dispatchEvent(new CustomEvent("ledgrace:notification", {
        detail: {
          title: "Transaction added",
          detail: `${form.title} was added to your ${form.type} activity.`,
        },
      }));
      setForm({ title: "", amount: "", type: "expense", category: "General" });
      setFormOpen(false);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Unable to save this transaction. Please try again.",
      );
    }
  };

  const removeTransaction = async (id) => {
    try {
      await deleteTransactionRequest(id);
      setTransactions((items) => items.filter((item) => item.id !== id));
      setWorkspaceError("");
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Unable to remove this transaction. Please try again.",
      );
    }
  };

  const selectSidebar = (section) => {
    setActive(section);
    setMenuOpen(false);
    const routes = { Dashboard: "/", Accounts: "/accounts", Income: "/income", Expenses: "/expenses", "Budget Planner": "/budget-planner", "Savings Goals": "/savings-goals", "Bills & Subscriptions": "/bills-subscriptions", "Financial Calendar": "/financial-calendar", Analytics: "/analytics", Reports: "/reports", "Financial Health": "/financial-health", "Financial Journey": "/financial-journey", Insights: "/insights" };
    if (routes[section] && window.location.pathname !== routes[section]) {
      window.history.pushState({}, "", routes[section]);
    }
    document.querySelector(".dash-content")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isEmpty = transactions.length === 0;
  const visibleTransactions = transactions.filter((transaction) => {
    const query = search.trim().toLowerCase();
    return !query || transaction.title.toLowerCase().includes(query) || transaction.category.toLowerCase().includes(query);
  });
  const openTransactionForm = (type = "expense") => {
    setForm({ title: "", amount: "", type, category: "General" });
    setFormOpen(true);
  };

  return (
    <div className="app-dashboard">
      <Sidebar
        menu={menuOpen}
        user={user}
        active={active}
        onSelect={selectSidebar}
        onClose={() => setMenuOpen(false)}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <main>
        <header className="app-topbar">
          <button className="dash-menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <label className="dash-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={active === "Accounts" ? "Search accounts..." : "Search transactions..."}
            />
          </label>
          <div>
            <div
              className="notification-center"
              onMouseEnter={() => setNotificationsOpen(true)}
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <button
                className="notification-trigger"
                aria-label="Open notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                {notifications.some((item) => !item.read) && (
                  <b>{notifications.filter((item) => !item.read).length}</b>
                )}
              </button>
              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-heading">
                    <h2>Notifications</h2>
                    <button onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}>Mark all read</button>
                  </div>
                  {notifications.slice(0, 6).map((item) => (
                    <button
                      className={item.read ? "notification-item read" : "notification-item"}
                      key={item.id}
                      onClick={() => setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))}
                    >
                      <span><Bell size={14} /></span>
                      <div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {active !== "Accounts" && (
              active === "Bills & Subscriptions" ? (
                <button className="button primary" onClick={() => window.dispatchEvent(new CustomEvent("ledgrace:open-bill-form"))}>
                  <Plus size={18} /> Add Bill
                </button>
              ) : active === "Financial Calendar" ? (
                <button className="button primary" onClick={() => window.dispatchEvent(new CustomEvent("ledgrace:open-calendar-event"))}>
                  <Plus size={18} /> Add Event
                </button>
              ) : active === "Analytics" ? (
                <button className="button outline analytics-upgrade-export" onClick={() => window.location.assign("/pricing")}>
                  Upgrade for Export
                </button>
              ) : active === "Reports" ? (
                <button className="button primary reports-export-button" onClick={() => window.location.assign("/pricing")}>
                  Export Report
                </button>
              ) : active === "Savings Goals" ? (
                <button className="button primary" onClick={() => window.dispatchEvent(new CustomEvent("ledgrace:open-goal-form"))}>
                  <Plus size={18} /> New Goal
                </button>
              ) : (
                <button className="button primary" onClick={() => openTransactionForm(active === "Income" ? "income" : "expense")}>
                  <Plus size={18} /> Add Transaction
                </button>
              )
            )}
          </div>
        </header>

        <section className="dash-content">
          {workspaceError && <p className="dash-workspace-status">{workspaceError}</p>}
          {active !== "Accounts" && active !== "Income" && active !== "Expenses" && active !== "Budget Planner" && active !== "Bills & Subscriptions" && active !== "Financial Calendar" && active !== "Analytics" && active !== "Reports" && active !== "Insights" && (
            <div className="dash-welcome">
            </div>
          )}

          {active === "Accounts" ? <AccountsManager topSearch={search} /> : active === "Income" ? <IncomeManager topSearch={search} onAddIncome={() => openTransactionForm("income")} period={dashboardPeriod} onPeriodChange={setDashboardPeriod} /> : active === "Expenses" ? <ExpensesManager topSearch={search} onAddExpense={() => openTransactionForm("expense")} period={dashboardPeriod} onPeriodChange={setDashboardPeriod} /> : active === "Budget Planner" ? <BudgetPlanner /> : active === "Savings Goals" ? <SavingsGoalsManager topSearch={search} /> : active === "Bills & Subscriptions" ? <BillsAndSubscriptionsManager topSearch={search} /> : active === "Financial Calendar" ? <FinancialCalendar topSearch={search} /> : active === "Analytics" ? <Analytics topSearch={search} /> : active === "Reports" ? <Reports topSearch={search} /> : active === "Financial Health" ? <FinancialHealth /> : active === "Financial Journey" ? <FinancialJourney /> : active === "Insights" ? <Insights topSearch={search} /> : <>{active !== "Dashboard" && (
            <div className="dash-section-banner">
              <b>{active}</b>
              <span>This workspace is ready for your information. Add transactions to personalise it.</span>
            </div>
          )}

          {isEmpty ? (
            <section className="dash-empty">
              <span><WalletCards /></span>
              <h2>Your dashboard is ready</h2>
              <p>Add income or an expense to start tracking your financial progress. Your balances, trends, and recent activity will appear here.</p>
              <button className="button primary" onClick={() => setFormOpen(true)}>
                <Plus size={18} /> Add your first transaction
              </button>
            </section>
          ) : (
            <>
              <div className="dash-metrics">
                <Metric label="Total Balance" value={totals.income - totals.expenses} icon={WalletCards} />
                <Metric label="Total Income" value={totals.income} icon={TrendingDown} good />
                <Metric label="Total Expenses" value={totals.expenses} icon={TrendingUp} expense />
                <Metric label="Savings Rate" value={totals.income ? `${Math.round(((totals.income - totals.expenses) / totals.income) * 100)}%` : "—"} icon={Target} />
              </div>

              <div className="dash-panels">
                <section className="dash-panel" id="transactions">
                  <div className="dash-panel-title"><h2>Recent Transactions</h2><button onClick={() => setFormOpen(true)}>Add new</button></div>
                  {visibleTransactions.slice(0, 6).map((item) => (
                    <article className="dash-transaction" key={item.id}>
                      <span className={item.type}><CircleDollarSign /></span>
                      <div><b>{item.title}</b><small>{item.category} · {item.date}</small></div>
                      <strong className={item.type}>{item.type === "income" ? "+" : "−"}{money.format(item.amount)}</strong>
                      <button className="dash-remove" onClick={() => removeTransaction(item.id)} aria-label={`Remove ${item.title}`}><Trash2 size={15} /></button>
                    </article>
                  ))}
                  {!visibleTransactions.length && <p className="dash-search-empty">No transactions match your search.</p>}
                </section>
                <section className="dash-panel" id="goals"><div className="dash-panel-title"><h2>Financial snapshot</h2></div><div className="dash-summary"><CircleDollarSign /><p>You have recorded <b>{transactions.length}</b> transaction{transactions.length === 1 ? "" : "s"} this month. Keep adding activity to build clearer insights.</p></div></section>
              </div>
            </>
          )}</>}
        </section>
      </main>

      {formOpen && (
        <div className="dash-modal" role="dialog">
          <form onSubmit={addTransaction}>
            <button type="button" className="dash-modal-close" onClick={() => setFormOpen(false)}><X /></button>
            <h2>Add transaction</h2>
            <p>Track income and expenses as they happen.</p>
            <label>Description<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Grocery shopping" /></label>
            <label>Amount (Naira)<input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></label>
            <div className="dash-form-row">
              <label>Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="expense">Expense</option><option value="income">Income</option></select></label>
              <label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            </div>
            <button className="button primary" type="submit">Save transaction</button>
          </form>
        </div>
      )}
    </div>
  );
}
