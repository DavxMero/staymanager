'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Wallet,
  Calculator,
  Plus,
  Minus,
  Trash2
} from "lucide-react"
import type { POSTransaction, POSTransactionItem } from "@/types"
import { posTransactionsApi } from "@/lib/billingApi"

interface POSTransactionProps {
  reservationId?: number
  guestId?: number
  transactionType: 'checkin' | 'checkout' | 'reservation' | 'deposit' | 'additional'
  initialItems?: Omit<POSTransactionItem, 'id' | 'transaction_id'>[]
  onTransactionComplete?: (transaction: POSTransaction) => void
  onCancel?: () => void
  className?: string
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'transfer', label: 'Bank Transfer', icon: Smartphone },
  { value: 'qris', label: 'QRIS', icon: QrCode },
  { value: 'ewallet', label: 'E-Wallet', icon: Wallet },
]

const itemCategories = [
  { value: 'room', label: 'Room Charge' },
  { value: 'food', label: 'Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'service', label: 'Service' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'penalty', label: 'Penalty' },
  { value: 'misc', label: 'Miscellaneous' },
]

export function POSTransaction({
  reservationId,
  guestId,
  transactionType,
  initialItems = [],
  onTransactionComplete,
  onCancel,
  className
}: POSTransactionProps) {
  const [items, setItems] = useState<Omit<POSTransactionItem, 'id' | 'transaction_id'>[]>(initialItems)
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [cashReceived, setCashReceived] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  // New item form
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<string>('')

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)
  const changeAmount = paymentMethod === 'cash' && cashReceived
    ? Math.max(0, parseFloat(cashReceived) - totalAmount)
    : 0

  const addItem = () => {
    // Validation before adding item
    if (!newItemName.trim()) {
      alert('❌ Nama item tidak boleh kosong\n\nSilakan masukkan nama item.')
      return
    }

    if (!newItemCategory) {
      alert('❌ Kategori item belum dipilih\n\nSilakan pilih kategori item.')
      return
    }

    if (!newItemUnitPrice || parseFloat(newItemUnitPrice) <= 0) {
      alert('❌ Harga unit tidak valid\n\nHarga unit harus lebih dari Rp 0.')
      return
    }

    const quantity = parseInt(newItemQuantity) || 1
    const unitPrice = parseFloat(newItemUnitPrice) || 0
    const totalPrice = quantity * unitPrice

    // Final validation
    if (quantity <= 0) {
      alert('❌ Jumlah quantity tidak valid\n\nQuantity harus lebih dari 0.')
      return
    }

    if (totalPrice <= 0) {
      alert('❌ Total harga tidak valid\n\nTotal harga item harus lebih dari Rp 0.')
      return
    }

    const newItem: Omit<POSTransactionItem, 'id' | 'transaction_id'> = {
      item_name: newItemName.trim(),
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      category: newItemCategory as POSTransactionItem['category']
    }

    setItems([...items, newItem])

    // Reset form
    setNewItemName('')
    setNewItemQuantity('1')
    setNewItemUnitPrice('')
    setNewItemCategory('')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return

    const updatedItems = items.map((item, i) =>
      i === index
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    )
    setItems(updatedItems)
  }

  const processTransaction = async () => {
    // Comprehensive validation with user-friendly messages
    if (items.length === 0) {
      alert('❌ Tidak ada item dalam transaksi.\n\nSilakan tambahkan setidaknya satu item terlebih dahulu.')
      return
    }

    if (totalAmount <= 0) {
      alert('❌ Total amount tidak valid.\n\nTotal amount harus lebih dari Rp 0.\nSilakan periksa kembali item dan harga yang diinput.')
      return
    }

    if (!paymentMethod) {
      alert('❌ Metode pembayaran belum dipilih.\n\nSilakan pilih metode pembayaran (Cash, Card, Transfer, dll.)')
      return
    }

    // Validate individual items
    const invalidItems = items.filter(item =>
      !item.item_name ||
      item.quantity <= 0 ||
      item.unit_price < 0 ||
      item.total_price <= 0
    )

    if (invalidItems.length > 0) {
      alert(`❌ Ada item yang tidak valid:\n\n${invalidItems.map((item, index) =>
        `• Item ${index + 1}: ${item.item_name || 'Unnamed'} - ${formatCurrency(item.total_price)}`
      ).join('\n')}\n\nSilakan perbaiki item tersebut atau hapus dari transaksi.`)
      return
    }

    if (paymentMethod === 'cash') {
      if (!cashReceived || parseFloat(cashReceived) <= 0) {
        alert('❌ Jumlah uang yang diterima tidak valid.\n\nSilakan masukkan jumlah uang cash yang diterima.')
        return
      }

      if (parseFloat(cashReceived) < totalAmount) {
        const shortage = totalAmount - parseFloat(cashReceived)
        alert(`❌ Uang yang diterima kurang.\n\nTotal: ${formatCurrency(totalAmount)}\nDiterima: ${formatCurrency(parseFloat(cashReceived))}\nKekurangan: ${formatCurrency(shortage)}`)
        return
      }
    }

    setIsProcessing(true)

    try {
      console.log('Processing transaction with data:', {
        reservationId,
        guestId,
        totalAmount,
        paymentMethod,
        transactionType,
        itemsCount: items.length
      })

      const transactionData: Omit<POSTransaction, 'id' | 'created_at'> = {
        reservation_id: reservationId,
        guest_id: guestId,
        total_amount: totalAmount,
        payment_method: paymentMethod as POSTransaction['payment_method'],
        status: 'completed',
        transaction_type: transactionType,
        items: items.map(item => ({ ...item, id: 0, transaction_id: 0 })),
        notes: notes || undefined,
        cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
        change_amount: paymentMethod === 'cash' ? changeAmount : undefined
      }

      console.log('Sending transaction data to API:', transactionData)

      const createdTransaction = await posTransactionsApi.create(transactionData)

      console.log('Transaction created successfully:', createdTransaction)

      if (onTransactionComplete) {
        onTransactionComplete(createdTransaction)
      }
    } catch (error) {
      console.error('Error processing transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // User-friendly error messages
      if (errorMessage.includes('Total amount must be greater than 0')) {
        alert('❌ Error: Total amount tidak valid\n\nTotal pembayaran harus lebih dari Rp 0. Silakan periksa kembali item dan harga yang diinput.')
      } else if (errorMessage.includes('Payment method is required')) {
        alert('❌ Error: Metode pembayaran diperlukan\n\nSilakan pilih metode pembayaran terlebih dahulu.')
      } else if (errorMessage.includes('Database error')) {
        alert('❌ Error: Masalah database\n\nTerjadi masalah saat menyimpan transaksi. Silakan coba lagi atau hubungi administrator.')
      } else {
        alert(`❌ Gagal memproses transaksi\n\n${errorMessage}\n\nSilakan coba lagi atau hubungi administrator jika masalah berlanjut.`)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          POS Transaction - {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Item Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Add Item</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="itemCategory">Category</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow positive integers
                  if (value === '' || (parseInt(value) >= 1 && !isNaN(parseInt(value)))) {
                    setNewItemQuantity(value)
                  }
                }}
                onBlur={(e) => {
                  // Ensure minimum value of 1
                  if (!e.target.value || parseInt(e.target.value) < 1) {
                    setNewItemQuantity('1')
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Unit Price (Rp)</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="1000"
                value={newItemUnitPrice}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow non-negative numbers
                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setNewItemUnitPrice(value)
                  }
                }}
                onBlur={(e) => {
                  // Show warning for 0 or negative values
                  const value = parseFloat(e.target.value)
                  if (isNaN(value) || value <= 0) {
                    // Don't auto-correct, let user know it's invalid
                    if (e.target.value !== '') {
                      e.target.style.borderColor = '#ef4444' // red border
                      e.target.title = 'Harga harus lebih dari Rp 0'
                    }
                  } else {
                    e.target.style.borderColor = '' // reset border
                    e.target.title = ''
                  }
                }}
                placeholder="Masukkan harga (contoh: 50000)"
                className={`${parseFloat(newItemUnitPrice) <= 0 && newItemUnitPrice !== '' ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
          <Button
            onClick={addItem}
            disabled={!newItemName || !newItemUnitPrice || !newItemCategory}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Transaction Items</h4>
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.item_name}</div>
                  <Badge variant="outline" className="text-xs">
                    {itemCategories.find(c => c.value === item.category)?.label}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(item.unit_price)} each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(item.total_price)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Section */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="cashReceived">Cash Received (Rp)</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  min={totalAmount}
                  step="1000"
                  value={cashReceived}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow non-negative numbers
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setCashReceived(value)
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (value > 0 && value < totalAmount) {
                      e.target.style.borderColor = '#f59e0b' // orange border for warning
                      e.target.title = `Uang diterima kurang dari total (${formatCurrency(totalAmount)})`
                    } else if (value <= 0 && e.target.value !== '') {
                      e.target.style.borderColor = '#ef4444' // red border for error
                      e.target.title = 'Jumlah uang harus lebih dari Rp 0'
                    } else {
                      e.target.style.borderColor = '' // reset border
                      e.target.title = ''
                    }
                  }}
                  placeholder={`Min: ${formatCurrency(totalAmount)}`}
                  className={`${cashReceived !== '' && parseFloat(cashReceived) < totalAmount
                      ? parseFloat(cashReceived) <= 0
                        ? 'border-red-500'
                        : 'border-orange-500'
                      : ''
                    }`}
                />
                {changeAmount > 0 && (
                  <div className="text-sm font-medium text-green-600">
                    Change: {formatCurrency(changeAmount)}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add transaction notes..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={processTransaction}
                disabled={!paymentMethod || totalAmount <= 0 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Process Payment - ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}