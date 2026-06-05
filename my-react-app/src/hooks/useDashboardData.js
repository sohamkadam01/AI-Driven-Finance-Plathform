import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, accountAPI } from '../services/api';
import api from '../services/api';

export const useDashboardData = () => {
  // Net Worth Queries - Fixed for v5
  const netWorth = useQuery({
    queryKey: ['netWorth'],
    queryFn: dashboardAPI.getCurrentNetWorth,
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
  
  const netWorthTrend = useQuery({
    queryKey: ['netWorthTrend', 'monthly', 12],
    queryFn: () => dashboardAPI.getNetWorthTrend('monthly', 12),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  // Savings Rate Queries
  const savingsRate = useQuery({
    queryKey: ['savingsRate'],
    queryFn: dashboardAPI.getCurrentSavingsRate,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  const savingsRateTrend = useQuery({
    queryKey: ['savingsRateTrend', 12],
    queryFn: () => dashboardAPI.getSavingsRateTrend(12),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  // Financial Health Queries
  const financialHealth = useQuery({
    queryKey: ['financialHealth'],
    queryFn: dashboardAPI.getFinancialHealth,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  const financialHealthScore = useQuery({
    queryKey: ['financialHealthScore'],
    queryFn: dashboardAPI.getFinancialHealthScore,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  // Transaction Queries
  const recentTransactions = useQuery({
    queryKey: ['recentTransactions', 10],
    queryFn: () => dashboardAPI.getRecentTransactions(10),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
  
  // Budget Queries - Updated to use correct endpoint
  const currentBudgets = useQuery({
    queryKey: ['currentBudgets'],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getCurrentBudgets();
        return response.data;
      } catch (error) {
        console.error('Failed to fetch budgets:', error);
        return { budgets: [], totalBudgets: 0 };
      }
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    enabled: !!localStorage.getItem('token'),
    retry: 1,
  });
  
  // Bill Queries
  const upcomingBills = useQuery({
    queryKey: ['upcomingBills'],
    queryFn: dashboardAPI.getUpcomingBills,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
  
  // Alert Queries
  const unreadAlerts = useQuery({
    queryKey: ['unreadAlerts'],
    queryFn: dashboardAPI.getUnreadAlerts,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
  
  // Account Queries
  const myAccounts = useQuery({
    queryKey: ['myAccounts'],
    queryFn: dashboardAPI.getBankAccounts || accountAPI.getMyAccounts,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    enabled: !!localStorage.getItem('token'),
  });
  
  // Combined loading and error states
  const isLoading = 
    netWorth.isLoading || 
    savingsRate.isLoading || 
    financialHealth.isLoading ||
    recentTransactions.isLoading ||
    myAccounts.isLoading;
  
  const isError = 
    netWorth.isError || 
    savingsRate.isError || 
    financialHealth.isError ||
    recentTransactions.isError ||
    myAccounts.isError;
  
  // ✅ Refetch all function
  const refetchAll = () => {
    netWorth.refetch();
    netWorthTrend.refetch();
    savingsRate.refetch();
    savingsRateTrend.refetch();
    financialHealth.refetch();
    financialHealthScore.refetch();
    recentTransactions.refetch();
    currentBudgets.refetch();
    upcomingBills.refetch();
    unreadAlerts.refetch();
    myAccounts.refetch();
  };
  
  return {
    // Data
    netWorth: netWorth.data?.data,
    netWorthTrend: netWorthTrend.data?.data,
    savingsRate: savingsRate.data?.data,
    savingsRateTrend: savingsRateTrend.data?.data,
    financialHealth: financialHealth.data?.data,
    financialHealthScore: financialHealthScore.data?.data,
    recentTransactions: recentTransactions.data?.data,
    currentBudgets: currentBudgets.data,
    upcomingBills: upcomingBills.data?.data,
    unreadAlerts: unreadAlerts.data?.data,
    myAccounts: myAccounts.data?.data || [],
    
    // Loading states
    isLoading,
    isError,
    
    // Individual loading states
    isNetWorthLoading: netWorth.isLoading,
    isSavingsRateLoading: savingsRate.isLoading,
    isFinancialHealthLoading: financialHealth.isLoading,
    isTransactionsLoading: recentTransactions.isLoading,
    
    // Refetch functions
    refetchAll,
    refetchNetWorth: netWorth.refetch,
    refetchSavingsRate: savingsRate.refetch,
    refetchFinancialHealth: financialHealth.refetch,
    refetchTransactions: recentTransactions.refetch,
  };
};
