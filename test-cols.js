import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
     console.error("Error:", error);
  } else {
     // Trigger an intentional error to see the message or use postgrest options
  }
}
run();
