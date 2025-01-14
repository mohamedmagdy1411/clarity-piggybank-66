import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
};

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

const numberMap = {
  // Arabic numbers
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  // Hindi numbers
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

const convertToEnglishNumbers = (text: string): string => {
  return text.replace(/[٠-٩۰-۹]/g, match => numberMap[match as keyof typeof numberMap] || match);
};

const extractAmount = (text: string): number | null => {
  const englishText = convertToEnglishNumbers(text);
  const matches = englishText.match(/\d+(?:\.\d+)?/g);
  if (!matches) return null;
  return Math.max(...matches.map(n => parseFloat(n)));
};

const analyzeTransaction = (text: string): Omit<Transaction, "id" | "date"> | null => {
  const normalizedText = text.trim().toLowerCase();
  
  // Detect transaction type
  const isExpense = /صرفت|اشتريت|دفعت|انفقت|خسرت|مصروف|مصاريف|تكلفة/.test(normalizedText);
  const isIncome = /استلمت|ربحت|دخل|راتب|مكافأة|ايراد|حصلت على|كسبت/.test(normalizedText);
  
  if (!isExpense && !isIncome) return null;
  
  // Extract amount
  const amount = extractAmount(normalizedText);
  if (!amount) return null;
  
  // Determine category
  let category = "أخرى";
  if (/طعام|مطعم|أكل|وجبة/.test(normalizedText)) category = "طعام";
  else if (/مواصلات|سيارة|بنزين|تاكسي/.test(normalizedText)) category = "مواصلات";
  else if (/راتب|معاش/.test(normalizedText)) category = "راتب";
  else if (/تسوق|ملابس|شراء/.test(normalizedText)) category = "تسوق";
  else if (/صحة|دواء|طبيب/.test(normalizedText)) category = "صحة";
  else if (/ترفيه|سينما|رحلة/.test(normalizedText)) category = "ترفيه";
  
  return {
    type: isExpense ? "expense" : "income",
    amount,
    category,
    description: text
  };
};

export const FinancialAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'مرحباً! أنا مساعدك المالي. كيف يمكنني مساعدتك اليوم؟',
    sender: 'assistant'
  }]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addTransaction = async (transaction: Omit<Transaction, "id" | "date">) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) throw error;

      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: `${transaction.type === "expense" ? "مصروف" : "دخل"}: ${
          transaction.amount
        } جنيه - ${transaction.category}`,
      });

      // Trigger update of transactions list
      window.dispatchEvent(new Event("transactionsUpdated"));

      return true;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "خطأ في إضافة المعاملة",
        description: "حدث خطأ أثناء حفظ المعاملة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    const userMessage = { id: Date.now().toString(), text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const transaction = analyzeTransaction(input);
      
      if (transaction) {
        const success = await addTransaction(transaction);
        if (success) {
          const responseText = `تم إضافة ${transaction.type === "expense" ? "مصروف" : "دخل"} بقيمة ${
            transaction.amount
          } جنيه في فئة ${transaction.category}`;
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'assistant'
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "عذراً، لم أتمكن من فهم المعاملة. هل يمكنك إعادة صياغتها؟ مثال: صرفت ٥٠ جنيه على الطعام",
          sender: 'assistant'
        }]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "خطأ في معالجة الرسالة",
        description: "حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 border-border/40 bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">المساعد المالي</h2>
      </div>
      <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-2 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-primary/10 text-right mr-8' 
                : 'bg-secondary/10 ml-8'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? "جاري المعالجة..." : "إرسال"}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب معاملتك المالية هنا... مثال: صرفت ٥٠ جنيه على الطعام"
          className="text-right"
          dir="rtl"
        />
      </form>
    </Card>
  );
};