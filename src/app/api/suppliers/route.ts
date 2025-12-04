import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('inventory_suppliers')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching suppliers:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: data
        })
    } catch (error) {
        console.error('Unexpected error in suppliers GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, contact_person, email, phone, address } = body

        if (!name) {
            return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('inventory_suppliers')
            .insert([{ name, contact_person, email, phone, address }])
            .select()
            .single()

        if (error) {
            console.error('Error creating supplier:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: data,
            message: 'Supplier created successfully'
        })
    } catch (error) {
        console.error('Unexpected error in suppliers POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('inventory_suppliers')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating supplier:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: data,
            message: 'Supplier updated successfully'
        })
    } catch (error) {
        console.error('Unexpected error in suppliers PUT:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('inventory_suppliers')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting supplier:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Supplier deleted successfully'
        })
    } catch (error) {
        console.error('Unexpected error in suppliers DELETE:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
