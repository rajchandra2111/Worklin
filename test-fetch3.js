import dotenv from 'dotenv';
dotenv.config();
async function run() {
  for (const col of ['client_id', 'freelancer_id', 'target_id', 'receiver_id']) {
    const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/reviews?select=${col}&limit=1`, {
      headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
    });
    console.log(`Checking ${col}:`, res.status);
    if (res.status === 400) console.log(await res.text());
  }
}
run();
