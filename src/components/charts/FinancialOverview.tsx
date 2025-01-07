import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#84CC16'];

export const FinancialOverview = () => {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const calculateData = () => {
      const savedTransactions = localStorage.getItem("clarity_finance_transactions");
      if (!savedTransactions) {
        setMonthlyData([]);
        setCategoryData([]);
        return;
      }

      const transactions: Transaction[] = JSON.parse(savedTransactions);

      // Process monthly data
      const monthlyTotals = transactions.reduce((acc: any, transaction) => {
        const date = new Date(transaction.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        if (!acc[monthYear]) {
          acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
        }
        
        if (transaction.type === 'income') {
          acc[monthYear].income += transaction.amount;
        } else {
          acc[monthYear].expenses += transaction.amount;
        }
        
        return acc;
      }, {});

      // Process category data (expenses only)
      const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: any, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = { name: transaction.category, value: 0 };
          }
          acc[transaction.category].value += transaction.amount;
          return acc;
        }, {});

      setMonthlyData(Object.values(monthlyTotals));
      setCategoryData(Object.values(categoryTotals));
    };

    calculateData();

    const handleTransactionsUpdate = () => {
      calculateData();
    };

    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/40 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Financial Overview
          </h2>
          <div className="text-sm text-muted-foreground">Monthly Summary</div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--foreground))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--foreground))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value) => [`$${value}`, ""]}
              />
              <Legend />
              <Bar
                dataKey="income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Income"
              />
              <Bar
                dataKey="expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 border-border/40 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Expense Categories
          </h2>
          <div className="text-sm text-muted-foreground">Distribution</div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value}`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};