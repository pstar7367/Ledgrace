import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleDollarSign,
  Crown,
  Lightbulb,
  LockKeyhole,
  PieChart,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  getBillsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const categoryColors = [
  "#1458ed",
  "#00a978",
  "#f59e0b",
  "#8b5cf6",
  "#1fa5bd",
  "#ef6d7a",
  "#94a3b8",
];

function dateForTransaction(transaction) {
  const date = new Date(transaction.createdAt || transaction.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameMonth(date, monthDate) {
  return (
    date.getFullYear() === monthDate.getFullYear() &&
    date.getMonth() === monthDate.getMonth()
  );
}

function monthName(date) {
  return date.toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

function percentageChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getMonthList(anchorDate) {
  return Array.from(
    { length: 6 },
    (_, index) =>
      new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth() - (5 - index),
        1,
      ),
  );
}

function buildLinePath(values, width = 520, height = 185) {
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = 16 + (index * (width - 32)) / Math.max(values.length - 1, 1);
      const y = height - 16 - (value / max) * (height - 32);
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function Analytics({ topSearch = "" }) {
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [focus, setFocus] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedMonth = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsResponse, billsResponse, goalsResponse] =
        await Promise.all([
          getTransactionsRequest(),
          getBillsRequest(),
          getSavingsGoalsRequest(),
        ]);
      setTransactions(transactionsResponse.data.transactions || []);
      setBills(billsResponse.data.bills || []);
      setGoals(goalsResponse.data.goals || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load analytics right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadAnalytics, 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const transactionRows = useMemo(
    () =>
      transactions
        .map((transaction) => ({
          ...transaction,
          actualDate: dateForTransaction(transaction),
          amount: Number(transaction.amount || 0),
        }))
        .filter((transaction) => transaction.actualDate),
    [transactions],
  );

  const currentRows = useMemo(
    () =>
      transactionRows.filter((item) =>
        sameMonth(item.actualDate, selectedMonth),
      ),
    [transactionRows, selectedMonth],
  );
  const previousMonth = useMemo(
    () =>
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    [selectedMonth],
  );
  const previousRows = useMemo(
    () =>
      transactionRows.filter((item) =>
        sameMonth(item.actualDate, previousMonth),
      ),
    [transactionRows, previousMonth],
  );

  const currentSummary = useMemo(
    () =>
      currentRows.reduce(
        (summary, item) => ({
          income: summary.income + (item.type === "income" ? item.amount : 0),
          expenses:
            summary.expenses + (item.type === "expense" ? item.amount : 0),
        }),
        { income: 0, expenses: 0 },
      ),
    [currentRows],
  );

  const previousSummary = useMemo(
    () =>
      previousRows.reduce(
        (summary, item) => ({
          income: summary.income + (item.type === "income" ? item.amount : 0),
          expenses:
            summary.expenses + (item.type === "expense" ? item.amount : 0),
        }),
        { income: 0, expenses: 0 },
      ),
    [previousRows],
  );

  const categoryData = useMemo(() => {
    const categories = new Map();
    currentRows
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const name = item.category || "Other";
        categories.set(name, (categories.get(name) || 0) + item.amount);
      });
    return [...categories.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((first, second) => second.amount - first.amount);
  }, [currentRows]);

  const visibleCategories = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    return query
      ? categoryData.filter((item) => item.name.toLowerCase().includes(query))
      : categoryData;
  }, [categoryData, topSearch]);

  const sixMonthData = useMemo(
    () =>
      getMonthList(selectedMonth).map((month) => {
        const monthRows = transactionRows.filter((item) =>
          sameMonth(item.actualDate, month),
        );
        return {
          label: monthName(month),
          income: monthRows
            .filter((item) => item.type === "income")
            .reduce((total, item) => total + item.amount, 0),
          expenses: monthRows
            .filter((item) => item.type === "expense")
            .reduce((total, item) => total + item.amount, 0),
        };
      }),
    [selectedMonth, transactionRows],
  );

  const totalIncome = currentSummary.income;
  const totalExpenses = currentSummary.expenses;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome
    ? Math.max(0, (netSavings / totalIncome) * 100)
    : 0;
  const healthScore = Math.round(
    Math.min(
      100,
      Math.max(0, savingsRate * 1.35 + (currentRows.length ? 20 : 0)),
    ),
  );
  const incomeChange = percentageChange(totalIncome, previousSummary.income);
  const expensesChange = percentageChange(
    totalExpenses,
    previousSummary.expenses,
  );
  const savingsChange = percentageChange(
    netSavings,
    previousSummary.income - previousSummary.expenses,
  );
  const totalCategorySpend = visibleCategories.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const donutStyle = totalCategorySpend
    ? `conic-gradient(${visibleCategories
        .map((item, index) => {
          const start = visibleCategories
            .slice(0, index)
            .reduce(
              (total, entry) =>
                total + (entry.amount / totalCategorySpend) * 100,
              0,
            );
          const end = start + (item.amount / totalCategorySpend) * 100;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(", ")})`
    : "conic-gradient(#e9eef6 0 100%)";

  const insightItems = useMemo(() => {
    const items = [];
    if (totalIncome || previousSummary.income)
      items.push({
        type: "income",
        text: `Income ${incomeChange >= 0 ? "increased" : "decreased"} by ${Math.abs(incomeChange).toFixed(1)}% compared with ${monthName(previousMonth)}.`,
      });
    if (totalExpenses || previousSummary.expenses)
      items.push({
        type: "expense",
        text: `Expenses ${expensesChange >= 0 ? "increased" : "decreased"} by ${Math.abs(expensesChange).toFixed(1)}% compared with ${monthName(previousMonth)}.`,
      });
    if (totalIncome)
      items.push({
        type: "saving",
        text: `You saved ${money.format(Math.max(netSavings, 0))} this month, with a ${savingsRate.toFixed(1)}% savings rate.`,
      });
    if (visibleCategories[0])
      items.push({
        type: "tip",
        text: `${visibleCategories[0].name} is your largest spending category this month.`,
      });
    if (goals.length)
      items.push({
        type: "goal",
        text: `You have ${goals.length} savings goal${goals.length === 1 ? "" : "s"} being tracked.`,
      });
    if (bills.length)
      items.push({
        type: "tip",
        text: `You have ${bills.length} bill or subscription item${bills.length === 1 ? "" : "s"} in your financial plan.`,
      });
    return items;
  }, [
    bills.length,
    expensesChange,
    goals.length,
    incomeChange,
    netSavings,
    previousMonth,
    previousSummary.expenses,
    previousSummary.income,
    savingsRate,
    totalExpenses,
    totalIncome,
    visibleCategories,
  ]);

  const maxMonthly = Math.max(
    ...sixMonthData.flatMap((item) => [item.income, item.expenses]),
    1,
  );
  const quickFilters = ["Overview", "Income", "Expenses", "Savings", "Debts"];
  const showEmpty = !loading && transactionRows.length === 0;

  return (
    <section className="analytics-page">
      <div className="analytics-heading">
        <div>
          <h1>Analytics</h1>
          <p>Gain insights into your financial activities and trends.</p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel="Select analytics date"
        />
      </div>

      {error && <p className="analytics-error">{error}</p>}
      {loading ? (
        <AnalyticsEmpty title="Loading your analytics…" />
      ) : showEmpty ? (
        <AnalyticsEmpty title="No financial data yet" />
      ) : (
        <>
          <div className="analytics-stats">
            <AnalyticsStat
              label="Total Income"
              value={money.format(totalIncome)}
              change={incomeChange}
              icon={WalletCards}
              tone="green"
            />
            <AnalyticsStat
              label="Total Expenses"
              value={money.format(totalExpenses)}
              change={expensesChange}
              icon={TrendingDown}
              tone="red"
            />
            <AnalyticsStat
              label="Net Savings"
              value={money.format(netSavings)}
              change={savingsChange}
              icon={TrendingUp}
              tone="purple"
            />
            <AnalyticsStat
              label="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              change={savingsRate}
              icon={PieChart}
              tone="blue"
            />
          </div>

          <div className="analytics-grid">
            <section className="analytics-card analytics-income-chart">
              <AnalyticsCardTitle
                title="Income vs Expenses"
                subtitle={`Your activity in ${monthName(selectedMonth)}.`}
              />
              <div className="analytics-line-key">
                <span className="income" /> Income <span className="expense" />{" "}
                Expenses
              </div>
              <svg
                viewBox="0 0 520 185"
                role="img"
                aria-label="Income and expense trend"
              >
                {[32, 70, 108, 146].map((y) => (
                  <line key={y} x1="16" x2="504" y1={y} y2={y} />
                ))}
                <path
                  className="line-income"
                  d={buildLinePath(sixMonthData.map((item) => item.income))}
                />
                <path
                  className="line-expense"
                  d={buildLinePath(sixMonthData.map((item) => item.expenses))}
                />
              </svg>
              <div className="analytics-chart-labels">
                {sixMonthData.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </section>

            <section className="analytics-card analytics-breakdown">
              <AnalyticsCardTitle
                title="Expense Breakdown"
                subtitle={`${monthName(selectedMonth)} spending.`}
              />
              {visibleCategories.length ? (
                <div className="analytics-donut-content">
                  <div
                    className="analytics-donut"
                    style={{ background: donutStyle }}
                  >
                    <div>
                      <b>{money.format(totalCategorySpend)}</b>
                      <small>Total Expenses</small>
                    </div>
                  </div>
                  <div className="analytics-legend">
                    {visibleCategories.map((item) => (
                      <div key={item.name}>
                        <i style={{ background: item.color }} />
                        <span>{item.name}</span>
                        <strong>
                          {totalCategorySpend
                            ? (
                                (item.amount / totalCategorySpend) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <AnalyticsEmpty title="No expenses in this month" compact />
              )}
            </section>

            <aside className="analytics-card analytics-insights">
              <AnalyticsCardTitle title="Insights" />
              {insightItems.map((item) => (
                <article key={item.text} className={item.type}>
                  <span>
                    {item.type === "income" ? (
                      <TrendingUp />
                    ) : item.type === "expense" ? (
                      <TrendingDown />
                    ) : item.type === "tip" ? (
                      <Lightbulb />
                    ) : (
                      <ChartNoAxesCombined />
                    )}
                  </span>
                  <p>{item.text}</p>
                </article>
              ))}
            </aside>

            <section className="analytics-card analytics-spending">
              <AnalyticsCardTitle
                title="Spending Trends"
                subtitle="Your expense pattern over the last 6 months."
              />
              <div className="analytics-bars">
                {sixMonthData.map((item) => (
                  <div key={item.label}>
                    <span
                      style={{
                        height: `${(item.expenses / maxMonthly) * 150}px`,
                      }}
                    >
                      <i
                        style={{
                          height: `${(item.income ? Math.min(item.expenses / item.income, 1) : 1) * 46}px`,
                        }}
                      />
                    </span>
                    <b>{item.label}</b>
                  </div>
                ))}
              </div>
              <p className="analytics-callout">
                Your spending in {monthName(selectedMonth)} is{" "}
                {expensesChange >= 0 ? "higher" : "lower"} than{" "}
                {monthName(previousMonth)}.
              </p>
            </section>

            <section className="analytics-card analytics-categories">
              <AnalyticsCardTitle title="Top Spending Categories" />
              {visibleCategories.length ? (
                visibleCategories.map((item) => (
                  <div className="analytics-category-row" key={item.name}>
                    <span
                      style={{
                        background: `${item.color}18`,
                        color: item.color,
                      }}
                    >
                      {item.name.slice(0, 1)}
                    </span>
                    <b>{item.name}</b>
                    <i>
                      <em
                        style={{
                          width: `${totalCategorySpend ? (item.amount / totalCategorySpend) * 100 : 0}%`,
                          background: item.color,
                        }}
                      />
                    </i>
                    <strong>{money.format(item.amount)}</strong>
                  </div>
                ))
              ) : (
                <AnalyticsEmpty title="No categories yet" compact />
              )}
            </section>

            <aside className="analytics-right-stack">
              <section className="analytics-card analytics-health">
                <AnalyticsCardTitle title="Financial Health Score" />
                <div className="health-score">
                  <div style={{ "--score": `${healthScore}%` }}>
                    <b>{healthScore}</b>
                    <small>/100</small>
                  </div>
                  <section>
                    <b>
                      {healthScore >= 70
                        ? "Excellent"
                        : healthScore >= 45
                          ? "Good"
                          : "Getting started"}
                    </b>
                    <p>
                      {healthScore >= 70
                        ? "You are building strong financial habits."
                        : "Keep recording activity to build your score."}
                    </p>
                  </section>
                </div>
              </section>
              <section className="analytics-card analytics-quick-filters">
                <AnalyticsCardTitle title="Quick Filters" />
                <div>
                  {quickFilters.map((filter) => (
                    <button
                      className={focus === filter ? "active" : ""}
                      key={filter}
                      onClick={() => setFocus(filter)}
                    >
                      <span>
                        {filter === "Income" ? (
                          <TrendingUp />
                        ) : filter === "Expenses" ? (
                          <TrendingDown />
                        ) : filter === "Savings" ? (
                          <WalletCards />
                        ) : (
                          <PieChart />
                        )}
                      </span>
                      {filter}
                    </button>
                  ))}
                </div>
                {focus !== "Overview" && (
                  <p>
                    Showing your {focus.toLowerCase()} view using current saved
                    data.
                  </p>
                )}
              </section>
              <section className="analytics-card analytics-premium-lock">
                <LockKeyhole />
                <div>
                  <b>Export reports is Premium</b>
                  <p>Upgrade your plan to export CSV and PDF reports.</p>
                </div>
                <button onClick={() => window.location.assign("/pricing")}>
                  <Crown size={14} /> Upgrade
                </button>
              </section>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}

function AnalyticsCardTitle({ title, subtitle }) {
  return (
    <div className="analytics-card-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function AnalyticsStat({ label, value, change, icon: Icon, tone }) {
  const positive = change >= 0;
  return (
    <article className="analytics-stat">
      <span className={tone}>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em className={positive ? "positive" : "negative"}>
          {positive ? <ArrowUpRight /> : <ArrowDownRight />}
          {Math.abs(change).toFixed(1)}% from last month
        </em>
      </div>
    </article>
  );
}

function AnalyticsEmpty({
  title,
  compact = false,
  icon: Icon = CircleDollarSign,
}) {
  return (
    <div className={compact ? "analytics-empty compact" : "analytics-empty"}>
      <Icon />
      <h2>{title}</h2>
      {!compact && (
        <p>
          Add income or expenses to see real-time trends, categories, and
          financial insights here.
        </p>
      )}
    </div>
  );
}
