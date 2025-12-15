import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://akdehihockgpntxmcpdk.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZGVoaWhvY2tncG50eG1jcGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NTk2NTcsImV4cCI6MjA4MTMzNTY1N30.H9OuxZFPJKWSPNUIxcvOb4lPQIjB0LKWVMFlvtJlzHA";

console.log("URL:", supabaseUrl); // Check in browser console
console.log("Key:", supabaseAnonKey); // Should show full values

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
