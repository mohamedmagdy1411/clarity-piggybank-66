import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT_TEMPLATE = `You are a helpful financial assistant. Extract ALL transaction details from the user's input.
Return a JSON array containing objects with these fields for EACH transaction mentioned:
- type: "income" or "expense"
- amount: number (extract just the number)
- category: string (one of: Salary, Shopping, Transport, Coffee, Rent)
- description: string (a brief description of the transaction)

Example input: "I spent $25 on coffee and then got $1000 salary payment"
Example output: [
  {
    "type": "expense",
    "amount": 25,
    "category": "Coffee",
    "description": "Coffee purchase"
  },
  {
    "type": "income",
    "amount": 1000,
    "category": "Salary",
    "description": "Salary payment"
  }
]`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Analyzing message:', message);

    const result = await model.generateContent([PROMPT_TEMPLATE, message]);
    const response = result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (!Array.isArray(parsedResponse)) {
      throw new Error('Failed to parse transaction details from AI response');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-transaction function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});