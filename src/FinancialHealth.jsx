import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Download,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
  HeartPulse,
} from "lucide-react";
import {
  getAccountsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";
import { calculateFinancialHealthScore } from "./financialMetrics.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

function formatMonthRange(start, end) {
  return `${monthLabel(start)} - ${monthLabel(end)}`;
}

function asNumber(value) {
  return Number(value || 0);
}

export default function FinancialHealth() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showFactorDetails, setShowFactorDetails] = useState(false);
  const isPremium = hasPremiumAccess();

  const selectedMonth = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const selectedRange = useMemo(() => monthRangeFor(selectedDate), [selectedDate]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const user = readUser();
        const persistedTransactions = readLegacyTransactions(`ledgrace_transactions_${user.email || "guest"}`);

        const [transactionsResponse, accountsResponse, goalsResponse] = await Promise.all([
          getTransactionsRequest(),
          getAccountsRequest(),
          getSavingsGoalsRequest(),
        ]);

        if (!alive) return;

        const apiTransactions = transactionsResponse?.data?.transactions || [];
        const loadedTransactions = apiTransactions.length ? apiTransactions : persistedTransactions;
        setTransactions(loadedTransactions);
        setAccounts(accountsResponse?.data?.accounts || []);
        setGoals(goalsResponse?.data?.goals || []);
      } catch (requestError) {
        if (!alive) return;
        const user = readUser();
        const persistedTransactions = readLegacyTransactions(`ledgrace_transactions_${user.email || "guest"}`);
        setTransactions(persistedTransactions);
        setError(requestError.response?.data?.message || "Unable to load your financial health data right now.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(load, 0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  const monthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt || transaction.date);
      if (Number.isNaN(date.getTime())) return false;
      return date >= selectedRange.start && date <= selectedRange.end;
    });
  }, [selectedRange, transactions]);

  const totals = useMemo(() => {
    return monthTransactions.reduce(
      (summary, item) => ({
        income: summary.income + (item.type === "income" ? asNumber(item.amount) : 0),
        expenses: summary.expenses + (item.type === "expense" ? asNumber(item.amount) : 0),
      }),
      { income: 0, expenses: 0 },
    );
  }, [monthTransactions]);

  const accountBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + asNumber(account.currentBalance ?? account.startingBalance ?? 0), 0),
    [accounts],
  );

  const goalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + asNumber(goal.savedAmount ?? goal.currentAmount ?? 0), 0),
    [goals],
  );

  const totalIncome = totals.income || 1;
  const totalExpenses = totals.expenses;
  const selectedMonthBudget = useMemo(
    () => monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + asNumber(transaction.amount), 0),
    [monthTransactions],
  );
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome ? (netSavings / totalIncome) * 100 : 0;
  const netWorth = accountBalance + goalSaved;
  const visibleGoals = useMemo(
    () => goals
      .slice(0, 3)
      .map((goal) => {
        const saved = asNumber(goal.savedAmount ?? goal.currentAmount ?? 0);
        const target = asNumber(goal.targetAmount ?? goal.amount ?? goal.goalAmount ?? 0);
        return {
          ...goal,
          name: goal.name || "Untitled goal",
          saved,
          target,
          progress: target ? clamp((saved / target) * 100, 0, 100) : 0,
        };
      }),
    [goals],
  );

  const accountHighlights = useMemo(
    () => accounts
      .slice(0, 3)
      .map((account) => ({
        ...account,
        name: account.name || "Account",
        balance: asNumber(account.currentBalance ?? account.startingBalance ?? 0),
      })),
    [accounts],
  );

  const categoryBreakdown = useMemo(() => {
    const buckets = new Map();
    monthTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const name = item.category || "Other";
        buckets.set(name, (buckets.get(name) || 0) + asNumber(item.amount));
      });

    return [...buckets.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: ["#1458ed", "#00a978", "#f59e0b", "#8b5cf6", "#1fa5bd", "#ef6d7a"][index % 6],
      }))
      .sort((first, second) => second.amount - first.amount);
  }, [monthTransactions]);

  const totalCategorySpend = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0) || 1;

  const healthScore = calculateFinancialHealthScore({
    savingsRate,
    accountBalance,
    goalSaved,
    totalExpenses,
    totalIncome,
  });

  const scoreBreakdown = [
    { name: "Spending", score: clamp(Math.round(100 - (totalExpenses / Math.max(totalIncome, 1)) * 100), 0, 100), color: "#1458ed", label: totalExpenses > totalIncome ? "Needs attention" : "Healthy" },
    { name: "Savings", score: clamp(Math.round(savingsRate), 0, 100), color: "#00a978", label: savingsRate > 20 ? "Excellent" : savingsRate > 10 ? "Good" : "Low" },
    { name: "Budgeting", score: clamp(Math.round(100 - (categoryBreakdown.length ? categoryBreakdown[0].amount / totalCategorySpend : 0) * 100), 0, 100), color: "#f59e0b", label: "On track" },
    { name: "Debt Management", score: clamp(Math.round((1 - Math.min(totalExpenses / Math.max(totalIncome * 1.5, 1), 1)) * 100), 0, 100), color: "#8b5cf6", label: "Good" },
    { name: "Financial Planning", score: clamp(Math.round((goalSaved / Math.max(accountBalance + goalSaved, 1)) * 100 + 20), 0, 100), color: "#1fa5bd", label: "Great" },
  ];

  const factorDetails = [
    { name: "Spending", value: scoreBreakdown[0].score, target: "Your spending wisely.", tip: "Continue tracking spend to stay on top.", tone: "blue" },
    { name: "Savings", value: scoreBreakdown[1].score, target: "Excellent saving habit.", tip: "You are staying consistent.", tone: "green" },
    { name: "Budgeting", value: scoreBreakdown[2].score, target: "You have a budget.", tip: "You are within your category limits.", tone: "amber" },
    { name: "Debt Management", value: scoreBreakdown[3].score, target: "Healthy debt ratio.", tip: "Keep debt in check with consistent payments.", tone: "purple" },
    { name: "Financial Planning", value: scoreBreakdown[4].score, target: "On track for the future.", tip: "Your plan is moving with your goals.", tone: "cyan" },
  ];

  const sixMonthTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - (5 - index), 1);
      const range = monthRangeFor(date.toISOString().slice(0, 10));
      const values = transactions.filter((transaction) => {
        const txDate = new Date(transaction.createdAt || transaction.date);
        return !Number.isNaN(txDate.getTime()) && txDate >= range.start && txDate <= range.end;
      });
      const income = values.filter((item) => item.type === "income").reduce((sum, item) => sum + asNumber(item.amount), 0);
      const expenses = values.filter((item) => item.type === "expense").reduce((sum, item) => sum + asNumber(item.amount), 0);
      return { label: date.toLocaleDateString("en-US", { month: "short" }), income, expenses };
    });
    return months;
  }, [selectedMonth, transactions]);

  const trendMax = Math.max(...sixMonthTrend.map((month) => month.income || month.expenses), 1);

  const recommendations = [
    {
      title: "Review your budget",
      description: totalExpenses > totalIncome
        ? `Your spending is above income by ${money.format(Math.max(totalExpenses - totalIncome, 0))} this month. Reduce discretionary categories to rebalance.`
        : `Your spending is within your current income. Keep monitoring categories to maintain a ${savingsRate.toFixed(1)}% savings rate.`,
      action: "Review"
    },
    {
      title: "Automate your savings",
      description: savingsRate > 15
        ? `You are already saving ${savingsRate.toFixed(1)}% of income. Automating transfers will keep that momentum steady.`
        : "Your savings rate is still low. Automating a transfer can make progress more consistent and easier to maintain.",
      action: "Set Up"
    },
    {
      title: "Track your subscriptions",
      description: monthTransactions.filter((item) => {
        const text = `${item.category || ""} ${item.title || ""}`.toLowerCase();
        return /(subscription|bill|utility|insurance|renewal)/.test(text);
      }).length
        ? "Your current month includes recurring subscription or bill activity. Review those entries to reduce avoidable recurring spend."
        : "There are no subscription-style transactions in this period. Keep an eye on new recurring charges as they appear.",
      action: "View Bills"
    },
  ];

  const insights = [
    monthTransactions.length === 0
      ? "Add a transaction to begin tracking your real financial health for this period."
      : `Your real income for this period is ${money.format(totals.income)} and your real expenses are ${money.format(totals.expenses)}.`,
    totalExpenses > totalIncome
      ? `Your current spending is higher than income by ${money.format(totalExpenses - totalIncome)}.`
      : `Your net savings for this period is ${money.format(netSavings)} with a ${savingsRate.toFixed(1)}% savings rate.`,
    accountHighlights.length > 0
      ? `${accountHighlights[0].name} currently holds ${money.format(accountHighlights[0].balance)}, which contributes directly to your available cash position.`
      : "No active account balances are available yet. Add accounts to generate a stronger financial picture.",
    visibleGoals.length > 0
      ? `${visibleGoals[0].name} is ${visibleGoals[0].progress.toFixed(0)}% funded, based on your real saved amount and target amount.`
      : "No active goals were found for this account. Add goals to track long-term targets.",
  ];

  const exportReport = () => {
    const rows = [
      ["Type", "Category", "Title", "Amount", "Date"],
      ...monthTransactions.map((transaction) => [
        transaction.type,
        transaction.category || "General",
        transaction.title || "Transaction",
        Number(transaction.amount || 0),
        transaction.createdAt || transaction.date,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `financial-health-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <section className="financial-health-page">
        <div className="financial-health-empty">
          <HeartPulse size={36} />
          <h2>Loading your financial health…</h2>
          <p>Preparing your latest savings, spending and goal insights.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="financial-health-page">
      <style>{`
        .financial-health-page { min-width: 0; padding: 2px 0 24px; }
        .financial-health-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
        .financial-health-header h1 { margin: 0; color: #102348; font-family: Manrope, sans-serif; font-size: 27px; line-height: 1.2; }
        .financial-health-header p { margin: 5px 0 0; color: #5d6f8c; font-size: 13px; }
        .financial-health-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.9fr) minmax(280px, 0.95fr); gap: 16px; margin-bottom: 18px; }
        .financial-health-card { min-width: 0; padding: 16px; border: 1px solid #e3eaf4; border-radius: 12px; background: #fff; box-shadow: 0 7px 18px rgba(25, 61, 111, 0.035); }
        .financial-health-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .financial-health-card-header h2 { margin: 0; color: #102348; font-size: 14px; }
        .financial-health-card-header small { color: #62738d; font-size: 10px; }
        .financial-health-toggle-button { border: 1px solid #dfeaf8; border-radius: 8px; background: #f3f7ff; color: #1458ed; padding: 6px 10px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; }
        .financial-health-toggle-button:hover { background: #eaf2ff; border-color: #b7cfff; }
        .financial-health-score-panel { display: grid; place-items: center; min-height: 220px; }
        .score-ring { position: relative; display: grid; place-items: center; width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#00a978 0 ${healthScore}%, #eaf0f6 ${healthScore}% 100%); }
        .score-ring::before { content: ""; position: absolute; inset: 19px; border-radius: 50%; background: #fff; }
        .score-ring div { position: relative; z-index: 1; text-align: center; }
        .score-ring strong { display: block; margin-bottom: -10px; color: #102348; font-size: 27px; }
        .score-ring span { display: block; color: #647791; font-size: 10px; }
        .score-caption { margin-top: 12px; color: #1f7a49; font-size: 12px; font-weight: 800; text-align: center; }
        .score-caption small { display: block; margin-top: 4px; color: #697c95; font-weight: 600; }
        .factor-list { display: grid; gap: 12px; }
        .factor-item { display: grid; grid-template-columns: minmax(0, 1fr) 74px; gap: 10px; align-items: center; }
        .factor-name { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .factor-name span { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 8px; background: #edf3ff; color: #1458ed; }
        .factor-name b { display: block; overflow: hidden; color: #25436c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
        .progress-bar { position: relative; height: 8px; overflow: hidden; border-radius: 999px; background: #edf1f6; }
        .progress-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00a978, #1bbf7d); }
        .factor-score { display: flex; align-items: center; justify-content: flex-end; gap: 8px; color: #213957; font-size: 10px; font-weight: 800; }
        .factor-score span { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; min-height: 24px; border-radius: 999px; background: #f0f5ff; color: #1458ed; }
        .trend-card { min-height: 220px; }
        .trend-svg-wrap { display: block; width: 100%; height: 160px; }
        .trend-svg-wrap svg { display: block; width: 100%; height: 100%; }
        .trend-svg-wrap line { stroke: #ebf0f7; stroke-width: 1; }
        .trend-svg-wrap path { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        .trend-svg-wrap .line-income { stroke: #00a978; }
        .trend-svg-wrap .line-expense { stroke: #1458ed; }
        .trend-legend { display: flex; align-items: center; gap: 12px; margin-top: 10px; color: #4e6787; font-size: 10px; font-weight: 700; }
        .trend-legend b { display: inline-flex; align-items: center; gap: 6px; }
        .trend-legend i { width: 10px; height: 3px; border-radius: 999px; display: inline-block; }
        .trend-labels { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; margin-top: 10px; color: #73839a; font-size: 8px; text-align: center; }
        .financial-health-main { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(250px, 0.72fr) minmax(250px, 0.72fr); gap: 16px; }
        .factor-panel-list { display: grid; gap: 0; }
        .detail-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #edf1f6; }
        .detail-row:first-child { border-top: 0; }
        .detail-name { display: flex; align-items: center; gap: 9px; }
        .detail-name span { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 9px; } 
        .detail-name strong { display: block; color: #203457; font-size: 11px; }
        .detail-name small { display: block; color: #677d96; font-size: 9px; }
        .detail-progress { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; }
        .detail-progress .progress-bar { width: min(100%, 220px); }
        .detail-value { min-width: 44px; text-align: right; color: #102348; font-size: 10px; font-weight: 800; }
        .summary-card { display: grid; gap: 12px; }
        .summary-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #edf1f6; }
        .summary-item:first-child { border-top: 0; }
        .summary-item small { display: flex; align-items: center; gap: 8px; color: #5a6f8d; font-size: 10px; font-weight: 700; }
        .summary-item small span { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 8px; background: #edf5ff; color: #1458ed; }
        .summary-item b { color: #102348; font-size: 16px; }
        .summary-item mark { background: transparent; color: #1d8f5a; font-size: 10px; font-weight: 800; }
        .insights-list { display: grid; gap: 10px; }
        .insight-item { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 0; border-top: 1px solid #edf1f6; }
        .insight-item:first-child { border-top: 0; }
        .insight-item > span { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 7px; background: #edf6ff; color: #1458ed; }
        .insight-item p { margin: 0; color: #314968; font-size: 11px; line-height: 1.55; }
        .goals-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
        .goal-card { min-width: 0; padding: 16px; border: 1px solid #e3eaf4; border-radius: 12px; background: #fff; box-shadow: 0 7px 18px rgba(25, 61, 111, 0.035); }
        .goal-card .goal-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
        .goal-card .goal-head span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 10px; } 
        .goal-card h3 { margin: 0; color: #102348; font-size: 18px; }
        .goal-card p { margin: 5px 0 0; color: #63778c; font-size: 11px; }
        .goal-card .goal-progress { position: relative; height: 8px; overflow: hidden; margin: 16px 0 10px; border-radius: 999px; background: #edf1f6; }
        .goal-card .goal-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00a978, #56d1a5); }
        .recommendation-panel { display: grid; gap: 10px; }
        .recommendation-item { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid #edf1f6; }
        .recommendation-item:first-child { border-top: 0; }
        .recommendation-item > span { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 7px; background: #eef7ff; color: #1458ed; }
        .recommendation-item b { display: block; color: #203356; font-size: 11px; }
        .recommendation-item p { margin: 3px 0 0; color: #667c97; font-size: 9px; line-height: 1.5; }
        .recommendation-item button { border: 1px solid #dfeaf7; background: #fff; color: #1458ed; border-radius: 7px; min-height: 28px; padding: 0 12px; font-size: 9px; font-weight: 800; cursor: pointer; }
        .financial-health-empty { display: flex; min-height: 240px; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; color: #60738c; }
        .financial-health-empty h2 { margin: 14px 0 8px; color: #102348; font-size: 22px; }
        .financial-health-empty p { margin: 0; max-width: 360px; font-size: 13px; }
        @media (max-width: 1180px) {
          .financial-health-grid { grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr); }
          .trend-card { grid-column: span 2; }
          .financial-health-main { grid-template-columns: minmax(0,1fr) minmax(240px,0.9fr); }
          .recommendation-panel { grid-column: span 2; }
        }
        @media (max-width: 860px) {
          .financial-health-grid, .financial-health-main, .goals-row { grid-template-columns: 1fr; }
          .trend-card { grid-column: auto; }
          .recommendation-panel { grid-column: auto; }
        }
        @media (max-width: 640px) {
          .financial-health-header { flex-direction: column; align-items: stretch; }
          .financial-health-date { width: 100%; justify-content: center; }
          .score-ring { width: 130px; height: 130px; }
          .detail-row { grid-template-columns: 1fr; }
          .detail-progress { grid-template-columns: 1fr; }
          .detail-progress .progress-bar { width: 100%; }
          .detail-value { text-align: left; }
          .recommendation-item { grid-template-columns: 24px minmax(0,1fr); }
          .recommendation-item button { grid-column: 2; justify-self: start; }
        }
      `}</style>

      <div className="financial-health-header">
        <div>
          <h1>Financial Health</h1>
          <p>Track your financial wellness and build better money habits.</p>
        </div>

        <WorkspaceCalendar value={selectedDate} onChange={setSelectedDate} ariaLabel="Select financial health date" />
      </div>

      {error && <p className="analytics-error">{error}</p>}

      <div className="financial-health-grid">
        <div className="financial-health-card financial-health-score-panel">
          <div className="score-ring" aria-label={`Financial health score ${healthScore}`}>
            <div>
              <strong>{healthScore}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="score-caption">
            Great!
            <small>You’re making smarter financial decisions and building strong habits. Keep it up!</small>
          </div>
        </div>

        <div className="financial-health-card">
          <div className="financial-health-card-header">
            <h2>Score Breakdown by Key Factors</h2>
            <button type="button" className="financial-health-toggle-button" onClick={() => setShowFactorDetails((previous) => !previous)} aria-expanded={showFactorDetails}>
              {showFactorDetails ? "Hide Details" : "View Details"}
            </button>
          </div>
          <div className="factor-list">
            {scoreBreakdown.map((factor) => (
              <div key={factor.name} className="factor-item">
                <div className="factor-name">
                  <span style={{ background: `${factor.color}1A`, color: factor.color }}>
                    {factor.name === "Spending" ? <TrendingDown size={14} /> : factor.name === "Savings" ? <PiggyBank size={14} /> : factor.name === "Budgeting" ? <WalletCards size={14} /> : factor.name === "Debt Management" ? <ShieldCheck size={14} /> : <Target size={14} />}
                  </span>
                  <b>{factor.name}</b>
                </div>
                <div className="factor-score">
                  <div className="progress-bar" style={{ width: "100%" }}>
                    <i style={{ width: `${factor.score}%`, background: `linear-gradient(90deg, ${factor.color}, ${factor.color}CC)` }} />
                  </div>
                  <span>{factor.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="financial-health-card trend-card">
          <div className="financial-health-card-header">
            <h2>Score Trend</h2>
            <small>6 Months</small>
          </div>

          <div className="trend-svg-wrap">
            <svg viewBox="0 0 480 160" aria-label="Financial health score trend" role="img">
              {[20, 50, 80, 110, 140].map((y) => <line key={y} x1="10" x2="470" y1={y} y2={y} />)}
              <path className="line-income" d={sixMonthTrend.map((item, index) => {
                const x = 20 + (index * 430) / Math.max(5, sixMonthTrend.length - 1);
                const y = 132 - (item.income / trendMax) * 90;
                return `${index === 0 ? "M" : "L"}${x},${y}`;
              }).join(" ")} />
              <path className="line-expense" d={sixMonthTrend.map((item, index) => {
                const x = 20 + (index * 430) / Math.max(5, sixMonthTrend.length - 1);
                const y = 132 - (item.expenses / trendMax) * 90;
                return `${index === 0 ? "M" : "L"}${x},${y}`;
              }).join(" ")} />
            </svg>
          </div>

          <div className="trend-legend">
            <b><i style={{ background: "#00a978" }} /> Income</b>
            <b><i style={{ background: "#1458ed" }} /> Expenses</b>
          </div>

          <div className="trend-labels">
            {sixMonthTrend.map((item) => <span key={`${item.label}-${item.income}`}>{item.label}</span>)}
          </div>
        </div>
      </div>

      {showFactorDetails && (
        <div className="financial-health-main">
          <div className="financial-health-card factor-panel-list">
            <div className="financial-health-card-header">
              <h2>Health Factor Details</h2>
              <small>Insights</small>
            </div>

            {factorDetails.map((factor) => (
              <div key={factor.name} className="detail-row">
                <div className="detail-name">
                  <span style={{ background: `${factor.tone === "blue" ? "#eaf1ff" : factor.tone === "green" ? "#e8faf2" : factor.tone === "amber" ? "#fff3df" : factor.tone === "purple" ? "#f2ecff" : "#eaf8ff"}`, color: factor.tone === "blue" ? "#1458ed" : factor.tone === "green" ? "#00a978" : factor.tone === "amber" ? "#f59e0b" : factor.tone === "purple" ? "#8b5cf6" : "#1fa5bd" }}>
                    {factor.name === "Spending" ? <TrendingDown size={14} /> : factor.name === "Savings" ? <PiggyBank size={14} /> : factor.name === "Budgeting" ? <WalletCards size={14} /> : factor.name === "Debt Management" ? <ShieldCheck size={14} /> : <Target size={14} />}
                  </span>
                  <div>
                    <strong>{factor.name}</strong>
                    <small>{factor.target}</small>
                  </div>
                </div>
                <div className="detail-progress">
                  <div className="progress-bar"><i style={{ width: `${factor.value}%`, background: factor.tone === "blue" ? "linear-gradient(90deg, #1458ed, #5e9eff)" : factor.tone === "green" ? "linear-gradient(90deg, #00a978, #2ac58d)" : factor.tone === "amber" ? "linear-gradient(90deg, #f59e0b, #f7c96c)" : factor.tone === "purple" ? "linear-gradient(90deg, #8b5cf6, #b394ff)" : "linear-gradient(90deg, #1fa5bd, #5cd0df)" }} /></div>
                  <div className="detail-value">{factor.value}/100</div>
                </div>
              </div>
            ))}
          </div>

        <div className="financial-health-card summary-card">
          <div className="financial-health-card-header">
            <h2>Financial Health Summary</h2>
            <small>Today</small>
          </div>

          <div className="summary-item">
            <small><span><WalletCards size={13} /></span> Monthly Budget</small>
            <b>{money.format(selectedMonthBudget || 0)}</b>
          </div>
          <div className="summary-item">
            <small><span><ShieldCheck size={13} /></span> Emergency Fund</small>
            <b>{money.format(accountBalance || 0)}</b>
          </div>
          <div className="summary-item">
            <small><span><PiggyBank size={13} /></span> Debt-to-Income</small>
            <b>{((totalExpenses / Math.max(totalIncome, 1)) * 100).toFixed(0)}%</b>
          </div>
          <div className="summary-item">
            <small><span><Target size={13} /></span> Savings Rate</small>
            <b>{Number.isFinite(savingsRate) ? `${savingsRate.toFixed(0)}%` : "0%"}</b>
          </div>
          <div className="summary-item">
            <small><span><TrendingUp size={13} /></span> Cash Flow</small>
            <b>{money.format(Math.max(netSavings, 0))}</b>
          </div>
          <div className="summary-item">
            <small><span><WalletCards size={13} /></span> Net Worth</small>
            <b>{money.format(netWorth)}</b>
          </div>
        </div>

        <div className="financial-health-card">
          <div className="financial-health-card-header">
            <h2>Personalized Insights</h2>
          </div>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={insight} className="insight-item">
                <span>{index % 2 === 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <div className="goals-row">
        {visibleGoals.length ? visibleGoals.map((goal, index) => (
          <div key={`${goal.name}-${index}`} className="goal-card">
            <div className="goal-head">
              <span style={{ background: index % 3 === 0 ? "#e8faf2" : index % 3 === 1 ? "#f2ecff" : "#edf5ff", color: index % 3 === 0 ? "#00a978" : index % 3 === 1 ? "#8b5cf6" : "#1458ed" }}>
                {index % 3 === 0 ? <ShieldCheck size={16} /> : index % 3 === 1 ? <Target size={16} /> : <WalletCards size={16} />}
              </span>
              <span style={{ color: index % 3 === 0 ? "#1f7a49" : index % 3 === 1 ? "#8b5cf6" : "#1458ed", fontWeight: 800, fontSize: "12px" }}>{Math.round(goal.progress)}%</span>
            </div>
            <h3>{goal.name}</h3>
            <p>{money.format(goal.saved)} of {money.format(goal.target || goal.saved)}</p>
            <div className="goal-progress"><i style={{ width: `${goal.progress}%` }} /></div>
          </div>
        )) : (
          <div className="financial-health-card" style={{ gridColumn: "1 / -1" }}>
            <div className="financial-health-card-header">
              <h2>No goals yet</h2>
            </div>
            <p style={{ margin: 0, color: "#647792" }}>Add savings goals to see live progress updates here.</p>
          </div>
        )}
      </div>

      <div className="financial-health-card recommendation-panel" style={{ marginTop: "18px" }}>
        <div className="financial-health-card-header">
          <h2>Recommendation</h2>
          <small>Next Steps</small>
        </div>

        {recommendations.map((item) => (
          <div key={item.title} className="recommendation-item">
            <span><Sparkles size={12} /></span>
            <div>
              <b>{item.title}</b>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
