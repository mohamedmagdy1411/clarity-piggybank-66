import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Transaction } from "./RecentTransactions";

const STORAGE_KEY = "clarity_finance_transactions";

export const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
  });

  const calculateMetrics = () => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (!savedTransactions) return;

    const transactions: Transaction[] = JSON.parse(savedTransactions);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth;
    });

    // Previous month transactions
    const previousMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === previousMonth;
    });

    // Calculate current month totals
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate previous month totals
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate percentage changes
    const incomeChange = previousIncome === 0 
      ? 100 
      : Math.round(((currentIncome - previousIncome) / previousIncome) * 100);

    const expenseChange = previousExpenses === 0 
      ? 100 
      : Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100);

    setMetrics({
      income: currentIncome,
      expenses: currentExpenses,
      balance: currentIncome - currentExpenses,
      incomeChange,
      expenseChange,
    });
  };

  useEffect(() => {
    // Initial calculation
    calculateMetrics();

    // Listen for storage changes
    const handleStorageChange = () => {
      calculateMetrics();
    };

    // Listen for custom event for local updates
    const handleTransactionsUpdate = () => {
      calculateMetrics();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <h3 className="text-2xl font-bold text-income mt-1">
              ${metrics.income.toLocaleString()}
            </h3>
            <p className="text-xs text-income mt-1 flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              {metrics.incomeChange}% from last month
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-income/10 flex items-center justify-center">
            <ArrowUpIcon className="h-6 w-6 text-income" />
          </div>
        </div>
      </Card>

      <Card className="p-6 animate-fade-in [animation-delay:150ms]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <h3 className="text-2xl font-bold text-expense mt-1">
              ${metrics.expenses.toLocaleString()}
            </h3>
            <p className="text-xs text-expense mt-1 flex items-center">
              <ArrowDownIcon className="h-3 w-3 mr-1" />
              {Math.abs(metrics.expenseChange)}% from last month
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-expense/10 flex items-center justify-center">
            <ArrowDownIcon className="h-6 w-6 text-expense" />
          </div>
        </div>
      </Card>

      <Card className="p-6 animate-fade-in [animation-delay:300ms]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <h3 className={cn(
              "text-2xl font-bold mt-1",
              metrics.balance >= 0 ? "text-income" : "text-expense"
            )}>
              ${Math.abs(metrics.balance).toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Current Month</p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            metrics.balance >= 0 ? "bg-income/10" : "bg-expense/10"
          )}>
            <DollarSign className={cn(
              "h-6 w-6",
              metrics.balance >= 0 ? "text-income" : "text-expense"
            )} />
          </div>
        </div>
      </Card>
    </div>
  );
};