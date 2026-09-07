import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { money } from "./preferences.js";
import {
  ArrowDownRight,
  ArrowUpRight,
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

function monthRangeFor(date) {
  const anchor = new Date(`${date}T00:00:00`);
  return {
    start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    end: new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  };
}

function asNumber(value) {
  return Number(value || 0);
}

function translateGoalName(name, translate) {
  const keyByName = {
    "New Laptop": "goal_new_laptop",
    Graduation: "goal_graduation",
    "New Phone": "goal_new_phone",
  };
  return keyByName[name] ? translate(keyByName[name]) : name;
}

export default function FinancialHealth({ topSearch = "" }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en-US";
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [showFactorDetails, setShowFactorDetails] = useState(false);

  const selectedMonth = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );
  const selectedRange = useMemo(
    () => monthRangeFor(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const user = readUser();
        const persistedTransactions = readLegacyTransactions(
          `ledgrace_transactions_${user.email || "guest"}`,
        );

        const [transactionsResponse, accountsResponse, goalsResponse] =
          await Promise.all([
            getTransactionsRequest(),
            getAccountsRequest(),
            getSavingsGoalsRequest(),
          ]);

        if (!alive) return;

        const apiTransactions = transactionsResponse?.data?.transactions || [];
        const loadedTransactions = apiTransactions.length
          ? apiTransactions
          : persistedTransactions;
        setTransactions(loadedTransactions);
        setAccounts(accountsResponse?.data?.accounts || []);
        setGoals(goalsResponse?.data?.goals || []);
      } catch (requestError) {
        if (!alive) return;
        const user = readUser();
        const persistedTransactions = readLegacyTransactions(
          `ledgrace_transactions_${user.email || "guest"}`,
        );
        setTransactions(persistedTransactions);
        setError(
          requestError.response?.data?.message ||
            t("financial_health_load_error"),
        );
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
  }, [t]);

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
        income:
          summary.income + (item.type === "income" ? asNumber(item.amount) : 0),
        expenses:
          summary.expenses +
          (item.type === "expense" ? asNumber(item.amount) : 0),
      }),
      { income: 0, expenses: 0 },
    );
  }, [monthTransactions]);

  const accountBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, account) =>
          sum +
          asNumber(account.currentBalance ?? account.startingBalance ?? 0),
        0,
      ),
    [accounts],
  );

  const goalSaved = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum + asNumber(goal.savedAmount ?? goal.currentAmount ?? 0),
        0,
      ),
    [goals],
  );

  const totalIncome = totals.income;
  const totalExpenses = totals.expenses;
  const selectedMonthBudget = useMemo(
    () =>
      monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + asNumber(transaction.amount), 0),
    [monthTransactions],
  );
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome
    ? (netSavings / totalIncome) * 100
    : 0;
  const netWorth = accountBalance + goalSaved;
  const visibleGoals = useMemo(
    () =>
      goals.slice(0, 3).map((goal) => {
        const saved = asNumber(goal.savedAmount ?? goal.currentAmount ?? 0);
        const target = asNumber(
          goal.targetAmount ?? goal.amount ?? goal.goalAmount ?? 0,
        );
        return {
          ...goal,
          name: translateGoalName(goal.name || t("untitled_goal"), t),
          saved,
          target,
          progress: target ? clamp((saved / target) * 100, 0, 100) : 0,
        };
      }),
    [goals, t],
  );

  const accountHighlights = useMemo(
    () =>
      accounts.slice(0, 3).map((account) => ({
        ...account,
        name: account.name || "Account",
        balance: asNumber(
          account.currentBalance ?? account.startingBalance ?? 0,
        ),
      })),
    [accounts],
  );

  const categoryBreakdown = useMemo(() => {
    const buckets = new Map();
    monthTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const name = item.category || t("other");
        buckets.set(name, (buckets.get(name) || 0) + asNumber(item.amount));
      });

    return [...buckets.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        color: [
          "#1458ed",
          "#00a978",
          "#f59e0b",
          "#8b5cf6",
          "#1fa5bd",
          "#ef6d7a",
        ][index % 6],
      }))
      .sort((first, second) => second.amount - first.amount);
  }, [monthTransactions, t]);

  const totalCategorySpend =
    categoryBreakdown.reduce((sum, item) => sum + item.amount, 0) || 1;

  const healthScore = calculateFinancialHealthScore({
    savingsRate,
    accountBalance,
    goalSaved,
    totalExpenses,
    totalIncome,
  });

  const scoreBreakdown = [
    {
      key: "spending",
      name: t("spending"),
      score: clamp(
        Math.round(100 - (totalExpenses / Math.max(totalIncome, 1)) * 100),
        0,
        100,
      ),
      color: "#1458ed",
      label: totalExpenses > totalIncome ? t("needs_attention") : t("healthy"),
    },
    {
      key: "savings",
      name: t("savings"),
      score: clamp(Math.round(savingsRate), 0, 100),
      color: "#00a978",
      label: savingsRate > 20 ? t("excellent") : savingsRate > 10 ? t("good") : t("low"),
    },
    {
      key: "budgeting",
      name: t("budgeting"),
      score: clamp(
        Math.round(
          100 -
            (categoryBreakdown.length
              ? categoryBreakdown[0].amount / totalCategorySpend
              : 0) *
              100,
        ),
        0,
        100,
      ),
      color: "#f59e0b",
      label: t("on_track"),
    },
    {
      key: "debt-management",
      name: t("debt_management"),
      score: clamp(
        Math.round(
          (1 - Math.min(totalExpenses / Math.max(totalIncome * 1.5, 1), 1)) *
            100,
        ),
        0,
        100,
      ),
      color: "#8b5cf6",
      label: t("good"),
    },
    {
      key: "financial-planning",
      name: t("financial_planning"),
      score: clamp(
        Math.round(
          (goalSaved / Math.max(accountBalance + goalSaved, 1)) * 100 + 20,
        ),
        0,
        100,
      ),
      color: "#1fa5bd",
      label: t("great"),
    },
  ];

  const factorDetails = [
    {
      key: "spending",
      name: t("spending"),
      value: scoreBreakdown[0].score,
      target: t("spending_wisely"),
      tip: t("track_spending_tip"),
      tone: "blue",
    },
    {
      key: "savings",
      name: t("savings"),
      value: scoreBreakdown[1].score,
      target: t("saving_habit"),
      tip: t("staying_consistent"),
      tone: "green",
    },
    {
      key: "budgeting",
      name: t("budgeting"),
      value: scoreBreakdown[2].score,
      target: t("you_have_budget"),
      tip: t("within_limits"),
      tone: "amber",
    },
    {
      key: "debt-management",
      name: t("debt_management"),
      value: scoreBreakdown[3].score,
      target: t("healthy_debt_ratio"),
      tip: t("debt_payments_tip"),
      tone: "purple",
    },
    {
      key: "financial-planning",
      name: t("financial_planning"),
      value: scoreBreakdown[4].score,
      target: t("future_on_track"),
      tip: t("plan_goals_tip"),
      tone: "cyan",
    },
  ];

  const sixMonthTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() - (5 - index),
        1,
      );
      const range = monthRangeFor(date.toISOString().slice(0, 10));
      const values = transactions.filter((transaction) => {
        const txDate = new Date(transaction.createdAt || transaction.date);
        return (
          !Number.isNaN(txDate.getTime()) &&
          txDate >= range.start &&
          txDate <= range.end
        );
      });
      const income = values
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + asNumber(item.amount), 0);
      const expenses = values
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + asNumber(item.amount), 0);
      return {
        label: date.toLocaleDateString(locale, { month: "short" }),
        income,
        expenses,
      };
    });
    return months;
  }, [locale, selectedMonth, transactions]);

  const trendMax = Math.max(
    ...sixMonthTrend.map((month) => month.income || month.expenses),
    1,
  );

  const recommendations = [
    {
      title: t("review_budget"),
      description: t(
        totalExpenses > totalIncome
          ? "spending_above_income_recommendation"
          : "spending_within_income_recommendation",
        {
          amount: money.format(Math.max(totalExpenses - totalIncome, 0)),
          rate: savingsRate.toFixed(1),
        },
      ),
      action: t("review"),
    },
    {
      title: t("automate_savings"),
      description: t(
        savingsRate > 15
          ? "already_saving_recommendation"
          : "low_savings_recommendation",
        { rate: savingsRate.toFixed(1) },
      ),
      action: t("set_up"),
    },
    {
      title: t("track_subscriptions"),
      description: monthTransactions.filter((item) => {
        const text = `${item.category || ""} ${item.title || ""}`.toLowerCase();
        return /(subscription|bill|utility|insurance|renewal)/.test(text);
      }).length
        ? t("recurring_activity_recommendation")
        : t("no_recurring_activity_recommendation"),
      action: t("view_bills"),
    },
  ];
  const query = topSearch.trim().toLowerCase();
  const visibleRecommendations = query
    ? recommendations.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query))
    : recommendations;

  const insights = [
    monthTransactions.length === 0
      ? t("add_transaction_health_prompt")
      : t("real_income_expenses_insight", {
          income: money.format(totals.income),
          expenses: money.format(totals.expenses),
        }),
    totalExpenses > totalIncome
      ? t("spending_above_income_insight", {
          amount: money.format(totalExpenses - totalIncome),
        })
      : t("net_savings_insight", {
          amount: money.format(netSavings),
          rate: savingsRate.toFixed(1),
        }),
    accountHighlights.length > 0
      ? t("account_balance_insight", {
          account: accountHighlights[0].name,
          amount: money.format(accountHighlights[0].balance),
        })
      : t("no_active_account_balances"),
    visibleGoals.length > 0
      ? t("goal_progress_insight", {
          goal: visibleGoals[0].name,
          percent: visibleGoals[0].progress.toFixed(0),
        })
      : t("no_active_goals"),
  ];
  const visibleInsights = query
    ? insights.filter((insight) => insight.toLowerCase().includes(query))
    : insights;

  if (loading) {
    return (
      <section className="financial-health-page">
        <div className="financial-health-empty">
          <HeartPulse size={36} />
          <h2>{t("financial_health_loading")}</h2>
          <p>{t("financial_health_loading_desc")}</p>
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
        :root[data-app-theme="dark"] .financial-health-page .score-ring { background: conic-gradient(#00c98a 0 ${healthScore}%, #1c3959 ${healthScore}% 100%); }
        :root[data-app-theme="dark"] .financial-health-page .score-ring::before { background: #0b1c31; }
        :root[data-app-theme="dark"] .financial-health-page .score-ring strong { color: #e8f1fb; }
        :root[data-app-theme="dark"] .financial-health-page .score-ring span { color: #a9bdd2; }
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
          <h1>{t("financial_health_title")}</h1>
          <p>{t("financial_health_subtitle")}</p>
        </div>

        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel={t("select_financial_health_date")}
        />
      </div>

      {error && <p className="analytics-error">{error}</p>}

      <div className="financial-health-grid">
        <div className="financial-health-card financial-health-score-panel">
          <div
            className="score-ring"
                aria-label={`${t("financial_health_title")} ${healthScore}`}
          >
            <div>
              <strong>{healthScore}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="score-caption">
            {t("great")}
            <small>
              {t("health_score_message")}
            </small>
          </div>
        </div>

        <div className="financial-health-card">
          <div className="financial-health-card-header">
            <h2>{t("health_score_breakdown")}</h2>
            <button
              type="button"
              className="financial-health-toggle-button"
              onClick={() => setShowFactorDetails((previous) => !previous)}
              aria-expanded={showFactorDetails}
            >
              {showFactorDetails ? t("hide_details") : t("view_details")}
            </button>
          </div>
          <div className="factor-list">
            {scoreBreakdown.map((factor) => (
              <div key={factor.name} className="factor-item">
                <div className="factor-name">
                  <span
                    style={{
                      background: `${factor.color}1A`,
                      color: factor.color,
                    }}
                  >
                    {factor.key === "spending" ? (
                      <TrendingDown size={14} />
                    ) : factor.key === "savings" ? (
                      <PiggyBank size={14} />
                    ) : factor.key === "budgeting" ? (
                      <WalletCards size={14} />
                    ) : factor.key === "debt-management" ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Target size={14} />
                    )}
                  </span>
                  <b>{factor.name}</b>
                </div>
                <div className="factor-score">
                  <div className="progress-bar" style={{ width: "100%" }}>
                    <i
                      style={{
                        width: `${factor.score}%`,
                        background: `linear-gradient(90deg, ${factor.color}, ${factor.color}CC)`,
                      }}
                    />
                  </div>
                  <span>{factor.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="financial-health-card trend-card">
          <div className="financial-health-card-header">
            <h2>{t("score_trend")}</h2>
            <small>{t("six_months")}</small>
          </div>

          <div className="trend-svg-wrap">
            <svg
              viewBox="0 0 480 160"
              aria-label={t("financial_health_score_trend")}
              role="img"
            >
              {[20, 50, 80, 110, 140].map((y) => (
                <line key={y} x1="10" x2="470" y1={y} y2={y} />
              ))}
              <path
                className="line-income"
                d={sixMonthTrend
                  .map((item, index) => {
                    const x =
                      20 +
                      (index * 430) / Math.max(5, sixMonthTrend.length - 1);
                    const y = 132 - (item.income / trendMax) * 90;
                    return `${index === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ")}
              />
              <path
                className="line-expense"
                d={sixMonthTrend
                  .map((item, index) => {
                    const x =
                      20 +
                      (index * 430) / Math.max(5, sixMonthTrend.length - 1);
                    const y = 132 - (item.expenses / trendMax) * 90;
                    return `${index === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>

          <div className="trend-legend">
            <b>
              <i style={{ background: "#00a978" }} /> {t("income_label")}
            </b>
            <b>
              <i style={{ background: "#1458ed" }} /> {t("expenses_label")}
            </b>
          </div>

          <div className="trend-labels">
            {sixMonthTrend.map((item) => (
              <span key={`${item.label}-${item.income}`}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>

      {showFactorDetails && (
        <div className="financial-health-main">
          <div className="financial-health-card factor-panel-list">
            <div className="financial-health-card-header">
              <h2>{t("health_factor_details")}</h2>
              <small>{t("insights")}</small>
            </div>

            {factorDetails.map((factor) => (
              <div key={factor.name} className="detail-row">
                <div className="detail-name">
                  <span
                    style={{
                      background: `${factor.tone === "blue" ? "#eaf1ff" : factor.tone === "green" ? "#e8faf2" : factor.tone === "amber" ? "#fff3df" : factor.tone === "purple" ? "#f2ecff" : "#eaf8ff"}`,
                      color:
                        factor.tone === "blue"
                          ? "#1458ed"
                          : factor.tone === "green"
                            ? "#00a978"
                            : factor.tone === "amber"
                              ? "#f59e0b"
                              : factor.tone === "purple"
                                ? "#8b5cf6"
                                : "#1fa5bd",
                    }}
                  >
                    {factor.key === "spending" ? (
                      <TrendingDown size={14} />
                    ) : factor.key === "savings" ? (
                      <PiggyBank size={14} />
                    ) : factor.key === "budgeting" ? (
                      <WalletCards size={14} />
                    ) : factor.key === "debt-management" ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Target size={14} />
                    )}
                  </span>
                  <div>
                    <strong>{factor.name}</strong>
                    <small>{factor.target}</small>
                  </div>
                </div>
                <div className="detail-progress">
                  <div className="progress-bar">
                    <i
                      style={{
                        width: `${factor.value}%`,
                        background:
                          factor.tone === "blue"
                            ? "linear-gradient(90deg, #1458ed, #5e9eff)"
                            : factor.tone === "green"
                              ? "linear-gradient(90deg, #00a978, #2ac58d)"
                              : factor.tone === "amber"
                                ? "linear-gradient(90deg, #f59e0b, #f7c96c)"
                                : factor.tone === "purple"
                                  ? "linear-gradient(90deg, #8b5cf6, #b394ff)"
                                  : "linear-gradient(90deg, #1fa5bd, #5cd0df)",
                      }}
                    />
                  </div>
                  <div className="detail-value">{factor.value}/100</div>
                </div>
              </div>
            ))}
          </div>

          <div className="financial-health-card summary-card">
            <div className="financial-health-card-header">
              <h2>{t("financial_health_summary")}</h2>
              <small>{t("today")}</small>
            </div>

            <div className="summary-item">
              <small>
                <span>
                  <WalletCards size={13} />
                </span>{" "}
                {t("monthly_budget")}
              </small>
              <b>{money.format(selectedMonthBudget || 0)}</b>
            </div>
            <div className="summary-item">
              <small>
                <span>
                  <ShieldCheck size={13} />
                </span>{" "}
                {t("emergency_fund")}
              </small>
              <b>{money.format(accountBalance || 0)}</b>
            </div>
            <div className="summary-item">
              <small>
                <span>
                  <PiggyBank size={13} />
                </span>{" "}
                {t("debt_to_income")}
              </small>
              <b>
                {((totalExpenses / Math.max(totalIncome, 1)) * 100).toFixed(0)}%
              </b>
            </div>
            <div className="summary-item">
              <small>
                <span>
                  <Target size={13} />
                </span>{" "}
                {t("savings_rate")}
              </small>
              <b>
                {Number.isFinite(savingsRate)
                  ? `${savingsRate.toFixed(0)}%`
                  : "0%"}
              </b>
            </div>
            <div className="summary-item">
              <small>
                <span>
                  <TrendingUp size={13} />
                </span>{" "}
                {t("cash_flow")}
              </small>
              <b>{money.format(Math.max(netSavings, 0))}</b>
            </div>
            <div className="summary-item">
              <small>
                <span>
                  <WalletCards size={13} />
                </span>{" "}
                {t("net_worth")}
              </small>
              <b>{money.format(netWorth)}</b>
            </div>
          </div>

          <div className="financial-health-card">
            <div className="financial-health-card-header">
              <h2>{t("personalized_insights")}</h2>
            </div>
            <div className="insights-list">
              {visibleInsights.length ? visibleInsights.map((insight, index) => (
                <div key={insight} className="insight-item">
                  <span>
                    {index % 2 === 0 ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                  </span>
                  <p>{insight}</p>
                </div>
              )) : <p className="insight-item">{t("no_health_insights_match", { query: topSearch.trim() })}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="goals-row">
        {visibleGoals.length ? (
          visibleGoals.map((goal, index) => (
            <div key={`${goal.name}-${index}`} className="goal-card">
              <div className="goal-head">
                <span
                  style={{
                    background:
                      index % 3 === 0
                        ? "#e8faf2"
                        : index % 3 === 1
                          ? "#f2ecff"
                          : "#edf5ff",
                    color:
                      index % 3 === 0
                        ? "#00a978"
                        : index % 3 === 1
                          ? "#8b5cf6"
                          : "#1458ed",
                  }}
                >
                  {index % 3 === 0 ? (
                    <ShieldCheck size={16} />
                  ) : index % 3 === 1 ? (
                    <Target size={16} />
                  ) : (
                    <WalletCards size={16} />
                  )}
                </span>
                <span
                  style={{
                    color:
                      index % 3 === 0
                        ? "#1f7a49"
                        : index % 3 === 1
                          ? "#8b5cf6"
                          : "#1458ed",
                    fontWeight: 800,
                    fontSize: "12px",
                  }}
                >
                  {Math.round(goal.progress)}%
                </span>
              </div>
              <h3>{goal.name}</h3>
              <p>
                {t("goal_amount_progress", {
                  saved: money.format(goal.saved),
                  target: money.format(goal.target || goal.saved),
                })}
              </p>
              <div className="goal-progress">
                <i style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div
            className="financial-health-card"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="financial-health-card-header">
              <h2>{t("no_goals_yet")}</h2>
            </div>
            <p style={{ margin: 0, color: "#647792" }}>
              {t("add_goals_prompt")}
            </p>
          </div>
        )}
      </div>

      <div
        className="financial-health-card recommendation-panel"
        style={{ marginTop: "18px" }}
      >
        <div className="financial-health-card-header">
          <h2>{t("recommendation")}</h2>
          <small>{t("next_steps")}</small>
        </div>

        {visibleRecommendations.length ? visibleRecommendations.map((item) => (
          <div key={item.title} className="recommendation-item">
            <span>
              <Sparkles size={12} />
            </span>
            <div>
              <b>{item.title}</b>
              <p>{item.description}</p>
            </div>
          </div>
            )) : <p className="recommendation-item">{t("no_recommendations_match", { query: topSearch.trim() })}</p>}
      </div>
    </section>
  );
}
