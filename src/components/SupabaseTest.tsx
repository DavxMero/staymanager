'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Room {
  id: number
  number: string
  type: string
  price: number
  created_at?: string
}

export default function SupabaseTest() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus('testing')
      
      // Test basic connection first
      const { data: authData } = await supabase.auth.getSession()
      console.log('Auth status:', authData.session ? 'Authenticated' : 'Anonymous')
      
      // Try to fetch from rooms table (which should exist)
      const { data, error } = await supabase
        .from('rooms')
        .select('id, number, type, price, created_at')
        .order('number')
        .limit(5)
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }
      
      setRooms(data || [])
      setConnectionStatus('connected')
    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-50 border-green-200 text-green-700'
      case 'error': return 'bg-red-50 border-red-200 text-red-700'
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅'
      case 'error': return '❌'
      default: return '🔄'
    }
  }

  if (loading) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span>Testing Supabase connection...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={`p-4 border rounded ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <h3 className="font-semibold">
              Connection Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </h3>
          </div>
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-3 py-1 text-xs border rounded hover:bg-white/50 transition-colors"
          >
            Test Again
          </button>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-sm">
            <h4 className="font-medium text-red-800">Error Details:</h4>
            <p className="text-red-700 mt-1">{error}</p>
            <div className="mt-2 text-xs">
              <p className="font-medium">Possible solutions:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Check your Supabase credentials in .env.local</li>
                <li>Verify your project URL and API key</li>
                <li>Ensure RLS policies allow access to the rooms table</li>
                <li>Check if the rooms table exists in your database</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Sample Data Display */}
      {connectionStatus === 'connected' && (
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-3">Sample Data (Rooms Table)</h3>
          {rooms.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-gray-600">No rooms found in the database</p>
              <p className="text-sm text-gray-500 mt-1">
                This is normal if you haven't added any rooms yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Room {room.number}</span>
                      <span className="text-gray-500 ml-2">({room.type})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Rp {room.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
              {rooms.length >= 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Showing first 5 rooms only
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">🧪 Connection Test Info</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>✓ Tests database connectivity</p>
          <p>✓ Verifies authentication status</p>
          <p>✓ Checks table access permissions</p>
          <p>✓ Displays sample data from existing tables</p>
        </div>
      </div>
    </div>
  )
}