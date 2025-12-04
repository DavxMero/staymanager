'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    envVars: {
      urlSet: false,
      keySet: false,
    },
    connection: {
      status: 'unknown',
      error: null as string | null,
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setLoading(true)
        
        // Check environment variables
        const urlSet = !!(process.env.NEXT_PUBLIC_SUPABASE_URL)
        const keySet = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        
        // Test basic connection by trying to get session
        const { error } = await supabase.auth.getSession()
        
        setDiagnostics({
          envVars: {
            urlSet,
            keySet,
          },
          connection: {
            status: error ? 'Failed' : 'Success',
            error: error?.message || null,
          }
        })
      } catch (err) {
        console.error('Diagnostics error:', err)
        setDiagnostics({
          envVars: {
            urlSet: !!(process.env.NEXT_PUBLIC_SUPABASE_URL),
            keySet: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          },
          connection: {
            status: 'Failed',
            error: err instanceof Error ? err.message : 'Unknown error',
          }
        })
      } finally {
        setLoading(false)
      }
    }

    runDiagnostics()
  }, [])

  if (loading) return <div className="p-4">Running diagnostics...</div>

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Supabase Diagnostics</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Environment Variables:</h3>
        <div className="ml-4">
          <p className={diagnostics.envVars.urlSet ? 'text-green-600' : 'text-red-600'}>
            NEXT_PUBLIC_SUPABASE_URL: {diagnostics.envVars.urlSet ? '✓ Set' : '✗ Not set'}
          </p>
          <p className={diagnostics.envVars.keySet ? 'text-green-600' : 'text-red-600'}>
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {diagnostics.envVars.keySet ? '✓ Set' : '✗ Not set'}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">Connection Test:</h3>
        <p className={diagnostics.connection.status === 'Success' ? 'text-green-600' : 'text-red-600'}>
          Status: {diagnostics.connection.status}
        </p>
        {diagnostics.connection.error && (
          <p className="text-red-600 mt-1">Error: {diagnostics.connection.error}</p>
        )}
      </div>
      
      <div className="p-3 bg-blue-50 rounded">
        <h4 className="font-semibold mb-2">Next Steps:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>{diagnostics.envVars.urlSet && diagnostics.envVars.keySet ? '✓' : '✗'} Ensure both environment variables are set correctly in .env.local</li>
          <li>{diagnostics.connection.status === 'Success' ? '✓' : '✗'} If connection fails, verify your Supabase credentials</li>
          <li>Create a &#39;test_items&#39; table in your Supabase dashboard if it doesn&#39;t exist</li>
        </ul>
      </div>
    </div>
  )
}