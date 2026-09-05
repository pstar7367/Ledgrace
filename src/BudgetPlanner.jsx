import { useCallback, useEffect, useMemo, useState } from "react";
import { money } from "./preferences.js";
import {
  AlertTriangle,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { getTransactionsRequest } from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

function toMonthDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthKey(dateValue) {
  const date = toMonthDate(dateValue);
  if (!date) return "unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthName(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function clampPercentage(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function BudgetPlanner({ topSearch = "" }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartMode, setChartMode] = useState("actual");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getTransactionsRequest();
      setTransactions(data.transactions || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your budget data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadTransactions, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadTransactions]);

  useEffect(() => {
    window.addEventListener("ledgrace:transaction-changed", loadTransactions);
    return () =>
      window.removeEventListener(
        "ledgrace:transaction-changed",
        loadTransactions,
      );
  }, [loadTransactions]);

  const selectedMonthKey = getMonthKey(selectedDate);
  const selectedMonthTransactions = useMemo(
    () =>
      transactions.filter(
        (item) => getMonthKey(item.createdAt || item.date) === selectedMonthKey,
      ),
    [transactions, selectedMonthKey],
  );

  const thisMonthTransactions = useMemo(
    () => selectedMonthTransactions.filter((item) => item.type === "expense"),
    [selectedMonthTransactions],
  );

  const selectedMonthIncome = useMemo(
    () =>
      selectedMonthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [selectedMonthTransactions],
  );

  const currentMonthTotal = useMemo(
    () =>
      thisMonthTransactions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
    [thisMonthTransactions],
  );

  const categoryUsage = useMemo(() => {
    const totals = new Map();
    thisMonthTransactions.forEach((item) => {
      const category = item.category || "Other";
      totals.set(
        category,
        (totals.get(category) || 0) + Number(item.amount || 0),
      );
    });

    const totalSpent = [...totals.values()].reduce(
      (sum, amount) => sum + amount,
      0,
    );
    return [...totals.entries()]
      .map(([name, used]) => {
        const budget =
          totalSpent > 0 ? selectedMonthIncome * (used / totalSpent) : 0;
        return { name, budget, used, remaining: budget - used };
      })
      .sort((a, b) => b.used - a.used);
  }, [thisMonthTransactions, selectedMonthIncome]);

  const visibleCategoryUsage = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    return query
      ? categoryUsage.filter((item) => item.name.toLowerCase().includes(query))
      : categoryUsage;
  }, [categoryUsage, topSearch]);

  const totalBudget = selectedMonthIncome;
  const budgetUsed = currentMonthTotal;
  const remainingBudget = totalBudget - budgetUsed;
  const healthPercent = totalBudget
    ? clampPercentage((remainingBudget / totalBudget) * 100)
    : 0;

  const alarms = useMemo(() => {
    const rows = categoryUsage
      .filter((item) => item.used > item.budget || item.remaining < 0)
      .map((item) => ({
        title: `${item.name} budget on track`,
        detail:
          item.used > item.budget
            ? `You've spent ${money.format(item.used)} of your ${money.format(item.budget)} ${item.name.toLowerCase()} budget.`
            : `You have ${money.format(item.remaining)} left in your ${item.name.toLowerCase()} budget.`,
      }));

    if (!rows.length) {
      return [
        {
          title: "Everything is on track",
          detail: "Your current spending is within the planned limits.",
        },
      ];
    }
    return rows.slice(0, 3);
  }, [categoryUsage]);

  const tips = useMemo(
    () => [
      `Spending on ${categoryUsage[0]?.name || "expenses"} is ${Math.round(((categoryUsage[0]?.used || 0) / Math.max(categoryUsage[0]?.budget || 1, 1)) * 100)}% of your limit.`,
      "Track your daily spending to stay within budget.",
      "Review your expenses weekly to identify spending patterns.",
    ],
    [categoryUsage],
  );

  const budgetHistory = useMemo(() => {
    const selectedDateValue = toMonthDate(selectedDate) || new Date();
    const monthKeys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        selectedDateValue.getFullYear(),
        selectedDateValue.getMonth() - (5 - index),
        1,
      );
      return getMonthKey(date);
    });

    return monthKeys.map((monthKey) => {
      const [year, monthNumber] = monthKey.split("-").map(Number);
      const date = new Date(year, monthNumber - 1, 1);
      const monthTransactions = transactions.filter(
        (item) => getMonthKey(item.createdAt || item.date) === monthKey,
      );
      const budget = monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const actual = monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        month: monthName(date),
        budget,
        actual,
        savings: budget - actual,
        rate: budget ? clampPercentage((actual / budget) * 100) : 0,
      };
    });
  }, [transactions, selectedDate]);

  const chartSeries = useMemo(() => {
    if (budgetHistory.length === 0) return [];
    const values = budgetHistory.map((item) =>
      chartMode === "budget" ? item.budget : item.actual,
    );
    const maxValue = Math.max(...values, 1);
    return values.map((value, index) => {
      const x =
        values.length === 1 ? 50 : 6 + index * (88 / (values.length - 1));
      const y = 90 - (value / maxValue) * 76;
      return {
        label: budgetHistory[index].month.split(" ")[0],
        value,
        x,
        y,
      };
    });
  }, [budgetHistory, chartMode]);

  const chartLineColor = chartMode === "budget" ? "#1458ed" : "#00a978";

  if (loading) {
    return (
      <section className="budget-planner-page">
        <div className="budget-loading">Loading budget planner…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="budget-planner-page">
        <div className="budget-empty-state">
          <AlertTriangle />
          <h2>Budget planner unavailable</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="budget-planner-page">
      <div className="budget-header-row">
        <div>
          <h1>Budget Planner</h1>
          <p>Plan your monthly budget and stay on track.</p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel="Select budget date"
        />
      </div>

      <div className="budget-summary-grid">
        <article className="budget-card">
          <div className="budget-card-header">
            <span className="budget-icon blue">
              <WalletCards />
            </span>
            <small>Total Budget</small>
          </div>
          <strong>{money.format(totalBudget)}</strong>
          <div className="budget-delta positive">
            <TrendingUp size={12} /> Based on income for this month
          </div>
        </article>

        <article className="budget-card">
          <div className="budget-card-header">
            <span className="budget-icon rose">
              <TrendingDown />
            </span>
            <small>Budget Used</small>
          </div>
          <strong>{money.format(budgetUsed)}</strong>
          <div className="budget-delta neutral">
            <span
              className="mini-progress"
              style={{
                width: `${totalBudget ? Math.min((budgetUsed / totalBudget) * 100, 100) : 0}%`,
              }}
            />
            {totalBudget
              ? `${Math.round((budgetUsed / totalBudget) * 100)}% of income`
              : "No income yet"}
          </div>
        </article>

        <article className="budget-card">
          <div className="budget-card-header">
            <span className="budget-icon green">
              <PiggyBank />
            </span>
            <small>Remaining Budget</small>
          </div>
          <strong>{money.format(remainingBudget)}</strong>
          <div className="budget-delta positive">
            {Math.max(healthPercent, 0)}% Left
          </div>
        </article>

        <article className="budget-card">
          <div className="budget-card-header">
            <span className="budget-icon purple">
              <WalletCards />
            </span>
            <small>Budget Health</small>
          </div>
          <strong>
            {totalBudget === 0
              ? "No budget yet"
              : remainingBudget >= 0
                ? "On track"
                : "Over budget"}
          </strong>
          <div className="budget-delta positive">
            <div
              className="budget-health-ring"
              style={{ "--health": `${healthPercent}%` }}
            >
              <span>{Math.round(healthPercent)}%</span>
            </div>
          </div>
        </article>
      </div>

      <div className="budget-main-grid">
        <div className="budget-main-panel">
          <div className="budget-panel-head">
            <h2>Spending Trend</h2>
            <div className="budget-panel-actions">
              <button
                type="button"
                className={
                  chartMode === "budget"
                    ? "budget-toggle active"
                    : "budget-toggle"
                }
                onClick={() => setChartMode("budget")}
              >
                Budget
              </button>
              <button
                type="button"
                className={
                  chartMode === "actual"
                    ? "budget-toggle active"
                    : "budget-toggle"
                }
                onClick={() => setChartMode("actual")}
              >
                Actual
              </button>
            </div>
          </div>

          <div className="budget-chart-zone">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label="Budget overview chart"
            >
              <polyline
                points={chartSeries
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
                fill="none"
                stroke={chartLineColor}
                strokeWidth="2.4"
                vectorEffect="non-scaling-stroke"
              />
              {chartSeries.map((point) => (
                <circle
                  key={`${point.label}-${chartMode}`}
                  cx={point.x}
                  cy={point.y}
                  r="2.2"
                  fill="#fff"
                  stroke={chartLineColor}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="budget-chart-labels">
              {chartSeries.map((point) => (
                <span key={`${point.label}-${chartMode}-label`}>
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="budget-side-panel">
          <div className="budget-panel-head smaller">
            <h2>Budget Distribution</h2>
          </div>
          <div className="budget-donut-wrap">
            <div
              className={
                visibleCategoryUsage.length ? "budget-donut" : "budget-donut empty"
              }
              style={
                visibleCategoryUsage.length
                  ? {
                      background: `conic-gradient(${categoryUsage
                        .slice(0, 6)
                        .map((entry, index) => {
                          const colors = [
                            "#1458ed",
                            "#f04e61",
                            "#00a978",
                            "#f59e0b",
                            "#8b5cf6",
                            "#2ca9da",
                          ];
                          const total = totalBudget || 1;
                          const start =
                            (visibleCategoryUsage
                              .slice(0, index)
                              .reduce((sum, item) => sum + item.used, 0) /
                              total) *
                            100;
                          const end = start + (entry.used / total) * 100;
                          return `${colors[index % colors.length]} ${start}% ${end}%`;
                        })
                        .join(", ")})`,
                    }
                  : undefined
              }
            >
              <div className="budget-donut-inner">
                <b>{money.format(totalBudget)}</b>
                <small>Total Budget</small>
              </div>
            </div>
            <div className="budget-category-list">
              {!visibleCategoryUsage.length && (
                <p className="budget-no-data">
                  Add an expense to see your category distribution.
                </p>
              )}
              {visibleCategoryUsage.slice(0, 6).map((entry, index) => {
                const colors = [
                  "#1458ed",
                  "#f04e61",
                  "#00a978",
                  "#f59e0b",
                  "#8b5cf6",
                  "#2ca9da",
                ];
                return (
                  <div key={entry.name} className="budget-category-item">
                    <span
                      className="budget-dot"
                      style={{ background: colors[index % colors.length] }}
                    />
                    <div className="budget-category-copy">
                      <b>{entry.name}</b>
                      <small>{money.format(entry.used)}</small>
                    </div>
                    <strong>
                      {Math.round(
                        (entry.used / Math.max(entry.budget, 1)) * 100,
                      )}
                      %
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="budget-lower-grid">
        <div className="budget-table-panel">
          <div className="budget-panel-head">
            <h2>Budget by Category</h2>
            {visibleCategoryUsage.length > 5 && (
              <button
                type="button"
                className="text-link"
                onClick={() => setShowAllCategories((current) => !current)}
              >
                {showAllCategories ? "Show less" : "View all"}
              </button>
            )}
          </div>

          <table className="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!visibleCategoryUsage.length && (
                <tr>
                  <td colSpan="6" className="budget-table-empty">
                    {topSearch.trim()
                      ? `No budget categories match "${topSearch.trim()}".`
                      : "No expense categories for this month yet."}
                  </td>
                </tr>
              )}
              {visibleCategoryUsage
                .slice(0, showAllCategories ? categoryUsage.length : 5)
                .map((entry, index) => {
                  const colors = [
                    "#1458ed",
                    "#f04e61",
                    "#00a978",
                    "#f59e0b",
                    "#8b5cf6",
                    "#2ca9da",
                  ];
                  const progress = clampPercentage(
                    (entry.used / entry.budget) * 100,
                  );
                  const status =
                    progress > 100
                      ? "Over Budget"
                      : progress > 85
                        ? "Almost Full"
                        : "Good";
                  return (
                    <tr key={entry.name}>
                      <td>
                        <span className="category-name">
                          <span
                            className="budget-dot"
                            style={{
                              background: colors[index % colors.length],
                            }}
                          />
                          {entry.name}
                        </span>
                      </td>
                      <td>{money.format(entry.budget)}</td>
                      <td>{money.format(entry.used)}</td>
                      <td>{money.format(entry.remaining)}</td>
                      <td>
                        <div className="progress-cell">
                          <span
                            className="progress-bar"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${status === "Over Budget" ? "bad" : status === "Almost Full" ? "warn" : "good"}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <aside className="budget-side-stack">
          <div className="budget-alert-card">
            <div className="budget-panel-head smaller">
              <h2>Budget Alerts</h2>
            </div>
            {alarms.map((alert) => (
              <div key={alert.title} className="alert-item">
                <span className="alert-badge">
                  <AlertTriangle size={14} />
                </span>
                <div>
                  <b>{alert.title}</b>
                  <p>{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="budget-tips-card">
            <div className="budget-panel-head smaller">
              <h2>Budget Tips</h2>
            </div>
            <ul className="tips-list">
              {tips.map((tip, index) => (
                <li key={tip}>
                  {index + 1}. {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="budget-summary-card">
            <div className="budget-panel-head smaller">
              <h2>Monthly Summary</h2>
            </div>
            <p>
              {totalBudget ? (
                <>
                  You have spent{" "}
                  <b>{Math.round((budgetUsed / totalBudget) * 100)}%</b> of your
                  income-based budget.
                </>
              ) : (
                "Add income for this month to set your budget automatically."
              )}
            </p>
            <div className="summary-meter">
              <span
                style={{
                  width: `${totalBudget ? Math.min((budgetUsed / totalBudget) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <small>
              {money.format(budgetUsed)} spent of {money.format(totalBudget)}
            </small>
          </div>
        </aside>
      </div>

      <div className="budget-history-panel">
        <div className="budget-panel-head">
          <h2>Budget History</h2>
          {budgetHistory.length > 6 && (
            <button
              type="button"
              className="text-link"
              onClick={() => setShowAllHistory((current) => !current)}
            >
              {showAllHistory ? "Show less" : "View all"}
            </button>
          )}
        </div>

        <table className="budget-table compact">
          <thead>
            <tr>
              <th>Month</th>
              <th>Budget</th>
              <th>Actual Spending</th>
              <th>Savings</th>
              <th>Savings Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetHistory.slice(showAllHistory ? 0 : -6).map((entry) => (
              <tr key={entry.month}>
                <td>{entry.month}</td>
                <td>{money.format(entry.budget)}</td>
                <td>{money.format(entry.actual)}</td>
                <td>{money.format(entry.savings)}</td>
                <td>{Math.round(entry.rate)}%</td>
                <td>
                  <span
                    className={`status-pill ${entry.actual > entry.budget ? "bad" : entry.rate > 80 ? "warn" : "good"}`}
                  >
                    {entry.actual > entry.budget
                      ? "Over"
                      : entry.rate > 80
                        ? "On Track"
                        : "Good"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
