import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import {
  getBillsRequest,
  createBillRequest,
  updateBillRequest,
  markBillAsPaidRequest,
  deleteBillRequest,
} from "./authApi.js";
import WorkspaceCalendar from "./WorkspaceCalendar.jsx";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const blankBill = {
  name: "",
  description: "",
  amount: "",
  frequency: "monthly",
  dueDate: "1",
  type: "bill",
  category: "Other",
  paymentMethod: "",
  notes: "",
};

const categories = [
  "Utilities",
  "Internet",
  "Phone",
  "Insurance",
  "Subscriptions",
  "Entertainment",
  "Transport",
  "Healthcare",
  "Other",
];

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

function daysUntilDue(nextDueDate) {
  if (!nextDueDate) return null;
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86_400_000);
}

function formatDate(dateValue) {
  if (!dateValue) return "No date";
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "overdue") return "Overdue";
  if (status === "paused") return "Paused";
  return "Upcoming";
}

function getMonthBounds(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);

  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

function formatMonthLabel(monthValue) {
  return new Date(`${monthValue}-01T00:00:00`).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

export default function BillsAndSubscriptions({ topSearch = "" }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [form, setForm] = useState(blankBill);
  const [menuId, setMenuId] = useState(null);
  const managerRef = useRef(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [receiptBill, setReceiptBill] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const selectedMonth = selectedDate.slice(0, 7);

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getBillsRequest();
      setBills(data.bills || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your bills and subscriptions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadBills, 0);
    return () => window.clearTimeout(timer);
  }, [loadBills]);

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (!managerRef.current?.contains(event.target)) {
        setMenuId(null);
        return;
      }

      if (!event.target.closest(".bill-action-wrap")) {
        setMenuId(null);
      }
    };

    document.addEventListener("mousedown", closeMenuOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeMenuOnOutsideClick);
  }, []);

  const filteredBills = useMemo(() => {
    let result = bills;

    if (filterType !== "all") {
      result = result.filter((bill) => bill.type === filterType);
    }

    if (filterStatus !== "all") {
      result = result.filter((bill) => bill.status === filterStatus);
    }

    const query = topSearch.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (bill) =>
          bill.name.toLowerCase().includes(query) ||
          bill.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [bills, filterType, filterStatus, topSearch]);

  const stats = useMemo(() => {
    const { start: monthStart, end: monthEnd } = getMonthBounds(selectedMonth);

    const upcomingBills = bills.filter((bill) => {
      const dueDate = new Date(bill.nextDueDate);
      return dueDate >= monthStart && dueDate <= monthEnd && bill.status !== "paid";
    });

    const totalDue = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
    const subscriptions = bills.filter((bill) => bill.type === "subscription").length;
    const paidBills = bills.filter((bill) => {
      if (!bill.lastPaidDate) return false;
      const paidDate = new Date(bill.lastPaidDate);
      return paidDate >= monthStart && paidDate <= monthEnd;
    });

    return {
      upcomingCount: upcomingBills.length,
      totalDue,
      subscriptions,
      paidBills: paidBills.length,
      paidTotal: paidBills.reduce((sum, bill) => sum + bill.amount, 0),
    };
  }, [bills, selectedMonth]);

  const paidThisMonth = useMemo(() => {
    const { start, end } = getMonthBounds(selectedMonth);

    return bills
      .filter((bill) => {
        if (!bill.lastPaidDate) return false;
        const paidDate = new Date(bill.lastPaidDate);
        return paidDate >= start && paidDate <= end;
      })
      .sort((first, second) => new Date(second.lastPaidDate) - new Date(first.lastPaidDate));
  }, [bills, selectedMonth]);

  const upcomingPayments = useMemo(() => {
    const { start, end } = getMonthBounds(selectedMonth);

    return bills
      .filter((bill) => {
        const dueDate = new Date(bill.nextDueDate);
        return bill.status !== "paid" && dueDate >= start && dueDate <= end;
      })
      .sort((first, second) => new Date(first.nextDueDate) - new Date(second.nextDueDate));
  }, [bills, selectedMonth]);

  const openCreate = () => {
    setEditingBill(null);
    setForm(blankBill);
    setFormOpen(true);
  };

  useEffect(() => {
    const openBillForm = () => openCreate();
    window.addEventListener("ledgrace:open-bill-form", openBillForm);
    return () => window.removeEventListener("ledgrace:open-bill-form", openBillForm);
  }, []);

  const openEdit = (bill) => {
    setEditingBill(bill);
    setForm({
      name: bill.name,
      description: bill.description || "",
      amount: bill.amount,
      frequency: bill.frequency,
      dueDate: String(bill.dueDate),
      type: bill.type,
      category: bill.category,
      paymentMethod: bill.paymentMethod || "",
      notes: bill.notes || "",
    });
    setMenuId(null);
    setFormOpen(true);
  };

  const saveBill = async (event) => {
    event.preventDefault();
    try {
      if (editingBill) {
        const { data } = await updateBillRequest(editingBill._id, {
          name: form.name,
          description: form.description,
          amount: Number(form.amount),
          frequency: form.frequency,
          dueDate: Number(form.dueDate),
          type: form.type,
          category: form.category,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        });
        setBills((items) =>
          items.map((item) => (item._id === editingBill._id ? data.bill : item))
        );
      } else {
        const { data } = await createBillRequest({
          name: form.name,
          description: form.description,
          amount: Number(form.amount),
          frequency: form.frequency,
          dueDate: Number(form.dueDate),
          type: form.type,
          category: form.category,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        });
        setBills((items) => [data.bill, ...items]);
      }
      setFormOpen(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save this bill. Please try again."
      );
    }
  };

  const markAsPaid = async (bill) => {
    try {
      const { data } = await markBillAsPaidRequest(bill._id);
      setBills((items) =>
        items.map((item) => (item._id === bill._id ? data.bill : item))
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to mark this bill as paid."
      );
    }
    setMenuId(null);
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill permanently?")) return;
    try {
      await deleteBillRequest(id);
      setBills((items) => items.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this bill. Please try again."
      );
    }
    setMenuId(null);
  };

  return (
    <section className="bills-manager" ref={managerRef}>
      <div className="bills-shell">
        <div className="bills-main-panel">
          <div className="bills-heading">
            <div>
              <h1>Bills & Subscriptions</h1>
              <p>Track, manage and never miss a payment.</p>
            </div>
            <WorkspaceCalendar value={selectedDate} onChange={setSelectedDate} ariaLabel="Select bills date" />
          </div>

          {error && <p className="bills-error">{error}</p>}

          <div className="bills-summary-list">
            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-blue"><Calendar size={15} /></span>
                <span>Total Bills &amp; Subscriptions</span>
                <strong>{bills.length}</strong>
                <em>tracked</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-green"><DollarSign size={15} /></span>
                <span>This Month&apos;s Total</span>
                <strong>{money.format(stats.totalDue)}</strong>
                <em>{stats.upcomingCount} due</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-purple"><CheckCircle2 size={15} /></span>
                <span>Paid This Month</span>
                <strong>{money.format(stats.paidTotal)}</strong>
                <em>{stats.paidBills} paid</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-orange"><AlertCircle size={15} /></span>
                <span>Due This Month</span>
                <strong>{money.format(stats.totalDue)}</strong>
                <em>{stats.upcomingCount} pending</em>
              </div>
            </div>
          </div>

          <div className="bills-toolbar">
            <div className="bills-filters">
              <button
                className={filterType === "all" ? "active" : ""}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={filterType === "bill" ? "active" : ""}
                onClick={() => setFilterType("bill")}
              >
                Bills
              </button>
              <button
                className={filterType === "subscription" ? "active" : ""}
                onClick={() => setFilterType("subscription")}
              >
                Subscriptions
              </button>
            </div>

            <div className="bill-status-select">
              <span>All Status</span>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Upcoming</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bills-empty">
              <Calendar />
              <h2>Loading your bills…</h2>
            </div>
          ) : !bills.length ? (
            <div className="bills-empty empty-state-box">
              <h2>No bills tracked yet</h2>
            </div>
          ) : !filteredBills.length ? (
            <p className="bills-no-results">No bills match your search or filter.</p>
          ) : (
            <div className="bill-table-wrap">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Frequency</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => {
                    const daysLeft = daysUntilDue(bill.nextDueDate);
                    const isOverdue = Number(daysLeft) < 0;
                    const statusClass = bill.status === "paid" ? "paid" : isOverdue ? "overdue" : "upcoming";

                    return (
                      <tr key={bill._id}>
                        <td className="bill-name-cell">
                          <div className="bill-name-wrap">
                            <span className="bill-logo" style={{ background: bill.type === "subscription" ? "#e8f5ff" : "#f0f4ff" }}>
                              {bill.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <strong>{bill.name}</strong>
                              <small>{bill.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="bill-type-badge">
                            {bill.type === "subscription" ? "Subscription" : "Bill"}
                          </span>
                        </td>
                        <td className="bill-amount-cell">{money.format(bill.amount)}</td>
                        <td>{formatDate(bill.nextDueDate)}</td>
                        <td>{frequencies.find((f) => f.value === bill.frequency)?.label || bill.frequency}</td>
                        <td>
                          <span className={`table-status ${statusClass}`}>
                            {getStatusLabel(bill.status)}
                          </span>
                        </td>
                        <td className="bill-action-cell">
                          <div className="bill-action-wrap">
                            {bill.status !== "paid" ? (
                              <button className="table-pay-btn" onClick={() => markAsPaid(bill)}>
                                Pay Now
                              </button>
                            ) : (
                              <button className="table-pay-btn receipt" onClick={() => setReceiptBill(bill)}>
                                View Receipt
                              </button>
                            )}
                            <button
                              className="row-menu-button"
                              onClick={() => setMenuId(menuId === bill._id ? null : bill._id)}
                              aria-label={`Open menu for ${bill.name}`}
                            >
                              <MoreVertical size={15} />
                            </button>
                            {menuId === bill._id && (
                              <div className="bill-menu-dropdown">
                                <button onClick={() => openEdit(bill)} className="menu-item">
                                  <Pencil size={14} /> Edit
                                </button>
                                <button onClick={() => deleteBill(bill._id)} className="menu-item danger">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && bills.length > 0 && (
            <section className="paid-bills-panel" aria-labelledby="paid-this-month-title">
              <div className="paid-bills-heading">
                <div>
                  <h2 id="paid-this-month-title">Paid This Month</h2>
                  <p>Completed payments for {formatMonthLabel(selectedMonth)}.</p>
                </div>
                <strong>{money.format(stats.paidTotal)}</strong>
              </div>

              {paidThisMonth.length ? (
                <div className="paid-bill-table-wrap">
                  <table className="paid-bill-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Paid Date</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidThisMonth.map((bill) => (
                        <tr key={bill._id}>
                          <td>
                            <div className="bill-name-wrap">
                              <span className="bill-logo" style={{ background: bill.type === "subscription" ? "#e8f5ff" : "#f0f4ff" }}>
                                {bill.name.slice(0, 2).toUpperCase()}
                              </span>
                              <div>
                                <strong>{bill.name}</strong>
                                <small>{bill.category}</small>
                              </div>
                            </div>
                          </td>
                          <td><span className="bill-type-badge">{bill.type === "subscription" ? "Subscription" : "Bill"}</span></td>
                          <td className="bill-amount-cell">{money.format(bill.amount)}</td>
                          <td>{formatDate(bill.lastPaidDate)}</td>
                          <td><button className="table-pay-btn receipt" onClick={() => setReceiptBill(bill)}>View Receipt</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="paid-bills-empty">
                  No bills or subscriptions have been paid in {formatMonthLabel(selectedMonth)}.
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="upcoming-payments-panel" aria-labelledby="upcoming-payments-title">
          <div className="upcoming-payments-heading">
            <div>
              <h2 id="upcoming-payments-title">Upcoming Payments</h2>
              <p>Due in {formatMonthLabel(selectedMonth)}.</p>
            </div>
            <Calendar size={19} />
          </div>

          {upcomingPayments.length ? (
            <div className="upcoming-payments-list">
              {upcomingPayments.map((bill) => {
                const daysLeft = daysUntilDue(bill.nextDueDate);
                const dueText = daysLeft < 0
                  ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`
                  : daysLeft === 0
                    ? "Due today"
                    : `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

                return (
                  <article className="upcoming-payment" key={bill._id}>
                    <span className="upcoming-payment-icon">{bill.name.slice(0, 2).toUpperCase()}</span>
                    <div className="upcoming-payment-info">
                      <strong>{bill.name}</strong>
                      <small>{formatDate(bill.nextDueDate)} · {frequencies.find((item) => item.value === bill.frequency)?.label || bill.frequency}</small>
                    </div>
                    <div className="upcoming-payment-amount">
                      <strong>{money.format(bill.amount)}</strong>
                      <span className={daysLeft < 0 ? "overdue" : ""}>{dueText}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="upcoming-payments-empty">
              <Calendar size={24} />
              <p>No upcoming payments for this month.</p>
            </div>
          )}
        </aside>
      </div>

      {formOpen && (
        <BillForm
          bill={editingBill}
          form={form}
          setForm={setForm}
          onClose={() => setFormOpen(false)}
          onSubmit={saveBill}
        />
      )}
      {receiptBill && <BillReceipt bill={receiptBill} onClose={() => setReceiptBill(null)} />}
    </section>
  );
}

function BillReceipt({ bill, onClose }) {
  const receiptNumber = `LR-${bill._id.slice(-8).toUpperCase()}`;
  const paidDate = bill.lastPaidDate ? formatDate(bill.lastPaidDate) : "Payment date unavailable";

  return (
    <div className="dash-modal receipt-modal" role="dialog" aria-modal="true" aria-label="Payment receipt">
      <section className="receipt-card">
        <button type="button" className="dash-modal-close" onClick={onClose} aria-label="Close receipt"><X /></button>
        <div className="receipt-success"><CheckCircle2 /></div>
        <p className="receipt-kicker">PAYMENT RECEIPT</p>
        <h2>Payment successful</h2>
        <p className="receipt-copy">This bill has been marked as paid in your Ledgrace workspace.</p>
        <div className="receipt-amount">{money.format(bill.amount)}</div>
        <div className="receipt-details">
          <div><span>Receipt number</span><b>{receiptNumber}</b></div>
          <div><span>Bill</span><b>{bill.name}</b></div>
          <div><span>Category</span><b>{bill.category}</b></div>
          <div><span>Paid on</span><b>{paidDate}</b></div>
          <div><span>Payment method</span><b>{bill.paymentMethod || "Not specified"}</b></div>
          <div><span>Frequency</span><b>{frequencies.find((item) => item.value === bill.frequency)?.label || bill.frequency}</b></div>
        </div>
        <button className="button primary receipt-close" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}

function BillForm({ bill, form, setForm, onClose, onSubmit }) {
  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <form onSubmit={onSubmit}>
        <button
          type="button"
          className="dash-modal-close"
          onClick={onClose}
          aria-label="Close form"
        >
          <X />
        </button>
        <h2>{bill ? "Edit Bill" : "Add Bill or Subscription"}</h2>
        <p>
          {bill
            ? "Update your bill or subscription details."
            : "Add a new bill or subscription to track."}
        </p>

        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="e.g. Electricity Bill"
          />
        </label>

        <label>
          Description
          <input
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Optional details"
          />
        </label>

        <div className="dash-form-row">
          <label>
            Type
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="bill">Bill</option>
              <option value="subscription">Subscription</option>
            </select>
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="dash-form-row">
          <label>
            Amount (₦)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
              placeholder="0.00"
            />
          </label>

          <label>
            Frequency
            <select
              value={form.frequency}
              onChange={(event) =>
                setForm({ ...form, frequency: event.target.value })
              }
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="dash-form-row">
          <label>
            Due Date (Day of Month)
            <input
              required
              type="number"
              min="1"
              max="31"
              value={form.dueDate}
              onChange={(event) =>
                setForm({ ...form, dueDate: event.target.value })
              }
              placeholder="1"
            />
          </label>

          <label>
            Payment Method
            <input
              value={form.paymentMethod}
              onChange={(event) =>
                setForm({ ...form, paymentMethod: event.target.value })
              }
              placeholder="e.g. Bank Transfer, Card"
            />
          </label>
        </div>

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Any additional notes"
            rows="3"
          />
        </label>

        <div className="account-modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            {bill ? "Save Changes" : "Add Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
