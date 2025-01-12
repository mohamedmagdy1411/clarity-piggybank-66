import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface TransactionAIChatProps {
  onTransactionExtracted: (transaction: any) => void;
}

export const TransactionAIChat = ({ onTransactionExtracted }: TransactionAIChatProps) => {
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

      setExtractedTransactions(data);
      setMessage("");
      
      toast({
        title: `${data.length} transaction${data.length === 1 ? '' : 's'} extracted!`,
        description: "Click on a transaction to add it.",
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

  const handleTransactionClick = (transaction: any) => {
    onTransactionExtracted(transaction);
    setExtractedTransactions(prev => prev.filter(t => t !== transaction));
    toast({
      title: "Transaction selected",
      description: "You can now review and edit the details before saving.",
    });
  };

  return (
    <div className="space-y-4">
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
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <div className="space-y-2">
            {extractedTransactions.map((transaction, index) => (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleTransactionClick(transaction)}
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
  );
};