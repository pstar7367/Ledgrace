import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Plus,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import {
  createCalendarEventRequest,
  deleteCalendarEventRequest,
  getBillsRequest,
  getCalendarEventsRequest,
  getSavingsGoalsRequest,
  getTransactionsRequest,
} from "./authApi.js";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const eventColors = {
  bill: "#8b5cf6",
  subscription: "#5ab7dc",
  income: "#00a978",
  expense: "#ef6d53",
  goal: "#e36d98",
  other: "#8796ae",
};

const blankEvent = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  category: "Other",
  notes: "",
};

function dateAtStart(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(value) {
  return value.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function addMonths(date, quantity) {
  return new Date(date.getFullYear(), date.getMonth() + quantity, 1);
}

function recurringDatesForMonth(bill, monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const maximumDay = new Date(year, month + 1, 0).getDate();
  const dueDay = Math.min(Number(bill.dueDate || 1), maximumDay);

  if (bill.frequency === "monthly" || bill.frequency === "quarterly" || bill.frequency === "yearly") {
    return [new Date(year, month, dueDay)];
  }

  const nextDue = dateAtStart(bill.nextDueDate);
  if (nextDue.getFullYear() === year && nextDue.getMonth() === month) return [nextDue];
  return [];
}

function calendarEventFromTransaction(transaction) {
  const transactionDate = transaction.createdAt || transaction.date;
  const parsed = new Date(transactionDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    id: `transaction-${transaction._id}`,
    source: "transaction",
    title: transaction.title,
    date: parsed,
    amount: Number(transaction.amount || 0),
    kind: transaction.type === "income" ? "income" : "expense",
    subtitle: transaction.category || "Transaction",
  };
}

export default function FinancialCalendar({ topSearch = "" }) {
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [viewMode, setViewMode] = useState("month");
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(blankEvent);
  const monthInputRef = useRef(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [billsResponse, goalsResponse, transactionsResponse, eventsResponse] = await Promise.all([
        getBillsRequest(),
        getSavingsGoalsRequest(),
        getTransactionsRequest(),
        getCalendarEventsRequest(),
      ]);
      setBills(billsResponse.data.bills || []);
      setGoals(goalsResponse.data.goals || []);
      setTransactions(transactionsResponse.data.transactions || []);
      setCustomEvents(eventsResponse.data.events || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your financial calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadCalendar, 0);
    return () => window.clearTimeout(timer);
  }, [loadCalendar]);

  useEffect(() => {
    const openEventForm = () => setFormOpen(true);
    window.addEventListener("ledgrace:open-calendar-event", openEventForm);
    return () => window.removeEventListener("ledgrace:open-calendar-event", openEventForm);
  }, []);

  const financialEvents = useMemo(() => {
    const billEvents = bills.flatMap((bill) => recurringDatesForMonth(bill, viewDate).map((date) => ({
      id: `bill-${bill._id}-${date.toISOString()}`,
      source: "bill",
      title: bill.name,
      date,
      amount: Number(bill.amount || 0),
      kind: bill.type === "subscription" ? "subscription" : "bill",
      subtitle: bill.category || "Bill",
      status: bill.status,
    })));

    const goalEvents = goals
      .filter((goal) => goal.targetDate)
      .map((goal) => ({
        id: `goal-${goal._id}`,
        source: "goal",
        title: goal.name,
        date: dateAtStart(goal.targetDate),
        amount: Number(goal.targetAmount || 0),
        kind: "goal",
        subtitle: "Savings goal target",
      }));

    const transactionEvents = transactions
      .map(calendarEventFromTransaction)
      .filter(Boolean);

    const manualEvents = customEvents.map((event) => ({
      id: `event-${event._id}`,
      source: "custom",
      originalId: event._id,
      title: event.title,
      date: dateAtStart(event.date),
      amount: Number(event.amount || 0),
      kind: "other",
      subtitle: event.category || "Other",
      notes: event.notes || "",
    }));

    return [...billEvents, ...goalEvents, ...transactionEvents, ...manualEvents]
      .filter((event) => !Number.isNaN(event.date.getTime()))
      .sort((first, second) => first.date - second.date);
  }, [bills, customEvents, goals, transactions, viewDate]);

  const filteredEvents = useMemo(() => {
    const query = topSearch.trim().toLowerCase();
    if (!query) return financialEvents;
    return financialEvents.filter((event) => (
      event.title.toLowerCase().includes(query) || event.subtitle.toLowerCase().includes(query)
    ));
  }, [financialEvents, topSearch]);

  const monthEvents = useMemo(() => filteredEvents.filter((event) => (
    event.date.getFullYear() === viewDate.getFullYear()
      && event.date.getMonth() === viewDate.getMonth()
  )), [filteredEvents, viewDate]);

  const summary = useMemo(() => {
    const today = dateAtStart(new Date());
    const nextThirtyDays = new Date(today);
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
    const upcoming = financialEvents.filter((event) => (
      event.source === "bill" && event.status !== "paid" && event.date >= today && event.date <= nextThirtyDays
    ));
    const paid = bills.filter((bill) => {
      if (!bill.lastPaidDate) return false;
      const paidDate = dateAtStart(bill.lastPaidDate);
      return paidDate.getFullYear() === viewDate.getFullYear() && paidDate.getMonth() === viewDate.getMonth();
    });
    const overdue = financialEvents.filter((event) => event.source === "bill" && event.status !== "paid" && event.date < today);

    return {
      upcoming,
      upcomingTotal: upcoming.reduce((total, event) => total + event.amount, 0),
      paidCount: paid.length,
      paidTotal: paid.reduce((total, bill) => total + Number(bill.amount || 0), 0),
      overdue,
    };
  }, [bills, financialEvents, viewDate]);

  const calendarDays = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const firstVisible = new Date(start);
    firstVisible.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(firstVisible);
      day.setDate(firstVisible.getDate() + index);
      return day;
    });
  }, [viewDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    monthEvents.forEach((event) => {
      const key = event.date.toDateString();
      map.set(key, [...(map.get(key) || []), event]);
    });
    return map;
  }, [monthEvents]);

  const upcomingList = useMemo(() => summary.upcoming.slice(0, 7), [summary.upcoming]);

  const openCreate = () => {
    setForm({ ...blankEvent, date: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  };

  const saveEvent = async (event) => {
    event.preventDefault();
    try {
      const { data } = await createCalendarEventRequest({
        ...form,
        amount: Number(form.amount || 0),
      });
      setCustomEvents((items) => [...items, data.event]);
      setFormOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your calendar event.");
    }
  };

  const removeEvent = async (id) => {
    if (!window.confirm("Delete this calendar event?")) return;
    try {
      await deleteCalendarEventRequest(id);
      setCustomEvents((items) => items.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this calendar event.");
    }
  };

  const renderEvent = (event, compact = false) => (
    <article className={`financial-event ${event.kind}`} key={event.id}>
      <span className="financial-event-dot" style={{ background: eventColors[event.kind] }} />
      <div>
        <b>{event.title}</b>
        {!compact && <small>{event.subtitle}</small>}
      </div>
      {event.amount > 0 && <strong className={event.kind === "income" ? "income" : ""}>{event.kind === "income" ? "+" : ""}{money.format(event.amount)}</strong>}
      {event.source === "custom" && (
        <button type="button" onClick={() => removeEvent(event.originalId)} aria-label={`Delete ${event.title}`}><Trash2 size={13} /></button>
      )}
    </article>
  );

  return (
    <section className="financial-calendar-page">
      <div className="calendar-heading">
        <div>
          <h1>Financial Calendar</h1>
          <p>Stay on top of bills, payments and financial goals.</p>
        </div>
        <div className="calendar-heading-actions">
          <button className="calendar-today" onClick={() => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
          <span className="calendar-nav-buttons">
            <button onClick={() => setViewDate((date) => addMonths(date, -1))} aria-label="Previous month"><ChevronLeft /></button>
            <button onClick={() => setViewDate((date) => addMonths(date, 1))} aria-label="Next month"><ChevronRight /></button>
          </span>
          <label className="budget-date-chip calendar-date-chip" onClick={() => monthInputRef.current?.click()}>
            <CalendarDays size={14} />
            <span>{formatMonth(viewDate)}</span>
            <input ref={monthInputRef} type="month" value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`} onChange={(event) => {
              const [year, month] = event.target.value.split("-").map(Number);
              setViewDate(new Date(year, month - 1, 1));
            }} aria-label="Select calendar month" />
          </label>
        </div>
      </div>

      {error && <p className="calendar-error">{error}</p>}

      <div className="calendar-stats">
        <CalendarStat label="Upcoming Events" value={summary.upcoming.length} note="Next 30 days" icon={CalendarDays} tone="blue" />
        <CalendarStat label="Total Due" value={money.format(summary.upcomingTotal)} note="Next 30 days" icon={WalletCards} tone="green" />
        <CalendarStat label="Paid This Month" value={money.format(summary.paidTotal)} note={`${summary.paidCount} payment${summary.paidCount === 1 ? "" : "s"} completed`} icon={CheckCircle2} tone="orange" />
        <CalendarStat label="Overdue" value={summary.overdue.length} note={summary.overdue.length ? money.format(summary.overdue.reduce((total, event) => total + event.amount, 0)) : "Nothing overdue"} icon={CircleAlert} tone="purple" />
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-view-tabs">
            {["month", "week", "list"].map((mode) => <button key={mode} className={viewMode === mode ? "active" : ""} onClick={() => setViewMode(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
          </div>

          {loading ? <div className="calendar-empty"><CalendarDays /><h2>Loading your calendar…</h2></div> : viewMode === "list" ? (
            <div className="calendar-list-view">
              {monthEvents.length ? monthEvents.map((event) => <div className="calendar-list-item" key={event.id}><time>{formatDay(event.date)}</time>{renderEvent(event)}</div>) : <CalendarEmpty />}
            </div>
          ) : (
            <div className={viewMode === "week" ? "calendar-grid week-grid" : "calendar-grid"}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
              {(viewMode === "week" ? calendarDays.slice(0, 7) : calendarDays).map((day) => {
                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                const events = eventsByDay.get(day.toDateString()) || [];
                return <div className={`calendar-day ${isCurrentMonth ? "" : "outside"} ${isSameDay(day, new Date()) ? "today" : ""}`} key={day.toISOString()}>
                  <time>{day.getDate()}</time>
                  <div className="calendar-day-events">{events.slice(0, 3).map((event) => renderEvent(event, true))}</div>
                </div>;
              })}
            </div>
          )}

          <div className="calendar-reminder-card">
            <span><CalendarDays /></span>
            <div><b>Never miss a due date!</b><p>Your saved bills and payments automatically appear here.</p></div>
            <button className="button outline" onClick={() => setFormOpen(true)}>Manage Reminders</button>
          </div>
        </div>

        <aside className="calendar-side">
          <section className="calendar-side-card">
            <div className="calendar-side-heading"><h2>Upcoming (Next 7 Days)</h2><span>{upcomingList.length}</span></div>
            {upcomingList.length ? <div className="calendar-side-list">{upcomingList.map((event) => <div key={event.id} className="calendar-side-item"><span style={{ background: `${eventColors[event.kind]}20`, color: eventColors[event.kind] }}>{event.title.slice(0, 2).toUpperCase()}</span><div><b>{event.title}</b><small>{formatDay(event.date)}</small></div><strong>{money.format(event.amount)}</strong></div>)}</div> : <p className="calendar-side-empty">No payments are due in the next 7 days.</p>}
            <div className="calendar-side-total"><span>Total Upcoming</span><strong>{money.format(summary.upcomingTotal)}</strong></div>
          </section>

          <section className="calendar-side-card">
            <div className="calendar-side-heading"><h2>Overdue</h2><span>{summary.overdue.length}</span></div>
            {summary.overdue.length ? summary.overdue.slice(0, 4).map((event) => <div key={event.id} className="calendar-side-item overdue"><span>!</span><div><b>{event.title}</b><small>{formatDay(event.date)}</small></div><strong>{money.format(event.amount)}</strong></div>) : <p className="calendar-side-empty">You have no overdue bills.</p>}
          </section>

          <section className="calendar-side-card calendar-legend"><h2>Calendar Legend</h2>{Object.entries(eventColors).map(([kind, color]) => <span key={kind}><i style={{ background: color }} />{kind === "bill" ? "Bills & Utilities" : kind === "subscription" ? "Subscriptions" : kind === "goal" ? "Savings & Goals" : kind[0].toUpperCase() + kind.slice(1)}</span>)}</section>

          <section className="calendar-sync-card"><span><CalendarDays /></span><div><b>Sync Calendar</b><p>Your Ledgrace events stay up to date in this workspace.</p></div><button className="button outline" onClick={openCreate}><Plus size={15} /> Add Event</button></section>
        </aside>
      </div>

      {formOpen && <CalendarEventForm form={form} setForm={setForm} onClose={() => setFormOpen(false)} onSubmit={saveEvent} />}
    </section>
  );
}

function CalendarStat({ label, value, note, icon: Icon, tone }) {
  return <article className="calendar-stat"><span className={tone}><Icon /></span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>;
}

function CalendarEmpty() {
  return <div className="calendar-empty"><CalendarDays /><h2>No financial activity for this month</h2><p>Add an event or create bills, goals, and transactions to see them here.</p></div>;
}

function CalendarEventForm({ form, setForm, onClose, onSubmit }) {
  return <div className="dash-modal" role="dialog" aria-modal="true" aria-label="Add calendar event"><form onSubmit={onSubmit}><button type="button" className="dash-modal-close" onClick={onClose} aria-label="Close"><X /></button><h2>Add Event</h2><p>Add a personal financial reminder to your calendar.</p><label>Event name<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Insurance renewal" /></label><div className="dash-form-row"><label>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label>Amount (₦)<input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Optional" /></label></div><label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Insurance" /></label><label>Notes<textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional details" /></label><div className="account-modal-actions"><button type="button" className="button outline" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save Event</button></div></form></div>;
}
