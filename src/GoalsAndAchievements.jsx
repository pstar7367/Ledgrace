import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { money } from "./preferences.js";
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

const fallbackColors = ["#1458ed", "#00a978", "#8b5cf6", "#f59e0b", "#ef6d7a"];

const seededGoalTextKeys = {
  "New Laptop": "goal_new_laptop",
  Graduation: "goal_graduation",
  "New Phone": "goal_new_phone",
};

const seededGoalDescriptionKeys = {
  "a new laptop for work": "goal_description_laptop",
  "Savings for graduation ceremony": "goal_description_graduation",
  "a new device": "goal_description_phone",
};

function localizedGoalText(value, keys, t) {
  const key = keys[value];
  return key ? t(key, { defaultValue: value }) : value;
}

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
function formatDate(value, language, t) {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : t("no_target_date");
}
function iconForGoal(goal, index) {
  const text = `${goal.name || ""} ${goal.description || ""}`.toLowerCase();
  if (/travel|vacation|bali|trip/.test(text)) return Plane;
  if (/emergency|security|fund/.test(text)) return ShieldCheck;
  if (/car|vehicle/.test(text)) return WalletCards;
  return [Target, Goal, PiggyBank][index % 3];
}

export default function GoalsAndAchievements({ topSearch = "" }) {
  const { t, i18n } = useTranslation();
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
              t("goals_load_error"),
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
  }, [t]);

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
        displayName: localizedGoalText(goal.name, seededGoalTextKeys, t),
        displayDescription: localizedGoalText(
          goal.description,
          seededGoalDescriptionKeys,
          t,
        ),
      })),
    [goals, t],
  );
  const searchableGoals = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    return query
      ? normalizedGoals.filter((goal) => `${goal.name || ""} ${goal.description || ""}`.toLowerCase().includes(query))
      : normalizedGoals;
  }, [normalizedGoals, topSearch]);
  const totalSaved = normalizedGoals.reduce(
    (sum, goal) => sum + goal.amountSaved,
    0,
  );
  const totalTarget = normalizedGoals.reduce(
    (sum, goal) => sum + goal.target,
    0,
  );
  const completed = searchableGoals.filter(
    (goal) => goal.state === "completed",
  );
  const activeGoals = searchableGoals.filter(
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
          title: t("goal_completed_title", { name: goal.displayName }),
          detail: t("goal_target_reached", { amount: money.format(goal.target) }),
          date: goal.updatedAt || goal.targetDate,
          icon: Trophy,
          tone: "green",
        });
      if (goal.amountSaved > 0)
        entries.push({
          title: t("goal_started_title", { name: goal.displayName }),
          detail: t("goal_saved_so_far", { amount: money.format(goal.amountSaved) }),
          date: goal.createdAt,
          icon: Medal,
          tone: "blue",
        });
      (goal.contributions || [])
        .filter((item) => asDate(item.date))
        .forEach((item) =>
          entries.push({
            title: t("savings_contribution"),
            detail: t("contribution_added", { amount: money.format(amount(item.amount)), name: goal.displayName }),
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
          <h2>{t("loading_achievements")}</h2>
          <p>{t("calculating_goal_progress")}</p>
        </div>
      </section>
    );

  return (
    <section className="achievements-page">
      <header className="achievements-heading">
        <div>
          <h1>
            {t("goals_achievements")} <Target size={20} />
          </h1>
          <p>{t("goals_description")}</p>
        </div>
        <WorkspaceCalendar
          value={selectedDate}
          onChange={setSelectedDate}
              ariaLabel={t("select_goals_date")}
        />
      </header>
      {error && <p className="achievements-error">{error}</p>}
      <div className="achievements-stats">
        <AchievementStat
          label={t("total_goals")}
          value={normalizedGoals.length}
          detail={t("goals_active_completed", { active: activeGoals.length, completed: completed.length })}
          icon={Target}
          tone="blue"
        />
        <AchievementStat
          label={t("total_saved")}
          value={money.format(totalSaved)}
          detail={t("across_all_goals")}
          icon={PiggyBank}
          tone="green"
        />
        <AchievementStat
          label={t("goal_completion")}
          value={`${completion}%`}
          detail={
            totalTarget
              ? t("saved_of_target", { saved: money.format(totalSaved), target: money.format(totalTarget) })
              : t("no_target_amounts")
          }
          icon={CircleDollarSign}
          tone="purple"
        />
        <AchievementStat
          label={t("achievements")}
          value={milestoneCount}
          detail={t("recent_records", { count: achievements.length })}
          icon={Trophy}
          tone="orange"
        />
      </div>
      <div className="achievements-top-grid">
        <section className="achievements-panel my-goals-panel">
          <div className="achievements-panel-title">
            <div>
              <h2>{t("my_goals")}</h2>
              <div className="achievement-tabs">
                <button className="active" type="button">
                  {t("active_goals_count", { count: activeGoals.length })}
                </button>
                <button type="button">
                  {t("completed_goals_count", { count: completed.length })}
                </button>
              </div>
            </div>
            <button
              className="achievement-add-button"
              type="button"
              onClick={() => window.location.assign("/savings-goals?new=1")}
            >
              <Plus size={13} /> {t("add_new_goal")}
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
                {topSearch.trim()
                  ? t("no_goals_match", { query: topSearch.trim() })
                  : t("no_active_goals_recorded")}
              </div>
            )}
          </div>
          {searchableGoals.length > 4 && (
            <button className="achievements-link" type="button">
              {t("view_all_goals")} <ChevronRight size={14} />
            </button>
          )}
        </section>
        <section className="achievements-panel progress-overview-panel">
          <div className="achievements-panel-title">
            <h2>{t("goal_progress_overview")}</h2>
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
                <small>{t("overall_progress")}</small>
              </div>
            </div>
            <div className="goal-legend">
              {searchableGoals.slice(0, 4).map((goal) => (
                <div key={goal._id}>
                  <i style={{ background: goal.color }} />
                  <span>{goal.displayName}</span>
                  <strong>{goal.percent}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="achievement-callout">
            <CheckCircle2 />
            <div>
              <b>
                {completion ? t("making_progress") : t("goals_ready")}
              </b>
              <p>
                {completion
                  ? t("combined_target_funded", { percent: completion })
                  : t("add_contributions_prompt")}
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="achievements-middle-grid">
        <section className="achievements-panel savings-progress-panel">
          <div className="achievements-panel-title">
            <div>
              <h2>{t("savings_progress")}</h2>
              <p>
                {monthContributions.length
                  ? t("saved_this_month", { amount: money.format(savedThisMonth) })
                  : t("no_contributions_month")}
              </p>
            </div>
            <span>{t("this_month")}</span>
          </div>
          <strong className="progress-total">
            {money.format(savedThisMonth)}
          </strong>
          <p className="progress-change">
            {monthContributions.length
              ? t("contributions_recorded", { count: monthContributions.length })
              : t("add_contribution_progress")}
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
                  {sixMonths[index].toLocaleDateString(i18n.language, {
                    month: "short",
                  })}
                </b>
              </div>
            ))}
          </div>
        </section>
        <section className="achievements-panel funding-panel">
          <div className="achievements-panel-title">
            <h2>{t("goal_funding_breakdown")}</h2>
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
                <small>{t("total_saved")}</small>
              </div>
            </div>
            <div className="funding-list">
              {searchableGoals.slice(0, 5).map((goal) => (
                <div key={goal._id}>
                  <i style={{ background: goal.color }} />
                  <span>{goal.displayName}</span>
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
            <h2>{t("recent_achievements")}</h2>
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
                <small>{formatDate(item.date, i18n.language, t)}</small>
              </div>
              <CheckCircle2 />
            </div>
          ))}
          {!achievements.length && (
            <div className="achievements-no-data">
              {t("no_achievements_recorded")}
            </div>
          )}
        </section>
      </div>
      <div className="achievements-bottom-grid">
        <section className="achievements-panel milestones-panel">
          <div className="achievements-panel-title">
            <h2>{t("upcoming_milestones")}</h2>
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
                    <b>{goal.displayName}</b>
                    <small>{t("milestone_percent", { percent: goal.percent })}</small>
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
                {t("add_target_dates_prompt")}
              </div>
            )}
          </div>
        </section>
        <section className="achievement-banner">
          <div>
            <Flag />
            <h2>{t("celebrate_progress")}</h2>
            <p>{t("small_steps_message")}</p>
            <div className="banner-metrics">
              <span>
                <b>{money.format(totalTarget)}</b>
                <small>{t("total_goal_targets")}</small>
              </span>
              <span>
                <b>{money.format(totalSaved)}</b>
                <small>{t("total_saved")}</small>
              </span>
              <span>
                <b>{milestoneCount}</b>
                <small>{t("achievements_earned")}</small>
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
  const { t, i18n } = useTranslation();
  return (
    <div className="goal-achievement-row">
      <span
        className="goal-achievement-icon"
        style={{ color: goal.color, background: `${goal.color}18` }}
      >
        <goal.Icon />
      </span>
      <div className="goal-achievement-name">
        <b>{goal.displayName}</b>
        <small>{goal.displayDescription || t("savings_goal")}</small>
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
      <small>{t("target_date", { date: formatDate(goal.targetDate, i18n.language, t) })}</small>
      <MoreVertical size={16} />
    </div>
  );
}
