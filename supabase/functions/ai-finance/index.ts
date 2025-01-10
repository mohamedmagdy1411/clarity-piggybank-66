import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY')!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { action, data } = await req.json();

    let prompt = '';
    let result = '';

    switch (action) {
      case 'analyze':
        prompt = `Analyze this financial transaction and suggest improvements or categorization:
          ${JSON.stringify(data)}
          
          Respond in this exact JSON format:
          {
            "type": "income" or "expense",
            "amount": "numeric value as string",
            "category": "one of: Salary, Bills, Shopping, Transport, Food, Entertainment, Other",
            "description": "a clear, brief description",
            "analysis": "2-3 sentences of financial advice based on this transaction"
          }`;
        break;

      case 'summarize':
        prompt = `Analyze these financial transactions and provide a brief summary:
          ${JSON.stringify(data)}
          
          Focus on:
          1. Total income vs expenses
          2. Main spending categories
          3. One practical suggestion for improvement
          
          Keep it under 100 words and make it friendly and encouraging.`;
        break;

      default:
        throw new Error('Invalid action');
    }

    const response = await model.generateContent(prompt);
    result = response.response.text();

    // If the response should be JSON, validate it
    if (action === 'analyze') {
      try {
        JSON.parse(result);
      } catch {
        throw new Error('Invalid AI response format');
      }
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});