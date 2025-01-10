import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";
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
import { generateTransactionSummary, suggestTransactionEdits } from "@/services/aiService";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const STORAGE_KEY = "clarity_finance_transactions";

const notifyTransactionUpdate = () => {
  window.dispatchEvent(new Event('transactionsUpdated'));
};

export const RecentTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    notifyTransactionUpdate();
  }, [transactions]);

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
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

  const analyzeTransaction = async (transaction: Transaction) => {
    setIsAnalyzing(true);
    try {
      const suggestion = await suggestTransactionEdits(transaction);
      setSelectedTransaction({
        ...transaction,
        type: suggestion.type,
        category: suggestion.category,
        description: suggestion.description,
      });
      setIsFormOpen(true);
      toast({
        title: "AI Analysis",
        description: suggestion.analysis,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Failed to analyze transaction",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summaryText = await generateTransactionSummary(transactions);
      setSummary(summaryText);
    } catch (error) {
      toast({
        title: "Failed to generate summary",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      generateSummary();
    }
  }, [transactions]);

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

      {summary && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      )}

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            {...transaction}
            onEdit={() => openEditForm(transaction)}
            onDelete={() => openDeleteDialog(transaction)}
            onAnalyze={() => analyzeTransaction(transaction)}
            isAnalyzing={isAnalyzing}
          />
        ))}
      </div>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedTransaction ? handleEditTransaction : handleAddTransaction}
        initialData={selectedTransaction ? {
          type: selectedTransaction.type,
          amount: selectedTransaction.amount.toString(),
          category: selectedTransaction.category,
          description: selectedTransaction.description,
        } : undefined}
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