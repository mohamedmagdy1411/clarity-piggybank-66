import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export const AIChat = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-transaction', {
        body: { message },
      });

      if (error) throw error;

      setExtractedTransactions(prev => [...prev, ...data]);
      setMessage("");
      
      toast({
        title: `${data.length} transaction${data.length === 1 ? '' : 's'} extracted!`,
        description: "Your transactions have been analyzed.",
      });
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      toast({
        title: "Error analyzing transaction",
        description: "Please try again with a different description.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">AI Transaction Assistant</h2>
        <p className="text-muted-foreground">
          Describe your transactions in natural language and I'll help you analyze them.
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your transactions... (e.g., 'Spent $25 on coffee and got $1000 salary')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </form>

        {extractedTransactions.length > 0 && (
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {extractedTransactions.map((transaction, index) => (
                <Card
                  key={index}
                  className="p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
};