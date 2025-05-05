"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from "react";

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
    const { session, isLoaded: isClerkLoaded } = useSession();
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
                        // Only try to get token if session exists
                        const clerkToken = session ? await session.getToken({
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
    }, [session]);

    // Set up a debug effect to monitor the session state
    useEffect(() => {
        if (isClerkLoaded) {
            if (session) {
                session.getToken({ template: 'supabase' }).then(token => {
                    setIsSupabaseReady(true);
                }).catch(err => {
                    setIsSupabaseReady(true); // Still ready, just without auth
                });
            } else {
                setIsSupabaseReady(true); // Ready with anonymous access
            }
        }
    }, [session, isClerkLoaded]);

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