import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const AIChat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeTransaction = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-transaction', {
        body: { message }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      throw error;
    }
  };

  const addTransaction = async (transactionData: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.user.id,
          type: transactionData.type,
          amount: parseFloat(transactionData.amount),
          category: transactionData.category,
          description: transactionData.description,
          date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

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
      const analysis = await analyzeTransaction(input);
      if (analysis && analysis.transaction) {
        await addTransaction(analysis.transaction);
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