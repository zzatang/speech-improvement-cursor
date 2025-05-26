"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function TestConnectionPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // For manual testing
  const [manualUrl, setManualUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true);
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        

        if (!url || !key) {
          throw new Error("Missing Supabase URL or key");
        }

        const supabase = createClient(url, key);
        const { data, error } = await supabase
          .from("user_profiles")
          .select('*', { count: 'exact', head: true });

                if (error) {          throw new Error(error.message || "Unknown database error");        }

        setResult(data);
            } catch (e) {        setError(e instanceof Error ? e.message : JSON.stringify(e, null, 2));      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);
  
  async function testManualConnection() {
    try {
      setManualLoading(true);
      setManualResult(null);
      setManualError(null);
      
      if (!manualUrl || !manualKey) {
        throw new Error("Please enter both URL and API key");
      }
      
      // Validate URL format
      if (!manualUrl.startsWith('https://') || !manualUrl.includes('.supabase.co')) {
        throw new Error("URL must be in format: https://something.supabase.co");
      }

      const supabase = createClient(manualUrl, manualKey);
      const { data, error } = await supabase
        .from("user_profiles")
        .select('*', { count: 'exact', head: true });

            if (error) {        throw new Error(error.message || "Unknown database error");      }

      setManualResult(data);
        } catch (e) {      setManualError(e instanceof Error ? e.message : JSON.stringify(e, null, 2));    } finally {
      setManualLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Environment Variables Test</h2>
        
        {loading && <p className="text-blue-600">Testing connection with environment variables...</p>}
        
        <div className="mb-4">
          <p className="font-medium">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 12) + "..." : 
            "Not found"}</p>
          <p className="font-medium">Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + "..." : 
            "Not found"}</p>
        </div>
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded">
            <h2 className="font-semibold">Error:</h2>
            <pre className="text-sm whitespace-pre-wrap overflow-auto">{error}</pre>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h2 className="font-semibold">Success!</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Manual Connection Test</h2>
        <p className="mb-4 text-sm">Try entering your Supabase URL and anon key manually:</p>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Supabase URL</label>
            <input 
              type="text" 
              value={manualUrl} 
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co" 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
            <input 
              type="text" 
              value={manualKey} 
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="your-anon-key" 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button 
            onClick={testManualConnection} 
            disabled={manualLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {manualLoading ? "Testing..." : "Test Connection"}
          </button>
        </div>
        
        {manualError && (
          <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded">
            <h2 className="font-semibold">Error:</h2>
            <pre className="text-sm whitespace-pre-wrap overflow-auto">{manualError}</pre>
          </div>
        )}
        
        {manualResult && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h2 className="font-semibold">Success!</h2>
            <pre className="text-sm">{JSON.stringify(manualResult, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 border rounded bg-yellow-50">
        <h2 className="font-semibold mb-2">Troubleshooting Tips:</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Ensure your Supabase URL is correct (format: https://your-project-id.supabase.co)</li>
          <li>Check that your anon key is the correct one from Project Settings {`>`} API</li>
          <li><strong>CORS Configuration:</strong> In your Supabase dashboard, go to Project Settings {`>`} API {`>`} CORS and add http://localhost:3000 to the allowed origins</li>
          <li>If using a VPN or proxy, try disabling it temporarily</li>
          <li>Check browser console (F12) for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
} 