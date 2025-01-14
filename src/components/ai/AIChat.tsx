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

const analyzeMessage = (message: string): Omit<Transaction, "id" | "date"> => {
  // Enhanced Arabic text analysis
  const isExpense = message.includes("صرفت") || 
                   message.includes("اشتريت") || 
                   message.includes("دفعت") ||
                   message.includes("انفقت") ||
                   message.includes("خسرت");
                   
  const isIncome = message.includes("استلمت") || 
                  message.includes("ربحت") || 
                  message.includes("دخل") ||
                  message.includes("راتب") ||
                  message.includes("مكافأة");

  // Extract amount using regex
  const numberMatch = message.match(/\d+(\.\d+)?/);
  const amount = numberMatch ? parseFloat(numberMatch[0]) : 0;

  // Determine category based on keywords
  let category = "أخرى";
  if (message.includes("طعام") || message.includes("مطعم") || message.includes("أكل")) {
    category = "طعام";
  } else if (message.includes("مواصلات") || message.includes("سيارة") || message.includes("بنزين")) {
    category = "مواصلات";
  } else if (message.includes("راتب")) {
    category = "راتب";
  } else if (message.includes("تسوق") || message.includes("ملابس")) {
    category = "تسوق";
  }

  return {
    type: (isExpense || !isIncome) ? "expense" : "income" as const,
    amount: amount,
    category: category,
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
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        ...transactionData,
        date: new Date().toISOString().split("T")[0],
      };
      
      // Add to beginning of array
      const updatedTransactions = [newTransaction, ...transactions];
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
      
      // Notify other components about the update
      window.dispatchEvent(new Event("transactionsUpdated"));

      // Show success message
      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: `${transactionData.type === "expense" ? "مصروف" : "دخل"}: ${
          transactionData.amount
        } جنيه - ${transactionData.category}`,
      });

      // Add system response
      setMessages(prev => [...prev, 
        `تم إضافة ${transactionData.type === "expense" ? "مصروف" : "دخل"} بقيمة ${
          transactionData.amount
        } جنيه في فئة ${transactionData.category}`
      ]);

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
      if (analysis.amount > 0) {
        addTransaction(analysis);
      } else {
        setMessages(prev => [...prev, "عذراً، لم أتمكن من فهم المبلغ في رسالتك. هل يمكنك إعادة صياغتها بشكل أوضح؟"]);
      }
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
      <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 p-2 rounded-lg ${
            index % 2 === 0 ? 'bg-primary/10 text-right' : 'bg-secondary/10'
          }`}>
            {msg}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب معاملتك المالية هنا... مثال: صرفت 50 جنيه على الطعام"
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