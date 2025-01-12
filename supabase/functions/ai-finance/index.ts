import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    // Import Google AI dynamically to avoid Deno import issues
    const { GoogleGenerativeAI } = await import("npm:@google/generative-ai@0.1.3");
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY'));
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    if (action === "analyze" || action === "process") {
      const description = action === "analyze" ? data.text || data.description : data;
      
      const prompt = `
        Analyze this transaction description in any language (including Arabic) and extract the following information in JSON format:
        - Type (income or expense)
        - Amount (just the number)
        - Category (must be one of: Salary, Shopping, Transport, Coffee, Rent)
        - Description (a clean, brief description)
        - Analysis (a brief analysis of the transaction)

        Important: 
        - If the text mentions transportation, bus, train, taxi, uber, or similar words in any language, always categorize it as "Transport"
        - For amounts, extract only the number (e.g., from "50 جنيه" just return "50")
        - If no amount is found, return "0"
        - If no clear category is found, use "Shopping" as default
        - Support Arabic text like "صرفت 50 جنيه" or "دفعت 100 جنيه"

        Text to analyze: "${description}"

        Return ONLY a valid JSON object with these exact fields:
        {
          "type": "income|expense",
          "amount": "number as string",
          "category": "one of the allowed categories",
          "description": "cleaned description",
          "analysis": "brief analysis"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const textResult = response.text();
      
      console.log('AI Response:', textResult);

      try {
        // Try to parse the AI response as JSON
        const jsonResult = JSON.parse(textResult.trim());
        
        // Validate required fields and types
        const requiredFields = ['type', 'amount', 'category', 'description', 'analysis'];
        const missingFields = requiredFields.filter(field => !(field in jsonResult));
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate type field
        if (!['income', 'expense'].includes(jsonResult.type)) {
          throw new Error('Invalid type value. Must be "income" or "expense"');
        }

        // Validate category field
        const validCategories = ['Salary', 'Shopping', 'Transport', 'Coffee', 'Rent'];
        if (!validCategories.includes(jsonResult.category)) {
          jsonResult.category = 'Shopping'; // Default to Shopping if invalid
        }

        // Ensure amount is a string
        jsonResult.amount = String(jsonResult.amount);

        return new Response(
          JSON.stringify({ result: JSON.stringify(jsonResult) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("Failed to parse AI response:", textResult);
        console.error("Parse error:", e);
        throw new Error(`Invalid AI response format: ${e.message}`);
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