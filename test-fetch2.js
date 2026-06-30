import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/reviews?select=*&client_id=eq.01322979-91dc-4e36-90e1-9255f4c810d9&order=created_at.desc`, {
    headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
  });
  console.log("Status:", res.status);
  console.log(await res.text());
}
run();
