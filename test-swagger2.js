import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  const keys = Object.keys(json.definitions || {});
  console.log("Tables:", keys);
  if (keys.includes('reviews')) {
    console.log(json.definitions['reviews'].properties);
  }
}
run();
