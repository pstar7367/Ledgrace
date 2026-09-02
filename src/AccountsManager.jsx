import { useEffect, useMemo, useState } from "react";
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
  updateAccountRequest,
} from "./authApi.js";

const types = ["All", "Bank", "E-Wallet", "Card", "Wallet"];
const colors = ["#1458ed", "#00a978", "#8b5cf6", "#f59e0b", "#ef476f"];
const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const blank = {
  name: "",
  type: "Bank",
  provider: "",
  startingBalance: "",
  color: colors[0],
};

export default function AccountsManager({ topSearch = "" }) {
  const [accounts, setAccounts] = useState([]);
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
    return (
      requestError.response?.data?.message || requestError.message || fallback
    );
  };

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAccountsRequest();
      setAccounts(data.accounts);
    } catch (requestError) {
      setError(
        displayRequestError(requestError, "Unable to load your accounts."),
      );
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
      } catch (requestError) {
        if (active)
          setError(
            displayRequestError(requestError, "Unable to load your accounts."),
          );
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
      accounts.filter((account) => {
        const matchesTab = tab === "All" || account.type === tab;
        const query = `${search} ${topSearch}`.trim().toLowerCase();
        return (
          matchesTab &&
          (!query ||
            account.name.toLowerCase().includes(query) ||
            account.provider.toLowerCase().includes(query))
        );
      }),
    [accounts, search, tab, topSearch],
  );

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.currentBalance,
    0,
  );
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
      setError(
        displayRequestError(requestError, "Unable to save this account."),
      );
    }
  };

  const archive = async (id) => {
    try {
      await archiveAccountRequest(id);
      setAccounts((items) => items.filter((item) => item._id !== id));
    } catch {
      setError("Unable to archive this account.");
    }
    setMenuId(null);
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this account permanently?")) return;
    try {
      await deleteAccountRequest(id);
      setAccounts((items) => items.filter((item) => item._id !== id));
    } catch {
      setError("Unable to delete this account.");
    }
    setMenuId(null);
  };

  return (
    <section className="accounts-manager">
      <div className="accounts-heading">
        <div>
          <h1>Wallets &amp; Accounts</h1>
          <p>
            Track where your money is stored across every account and wallet.
          </p>
        </div>
        <div>
          <button className="button outline" onClick={loadAccounts}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="button primary" onClick={openCreate}>
            <Plus size={17} /> Add Account
          </button>
        </div>
      </div>
      {error && <p className="accounts-error">{error}</p>}
      <div className="accounts-stats">
        <Stat
          label="Total Balance"
          value={money.format(totalBalance)}
          icon={WalletCards}
        />
        <Stat
          label="Total Accounts"
          value={accounts.length}
          icon={CreditCard}
        />
        <Stat
          label="Active Accounts"
          value={accounts.length}
          icon={WalletCards}
        />
        <Stat
          label="Largest Account"
          value={largest ? money.format(largest.currentBalance) : "—"}
          note={largest?.name || "No accounts yet"}
          icon={WalletCards}
        />
      </div>
      <div className="accounts-toolbar">
        <div className="accounts-tabs">
          {types.map((type) => (
            <button
              key={type}
              className={tab === type ? "active" : ""}
              onClick={() => setTab(type)}
            >
              {type} (
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
            placeholder="Search accounts"
          />
        </label>
      </div>
      {loading ? (
        <div className="accounts-empty">
          <WalletCards />
          <p>Loading your accounts…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="accounts-empty">
          <WalletCards />
          <h2>
            {accounts.length
              ? "No matching accounts"
              : "Add your first account"}
          </h2>
          <p>
            {accounts.length
              ? "Try another search or account type."
              : "Add a bank account, e-wallet, card, or cash wallet to begin tracking your finances."}
          </p>
          {!accounts.length && (
            <button className="button primary" onClick={openCreate}>
              <Plus size={17} /> Add Account
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
                    {account.type} · {account.provider}
                  </small>
                </div>
                <button
                  className="account-menu-trigger"
                  onClick={() =>
                    setMenuId(menuId === account._id ? null : account._id)
                  }
                >
                  <MoreVertical size={18} />
                </button>
                {menuId === account._id && (
                  <div className="account-menu">
                    <button onClick={() => openEdit(account)}>Edit</button>
                    <button onClick={() => archive(account._id)}>
                      Archive
                    </button>
                    <button
                      className="danger"
                      onClick={() => remove(account._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <strong>{money.format(account.currentBalance)}</strong>
              <p>
                Last updated{" "}
                {new Date(account.updatedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>
      )}
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
            <h2>{editing ? "Edit account" : "Add account"}</h2>
            <p>
              {editing
                ? "Update the account details. Your balance changes automatically from linked transactions."
                : "Enter the opening balance once. Future transactions will update it automatically."}
            </p>
            <label>
              Account Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. GTBank Savings"
              />
            </label>
            <div className="dash-form-row">
              <label>
                Account Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
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
                  onChange={(event) =>
                    setForm({ ...form, provider: event.target.value })
                  }
                  placeholder="e.g. GTBank"
                />
              </label>
            </div>
            {!editing && (
              <label>
                Starting Balance (₦)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.startingBalance}
                  onChange={(event) =>
                    setForm({ ...form, startingBalance: event.target.value })
                  }
                  placeholder="0.00"
                />
              </label>
            )}
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
                    style={{ background: color }}
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
