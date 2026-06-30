import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_schema');
  // Or simply trigger an error on reviews to see the columns
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/reviews?limit=1`, {
    headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
  });
  console.log(await res.json());
}
run();
