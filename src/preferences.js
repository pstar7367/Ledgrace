export const DEFAULT_PREFERENCES = {
  theme: "Light",
  currency: "NGN",
  weekStartsOn: "Monday",
  language: "English",
  dashboardView: "Dashboard Overview",
  budgetAlerts: true,
  suggestedInsights: true,
  hapticFeedback: false,
  animations: true,
  compactMode: false,
  showQuickStats: true,
  inAppNotifications: true,
  autoSync: true,
  syncFrequency: "Every hour",
  exportFormat: "JSON",
};

export function readPreferences() {
  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(localStorage.getItem("ledgrace_profile_preferences")),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyPreferenceEffects(preferences = readPreferences()) {
  const root = document.documentElement;
  root.dataset.appCompact = preferences.compactMode === true ? "true" : "false";
  root.dataset.appReducedMotion = preferences.animations === false ? "true" : "false";
  root.dataset.appHaptics = preferences.hapticFeedback === true ? "true" : "false";
  root.dataset.appBudgetAlerts = preferences.budgetAlerts === false ? "false" : "true";
  root.dataset.appSuggestedInsights =
    preferences.suggestedInsights === false ? "false" : "true";
  root.dataset.appQuickStats = preferences.showQuickStats === false ? "false" : "true";
  root.dataset.appNotifications =
    preferences.inAppNotifications === false ? "false" : "true";
}

const currencyLocales = {
  NGN: "en-NG",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
};

const DEFAULT_EXCHANGE_RATES_FROM_NGN = {
  NGN: 1,
  USD: 1 / 1500,
  GBP: 1 / 2000,
  EUR: 1 / 1700,
};

const exchangeRatesUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:4001/api/auth"
).replace(/\/auth\/?$/, "/exchange-rates");

function readExchangeRates() {
  try {
    const cached = JSON.parse(localStorage.getItem("ledgrace_exchange_rates"));
    return { ...DEFAULT_EXCHANGE_RATES_FROM_NGN, ...(cached?.rates || {}) };
  } catch {
    return DEFAULT_EXCHANGE_RATES_FROM_NGN;
  }
}

export async function refreshExchangeRates() {
  try {
    const response = await fetch(exchangeRatesUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Exchange-rate service unavailable");
    const data = await response.json();
    localStorage.setItem(
      "ledgrace_exchange_rates",
      JSON.stringify({ ...data, fetchedAt: new Date().toISOString() }),
    );
    window.dispatchEvent(
      new CustomEvent("ledgrace:exchange-rates-changed", { detail: data }),
    );
    return data;
  } catch {
    return null;
  }
}

export const money = {
  format(value) {
    const preferences = readPreferences();
    const currency = preferences.currency || "NGN";
    const fractionDigits = 2;
    const convertedValue = Number(value || 0) * (readExchangeRates()[currency] || 1);
    return new Intl.NumberFormat(currencyLocales[currency] || "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(convertedValue);
  },
};
