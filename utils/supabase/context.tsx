"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from "react";

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true';

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
    // In CI mode, skip the real Clerk session
    const { session: clerkSession, isLoaded: isClerkLoaded } = isCI 
        ? { session: null, isLoaded: true } // Mock session data in CI
        : useSession();
    
    const [isSupabaseReady, setIsSupabaseReady] = useState(false);

    // Initialize a client even without a session
    const supabase = useMemo(() => {
        // Check for environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing-url.supabase.co';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key';
        
        return createClient(
            supabaseUrl,
            supabaseKey,
            {
                global: {
                    fetch: async (url, options = {}) => {
                        // Only try to get token if session exists and not in CI
                        const clerkToken = !isCI && clerkSession ? await clerkSession.getToken({
                            template: 'supabase',
                        }) : null;

                        const headers = new Headers(options?.headers);
                        if (clerkToken) {
                            headers.set('Authorization', `Bearer ${clerkToken}`);
                        }

                        return fetch(url, {
                            ...options,
                            headers,
                        });
                    },
                },
            },
        );
    }, [clerkSession]);

    // Set up a debug effect to monitor the session state
    useEffect(() => {
        if (isCI) {
            // In CI mode, we're always ready
            setIsSupabaseReady(true);
        } else if (isClerkLoaded) {
            if (clerkSession) {
                clerkSession.getToken({ template: 'supabase' }).then(token => {
                    setIsSupabaseReady(true);
                }).catch(err => {
                    setIsSupabaseReady(true); // Still ready, just without auth
                });
            } else {
                setIsSupabaseReady(true); // Ready with anonymous access
            }
        }
    }, [clerkSession, isClerkLoaded]);

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
}

// Hook to use the Supabase client
export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}