import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add this to your api.js file

// ==================== INVESTMENT APIs ====================
export const investmentAPI = {
  addInvestment: (investmentData) => api.post('/investments/add', investmentData),
  getMyInvestments: () => api.get('/investments/my-investments'),
  getInvestmentSummary: () => api.get('/investments/summary'),
  updateInvestmentValue: (investmentId, newValue) => 
    api.put(`/investments/${investmentId}/update-value`, null, { params: { newValue } }),
  deleteInvestment: (investmentId) => api.delete(`/investments/${investmentId}`),
  getPortfolioPerformance: (period = '6M') => 
    api.get(`/investments/performance?period=${period}`),
  getAssetAllocation: () => api.get('/investments/performance/asset-allocation'),
  getBankAccounts: () => api.get('/accounts/my-accounts'), // Reuse account API
};


// Add to api.js
// Add to api.js

// ==================== SMARTBOT APIs ====================
export const smartBotAPI = {
  ask: (message) => api.post('/smartbot/ask', { message }),
  askSmart: (message) => api.post('/smartbot/ask-smart', { message }),
  stream: (message) => `/smartbot/stream?message=${encodeURIComponent(message)}`,
  clearHistory: () => api.post('/smartbot/clear-history'),
  getSummary: () => api.get('/smartbot/summary'),
  health: () => api.get('/smartbot/health'),
};


// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('=== DEBUG: Request Details ===');
    console.log('URL:', config.url);
    console.log('Token exists:', !!token);
    
    if (token) {
      // Clean token if it accidentally has quotes
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('✅ Added Authorization header');
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - DO NOT auto-redirect, let React Router handle it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only reject the promise, don't auto-redirect
    // The component will handle the 401
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ==================== DASHBOARD APIs ====================
export const dashboardAPI = {
  getCurrentNetWorth: () => api.get('/dashboard/net-worth/current'),
  getNetWorthTrend: (period = 'monthly', months = 12) => 
    api.get(`/dashboard/net-worth/trend?period=${period}&months=${months}`),
  getMonthlyNetWorth: (months = 12) => 
    api.get(`/dashboard/net-worth/monthly?months=${months}`),
  getCurrentSavingsRate: () => api.get('/dashboard/savings-rate/current'),
  getSavingsRateTrend: (months = 12) => 
    api.get(`/dashboard/savings-rate/trend?months=${months}`),
  getSavingsRateSummary: () => api.get('/dashboard/savings-rate/summary'),
  getSavingsRateAiImprovement: () => api.get('/dashboard/savings-rate/ai-improvement'),
  getFinancialHealth: () => api.get('/dashboard/financial-health'),
  getFinancialHealthAiReport: () => api.get('/dashboard/financial-health/ai-report'),
  getFinancialHealthScore: () => api.get('/dashboard/financial-health/score'),
  getFinancialHealthComponents: () => api.get('/dashboard/financial-health/components'),
  getRecentTransactions: (limit = 10) => 
    api.get(`/transactions/my-transactions?limit=${limit}`),
  getCurrentBudgets: () => api.get('/budgets/current-month'),
  getBudgetsByMonth: (year, month) => api.get(`/budgets?year=${year}&month=${month}`),
  getBudgetSummary: (year, month) => api.get(`/budgets/summary?year=${year}&month=${month}`),
  getSpendingBreakdown: (year, month) => api.get(`/budgets/breakdown?year=${year}&month=${month}`),
  getUpcomingBills: () => api.get('/bill-reminders/upcoming'),
  getUnreadAlerts: () => api.get('/alerts/unread'),
  getBankAccounts: () => api.get('/accounts/my-accounts'),
};

// ==================== TRANSACTION APIs ====================
export const transactionAPI = {
  getTransactions: (params = {}) => {
    const { startDate, endDate, type, page, size } = params;
    let url = '/transactions/my-transactions';
    const queryParams = [];
    
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    if (type) queryParams.push(`type=${type}`);
    if (page !== undefined) queryParams.push(`page=${page}`);
    if (size !== undefined) queryParams.push(`size=${size}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return api.get(url);
  },
  
  getFilteredTransactions: (filters) => {
    const queryParams = [];
    
    if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);
    if (filters.type && filters.type !== 'all') queryParams.push(`type=${filters.type}`);
    if (filters.categoryId) queryParams.push(`categoryId=${filters.categoryId}`);
    if (filters.startDate) queryParams.push(`startDate=${filters.startDate}`);
    if (filters.endDate) queryParams.push(`endDate=${filters.endDate}`);
    if (filters.accountId) queryParams.push(`accountId=${filters.accountId}`);
    if (filters.minAmount) queryParams.push(`minAmount=${filters.minAmount}`);
    if (filters.maxAmount) queryParams.push(`maxAmount=${filters.maxAmount}`);
    if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`);
    if (filters.sortDirection) queryParams.push(`sortDirection=${filters.sortDirection}`);
    if (filters.page !== undefined) queryParams.push(`page=${filters.page}`);
    if (filters.size !== undefined) queryParams.push(`size=${filters.size}`);
    
    const url = queryParams.length > 0 
      ? `/transactions/filter?${queryParams.join('&')}`
      : '/transactions/filter';
    
    return api.get(url);
  },
  
  getTransactionById: (transactionId) => api.get(`/transactions/${transactionId}`),
  addTransaction: (accountId, transactionData) => 
    api.post(`/transactions/add/${accountId}`, transactionData),
  updateTransaction: (transactionId, transactionData) => 
    api.put(`/transactions/${transactionId}`, transactionData),
  deleteTransaction: (transactionId) => api.delete(`/transactions/${transactionId}`),
  getTotalSpending: (startDate, endDate) => 
    api.get(`/transactions/spending?startDate=${startDate}&endDate=${endDate}`),
  getMonthlySummary: (year, month) => 
    api.get(`/transactions/monthly-summary?year=${year}&month=${month}`),
};

// ==================== ACCOUNT APIs ====================
export const accountAPI = {
  getMyAccounts: () => api.get('/accounts/my-accounts'),
  addAccount: (accountData) => api.post('/accounts/add', accountData),
  deleteAccount: (accountId) => api.delete(`/accounts/${accountId}`),
};

// ==================== CATEGORY APIs ====================
export const categoryAPI = {
  getExpenseCategories: () => api.get('/categories/expense-categories'),
  getIncomeCategories: () => api.get('/categories/income-categories'),
  getAllCategories: () => api.get('/categories/all'),
  createCategory: (categoryData) => api.post('/categories/create', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}`),
};

// ==================== BUDGET APIs ====================
export const budgetAPI = {
  createBudget: (budgetData) => api.post('/budgets/create', budgetData),
  getCurrentBudgets: () => api.get('/budgets/current-month'),
  getBudgetsByMonth: (year, month) => api.get(`/budgets?year=${year}&month=${month}`),
  getBudgetSummary: (year, month) => api.get(`/budgets/summary?year=${year}&month=${month}`),
  updateBudget: (budgetId, updates) => api.put(`/budgets/${budgetId}`, updates),
  deleteBudget: (budgetId) => api.delete(`/budgets/${budgetId}`),
  getAtRiskBudgets: () => api.get('/budgets/at-risk'),
};

// ==================== OCR APIs ====================
export const ocrAPI = {
  extractText: (formData) => {
    return api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  saveExtractedReceipt: (ocrResult) => api.post('/receipts/save-extracted', ocrResult),
  processDocument: (documentId, force = false) => api.post(`/receipts/process/${documentId}`, null, { params: { force } }),
  getDocuments: () => api.get('/ocr/documents'),
  getDocument: (documentId) => api.get(`/ocr/document/${documentId}`),
  deleteDocument: (documentId) => api.delete(`/ocr/document/${documentId}`),
};

// ==================== BILL REMINDER APIs ====================
export const billReminderAPI = {
  getMyBills: () => api.get('/bill-reminders/my-bills'),
  getUpcomingBills: () => api.get('/bill-reminders/upcoming'),
  createBillReminder: (billData) => api.post('/bill-reminders/create', billData),
  markBillAsPaid: (recurringId, accountId) =>
    api.put(`/bill-reminders/${recurringId}/mark-paid`, null, {
      params: accountId ? { accountId } : {},
    }),
  updateBillReminder: (recurringId, billData) => api.put(`/bill-reminders/${recurringId}/update`, billData),
  deleteBillReminder: (recurringId) => api.delete(`/bill-reminders/${recurringId}`),
};

// ==================== ALERT APIs ====================
export const alertAPI = {
  getUnreadAlerts: () => api.get('/alerts/unread'),
  getAllAlerts: () => api.get('/alerts/all'),
  markAsRead: (alertId) => api.put(`/alerts/${alertId}/read`),
  markAllAsRead: () => api.put('/alerts/mark-all-read'),
};

export default api;
