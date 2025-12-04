import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For API routes, we need the service role key for full database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for rooms API:', { 
    url: !!supabaseUrl, 
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  })
}

// Create admin client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    console.log('Rooms API - GET called')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key present:', !!supabaseServiceKey)
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const floor = searchParams.get('floor')
    const availability = searchParams.get('availability')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('rooms')
      .select('*')
      .order('number', { ascending: true })

    // Apply search filter
    if (search) {
      query = query.or(`number.ilike.%${search}%,type.ilike.%${search}%`)
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply type filter
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply floor filter
    if (floor && floor !== 'all') {
      query = query.eq('floor', parseInt(floor))
    }

    // Apply availability filter
    if (availability && availability !== 'all') {
      const availableStatuses = ['available', 'clean']
      if (availability === 'available') {
        query = query.in('status', availableStatuses)
      } else if (availability === 'occupied') {
        query = query.eq('status', 'occupied')
      } else if (availability === 'maintenance') {
        query = query.in('status', ['maintenance', 'out-of-order'])
      }
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rooms' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.number || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Room number and type are required' },
        { status: 400 }
      )
    }

    // Check if room number already exists
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('id')
      .eq('number', body.number)
      .single()

    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room number already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        number: body.number,
        type: body.type,
        floor: body.floor || 1,
        base_price: body.base_price || 0,
        max_occupancy: body.max_occupancy || 2,
        status: body.status || 'available',
        amenities: body.amenities || [],
        description: body.description || null,
        custom_type_id: body.custom_type_id || null,
        images: body.images || [],
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('rooms')
      .update({
        number: body.number,
        type: body.type,
        floor: body.floor,
        base_price: body.base_price,
        max_occupancy: body.max_occupancy,
        status: body.status,
        amenities: body.amenities,
        description: body.description,
        custom_type_id: body.custom_type_id,
        images: body.images,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select('*')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update room' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check if room has active reservations
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', id)
      .in('status', ['confirmed', 'checked-in'])

    if (reservations && reservations.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete room with active reservations' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}