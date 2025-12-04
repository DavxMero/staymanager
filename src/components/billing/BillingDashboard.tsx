'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Banknote, 
  Wallet,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { formatCurrency as formatCurrencyCompat } from '@/lib/database-compatibility'
import Link from 'next/link'

interface BillingDashboardProps {
  totalRevenue: number
  pendingPayments: number
  overdueAmount: number
}

export function BillingDashboard({ 
  totalRevenue, 
  pendingPayments, 
  overdueAmount 
}: BillingDashboardProps) {
  const totalOutstanding = pendingPayments + overdueAmount
  const collectionRate = totalRevenue > 0 ? ((totalRevenue / (totalRevenue + totalOutstanding)) * 100) : 0

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "text-blue-600",
    bgColor = "bg-blue-50 dark:bg-blue-900/20",
    trend,
    subtitle,
    href,
    delay = 0
  }: any) => {
    const CardComponent = motion.div
    const content = (
      <Card className={`hover:shadow-lg transition-all duration-300 ${
        href ? 'cursor-pointer hover:scale-105' : ''
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center pt-1">
              {trend.startsWith('+') ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ml-1 ${
                trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    )

    const wrappedContent = (
      <CardComponent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {href ? <Link href={href}>{content}</Link> : content}
      </CardComponent>
    )

    return wrappedContent
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2"
      >
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Financial Overview
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrencyCompat(totalRevenue)}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
          trend="+12%"
          subtitle="Payments received"
          delay={0.1}
        />
        
        <StatCard
          title="Pending Payments"
          value={formatCurrencyCompat(pendingPayments)}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          subtitle="Awaiting payment"
          href="/billing/pending"
          delay={0.2}
        />
        
        <StatCard
          title="Overdue Amount"
          value={formatCurrencyCompat(overdueAmount)}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
          subtitle="Requires attention"
          trend={overdueAmount > 0 ? "+5%" : "0%"}
          delay={0.3}
        />
        
        <StatCard
          title="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          icon={Wallet}
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          subtitle="Payment success rate"
          trend={collectionRate > 80 ? "+2%" : "-1%"}
          delay={0.4}
        />
      </div>

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Banknote className="h-5 w-5 text-blue-600" />
              <span>Payment Status Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Paid</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {formatCurrencyCompat(totalRevenue)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Pending</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  {formatCurrencyCompat(pendingPayments)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Overdue</span>
                <Badge variant="outline" className="text-red-600 border-red-200">
                  {formatCurrencyCompat(overdueAmount)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 border-l pl-4">
                <span className="text-sm font-medium">Total Outstanding</span>
                <Badge variant="secondary">
                  {formatCurrencyCompat(totalOutstanding)}
                </Badge>
              </div>
            </div>
            
            {overdueAmount > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {formatCurrencyCompat(overdueAmount)} in overdue payments require immediate attention
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
