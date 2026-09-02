import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Flag,
  Goal,
  Landmark,
  PiggyBank,
  Sparkles,
  Star,
  Trophy,
  Route,
  WalletCards,
} from "lucide-react";
import {
  getAccountsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

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

function asNumber(value) {
  return Number(value || 0);
}

function monthRangeFor(dateString) {
  const anchor = new Date(`${dateString}T00:00:00`);
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

function formatMonthRange(start, end) {
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEarliestDate(items) {
  const parsed = items
    .map((item) =>
      toDate(item.createdAt || item.date || item.targetDate || item.deadline),
    )
    .filter(Boolean)
    .sort((a, b) => a - b);
  return parsed[0] || null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function FinancialJourney() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [showAllGoals, setShowAllGoals] = useState(false);
  const nextStepsRef = useRef(null);
  const goalSnapshotRef = useRef(null);

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

        const loadedTransactions = transactionsResponse?.data?.transactions
          ?.length
          ? transactionsResponse.data.transactions
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
            "Unable to load your journey data right now.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    const timer = window.setTimeout(load, 0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  const selectedMonth = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );
  const selectedRange = useMemo(
    () => monthRangeFor(selectedDate),
    [selectedDate],
  );

  const monthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const txDate = toDate(transaction.createdAt || transaction.date);
        if (!txDate) return false;
        return txDate >= selectedRange.start && txDate <= selectedRange.end;
      }),
    [selectedRange, transactions],
  );

  const totalIncome = useMemo(
    () =>
      monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + asNumber(item.amount), 0),
    [monthTransactions],
  );

  const totalExpenses = useMemo(
    () =>
      monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + asNumber(item.amount), 0),
    [monthTransactions],
  );

  const totalSaved = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + asNumber(item.amount), 0) -
      transactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + asNumber(item.amount), 0),
    [transactions],
  );

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

  const netWorth = accountBalance + goalSaved;
  const previousMonth = useMemo(
    () =>
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    [selectedMonth],
  );

  const previousMonthRange = useMemo(
    () => monthRangeFor(previousMonth.toISOString().slice(0, 10)),
    [previousMonth],
  );

  const previousMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const txDate = toDate(transaction.createdAt || transaction.date);
        if (!txDate) return false;
        return (
          txDate >= previousMonthRange.start && txDate <= previousMonthRange.end
        );
      }),
    [previousMonthRange, transactions],
  );

  const previousIncome = previousMonthTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + asNumber(item.amount), 0);

  const previousExpenses = previousMonthTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + asNumber(item.amount), 0);

  const previousNetWorth =
    accountBalance + goalSaved - (previousIncome - previousExpenses);
  const netWorthGrowth = previousNetWorth
    ? ((netWorth - previousNetWorth) / previousNetWorth) * 100
    : 0;

  const joinedSince =
    getEarliestDate(transactions) || getEarliestDate(goals) || new Date();
  const journeyStartedLabel = joinedSince.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const goalProgress = useMemo(
    () =>
      goals.map((goal) => ({
        ...goal,
        saved: asNumber(goal.savedAmount ?? goal.currentAmount ?? 0),
        target: asNumber(
          goal.targetAmount ?? goal.amount ?? goal.goalAmount ?? 0,
        ),
        progress: clamp(
          goal.target
            ? (asNumber(goal.savedAmount ?? goal.currentAmount ?? 0) /
                goal.target) *
                100
            : 0,
          0,
          100,
        ),
        name: goal.name || "Goal",
      })),
    [goals],
  );

  const completedGoals = goalProgress.filter(
    (goal) => goal.progress >= 100,
  ).length;
  const introMilestones = [
    {
      label: "Journey Started",
      date: journeyStartedLabel,
      detail: "Joined Ledgrace",
      icon: Flag,
    },
    {
      label: "First Income Added",
      date: getEarliestDate(
        monthTransactions.filter((item) => item.type === "income"),
      )
        ? getEarliestDate(
            monthTransactions.filter((item) => item.type === "income"),
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No income yet",
      detail: `${money.format(totalIncome || 0)} earned`,
      icon: CircleDollarSign,
    },
    {
      label: "First Savings Goal",
      date: getEarliestDate(goals)
        ? getEarliestDate(goals).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No goal yet",
      detail: goals[0] ? `${goals[0].name}` : "Add a goal",
      icon: Goal,
    },
    {
      label: "Budget Streak",
      date: totalExpenses ? "On track" : "Setup in progress",
      detail: `${money.format(totalExpenses || 0)} spent`,
      icon: WalletCards,
    },
    {
      label: "Milestones Achieved",
      date: `${completedGoals} goal${completedGoals === 1 ? "" : "s"}`,
      detail: `${completedGoals} achieved`,
      icon: Trophy,
    },
    {
      label: "Level Up",
      date: `${Math.max(1, Math.min(10, Math.round(netWorth / 1000000)))} / 10`,
      detail: `${money.format(netWorth || 0)} net worth`,
      icon: BadgeCheck,
    },
  ];

  const journeyPercent = clamp(
    Math.min(
      100,
      (netWorth / Math.max(netWorth + Math.max(totalExpenses, 1), 1)) * 100,
    ),
    0,
    100,
  );
  const currentLevel = Math.max(
    1,
    Math.min(10, Math.round(journeyPercent / 10) + 1),
  );

  const stats = [
    {
      label: "Total Income",
      value: totalIncome,
      note: "Across all time",
      tone: "green",
      icon: CircleDollarSign,
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      note: "Across all time",
      tone: "red",
      icon: WalletCards,
    },
    {
      label: "Total Saved",
      value: totalSaved,
      note: "Across all time",
      tone: "purple",
      icon: PiggyBank,
    },
    {
      label: "Investments",
      value: accountBalance,
      note: "This month",
      tone: "amber",
      icon: Landmark,
    },
  ];

  const visibleGoals = useMemo(
    () => (showAllGoals ? goalProgress : goalProgress.slice(0, 2)),
    [goalProgress, showAllGoals],
  );

  const journeyInsights = useMemo(
    () => [
      {
        title: "Great Growth",
        copy:
          totalSaved >= 0
            ? `Your net worth is growing well and your balance is currently ${money.format(netWorth)}.`
            : "Your current balance needs a little more attention to improve the growth curve.",
        icon: ArrowUpRight,
        tone: "green",
      },
      {
        title: "Consistent Saver",
        copy:
          totalIncome > 0
            ? `You saved ${money.format(Math.max(totalSaved, 0))} from your current income, which is a healthy rhythm.`
            : "Add more income entries to improve your savings momentum.",
        icon: PiggyBank,
        tone: "blue",
      },
      {
        title: "Goal Achiever",
        copy: goals.length
          ? `You have ${goals.length} active goal${goals.length === 1 ? "" : "s"} and ${completedGoals} already completed.`
          : "Set a goal to start tracking your next milestone.",
        icon: Trophy,
        tone: "purple",
      },
      {
        title: "Improving Habits",
        copy:
          totalExpenses > 0
            ? `Your spending is recorded in real time, helping you stay aware of budget habits.`
            : "Your spending history will appear here as soon as you add transactions.",
        icon: Sparkles,
        tone: "amber",
      },
    ],
    [
      completedGoals,
      goals.length,
      netWorth,
      totalExpenses,
      totalSaved,
      totalIncome,
    ],
  );

  const upcomingSteps = [
    {
      title: "Increase your savings rate to 30%",
      detail: `You're currently at ${Number.isFinite(totalIncome && totalExpenses ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0) ? (((totalIncome - totalExpenses) / Math.max(totalIncome, 1)) * 100).toFixed(0) : 0}%`,
      icon: ArrowUpRight,
    },
    {
      title: "Invest in your future",
      detail: "Explore investment options for long-term growth.",
      icon: Landmark,
    },
    {
      title: "Build your emergency fund",
      detail: "Try to save six months of essential expenses.",
      icon: Star,
    },
  ];

  const recentAchievements = [
    {
      title: `${goals[0]?.name || "Goal"} reached`,
      detail: goals[0]
        ? `${money.format(goals[0].savedAmount ?? goals[0].currentAmount ?? 0)} saved`
        : "No goal set yet",
      date: goals[0]
        ? new Date(
            goals[0].createdAt || goals[0].date || Date.now(),
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No recent milestone",
      icon: Star,
    },
    {
      title: "Cash flow healthy",
      detail: `Saved ${money.format(Math.max(totalSaved, 0))} this period`,
      date: selectedRange.end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      icon: BadgeCheck,
    },
    {
      title: "Emergency fund building",
      detail: `Balance: ${money.format(accountBalance || 0)}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      icon: ShieldIcon,
    },
  ];

  if (loading) {
    return (
      <section className="journey-page">
        <div className="journey-empty-state">
          <Route size={32} />
          <h2>Loading your journey…</h2>
          <p>Preparing your milestones, growth, and progress.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="journey-page">
      <style>{`
        .journey-page {
          min-width: 0;
          padding: 2px 0 26px;
          color: #122846;
          font-family: "Manrope", sans-serif;
        }
        .journey-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .journey-header h1 {
          margin: 0;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 800;
          color: #102348;
        }
        .journey-header p {
          margin: 6px 0 0;
          color: #60728b;
          font-size: 13px;
        }
        .journey-date-chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 8px 12px;
          border: 1px solid #dfe8f7;
          border-radius: 9px;
          background: #fff;
          color: #324963;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .journey-date-chip input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .journey-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
          gap: 18px;
          align-items: start;
        }
        .journey-main-panel,
        .journey-side-panel,
        .journey-card,
        .journey-summary-card,
        .journey-goal-card {
          background: #fff;
          border: 1px solid #e3ebf5;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(17, 51, 91, 0.04);
        }
        .journey-main-panel {
          padding: 12px 12px 16px;
        }
        .journey-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }
        .journey-stat {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 14px 12px;
          border: 1px solid #e5ebf4;
          border-radius: 12px;
          background: #fdfefe;
        }
        .journey-stat-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #eef4ff;
          color: #1458ed;
        }
        .journey-stat-icon.green { background: #ebfaf2; color: #00a978; }
        .journey-stat-icon.purple { background: #f3eeff; color: #8b5cf6; }
        .journey-stat-icon.orange { background: #fff4df; color: #f59e0b; }
        .journey-stat strong {
          display: block;
          margin-top: 3px;
          color: #102348;
          font-size: 13px;
          line-height: 1.2;
        }
        .journey-stat small {
          display: block;
          color: #6a7d91;
          font-size: 10px;
        }
        .journey-stat b {
          display: block;
          margin-top: 3px;
          color: #102348;
          font-size: 17px;
          font-weight: 800;
        }
        .journey-card {
          padding: 16px 18px;
        }
        .journey-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .journey-card-header h2 {
          margin: 0;
          color: #102348;
          font-size: 16px;
          font-weight: 800;
        }
        .journey-card-header button {
          border: 1px solid #dfeaf8;
          border-radius: 8px;
          background: #f8faff;
          color: #1458ed;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }
        .journey-timeline {
          position: relative;
          padding: 18px 10px 8px;
        }
        .journey-timeline::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 52px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #1458ed, #5a9cff, #7d6be8, #f59e0b, #1bbf7d);
          opacity: 0.95;
        }
        .journey-timeline-row {
          position: relative;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 18px;
          align-items: start;
        }
        .journey-step {
          position: relative;
          z-index: 1;
          text-align: center;
          padding-top: 18px;
        }
        .journey-step-icon {
          width: 22px;
          height: 22px;
          margin: 0 auto 10px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff;
          border: 4px solid #e9eef6;
          box-shadow: 0 0 0 3px #fff;
          color: #1458ed;
        }
        .journey-step b {
          display: block;
          color: #112a4d;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .journey-step small {
          display: block;
          color: #6d7d92;
          font-size: 10px;
        }
        .journey-side-panel {
          padding: 18px;
        }
        .journey-progress-wrap {
          display: grid;
          place-items: center;
          margin-bottom: 18px;
        }
        .journey-ring {
          position: relative;
          width: 180px;
          height: 180px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: conic-gradient(#1458ed 0 ${journeyPercent}%, #eaf0f6 ${journeyPercent}% 100%);
        }
        .journey-ring::before {
          content: "";
          position: absolute;
          inset: 18px;
          background: #fff;
          border-radius: 50%;
        }
        .journey-ring-value {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .journey-ring-value strong {
          display: block;
          font-size: 28px;
          color: #102348;
        }
        .journey-ring-value span {
          display: block;
          font-size: 12px;
          color: #70829a;
        }
        .journey-progress-note {
          margin-top: 10px;
          color: #4f647e;
          font-size: 11px;
          text-align: center;
          line-height: 1.5;
        }
        .journey-level-box {
          padding-top: 10px;
          border-top: 1px solid #edf2f8;
        }
        .journey-level-box h3 {
          margin: 0 0 8px;
          color: #102348;
          font-size: 12px;
        }
        .journey-level-box p {
          margin: 0 0 10px;
          color: #657b94;
          font-size: 11px;
          line-height: 1.45;
        }
        .journey-progress-bar {
          position: relative;
          height: 8px;
          border-radius: 999px;
          background: #eef2f8;
          overflow: hidden;
        }
        .journey-progress-bar i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1458ed, #759cff);
        }
        .journey-side-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #edf2f8;
        }
        .journey-side-section h3 {
          margin: 0 0 10px;
          color: #102348;
          font-size: 16px;
          font-weight: 800;
        }
        .journey-list {
          display: grid;
          gap: 10px;
        }
        .journey-list-item {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-top: 1px solid #edf2f8;
        }
        .journey-list-item:first-child {
          border-top: 0;
        }
        .journey-list-item span {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #edf4ff;
          color: #1458ed;
        }
        .journey-list-item b {
          display: block;
          color: #16315c;
          font-size: 12px;
          line-height: 1.25;
        }
        .journey-list-item small {
          display: block;
          margin-top: 3px;
          color: #6c819a;
          font-size: 10px;
        }
        .journey-list-item em {
          font-style: normal;
          color: #5b7188;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .journey-main-lower {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 0.8fr);
          gap: 18px;
          margin-top: 18px;
        }
        .journey-summary-card {
          padding: 18px;
        }
        .journey-summary-card h2 {
          margin: 0 0 16px;
          color: #102348;
          font-size: 16px;
          font-weight: 800;
        }
        .journey-insights-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .journey-insight-card {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e6ecf5;
          background: #fdfefe;
        }
        .journey-insight-card .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .journey-insight-card .head span {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #edf4ff;
          color: #1458ed;
        }
        .journey-insight-card h4 {
          margin: 0;
          color: #112a4d;
          font-size: 12px;
        }
        .journey-insight-card p {
          margin: 8px 0 0;
          color: #5f738d;
          font-size: 11px;
          line-height: 1.5;
        }
        .journey-goal-card {
          padding: 18px 16px;
        }
        .journey-next-steps {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }
        .journey-next-step {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          padding: 8px 0;
          border-top: 1px solid #edf2f8;
        }
        .journey-next-step:first-child { border-top: 0; }
        .journey-next-step span {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #edf6ff;
          color: #1458ed;
        }
        .journey-next-step b {
          display: block;
          color: #112a4d;
          font-size: 12px;
        }
        .journey-next-step small {
          display: block;
          margin-top: 3px;
          color: #6c7e94;
          font-size: 10px;
        }
        .journey-next-step em {
          font-style: normal;
          color: #60708a;
          font-size: 10px;
          font-weight: 700;
        }
        .journey-bottom-banner {
          margin-top: 18px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 14px;
          background: linear-gradient(90deg, #0e3f9f 0%, #1458ed 100%);
          color: #fff;
          box-shadow: 0 14px 25px rgba(20, 88, 237, 0.2);
        }
        .journey-bottom-banner b {
          display: block;
          font-size: 14px;
        }
        .journey-bottom-banner p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }
        .journey-bottom-banner button {
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          padding: 9px 14px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .journey-empty-state {
          display: flex;
          min-height: 220px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px;
          text-align: center;
          color: #62738d;
        }
        .journey-empty-state h2 {
          margin: 12px 0 8px;
          color: #102348;
          font-size: 24px;
        }
        .journey-empty-state p {
          margin: 0;
          max-width: 340px;
          font-size: 13px;
        }
        @media (max-width: 1040px) {
          .journey-grid, .journey-main-lower { grid-template-columns: 1fr; }
          .journey-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 720px) {
          .journey-header { flex-direction: column; align-items: stretch; }
          .journey-date-chip { width: 100%; justify-content: center; }
          .journey-summary-grid,
          .journey-insights-grid,
          .journey-timeline-row { grid-template-columns: 1fr; }
          .journey-timeline::before { display: none; }
          .journey-timeline-row { display: flex; flex-direction: column; }
          .journey-bottom-banner { grid-template-columns: 1fr; text-align: center; }
        }
      `}</style>

      <div className="journey-header">
        <div>
          <h1>Financial Journey</h1>
          <p>Your progress, your growth, your future.</p>
        </div>

        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel="Select journey date"
          className="journey-date-chip"
        />
      </div>

      {error && <p className="dash-workspace-status">{error}</p>}

      <div className="journey-grid">
        <div className="journey-main-panel">
          <div className="journey-summary-grid">
            <div className="journey-stat">
              <span className="journey-stat-icon">
                <Flag size={16} />
              </span>
              <div>
                <small>Journey Since</small>
                <b>{journeyStartedLabel}</b>
              </div>
            </div>
            <div className="journey-stat">
              <span className="journey-stat-icon green">
                <Sparkles size={16} />
              </span>
              <div>
                <small>Net Worth Growth</small>
                <b>
                  {Number.isFinite(netWorthGrowth)
                    ? `${netWorthGrowth.toFixed(1)}%`
                    : "0.0%"}
                </b>
              </div>
            </div>
            <div className="journey-stat">
              <span className="journey-stat-icon purple">
                <Trophy size={16} />
              </span>
              <div>
                <small>Milestones Achieved</small>
                <b>{completedGoals}</b>
              </div>
            </div>
            <div className="journey-stat">
              <span className="journey-stat-icon orange">
                <BadgeCheck size={16} />
              </span>
              <div>
                <small>Current Level</small>
                <b>Level {currentLevel}</b>
              </div>
            </div>
          </div>

          <div className="journey-card">
            <div className="journey-card-header">
              <h2>Financial Journey Timeline</h2>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("journey-timeline")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                All Milestones
              </button>
            </div>

            <div className="journey-timeline" id="journey-timeline">
              <div className="journey-timeline-row">
                {introMilestones.map((milestone, index) => (
                  <div
                    key={`${milestone.label}-${index}`}
                    className="journey-step"
                  >
                    <div className="journey-step-icon">
                      <milestone.icon size={12} />
                    </div>
                    <b>{milestone.label}</b>
                    <small>{milestone.detail}</small>
                    <small style={{ marginTop: "4px" }}>{milestone.date}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="journey-main-lower">
            <div className="journey-summary-card">
              <h2>Key Stats on Your Journey</h2>
              <div className="journey-insights-grid">
                {stats.map((item) => (
                  <div key={item.label} className="journey-insight-card">
                    <div className="head">
                      <h4>{item.label}</h4>
                      <span
                        className={
                          item.tone === "green"
                            ? "green"
                            : item.tone === "red"
                              ? "red"
                              : item.tone === "purple"
                                ? "purple"
                                : "amber"
                        }
                      >
                        <item.icon size={12} />
                      </span>
                    </div>
                    <b
                      style={{
                        display: "block",
                        color: "#102348",
                        fontSize: "14px",
                        marginTop: "4px",
                      }}
                    >
                      {money.format(item.value)}
                    </b>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="journey-side-panel">
              <div className="journey-progress-wrap">
                <div
                  className="journey-ring"
                  aria-label={`Journey progress ${journeyPercent.toFixed(0)} percent`}
                >
                  <div className="journey-ring-value">
                    <strong>{Math.round(journeyPercent)}%</strong>
                    <span>Journey Progress</span>
                  </div>
                </div>
              </div>

              <div className="journey-progress-note">
                You’re more than halfway to financial freedom.
              </div>

              <div className="journey-level-box">
                <h3>Next Level (Level {currentLevel + 1})</h3>
                <p>
                  {money.format(netWorth || 0)} more or reach{" "}
                  {money.format((currentLevel + 1) * 300000)}
                </p>
                <div className="journey-progress-bar">
                  <i style={{ width: `${Math.min(100, journeyPercent)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="journey-side-panel">
          <div className="journey-progress-wrap">
            <div
              className="journey-ring"
              aria-label={`Journey progress ${journeyPercent.toFixed(0)} percent`}
            >
              <div className="journey-ring-value">
                <strong>{Math.round(journeyPercent)}%</strong>
                <span>Journey Progress</span>
              </div>
            </div>
          </div>

          <div className="journey-progress-note">
            You’re more than halfway to financial freedom.
          </div>

          <div className="journey-level-box">
            <h3>Next Level (Level {currentLevel + 1})</h3>
            <p>
              {money.format(netWorth || 0)} more or reach{" "}
              {money.format((currentLevel + 1) * 300000)}
            </p>
            <div className="journey-progress-bar">
              <i style={{ width: `${Math.min(100, journeyPercent)}%` }} />
            </div>
          </div>

          <div className="journey-side-section">
            <h3>Recent Achievements</h3>
            <div className="journey-list">
              {recentAchievements.map((item) => (
                <div key={item.title} className="journey-list-item">
                  <span>
                    <item.icon size={12} />
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <small>{item.detail}</small>
                  </div>
                  <em>{item.date}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="journey-side-section" ref={nextStepsRef}>
            <h3>Your Next Steps</h3>
            <div className="journey-next-steps">
              {upcomingSteps.map((step) => (
                <div key={step.title} className="journey-next-step">
                  <span>
                    <step.icon size={12} />
                  </span>
                  <div>
                    <b>{step.title}</b>
                    <small>{step.detail}</small>
                  </div>
                  <em>›</em>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="journey-bottom-banner">
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,0.14)",
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <b>Your journey is amazing!</b>
          <p>
            You’ve come so far and your future is even brighter. Keep going,
            you’re doing great!
          </p>
        </div>
      </div>

      <div className="journey-main-lower" style={{ marginTop: 18 }}>
        <div className="journey-summary-card">
          <h2>Journey Insights</h2>
          <div className="journey-insights-grid">
            {journeyInsights.map((insight) => (
              <div key={insight.title} className="journey-insight-card">
                <div className="head">
                  <h4>{insight.title}</h4>
                  <span
                    className={
                      insight.tone === "green"
                        ? "green"
                        : insight.tone === "blue"
                          ? "blue"
                          : insight.tone === "purple"
                            ? "purple"
                            : "amber"
                    }
                  >
                    <insight.icon size={12} />
                  </span>
                </div>
                <p>{insight.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="journey-goal-card" ref={goalSnapshotRef}>
          <div className="journey-card-header" style={{ marginBottom: 12 }}>
            <h2>Goal Snapshot</h2>
            <button
              type="button"
              onClick={() => setShowAllGoals((current) => !current)}
            >
              {showAllGoals ? "Show Less" : "View All"}
            </button>
          </div>
          {visibleGoals.length ? (
            visibleGoals.map((goal) => (
              <div key={goal.name} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <strong style={{ fontSize: "12px", color: "#16315c" }}>
                    {goal.name}
                  </strong>
                  <span
                    style={{
                      color: "#1458ed",
                      fontWeight: 800,
                      fontSize: "11px",
                    }}
                  >
                    {Math.round(goal.progress)}%
                  </span>
                </div>
                <div className="journey-progress-bar">
                  <i style={{ width: `${goal.progress}%` }} />
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#647a93",
                    fontSize: "10px",
                  }}
                >
                  {money.format(goal.saved)} of{" "}
                  {money.format(goal.target || goal.saved)}
                </p>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, color: "#647a93", fontSize: "11px" }}>
              Add goals to start tracking milestones.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon(props) {
  return <BadgeCheck {...props} />;
}
