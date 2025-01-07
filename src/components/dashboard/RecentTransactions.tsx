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
      description: "Groceries",
      date: "2024-02-02",
    },
    {
      id: 3,
      type: "expense" as const,
      amount: 30,
      category: "Transport",
      description: "Fuel",
      date: "2024-02-03",
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h2>
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