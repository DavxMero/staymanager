'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Bug, 
  ExternalLink, 
  Play,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Terminal,
  FileText,
  Wrench,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react'

const debuggingTools = [
  {
    title: 'Debug Error Handler',
    description: 'General error debugging and system diagnostics',
    icon: Bug,
    href: '/debug-error',
    status: 'available',
    category: 'Debug',
    color: 'text-red-500 bg-red-100 dark:bg-red-900/20'
  },
  {
    title: 'Debug Food Items',
    description: 'Specific debugging for food items and restaurant features',
    icon: Utensils,
    href: '/debug-food-items',
    status: 'available',
    category: 'Debug',
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
  }
]

const developmentFeatures = [
  {
    title: 'Debug Mode',
    description: 'Enable detailed logging and error reporting',
    enabled: true,
    toggle: true
  },
  {
    title: 'Hot Reload',
    description: 'Automatic page refresh on code changes',
    enabled: true,
    toggle: false
  },
  {
    title: 'Source Maps',
    description: 'Enable source maps for better debugging',
    enabled: true,
    toggle: false
  },
  {
    title: 'Error Boundary',
    description: 'Catch and display React errors gracefully',
    enabled: true,
    toggle: false
  }
]

const logs = [
  {
    type: 'info',
    message: 'Application started successfully',
    time: '2 minutes ago'
  },
  {
    type: 'warning', 
    message: 'Food items table not found, using fallback',
    time: '5 minutes ago'
  },
  {
    type: 'error',
    message: 'RLS policy violation in guests table',
    time: '15 minutes ago'
  },
  {
    type: 'info',
    message: 'Database connection established',
    time: '1 hour ago'
  }
]

// Import missing icon
import { Utensils } from 'lucide-react'

export default function DevelopmentPage() {
  const [debugMode, setDebugMode] = useState(true)
  const [clearing, setClearing] = useState(false)

  const handleClearLogs = async () => {
    setClearing(true)
    // Simulate clearing logs
    await new Promise(resolve => setTimeout(resolve, 1500))
    setClearing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Play className="h-3 w-3 mr-1" />
            Available
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <SettingsIcon className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Development Tools</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Debug, monitor, and develop your application
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={debugMode ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
            <Code className="h-3 w-3 mr-1" />
            {debugMode ? 'Debug Mode' : 'Production'}
          </Badge>
        </div>
      </div>

      {/* Debugging Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-red-500" />
            <span>Debugging Tools</span>
          </CardTitle>
          <CardDescription>
            Tools for debugging and diagnosing application issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debuggingTools.map((tool) => (
              <div key={tool.href} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {tool.title}
                      </h3>
                      {getStatusBadge(tool.status)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {tool.description}
                    </p>
                    <Link href={tool.href}>
                      <Button size="sm" variant="outline" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Tool
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Development Features</span>
          </CardTitle>
          <CardDescription>
            Current development mode settings and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developmentFeatures.map((feature) => (
              <div key={feature.title} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
                <Badge className={feature.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
                  {feature.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-green-500" />
              <CardTitle>System Logs</CardTitle>
            </div>
            <Button onClick={handleClearLogs} disabled={clearing} size="sm" variant="outline">
              {clearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Clear Logs
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Recent system events and error messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className={`border-l-4 p-3 rounded-lg ${getLogColor(log.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getLogIcon(log.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">8</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Build Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bundle Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2MB</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}