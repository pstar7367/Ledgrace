export function calculateFinancialHealthScore({ savingsRate, accountBalance, goalSaved, totalExpenses, totalIncome }) {
  const incomeBase = Math.max(totalIncome, 1);
  return Math.min(100, Math.max(0, Math.round(
    (savingsRate
      + (accountBalance ? 25 : 0)
      + (goalSaved ? 12 : 0)
      - (totalExpenses / incomeBase) * 100 * 0.45) / 1.2,
  )));
}
