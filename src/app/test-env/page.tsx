'use client';

import { useEffect } from 'react';

export default function TestEnvPage() {
  useEffect(() => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  return (
    <div className="p-4">
      <h1>Environment Variables Test</h1>
      <p>Check the browser console to see if environment variables are loaded.</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'}<br/>
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '****' : 'not set'}
      </pre>
    </div>
  );
} 