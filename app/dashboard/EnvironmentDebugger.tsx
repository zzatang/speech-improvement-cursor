"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface EnvironmentDebuggerProps {
  onClose: () => void;
}

export default function EnvironmentDebugger({ onClose }: EnvironmentDebuggerProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Create a temporary Supabase client with the provided credentials
      const tempClient = supabase.auth.getSession;
      
      const testResponse = await fetch('/api/test-supabase-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, key })
      });
      
      const result = await testResponse.json();
      
      if (result.success) {
        setTestResult(`✅ Connection successful!`);
      } else {
        setTestResult(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Test error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // Save to localStorage as a temporary solution
    localStorage.setItem('supabase_manual_url', url);
    localStorage.setItem('supabase_manual_key', key);
    
    // Show message
    setTestResult('✅ Saved! Reloading page...');
    
    // Reload page after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '500px',
      width: '90%',
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>Supabase Connection Setup</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            fontSize: '1.25rem'
          }}
        >
          ✕
        </button>
      </div>
      
      <p style={{ marginBottom: '1rem', color: '#4B5563', fontSize: '0.875rem' }}>
        Enter your Supabase connection details to fix connection issues:
      </p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Supabase URL:
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-project-id.supabase.co"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #D1D5DB',
            fontSize: '0.875rem'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Supabase Anon Key:
        </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="your-anon-key"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #D1D5DB',
            fontSize: '0.875rem'
          }}
        />
      </div>
      
      {testResult && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          backgroundColor: testResult.startsWith('✅') ? '#ECFDF5' : '#FEF2F2',
          color: testResult.startsWith('✅') ? '#065F46' : '#B91C1C',
          fontSize: '0.875rem'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handleTest}
          disabled={isLoading || !url || !key}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#4B5563',
            color: 'white',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isLoading || !url || !key ? 'not-allowed' : 'pointer',
            opacity: isLoading || !url || !key ? 0.7 : 1
          }}
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading || !url || !key}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isLoading || !url || !key ? 'not-allowed' : 'pointer',
            opacity: isLoading || !url || !key ? 0.7 : 1
          }}
        >
          Save & Reload
        </button>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>Note:</strong> To permanently fix this, create a <code style={{ backgroundColor: '#F3F4F6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>.env.local</code> file in the project root with:
        </p>
        <pre style={{ 
          backgroundColor: '#F3F4F6', 
          padding: '0.5rem', 
          borderRadius: '0.25rem', 
          overflow: 'auto',
          fontSize: '0.75rem',
          marginTop: '0.5rem'
        }}>
          NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co{'\n'}
          NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
        </pre>
      </div>
    </div>
  );
} 