import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerUserContext, hasPermission } from '@/lib/auth/server-permissions'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const ctx = await getServerUserContext(request)
        if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (!hasPermission(ctx, 'operations')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { id: poId } = await params

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

        
        
        const { data: claimed } = await supabase
            .from('inventory_purchase_orders')
            .update({
                status: 'received',
                updated_at: new Date().toISOString()
            })
            .eq('id', poId)
            .neq('status', 'received')
            .select('id')
            .maybeSingle()

        if (!claimed) {
            return NextResponse.json({ error: 'PO already received' }, { status: 400 })
        }

        const items = po.items || []
        const errors = []

        for (const item of items) {
            const { error: stockError } = await supabase.rpc('increment_stock', {
                item_id: item.item_id,
                quantity: item.quantity_ordered
            })

            if (stockError) {
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

            await supabase
                .from('inventory_purchase_order_items')
                .update({ quantity_received: item.quantity_ordered })
                .eq('id', item.id)
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
