import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const STORAGE_KEY = "clarity_finance_transactions";

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const analyzeMessage = (message: string) => {
  // Simple analysis of Arabic text
  const isExpense = message.includes("صرفت") || message.includes("اشتريت") || message.includes("دفعت");
  const amount = parseFloat(message.replace(/[^\d.]/g, ""));
  
  return {
    type: isExpense ? "expense" : "income",
    amount: amount || 0,
    category: isExpense ? "Shopping" : "Income",
    description: message,
  };
};

export const AIChat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTransaction = (transactionData: Omit<Transaction, "id" | "date">) => {
    try {
      // Get existing transactions
      const savedTransactions = localStorage.getItem(STORAGE_KEY);
      const transactions: Transaction[] = savedTransactions ? JSON.parse(savedTransactions) : [];
      
      // Create new transaction
      const newTransaction: Transaction = {
        id: Math.max(...transactions.map(t => t.id), 0) + 1,
        ...transactionData,
        date: new Date().toISOString().split("T")[0],
      };
      
      // Add to beginning of array
      const updatedTransactions = [newTransaction, ...transactions];
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
      
      // Notify other components about the update
      window.dispatchEvent(new Event("transactionsUpdated"));

      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: `${transactionData.type === "expense" ? "مصروف" : "دخل"}: ${
          transactionData.amount
        } جنيه`,
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "خطأ في إضافة المعاملة",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, input]);
    
    try {
      const analysis = analyzeMessage(input);
      addTransaction(analysis);
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "خطأ في معالجة الرسالة",
        description: "حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <Card className="p-6 border-border/40 bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">المساعد المالي</h2>
      </div>
      <ScrollArea className="h-[200px] mb-4 p-4 border rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 text-right">
            {msg}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب معاملتك المالية هنا..."
          className="text-right"
          dir="rtl"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري المعالجة..." : "إرسال"}
        </Button>
      </form>
    </Card>
  );
};