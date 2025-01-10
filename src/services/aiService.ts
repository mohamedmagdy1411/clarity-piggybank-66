import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AITransactionResult {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

const getAIModel = () => {
  const apiKey = localStorage.getItem("GOOGLE_AI_KEY");
  if (!apiKey) {
    throw new Error("Google AI API key not found");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const processTransactionText = async (text: string): Promise<AITransactionResult> => {
  const model = getAIModel();

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

export const generateTransactionSummary = async (transactions: any[]): Promise<string> => {
  const model = getAIModel();
  
  const prompt = `
    Analyze these financial transactions and provide a brief summary of spending patterns and suggestions:
    ${JSON.stringify(transactions)}
    
    Focus on:
    1. Major expense categories
    2. Income vs expense patterns
    3. One practical suggestion for improvement
    
    Keep the response under 100 words.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
};

export const suggestTransactionEdits = async (transaction: any): Promise<AITransactionResult> => {
  const model = getAIModel();

  const prompt = `
    Review this financial transaction and suggest any improvements or corrections:
    ${JSON.stringify(transaction)}
    
    Provide suggestions in the same format:
    - Type (must be either "income" or "expense")
    - Amount (as a number)
    - Category (one of: Salary, Shopping, Transport, Coffee, Rent)
    - Description (a brief description)
    
    Respond in valid JSON format with these exact fields.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();
    return JSON.parse(jsonStr) as AITransactionResult;
  } catch (error) {
    console.error("Error suggesting edits:", error);
    throw new Error("Failed to suggest edits");
  }
};