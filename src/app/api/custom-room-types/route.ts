import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For API routes, we need the service role key for full database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for custom room types API:', { 
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

// GET - Fetch all custom room types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    let query = supabase
      .from('custom_room_types')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching custom room types:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Parse JSON fields
    const processedData = data?.map(roomType => ({
      ...roomType,
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities : JSON.parse(roomType.amenities || '[]'),
      features: Array.isArray(roomType.features) ? roomType.features : JSON.parse(roomType.features || '[]'),
      default_images: Array.isArray(roomType.default_images) ? roomType.default_images : JSON.parse(roomType.default_images || '[]'),
    })) || []

    return NextResponse.json({ 
      success: true, 
      data: processedData,
      count: processedData.length
    })
  } catch (error) {
    console.error('Unexpected error in custom room types GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new custom room type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      base_price,
      capacity,
      max_adults,
      max_children,
      size_sqm,
      amenities = [],
      features = [],
      default_images = [],
      color_theme,
      is_active = true,
      sort_order
    } = body

    // Validation
    if (!name || !base_price || !capacity || !max_adults) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, base_price, capacity, max_adults' 
      }, { status: 400 })
    }

    if (base_price <= 0 || capacity <= 0 || max_adults <= 0) {
      return NextResponse.json({ 
        error: 'Price, capacity, and max_adults must be greater than 0' 
      }, { status: 400 })
    }

    // Check for duplicate name
    const { data: existingTypes, error: checkError } = await supabase
      .from('custom_room_types')
      .select('id')
      .eq('name', name)
      .limit(1)

    if (checkError) {
      console.error('Error checking for duplicate names:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingTypes && existingTypes.length > 0) {
      return NextResponse.json({ 
        error: 'A room type with this name already exists' 
      }, { status: 400 })
    }

    const roomTypeData = {
      name,
      description,
      base_price: parseFloat(base_price),
      capacity: parseInt(capacity),
      max_adults: parseInt(max_adults),
      max_children: max_children ? parseInt(max_children) : 0,
      size_sqm: size_sqm ? parseFloat(size_sqm) : null,
      amenities: JSON.stringify(amenities),
      features: JSON.stringify(features),
      default_images: JSON.stringify(default_images),
      color_theme,
      is_active,
      sort_order: sort_order ? parseInt(sort_order) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('custom_room_types')
      .insert([roomTypeData])
      .select()

    if (error) {
      console.error('Error creating custom room type:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process the response data
    const processedData = data?.[0] ? {
      ...data[0],
      amenities: JSON.parse(data[0].amenities || '[]'),
      features: JSON.parse(data[0].features || '[]'),
      default_images: JSON.parse(data[0].default_images || '[]'),
    } : null

    return NextResponse.json({ 
      success: true, 
      data: processedData,
      message: 'Custom room type created successfully'
    })
  } catch (error) {
    console.error('Unexpected error in custom room types POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing custom room type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Room type ID is required' }, { status: 400 })
    }

    // Check if room type exists
    const { data: existingType, error: checkError } = await supabase
      .from('custom_room_types')
      .select('id')
      .eq('id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing room type:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (!existingType || existingType.length === 0) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
    }

    // Process array fields to JSON strings
    if (updateData.amenities && Array.isArray(updateData.amenities)) {
      updateData.amenities = JSON.stringify(updateData.amenities)
    }
    if (updateData.features && Array.isArray(updateData.features)) {
      updateData.features = JSON.stringify(updateData.features)
    }
    if (updateData.default_images && Array.isArray(updateData.default_images)) {
      updateData.default_images = JSON.stringify(updateData.default_images)
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('custom_room_types')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating custom room type:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
    }

    // Process the response data
    const processedData = {
      ...data[0],
      amenities: JSON.parse(data[0].amenities || '[]'),
      features: JSON.parse(data[0].features || '[]'),
      default_images: JSON.parse(data[0].default_images || '[]'),
    }

    return NextResponse.json({ 
      success: true, 
      data: processedData,
      message: 'Custom room type updated successfully'
    })
  } catch (error) {
    console.error('Unexpected error in custom room types PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete custom room type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Room type ID is required' }, { status: 400 })
    }

    // Check if any rooms are using this custom type
    const { data: roomsUsingType, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('custom_type_id', id)
      .limit(1)

    if (roomsError) {
      console.error('Error checking room usage:', roomsError)
      return NextResponse.json({ error: roomsError.message }, { status: 500 })
    }

    if (roomsUsingType && roomsUsingType.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete room type: it is currently being used by one or more rooms' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('custom_room_types')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting custom room type:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Custom room type deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in custom room types DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}