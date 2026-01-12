'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Banknote, 
  Wallet,
  QrCode,
  Smartphone,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency as formatCurrencyCompat } from '@/lib/database-compatibility'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Pay with Visa, Mastercard, or other credit cards'
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: <Banknote className="h-5 w-5" />,
    description: 'Direct bank transfer from your account'
  },
  {
    id: 'e-wallet',
    name: 'E-Wallet',
    icon: <Wallet className="h-5 w-5" />,
    description: 'Pay with popular digital wallets'
  },
  {
    id: 'qr-payment',
    name: 'QR Payment',
    icon: <QrCode className="h-5 w-5" />,
    description: 'Scan QR code to complete payment'
  },
  {
    id: 'mobile-payment',
    name: 'Mobile Payment',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Pay using your mobile device'
  }
]

export function PaymentProcessing({ 
  amount, 
  onPaymentComplete,
  onBack
}: { 
  amount: number
  onPaymentComplete: (method: string) => void
  onBack: () => void
}) {
  const [selectedMethod, setSelectedMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const handleProcessPayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentComplete(true)
      onPaymentComplete(selectedMethod)
    }, 2000)
  }

  if (paymentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-center mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground text-center mb-6">
          Your payment of {formatCurrencyCompat(amount)} has been processed successfully.
        </p>
        <Button onClick={onBack}>Back to Billing</Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Process Payment</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === method.id 
                      ? 'border-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-muted rounded-lg">
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Amount Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount to Pay</span>
                  <span className="text-2xl font-bold">{formatCurrencyCompat(amount)}</span>
                </div>
              </div>

              {/* Payment Form */}
              {selectedMethod === 'credit-card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-holder">Cardholder Name</Label>
                      <Input id="card-holder" placeholder="John Doe" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'bank-transfer' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <select id="bank" className="w-full p-2 border rounded-md bg-background">
                      <option>Select your bank</option>
                      <option>Bank Mandiri</option>
                      <option>BCA</option>
                      <option>BNI</option>
                      <option>BRI</option>
                    </select>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Transfer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Account Number:</span>
                        <span className="font-mono">1234 5678 9012 3456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Name:</span>
                        <span>StayManager Payments</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">{formatCurrencyCompat(amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'e-wallet' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <span>OVO</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <div className="bg-green-500 rounded-full p-2">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <span>DANA</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <div className="bg-blue-600 rounded-full p-2">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <span>GoPay</span>
                    </Button>
                  </div>
                </div>
              )}

              {selectedMethod === 'qr-payment' && (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <div className="border-4 border-muted rounded-lg p-4">
                    <div className="bg-muted aspect-square w-48 flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground">
                    Scan this QR code with your mobile payment app
                  </p>
                </div>
              )}

              {selectedMethod === 'mobile-payment' && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Mobile Payment Instructions</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Open your mobile banking app</li>
                      <li>Select "Transfer" or "Send Money"</li>
                      <li>Enter the account details provided</li>
                      <li>Confirm the amount: {formatCurrencyCompat(amount)}</li>
                      <li>Complete the transaction</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleProcessPayment} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrencyCompat(amount)}`
                  )}
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
