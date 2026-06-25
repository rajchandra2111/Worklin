import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:client_profiles(full_name)')
    .eq('status', 'open');
    
  console.log("Browse Query Error:", error);
  console.log("Browse Data length:", data?.length);
}
check();
