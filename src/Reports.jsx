import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
  FileBarChart,
} from "lucide-react";
import {
  getAccountsRequest,
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

const quickFilters = ["Overview", "Income", "Expenses", "Savings", "Net Worth", "Custom"];
const reportTypes = ["Monthly Summary", "Expense Report", "Income Report", "Cash Flow", "Net Worth"];
const exportFormats = ["PDF", "Excel", "CSV"];

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

function hasPremiumAccess() {
  const user = readUser();
  const explicitPlan = [
    user?.plan,
    user?.subscriptionPlan,
    user?.membership,
    user?.tier,
    user?.accountType,
    user?.role,
    localStorage.getItem("ledgrace_plan"),
    localStorage.getItem("ledgrace_subscription_plan"),
  ].find((value) => typeof value === "string" && value.trim());

  if (explicitPlan) {
    return explicitPlan.toLowerCase().includes("premium") || explicitPlan.toLowerCase().includes("pro");
  }

  return Boolean(
    user?.isPremium ||
      user?.premium ||
      user?.hasPremium ||
      user?.premiumAccess ||
      JSON.parse(localStorage.getItem("ledgrace_premium") || "false")
  );
}

function monthRangeFor(date) {
  const anchor = new Date(`${date}T00:00:00`);
  return {
    start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isInRange(date, start, end) {
  return date >= start && date <= end;
}

function monthName(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getMonthList(anchorDate) {
  return Array.from({ length: 6 }, (_, index) => new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() - (5 - index),
    1,
  ));
}

function percentageChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function buildLinePath(values, width = 520, height = 185) {
  const max = Math.max(...values, 1);
  return values.map((value, index) => {
    const x = 16 + (index * (width - 32)) / Math.max(values.length - 1, 1);
    const y = height - 16 - ((value / max) * (height - 32));
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Reports({ topSearch = "" }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedReportType, setSelectedReportType] = useState("Monthly Summary");
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [activeFilter, setActiveFilter] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllScheduled, setShowAllScheduled] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [chartMode, setChartMode] = useState("current");
  const isPremium = hasPremiumAccess();

  const selectedMonth = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const { start, end } = useMemo(() => monthRangeFor(selectedDate), [selectedDate]);

  useEffect(() => {
    let active = true;
    const loadReportsData = async () => {
      setLoading(true);
      setError("");
      try {
        const user = readUser();
        const fallbackTransactions = readLegacyTransactions(`ledgrace_transactions_${user.email || "guest"}`);

        const [transactionsResponse, billsResponse, goalsResponse, accountsResponse] = await Promise.all([
          getTransactionsRequest(),
          getBillsRequest(),
          getSavingsGoalsRequest(),
          getAccountsRequest(),
        ]);

        if (!active) return;

        const apiTransactions = transactionsResponse.data.transactions || [];
        const mergedTransactions = apiTransactions.length ? apiTransactions : fallbackTransactions;
        setTransactions(mergedTransactions);
        setGoals(goalsResponse.data.goals || []);
        setAccounts(accountsResponse.data.accounts || []);
      } catch (requestError) {
        if (!active) return;
        const user = readUser();
        const fallbackTransactions = readLegacyTransactions(`ledgrace_transactions_${user.email || "guest"}`);
        setTransactions(fallbackTransactions);
        setError(requestError.response?.data?.message || "Unable to load your report data right now.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(loadReportsData, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const createdAt = transaction.createdAt || transaction.date;
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) return false;
      return isInRange(date, start, end);
    });
  }, [transactions, start, end]);

  const previousMonth = useMemo(
    () => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    [selectedMonth],
  );

  const previousMonthRange = useMemo(() => monthRangeFor(previousMonth.toISOString().slice(0, 10)), [previousMonth]);

  const currentSummary = useMemo(() => filteredTransactions.reduce((summary, item) => ({
    income: summary.income + (item.type === "income" ? Number(item.amount || 0) : 0),
    expenses: summary.expenses + (item.type === "expense" ? Number(item.amount || 0) : 0),
  }), { income: 0, expenses: 0 }), [filteredTransactions]);

  const previousSummary = useMemo(() => {
    const previousTransactions = transactions.filter((transaction) => {
      const createdAt = transaction.createdAt || transaction.date;
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) return false;
      return isInRange(date, previousMonthRange.start, previousMonthRange.end);
    });

    return previousTransactions.reduce((summary, item) => ({
      income: summary.income + (item.type === "income" ? Number(item.amount || 0) : 0),
      expenses: summary.expenses + (item.type === "expense" ? Number(item.amount || 0) : 0),
    }), { income: 0, expenses: 0 });
  }, [transactions, previousMonthRange]);

  const expensesByCategory = useMemo(() => {
    const categories = new Map();
    filteredTransactions.filter((item) => item.type === "expense").forEach((item) => {
      const name = item.category || "Other";
      categories.set(name, (categories.get(name) || 0) + Number(item.amount || 0));
    });

    return [...categories.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((first, second) => second.amount - first.amount);
  }, [filteredTransactions]);

  const filteredCategoryData = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    return query ? expensesByCategory.filter((item) => item.name.toLowerCase().includes(query)) : expensesByCategory;
  }, [expensesByCategory, topSearch]);

  const fullSummary = useMemo(
    () => transactions.reduce((summary, item) => ({
      income: summary.income + (item.type === "income" ? Number(item.amount || 0) : 0),
      expenses: summary.expenses + (item.type === "expense" ? Number(item.amount || 0) : 0),
    }), { income: 0, expenses: 0 }),
    [transactions],
  );

  const totalIncome = fullSummary.income;
  const totalExpenses = fullSummary.expenses;
  const totalSaved = useMemo(() => goals.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0), [goals]);
  const accountBalance = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.currentBalance ?? account.startingBalance ?? 0), 0), [accounts]);
  const netSavings = totalIncome - totalExpenses;
  const netWorth = accountBalance + totalSaved;
  const savingsRate = totalIncome ? (netSavings / totalIncome) * 100 : 0;
  const incomeChange = percentageChange(currentSummary.income, previousSummary.income);
  const expensesChange = percentageChange(currentSummary.expenses, previousSummary.expenses);
  const netSavingsChange = percentageChange(netSavings, previousSummary.income - previousSummary.expenses);

  const chartFocusMonth = useMemo(
    () => (chartMode === "current" ? selectedMonth : previousMonth),
    [chartMode, previousMonth, selectedMonth],
  );

  const chartTransactions = useMemo(() => {
    const focusRange = monthRangeFor(chartFocusMonth.toISOString().slice(0, 10));
    return transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt || transaction.date);
      if (Number.isNaN(date.getTime())) return false;
      return isInRange(date, focusRange.start, focusRange.end);
    });
  }, [chartFocusMonth, transactions]);

  const lineData = useMemo(() => {
    const months = getMonthList(chartFocusMonth);
    return months.map((month) => {
      const range = monthRangeFor(month.toISOString().slice(0, 10));
      const monthTransactions = transactions.filter((transaction) => {
        const date = new Date(transaction.createdAt || transaction.date);
        if (Number.isNaN(date.getTime())) return false;
        return isInRange(date, range.start, range.end);
      });

      return {
        label: monthName(month),
        income: monthTransactions.filter((item) => item.type === "income").reduce((total, item) => total + Number(item.amount || 0), 0),
        expenses: monthTransactions.filter((item) => item.type === "expense").reduce((total, item) => total + Number(item.amount || 0), 0),
      };
    });
  }, [chartFocusMonth, transactions]);

  const chartCategoryData = useMemo(() => {
    const categories = new Map();
    chartTransactions.filter((item) => item.type === "expense").forEach((item) => {
      const name = item.category || "Other";
      categories.set(name, (categories.get(name) || 0) + Number(item.amount || 0));
    });

    return [...categories.entries()]
      .map(([name, amount], index) => ({ name, amount, color: categoryColors[index % categoryColors.length] }))
      .sort((first, second) => second.amount - first.amount);
  }, [chartTransactions]);

  const categoryTotal = filteredCategoryData.reduce((total, item) => total + item.amount, 0);
  const chartCategoryTotal = chartCategoryData.reduce((total, item) => total + item.amount, 0);
  const chartMonthLabel = chartMode === "current" ? "This Month" : "Last Month";
  const donutGradient = categoryTotal ? `conic-gradient(${filteredCategoryData.map((item, index) => {
    const start = filteredCategoryData.slice(0, index).reduce((total, entry) => total + (entry.amount / categoryTotal) * 100, 0);
    const end = start + (item.amount / categoryTotal) * 100;
    return `${item.color} ${start}% ${end}%`;
  }).join(", ")})` : "conic-gradient(#e8edf6 0 100%)";

  const reportCards = useMemo(() => [
    { label: "Income", value: money.format(totalIncome), change: incomeChange, direction: incomeChange >= 0 ? "positive" : "negative", icon: WalletCards, tone: "green" },
    { label: "Expenses", value: money.format(totalExpenses), change: expensesChange, direction: expensesChange <= 0 ? "positive" : "negative", icon: TrendingDown, tone: "red" },
    { label: "Savings", value: money.format(totalSaved), change: netSavingsChange, direction: netSavingsChange >= 0 ? "positive" : "negative", icon: Sparkles, tone: "purple" },
    { label: "Net Worth", value: money.format(netWorth), change: 0, direction: "positive", icon: TrendingUp, tone: "blue" },
  ], [expensesChange, incomeChange, netSavingsChange, netWorth, totalExpenses, totalIncome, totalSaved]);

  const recentReports = useMemo(() => {
    return generatedReports.slice(0, showAllReports ? undefined : 5);
  }, [generatedReports, showAllReports]);

  const scheduledReports = [];

  const visibleScheduledReports = showAllScheduled ? scheduledReports : scheduledReports.slice(0, 2);

  const insightText = useMemo(() => {
    if (!filteredCategoryData.length) return "Add transactions to unlock personalized insights.";
    const topCategory = filteredCategoryData[0];
    return `Your biggest expense category is ${topCategory.name}, contributing ${categoryTotal ? ((topCategory.amount / categoryTotal) * 100).toFixed(1) : 0}% of spend.`;
  }, [categoryTotal, filteredCategoryData]);

  const expandedInsightText = insightExpanded ? `${insightText} This view is refreshed from your current month data and can be adjusted with the date picker.` : insightText;

  const exportReport = () => {
    if (!isPremium) {
      window.location.assign("/pricing");
      return;
    }

    const rows = [
      ["Type", "Category", "Title", "Amount", "Date"],
      ...filteredTransactions.map((transaction) => [
        transaction.type,
        transaction.category || "General",
        transaction.title || "Transaction",
        Number(transaction.amount || 0),
        transaction.createdAt || transaction.date,
      ]),
    ];

    const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

    if (selectedFormat === "PDF") {
      window.print();
      return;
    }

    const fileName = `${selectedReportType.toLowerCase().replace(/\s+/g, "-") || "report"}.${selectedFormat === "Excel" ? "csv" : "csv"}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    if (!isPremium) {
      window.location.assign("/pricing");
      return;
    }

    const nextReport = {
      name: `${selectedReportType} - ${monthName(selectedMonth)}`,
      type: selectedReportType,
      range: `${monthName(startOfMonth(selectedMonth))} - ${monthName(selectedMonth)}`,
      generatedOn: formatDate(new Date()),
      format: selectedFormat,
    };

    setGeneratedReports((items) => [nextReport, ...items].slice(0, 5));
  };

  if (loading) {
    return (
      <section className="reports-page reports-loading">
        <div className="reports-empty-state">
          <FileBarChart size={36} />
          <h2>Loading your reports…</h2>
          <p>Preparing your income, expense and savings insights.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>Generate, view and export financial reports.</p>
        </div>

        <WorkspaceCalendar value={selectedDate} onChange={setSelectedDate} ariaLabel="Select report date" className="reports-date-chip" />
      </div>

      {error && <p className="analytics-error">{error}</p>}

      <div className="reports-filter-row">
        {quickFilters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? "active" : ""}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter === "Overview" ? <FileText size={13} /> : filter === "Income" ? <TrendingUp size={13} /> : filter === "Expenses" ? <TrendingDown size={13} /> : filter === "Savings" ? <WalletCards size={13} /> : filter === "Net Worth" ? <ShieldCheck size={13} /> : <Sparkles size={13} />}
            {filter}
          </button>
        ))}
      </div>

      <div className="reports-main-layout">
        <div className="reports-main-column">
          <div className="reports-metrics">
            {reportCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className="reports-stat-card">
                  <span className={card.tone}><Icon size={18} /></span>
                  <div>
                    <small>{card.label}</small>
                    <strong>{card.value}</strong>
                    <em className={card.direction === "positive" ? "positive" : "negative"}>
                      {card.direction === "positive" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(card.change).toFixed(1)}% from last month
                    </em>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="reports-visual-grid">
            <section className="reports-panel reports-chart-panel">
              <div className="reports-panel-header">
                <div>
                  <h2>Income vs Expenses</h2>
                  <p>Your activity in {monthName(selectedMonth)}.</p>
                </div>
                <button type="button" className="reports-tab-button" onClick={() => setChartMode((value) => value === "current" ? "previous" : "current")}>
                  {chartMonthLabel}
                </button>
              </div>

              <div className="reports-chart-legend">
                <span className="income" /> Income
                <span className="expense" /> Expenses
              </div>

              <svg viewBox="0 0 520 185" aria-label="Income and expense trend" role="img">
                {[32, 70, 108, 146].map((y) => <line key={y} x1="16" x2="504" y1={y} y2={y} />)}
                <path className="line-income" d={buildLinePath(lineData.map((item) => item.income))} />
                <path className="line-expense" d={buildLinePath(lineData.map((item) => item.expenses))} />
              </svg>

              <div className="reports-chart-labels">
                {lineData.map((item) => <span key={item.label}>{item.label}</span>)}
              </div>
            </section>

            <section className="reports-panel reports-donut-panel">
              <div className="reports-panel-header">
                <div>
                  <h2>Expenses by Category</h2>
                  <p>{monthName(selectedMonth)} spend</p>
                </div>
                <button type="button" className="reports-tab-button" onClick={() => setChartMode((value) => value === "current" ? "previous" : "current")}>
                  {chartMonthLabel}
                </button>
              </div>

              {chartCategoryData.length ? (
                <div className="reports-donut-wrap">
                  <div className="reports-donut" style={{ background: `conic-gradient(${chartCategoryData.map((item, index) => {
                    const start = chartCategoryData.slice(0, index).reduce((total, entry) => total + (entry.amount / chartCategoryTotal) * 100, 0);
                    const end = start + (item.amount / chartCategoryTotal) * 100;
                    return `${item.color} ${start}% ${end}%`;
                  }).join(", ")})` }}>
                    <div>
                      <b>{money.format(chartCategoryTotal)}</b>
                      <small>Total Expenses</small>
                    </div>
                  </div>

                  <div className="reports-legend">
                    {chartCategoryData.map((item) => (
                      <div key={item.name}>
                        <i style={{ background: item.color }} />
                        <span>{item.name}</span>
                        <strong>{chartCategoryTotal ? ((item.amount / chartCategoryTotal) * 100).toFixed(1) : 0}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="reports-empty-state compact">
                  <WalletCards size={30} />
                  <h2>No expense data yet</h2>
                </div>
              )}
            </section>
          </div>

          <section className="reports-table-panel reports-panel">
            <div className="reports-table-header">
              <div>
                <h2>Recent Reports</h2>
              </div>
              {generatedReports.length > 0 && (
                <button type="button" className="reports-link-button" onClick={() => setShowAllReports((value) => !value)}>
                  {showAllReports ? "Hide" : "View All Reports"}
                </button>
              )}
            </div>

            {recentReports.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th>Generated On</th>
                    <th>Format</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report, index) => (
                    <tr key={`${report.name}-${index}`}>
                      <td>
                        <div className="report-name-cell">
                          <span className={`report-badge ${report.type.toLowerCase().replace(/\s+/g, "-")}`}><FileText size={12} /></span>
                          <div>
                            <b>{report.name}</b>
                            <small>{report.type}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={`report-pill ${report.type.toLowerCase().replace(/\s+/g, "-")}`}>{report.type}</span></td>
                      <td>{report.range}</td>
                      <td>{report.generatedOn}</td>
                      <td><span className="report-format-tag">{report.format}</span></td>
                      <td>
                        <div className="report-action-btns">
                          {isPremium ? (
                            <>
                              <button type="button" onClick={() => exportReport()} aria-label={`Export ${report.name}`}><Download size={14} /></button>
                              <button type="button" onClick={() => window.print()} aria-label={`Print ${report.name}`}><Printer size={14} /></button>
                            </>
                          ) : (
                            <button type="button" className="locked" aria-label="Premium required" onClick={() => window.location.assign("/pricing")}><Lock size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="reports-empty-state compact">
                <FileText size={30} />
                <h2>No reports generated yet</h2>
                <p>Generate a report from the panel to see your data here.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="reports-sidebar">
          <section className="reports-panel generate-panel">
            <div className="reports-panel-header compact-header">
              <h2>Generate Report</h2>
            </div>

            <label>
              <span>Report Type</span>
              <select value={selectedReportType} onChange={(event) => setSelectedReportType(event.target.value)}>
                {reportTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label>
              <span>Date Range</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>

            <label>
              <span>Format</span>
              <select value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value)} disabled={!isPremium}>
                {exportFormats.map((format) => <option key={format} value={format}>{format}</option>)}
              </select>
            </label>

            <div className="report-format-grid">
              {exportFormats.map((format) => {
                const Icon = format === "PDF" ? FileText : format === "Excel" ? FileSpreadsheet : Download;
                return (
                  <button
                    key={format}
                    type="button"
                    className={selectedFormat === format ? "selected" : ""}
                    onClick={() => setSelectedFormat(format)}
                    disabled={!isPremium}
                  >
                    <Icon size={15} />
                    {format}
                  </button>
                );
              })}
            </div>

            {!isPremium ? (
              <button type="button" className="reports-primary-button premium-lock" onClick={() => window.location.assign("/pricing")}>
                <ShieldCheck size={15} /> Upgrade to Premium
              </button>
            ) : (
              <button type="button" className="reports-primary-button" onClick={handleGenerateReport}>
                Generate Report <ArrowUpRight size={15} />
              </button>
            )}
          </section>

          <section className="reports-panel scheduled-panel">
            <div className="reports-panel-header compact-header">
              <h2>Scheduled Reports</h2>
              {scheduledReports.length > 0 && (
                <button type="button" className="reports-link-button" onClick={() => setShowAllScheduled((value) => !value)}>
                  {showAllScheduled ? "Hide" : "View All"}
                </button>
              )}
            </div>

            {visibleScheduledReports.length ? (
              visibleScheduledReports.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.name} className="scheduled-item">
                    <span className="scheduled-icon"><Icon size={14} /></span>
                    <div>
                      <b>{report.name}</b>
                      <small>{report.cadence}</small>
                    </div>
                    <span className={report.status.toLowerCase() === "active" ? "status active" : "status paused"}>{report.status}</span>
                  </div>
                );
              })
            ) : (
              <div className="reports-empty-state compact">
                <Sparkles size={26} />
                <h2>No scheduled reports</h2>
                <p>Set up a report to automate recurring summaries.</p>
              </div>
            )}
          </section>

          <section className="reports-panel insights-panel">
            <div className="reports-panel-header compact-header">
              <h2>Reports Insights</h2>
            </div>
            <div className="insight-banner">
              <p>{expandedInsightText}</p>
            </div>
            <button type="button" className="reports-primary-button alt" onClick={() => {
              setActiveFilter("Overview");
              setInsightExpanded((value) => !value);
            }}>
              {insightExpanded ? "Hide Insights" : "View Full Insights"} <ArrowUpRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
