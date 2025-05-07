import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Prevent static generation - this API needs to be dynamic
export const dynamic = 'force-dynamic';

// This is a special API endpoint that uses the Cursor MCP Supabase query tool
// to retrieve all user progress records directly without RLS limitations
export async function GET(request: Request) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || userId;
    
    console.log(`[MCP Direct API] Attempting to fetch progress for user ${targetUserId}`);
    
    // Use the MCP Supabase query tool by importing it from another file
    // that has direct access to the feature
    const { mcp_supabase_query } = await import('@/lib/mcp-helpers');
    
    try {
      // Use the MCP Supabase query tool to fetch all records
      const result = await mcp_supabase_query(`SELECT * FROM user_progress WHERE user_id = '${targetUserId}' ORDER BY completed_at DESC`);
      
      // The result should be an array of records
      const records = result || [];
      
      console.log(`[MCP Direct API] Successfully fetched ${records.length} records`);
      
      return NextResponse.json({
        success: true,
        userId: targetUserId,
        records: records,
        count: records.length,
        method: 'mcp_direct_query'
      });
    } catch (error) {
      console.error('[MCP Direct API] Error using MCP query:', error);
      
      // If the MCP query fails, return an error response
      return NextResponse.json({
        success: false,
        error: 'Failed to execute MCP query',
        message: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[MCP Direct API] Unhandled error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 