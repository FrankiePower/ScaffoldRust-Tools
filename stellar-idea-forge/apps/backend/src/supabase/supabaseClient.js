import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
let supabase;

export const initializeSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Service Key are required');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized');
    return supabase;
};

export const getSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase not initialized. Call initializeSupabase first.');
    }
    return supabase;
};