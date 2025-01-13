import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Analyze this financial transaction description in Arabic and extract the following information:
    - Type (income/expense)
    - Amount (as a number)
    - Category (one of: Salary, Shopping, Transport, Coffee, Rent)
    - Description

    Message: "${message}"

    Respond in JSON format like this:
    {
      "transaction": {
        "type": "income" or "expense",
        "amount": number,
        "category": "category",
        "description": "description"
      }
    }

    Rules:
    - If it mentions "مرتب" or "راتب", categorize as "Salary"
    - If it mentions "اتخصم" or "دفعت", it's an expense
    - If amount is in Arabic numerals, convert to standard numbers
    - Default to "expense" if type is unclear
    - Choose the closest matching category
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response and validate
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
      
      // Basic validation
      if (!parsedResponse.transaction ||
          !["income", "expense"].includes(parsedResponse.transaction.type) ||
          typeof parsedResponse.transaction.amount !== "number" ||
          !parsedResponse.transaction.category ||
          !parsedResponse.transaction.description) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse transaction details");
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});