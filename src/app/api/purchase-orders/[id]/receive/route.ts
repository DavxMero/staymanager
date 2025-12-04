import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: poId } = await params

        // 1. Fetch PO and its items
        const { data: po, error: poError } = await supabase
            .from('inventory_purchase_orders')
            .select(`
        *,
        items:inventory_purchase_order_items(*)
      `)
            .eq('id', poId)
            .single()

        if (poError || !po) {
            return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 })
        }

        if (po.status === 'received') {
            return NextResponse.json({ error: 'PO is already received' }, { status: 400 })
        }

        // 2. Process each item
        // Note: In a production app, this should be a database transaction (RPC)
        const items = po.items || []
        const errors = []

        for (const item of items) {
            // A. Update Inventory Stock
            const { error: stockError } = await supabase.rpc('increment_stock', {
                item_id: item.item_id,
                quantity: item.quantity_ordered
            })

            // Fallback if RPC doesn't exist (manual update - less safe but works for MVP)
            if (stockError) {
                // Fetch current stock first
                const { data: currentItem } = await supabase
                    .from('inventory_items')
                    .select('current_stock')
                    .eq('id', item.item_id)
                    .single()

                if (currentItem) {
                    await supabase
                        .from('inventory_items')
                        .update({
                            current_stock: currentItem.current_stock + item.quantity_ordered,
                            last_restocked: new Date().toISOString()
                        })
                        .eq('id', item.item_id)
                }
            }

            // B. Create Transaction Record
            await supabase
                .from('inventory_transactions')
                .insert({
                    item_id: item.item_id,
                    transaction_type: 'in',
                    quantity: item.quantity_ordered,
                    unit_cost: item.unit_cost,
                    reference_type: 'purchase_order',
                    reference_id: po.po_number,
                    notes: `Received from PO #${po.po_number}`
                })

            // C. Update PO Item status
            await supabase
                .from('inventory_purchase_order_items')
                .update({ quantity_received: item.quantity_ordered })
                .eq('id', item.id)
        }

        // 3. Update PO Header Status
        const { error: updateError } = await supabase
            .from('inventory_purchase_orders')
            .update({
                status: 'received',
                updated_at: new Date().toISOString()
            })
            .eq('id', poId)

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({
            success: true,
            message: 'Goods received and stock updated successfully'
        })

    } catch (error: any) {
        console.error('Error receiving goods:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
