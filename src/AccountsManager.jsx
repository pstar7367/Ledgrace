import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { money } from "./preferences.js";
import {
  CreditCard,
  MoreVertical,
  Plus,
  RefreshCcw,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import {
  archiveAccountRequest,
  createAccountRequest,
  deleteAccountRequest,
  getAccountsRequest,
  getTransactionsRequest,
  updateAccountRequest,
} from "./authApi.js";

const types = ["All", "Bank", "E-Wallet", "Card", "Wallet"];
const colors = ["#1458ed", "#00a978", "#8b5cf6", "#f59e0b", "#ef476f"];
const blank = {
  name: "",
  type: "Bank",
  provider: "",
  startingBalance: "",
  currentBalance: "",
  color: colors[0],
};

export default function AccountsManager({ topSearch = "" }) {
  const { t } = useTranslation();
  const typeLabel = (type) =>
    t(
      {
        All: "account_type_all",
        Bank: "account_type_bank",
        "E-Wallet": "account_type_e_wallet",
        Card: "account_type_card",
        Wallet: "account_type_wallet",
      }[type] || type,
    );
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [accountView, setAccountView] = useState("active");
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [menuId, setMenuId] = useState(null);

  const displayRequestError = (requestError, fallback) => {
    if (
      requestError.response?.status === 401 ||
      requestError.message?.includes("session has expired")
    ) {
      localStorage.removeItem("ledgrace_token");
      localStorage.removeItem("ledgrace_user");
      return "Your session has expired or is invalid. Please log in again to manage accounts.";
    }
    return requestError.response?.data?.message || requestError.message || fallback;
  };

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAccountsRequest();
      setAccounts(data.accounts);
      const archivedResponse = await getAccountsRequest(true);
      setArchivedAccounts(
        archivedResponse.data.accounts.filter((account) => account.archived),
      );
      const transactionResponse = await getTransactionsRequest();
      setTransactions(transactionResponse.data.transactions || []);
    } catch (requestError) {
      setError(displayRequestError(requestError, "Unable to load your accounts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitialAccounts = async () => {
      try {
        const { data } = await getAccountsRequest();
        if (active) setAccounts(data.accounts);
        const archivedResponse = await getAccountsRequest(true);
        if (active)
          setArchivedAccounts(
            archivedResponse.data.accounts.filter((account) => account.archived),
          );
        const transactionResponse = await getTransactionsRequest();
        if (active) setTransactions(transactionResponse.data.transactions || []);
      } catch (requestError) {
        if (active)
          setError(displayRequestError(requestError, "Unable to load your accounts."));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitialAccounts();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () =>
      (accountView === "active" ? accounts : archivedAccounts).filter((account) => {
        const matchesTab = tab === "All" || account.type === tab;
        const query = `${search} ${topSearch}`.trim().toLowerCase();
        return (
          matchesTab &&
          (!query ||
            account.name.toLowerCase().includes(query) ||
            account.provider.toLowerCase().includes(query))
        );
      }),
    [accountView, accounts, archivedAccounts, search, tab, topSearch],
  );

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const unassignedTransactions = transactions.filter((item) => !item.account).length;
  const largest = accounts.reduce(
    (top, account) =>
      !top || account.currentBalance > top.currentBalance ? account : top,
    null,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setFormOpen(true);
  };
  const openEdit = (account) => {
    setEditing(account);
    setForm({
      name: account.name,
      type: account.type,
      provider: account.provider,
      startingBalance: account.startingBalance,
      currentBalance: account.currentBalance,
      color: account.color,
    });
    setMenuId(null);
    setFormOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        const { data } = await updateAccountRequest(editing._id, {
          name: form.name,
          type: form.type,
          provider: form.provider,
          color: form.color,
          currentBalance: Number(form.currentBalance),
        });
        setAccounts((items) =>
          items.map((item) => (item._id === editing._id ? data.account : item)),
        );
      } else {
        await createAccountRequest(form);
        await loadAccounts();
      }
      setFormOpen(false);
    } catch (requestError) {
      setError(displayRequestError(requestError, "Unable to save this account."));
    }
  };

  const archive = async (id) => {
    try {
      const { data } = await archiveAccountRequest(id);
      setAccounts((items) => items.filter((item) => item._id !== id));
      setArchivedAccounts((items) => [data.account, ...items]);
      if (accounts.length === 1) setAccountView("archived");
    } catch {
      setError("Unable to archive this account.");
    }
    setMenuId(null);
  };
  const restore = async (id) => {
    try {
      const { data } = await updateAccountRequest(id, { archived: false });
      setArchivedAccounts((items) => items.filter((item) => item._id !== id));
      setAccounts((items) => [data.account, ...items]);
    } catch (requestError) {
      setError(displayRequestError(requestError, "Unable to restore this account."));
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this account permanently?")) return;
    try {
      await deleteAccountRequest(id);
      setAccounts((items) => items.filter((item) => item._id !== id));
      setArchivedAccounts((items) => items.filter((item) => item._id !== id));
    } catch {
      setError("Unable to delete this account.");
    }
    setMenuId(null);
  };

  return (
    <section className="accounts-manager">
      <div className="accounts-heading">
        <div>
          <h1>{t("accounts")}</h1>
          <p>
            Track where you keep your money and tag related transactions. Balances are
            entered and updated manually; Ledgrace does not connect to your bank.
          </p>
        </div>
        <div>
          <button className="button outline" onClick={loadAccounts}>
            <RefreshCcw size={16} /> {t("refresh")}
          </button>
          <button className="button primary" onClick={openCreate}>
            <Plus size={17} /> {t("add_account")}
          </button>
        </div>
      </div>
      {error && <p className="accounts-error">{error}</p>}
      <div className="accounts-stats">
        <Stat
          label={t("total_balance")}
          value={money.format(totalBalance)}
          icon={WalletCards}
        />
        <Stat label={t("total_accounts")} value={accounts.length} icon={CreditCard} />
        <Stat
          label="Unassigned transactions"
          value={unassignedTransactions}
          icon={WalletCards}
        />
        <Stat
          label={t("largest_account")}
          value={largest ? money.format(largest.currentBalance) : "—"}
          note={largest?.name || "No accounts yet"}
          icon={WalletCards}
        />
      </div>
      <div className="accounts-view-tabs" role="tablist" aria-label="Account status">
        <button
          type="button"
          role="tab"
          aria-selected={accountView === "active"}
          className={accountView === "active" ? "active" : ""}
          onClick={() => {
            setAccountView("active");
            setTab("All");
          }}
        >
          Active ({accounts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={accountView === "archived"}
          className={accountView === "archived" ? "active" : ""}
          onClick={() => {
            setAccountView("archived");
            setTab("All");
          }}
        >
          Archived ({archivedAccounts.length})
        </button>
      </div>
      <div className="accounts-toolbar">
        <div className="accounts-tabs">
          {types.map((type) => (
            <button
              key={type}
              className={tab === type ? "active" : ""}
              onClick={() => setTab(type)}
            >
              {typeLabel(type)} (
              {type === "All"
                ? accounts.length
                : accounts.filter((account) => account.type === type).length}
              )
            </button>
          ))}
        </div>
        <label className="accounts-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search_accounts")}
          />
        </label>
      </div>
      {loading ? (
        <div className="accounts-empty">
          <WalletCards />
          <p>{t("loading_accounts")}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="accounts-empty">
          <WalletCards />
          <h2>
            {accountView === "archived"
              ? archivedAccounts.length
                ? t("no_matching_accounts")
                : "No archived accounts"
              : accounts.length
                ? t("no_matching_accounts")
                : t("add_first_account")}
          </h2>
          <p>
            {accountView === "archived"
              ? archivedAccounts.length
                ? t("try_account_search")
                : "Accounts you archive will be kept here, where you can restore or permanently delete them."
              : accounts.length
                ? t("try_account_search")
                : "No active accounts yet. Archived accounts are available in the Archived tab."}
          </p>
          {accountView === "active" && !accounts.length && (
            <button className="button primary" onClick={openCreate}>
              <Plus size={17} /> {t("add_account")}
            </button>
          )}
        </div>
      ) : (
        <div className="account-card-grid">
          {visible.map((account) => (
            <article
              className="account-card"
              key={account._id}
              style={{ "--account-color": account.color }}
            >
              <div className="account-card-top">
                <span className="account-card-icon">
                  <WalletCards />
                </span>
                <div>
                  <b>{account.name}</b>
                  <small>
                    {typeLabel(account.type)} · {account.provider}
                  </small>
                </div>
                <button
                  className="account-menu-trigger"
                  onClick={() => setMenuId(menuId === account._id ? null : account._id)}
                >
                  <MoreVertical size={18} />
                </button>
                {menuId === account._id && (
                  <div className="account-menu">
                    {accountView === "active" ? (
                      <>
                        <button onClick={() => openEdit(account)}>{t("edit")}</button>
                        <button onClick={() => archive(account._id)}>
                          {t("archive")}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => restore(account._id)}>Restore</button>
                    )}
                    <button className="danger" onClick={() => remove(account._id)}>
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
              <strong>{money.format(account.currentBalance)}</strong>
              <p>
                {t("last_updated")}{" "}
                {new Date(account.updatedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <button
                className="button outline"
                type="button"
                onClick={() =>
                  setSelectedAccountId(
                    selectedAccountId === account._id ? null : account._id,
                  )
                }
              >
                View{" "}
                {
                  transactions.filter(
                    (item) => (item.account?._id || item.account) === account._id,
                  ).length
                }{" "}
                tagged transactions
              </button>
              {accountView === "active" && (
                <button
                  className="button primary"
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("ledgrace:open-transaction-form", {
                        detail: { accountId: account._id },
                      }),
                    )
                  }
                >
                  <Plus size={15} /> Add transaction
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {selectedAccountId &&
        (() => {
          const account = accounts.find((item) => item._id === selectedAccountId);
          const accountTransactions = transactions.filter(
            (item) => (item.account?._id || item.account) === selectedAccountId,
          );
          return account ? (
            <section className="dash-panel">
              <div className="dash-panel-title">
                <h2>{account.name} activity</h2>
                <button type="button" onClick={() => setSelectedAccountId(null)}>
                  Close
                </button>
              </div>
              {accountTransactions.length ? (
                accountTransactions.slice(0, 8).map((item) => (
                  <article className="dash-transaction" key={item._id}>
                    <span className={item.type}>
                      <WalletCards />
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <small>
                        {item.category} · {item.date}
                      </small>
                    </div>
                    <strong className={item.type}>
                      {item.type === "income" ? "+" : "−"}
                      {money.format(item.amount)}
                    </strong>
                  </article>
                ))
              ) : (
                <p>No transactions are tagged to this account yet.</p>
              )}
            </section>
          ) : null;
        })()}
      {formOpen && (
        <div className="dash-modal" role="dialog">
          <form onSubmit={save}>
            <button
              type="button"
              className="dash-modal-close"
              onClick={() => setFormOpen(false)}
            >
              <X />
            </button>
            <h2>{editing ? t("edit_account") : t("add_account")}</h2>
            <p>
              {editing
                ? "Update the details or manually correct the tracked balance. Transactions do not change it automatically."
                : "Enter the balance you want to track. This is a manual snapshot, not a bank connection."}
            </p>
            <label>
              Account Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. GTBank Savings"
              />
            </label>
            <div className="dash-form-row">
              <label>
                Account Type
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  {types.slice(1).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Bank / Wallet Provider
                <input
                  required
                  value={form.provider}
                  onChange={(event) => setForm({ ...form, provider: event.target.value })}
                  placeholder="e.g. GTBank"
                />
              </label>
            </div>
            <label>
              {editing ? "Tracked Balance (₦)" : "Balance to Track (₦)"}
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={editing ? form.currentBalance : form.startingBalance}
                onChange={(event) =>
                  setForm(
                    editing
                      ? { ...form, currentBalance: event.target.value }
                      : { ...form, startingBalance: event.target.value },
                  )
                }
                placeholder="0.00"
              />
            </label>
            <label>
              Account Color
              <span className="account-colors">
                {colors.map((color) => (
                  <button
                    type="button"
                    aria-label={`Use ${color}`}
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={form.color === color ? "selected" : ""}
                    style={{ "--swatch-color": color, backgroundColor: color }}
                  />
                ))}
              </span>
            </label>
            <div className="account-modal-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button className="button primary" type="submit">
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, note, icon: Icon }) {
  return (
    <article className="dash-metric">
      <span>
        <Icon />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      {note && <em>{note}</em>}
    </article>
  );
}
