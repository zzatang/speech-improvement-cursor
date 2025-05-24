"use client";

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/lib/supabase/services/settings-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/components/providers/supabase-auth-provider";
import { supabase } from "@/lib/supabase/client";
import { getUserProfile } from '@/lib/supabase/services/user-service';
import { getSupabaseWithAuth } from '@/lib/supabase/getSupabaseWithAuth';
import { CheckCircle } from 'lucide-react';

// Define the form values type for general settings
interface GeneralSettingsFormValues {
  appName: string;
  logoUrl: string;
  defaultLanguage: string;
  supportEmail: string;
}

// Mapping function to convert Supabase response to form values
function mapSettingsFromSupabase(data: any): GeneralSettingsFormValues {
  return {
    appName: data.app_name || '',
    logoUrl: data.logo_url || '',
    defaultLanguage: data.default_language || '',
    supportEmail: data.support_email || '',
  };
}

export default function AdminSettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GeneralSettingsFormValues>();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const isLoaded = !loading;
  const isSignedIn = !!user;

  // Fetch user profile from Supabase to get the role
  const {
    data: profileResult,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => user?.id ? getUserProfile(user.id) : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });

  const profile = profileResult?.data;
  const isAdmin = profile && ((profile as any).role === 'admin');

  // Always call the settings query, but only enable it for admins
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    enabled: !!isAdmin,
  });

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      reset(mapSettingsFromSupabase(settings));
    }
  }, [settings, reset]);

  // Save settings mutation
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async (values: GeneralSettingsFormValues) => {
      // Use regular supabase client since we're using Supabase Auth
      console.log("Using Supabase Auth client");
      const supabaseClient = supabase;
      return updateSettings(supabaseClient, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Settings saved!',
        description: 'Your changes have been successfully saved to the database.',
        variant: 'default',
        duration: 3000
      });
      setShowSuccess(true);
      // Hide success indicator after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (err) => {
      toast({
        title: 'Error saving settings',
        description: err instanceof Error ? err.message : 'Failed to save settings. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    },
  });

  // Track success state to show success indicator
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = (values: GeneralSettingsFormValues) => {
    console.log('Submitting values:', values);
    saveSettings(values);
  };

  // UI rendering logic
  if (!isLoaded || isProfileLoading) {
    return <div className="max-w-4xl mx-auto py-10 px-4">Loading...</div>;
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Admin Settings</h1>
        <div className="bg-white rounded-xl shadow p-8">
          <div className="text-red-600 font-semibold">Access denied. You do not have permission to view this page.</div>
        </div>
      </div>
    );
  }

  if (isSettingsLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Admin Settings</h1>
        <section className="mb-10">
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-xl font-bold mb-6 text-blue-700">General Settings</h2>
            <div className="space-y-6">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isSettingsError) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Admin Settings</h1>
        <section className="mb-10">
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-xl font-bold mb-6 text-blue-700">General Settings</h2>
            <div className="text-red-600 font-semibold">Error loading settings: {settingsError instanceof Error ? settingsError.message : 'Unknown error'}</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Admin Settings</h1>
      {/* General Settings Section */}
      <section className="mb-10">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold mb-6 text-blue-700">General Settings</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">App Name</label>
              <Input
                {...register('appName', { required: 'App name is required' })}
                placeholder="Speech Buddy"
                disabled={isSaving}
              />
              {errors.appName && <p className="text-red-600 text-xs mt-1">{errors.appName.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Logo URL</label>
              <Input
                {...register('logoUrl', { required: 'Logo URL is required' })}
                placeholder="https://example.com/logo.png"
                disabled={isSaving}
              />
              {errors.logoUrl && <p className="text-red-600 text-xs mt-1">{errors.logoUrl.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Default Language</label>
              <Input
                {...register('defaultLanguage', { required: 'Default language is required' })}
                placeholder="en-AU"
                disabled={isSaving}
              />
              {errors.defaultLanguage && <p className="text-red-600 text-xs mt-1">{errors.defaultLanguage.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Support Email</label>
              <Input
                {...register('supportEmail', {
                  required: 'Support email is required',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="support@speechbuddy.com"
                type="email"
                disabled={isSaving}
              />
              {errors.supportEmail && <p className="text-red-600 text-xs mt-1">{errors.supportEmail.message}</p>}
            </div>
            <div className="pt-2 flex gap-2">
              <Button type="submit" className="flex-1 relative" disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {showSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Saved!
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </div>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSaving}>
                Reset
              </Button>
            </div>
          </form>
        </div>
      </section>
      {/* TODO: Add more settings sections (User & Access, Security, etc.) */}
    </div>
  );
} 