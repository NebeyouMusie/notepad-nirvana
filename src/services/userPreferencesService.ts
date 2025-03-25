
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface UserPreferences {
  primary_color: string;
  theme: "light" | "dark" | "system";
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  return data;
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // First check if the user already has preferences
  const { data: existingData } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  let result;
  
  if (existingData) {
    // Update existing preferences
    result = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  } else {
    // Insert new preferences
    result = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        ...preferences,
      });
  }
  
  if (result.error) {
    console.error('Error saving user preferences:', result.error);
    return false;
  }
  
  return true;
}
