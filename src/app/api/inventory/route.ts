import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for inventory API:', { 
    url: !!supabaseUrl, 
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  })
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const lowStock = searchParams.get('lowStock')
    
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (lowStock === 'true') {
      query = query.filter('current_stock', 'lte', 'min_stock')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching inventory:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const processedData = data?.map(item => ({
      ...item,
      stock_percentage: item.max_stock > 0 ? (item.current_stock / item.max_stock) * 100 : 0,
      needs_restock: item.current_stock <= item.min_stock,
      stock_value: item.current_stock * item.unit_cost,
    })) || []

    return NextResponse.json({ 
      success: true, 
      data: processedData,
      count: processedData.length
    })
  } catch (error) {
    console.error('Unexpected error in inventory GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      current_stock,
      min_stock,
      max_stock,
      unit,
      unit_cost,
      supplier,
      location,
      status = 'in-stock'
    } = body

    if (!name || !category || current_stock === undefined || !unit || unit_cost === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, category, current_stock, unit, unit_cost' 
      }, { status: 400 })
    }

    if (current_stock < 0 || unit_cost < 0) {
      return NextResponse.json({ 
        error: 'Stock and cost values must be non-negative' 
      }, { status: 400 })
    }

    let computedStatus = status
    if (current_stock === 0) {
      computedStatus = 'out-of-stock'
    } else if (current_stock <= min_stock) {
      computedStatus = 'low-stock'
    } else {
      computedStatus = 'in-stock'
    }

    const inventoryData = {
      name,
      description,
      category,
      current_stock: parseInt(current_stock),
      min_stock: min_stock ? parseInt(min_stock) : 0,
      max_stock: max_stock ? parseInt(max_stock) : current_stock,
      unit,
      unit_cost: parseFloat(unit_cost),
      supplier,
      location,
      status: computedStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([inventoryData])
      .select()

    if (error) {
      console.error('Error creating inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data?.[0],
      message: 'Inventory item created successfully'
    })
  } catch (error) {
    console.error('Unexpected error in inventory POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Inventory item ID is required' }, { status: 400 })
    }

    if (updateData.current_stock !== undefined) {
      const { data: currentItem } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', id)
        .single()

      if (currentItem && updateData.current_stock > currentItem.current_stock) {
        updateData.last_restocked = new Date().toISOString()
      }

      if (updateData.current_stock === 0) {
        updateData.status = 'out-of-stock'
      } else if (updateData.min_stock && updateData.current_stock <= updateData.min_stock) {
        updateData.status = 'low-stock'
      } else {
        updateData.status = 'in-stock'
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Inventory item updated successfully'
    })
  } catch (error) {
    console.error('Unexpected error in inventory PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Inventory item ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Inventory item deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in inventory DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}