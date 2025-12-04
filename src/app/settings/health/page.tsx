'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  ExternalLink, 
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TestTube,
  Database,
  Server,
  Zap,
  Wifi,
  HardDrive,
  Cpu,
  BarChart3
} from 'lucide-react'

const testingTools = [
  {
    title: 'Supabase Connection Test',
    description: 'Test database connectivity and authentication',
    icon: Database,
    href: '/supabase-test',
    status: 'available',
    category: 'Database',
    color: 'text-green-500 bg-green-100 dark:bg-green-900/20'
  }
]

const healthMetrics = [
  {
    title: 'Database Connection',
    status: 'healthy',
    value: '< 50ms',
    description: 'Average response time',
    icon: Database
  },
  {
    title: 'API Response Time',
    status: 'healthy',
    value: '120ms',
    description: 'Average API latency',
    icon: Server
  },
  {
    title: 'Memory Usage',
    status: 'warning',
    value: '78%',
    description: 'Current memory utilization',
    icon: Cpu
  },
  {
    title: 'Storage Space',
    status: 'healthy',
    value: '45GB',
    description: 'Available disk space',
    icon: HardDrive
  }
]

const systemStatus = [
  {
    service: 'Web Application',
    status: 'operational',
    uptime: '99.9%',
    lastChecked: '1 min ago'
  },
  {
    service: 'Database',
    status: 'operational', 
    uptime: '99.8%',
    lastChecked: '2 min ago'
  },
  {
    service: 'Authentication',
    status: 'operational',
    uptime: '100%',
    lastChecked: '30 sec ago'
  },
  {
    service: 'File Storage',
    status: 'maintenance',
    uptime: '98.5%',
    lastChecked: '5 min ago'
  }
]

export default function HealthPage() {
  const [testing, setTesting] = useState(false)
  const [lastHealthCheck, setLastHealthCheck] = useState('2 minutes ago')

  const handleRunHealthCheck = async () => {
    setTesting(true)
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 3000))
    setLastHealthCheck('Just now')
    setTesting(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === 'healthy' ? 'Healthy' : 'Operational'}
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      case 'maintenance':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <RefreshCw className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        )
      case 'available':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Play className="h-3 w-3 mr-1" />
            Available
          </Badge>
        )
      default:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
    }
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Health</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor system performance and run diagnostic tests
          </p>
        </div>
        <Button onClick={handleRunHealthCheck} disabled={testing}>
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Run Health Check
            </>
          )}
        </Button>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-6 w-6 text-gray-400" />
                {getStatusBadge(metric.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className={`text-xl font-bold ${getMetricColor(metric.status)}`}>{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testing Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-purple-500" />
            <span>System Testing</span>
          </CardTitle>
          <CardDescription>
            Run diagnostic tests and system health checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testingTools.map((tool) => (
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
                        Run Test
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-500" />
            <span>Service Status</span>
          </CardTitle>
          <CardDescription>
            Current status of all system services and components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.service}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Uptime: {service.uptime} • Last checked: {service.lastChecked}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">Good</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Throughput</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Excellent</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">Low</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled={testing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Services
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>System Health Summary</span>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Healthy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>All critical services are operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Database connectivity is stable</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Memory usage is approaching 80% - monitor closely</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No critical errors detected in the last 24 hours</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Last health check: {lastHealthCheck}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}