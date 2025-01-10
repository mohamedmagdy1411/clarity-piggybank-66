import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateTransactionSummary, suggestTransactionEdits } from "@/services/aiService";
import { Transaction } from "./RecentTransactions";
import { Textarea } from "@/components/ui/textarea";

export const AIAnalysis = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [aiText, setAiText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIProcess = async () => {
    if (!aiText.trim()) {
      toast({
        title: "Please enter a description of your transaction",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await suggestTransactionEdits({
        description: aiText,
        type: "expense",
        amount: "0",
        category: "",
      });
      
      toast({
        title: "AI Analysis",
        description: result.analysis,
        duration: 5000,
      });
      setAiText("");
    } catch (error) {
      toast({
        title: "Failed to analyze text",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">AI Analysis</h2>
      </div>

      {summary && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your transaction</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g.: I spent $25 on coffee today"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAIProcess}
              disabled={isProcessing}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};