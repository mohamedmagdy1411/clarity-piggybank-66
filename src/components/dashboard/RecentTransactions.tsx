import { Card } from "@/components/ui/card";
import { TransactionCard } from "@/components/ui/TransactionCard";

export const RecentTransactions = () => {
  // Placeholder data - will be replaced with real data later
  const transactions = [
    {
      id: 1,
      type: "income" as const,
      amount: 2500,
      category: "Salary",
      description: "Monthly Salary",
      date: "2024-02-01",
    },
    {
      id: 2,
      type: "expense" as const,
      amount: 50,
      category: "Shopping",
      description: "Groceries at Whole Foods",
      date: "2024-02-02",
    },
    {
      id: 3,
      type: "expense" as const,
      amount: 30,
      category: "Transport",
      description: "Uber Ride",
      date: "2024-02-03",
    },
    {
      id: 4,
      type: "expense" as const,
      amount: 15,
      category: "Coffee",
      description: "Starbucks Coffee",
      date: "2024-02-03",
    },
    {
      id: 5,
      type: "expense" as const,
      amount: 800,
      category: "Rent",
      description: "Monthly Rent",
      date: "2024-02-01",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h2>
        <div className="text-sm text-primary hover:underline cursor-pointer">
          View All
        </div>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            type={transaction.type}
            amount={transaction.amount}
            category={transaction.category}
            description={transaction.description}
            date={transaction.date}
          />
        ))}
      </div>
    </Card>
  );
};