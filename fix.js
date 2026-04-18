const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data: txs } = await supabase.from('transactions').select('id, raw_text');
  if (!txs) return console.log('No txs');
  
  let count = 0;
  for (const t of txs) {
    if (t.raw_text && t.raw_text.includes('"DrCr":"Db"')) {
      await supabase.from('transactions').update({ type: 'debit' }).eq('id', t.id);
      count++;
    }
  }
  console.log('Fixed', count, 'transactions');
}
fix();
