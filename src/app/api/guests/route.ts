import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For API routes, we need the service role key for full database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for guests API:', { 
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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch guests' },
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
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if guest with email already exists
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingGuest) {
      return NextResponse.json(
        { success: false, error: 'Guest with this email already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('guests')
      .insert([{
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        id_number: body.id_number || null,
        address: body.address || null,
        nationality: body.nationality || null,
        date_of_birth: body.date_of_birth || null,
        status: body.status || 'active',
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create guest' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guest created successfully',
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
        { success: false, error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('guests')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        id_number: body.id_number,
        address: body.address,
        nationality: body.nationality,
        date_of_birth: body.date_of_birth,
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update guest' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guest updated successfully',
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
        { success: false, error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    // Check if guest has active reservations
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('guest_id', id)
      .eq('status', 'confirmed')

    if (reservations && reservations.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete guest with active reservations' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete guest' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}