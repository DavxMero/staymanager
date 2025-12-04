'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getBadgeColor } from '@/lib/badge-colors'
import { 
  Database, 
  ExternalLink, 
  Play, 
  Settings, 
  Table, 
  Utensils,
  CreditCard,
  Users,
  Building,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

const databaseTools = [
  {
    title: 'Setup Food Items Table',
    description: 'Create and configure the food_items table for restaurant management',
    icon: Utensils,
    href: '/setup-food-items',
    status: 'available',
    category: 'Setup',
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
  },
  {
    title: 'Setup POS Database',
    description: 'Initialize Point of Sale database structure and configuration',
    icon: CreditCard,
    href: '/setup-pos-db',
    status: 'available',
    category: 'Setup',
    color: 'text-green-500 bg-green-100 dark:bg-green-900/20'
  }
]

const managementTools = [
  {
    title: 'Billing Management',
    description: 'View and manage all billing items and pending payments',
    icon: CreditCard,
    href: '/billing',
    status: 'ready',
    category: 'Management'
  },
  {
    title: 'Guest Management',
    description: 'Manage guest profiles and information',
    icon: Users,
    href: '/guests',
    status: 'ready',
    category: 'Management'
  },
  {
    title: 'Room Management', 
    description: 'Configure and manage hotel rooms',
    icon: Building,
    href: '/rooms',
    status: 'ready',
    category: 'Management'
  },
  {
    title: 'Pending Billing',
    description: 'Review and process pending billing items',
    icon: Clock,
    href: '/billing/pending',
    status: 'ready',
    category: 'Sub-pages'
  }
]

export default function DatabasePage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    // Simulate API call to check database status
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <Badge className={getBadgeColor('ready')}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'available':
        return (
          <Badge className={getBadgeColor('available')}>
            <Play className="h-3 w-3 mr-1" />
            Available
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database Tools</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Setup, manage, and configure your database structure
          </p>
        </div>
        <Button onClick={handleRefreshStatus} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </>
          )}
        </Button>
      </div>

      {/* Database Setup Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span>Database Setup</span>
          </CardTitle>
          <CardDescription>
            Initialize and configure database tables and structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {databaseTools.map((tool) => (
              <div key={tool.href} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color || 'text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
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

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Table className="h-5 w-5 text-purple-500" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Access core application data management features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementTools.map((tool) => (
              <div key={tool.href} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 bg-gray-100 dark:bg-gray-700">
                    <tool.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                      <Link href={tool.href}>
                        <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tables</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
              </div>
              <Table className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45MB</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Healthy</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}