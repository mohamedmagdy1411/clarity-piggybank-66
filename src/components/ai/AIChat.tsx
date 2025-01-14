import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const analyzeMessage = (message: string): Omit<Transaction, "id" | "date"> | null => {
  // Enhanced Arabic text analysis with more keywords and patterns
  const isExpense = message.includes("صرفت") || 
                   message.includes("اشتريت") || 
                   message.includes("دفعت") ||
                   message.includes("انفقت") ||
                   message.includes("خسرت") ||
                   message.includes("مصروف") ||
                   message.includes("مصاريف") ||
                   message.includes("تكلفة");
                   
  const isIncome = message.includes("استلمت") || 
                  message.includes("ربحت") || 
                  message.includes("دخل") ||
                  message.includes("راتب") ||
                  message.includes("مكافأة") ||
                  message.includes("ايراد") ||
                  message.includes("حصلت على") ||
                  message.includes("كسبت");

  // Extract amount using enhanced regex pattern
  const numberPattern = /\d+(\.\d+)?/g;
  const numbers = message.match(numberPattern);
  const amount = numbers ? Math.max(...numbers.map(n => parseFloat(n))) : 0;

  // Enhanced category detection
  let category = "أخرى";
  if (message.includes("طعام") || message.includes("مطعم") || message.includes("أكل") || message.includes("وجبة")) {
    category = "طعام";
  } else if (message.includes("مواصلات") || message.includes("سيارة") || message.includes("بنزين") || message.includes("تاكسي")) {
    category = "مواصلات";
  } else if (message.includes("راتب") || message.includes("معاش")) {
    category = "راتب";
  } else if (message.includes("تسوق") || message.includes("ملابس") || message.includes("شراء")) {
    category = "تسوق";
  } else if (message.includes("صحة") || message.includes("دواء") || message.includes("طبيب")) {
    category = "صحة";
  } else if (message.includes("ترفيه") || message.includes("سينما") || message.includes("رحلة")) {
    category = "ترفيه";
  }

  if (amount > 0) {
    return {
      type: isExpense ? "expense" : "income",
      amount: amount,
      category: category,
      description: message,
    };
  }

  return null;
};

export const AIChat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTransaction = async (transactionData: Omit<Transaction, "id" | "date">) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          date: new Date().toISOString().split('T')[0],
        }])
        .select();

      if (error) throw error;

      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: `${transactionData.type === "expense" ? "مصروف" : "دخل"}: ${
          transactionData.amount
        } جنيه - ${transactionData.category}`,
      });

      setMessages(prev => [...prev, 
        `تم إضافة ${transactionData.type === "expense" ? "مصروف" : "دخل"} بقيمة ${
          transactionData.amount
        } جنيه في فئة ${transactionData.category}`
      ]);

      window.dispatchEvent(new Event("transactionsUpdated"));

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
      if (analysis) {
        await addTransaction(analysis);
      } else {
        setMessages(prev => [...prev, "لم أتمكن من تحديد المبلغ في رسالتك. هل يمكنك ذكر المبلغ بشكل واضح؟ مثال: صرفت 50 جنيه على الطعام"]);
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