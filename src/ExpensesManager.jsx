import { useEffect, useMemo, useState } from "react";
import { money } from "./preferences.js";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Plus,
  RefreshCcw,
  Trash2,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import { deleteTransactionRequest, getTransactionsRequest } from "./authApi.js";

const tabs = [
  "Overview",
  "Expenses",
  "Categories",
  "Merchants",
  "Recurring Expenses",
];
const sourceColors = [
  "#1458ed",
  "#2ca9da",
  "#8b5cf6",
  "#f59e0b",
  "#00a978",
  "#ef476f",
];

function toTransactionDate(value) {
  if (!value) return new Date(NaN);
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = typeof value === "string" ? value.trim() : "";
  if (!fallback) return new Date(NaN);

  const normalized = fallback.replace(/\s+/g, " ");
  return new Date(normalized);
}

function dayKey(dateValue) {
  const date = toTransactionDate(dateValue);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      });
}

function buildTrend(expenses) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const key = dayKey(date);
    return {
      label: key,
      value: expenses
        .filter((item) => dayKey(item.createdAt || item.date) === key)
        .reduce((total, item) => total + Number(item.amount || 0), 0),
    };
  });
}

function formatTransactionDate(transaction) {
  if (transaction.date) return transaction.date;
  if (transaction.createdAt) {
    return new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return "Unknown date";
}

import { useTranslation } from "react-i18next";
export default function ExpensesManager({
  topSearch = "",
  onAddExpense,
  period: controlledPeriod,
  onPeriodChange,
}) {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [internalPeriod, setInternalPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const period = controlledPeriod ?? internalPeriod;
  const setPeriod = (nextPeriod) => {
    if (onPeriodChange) {
      onPeriodChange(nextPeriod);
      return;
    }
    setInternalPeriod(nextPeriod);
  };

  const loadExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getTransactionsRequest();
      setExpenses(
        data.transactions.filter(
          (transaction) => transaction.type === "expense",
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your expense records. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadExpenses();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    const applyTransactionChange = (event) => {
      const { action, id, transaction } = event.detail || {};
      if (action === "created" && transaction?.type === "expense") {
        setExpenses((items) => [
          transaction,
          ...items.filter((item) => item._id !== transaction._id),
        ]);
      }
      if (action === "deleted") {
        setExpenses((items) => items.filter((item) => item._id !== id));
      }
    };

    window.addEventListener(
      "ledgrace:transaction-changed",
      applyTransactionChange,
    );
    return () =>
      window.removeEventListener(
        "ledgrace:transaction-changed",
        applyTransactionChange,
      );
  }, []);

  const periodExpenses = useMemo(() => {
    if (period === "all") return expenses;

    const today = new Date();
    const start = new Date(today);
    if (period === "week") {
      start.setDate(today.getDate() - 6);
    } else {
      start.setDate(1);
    }
    start.setHours(0, 0, 0, 0);

    return expenses.filter((item) => {
      const transactionDate = toTransactionDate(item.createdAt || item.date);
      return (
        !Number.isNaN(transactionDate.getTime()) && transactionDate >= start
      );
    });
  }, [expenses, period]);

  const searchedExpenses = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    if (!query) return periodExpenses;
    return periodExpenses.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query),
    );
  }, [periodExpenses, topSearch]);

  const summary = useMemo(() => {
    const total = periodExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );
    const monthlyTotals = new Map();
    periodExpenses.forEach((item) => {
      const date = toTransactionDate(item.createdAt || item.date);
      if (Number.isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyTotals.set(
        monthKey,
        (monthlyTotals.get(monthKey) || 0) + Number(item.amount || 0),
      );
    });
    const average = monthlyTotals.size ? total / monthlyTotals.size : 0;
    const lowest = periodExpenses.reduce(
      (smallest, item) =>
        !smallest || Number(item.amount || 0) < Number(smallest.amount || 0)
          ? item
          : smallest,
      null,
    );
    return { total, average, lowest };
  }, [periodExpenses]);

  const categories = useMemo(() => {
    const totals = new Map();
    periodExpenses.forEach((item) => {
      const key = item.category || "General";
      totals.set(key, (totals.get(key) || 0) + Number(item.amount || 0));
    });
    return [...totals.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: sourceColors[index % sourceColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodExpenses]);

  const recurringSources = categories.filter(
    (source) =>
      periodExpenses.filter(
        (item) => (item.category || "General") === source.name,
      ).length > 1,
  );

  const trend = useMemo(() => buildTrend(periodExpenses), [periodExpenses]);
  const maxTrend = Math.max(...trend.map((point) => point.value), 1);
  const chartPoints = trend
    .map((point, index) => {
      const x = 6 + index * (88 / 6);
      const y = 90 - (point.value / maxTrend) * 76;
      return `${x},${y}`;
    })
    .join(" ");

  const donutStyle =
    categories.length && summary.total
      ? {
          background: `conic-gradient(${categories
            .map((source, index) => {
              const start =
                (categories
                  .slice(0, index)
                  .reduce((sum, item) => sum + item.amount, 0) /
                  summary.total) *
                100;
              const end = start + (source.amount / summary.total) * 100;
              return `${source.color} ${start}% ${end}%`;
            })
            .join(", ")})`,
        }
      : undefined;

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense record permanently?")) return;
    try {
      await deleteTransactionRequest(id);
      setExpenses((items) => items.filter((item) => item._id !== id));
      window.dispatchEvent(
        new CustomEvent("ledgrace:transaction-changed", {
          detail: { action: "deleted", id },
        }),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this expense record.",
      );
    }
  };

  const tabDescription = {
    Overview: t("expense_tab_overview"),
    Expenses: t("expense_tab_expenses"),
    Categories: t("expense_tab_categories"),
    Merchants: t("expense_tab_merchants"),
    "Recurring Expenses": t("expense_tab_recurring"),
  };

  const periodLabel =
    period === "week"
      ? t("last_7_days")
      : period === "month"
        ? t("this_month")
        : t("all_time");

  const renderPeriodPicker = () => (
    <select
      className="income-period-select"
      value={period}
      onChange={(event) => setPeriod(event.target.value)}
      aria-label={t("expense_date_range")}
    >
      <option value="week">{t("last_7_days")}</option>
      <option value="month">{t("this_month")}</option>
      <option value="all">{t("all_time")}</option>
    </select>
  );

  return (
    <section className="income-manager">
      <div className="income-heading">
        <div>
          <h1>{t("expenses")}</h1>
          <p>{tabDescription[activeTab]}</p>
        </div>
        <div className="income-heading-actions">
          <button className="button outline" onClick={loadExpenses}>
            <RefreshCcw size={16} /> {t("refresh")}
          </button>
          <button className="button primary" onClick={onAddExpense}>
            <Plus size={17} /> {t("add_expense")}
          </button>
        </div>
      </div>

      {error && <p className="income-error">{error}</p>}

      <div className="income-tabs" role="tablist" aria-label={t("expense_views")}>
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {t({ Overview: "expense_tab_overview_label", Expenses: "expense_tab_expenses_label", Categories: "expense_tab_categories_label", Merchants: "expense_tab_merchants_label", "Recurring Expenses": "expense_tab_recurring_label" }[tab])}
          </button>
        ))}
      </div>

      <div className="income-stats">
        <IncomeStat
          label={`${t("total_expenses")} (${periodLabel})`}
          value={money.format(summary.total)}
          icon={WalletCards}
        />
        <IncomeStat
          label={t("average_monthly_expenses")}
          value={money.format(summary.average)}
          icon={BarChart3}
        />
        <IncomeStat
          label={t("lowest_expense")}
          value={summary.lowest ? money.format(summary.lowest.amount) : "—"}
          note={summary.lowest?.title || t("no_expense_recorded")}
          icon={TrendingDown}
        />
        <IncomeStat
          label={t("expense_transactions")}
          value={periodExpenses.length}
          icon={CircleDollarSign}
        />
      </div>

      {loading ? (
        <div className="income-empty">
          <WalletCards />
          <h2>{t("loading_expenses")}</h2>
        </div>
      ) : !periodExpenses.length ? (
        <div className="income-empty">
          <WalletCards />
          <h2>
            {expenses.length
              ? t("no_expenses_for_period", { period: periodLabel.toLowerCase() })
              : t("add_first_expense")}
          </h2>
          <p>
            {expenses.length
              ? t("choose_expense_range")
              : t("record_expense_prompt")}
          </p>
          <button className="button primary" onClick={onAddExpense}>
            <Plus size={17} /> {t("add_expense")}
          </button>
        </div>
      ) : (
        <>
          {activeTab !== "Recurring Expenses" && (
            <div className="income-overview-grid">
              <section className="income-panel income-trend-panel">
                <div className="income-panel-title">
                  <h2>{t("expense_overview")}</h2>
                  {renderPeriodPicker()}
                </div>
                <strong className="income-total">
                  {money.format(summary.total)}
                </strong>
                <p>{t("expenses_recorded_for", { period: periodLabel.toLowerCase() })}</p>
                <div
                  className="income-chart"
                  aria-label={t("expense_trend_label")}
                >
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    role="img"
                  >
                    <polyline
                      points={chartPoints}
                      fill="none"
                      stroke="#ef476f"
                      strokeWidth="2.4"
                      vectorEffect="non-scaling-stroke"
                    />
                    {trend.map((point, index) => {
                      const x = 6 + index * (88 / 6);
                      const y = 90 - (point.value / maxTrend) * 76;
                      return (
                        <circle
                          key={point.label}
                          cx={x}
                          cy={y}
                          r="2.2"
                          fill="#fff"
                          stroke="#ef476f"
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                  <div className="income-chart-labels">
                    {trend.map((point) => (
                      <span key={point.label}>{point.label}</span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="income-panel income-sources-panel">
                <div className="income-panel-title">
                  <h2>{t("expenses_by_category")}</h2>
                  {renderPeriodPicker()}
                </div>
                <div className="income-donut-wrap">
                  <div
                    className={
                      donutStyle ? "income-donut" : "income-donut empty"
                    }
                    style={donutStyle}
                  >
                    <b>{money.format(summary.total)}</b>
                    <small>{t("total")}</small>
                  </div>
                  <div className="income-source-legend">
                    {categories.slice(0, 5).map((source) => (
                      <div key={source.name}>
                        <i style={{ background: source.color }} />
                        <span>{source.name}</span>
                        <b>
                          {Math.round((source.amount / summary.total) * 100)}%
                        </b>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Categories" && (
            <SourceSummary sources={categories} total={summary.total} />
          )}
          {activeTab === "Merchants" && (
            <MerchantSummary expenses={periodExpenses} total={summary.total} />
          )}
          {activeTab === "Recurring Expenses" && (
            <SourceSummary
              sources={recurringSources}
              total={summary.total}
              recurring
            />
          )}

          {activeTab !== "Categories" &&
            activeTab !== "Recurring Expenses" &&
            activeTab !== "Merchants" && (
              <ExpenseTable
                expenses={searchedExpenses}
                onDelete={deleteExpense}
              />
            )}
        </>
      )}
    </section>
  );
}

function IncomeStat({ label, value, note, icon: Icon }) {
  return (
    <article className="income-stat">
      <span>
        <Icon />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      {note && <em>{note}</em>}
    </article>
  );
}

function SourceSummary({ sources, total, recurring = false }) {
  const { t } = useTranslation();
  if (!sources.length) {
    return (
      <div className="income-empty compact">
        <CalendarDays />
        <h2>
          {recurring
            ? t("no_recurring_expenses")
            : t("no_expense_categories_found")}
        </h2>
        <p>
          {recurring
            ? t("recurring_expense_prompt")
            : t("expense_category_prompt")}
        </p>
      </div>
    );
  }

  return (
    <section className="income-panel income-source-summary">
      <div className="income-panel-title">
        <h2>
          {recurring
            ? t("recurring_expense_categories")
            : t("all_expense_categories")}
        </h2>
      </div>
      {sources.map((source) => (
        <div className="income-source-row" key={source.name}>
          <i style={{ background: source.color }} />
          <b>{source.name}</b>
          <span>{money.format(source.amount)}</span>
          <em>{Math.round((source.amount / total) * 100)}%</em>
        </div>
      ))}
    </section>
  );
}

function MerchantSummary({ expenses, total }) {
  const { t } = useTranslation();
  const merchants = [
    ...new Map(
      expenses.map((item) => [item.title, { name: item.title, amount: 0 }]),
    ).values(),
  ];
  expenses.forEach((item) => {
    const match = merchants.find((merchant) => merchant.name === item.title);
    if (match) match.amount += Number(item.amount || 0);
  });

  const sorted = merchants.sort((a, b) => b.amount - a.amount);

  if (!sorted.length) {
    return (
      <div className="income-empty compact">
        <CalendarDays />
        <h2>{t("no_merchants_recorded")}</h2>
        <p>{t("merchant_prompt")}</p>
      </div>
    );
  }

  return (
    <section className="income-panel income-source-summary">
      <div className="income-panel-title">
        <h2>{t("top_merchants")}</h2>
      </div>
      {sorted.map((merchant) => (
        <div className="income-source-row" key={merchant.name}>
          <i style={{ background: "#ef476f" }} />
          <b>{merchant.name}</b>
          <span>{money.format(merchant.amount)}</span>
          <em>{Math.round((merchant.amount / total) * 100)}%</em>
        </div>
      ))}
    </section>
  );
}

function ExpenseTable({ expenses, onDelete }) {
  const { t } = useTranslation();
  return (
    <section className="income-panel income-table-panel">
      <div className="income-panel-title">
        <h2>{t("recent_expense_transactions")}</h2>
        <span>
          {t("expense_record_count", { count: expenses.length })}
        </span>
      </div>
      {!expenses.length ? (
        <p className="income-no-results">
          {t("no_expense_records_match")}
        </p>
      ) : (
        <div className="income-table">
          {expenses.slice(0, 12).map((item) => (
            <article className="income-row" key={item._id}>
              <span className="income-row-icon">
                <BriefcaseBusiness />
              </span>
              <div>
                <b>{item.title}</b>
                <small>{formatTransactionDate(item)}</small>
              </div>
              <em>{item.category}</em>
              <strong className="expense-amount">
                -{money.format(item.amount)}
              </strong>
              <button
                onClick={() => onDelete(item._id)}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
