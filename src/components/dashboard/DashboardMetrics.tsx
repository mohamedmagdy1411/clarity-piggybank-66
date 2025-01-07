import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";

export const DashboardMetrics = () => {
  // Placeholder data - will be replaced with real data later
  const metrics = {
    income: 5000,
    expenses: 3500,
    balance: 1500,
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
            <h3 className="text-2xl font-bold text-primary mt-1">
              ${metrics.balance.toLocaleString()}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
};