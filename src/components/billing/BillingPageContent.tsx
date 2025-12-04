import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Eye,
  Download,
  CreditCard,
  Banknote,
  Wallet,
  Edit
} from "lucide-react"
import { Invoice, BillingItem, Reservation, Guest, Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { billingItemsApi } from "@/lib/billingApi"
import { UnpaidBillingsList } from "@/components/billing/UnpaidBillingsList"
import { AddBillingItemForm } from "@/components/billing/AddBillingItemForm"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { BillingDashboard } from "@/components/billing/BillingDashboard"
import { InvoicesTable } from "@/components/billing/InvoicesTable"
import { AddInvoiceForm } from "@/components/billing/AddInvoiceForm"

interface BillingPageContentProps {
  invoices: Invoice[];
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  currentInvoice: Invoice | null;
  amount: string;
  setAmount: (amount: string) => void;
  status: "paid" | "pending" | "overdue";
  setStatus: (status: "paid" | "pending" | "overdue") => void;
  reservationId: string;
  setReservationId: (id: string) => void;
  error: string | null;
  handleAddInvoice: () => void;
  handleEditInvoice: (invoice: Invoice) => void;
  handleSaveInvoice: () => void;
  handleViewInvoice: (invoice: Invoice) => void;
  handleDownloadInvoice: (invoice: Invoice) => void;
  handleCreateInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void;
  isAddInvoiceDialogOpen: boolean;
  setIsAddInvoiceDialogOpen: (open: boolean) => void;
  isPosDialogOpen: boolean;
  setIsPosDialogOpen: (open: boolean) => void;
  fetchInvoices: () => void;
  selectedReservation: Reservation | null;
  isAddingBillingItem: boolean;
  setIsAddingBillingItem: (open: boolean) => void;
  handleAddBillingItem: (billingItems: Omit<BillingItem, 'id' | 'created_at'>[]) => void;
  billingItems: BillingItem[];
  handleUpdateBillingItem: (id: number, updates: Partial<BillingItem>) => void;
  setSelectedReservation: (reservation: Reservation | null) => void;
  fetchBillingItems: (reservationId: number) => void;
}

export function BillingPageContent({
  invoices,
  reservations,
  guests,
  rooms,
  isDialogOpen,
  setIsDialogOpen,
  currentInvoice,
  amount,
  setAmount,
  status,
  setStatus,
  reservationId,
  setReservationId,
  error,
  handleAddInvoice,
  handleEditInvoice,
  handleSaveInvoice,
  handleViewInvoice,
  handleDownloadInvoice,
  handleCreateInvoice,
  isAddInvoiceDialogOpen,
  setIsAddInvoiceDialogOpen,
  isPosDialogOpen,
  setIsPosDialogOpen,
  fetchInvoices,
  selectedReservation,
  isAddingBillingItem,
  setIsAddingBillingItem,
  handleAddBillingItem,
  billingItems,
  handleUpdateBillingItem,
  setSelectedReservation,
  fetchBillingItems
}: BillingPageContentProps) {
  // Calculate financial summary
  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.status === 'paid' ? invoice.amount : 0), 0)
  const pendingPayments = invoices.reduce((sum, invoice) => sum + (invoice.status === 'pending' ? invoice.amount : 0), 0)
  const overdueAmount = invoices.reduce((sum, invoice) => sum + (invoice.status === 'overdue' ? invoice.amount : 0), 0)

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded"
            onClick={fetchInvoices}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoicing</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
        <Button onClick={handleAddInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Financial Summary */}
      <BillingDashboard
        totalRevenue={totalRevenue}
        pendingPayments={pendingPayments}
        overdueAmount={overdueAmount}
      />

      {/* Invoices Table */}
      <InvoicesTable
        invoices={invoices}
        onEditInvoice={handleEditInvoice}
        onViewInvoice={handleViewInvoice}
        onDownloadInvoice={handleDownloadInvoice}
      />

      {/* Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentInvoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
            <DialogDescription>
              {currentInvoice ? "Edit the invoice details" : "Create a new invoice"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservationId">Reservation ID</Label>
              <Input
                id="reservationId"
                type="number"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Enter reservation ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in Rupiah"
              />
              {amount && (
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(parseFloat(amount))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "paid" | "pending" | "overdue")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveInvoice}
              disabled={!reservationId || !amount || parseFloat(amount) <= 0}
            >
              {currentInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Invoice Dialog */}
      <AddInvoiceForm
        isOpen={isAddInvoiceDialogOpen}
        onOpenChange={setIsAddInvoiceDialogOpen}
        onAddInvoice={handleCreateInvoice}
      />

      {/* POS Dialog */}
      <Dialog open={isPosDialogOpen} onOpenChange={setIsPosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Point of Sale (POS)</DialogTitle>
            <DialogDescription>
              Add billing items to reservations
            </DialogDescription>
          </DialogHeader>
          {selectedReservation ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">
                  {(() => {
                    const guest = guests.find(g => g.id === selectedReservation.guest_id);
                    const room = rooms.find(r => r.id === selectedReservation.room_id);
                    return `${guest ? guest.full_name : 'Guest #' + selectedReservation.guest_id} • Room ${room ? room.number : 'Room #' + selectedReservation.room_id}`;
                  })()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reservation #{selectedReservation.id}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Billing Items</h3>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingBillingItem(true)}
                    disabled={isAddingBillingItem}
                  >
                    Add Item
                  </Button>
                </div>

                {isAddingBillingItem ? (
                  <div className="mb-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Add New Billing Item</h4>
                    <AddBillingItemForm
                      reservationId={selectedReservation.id}
                      onAddItem={handleAddBillingItem}
                      onCancel={() => setIsAddingBillingItem(false)}
                    />
                  </div>
                ) : null}

                {billingItems.length > 0 ? (
                  <UnpaidBillingsList
                    billingItems={billingItems}
                    onItemUpdate={handleUpdateBillingItem}
                    editable={true}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No billing items for this reservation
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Reservation</Label>
                <Select onValueChange={(value) => {
                  const reservation = reservations.find(r => r.id === parseInt(value));
                  if (reservation) {
                    setSelectedReservation(reservation);
                    fetchBillingItems(reservation.id);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a checked-in reservation" />
                  </SelectTrigger>
                  <SelectContent>
                    {reservations
                      .filter(res => res.status === 'checked-in')
                      .map((reservation) => {
                        const guest = guests.find(g => g.id === reservation.guest_id);
                        const room = rooms.find(r => r.id === reservation.room_id);
                        return (
                          <SelectItem key={reservation.id} value={reservation.id.toString()}>
                            {guest ? guest.full_name : 'Guest #' + reservation.guest_id} -
                            Room {room ? room.number : 'Room #' + reservation.room_id} -
                            Reservation #{reservation.id}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPosDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}