import { supabase } from "@/integrations/supabase/client";

export interface AITransactionResult {
  type: "income" | "expense";
  category: string;
  description: string;
  analysis?: string;
}

const callAIFunction = async (action: string, data: any) => {
  const { data: functionData, error } = await supabase.functions.invoke('ai-finance', {
    body: { action, data }
  });

  if (error) throw error;
  return functionData.result;
};

export const processTransactionText = async (text: string): Promise<AITransactionResult> => {
  const result = await callAIFunction('analyze', { text });
  return JSON.parse(result);
};

export const generateTransactionSummary = async (transactions: any[]): Promise<string> => {
  return await callAIFunction('summarize', transactions);
};

export const suggestTransactionEdits = async (transaction: any): Promise<AITransactionResult> => {
  const result = await callAIFunction('analyze', transaction);
  return JSON.parse(result);
};