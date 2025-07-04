// lib/supabase/services/settings-service.ts
// Service for managing global admin settings
// Expected Supabase table: app_settings

import { supabase, safeSupabaseCall } from '../client';

// Placeholder type for settings (to be refined)
export type AppSettings = {
  id?: string;
  appName?: string;
  logoUrl?: string;
  defaultLanguage?: string;
  supportEmail?: string;
  data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

// Fetch all settings from Supabase (assume single row for global settings)
export async function getSettings(): Promise<AppSettings | null> {
  const result = await safeSupabaseCall<AppSettings>(async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();
    return { data, error };
  });
  return result.data ?? null;
}

// Helper to map camelCase AppSettings to snake_case for Supabase
function mapSettingsToSupabase(data: Partial<AppSettings>) {
  const mapped = {
    app_name: data.appName,
    logo_url: data.logoUrl,
    default_language: data.defaultLanguage,
    support_email: data.supportEmail,
    data: data.data,
    updated_at: data.updated_at,
    created_at: data.created_at,
    id: data.id,
  };
  // Remove undefined values
  return Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
}

// Update settings in Supabase (update the first row)
export async function updateSettings(supabaseClient: any, newSettings: Partial<AppSettings>): Promise<void> {
  const result = await safeSupabaseCall<null>(async () => {
    // Fetch the first row
    const { data: existing, error: fetchError } = await supabaseClient
      .from('app_settings')
      .select('id')
      .limit(1)
      .single();
    
    if (fetchError) throw fetchError;
    if (!existing?.id) throw new Error('No settings row found');
    
    const updatePayload = { ...mapSettingsToSupabase(newSettings), updated_at: new Date().toISOString() };
    
    const { data: updateResult, error } = await supabaseClient
      .from('app_settings')
      .update(updatePayload)
      .eq('id', existing.id)
      .select();
    
    if (error) throw error;
    return { data: null, error: null };
  });
  return;
} 
