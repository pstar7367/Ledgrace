import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Flag,
  Goal,
  Medal,
  MoreVertical,
  PiggyBank,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";
import { getSavingsGoalsRequest } from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const fallbackColors = ["#1458ed", "#00a978", "#8b5cf6", "#f59e0b", "#ef6d7a"];

function asDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function amount(value) {
  return Number(value || 0);
}
function progress(goal) {
  return Math.min(
    100,
    goal.targetAmount
      ? Math.round((amount(goal.savedAmount) / amount(goal.targetAmount)) * 100)
      : 0,
  );
}
function status(goal) {
  return (
    goal.status ||
    (progress(goal) >= 100
      ? "completed"
      : amount(goal.savedAmount)
        ? "in-progress"
        : "not-started")
  );
}
function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function formatDate(value) {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No target date";
}
function iconForGoal(goal, index) {
  const text = `${goal.name || ""} ${goal.description || ""}`.toLowerCase();
  if (/travel|vacation|bali|trip/.test(text)) return Plane;
  if (/emergency|security|fund/.test(text)) return ShieldCheck;
  if (/car|vehicle/.test(text)) return WalletCards;
  return [Target, Goal, PiggyBank][index % 3];
}

export default function GoalsAndAchievements() {
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const response = await getSavingsGoalsRequest();
        if (active) setGoals(response.data.goals || []);
      } catch (requestError) {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Unable to load your goals and achievements.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const refresh = () => load(false);
    window.addEventListener("focus", refresh);
    window.addEventListener("ledgrace:goal-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ledgrace:goal-changed", refresh);
    };
  }, []);

  const date = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate],
  );
  const currentMonth = monthKey(date);
  const normalizedGoals = useMemo(
    () =>
      goals.map((goal, index) => ({
        ...goal,
        amountSaved: amount(goal.savedAmount),
        target: amount(goal.targetAmount),
        percent: progress(goal),
        state: status(goal),
        color: goal.color || fallbackColors[index % fallbackColors.length],
        Icon: iconForGoal(goal, index),
      })),
    [goals],
  );
  const totalSaved = normalizedGoals.reduce(
    (sum, goal) => sum + goal.amountSaved,
    0,
  );
  const totalTarget = normalizedGoals.reduce(
    (sum, goal) => sum + goal.target,
    0,
  );
  const completed = normalizedGoals.filter(
    (goal) => goal.state === "completed",
  );
  const activeGoals = normalizedGoals.filter(
    (goal) => goal.state !== "completed" && goal.state !== "paused",
  );
  const completion = totalTarget
    ? Math.round((totalSaved / totalTarget) * 100)
    : 0;
  const monthContributions = normalizedGoals
    .flatMap((goal) =>
      (goal.contributions || []).map((item) => ({ ...item, goal })),
    )
    .filter((item) => {
      const contributionDate = asDate(item.date);
      return contributionDate && monthKey(contributionDate) === currentMonth;
    });
  const savedThisMonth = monthContributions.reduce(
    (sum, item) => sum + amount(item.amount),
    0,
  );
  const sixMonths = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, index) =>
          new Date(date.getFullYear(), date.getMonth() - (5 - index), 1),
      ),
    [date],
  );
  const monthlyProgress = sixMonths.map((month) =>
    normalizedGoals.reduce(
      (sum, goal) =>
        sum +
        (goal.contributions || [])
          .filter((item) => {
            const contributionDate = asDate(item.date);
            return (
              contributionDate && monthKey(contributionDate) === monthKey(month)
            );
          })
          .reduce((total, item) => total + amount(item.amount), 0),
      0,
    ),
  );
  const maxProgress = Math.max(...monthlyProgress, 1);
  const upcoming = normalizedGoals
    .filter((goal) => goal.state !== "completed" && asDate(goal.targetDate))
    .sort((a, b) => asDate(a.targetDate) - asDate(b.targetDate))
    .slice(0, 4);
  const achievements = normalizedGoals
    .flatMap((goal) => {
      const entries = [];
      if (goal.percent >= 100)
        entries.push({
          title: `${goal.name} completed`,
          detail: `Reached ${money.format(goal.target)} target`,
          date: goal.updatedAt || goal.targetDate,
          icon: Trophy,
          tone: "green",
        });
      if (goal.amountSaved > 0)
        entries.push({
          title: `${goal.name} started`,
          detail: `${money.format(goal.amountSaved)} saved so far`,
          date: goal.createdAt,
          icon: Medal,
          tone: "blue",
        });
      (goal.contributions || [])
        .filter((item) => asDate(item.date))
        .forEach((item) =>
          entries.push({
            title: "Savings contribution",
            detail: `${money.format(amount(item.amount))} added to ${goal.name}`,
            date: item.date,
            icon: Award,
            tone: "purple",
          }),
        );
      return entries;
    })
    .sort((a, b) => (asDate(b.date) || 0) - (asDate(a.date) || 0))
    .slice(0, 6);
  const milestoneCount = completed.length + monthContributions.length;

  if (loading)
    return (
      <section className="achievements-page">
        <div className="achievements-empty">
          <Trophy />
          <h2>Loading your achievements...</h2>
          <p>Calculating your real goal progress.</p>
        </div>
      </section>
    );

  return (
    <section className="achievements-page">
      <header className="achievements-heading">
        <div>
          <h1>
            Goals &amp; Achievements <Target size={20} />
          </h1>
          <p>Set goals, track your progress and celebrate your wins.</p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          ariaLabel="Select goals and achievements date"
        />
      </header>
      {error && <p className="achievements-error">{error}</p>}
      <div className="achievements-stats">
        <AchievementStat
          label="Total Goals"
          value={normalizedGoals.length}
          detail={`${activeGoals.length} active · ${completed.length} completed`}
          icon={Target}
          tone="blue"
        />
        <AchievementStat
          label="Total Saved"
          value={money.format(totalSaved)}
          detail="Across all goals"
          icon={PiggyBank}
          tone="green"
        />
        <AchievementStat
          label="Goal Completion"
          value={`${completion}%`}
          detail={
            totalTarget
              ? `${money.format(totalSaved)} of ${money.format(totalTarget)}`
              : "No target amounts yet"
          }
          icon={CircleDollarSign}
          tone="purple"
        />
        <AchievementStat
          label="Achievements"
          value={milestoneCount}
          detail={`${achievements.length} recent records`}
          icon={Trophy}
          tone="orange"
        />
      </div>
      <div className="achievements-top-grid">
        <section className="achievements-panel my-goals-panel">
          <div className="achievements-panel-title">
            <div>
              <h2>My Goals</h2>
              <div className="achievement-tabs">
                <button className="active" type="button">
                  Active Goals ({activeGoals.length})
                </button>
                <button type="button">
                  Completed Goals ({completed.length})
                </button>
              </div>
            </div>
            <button
              className="achievement-add-button"
              type="button"
              onClick={() => window.location.assign("/savings-goals?new=1")}
            >
              <Plus size={13} /> Add New Goal
            </button>
          </div>
          <div className="goal-achievement-list">
            {activeGoals.length ? (
              activeGoals
                .slice(0, 4)
                .map((goal) => (
                  <GoalAchievementRow goal={goal} key={goal._id} />
                ))
            ) : (
              <div className="achievements-no-data">
                No active goals are recorded yet.
              </div>
            )}
          </div>
          {normalizedGoals.length > 4 && (
            <button className="achievements-link" type="button">
              View all goals <ChevronRight size={14} />
            </button>
          )}
        </section>
        <section className="achievements-panel progress-overview-panel">
          <div className="achievements-panel-title">
            <h2>Goal Progress Overview</h2>
          </div>
          <div className="progress-overview-content">
            <div
              className="achievement-donut"
              style={{
                background: `conic-gradient(#1458ed 0 ${completion}%, #e9eef6 ${completion}% 100%)`,
              }}
            >
              <div>
                <b>{completion}%</b>
                <small>Overall Progress</small>
              </div>
            </div>
            <div className="goal-legend">
              {normalizedGoals.slice(0, 4).map((goal) => (
                <div key={goal._id}>
                  <i style={{ background: goal.color }} />
                  <span>{goal.name}</span>
                  <strong>{goal.percent}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="achievement-callout">
            <CheckCircle2 />
            <div>
              <b>
                {completion ? "You're making progress" : "Your goals are ready"}
              </b>
              <p>
                {completion
                  ? `${completion}% of your combined target is funded.`
                  : "Add contributions to see your progress here."}
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="achievements-middle-grid">
        <section className="achievements-panel savings-progress-panel">
          <div className="achievements-panel-title">
            <div>
              <h2>Savings Progress</h2>
              <p>
                {monthContributions.length
                  ? `${money.format(savedThisMonth)} saved this month`
                  : "No contributions recorded this month"}
              </p>
            </div>
            <span>This Month</span>
          </div>
          <strong className="progress-total">
            {money.format(savedThisMonth)}
          </strong>
          <p className="progress-change">
            {monthContributions.length
              ? `${monthContributions.length} contribution${monthContributions.length === 1 ? "" : "s"} recorded`
              : "Add a contribution to create progress"}
          </p>
          <div className="achievement-bars">
            {monthlyProgress.map((value, index) => (
              <div key={sixMonths[index].toISOString()}>
                <i
                  style={{
                    height: `${Math.max(3, (value / maxProgress) * 82)}px`,
                  }}
                />
                <b>
                  {sixMonths[index].toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </b>
              </div>
            ))}
          </div>
        </section>
        <section className="achievements-panel funding-panel">
          <div className="achievements-panel-title">
            <h2>Goal Funding Breakdown</h2>
          </div>
          <div className="funding-content">
            <div
              className="achievement-donut funding-donut"
              style={{
                background: `conic-gradient(${normalizedGoals.map((goal, index) => `${goal.color} ${(normalizedGoals.slice(0, index).reduce((sum, entry) => sum + entry.amountSaved, 0) / Math.max(totalSaved, 1)) * 100}% ${(normalizedGoals.slice(0, index + 1).reduce((sum, entry) => sum + entry.amountSaved, 0) / Math.max(totalSaved, 1)) * 100}%`).join(", ") || "#e9eef6 0 100%"})`,
              }}
            >
              <div>
                <b>{money.format(totalSaved)}</b>
                <small>Total Saved</small>
              </div>
            </div>
            <div className="funding-list">
              {normalizedGoals.slice(0, 5).map((goal) => (
                <div key={goal._id}>
                  <i style={{ background: goal.color }} />
                  <span>{goal.name}</span>
                  <strong>
                    {totalSaved
                      ? `${((goal.amountSaved / totalSaved) * 100).toFixed(1)}%`
                      : "0%"}
                  </strong>
                  <small>{money.format(goal.amountSaved)}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="achievements-panel recent-achievements-panel">
          <div className="achievements-panel-title">
            <h2>Recent Achievements</h2>
          </div>
          {achievements.slice(0, 4).map((item) => (
            <div
              className="recent-achievement"
              key={`${item.title}-${item.date}`}
            >
              <span className={item.tone}>
                <item.icon />
              </span>
              <div>
                <b>{item.title}</b>
                <p>{item.detail}</p>
                <small>{formatDate(item.date)}</small>
              </div>
              <CheckCircle2 />
            </div>
          ))}
          {!achievements.length && (
            <div className="achievements-no-data">
              No achievements have been recorded yet.
            </div>
          )}
        </section>
      </div>
      <div className="achievements-bottom-grid">
        <section className="achievements-panel milestones-panel">
          <div className="achievements-panel-title">
            <h2>Upcoming Milestones</h2>
          </div>
          <div className="milestone-list">
            {upcoming.length ? (
              upcoming.map((goal) => (
                <div className="milestone" key={goal._id}>
                  <span
                    className="milestone-icon"
                    style={{ color: goal.color, background: `${goal.color}18` }}
                  >
                    <goal.Icon />
                  </span>
                  <div>
                    <b>{goal.name}</b>
                    <small>{goal.percent}% Milestone</small>
                    <strong>
                      {money.format(goal.amountSaved)} /{" "}
                      {money.format(goal.target)}
                    </strong>
                  </div>
                  <div
                    className="milestone-ring"
                    style={{ "--progress": `${goal.percent}%` }}
                  >
                    <b>{goal.percent}%</b>
                  </div>
                </div>
              ))
            ) : (
              <div className="achievements-no-data">
                Add target dates to see upcoming milestones.
              </div>
            )}
          </div>
        </section>
        <section className="achievement-banner">
          <div>
            <Flag />
            <h2>Celebrate every step forward!</h2>
            <p>Small steps today lead to big achievements tomorrow.</p>
            <div className="banner-metrics">
              <span>
                <b>{money.format(totalTarget)}</b>
                <small>Total Goal Targets</small>
              </span>
              <span>
                <b>{money.format(totalSaved)}</b>
                <small>Total Saved</small>
              </span>
              <span>
                <b>{milestoneCount}</b>
                <small>Achievements Earned</small>
              </span>
            </div>
          </div>
          <Sparkles />
        </section>
      </div>
    </section>
  );
}

function AchievementStat({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className={`achievement-stat ${tone}`}>
      <span>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}
function GoalAchievementRow({ goal }) {
  return (
    <div className="goal-achievement-row">
      <span
        className="goal-achievement-icon"
        style={{ color: goal.color, background: `${goal.color}18` }}
      >
        <goal.Icon />
      </span>
      <div className="goal-achievement-name">
        <b>{goal.name}</b>
        <small>{goal.description || "Savings goal"}</small>
      </div>
      <div className="goal-achievement-progress">
        <i>
          <em style={{ width: `${goal.percent}%`, background: goal.color }} />
        </i>
        <b>{goal.percent}%</b>
      </div>
      <strong>
        {money.format(goal.amountSaved)} / {money.format(goal.target)}
      </strong>
      <small>Target: {formatDate(goal.targetDate)}</small>
      <MoreVertical size={16} />
    </div>
  );
}
