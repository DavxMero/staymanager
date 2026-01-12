import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, items, ...updates } = body

        const { error: headerError } = await supabase
            .from('inventory_purchase_orders')
            .update({ status, ...updates })
            .eq('id', id)

        if (headerError) throw headerError

        if (items && Array.isArray(items)) {
            await supabase
                .from('inventory_purchase_order_items')
                .delete()
                .eq('po_id', id)

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
