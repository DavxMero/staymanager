import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('inventory_purchase_orders')
            .select(`
        *,
        supplier:inventory_suppliers(*)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching purchase orders:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: data
        })
    } catch (error) {
        console.error('Unexpected error in purchase orders GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { po_number, supplier_id, status, notes, expected_delivery_date, items } = body

        if (!po_number || !supplier_id) {
            return NextResponse.json({ error: 'PO Number and Supplier are required' }, { status: 400 })
        }

        const { data: po, error: poError } = await supabase
            .from('inventory_purchase_orders')
            .insert([{
                po_number,
                supplier_id,
                status: status || 'draft',
                notes,
                expected_delivery_date
            }])
            .select()
            .single()

        if (poError) {
            console.error('Error creating purchase order:', poError)
            return NextResponse.json({ error: poError.message }, { status: 500 })
        }

        if (items && Array.isArray(items) && items.length > 0) {
            const itemsToInsert = items.map((item: any) => ({
                po_id: po.id,
                item_id: item.item_id,
                quantity_ordered: item.quantity_ordered,
                unit_cost: item.unit_cost,
                quantity_received: 0
            }))

            const { error: itemsError } = await supabase
                .from('inventory_purchase_order_items')
                .insert(itemsToInsert)

            if (itemsError) {
                console.error('Error creating PO items:', itemsError)
                return NextResponse.json({
                    success: true,
                    data: po,
                    message: 'PO created but failed to add items. Please edit to add items.'
                })
            }
        }

        return NextResponse.json({
            success: true,
            data: po,
            message: 'Purchase Order created successfully'
        })
    } catch (error) {
        console.error('Unexpected error in purchase orders POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

