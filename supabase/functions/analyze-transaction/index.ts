import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const PROMPT_TEMPLATE = `You are a helpful financial assistant that can understand both English and Arabic. Extract ALL transaction details from the user's input.
Return a JSON array containing objects with these fields for EACH transaction mentioned:
- type: "income" or "expense"
- amount: number (extract just the number)
- category: string (one of: Salary, Shopping, Transport, Coffee, Rent)
- description: string (a brief description of the transaction)

Handle Arabic text like "اتخصم من مرتبي ٥٠٠ جنيه" or "صرفت ٢٠٠ جنيه على القهوة"
Convert Arabic numbers (٠١٢٣٤٥٦٧٨٩) to regular numbers if present.

Example Arabic input: "اتخصم من مرتبي ٥٠٠ جنيه"
Example output: [
  {
    "type": "expense",
    "amount": 500,
    "category": "Salary",
    "description": "خصم من المرتب"
  }
]

Example English input: "spent $25 on coffee"
Example output: [
  {
    "type": "expense",
    "amount": 25,
    "category": "Coffee",
    "description": "Coffee purchase"
  }
]`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    // Mock AI response for testing
    const transactions = []
    
    if (message.includes('مرتب') || message.includes('salary')) {
      const amount = message.match(/\d+/)?.[0] || '0'
      transactions.push({
        type: message.includes('اتخصم') ? 'expense' : 'income',
        amount: parseInt(amount),
        category: 'Salary',
        description: message.includes('اتخصم') ? 'خصم من المرتب' : 'دخل المرتب'
      })
    }

    if (message.includes('قهوة') || message.includes('coffee')) {
      const amount = message.match(/\d+/)?.[0] || '0'
      transactions.push({
        type: 'expense',
        amount: parseInt(amount),
        category: 'Coffee',
        description: 'مصروف قهوة'
      })
    }

    return new Response(JSON.stringify(transactions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})