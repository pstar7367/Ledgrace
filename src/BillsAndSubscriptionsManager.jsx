import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { money } from "./preferences.js";
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
  { value: "daily", key: "daily" },
  { value: "weekly", key: "weekly" },
  { value: "biweekly", key: "biweekly" },
  { value: "monthly", key: "monthly" },
  { value: "quarterly", key: "quarterly" },
  { value: "yearly", key: "yearly" },
];

function daysUntilDue(nextDueDate) {
  if (!nextDueDate) return null;
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86_400_000);
}

function formatDate(dateValue, locale = "en-NG") {
  if (!dateValue) return "No date";
  const date = new Date(dateValue);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

import { useTranslation } from "react-i18next";
export default function BillsAndSubscriptions({ topSearch = "" }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en-NG";
  const frequencyLabel = (frequency) => t(`frequency_${frequencies.find((item) => item.value === frequency)?.key || frequency}`);
  const statusLabel = (status) => t(`bill_status_${status === "paid" ? "paid" : status === "overdue" ? "overdue" : status === "paused" ? "paused" : "upcoming"}`);
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
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
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
          "Unable to load your bills and subscriptions.",
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
    return () =>
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
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
          bill.category.toLowerCase().includes(query),
      );
    }

    return result;
  }, [bills, filterType, filterStatus, topSearch]);

  const stats = useMemo(() => {
    const { start: monthStart, end: monthEnd } = getMonthBounds(selectedMonth);

    const upcomingBills = bills.filter((bill) => {
      const dueDate = new Date(bill.nextDueDate);
      return (
        dueDate >= monthStart && dueDate <= monthEnd && bill.status !== "paid"
      );
    });

    const totalDue = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
    const subscriptions = bills.filter(
      (bill) => bill.type === "subscription",
    ).length;
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
      .sort(
        (first, second) =>
          new Date(second.lastPaidDate) - new Date(first.lastPaidDate),
      );
  }, [bills, selectedMonth]);

  const upcomingPayments = useMemo(() => {
    const { start, end } = getMonthBounds(selectedMonth);

    return bills
      .filter((bill) => {
        const dueDate = new Date(bill.nextDueDate);
        return bill.status !== "paid" && dueDate >= start && dueDate <= end;
      })
      .sort(
        (first, second) =>
          new Date(first.nextDueDate) - new Date(second.nextDueDate),
      );
  }, [bills, selectedMonth]);

  const openCreate = () => {
    setEditingBill(null);
    setForm(blankBill);
    setFormOpen(true);
  };

  useEffect(() => {
    const openBillForm = () => openCreate();
    window.addEventListener("ledgrace:open-bill-form", openBillForm);
    return () =>
      window.removeEventListener("ledgrace:open-bill-form", openBillForm);
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
          items.map((item) =>
            item._id === editingBill._id ? data.bill : item,
          ),
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
          "Unable to save this bill. Please try again.",
      );
    }
  };

  const markAsPaid = async (bill) => {
    try {
      const { data } = await markBillAsPaidRequest(bill._id);
      setBills((items) =>
        items.map((item) => (item._id === bill._id ? data.bill : item)),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to mark this bill as paid.",
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
          "Unable to delete this bill. Please try again.",
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
              <h1>{t("bills_subscriptions")}</h1>
              <p>{t("bills_description")}</p>
            </div>
            <WorkspaceCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              ariaLabel={t("select_bills_date")}
            />
          </div>

          {error && <p className="bills-error">{error}</p>}

          <div className="bills-summary-list">
            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-blue">
                  <Calendar size={15} />
                </span>
                <span>{t("total_bills_subscriptions")}</span>
                <strong>{bills.length}</strong>
                <em>{t("tracked")}</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-green">
                  <DollarSign size={15} />
                </span>
                <span>{t("this_month_total")}</span>
                <strong>{money.format(stats.totalDue)}</strong>
                <em>{t("due_count", { count: stats.upcomingCount })}</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-purple">
                  <CheckCircle2 size={15} />
                </span>
                <span>{t("paid_this_month")}</span>
                <strong>{money.format(stats.paidTotal)}</strong>
                <em>{t("paid_count", { count: stats.paidBills })}</em>
              </div>
            </div>

            <div className="bills-summary-row simple">
              <div className="summary-line">
                <span className="summary-icon soft-orange">
                  <AlertCircle size={15} />
                </span>
                <span>{t("due_this_month")}</span>
                <strong>{money.format(stats.totalDue)}</strong>
                <em>{t("pending_count", { count: stats.upcomingCount })}</em>
              </div>
            </div>
          </div>

          <div className="bills-toolbar">
            <div className="bills-filters">
              <button
                className={filterType === "all" ? "active" : ""}
                onClick={() => setFilterType("all")}
              >
                {t("all")}
              </button>
              <button
                className={filterType === "bill" ? "active" : ""}
                onClick={() => setFilterType("bill")}
              >
                {t("bills")}
              </button>
              <button
                className={filterType === "subscription" ? "active" : ""}
                onClick={() => setFilterType("subscription")}
              >
                {t("subscriptions")}
              </button>
            </div>

            <div className="bill-status-select">
              <span>{t("all_status")}</span>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="all">{t("all")}</option>
                <option value="active">{t("bill_status_upcoming")}</option>
                <option value="paid">{t("bill_status_paid")}</option>
                <option value="overdue">{t("bill_status_overdue")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bills-empty">
              <Calendar />
              <h2>{t("loading_bills")}</h2>
            </div>
          ) : !bills.length ? (
            <div className="bills-empty empty-state-box">
              <h2>{t("no_bills")}</h2>
            </div>
          ) : !filteredBills.length ? (
            <p className="bills-no-results">
              {t("no_bills_match")}
            </p>
          ) : (
            <div className="bill-table-wrap">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>{t("name")}</th><th>{t("type")}</th><th>{t("amount")}</th><th>{t("due_date")}</th><th>{t("frequency")}</th><th>{t("status")}</th><th>{t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => {
                    const daysLeft = daysUntilDue(bill.nextDueDate);
                    const isOverdue = Number(daysLeft) < 0;
                    const statusClass =
                      bill.status === "paid"
                        ? "paid"
                        : isOverdue
                          ? "overdue"
                          : "upcoming";

                    return (
                      <tr key={bill._id}>
                        <td className="bill-name-cell">
                          <div className="bill-name-wrap">
                            <span
                              className="bill-logo"
                              style={{
                                background:
                                  bill.type === "subscription"
                                    ? "#e8f5ff"
                                    : "#f0f4ff",
                              }}
                            >
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
                            {bill.type === "subscription"
                              ? t("subscription")
                              : t("bill")}
                          </span>
                        </td>
                        <td className="bill-amount-cell">
                          {money.format(bill.amount)}
                        </td>
                        <td>{formatDate(bill.nextDueDate)}</td>
                        <td>
                          {frequencyLabel(bill.frequency)}
                        </td>
                        <td>
                          <span className={`table-status ${statusClass}`}>
                            {statusLabel(bill.status)}
                          </span>
                        </td>
                        <td className="bill-action-cell">
                          <div className="bill-action-wrap">
                            {bill.status !== "paid" ? (
                              <button
                                className="table-pay-btn"
                                onClick={() => markAsPaid(bill)}
                              >
                                {t("pay_now")}
                              </button>
                            ) : (
                              <button
                                className="table-pay-btn receipt"
                                onClick={() => setReceiptBill(bill)}
                              >
                                {t("view_receipt")}
                              </button>
                            )}
                            <button
                              className="row-menu-button"
                              onClick={() =>
                                setMenuId(menuId === bill._id ? null : bill._id)
                              }
                              aria-label={`Open menu for ${bill.name}`}
                            >
                              <MoreVertical size={15} />
                            </button>
                            {menuId === bill._id && (
                              <div className="bill-menu-dropdown">
                                <button
                                  onClick={() => openEdit(bill)}
                                  className="menu-item"
                                >
                                  <Pencil size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => deleteBill(bill._id)}
                                  className="menu-item danger"
                                >
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
            <section
              className="paid-bills-panel"
              aria-labelledby="paid-this-month-title"
            >
              <div className="paid-bills-heading">
                <div>
                  <h2 id="paid-this-month-title">{t("paid_this_month")}</h2>
                  <p>{t("completed_payments_for", { month: formatMonthLabel(selectedMonth) })}</p>
                </div>
                <strong>{money.format(stats.paidTotal)}</strong>
              </div>

              {paidThisMonth.length ? (
                <div className="paid-bill-table-wrap">
                  <table className="paid-bill-table">
                    <thead>
                      <tr>
                        <th>{t("name")}</th><th>{t("type")}</th><th>{t("amount")}</th><th>{t("paid_date")}</th><th>{t("receipt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidThisMonth.map((bill) => (
                        <tr key={bill._id}>
                          <td>
                            <div className="bill-name-wrap">
                              <span
                                className="bill-logo"
                                style={{
                                  background:
                                    bill.type === "subscription"
                                      ? "#e8f5ff"
                                      : "#f0f4ff",
                                }}
                              >
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
                              {bill.type === "subscription" ? t("subscription") : t("bill")}
                            </span>
                          </td>
                          <td className="bill-amount-cell">
                            {money.format(bill.amount)}
                          </td>
                          <td>{formatDate(bill.lastPaidDate, locale)}</td>
                          <td>
                            <button
                              className="table-pay-btn receipt"
                              onClick={() => setReceiptBill(bill)}
                            >
                              {t("view_receipt")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="paid-bills-empty">
                  {t("no_paid_bills_for", { month: formatMonthLabel(selectedMonth) })}
                </div>
              )}
            </section>
          )}
        </div>

        <aside
          className="upcoming-payments-panel"
          aria-labelledby="upcoming-payments-title"
        >
          <div className="upcoming-payments-heading">
            <div>
              <h2 id="upcoming-payments-title">{t("upcoming_payments")}</h2>
              <p>{t("due_in_month", { month: formatMonthLabel(selectedMonth) })}</p>
            </div>
            <Calendar size={19} />
          </div>

          {upcomingPayments.length ? (
            <div className="upcoming-payments-list">
              {upcomingPayments.map((bill) => {
                const daysLeft = daysUntilDue(bill.nextDueDate);
                const dueText = daysLeft < 0
                  ? t("days_overdue", { count: Math.abs(daysLeft) })
                  : daysLeft === 0
                    ? t("due_today")
                    : t("due_in_days", { count: daysLeft });

                return (
                  <article className="upcoming-payment" key={bill._id}>
                    <span className="upcoming-payment-icon">
                      {bill.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="upcoming-payment-info">
                      <strong>{bill.name}</strong>
                      <small>
                        {formatDate(bill.nextDueDate, locale)} · {frequencyLabel(bill.frequency)}
                      </small>
                    </div>
                    <div className="upcoming-payment-amount">
                      <strong>{money.format(bill.amount)}</strong>
                      <span className={daysLeft < 0 ? "overdue" : ""}>
                        {dueText}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="upcoming-payments-empty">
              <Calendar size={24} />
              <p>{t("no_upcoming_payments")}</p>
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
      {receiptBill && (
        <BillReceipt bill={receiptBill} onClose={() => setReceiptBill(null)} />
      )}
    </section>
  );
}

function BillReceipt({ bill, onClose }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en-NG";
  const receiptNumber = `LR-${bill._id.slice(-8).toUpperCase()}`;
  const paidDate = bill.lastPaidDate
    ? formatDate(bill.lastPaidDate, locale)
    : t("payment_date_unavailable");

  return (
    <div
      className="dash-modal receipt-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t("payment_receipt")}
    >
      <section className="receipt-card">
        <button
          type="button"
          className="dash-modal-close"
          onClick={onClose}
          aria-label={t("close_receipt")}
        >
          <X />
        </button>
        <div className="receipt-success">
          <CheckCircle2 />
        </div>
        <p className="receipt-kicker">{t("payment_receipt")}</p>
        <h2>{t("payment_successful")}</h2>
        <p className="receipt-copy">
          {t("bill_marked_paid")}
        </p>
        <div className="receipt-amount">{money.format(bill.amount)}</div>
        <div className="receipt-details">
          <div>
            <span>{t("receipt_number")}</span>
            <b>{receiptNumber}</b>
          </div>
          <div>
            <span>{t("bill")}</span>
            <b>{bill.name}</b>
          </div>
          <div>
            <span>{t("category")}</span>
            <b>{bill.category}</b>
          </div>
          <div>
            <span>{t("paid_on")}</span>
            <b>{paidDate}</b>
          </div>
          <div>
            <span>{t("payment_method")}</span>
            <b>{bill.paymentMethod || t("not_specified")}</b>
          </div>
          <div>
            <span>{t("frequency")}</span>
            <b>
              {frequencies.find((item) => item.value === bill.frequency)
                ? t(`frequency_${frequencies.find((item) => item.value === bill.frequency)?.key || bill.frequency}`)
                : bill.frequency}
            </b>
          </div>
        </div>
        <button className="button primary receipt-close" onClick={onClose}>
          {t("done")}
        </button>
      </section>
    </div>
  );
}

function BillForm({ bill, form, setForm, onClose, onSubmit }) {
  const { t } = useTranslation();
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
        <h2>{bill ? t("edit_bill") : t("add_bill_subscription")}</h2>
        <p>
          {bill
            ? t("update_bill_details")
            : t("add_bill_description")}
        </p>

        <label>
          {t("name")}
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Electricity Bill"
          />
        </label>

        <label>
          {t("description")}
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
            {t("type")}
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="bill">{t("bill")}</option>
              <option value="subscription">{t("subscription")}</option>
            </select>
          </label>

          <label>
            {t("category")}
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
            {t("amount_currency")}
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
            {t("frequency")}
            <select
              value={form.frequency}
              onChange={(event) =>
                setForm({ ...form, frequency: event.target.value })
              }
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {t(`frequency_${freq.key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="dash-form-row">
          <label>
            {t("due_day_of_month")}
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
            {t("payment_method")}
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
          {t("notes")}
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
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
