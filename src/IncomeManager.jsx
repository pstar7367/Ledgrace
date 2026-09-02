import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Plus,
  RefreshCcw,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { deleteTransactionRequest, getTransactionsRequest } from "./authApi.js";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const tabs = ["Overview", "Income", "Sources", "Recurring Income"];
const sourceColors = [
  "#1458ed",
  "#2ca9da",
  "#8b5cf6",
  "#f59e0b",
  "#00a978",
  "#ef476f",
];

function dayKey(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      });
}

function buildTrend(income) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const key = dayKey(date);
    return {
      label: key,
      value: income
        .filter((item) => dayKey(item.createdAt) === key)
        .reduce((total, item) => total + item.amount, 0),
    };
  });
}

function formatTransactionDate(transaction) {
  if (transaction.date) return transaction.date;
  return new Date(transaction.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function IncomeManager({
  topSearch = "",
  onAddIncome,
  period: controlledPeriod,
  onPeriodChange,
}) {
  const [income, setIncome] = useState([]);
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

  const loadIncome = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getTransactionsRequest();
      setIncome(
        data.transactions.filter(
          (transaction) => transaction.type === "income",
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your income records. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadIncome();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    const applyTransactionChange = (event) => {
      const { action, id, transaction } = event.detail || {};
      if (action === "created" && transaction?.type === "income") {
        setIncome((items) => [
          transaction,
          ...items.filter((item) => item._id !== transaction._id),
        ]);
      }
      if (action === "deleted") {
        setIncome((items) => items.filter((item) => item._id !== id));
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

  const periodIncome = useMemo(() => {
    if (period === "all") return income;

    const today = new Date();
    const start = new Date(today);
    if (period === "week") {
      start.setDate(today.getDate() - 6);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    return income.filter((item) => new Date(item.createdAt) >= start);
  }, [income, period]);

  const searchedIncome = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    if (!query) return periodIncome;
    return periodIncome.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [periodIncome, topSearch]);

  const summary = useMemo(() => {
    const total = periodIncome.reduce((sum, item) => sum + item.amount, 0);
    const monthlyTotals = new Map();
    periodIncome.forEach((item) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyTotals.set(
        monthKey,
        (monthlyTotals.get(monthKey) || 0) + item.amount,
      );
    });
    const average = monthlyTotals.size ? total / monthlyTotals.size : 0;
    const highest = periodIncome.reduce(
      (largest, item) =>
        !largest || item.amount > largest.amount ? item : largest,
      null,
    );
    return { total, average, highest };
  }, [periodIncome]);

  const sources = useMemo(() => {
    const totals = new Map();
    periodIncome.forEach((item) => {
      totals.set(item.category, (totals.get(item.category) || 0) + item.amount);
    });
    return [...totals.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: sourceColors[index % sourceColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodIncome]);

  const recurringSources = sources.filter(
    (source) =>
      periodIncome.filter((item) => item.category === source.name).length > 1,
  );
  const trend = useMemo(() => buildTrend(periodIncome), [periodIncome]);
  const maxTrend = Math.max(...trend.map((point) => point.value), 1);
  const chartPoints = trend
    .map((point, index) => {
      const x = 6 + index * (88 / 6);
      const y = 90 - (point.value / maxTrend) * 76;
      return `${x},${y}`;
    })
    .join(" ");
  const donutStyle =
    sources.length && summary.total
      ? {
          background: `conic-gradient(${sources
            .map((source, index) => {
              const start =
                (sources
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

  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income record permanently?")) return;
    try {
      await deleteTransactionRequest(id);
      setIncome((items) => items.filter((item) => item._id !== id));
      window.dispatchEvent(
        new CustomEvent("ledgrace:transaction-changed", {
          detail: { action: "deleted", id },
        }),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this income record.",
      );
    }
  };

  const tabDescription = {
    Overview: "Track and analyse all your income sources.",
    Income: "Review every income record you have saved.",
    Sources: "See exactly where your income comes from.",
    "Recurring Income": "Sources with more than one recorded income payment.",
  };
  const periodLabel =
    period === "week"
      ? "Last 7 days"
      : period === "month"
        ? "This month"
        : "All time";
  const renderPeriodPicker = () => (
    <select
      className="income-period-select"
      value={period}
      onChange={(event) => setPeriod(event.target.value)}
      aria-label="Income date range"
    >
      <option value="week">Last 7 days</option>
      <option value="month">This month</option>
      <option value="all">All time</option>
    </select>
  );

  return (
    <section className="income-manager">
      <div className="income-heading">
        <div>
          <h1>Income</h1>
          <p>{tabDescription[activeTab]}</p>
        </div>
        <div className="income-heading-actions">
          <button className="button outline" onClick={loadIncome}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="button primary" onClick={onAddIncome}>
            <Plus size={17} /> Add Income
          </button>
        </div>
      </div>

      {error && <p className="income-error">{error}</p>}

      <div className="income-tabs" role="tablist" aria-label="Income views">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="income-stats">
        <IncomeStat
          label={`Total Income (${periodLabel})`}
          value={money.format(summary.total)}
          icon={WalletCards}
        />
        <IncomeStat
          label="Average Monthly Income"
          value={money.format(summary.average)}
          icon={BarChart3}
        />
        <IncomeStat
          label="Highest Income"
          value={summary.highest ? money.format(summary.highest.amount) : "—"}
          note={summary.highest?.title || "No income recorded"}
          icon={TrendingUp}
        />
        <IncomeStat
          label="Income Transactions"
          value={periodIncome.length}
          icon={CircleDollarSign}
        />
      </div>

      {loading ? (
        <div className="income-empty">
          <WalletCards />
          <h2>Loading income records…</h2>
        </div>
      ) : !periodIncome.length ? (
        <div className="income-empty">
          <WalletCards />
          <h2>
            {income.length
              ? `No income for ${periodLabel.toLowerCase()}`
              : "Add your first income"}
          </h2>
          <p>
            {income.length
              ? "Choose another date range or add a new income record."
              : "Record a salary, freelance payment, business income, or any other money you receive."}
          </p>
          <button className="button primary" onClick={onAddIncome}>
            <Plus size={17} /> Add Income
          </button>
        </div>
      ) : (
        <>
          {activeTab !== "Recurring Income" && (
            <div className="income-overview-grid">
              <section className="income-panel income-trend-panel">
                <div className="income-panel-title">
                  <h2>Income Overview</h2>
                  {renderPeriodPicker()}
                </div>
                <strong className="income-total">
                  {money.format(summary.total)}
                </strong>
                <p>Income recorded for {periodLabel.toLowerCase()}</p>
                <div
                  className="income-chart"
                  aria-label="Income trend for the past seven days"
                >
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    role="img"
                  >
                    <polyline
                      points={chartPoints}
                      fill="none"
                      stroke="#00a978"
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
                          stroke="#00a978"
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
                  <h2>Income by Source</h2>
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
                    <small>Total</small>
                  </div>
                  <div className="income-source-legend">
                    {sources.slice(0, 5).map((source) => (
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

          {activeTab === "Sources" && (
            <SourceSummary sources={sources} total={summary.total} />
          )}
          {activeTab === "Recurring Income" && (
            <SourceSummary
              sources={recurringSources}
              total={summary.total}
              recurring
            />
          )}

          {activeTab !== "Sources" && activeTab !== "Recurring Income" && (
            <IncomeTable income={searchedIncome} onDelete={deleteIncome} />
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
  if (!sources.length) {
    return (
      <div className="income-empty compact">
        <CalendarDays />
        <h2>
          {recurring ? "No recurring income yet" : "No income sources found"}
        </h2>
        <p>
          {recurring
            ? "Record the same source more than once to see it here."
            : "Add an income record to see its source here."}
        </p>
      </div>
    );
  }

  return (
    <section className="income-panel income-source-summary">
      <div className="income-panel-title">
        <h2>{recurring ? "Recurring Income Sources" : "All Income Sources"}</h2>
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

function IncomeTable({ income, onDelete }) {
  return (
    <section className="income-panel income-table-panel">
      <div className="income-panel-title">
        <h2>Recent Income Transactions</h2>
        <span>
          {income.length} record{income.length === 1 ? "" : "s"}
        </span>
      </div>
      {!income.length ? (
        <p className="income-no-results">
          No income records match your search.
        </p>
      ) : (
        <div className="income-table">
          {income.slice(0, 12).map((item) => (
            <article className="income-row" key={item._id}>
              <span className="income-row-icon">
                <BriefcaseBusiness />
              </span>
              <div>
                <b>{item.title}</b>
                <small>{formatTransactionDate(item)}</small>
              </div>
              <em>{item.category}</em>
              <strong>+{money.format(item.amount)}</strong>
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
