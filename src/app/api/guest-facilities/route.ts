import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For API routes, we need the service role key for full database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials:', { 
    url: !!supabaseUrl, 
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  })
}

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// GET - Fetch guest facility requests with filtering
export async function GET(request: NextRequest) {
  try {
    console.log('Guest Facilities API - GET called')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key present:', !!supabaseServiceKey)
    
    const { searchParams } = new URL(request.url)
    const guest_id = searchParams.get('guest_id')
    const room_id = searchParams.get('room_id')
    const service_type = searchParams.get('service_type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    
    let query = supabaseAdmin
      .from('guest_facility_requests')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (guest_id) {
      query = query.eq('guest_id', guest_id)
    }
    if (room_id) {
      query = query.eq('room_id', room_id)
    }
    if (service_type && service_type !== 'all') {
      query = query.eq('service_type', service_type)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching guest facility requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error in guest facilities GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new guest facility request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guest_id,
      reservation_id,
      room_id,
      service_type,
      description,
      items = [],
      priority = 'medium',
      estimated_completion,
      notes
    } = body

    // Validation
    if (!guest_id || !room_id || !service_type || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: guest_id, room_id, service_type, description' 
      }, { status: 400 })
    }

    // Calculate total cost from items if provided
    const total_cost = items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0)

    const requestData = {
      guest_id: parseInt(guest_id),
      reservation_id: reservation_id ? parseInt(reservation_id) : null,
      room_id: parseInt(room_id),
      service_type,
      description,
      priority,
      status: 'pending',
      estimated_completion,
      total_cost: total_cost > 0 ? total_cost : null,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('guest_facility_requests')
      .insert([requestData])
      .select()

    if (error) {
      console.error('Error creating guest facility request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const requestId = data?.[0]?.id

    // Insert items if provided
    if (items.length > 0 && requestId) {
      const itemsData = items.map((item: any) => ({
        request_id: requestId,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category
      }))

      const { error: itemsError } = await supabaseAdmin
        .from('guest_facility_items')
        .insert(itemsData)

      if (itemsError) {
        console.error('Error creating facility request items:', itemsError)
        // Note: We don't return error here to avoid leaving orphaned request
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data?.[0],
      message: 'Facility request created successfully'
    })
  } catch (error) {
    console.error('Unexpected error in guest facilities POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing guest facility request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // Set actual completion time if status is being changed to completed
    if (updateData.status === 'completed' && updateData.actual_completion === undefined) {
      updateData.actual_completion = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('guest_facility_requests')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating guest facility request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Request updated successfully'
    })
  } catch (error) {
    console.error('Unexpected error in guest facilities PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete guest facility request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    // Delete associated items first
    const { error: itemsError } = await supabaseAdmin
      .from('guest_facility_items')
      .delete()
      .eq('request_id', id)

    if (itemsError) {
      console.error('Error deleting facility request items:', itemsError)
    }

    // Delete the main request
    const { error } = await supabaseAdmin
      .from('guest_facility_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guest facility request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Request deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in guest facilities DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}