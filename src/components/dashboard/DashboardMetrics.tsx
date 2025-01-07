import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export const DashboardMetrics = () => {
  // Placeholder data - will be replaced with real data later
  const metrics = {
    income: 5000,
    expenses: 3500,
    balance: 1500,
    incomeChange: 10, // Percentage change from last month
    expenseChange: -5, // Percentage change from last month
  };

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