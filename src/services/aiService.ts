import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = "clarity_finance_transactions";

export interface AITransactionResult {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

export const processTransactionText = async (text: string): Promise<AITransactionResult> => {
  const apiKey = localStorage.getItem("GOOGLE_AI_KEY");
  if (!apiKey) {
    throw new Error("Google AI API key not found");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Parse the following text into a financial transaction. Extract:
    - Type (must be either "income" or "expense")
    - Amount (as a number)
    - Category (one of: Salary, Shopping, Transport, Coffee, Rent)
    - Description (a brief description)
    
    Text: "${text}"
    
    Respond in valid JSON format with these exact fields.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();
    return JSON.parse(jsonStr) as AITransactionResult;
  } catch (error) {
    console.error("Error processing transaction with AI:", error);
    throw new Error("Failed to process transaction text");
  }
};