import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { money } from "./preferences.js";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Lightbulb,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import {
  getAccountsRequest,
  getBillsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";
import { calculateFinancialHealthScore } from "./financialMetrics.js";

const colors = [
  "#1458ed",
  "#00a978",
  "#f59e0b",
  "#8b5cf6",
  "#ef6d7a",
  "#1fa5bd",
  "#94a3b8",
];

function asDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameMonth(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

function monthLabel(value, locale, options = { month: "short" }) {
  return value.toLocaleDateString(locale, options);
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function amountOf(item) {
  return Number(item.amount || item.value || 0);
}

function buildPath(values, width = 520, height = 170) {
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = 14 + (index * (width - 28)) / Math.max(values.length - 1, 1);
      const y = height - 16 - (value / max) * (height - 34);
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatWeekRange(date, locale) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString(locale, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function Insights({ topSearch = "" }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en-US";
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDateValue, setSelectedDateValue] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [period, setPeriod] = useState("6");
  const [insightIndex, setInsightIndex] = useState(0);
  const [behaviorExpanded, setBehaviorExpanded] = useState(false);
  const [actionPlanExpanded, setActionPlanExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dateInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError("");
      try {
        const [
          transactionsResponse,
          billsResponse,
          goalsResponse,
          accountsResponse,
        ] = await Promise.all([
          getTransactionsRequest(),
          getBillsRequest(),
          getSavingsGoalsRequest(),
          getAccountsRequest(),
        ]);
        if (!active) return;
        setTransactions(transactionsResponse.data.transactions || []);
        setBills(billsResponse.data.bills || []);
        setGoals(goalsResponse.data.goals || []);
        setAccounts(accountsResponse.data.accounts || []);
      } catch (requestError) {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Unable to load your insights right now.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const refresh = () => load(false);
    window.addEventListener("ledgrace:transaction-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("ledgrace:transaction-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const selectedDate = useMemo(
    () => new Date(`${selectedDateValue}T00:00:00`),
    [selectedDateValue],
  );
  const selectedMonth = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate],
  );

  const rows = useMemo(
    () =>
      transactions
        .map((item) => ({
          ...item,
          dateValue: asDate(item.createdAt || item.date),
          numericAmount: amountOf(item),
        }))
        .filter((item) => item.dateValue),
    [transactions],
  );

  const currentRows = useMemo(
    () => rows.filter((item) => sameMonth(item.dateValue, selectedMonth)),
    [rows, selectedMonth],
  );
  const previousMonth = useMemo(
    () =>
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    [selectedMonth],
  );
  const previousRows = useMemo(
    () => rows.filter((item) => sameMonth(item.dateValue, previousMonth)),
    [rows, previousMonth],
  );
  const expenseRows = currentRows.filter((item) => item.type === "expense");
  const income = currentRows
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.numericAmount, 0);
  const expenses = expenseRows.reduce(
    (sum, item) => sum + item.numericAmount,
    0,
  );
  const previousExpenses = previousRows
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.numericAmount, 0);
  const netSavings = income - expenses;
  const savingsRate = income ? Math.max(0, (netSavings / income) * 100) : 0;
  const accountBalance = accounts.reduce(
    (sum, account) =>
      sum + Number(account.currentBalance ?? account.startingBalance ?? 0),
    0,
  );
  const goalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.savedAmount ?? goal.currentAmount ?? 0),
    0,
  );
  const spendingChange = percentChange(expenses, previousExpenses);

  const categories = (() => {
    const grouped = new Map();
    expenseRows.forEach((item) => {
      const name = item.category || "Other";
      grouped.set(name, (grouped.get(name) || 0) + item.numericAmount);
    });
    return [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({
        name,
        amount,
        color: colors[index % colors.length],
      }));
  })();
  const visibleCategories = (() => {
    const query = topSearch.trim().toLowerCase();
    return query
      ? categories.filter((item) => item.name.toLowerCase().includes(query))
      : categories;
  })();

  const months = useMemo(
    () =>
      Array.from(
        { length: Number(period) },
        (_, index) =>
          new Date(
            selectedMonth.getFullYear(),
            selectedMonth.getMonth() - (Number(period) - index - 1),
            1,
          ),
      ),
    [period, selectedMonth],
  );
  const trend = useMemo(
    () =>
      months.map((month) => ({
        month,
        expenses: rows
          .filter(
            (item) =>
              item.type === "expense" && sameMonth(item.dateValue, month),
          )
          .reduce((sum, item) => sum + item.numericAmount, 0),
      })),
    [months, rows],
  );
  const totalCategorySpend = visibleCategories.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const donut = totalCategorySpend
    ? `conic-gradient(${visibleCategories
        .map((item, index) => {
          const start =
            (visibleCategories
              .slice(0, index)
              .reduce((sum, entry) => sum + entry.amount, 0) /
              totalCategorySpend) *
            100;
          return `${item.color} ${start}% ${start + (item.amount / totalCategorySpend) * 100}%`;
        })
        .join(", ")})`
    : "conic-gradient(#e9eef6 0 100%)";

  const healthScore = calculateFinancialHealthScore({
    savingsRate,
    accountBalance,
    goalSaved,
    totalExpenses: expenses,
    totalIncome: income,
  });
  const topCategory = categories[0];
  const insightItems = (() => {
    const items = [];
    if (topCategory)
      items.push({
        icon: Lightbulb,
        tone: "amber",
        title: t("top_spending_area"),
        text: t("top_spending_area_text", { category: topCategory.name, amount: money.format(topCategory.amount) }),
      });
    if (spendingChange > 0)
      items.push({
        icon: TrendingUp,
        tone: "red",
        title: t("spending_increased"),
        text: t("spending_change_text", { percent: Math.abs(spendingChange).toFixed(1), direction: t("more") }),
      });
    else if (previousExpenses)
      items.push({
        icon: TrendingDown,
        tone: "green",
        title: t("spending_decreased"),
        text: t("spending_change_text", { percent: Math.abs(spendingChange).toFixed(1), direction: t("less") }),
      });
    if (income)
      items.push({
        icon: PiggyBank,
        tone: "purple",
        title: t("savings_opportunity"),
        text: t("current_savings_rate", { rate: savingsRate.toFixed(1) }),
      });
    if (bills.length)
      items.push({
        icon: Receipt,
        tone: "blue",
        title: t("upcoming_commitments"),
        text: t("bills_in_plan", { count: bills.length }),
      });
    return items.length
      ? items
      : [
          {
            icon: Sparkles,
            tone: "blue",
            title: t("first_insight_waiting"),
            text: t("add_activity_unlock_recommendations"),
          },
        ];
  })();

  const alerts = (() => {
    const upcoming = bills
      .filter((bill) => !bill.isPaid && !bill.paid)
      .slice(0, 2);
    const result = upcoming.map((bill) => ({
      icon: Receipt,
      tone: "orange",
      title: t("upcoming_bill"),
      text: t("bill_due_soon", { bill: bill.name || bill.title || t("bill") }),
    }));
    if (topCategory && expenses > income && income)
      result.push({
        icon: ShieldCheck,
        tone: "blue",
        title: t("spending_above_income"),
        text: t("review_category_cash_flow", { category: topCategory.name }),
      });
    if (goals.length && netSavings >= 0)
      result.push({
        icon: CheckCircle2,
        tone: "green",
        title: t("savings_on_track"),
        text: t("month_contributing_savings"),
      });
    return result.length
      ? result.slice(0, 4)
      : [
          {
            icon: Bell,
            tone: "blue",
            title: t("no_alerts_now"),
            text: t("keep_logging_activity"),
          },
        ];
  })();

  const actionPlan = [
    {
      number: 1,
      title: topCategory
        ? t("review_category", { category: topCategory.name })
        : t("add_first_expense"),
      text: topCategory
        ? t("recorded_this_month_period", { amount: money.format(topCategory.amount) })
        : t("no_expense_data"),
    },
    {
      number: 2,
      title: goals.length
        ? t("set_savings_contribution")
        : t("create_savings_goal"),
      text: goals.length
        ? t("goals_currently_tracked", { count: goals.length })
        : t("no_savings_goals"),
    },
    {
      number: 3,
      title: expenses > income ? t("reduce_spending") : t("stay_on_budget"),
      text: income
        ? t("spent_from_income", { expenses: money.format(expenses), income: money.format(income) })
        : t("no_income_data"),
    },
  ];
  const opportunities = categories.slice(0, 3);
  const cashlessCount = currentRows.filter(
    (item) =>
      item.paymentMethod === "card" || item.paymentMethod === "transfer",
  ).length;
  const behaviorItems = [
    {
      label: t("planned_spending"),
      value: income
        ? Math.min(
            100,
            Math.round((Math.max(income - expenses, 0) / income) * 100),
          )
        : 0,
      tone: "green",
      detail: income
        ? t("remains_after_expenses", { amount: money.format(Math.max(income - expenses, 0)) })
        : t("income_data_unavailable"),
    },
    {
      label: t("largest_category"),
      value: expenses
        ? Math.min(
            100,
            Math.round(((topCategory?.amount || 0) / expenses) * 100),
          )
        : 0,
      tone: "red",
      detail: topCategory
        ? t("category_percent_expenses", { category: topCategory.name, percent: ((topCategory.amount / expenses) * 100).toFixed(1) })
        : t("expense_data_unavailable"),
    },
    {
      label: t("cashless_spending"),
      value: currentRows.length
        ? Math.min(100, Math.round((cashlessCount / currentRows.length) * 100))
        : 0,
      tone: "green",
      detail: t("cashless_transactions", { cashless: cashlessCount, total: currentRows.length }),
    },
    {
      label: t("budget_adherence"),
      value: income
        ? Math.min(
            100,
            Math.round((Math.max(income - expenses, 0) / income) * 100),
          )
        : 0,
      tone: "blue",
      detail: income
        ? t("spent_against_income", { expenses: money.format(expenses), income: money.format(income) })
        : t("income_data_unavailable"),
    },
    {
      label: t("transaction_frequency"),
      value: Math.min(100, currentRows.length * 10),
      tone: "purple",
      detail: t("transactions_recorded_selected_month", { count: currentRows.length }),
    },
    {
      label: t("average_expense"),
      value: expenses
        ? Math.min(
            100,
            Math.round(
              (expenses /
                Math.max(expenseRows.length, 1) /
                Math.max(income, expenses)) *
                100,
            ),
          )
        : 0,
      tone: "amber",
      detail: expenseRows.length
        ? t("average_per_expense", { amount: money.format(expenses / expenseRows.length) })
        : t("expense_data_unavailable"),
    },
    {
      label: t("income_coverage"),
      value: income
        ? Math.min(100, Math.round((income / Math.max(expenses, 1)) * 100))
        : 0,
      tone: "blue",
      detail: income
        ? t("income_covers_expenses", { income: money.format(income), expenses: money.format(expenses) })
        : t("income_data_unavailable"),
    },
  ];
  const fullActionPlan = [
    ...actionPlan,
    {
      number: 4,
      title: topCategory
        ? t("monitor_category", { category: topCategory.name })
        : t("record_category_details"),
      text: topCategory
        ? t("percent_current_expenses", { percent: ((topCategory.amount / Math.max(expenses, 1)) * 100).toFixed(1) })
        : t("category_data_after_expense"),
    },
    {
      number: 5,
      title: goals.length ? t("check_goal_progress") : t("add_measurable_goal"),
      text: goals.length
        ? t("saved_across_goals", { amount: money.format(goalSaved) })
        : t("goal_progress_unavailable"),
    },
  ];
  const dailySeed = Math.floor(selectedDate.getTime() / 86400000);
  const dailyInsightItems = insightItems.map((item) => ({
    ...item,
    text: item.text,
  }));
  const dailyOffset = Math.abs(dailySeed) % dailyInsightItems.length;
  const activeInsightIndex =
    (Math.min(insightIndex, dailyInsightItems.length - 1) + dailyOffset) %
    dailyInsightItems.length;

  if (loading)
    return (
      <section className="insights-page">
        <div className="insights-empty">
          <Sparkles />
          <h2>{t("building_insights")}</h2>
          <p>{t("reading_financial_activity")}</p>
        </div>
      </section>
    );

  return (
    <section className="insights-page">
      <header className="insights-heading">
        <div>
          <h1>
            {t("insights")} <Sparkles size={20} />
          </h1>
          <p>
            {t("insights_description")}
          </p>
        </div>
        <label
          className="insights-date-chip"
          onClick={() =>
            dateInputRef.current?.showPicker?.() ||
            dateInputRef.current?.click()
          }
        >
          <CalendarDays size={15} />
          <span>{formatWeekRange(selectedDate, locale)}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDateValue}
            onChange={(event) => setSelectedDateValue(event.target.value)}
            aria-label={t("insights_date")}
          />
        </label>
      </header>
      {error && <p className="insights-error">{error}</p>}
      <div className="insights-metrics">
        <InsightMetric
          label={t("spending_vs_last_month")}
          value={`${spendingChange <= 0 ? "↓" : "↑"} ${Math.abs(spendingChange).toFixed(1)}%`}
          detail={
            expenses
              ? t("spent_difference", { amount: money.format(Math.abs(expenses - previousExpenses)), direction: t(spendingChange <= 0 ? "less" : "more") })
              : t("no_expenses_recorded")
          }
          icon={spendingChange <= 0 ? TrendingDown : TrendingUp}
          tone={spendingChange <= 0 ? "green" : "red"}
        />
        <InsightMetric
          label={t("highest_spending_category")}
          value={topCategory?.name || t("no_data")}
          detail={
            topCategory
              ? t("percent_total_expenses", { percent: expenses ? ((topCategory.amount / expenses) * 100).toFixed(1) : 0 })
              : t("add_expenses_see_categories")
          }
          icon={WalletCards}
          tone="blue"
        />
        <InsightMetric
          label={t("savings_rate")}
          value={`${savingsRate.toFixed(1)}%`}
          detail={
            income
              ? t("based_on_income", { amount: money.format(income) })
              : t("add_income_calculate_rate")
          }
          icon={Target}
          tone="purple"
        />
        <InsightMetric
          label={t("financial_health_score")}
          value={`${healthScore}`}
          detail={
            healthScore >= 70
              ? t("excellent")
              : healthScore >= 45
                ? t("good")
                : t("getting_started")
          }
          icon={ShieldCheck}
          tone="orange"
          suffix="/100"
        />
        <InsightMetric
          label={t("top_insight")}
          value={
            topCategory
              ? money.format(topCategory.amount)
              : t("ready_when_you_are")
          }
          detail={
            topCategory
              ? t("category_this_month", { category: topCategory.name })
              : t("log_activity_personalised_tip")
          }
          icon={Lightbulb}
          tone="amber"
        />
      </div>

      <div className="insights-main-grid">
        <div className="insights-left-column">
          <section className="insights-panel insights-trend-panel">
            <div className="insights-panel-title">
              <div>
                <h2>
                    {t("spending_trend")} <small>i</small>
                </h2>
                <p>{t("spending_pattern_last_months", { count: period })}</p>
              </div>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Trend period"
              >
                <option value="6">{t("last_6_months")}</option>
                <option value="3">{t("last_3_months")}</option>
                <option value="12">{t("last_12_months")}</option>
              </select>
            </div>
              <div className="insights-chart-key">
              <span className="current" /> {t("this_period")} {" "}
              <span className="previous" /> {t("last_period")}
            </div>
            <svg
              className="insights-line-chart"
              viewBox="0 0 520 190"
              role="img"
              aria-label="Spending trend chart"
            >
              {[35, 75, 115, 155].map((y) => (
                <line key={y} x1="15" x2="505" y1={y} y2={y} />
              ))}
              <path
                className="trend-previous"
                d={buildPath(
                  trend.map(
                    (item) =>
                      item.expenses *
                      (previousExpenses
                        ? previousExpenses / Math.max(expenses, 1)
                        : 0.8),
                  ),
                )}
              />
              <path
                className="trend-current"
                d={buildPath(trend.map((item) => item.expenses))}
              />
            </svg>
            <div className="insights-chart-labels">
              {trend.map((item) => (
                <span key={item.month.toISOString()}>
                  {monthLabel(item.month, locale)}
                </span>
              ))}
            </div>
            <div className="insights-callout">
              <TrendingDown size={18} />
              <span>
                {expenses
                  ? t("spending_trend_callout", {
                      direction: t(spendingChange <= 0 ? "less" : "more"),
                      advice: t(spendingChange <= 0 ? "spending_on_track" : "review_largest_category"),
                    })
                  : t("add_expenses_real_trend")}
              </span>
            </div>
          </section>
          <div className="insights-two-column">
            <section className="insights-panel insights-income-panel">
              <div className="insights-panel-title">
                <div>
                  <h2>
                    {t("income_insights")} <small>i</small>
                  </h2>
                  <p>{t("income_compared_last_month")}</p>
                </div>
              </div>
              <div className="income-summary">
                <TrendingUp size={17} />
                <span>
                  {income && previousRows.length
                    ? t("income_change_sentence", {
                        percent: percentChange(
                          income,
                          previousRows
                            .filter((item) => item.type === "income")
                            .reduce((sum, item) => sum + item.numericAmount, 0),
                        ).toFixed(1),
                      })
                    : t("ready_to_track")}
                </span>
              </div>
              <div className="income-bars">
                {months.slice(-6).map((month) => {
                  const value = rows
                    .filter(
                      (item) =>
                        item.type === "income" &&
                        sameMonth(item.dateValue, month),
                    )
                    .reduce((sum, item) => sum + item.numericAmount, 0);
                  return (
                    <div key={month.toISOString()}>
                      <i
                        style={{
                          height: `${Math.max(3, income ? (value / Math.max(income, 1)) * 80 : 3)}px`,
                        }}
                      />
                      <b>{monthLabel(month, locale)}</b>
                    </div>
                  );
                })}
              </div>
              <strong className="income-footer">
                {t("average_monthly_income_label")} {" "}
                {money.format(income / Math.max(months.length, 1))}
              </strong>
            </section>
            <section className="insights-panel opportunities-panel">
              <div className="insights-panel-title">
                <div>
                  <h2>
                    {t("savings_opportunities")} <small>i</small>
                  </h2>
                  <p>{t("based_on_spending_patterns")}</p>
                </div>
              </div>
              {opportunities.length ? (
                opportunities.map((item, index) => (
                  <div className="opportunity-row" key={item.name}>
                    <span>
                      {index === 0 ? (
                        <Receipt />
                      ) : index === 1 ? (
                        <CircleDollarSign />
                      ) : (
                        <Zap />
                      )}
                    </span>
                    <div>
                      <b>{t("review_category", { category: item.name })}</b>
                      <small>
                        {t("recorded_this_month", { amount: money.format(item.amount) })}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("insights-action-plan")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      {t("view_tips")}
                    </button>
                  </div>
                ))
              ) : (
                <p className="insights-no-data">
                  {t("no_spending_categories")}
                </p>
              )}
              <button
                className="insights-link"
                type="button"
                onClick={() =>
                  document
                    .getElementById("insights-action-plan")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("view_all_opportunities")} <ArrowRight size={14} />
              </button>
            </section>
          </div>
        </div>
        <aside className="insights-right-column">
          <section className="insights-panel category-panel">
            <div className="insights-panel-title">
              <div>
                <h2>
                  {t("spending_by_category")} <small>i</small>
                </h2>
                <p>{t("month_spending", { month: monthLabel(selectedMonth, locale, { month: "long" }) })}</p>
              </div>
            </div>
            <div className="insights-donut-wrap">
              <div className="insights-donut" style={{ background: donut }}>
                <div>
                  <b>{money.format(totalCategorySpend)}</b>
                  <small>{t("total_expenses")}</small>
                </div>
              </div>
              <div className="insights-legend">
                {visibleCategories.slice(0, 6).map((item) => (
                  <div key={item.name}>
                    <i style={{ background: item.color }} />
                    <span>{item.name}</span>
                    <strong>
                      {expenses
                        ? `${((item.amount / expenses) * 100).toFixed(1)}%`
                        : "0%"}
                    </strong>
                    <em>{money.format(item.amount)}</em>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="insights-link"
              type="button"
              onClick={() =>
                document
                  .getElementById("insights-categories")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {t("view_full_breakdown")} <ArrowRight size={14} />
            </button>
          </section>
          <section className="insights-panel insight-carousel">
            <div className="insights-panel-title">
              <h2>{t("ai_insight_for_you")}</h2>
            </div>
            <div className="carousel-message">
              <span>
                <Lightbulb />
              </span>
              <div>
                <b>{dailyInsightItems[activeInsightIndex].title}</b>
                <p>{dailyInsightItems[activeInsightIndex].text}</p>
              </div>
              <Zap />
            </div>
            <div className="carousel-controls">
              <button
                type="button"
                onClick={() =>
                  setInsightIndex(
                    (insightIndex - 1 + dailyInsightItems.length) %
                      dailyInsightItems.length,
                  )
                }
                aria-label={t("previous_insight")}
              >
                <ChevronLeft size={15} />
              </button>
              <div>
                {dailyInsightItems.map((item, index) => (
                  <i
                    className={index === activeInsightIndex ? "active" : ""}
                    key={item.title}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setInsightIndex((insightIndex + 1) % dailyInsightItems.length)
                }
                aria-label={t("next_insight")}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
          <section className="insights-panel alerts-panel">
            <div className="insights-panel-title">
              <h2>{t("smart_alerts")}</h2>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("insights-alerts")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("view_all")}
              </button>
            </div>
            {alerts.map((alert) => (
              <div className="alert-row" key={alert.title}>
                <span className={alert.tone}>
                  <alert.icon />
                </span>
                <div>
                  <b>{alert.title}</b>
                  <p>{alert.text}</p>
                </div>
                <ChevronRight size={14} />
              </div>
            ))}
          </section>
        </aside>
      </div>
      <section
        className={
          actionPlanExpanded
            ? "insights-action-plan expanded"
            : "insights-action-plan"
        }
        id="insights-action-plan"
      >
        <div className="action-plan-visual">
          <PiggyBank />
        </div>
        <div>
          <h2>{t("recommended_action_plan")}</h2>
          <p>{t("action_plan_description")}</p>
        </div>
        {(actionPlanExpanded ? fullActionPlan : actionPlan).map((item) => (
          <div className="action-step" key={item.number}>
            <b>{item.number}</b>
            <div>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </div>
            <ArrowRight size={15} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setActionPlanExpanded(!actionPlanExpanded)}
        >
          {actionPlanExpanded ? t("collapse_action_plan") : t("view_action_plan")}
        </button>
      </section>
      <section className="insights-bottom-row" id="insights-categories">
        <div
          className={
            behaviorExpanded
              ? "insights-panel behavior-panel expanded"
              : "insights-panel behavior-panel"
          }
        >
          <div className="insights-panel-title">
            <h2>
              {t("spending_behavior")} <small>i</small>
            </h2>
          </div>
          {[
            {
              label: t("planned_spending"),
              value: income
                ? Math.min(
                    100,
                    Math.round((Math.max(income - expenses, 0) / income) * 100),
                  )
                : 0,
              tone: "green",
              detail: income
                ? t("remains_after_expenses", { amount: money.format(Math.max(income - expenses, 0)) })
                : t("income_data_unavailable"),
            },
            {
              label: t("largest_category"),
              value: expenses
                ? Math.min(
                    100,
                    Math.round(((topCategory?.amount || 0) / expenses) * 100),
                  )
                : 0,
              tone: "red",
              detail: topCategory
                ? t("category_percent_expenses", { category: topCategory.name, percent: ((topCategory.amount / expenses) * 100).toFixed(1) })
                : t("expense_data_unavailable"),
            },
            {
              label: t("cashless_spending"),
              value: currentRows.length
                ? Math.min(
                    100,
                    (currentRows.filter(
                      (item) =>
                        item.paymentMethod === "card" ||
                        item.paymentMethod === "transfer",
                    ).length /
                      currentRows.length) *
                      100,
                  )
                : 0,
              tone: "green",
              detail: t("cashless_transactions", { cashless: currentRows.filter((item) => item.paymentMethod === "card" || item.paymentMethod === "transfer").length, total: currentRows.length }),
            },
            {
              label: t("budget_adherence"),
              value: income
                ? Math.min(
                    100,
                    Math.round((Math.max(income - expenses, 0) / income) * 100),
                  )
                : 0,
              tone: "blue",
              detail: income
                ? t("spent_against_income", { expenses: money.format(expenses), income: money.format(income) })
                : t("income_data_unavailable"),
            },
          ].map((item) => (
            <div className="behavior-row" key={item.label}>
              <span>{item.label}</span>
              <i>
                <em className={item.tone} style={{ width: `${item.value}%` }} />
              </i>
              <b>{Math.round(item.value)}%</b>
              <small className={item.tone}>
                {item.value >= 70 ? t("good") : t("needs_work")}
              </small>
              {behaviorExpanded && <p>{item.detail}</p>}
            </div>
          ))}
          <button
            className="insights-link"
            type="button"
            onClick={() => setBehaviorExpanded(!behaviorExpanded)}
          >
            {behaviorExpanded
              ? t("hide_behavior_details")
              : t("view_behavior_details")}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="insights-panel alerts-panel" id="insights-alerts">
          <div className="insights-panel-title">
            <h2>{t("current_data")}</h2>
          </div>
          <div className="did-you-know">
            <CircleDollarSign />
            <p>
              {currentRows.length
                ? t("transactions_recorded_for_month", { count: currentRows.length, month: monthLabel(selectedMonth, locale, { month: "long", year: "numeric" }) })
                : t("no_transactions_month")}
            </p>
          </div>
          <button
            className="insights-link"
            type="button"
            onClick={() => setActionPlanExpanded(true)}
          >
            {t("review_action_plan")} <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <section className="insights-detail-grid">
        <div className="insights-panel behavior-detail-panel">
          <div className="insights-panel-title">
            <h2>{t("full_spending_behavior")}</h2>
            <button
              type="button"
              onClick={() => setBehaviorExpanded(!behaviorExpanded)}
            >
              {behaviorExpanded ? t("hide_details") : t("view_details")}
            </button>
          </div>
          {behaviorItems.map((item) => (
            <div className="behavior-detail-row" key={item.label}>
              <div>
                <b>{item.label}</b>
                <p>{item.detail}</p>
              </div>
              <strong>{Math.round(item.value)}%</strong>
            </div>
          ))}
        </div>
        <div className="insights-panel current-data-panel">
          <div className="insights-panel-title">
            <h2>{t("recorded_transactions")}</h2>
            <span>{t("count_this_month", { count: currentRows.length })}</span>
          </div>
          {currentRows.length ? (
            currentRows
              .slice()
              .sort((first, second) => second.dateValue - first.dateValue)
              .slice(0, 8)
              .map((item) => (
                <div
                  className="current-transaction"
                  key={
                    item.id || `${item.dateValue.toISOString()}-${item.title}`
                  }
                >
                  <span className={item.type}>
                    <CircleDollarSign />
                  </span>
                  <div>
                    <b>{item.title || item.category || t("transaction")}</b>
                    <small>
                      {item.category || t("general")} ·{" "}
                      {item.dateValue.toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </small>
                  </div>
                  <strong className={item.type}>
                    {item.type === "income" ? "+" : "-"}
                    {money.format(item.numericAmount)}
                  </strong>
                </div>
              ))
          ) : (
            <p className="insights-no-data">
              {t("no_transactions_month")}
            </p>
          )}
        </div>
      </section>
    </section>
  );
}

function InsightMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  suffix = "",
}) {
  return (
    <article className={`insights-metric ${tone}`}>
      <span>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>
          {value}
          <em>{suffix}</em>
        </strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}
