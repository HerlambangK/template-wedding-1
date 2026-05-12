import { createClient } from "./server";

export async function ensureProfileExists(userId: string, email?: string) {
  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: email || "",
      full_name: email?.split("@")[0] || null,
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  return newProfile;
}
