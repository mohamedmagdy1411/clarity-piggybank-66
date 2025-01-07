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
} from "recharts";

export const FinancialOverview = () => {
  // Placeholder data - will be replaced with real data later
  const data = [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 3000, expenses: 1398 },
    { month: "Mar", income: 2000, expenses: 9800 },
    { month: "Apr", income: 2780, expenses: 3908 },
    { month: "May", income: 1890, expenses: 4800 },
    { month: "Jun", income: 2390, expenses: 3800 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Overview
        </h2>
        <div className="text-sm text-gray-500">Last 6 months</div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#666" }}
              tickLine={{ stroke: "#666" }}
            />
            <YAxis
              tick={{ fill: "#666" }}
              tickLine={{ stroke: "#666" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
              formatter={(value) => [`$${value}`, ""]}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="Income"
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};