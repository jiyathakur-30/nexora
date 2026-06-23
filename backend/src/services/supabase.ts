import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
        }
    }
}
console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists =", !!process.env.SUPABASE_ANON_KEY);

export const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
);