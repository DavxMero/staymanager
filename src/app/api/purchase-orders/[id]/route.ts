import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch single PO with items
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        const { data, error } = await supabase
            .from('inventory_purchase_orders')
            .select(`
        *,
        supplier:inventory_suppliers(*),
        items:inventory_purchase_order_items(
          *,
          item:inventory_items(*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: data
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update PO (Status or Details)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const { status, items, ...updates } = body

        // 1. Update Header
        const { error: headerError } = await supabase
            .from('inventory_purchase_orders')
            .update({ status, ...updates })
            .eq('id', id)

        if (headerError) throw headerError

        // 2. Update Items (if provided)
        // This is a simplified "replace all" approach for draft POs
        if (items && Array.isArray(items)) {
            // Delete existing items
            await supabase
                .from('inventory_purchase_order_items')
                .delete()
                .eq('po_id', id)

            // Insert new items
            if (items.length > 0) {
                const itemsToInsert = items.map((item: any) => ({
                    po_id: id,
                    item_id: item.item_id,
                    quantity_ordered: item.quantity_ordered,
                    unit_cost: item.unit_cost
                }))

                const { error: itemsError } = await supabase
                    .from('inventory_purchase_order_items')
                    .insert(itemsToInsert)

                if (itemsError) throw itemsError
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Purchase Order updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating PO:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
