"use client"

import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
    return (
        <SupabaseContext.Provider value={supabase as SupabaseClient}>
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