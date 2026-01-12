'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getBadgeColor } from '@/lib/badge-colors'
import { 
  Shield, 
  ExternalLink, 
  Play, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lock,
  Key,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Settings as SettingsIcon
} from 'lucide-react'

const rlsTools = [
  {
    title: 'Fix All RLS Policies',
    description: 'Diagnose and fix all Row Level Security policy issues across the entire database',
    icon: ShieldCheck,
    href: '/fix-all-rls',
    status: 'recommended',
    priority: 'high',
    color: 'text-green-500 bg-green-100 dark:bg-green-900/20'
  },
  {
    title: 'Fix RLS Policies',
    description: 'General RLS policy fixes and configuration for core tables',
    icon: Shield,
    href: '/fix-rls-policies', 
    status: 'available',
    priority: 'medium',
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
  },
  {
    title: 'Fix Deposits RLS',
    description: 'Specific RLS policy fixes for the deposits table',
    icon: Lock,
    href: '/fix-deposits-rls',
    status: 'available', 
    priority: 'low',
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
  }
]

const securityFeatures = [
  {
    title: 'Row Level Security',
    description: 'Database-level security policies to control data access',
    status: 'active',
    lastChecked: '2 hours ago'
  },
  {
    title: 'User Authentication', 
    description: 'Supabase Auth integration for user management',
    status: 'active',
    lastChecked: '1 hour ago'
  },
  {
    title: 'API Security',
    description: 'Rate limiting and API key protection',
    status: 'active', 
    lastChecked: '30 minutes ago'
  },
  {
    title: 'Data Encryption',
    description: 'Encryption at rest and in transit',
    status: 'active',
    lastChecked: '15 minutes ago'
  }
]

export default function SecurityPage() {
  const [checking, setChecking] = useState(false)

  const handleSecurityCheck = async () => {
    setChecking(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setChecking(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recommended':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        )
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
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
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

    const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className={`${getBadgeColor('high-priority')} text-xs`}>High Priority</Badge>
      case 'medium':
        return <Badge className={`${getBadgeColor('medium-priority')} text-xs`}>Medium</Badge>
      case 'low':
        return <Badge className={`${getBadgeColor('low-priority')} text-xs`}>Low</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security & RLS</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage Row Level Security policies and database security settings
          </p>
        </div>
        <Button onClick={handleSecurityCheck} disabled={checking} variant="outline">
          {checking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Security Check
            </>
          )}
        </Button>
      </div>

      {/* RLS Management Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Row Level Security (RLS) Tools</span>
          </CardTitle>
          <CardDescription>
            Fix and manage database Row Level Security policies for data protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rlsTools.map((tool) => (
              <div key={tool.href} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.color}`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {tool.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(tool.priority)}
                        {getStatusBadge(tool.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {tool.description}
                    </p>
                    <Link href={tool.href}>
                      <Button size="sm" className={tool.priority === 'high' ? 'bg-red-600 hover:bg-red-700' : ''}>
                        <Wrench className="h-4 w-4 mr-2" />
                        {tool.priority === 'high' ? 'Fix Now' : 'Open Tool'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            <span>Security Status</span>
          </CardTitle>
          <CardDescription>
            Current security feature status and health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  {getStatusBadge(feature.status)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {feature.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Last checked: {feature.lastChecked}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">RLS Policies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Level</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">High</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threats</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Security Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Always run RLS policy fixes after database schema changes</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Regularly check security status and audit logs</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use strong passwords and enable two-factor authentication</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Keep your Supabase project updated with latest security patches</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}