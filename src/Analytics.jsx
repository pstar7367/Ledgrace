import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { money } from "./preferences.js";
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
  getAccountsRequest,
  getBillsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";
import { calculateFinancialHealthScore } from "./financialMetrics.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

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

function monthName(date, locale) {
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en-NG";
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
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
      const [transactionsResponse, accountsResponse, billsResponse, goalsResponse] =
        await Promise.all([
          getTransactionsRequest(),
          getAccountsRequest(),
          getBillsRequest(),
          getSavingsGoalsRequest(),
        ]);
      setTransactions(transactionsResponse.data.transactions || []);
      setAccounts(accountsResponse.data.accounts || []);
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
          label: monthName(month, locale),
          income: monthRows
            .filter((item) => item.type === "income")
            .reduce((total, item) => total + item.amount, 0),
          expenses: monthRows
            .filter((item) => item.type === "expense")
            .reduce((total, item) => total + item.amount, 0),
        };
      }),
    [locale, selectedMonth, transactionRows],
  );

  const totalIncome = currentSummary.income;
  const totalExpenses = currentSummary.expenses;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome
    ? Math.max(0, (netSavings / totalIncome) * 100)
    : 0;
  const accountBalance = accounts.reduce(
    (sum, account) =>
      sum + Number(account.currentBalance ?? account.startingBalance ?? 0),
    0,
  );
  const goalSaved = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.savedAmount ?? goal.currentAmount ?? 0),
    0,
  );
  const healthScore = calculateFinancialHealthScore({
    savingsRate,
    accountBalance,
    goalSaved,
    totalExpenses,
    totalIncome,
  });
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
        text: t("income_change_insight", {
          direction: t(incomeChange >= 0 ? "increased" : "decreased"),
          percent: Math.abs(incomeChange).toFixed(1),
          month: monthName(previousMonth, locale),
        }),
      });
    if (totalExpenses || previousSummary.expenses)
      items.push({
        type: "expense",
        text: t("expenses_change_insight", {
          direction: t(expensesChange >= 0 ? "increased" : "decreased"),
          percent: Math.abs(expensesChange).toFixed(1),
          month: monthName(previousMonth, locale),
        }),
      });
    if (totalIncome)
      items.push({
        type: "saving",
        text: t("saved_this_month_insight", {
          amount: money.format(Math.max(netSavings, 0)),
          rate: savingsRate.toFixed(1),
        }),
      });
    if (visibleCategories[0])
      items.push({
        type: "tip",
        text: t("largest_category_insight", { category: visibleCategories[0].name }),
      });
    if (goals.length)
      items.push({
        type: "goal",
        text: t(
          goals.length === 1 ? "goal_tracked_insight" : "goals_tracked_insight",
          { count: goals.length },
        ),
      });
    if (bills.length)
      items.push({
        type: "tip",
        text: t(
          bills.length === 1 ? "plan_item_insight" : "plan_items_insight",
          { count: bills.length },
        ),
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
    locale,
    t,
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
          <h1>{t("analytics")}</h1>
          <p>{t("analytics_description")}</p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
              ariaLabel={t("select_analytics_date")}
        />
      </div>

      {error && <p className="analytics-error">{error}</p>}
      {loading ? (
        <AnalyticsEmpty title={t("loading")} />
      ) : showEmpty ? (
        <AnalyticsEmpty title={t("no_financial_data")} />
      ) : (
        <>
          <div className="analytics-stats">
            <AnalyticsStat
              label={t("total_income")}
              value={money.format(totalIncome)}
              change={incomeChange}
              icon={WalletCards}
              tone="green"
            />
            <AnalyticsStat
              label={t("total_expenses")}
              value={money.format(totalExpenses)}
              change={expensesChange}
              icon={TrendingDown}
              tone="red"
            />
            <AnalyticsStat
              label={t("net_savings")}
              value={money.format(netSavings)}
              change={savingsChange}
              icon={TrendingUp}
              tone="purple"
            />
            <AnalyticsStat
              label={t("savings_rate")}
              value={`${savingsRate.toFixed(1)}%`}
              change={savingsRate}
              icon={PieChart}
              tone="blue"
            />
          </div>

          <div className="analytics-grid">
            <section className="analytics-card analytics-income-chart">
              <AnalyticsCardTitle
                title={t("income_vs_expenses")}
                subtitle={t("your_activity_in", {
                  month: monthName(selectedMonth, locale),
                })}
              />
              <div className="analytics-line-key">
                <span className="income" /> {t("income")} <span className="expense" />{" "}
                {t("expenses")}
              </div>
              <svg
                viewBox="0 0 520 185"
                role="img"
                aria-label={t("income_expense_trend")}
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
                title={t("expense_breakdown")}
                subtitle={t("spending_period", {
                  month: monthName(selectedMonth, locale),
                })}
              />
              {visibleCategories.length ? (
                <div className="analytics-donut-content">
                  <div
                    className="analytics-donut"
                    style={{ background: donutStyle }}
                  >
                    <div>
                      <b>{money.format(totalCategorySpend)}</b>
                      <small>{t("total_expenses")}</small>
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
                <AnalyticsEmpty title={t("no_data")} compact />
              )}
            </section>

            <aside className="analytics-card analytics-insights">
              <AnalyticsCardTitle title={t("insights")} />
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
                title={t("spending_trends")}
                subtitle={t("expense_pattern_last_6_months")}
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
                {t("spending_comparison", {
                  month: monthName(selectedMonth, locale),
                  direction: t(expensesChange >= 0 ? "higher" : "lower"),
                  previousMonth: monthName(previousMonth, locale),
                })}
              </p>
            </section>

            <section className="analytics-card analytics-categories">
              <AnalyticsCardTitle title={t("top_spending_categories")} />
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
                <AnalyticsEmpty title={t("no_data")} compact />
              )}
            </section>

            <aside className="analytics-right-stack">
              <section className="analytics-card analytics-health">
                <AnalyticsCardTitle title={t("financial_health_score")} />
                <div className="health-score">
                  <div style={{ "--score": `${healthScore}%` }}>
                    <b>{healthScore}</b>
                    <small>/100</small>
                  </div>
                  <section>
                    <b>
                      {healthScore >= 70
                        ? t("excellent")
                        : healthScore >= 45
                          ? t("good")
                          : t("getting_started")}
                    </b>
                    <p>
                      {healthScore >= 70
                        ? t("strong_financial_habits")
                        : t("keep_recording_activity")}
                    </p>
                  </section>
                </div>
              </section>
              <section className="analytics-card analytics-quick-filters">
                <AnalyticsCardTitle title={t("quick_filters")} />
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
                      {t(filter.toLowerCase())}
                    </button>
                  ))}
                </div>
                {focus !== "Overview" && (
                  <p>
                    {t("showing_view", { view: t(focus.toLowerCase()) })}
                  </p>
                )}
              </section>
              <section className="analytics-card analytics-premium-lock">
                <LockKeyhole />
                <div>
                  <b>{t("export_reports_premium")}</b>
                  <p>{t("upgrade_plan_export")}</p>
                </div>
                <button onClick={() => window.location.assign("/pricing")}>
                  <Crown size={14} /> {t("upgrade")}
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
  const { t } = useTranslation();
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
          {t("change_from_last_month", {
            percent: Math.abs(change).toFixed(1),
          })}
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
  const { t } = useTranslation();
  return (
    <div className={compact ? "analytics-empty compact" : "analytics-empty"}>
      <Icon />
      <h2>{title}</h2>
      {!compact && (
        <p>
          {t("analytics_empty_description")}
        </p>
      )}
    </div>
  );
}
