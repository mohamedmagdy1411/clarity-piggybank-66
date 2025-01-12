import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, action } = await req.json();
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY'));
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    if (action === "process") {
      const prompt = `
        Analyze this transaction description and extract the following information:
        - Type (income or expense)
        - Amount (just the number)
        - Category (must be one of: Salary, Shopping, Transport, Coffee, Rent)
        - Description (a clean, brief description)

        Important: 
        - If the text mentions transportation, bus, train, taxi, uber, or similar words, always categorize it as "Transport"
        - For amounts, extract only the number (e.g., from "$50" just return "50")
        - If no amount is found, return "0"
        - If no clear category is found, use "Shopping" as default

        Text to analyze: "${text}"

        Return ONLY a JSON object with these exact keys: type, amount, category, description
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const textResult = response.text();
      
      try {
        const jsonResult = JSON.parse(textResult);
        return new Response(
          JSON.stringify(jsonResult),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("Failed to parse AI response:", textResult);
        throw new Error("Invalid AI response format");
      }
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});