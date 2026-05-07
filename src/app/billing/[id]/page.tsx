import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoiceDetailClient } from '@/components/billing/InvoiceDetailClient'

export const metadata = {
  title: 'Invoice Details - StayManager',
  description: 'View and manage invoice details',
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await params
  const invoiceId = resolvedParams.id

  // 1. Fetch Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    console.error("Error fetching invoice:", invoiceError)
    redirect('/billing')
  }

  // 2. Fetch Reservation with Room
  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, guests(full_name, email, phone), rooms(number, type)')
    .eq('id', invoice.reservation_id)
    .single()

  // 3. Fetch Billing Items
  const { data: billingItems } = await supabase
    .from('billing_items')
    .select('*')
    .eq('reservation_id', invoice.reservation_id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <InvoiceDetailClient 
        invoice={invoice} 
        reservation={reservation || null}
        initialBillingItems={billingItems || []} 
      />
    </div>
  )
}
