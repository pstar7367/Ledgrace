import express from "express";

const router = express.Router();
const CBN_RATES_URL = "https://www.cbn.gov.ng/api/GetAllExchangeRates";
const CURRENCY_NAMES = {
  EURO: "EUR",
  "POUNDS STERLING": "GBP",
  "US DOLLAR": "USD",
};

router.get("/", async (req, res) => {
  try {
    const response = await fetch(CBN_RATES_URL);
    if (!response.ok) throw new Error(`CBN responded with ${response.status}`);
    const records = await response.json();
    const latest = {};
    for (const record of records) {
      const currency = CURRENCY_NAMES[record.currency];
      if (currency && (!latest[currency] || record.ratedate > latest[currency].ratedate)) latest[currency] = record;
    }
    if (!latest.USD || !latest.GBP || !latest.EUR) throw new Error("CBN did not return all required rates.");
    res.json({
      source: "Central Bank of Nigeria",
      rateDate: latest.USD.ratedate,
      rates: {
        NGN: 1,
        USD: 1 / Number(latest.USD.centralrate),
        GBP: 1 / Number(latest.GBP.centralrate),
        EUR: 1 / Number(latest.EUR.centralrate),
      },
      ngnPerUnit: {
        USD: Number(latest.USD.centralrate),
        GBP: Number(latest.GBP.centralrate),
        EUR: Number(latest.EUR.centralrate),
      },
    });
  } catch (error) {
    console.error("exchange rates error:", error);
    res.status(502).json({ message: "Unable to retrieve the latest official exchange rates." });
  }
});

export default router;
