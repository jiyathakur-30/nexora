import { supabase } from "./supabase";

export async function saveResumeAnalysis(data: any) {
  const { data: result, error } = await supabase
    .from("resumes")
    .insert([data])
    .select();

  if (error) throw error;

  return result;
}