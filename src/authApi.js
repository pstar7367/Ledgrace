import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001/api/auth",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signupRequest = (payload) => apiClient.post("/signup", payload);
export const loginRequest = (payload) => apiClient.post("/login", payload);
export const forgotPasswordRequest = (payload) =>
  apiClient.post("/forgot-password", payload);
export const verifyResetCodeRequest = (payload) =>
  apiClient.post("/verify-reset-code", payload);
export const resetPasswordRequest = (payload) =>
  apiClient.post("/reset-password", payload);
export const resendResetCodeRequest = (payload) =>
  apiClient.post("/resend-reset-code", payload);
export const verifyEmailRequest = (token) =>
  apiClient.get(`/verify-email?token=${token}`);
export const refreshTokenRequest = (token) =>
  apiClient.get("/refresh-token", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMonthlyIncomeRequest = () =>
  apiClient.get("/monthly-income", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ledgrace_token")}`,
    },
  });

export const updateMonthlyIncomeRequest = (monthlyIncome) =>
  apiClient.put(
    "/monthly-income",
    { monthlyIncome },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ledgrace_token")}`,
      },
    },
  );
export const getProfileRequest = () => apiClient.get("/profile", accountHeaders());
export const updateProfileRequest = (payload) =>
  apiClient.patch("/profile", payload, accountHeaders());
export const changePasswordRequest = (payload) =>
  apiClient.patch("/password", payload, accountHeaders());
export const verifyTwoFactorRequest = (payload) =>
  apiClient.post("/verify-two-factor", payload);

const authBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/auth";
const accountsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/accounts"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const transactionsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/transactions"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const savingsGoalsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/savings-goals"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const billsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/bills"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const calendarEventsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/calendar-events"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const accountHeaders = () => {
  const token = localStorage.getItem("ledgrace_token");
  if (!token) throw new Error("Your session has expired. Please log in again.");
  return { headers: { Authorization: `Bearer ${token}` } };
};
export const getAccountsRequest = () =>
  accountsClient.get("/", accountHeaders());
export const createAccountRequest = (payload) =>
  accountsClient.post("/", payload, accountHeaders());
export const updateAccountRequest = (id, payload) =>
  accountsClient.patch(`/${id}`, payload, accountHeaders());
export const archiveAccountRequest = (id) =>
  accountsClient.patch(`/${id}/archive`, {}, accountHeaders());
export const deleteAccountRequest = (id) =>
  accountsClient.delete(`/${id}`, accountHeaders());
export const getTransactionsRequest = () =>
  transactionsClient.get("/", accountHeaders());
export const createTransactionRequest = (payload) =>
  transactionsClient.post("/", payload, accountHeaders());
export const deleteTransactionRequest = (id) =>
  transactionsClient.delete(`/${id}`, accountHeaders());
export const getSavingsGoalsRequest = () =>
  savingsGoalsClient.get("/", accountHeaders());
export const createSavingsGoalRequest = (payload) =>
  savingsGoalsClient.post("/", payload, accountHeaders());
export const updateSavingsGoalRequest = (id, payload) =>
  savingsGoalsClient.patch(`/${id}`, payload, accountHeaders());
export const addGoalContributionRequest = (id, payload) =>
  savingsGoalsClient.post(`/${id}/contributions`, payload, accountHeaders());
export const deleteSavingsGoalRequest = (id) =>
  savingsGoalsClient.delete(`/${id}`, accountHeaders());
export const getBillsRequest = () => billsClient.get("/", accountHeaders());
export const createBillRequest = (payload) =>
  billsClient.post("/", payload, accountHeaders());
export const updateBillRequest = (id, payload) =>
  billsClient.put(`/${id}`, payload, accountHeaders());
export const markBillAsPaidRequest = (id) =>
  billsClient.patch(`/${id}/mark-paid`, {}, accountHeaders());
export const deleteBillRequest = (id) =>
  billsClient.delete(`/${id}`, accountHeaders());
export const getCalendarEventsRequest = () =>
  calendarEventsClient.get("/", accountHeaders());
export const createCalendarEventRequest = (payload) =>
  calendarEventsClient.post("/", payload, accountHeaders());
export const deleteCalendarEventRequest = (id) =>
  calendarEventsClient.delete(`/${id}`, accountHeaders());

const notificationsClient = axios.create({
  baseURL: authBaseUrl.replace(/\/auth\/?$/, "/notifications"),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
export const getNotificationsRequest = () =>
  notificationsClient.get("/", accountHeaders());
export const markNotificationReadRequest = (id) =>
  notificationsClient.patch(`/${id}/read`, {}, accountHeaders());
export const markNotificationUnreadRequest = (id) =>
  notificationsClient.patch(`/${id}/unread`, {}, accountHeaders());
export const markAllNotificationsReadRequest = () =>
  notificationsClient.patch("/read-all", {}, accountHeaders());
export const markAllNotificationsUnreadRequest = () =>
  notificationsClient.patch("/unread-all", {}, accountHeaders());
