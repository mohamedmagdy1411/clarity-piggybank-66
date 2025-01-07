import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/forms/TransactionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const STORAGE_KEY = "clarity_finance_transactions";

export const RecentTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    null
  );

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Set default transactions if none exist
      const defaultTransactions = [
        {
          id: 1,
          type: "income",
          amount: 2500,
          category: "Salary",
          description: "Monthly Salary",
          date: "2024-02-01",
        },
        {
          id: 2,
          type: "expense",
          amount: 50,
          category: "Shopping",
          description: "Groceries at Whole Foods",
          date: "2024-02-02",
        },
      ];
      setTransactions(defaultTransactions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (data: any) => {
    const newTransaction = {
      id: Math.max(...transactions.map((t) => t.id), 0) + 1,
      ...data,
      amount: parseFloat(data.amount),
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleEditTransaction = (data: any) => {
    if (!selectedTransaction) return;
    const updatedTransactions = transactions.map((t) =>
      t.id === selectedTransaction.id
        ? {
            ...t,
            ...data,
            amount: parseFloat(data.amount),
          }
        : t
    );
    setTransactions(updatedTransactions);
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;
    const filteredTransactions = transactions.filter(
      (t) => t.id !== selectedTransaction.id
    );
    setTransactions(filteredTransactions);
    setIsDeleteDialogOpen(false);
    setSelectedTransaction(null);
    toast({
      title: "Transaction deleted successfully!",
      duration: 3000,
    });
  };

  const openEditForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Button
          onClick={() => {
            setSelectedTransaction(null);
            setIsFormOpen(true);
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            {...transaction}
            onEdit={() => openEditForm(transaction)}
            onDelete={() => openDeleteDialog(transaction)}
          />
        ))}
      </div>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedTransaction ? handleEditTransaction : handleAddTransaction}
        initialData={
          selectedTransaction
            ? {
                type: selectedTransaction.type,
                amount: selectedTransaction.amount.toString(),
                category: selectedTransaction.category,
                description: selectedTransaction.description,
              }
            : undefined
        }
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};