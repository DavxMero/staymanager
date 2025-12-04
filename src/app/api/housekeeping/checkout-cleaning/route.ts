import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body

    if (!roomId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Room ID is required',
        },
        { status: 400 }
      )
    }

    // Call the checkout cleaning function
    const { data, error } = await supabase.rpc('create_checkout_cleaning_task', {
      room_id_param: roomId
    })
    
    if (error) {
      console.error('Error creating checkout cleaning task:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create checkout cleaning task',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const result = data?.[0]
    
    if (!result?.task_created) {
      return NextResponse.json({
        success: false,
        error: result?.message || 'Failed to create checkout cleaning task'
      })
    }
    
    return NextResponse.json({
      success: true,
      taskId: result.task_id,
      message: result.message || 'Checkout cleaning task created successfully'
    })
  } catch (err) {
    console.error('Unexpected error in checkout cleaning:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error occurred',
        details: (err as Error).message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all checkout cleaning tasks
    const { data: checkoutTasks, error } = await supabase
      .from('housekeeping_tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        estimated_duration,
        scheduled_at,
        due_date,
        created_at,
        completed_at,
        assigned_to,
        notes,
        rooms!inner(
          id,
          number,
          floor,
          type
        )
      `)
      .eq('task_type', 'checkout')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      tasks: checkoutTasks || [],
      message: `Found ${checkoutTasks?.length || 0} checkout cleaning tasks`
    })
  } catch (err) {
    console.error('Error getting checkout cleaning tasks:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get checkout cleaning tasks',
        details: (err as Error).message 
      },
      { status: 500 }
    )
  }
}