import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  const defs = Object.keys(json.definitions || {}).find(k => k.includes('reviews'));
  console.log("Def key:", defs);
  if (defs) console.log(json.definitions[defs].properties);
}
run();
