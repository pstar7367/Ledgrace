import { useEffect, useMemo, useRef, useState } from "react";
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

function monthLabel(value, options = { month: "short" }) {
  return value.toLocaleDateString("en-US", options);
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

function formatWeekRange(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function Insights({ topSearch = "" }) {
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
        title: "Top spending area",
        text: `${topCategory.name} accounts for ${money.format(topCategory.amount)} of this month's expenses.`,
      });
    if (spendingChange > 0)
      items.push({
        icon: TrendingUp,
        tone: "red",
        title: "Spending increased",
        text: `You spent ${Math.abs(spendingChange).toFixed(1)}% more than last month.`,
      });
    else if (previousExpenses)
      items.push({
        icon: TrendingDown,
        tone: "green",
        title: "Spending decreased",
        text: `You spent ${Math.abs(spendingChange).toFixed(1)}% less than last month.`,
      });
    if (income)
      items.push({
        icon: PiggyBank,
        tone: "purple",
        title: "Savings opportunity",
        text: `Your current savings rate is ${savingsRate.toFixed(1)}%.`,
      });
    if (bills.length)
      items.push({
        icon: Receipt,
        tone: "blue",
        title: "Upcoming commitments",
        text: `${bills.length} bill${bills.length === 1 ? "" : "s"} are in your plan.`,
      });
    return items.length
      ? items
      : [
          {
            icon: Sparkles,
            tone: "blue",
            title: "Your first insight is waiting",
            text: "Add income or expenses to unlock personalised recommendations.",
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
      title: "Upcoming bill",
      text: `${bill.name || bill.title || "Bill"} is due soon.`,
    }));
    if (topCategory && expenses > income && income)
      result.push({
        icon: ShieldCheck,
        tone: "blue",
        title: "Spending is above income",
        text: `Review ${topCategory.name} to protect this month's cash flow.`,
      });
    if (goals.length && netSavings >= 0)
      result.push({
        icon: CheckCircle2,
        tone: "green",
        title: "Savings on track",
        text: "Your current month is contributing positively to savings.",
      });
    return result.length
      ? result.slice(0, 4)
      : [
          {
            icon: Bell,
            tone: "blue",
            title: "No alerts right now",
            text: "Keep logging activity to receive timely guidance.",
          },
        ];
  })();

  const actionPlan = [
    {
      number: 1,
      title: topCategory
        ? `Review ${topCategory.name}`
        : "Add your first expense",
      text: topCategory
        ? `${money.format(topCategory.amount)} recorded this month.`
        : "No expense data is available yet.",
    },
    {
      number: 2,
      title: goals.length
        ? "Set a savings contribution"
        : "Create a savings goal",
      text: goals.length
        ? `${goals.length} goal${goals.length === 1 ? "" : "s"} currently tracked.`
        : "No savings goals are available yet.",
    },
    {
      number: 3,
      title: expenses > income ? "Reduce spending" : "Stay on budget",
      text: income
        ? `${money.format(expenses)} spent from ${money.format(income)} income.`
        : "No income data is available yet.",
    },
  ];
  const opportunities = categories.slice(0, 3);
  const cashlessCount = currentRows.filter(
    (item) =>
      item.paymentMethod === "card" || item.paymentMethod === "transfer",
  ).length;
  const behaviorItems = [
    {
      label: "Planned Spending",
      value: income
        ? Math.min(
            100,
            Math.round((Math.max(income - expenses, 0) / income) * 100),
          )
        : 0,
      tone: "green",
      detail: income
        ? `${money.format(Math.max(income - expenses, 0))} remains after current expenses.`
        : "Income data is not available.",
    },
    {
      label: "Largest Category",
      value: expenses
        ? Math.min(
            100,
            Math.round(((topCategory?.amount || 0) / expenses) * 100),
          )
        : 0,
      tone: "red",
      detail: topCategory
        ? `${topCategory.name} is ${((topCategory.amount / expenses) * 100).toFixed(1)}% of expenses.`
        : "Expense data is not available.",
    },
    {
      label: "Cashless Spending",
      value: currentRows.length
        ? Math.min(100, Math.round((cashlessCount / currentRows.length) * 100))
        : 0,
      tone: "green",
      detail: `${cashlessCount} of ${currentRows.length} current transactions use a cashless method.`,
    },
    {
      label: "Budget Adherence",
      value: income
        ? Math.min(
            100,
            Math.round((Math.max(income - expenses, 0) / income) * 100),
          )
        : 0,
      tone: "blue",
      detail: income
        ? `${money.format(expenses)} spent against ${money.format(income)} recorded income.`
        : "Income data is not available.",
    },
    {
      label: "Transaction Frequency",
      value: Math.min(100, currentRows.length * 10),
      tone: "purple",
      detail: `${currentRows.length} transaction${currentRows.length === 1 ? "" : "s"} recorded in the selected month.`,
    },
    {
      label: "Average Expense",
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
        ? `${money.format(expenses / expenseRows.length)} average per expense.`
        : "Expense data is not available.",
    },
    {
      label: "Income Coverage",
      value: income
        ? Math.min(100, Math.round((income / Math.max(expenses, 1)) * 100))
        : 0,
      tone: "blue",
      detail: income
        ? `${money.format(income)} income covers ${money.format(expenses)} in expenses.`
        : "Income data is not available.",
    },
  ];
  const fullActionPlan = [
    ...actionPlan,
    {
      number: 4,
      title: topCategory
        ? `Monitor ${topCategory.name}`
        : "Record category details",
      text: topCategory
        ? `${((topCategory.amount / Math.max(expenses, 1)) * 100).toFixed(1)}% of current expenses.`
        : "Category data will appear after you record an expense.",
    },
    {
      number: 5,
      title: goals.length ? "Check goal progress" : "Add a measurable goal",
      text: goals.length
        ? `${money.format(goalSaved)} saved across your current goals.`
        : "Goal progress cannot be analysed until a goal is created.",
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
          <h2>Building your insights</h2>
          <p>Reading your latest financial activity.</p>
        </div>
      </section>
    );

  return (
    <section className="insights-page">
      <header className="insights-heading">
        <div>
          <h1>
            Insights <Sparkles size={20} />
          </h1>
          <p>
            AI-powered insights to help you make smarter financial decisions.
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
          <span>{formatWeekRange(selectedDate)}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDateValue}
            onChange={(event) => setSelectedDateValue(event.target.value)}
            aria-label="Select insights date"
          />
        </label>
      </header>
      {error && <p className="insights-error">{error}</p>}
      <div className="insights-metrics">
        <InsightMetric
          label="Spending vs Last Month"
          value={`${spendingChange <= 0 ? "↓" : "↑"} ${Math.abs(spendingChange).toFixed(1)}%`}
          detail={
            expenses
              ? `${spendingChange <= 0 ? "You spent" : "You spent"} ${money.format(Math.abs(expenses - previousExpenses))} ${spendingChange <= 0 ? "less" : "more"}`
              : "No expenses recorded yet"
          }
          icon={spendingChange <= 0 ? TrendingDown : TrendingUp}
          tone={spendingChange <= 0 ? "green" : "red"}
        />
        <InsightMetric
          label="Highest Spending Category"
          value={topCategory?.name || "No data yet"}
          detail={
            topCategory
              ? `${expenses ? ((topCategory.amount / expenses) * 100).toFixed(1) : 0}% of total expenses`
              : "Add expenses to see categories"
          }
          icon={WalletCards}
          tone="blue"
        />
        <InsightMetric
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          detail={
            income
              ? `Based on ${money.format(income)} income`
              : "Add income to calculate your rate"
          }
          icon={Target}
          tone="purple"
        />
        <InsightMetric
          label="Financial Health Score"
          value={`${healthScore}`}
          detail={
            healthScore >= 70
              ? "Excellent"
              : healthScore >= 45
                ? "Good"
                : "Getting started"
          }
          icon={ShieldCheck}
          tone="orange"
          suffix="/100"
        />
        <InsightMetric
          label="Top Insight"
          value={
            topCategory
              ? money.format(topCategory.amount)
              : "Ready when you are"
          }
          detail={
            topCategory
              ? `${topCategory.name} this month`
              : "Log activity for a personalised tip"
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
                  Spending Trend <small>i</small>
                </h2>
                <p>Your spending pattern over the last {period} months.</p>
              </div>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Trend period"
              >
                <option value="6">Last 6 Months</option>
                <option value="3">Last 3 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
            </div>
            <div className="insights-chart-key">
              <span className="current" /> This Period{" "}
              <span className="previous" /> Last Period
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
                  {monthLabel(item.month)}
                </span>
              ))}
            </div>
            <div className="insights-callout">
              <TrendingDown size={18} />
              <span>
                {expenses
                  ? `You're spending ${spendingChange <= 0 ? "less" : "more"} than last period. ${spendingChange <= 0 ? "Great job keeping your spending in check." : "Review your largest category to get back on track."}`
                  : "Add expenses to see your real spending trend."}
              </span>
            </div>
          </section>
          <div className="insights-two-column">
            <section className="insights-panel insights-income-panel">
              <div className="insights-panel-title">
                <div>
                  <h2>
                    Income Insights <small>i</small>
                  </h2>
                  <p>Your income compared to last month.</p>
                </div>
              </div>
              <div className="income-summary">
                <TrendingUp size={17} />
                <span>
                  Your income is{" "}
                  {income && previousRows.length
                    ? `${percentChange(
                        income,
                        previousRows
                          .filter((item) => item.type === "income")
                          .reduce((sum, item) => sum + item.numericAmount, 0),
                      ).toFixed(1)}% compared to last month.`
                    : "ready to be tracked."}
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
                      <b>{monthLabel(month)}</b>
                    </div>
                  );
                })}
              </div>
              <strong className="income-footer">
                Average monthly income:{" "}
                {money.format(income / Math.max(months.length, 1))}
              </strong>
            </section>
            <section className="insights-panel opportunities-panel">
              <div className="insights-panel-title">
                <div>
                  <h2>
                    Savings Opportunities <small>i</small>
                  </h2>
                  <p>Based on your spending patterns.</p>
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
                      <b>Review {item.name}</b>
                      <small>
                        {money.format(item.amount)} recorded this month
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
                      View Tips
                    </button>
                  </div>
                ))
              ) : (
                <p className="insights-no-data">
                  No spending categories are available for this month.
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
                View all opportunities <ArrowRight size={14} />
              </button>
            </section>
          </div>
        </div>
        <aside className="insights-right-column">
          <section className="insights-panel category-panel">
            <div className="insights-panel-title">
              <div>
                <h2>
                  Spending by Category <small>i</small>
                </h2>
                <p>{monthLabel(selectedMonth, { month: "long" })} spending</p>
              </div>
            </div>
            <div className="insights-donut-wrap">
              <div className="insights-donut" style={{ background: donut }}>
                <div>
                  <b>{money.format(totalCategorySpend)}</b>
                  <small>Total Expenses</small>
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
              View full breakdown <ArrowRight size={14} />
            </button>
          </section>
          <section className="insights-panel insight-carousel">
            <div className="insights-panel-title">
              <h2>AI Insight For You</h2>
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
                aria-label="Previous insight"
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
                aria-label="Next insight"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
          <section className="insights-panel alerts-panel">
            <div className="insights-panel-title">
              <h2>Smart Alerts</h2>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("insights-alerts")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View All
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
          <h2>Recommended Action Plan</h2>
          <p>Small steps based on your current financial activity.</p>
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
          {actionPlanExpanded ? "Collapse Action Plan" : "View Action Plan"}
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
              Spending Behavior <small>i</small>
            </h2>
          </div>
          {[
            {
              label: "Planned Spending",
              value: income
                ? Math.min(
                    100,
                    Math.round((Math.max(income - expenses, 0) / income) * 100),
                  )
                : 0,
              tone: "green",
              detail: income
                ? `${money.format(Math.max(income - expenses, 0))} remains after current expenses.`
                : "Income data is not available.",
            },
            {
              label: "Largest Category",
              value: expenses
                ? Math.min(
                    100,
                    Math.round(((topCategory?.amount || 0) / expenses) * 100),
                  )
                : 0,
              tone: "red",
              detail: topCategory
                ? `${topCategory.name} is ${((topCategory.amount / expenses) * 100).toFixed(1)}% of expenses.`
                : "Expense data is not available.",
            },
            {
              label: "Cashless Spending",
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
              detail: `${currentRows.filter((item) => item.paymentMethod === "card" || item.paymentMethod === "transfer").length} of ${currentRows.length} current transactions use a cashless method.`,
            },
            {
              label: "Budget Adherence",
              value: income
                ? Math.min(
                    100,
                    Math.round((Math.max(income - expenses, 0) / income) * 100),
                  )
                : 0,
              tone: "blue",
              detail: income
                ? `${money.format(expenses)} spent against ${money.format(income)} recorded income.`
                : "Income data is not available.",
            },
          ].map((item) => (
            <div className="behavior-row" key={item.label}>
              <span>{item.label}</span>
              <i>
                <em className={item.tone} style={{ width: `${item.value}%` }} />
              </i>
              <b>{Math.round(item.value)}%</b>
              <small className={item.tone}>
                {item.value >= 70 ? "Good" : "Needs Work"}
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
              ? "Hide behavior details"
              : "View behavior details"}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="insights-panel alerts-panel" id="insights-alerts">
          <div className="insights-panel-title">
            <h2>Current Data</h2>
          </div>
          <div className="did-you-know">
            <CircleDollarSign />
            <p>
              {currentRows.length
                ? `${currentRows.length} transaction${currentRows.length === 1 ? "" : "s"} recorded for ${monthLabel(selectedMonth, { month: "long", year: "numeric" })}.`
                : "No transactions are recorded for this month."}
            </p>
          </div>
          <button
            className="insights-link"
            type="button"
            onClick={() => setActionPlanExpanded(true)}
          >
            Review your action plan <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <section className="insights-detail-grid">
        <div className="insights-panel behavior-detail-panel">
          <div className="insights-panel-title">
            <h2>Full Spending Behavior</h2>
            <button
              type="button"
              onClick={() => setBehaviorExpanded(!behaviorExpanded)}
            >
              {behaviorExpanded ? "Hide details" : "View details"}
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
            <h2>Recorded Transactions</h2>
            <span>{currentRows.length} this month</span>
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
                    <b>{item.title || item.category || "Transaction"}</b>
                    <small>
                      {item.category || "General"} ·{" "}
                      {item.dateValue.toLocaleDateString("en-US", {
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
              No transactions are recorded for this month.
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
