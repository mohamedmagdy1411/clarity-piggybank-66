import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TransactionAIChatProps {
  onTransactionExtracted: (transaction: any) => void;
}

export const TransactionAIChat = ({ onTransactionExtracted }: TransactionAIChatProps) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

      onTransactionExtracted(data);
      setMessage("");
      
      toast({
        title: "Transaction details extracted!",
        description: "You can now review and edit the details before saving.",
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your transaction... (e.g., 'Spent $25 on coffee')"
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
  );
};