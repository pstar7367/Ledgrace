import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import {
  addGoalContributionRequest,
  createSavingsGoalRequest,
  deleteSavingsGoalRequest,
  getSavingsGoalsRequest,
  updateSavingsGoalRequest,
} from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const colors = ["#1458ed", "#00a978", "#8b5cf6", "#f59e0b", "#ef476f"];
const blankGoal = {
  name: "",
  description: "",
  targetAmount: "",
  savedAmount: "",
  targetDate: "",
  color: colors[0],
};

function progressOf(goal) {
  if (!goal.targetAmount) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
}

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / 86_400_000);
}

function formatDate(dateValue) {
  if (!dateValue) return "No target date";
  return new Date(dateValue).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthKey(dateValue) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default function SavingsGoalsManager({ topSearch = "" }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(blankGoal);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getSavingsGoalsRequest();
      setGoals(data.goals || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your savings goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadGoals, 0);
    return () => window.clearTimeout(timer);
  }, [loadGoals]);

  useEffect(() => {
    const openGoalForm = () => openCreate();
    window.addEventListener("ledgrace:open-goal-form", openGoalForm);
    return () => window.removeEventListener("ledgrace:open-goal-form", openGoalForm);
  });

  const searchedGoals = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    if (!query) return goals;
    return goals.filter((goal) => (
      goal.name.toLowerCase().includes(query) || goal.description.toLowerCase().includes(query)
    ));
  }, [goals, topSearch]);

  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const inProgressGoals = goals.filter((goal) => goal.status === "in-progress");
  const pausedGoals = goals.filter((goal) => goal.status === "paused");
  const overallProgress = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const contributionHistory = useMemo(() => {
    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
    const months = Array.from({ length: 6 }, (_, index) => new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() - (5 - index), 1));

    return months.map((date) => {
      const key = monthKey(date);
      const saved = goals.reduce((sum, goal) => (
        sum + (goal.contributions || [])
          .filter((contribution) => monthKey(contribution.date) === key)
          .reduce((total, contribution) => total + Number(contribution.amount || 0), 0)
      ), 0);
      return {
        label: date.toLocaleDateString("en-NG", { month: "short" }),
        value: saved,
      };
    });
  }, [goals, selectedDate]);

  const maxHistory = Math.max(...contributionHistory.map((entry) => entry.value), 1);
  const chartPoints = contributionHistory.map((entry, index) => {
    const x = 6 + index * (88 / (contributionHistory.length - 1));
    const y = 90 - (entry.value / maxHistory) * 76;
    return `${x},${y}`;
  }).join(" ");

  const statusItems = [
    { label: "Completed", amount: completedGoals.length, color: "#00a978" },
    { label: "In Progress", amount: inProgressGoals.length, color: "#1458ed" },
    { label: "Paused", amount: pausedGoals.length, color: "#f59e0b" },
    { label: "Not Started", amount: goals.filter((goal) => goal.status === "not-started").length, color: "#71809b" },
  ];
  const statusDonut = goals.length
    ? `conic-gradient(${statusItems.map((item, index) => {
      const start = statusItems.slice(0, index).reduce((sum, entry) => sum + entry.amount, 0) / goals.length * 100;
      const end = start + item.amount / goals.length * 100;
      return `${item.color} ${start}% ${end}%`;
    }).join(", ")})`
    : "#edf2f7";

  const upcomingGoals = useMemo(() => goals
    .filter((goal) => goal.status !== "completed" && goal.targetDate)
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
    .slice(0, 4), [goals]);

  const openCreate = () => {
    setEditingGoal(null);
    setForm(blankGoal);
    setFormOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      description: goal.description || "",
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "",
      color: goal.color,
    });
    setMenuId(null);
    setFormOpen(true);
  };

  const saveGoal = async (event) => {
    event.preventDefault();
    try {
      if (editingGoal) {
        const { data } = await updateSavingsGoalRequest(editingGoal._id, {
          name: form.name,
          description: form.description,
          targetAmount: Number(form.targetAmount),
          targetDate: form.targetDate || null,
          color: form.color,
        });
        setGoals((items) => items.map((item) => item._id === editingGoal._id ? data.goal : item));
      } else {
        const { data } = await createSavingsGoalRequest({
          ...form,
          targetAmount: Number(form.targetAmount),
          savedAmount: Number(form.savedAmount || 0),
          targetDate: form.targetDate || null,
        });
        setGoals((items) => [data.goal, ...items]);
      }
      setFormOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this goal.");
    }
  };

  const addContribution = async (event) => {
    event.preventDefault();
    if (!contributionGoal) return;
    try {
      const { data } = await addGoalContributionRequest(contributionGoal._id, {
        amount: Number(contributionAmount),
      });
      setGoals((items) => items.map((item) => item._id === contributionGoal._id ? data.goal : item));
      setContributionGoal(null);
      setContributionAmount("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add this contribution.");
    }
  };

  const togglePaused = async (goal) => {
    try {
      const { data } = await updateSavingsGoalRequest(goal._id, { paused: !goal.paused });
      setGoals((items) => items.map((item) => item._id === goal._id ? data.goal : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update this goal.");
    }
    setMenuId(null);
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this savings goal permanently?")) return;
    try {
      await deleteSavingsGoalRequest(id);
      setGoals((items) => items.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this goal.");
    }
    setMenuId(null);
  };

  return (
    <section className="goals-manager">
      <div className="goals-heading">
        <div>
          <h1>Savings Goals</h1>
          <p>Track your savings goals and achieve your dreams.</p>
        </div>
        <WorkspaceCalendar value={selectedDate} onChange={setSelectedDate} ariaLabel="Select savings goals date" />
      </div>

      {error && <p className="goals-error">{error}</p>}

      <div className="goals-stats">
        <GoalStat label="Total Goals" value={goals.length} icon={Target} note={`${completedGoals.length} completed`} />
        <GoalStat label="Total Saved" value={money.format(totalSaved)} icon={WalletCards} />
        <GoalStat label="Total Target" value={money.format(totalTarget)} icon={PiggyBank} />
        <GoalStat label="Overall Progress" value={`${overallProgress}%`} icon={CircleDollarSign} note={`${money.format(Math.max(totalTarget - totalSaved, 0))} remaining`} />
      </div>

      {loading ? <div className="goals-empty"><Target /><h2>Loading your goals…</h2></div> : !goals.length ? (
        <div className="goals-empty">
          <Target />
          <h2>Create your first savings goal</h2>
          <p>Set a target, track your saved amount, and add contributions whenever you make progress.</p>
          <button className="button primary" onClick={openCreate}><Plus size={17} /> New Goal</button>
        </div>
      ) : (
        <>
          <div className="goals-overview-grid">
            <section className="goals-panel goals-chart-panel">
              <div className="goals-panel-title"><h2>Savings Overview</h2><span>Last 6 months</span></div>
              <strong>{money.format(totalSaved)}</strong>
              <p>Total saved across all goals</p>
              <div className="goals-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={chartPoints} fill="none" stroke="#1458ed" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />{contributionHistory.map((entry, index) => { const x = 6 + index * (88 / (contributionHistory.length - 1)); const y = 90 - (entry.value / maxHistory) * 76; return <circle key={entry.label} cx={x} cy={y} r="2.2" fill="#fff" stroke="#1458ed" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />; })}</svg><div>{contributionHistory.map((entry) => <span key={entry.label}>{entry.label}</span>)}</div></div>
            </section>

            <section className="goals-panel goals-status-panel">
              <div className="goals-panel-title"><h2>Goals by Status</h2></div>
              <div className="goals-status-content"><div className="goals-donut" style={{ background: statusDonut }}><div><b>{goals.length}</b><small>Total Goals</small></div></div><div className="goals-status-list">{statusItems.map((item) => <div key={item.label}><i style={{ background: item.color }} /><span>{item.label}</span><b>{item.amount}</b></div>)}</div></div>
            </section>

            <aside className="goals-tips-panel"><div className="goals-panel-title"><h2>Savings Snapshot</h2></div><div className="goal-snapshot"><span><PiggyBank /></span><div><b>{money.format(Math.max(totalTarget - totalSaved, 0))}</b><small>still needed to reach all targets</small></div></div><div className="goal-snapshot"><span><CalendarDays /></span><div><b>{upcomingGoals.length}</b><small>upcoming target{upcomingGoals.length === 1 ? "" : "s"} with a date</small></div></div></aside>
          </div>

          <div className="goals-lower-grid">
            <section className="goals-panel goals-list-panel">
              <div className="goals-panel-title"><h2>Your Savings Goals</h2><button className="text-link" onClick={openCreate}><Plus size={14} /> New Goal</button></div>
              <div className="goals-table"><div className="goal-table-head"><span>Goal</span><span>Target Amount</span><span>Saved</span><span>Progress</span><span>Target Date</span><span>Status</span><span>Action</span></div>{searchedGoals.map((goal) => <GoalRow key={goal._id} goal={goal} menuOpen={menuId === goal._id} onMenu={() => setMenuId(menuId === goal._id ? null : goal._id)} onContribute={() => { setContributionGoal(goal); setContributionAmount(""); setMenuId(null); }} onEdit={() => openEdit(goal)} onPause={() => togglePaused(goal)} onDelete={() => deleteGoal(goal._id)} />)}{!searchedGoals.length && <p className="goals-no-results">No goals match your search.</p>}</div>
            </section>

            <aside className="goals-panel goals-upcoming-panel"><div className="goals-panel-title"><h2>Upcoming Targets</h2></div>{upcomingGoals.length ? upcomingGoals.map((goal) => <div className="upcoming-goal" key={goal._id}><span style={{ background: `${goal.color}18`, color: goal.color }}><CalendarDays /></span><div><b>{goal.name}</b><small>Target date: {formatDate(goal.targetDate)}</small></div><em>{daysUntil(goal.targetDate) < 0 ? "Overdue" : `${daysUntil(goal.targetDate)} days left`}</em></div>) : <p className="goals-no-results">No upcoming target dates yet.</p>}</aside>
          </div>
        </>
      )}

      {formOpen && <GoalForm form={form} setForm={setForm} editing={Boolean(editingGoal)} onClose={() => setFormOpen(false)} onSubmit={saveGoal} />}
      {contributionGoal && <ContributionForm goal={contributionGoal} amount={contributionAmount} setAmount={setContributionAmount} onClose={() => setContributionGoal(null)} onSubmit={addContribution} />}
    </section>
  );
}

function GoalStat({ label, value, note, icon: Icon }) {
  return <article className="goals-stat"><span><Icon /></span><small>{label}</small><strong>{value}</strong>{note && <em>{note}</em>}</article>;
}

function GoalRow({ goal, menuOpen, onMenu, onContribute, onEdit, onPause, onDelete }) {
  const progress = progressOf(goal);
  return <article className="goal-row"><span className="goal-icon" style={{ background: `${goal.color}18`, color: goal.color }}><Target /></span><div className="goal-name"><b>{goal.name}</b><small>{goal.description || "Savings goal"}</small></div><strong>{money.format(goal.targetAmount)}</strong><strong className="saved">{money.format(goal.savedAmount)}</strong><div className="goal-progress"><span><i style={{ width: `${progress}%`, background: goal.color }} /></span><b>{progress}%</b></div><small className="goal-date">{formatDate(goal.targetDate)}</small><em className={`goal-status ${goal.status}`}>{goal.status === "in-progress" ? "In Progress" : goal.status}</em><div className="goal-actions"><button className="goal-menu-trigger" onClick={onMenu} aria-label={`Actions for ${goal.name}`}><MoreVertical size={18} /></button>{menuOpen && <div className="goal-menu"><button onClick={onContribute}>Add contribution</button><button onClick={onEdit}><Pencil size={14} /> Edit</button><button onClick={onPause}>{goal.paused ? "Resume" : "Pause"}</button><button className="danger" onClick={onDelete}><Trash2 size={14} /> Delete</button></div>}</div></article>;
}

function GoalForm({ form, setForm, editing, onClose, onSubmit }) {
  return <div className="dash-modal" role="dialog" aria-modal="true"><form onSubmit={onSubmit}><button type="button" className="dash-modal-close" onClick={onClose}><X /></button><h2>{editing ? "Edit savings goal" : "Create savings goal"}</h2><p>Set your target once, then add contributions as you save.</p><label>Goal Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. New apartment" /></label><label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What are you saving for?" /></label><div className="dash-form-row"><label>Target Amount (₦)<input required min="1" type="number" value={form.targetAmount} onChange={(event) => setForm({ ...form, targetAmount: event.target.value })} placeholder="0.00" /></label>{!editing && <label>Saved So Far (₦)<input min="0" type="number" value={form.savedAmount} onChange={(event) => setForm({ ...form, savedAmount: event.target.value })} placeholder="0.00" /></label>}</div><label>Target Date <input type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} /></label><label>Goal Color<span className="account-colors">{colors.map((color) => <button key={color} type="button" aria-label={`Use ${color}`} className={form.color === color ? "selected" : ""} style={{ background: color }} onClick={() => setForm({ ...form, color })} />)}</span></label><div className="account-modal-actions"><button type="button" className="button outline" onClick={onClose}>Cancel</button><button className="button primary" type="submit">{editing ? "Save Changes" : "Create Goal"}</button></div></form></div>;
}

function ContributionForm({ goal, amount, setAmount, onClose, onSubmit }) {
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  return <div className="dash-modal" role="dialog" aria-modal="true"><form onSubmit={onSubmit}><button type="button" className="dash-modal-close" onClick={onClose}><X /></button><h2>Add contribution</h2><p>Add money to <b>{goal.name}</b>. {money.format(remaining)} remains.</p><label>Amount (₦)<input required min="0.01" max={remaining} step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label><div className="account-modal-actions"><button type="button" className="button outline" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Add Contribution</button></div></form></div>;
}
