import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    // Call the daily housekeeping tasks function
    const { data, error } = await supabase.rpc('run_daily_housekeeping_tasks')
    
    if (error) {
      console.error('Error running daily tasks:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create daily tasks',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const result = data?.[0]
    
    return NextResponse.json({
      success: true,
      tasksCreated: result?.tasks_created || 0,
      message: result?.message || 'Daily tasks completed',
      details: result?.task_details || ''
    })
  } catch (err) {
    console.error('Unexpected error in daily tasks:', err)
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
    // Get detailed housekeeping task summary
    const { data, error } = await supabase.rpc('get_housekeeping_task_summary')
    
    if (error) {
      throw error
    }

    const summary = data?.[0]
    
    return NextResponse.json({
      success: true,
      summary: {
        totalRooms: summary?.total_rooms || 0,
        availableRooms: summary?.available_rooms || 0,
        roomsWithDailyTasksToday: summary?.rooms_with_daily_tasks_today || 0,
        pendingDailyTasks: summary?.pending_daily_tasks || 0,
        pendingCheckoutTasks: summary?.pending_checkout_tasks || 0,
        inProgressTasks: summary?.in_progress_tasks || 0,
        completedTasksToday: summary?.completed_tasks_today || 0,
        overdueTasks: summary?.overdue_tasks || 0
      },
      message: `Daily Tasks: ${summary?.pending_daily_tasks || 0} pending, ` +
               `Checkout Tasks: ${summary?.pending_checkout_tasks || 0} pending, ` +
               `${summary?.completed_tasks_today || 0} completed today`
    })
  } catch (err) {
    console.error('Error getting housekeeping task summary:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get housekeeping task summary',
        details: (err as Error).message 
      },
      { status: 500 }
    )
  }
}
