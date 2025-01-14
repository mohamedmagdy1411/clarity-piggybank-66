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

const convertToEnglishNumbers = (str: string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const hindiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let result = str;
  arabicNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, 'g'), idx.toString());
  });
  hindiNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, 'g'), idx.toString());
  });
  return result;
};

const analyzeMessage = (message: string): Omit<Transaction, "id" | "date"> | null => {
  // Convert any Arabic/Hindi numbers to English numbers first
  const normalizedMessage = convertToEnglishNumbers(message);
  
  const isExpense = normalizedMessage.includes("صرفت") || 
                   normalizedMessage.includes("اشتريت") || 
                   normalizedMessage.includes("دفعت") ||
                   normalizedMessage.includes("انفقت") ||
                   normalizedMessage.includes("خسرت") ||
                   normalizedMessage.includes("مصروف") ||
                   normalizedMessage.includes("مصاريف") ||
                   normalizedMessage.includes("تكلفة");
                   
  const isIncome = normalizedMessage.includes("استلمت") || 
                  normalizedMessage.includes("ربحت") || 
                  normalizedMessage.includes("دخل") ||
                  normalizedMessage.includes("راتب") ||
                  normalizedMessage.includes("مكافأة") ||
                  normalizedMessage.includes("ايراد") ||
                  normalizedMessage.includes("حصلت على") ||
                  normalizedMessage.includes("كسبت");

  // Extract amount using enhanced regex pattern that handles decimal numbers
  const numberPattern = /\d+(?:\.\d+)?/g;
  const numbers = normalizedMessage.match(numberPattern);
  const amount = numbers ? Math.max(...numbers.map(n => parseFloat(n))) : 0;

  // Enhanced category detection
  let category = "أخرى";
  if (normalizedMessage.includes("طعام") || normalizedMessage.includes("مطعم") || normalizedMessage.includes("أكل") || normalizedMessage.includes("وجبة")) {
    category = "طعام";
  } else if (normalizedMessage.includes("مواصلات") || normalizedMessage.includes("سيارة") || normalizedMessage.includes("بنزين") || normalizedMessage.includes("تاكسي")) {
    category = "مواصلات";
  } else if (normalizedMessage.includes("راتب") || normalizedMessage.includes("معاش")) {
    category = "راتب";
  } else if (normalizedMessage.includes("تسوق") || normalizedMessage.includes("ملابس") || normalizedMessage.includes("شراء")) {
    category = "تسوق";
  } else if (normalizedMessage.includes("صحة") || normalizedMessage.includes("دواء") || normalizedMessage.includes("طبيب")) {
    category = "صحة";
  } else if (normalizedMessage.includes("ترفيه") || normalizedMessage.includes("سينما") || normalizedMessage.includes("رحلة")) {
    category = "ترفيه";
  }

  if (amount > 0 && (isIncome || isExpense)) {
    return {
      type: isExpense ? "expense" : "income",
      amount: amount,
      category: category,
      description: normalizedMessage,
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

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

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

      // Trigger update of transactions list
      window.dispatchEvent(new Event("transactionsUpdated"));

    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "خطأ في إضافة المعاملة",
        description: "حدث خطأ أثناء حفظ المعاملة. يرجى المحاولة مرة أخرى.",
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
        setMessages(prev => [...prev, "لم أتمكن من تحديد المبلغ في رسالتك. هل يمكنك ذكر المبلغ بشكل واضح؟ مثال: صرفت ٥٠ جنيه على الطعام"]);
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
          placeholder="اكتب معاملتك المالية هنا... مثال: صرفت ٥٠ جنيه على الطعام"
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