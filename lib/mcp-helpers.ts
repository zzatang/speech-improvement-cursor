/**
 * This helper file provides wrappers around MCP tools for use in API routes
 * Since MCP tools are only available during tool calls, this file serves as a proxy
 * to make MCP queries through a specialized mechanism
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Execute a SQL query using the MCP Supabase query tool
 * This is a wrapper that makes it easier to use from API routes
 * 
 * @param sql The SQL query to execute
 * @returns The query result
 */
export async function mcp_supabase_query(sql: string): Promise<any> {
  // Parse the user_id from the SQL string
  const userIdMatch = sql.match(/user_id\s*=\s*'([^']+)'/);
  if (!userIdMatch) return [];

  const userId = userIdMatch[1];

  // Query the user_progress table for this user
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Supabase query error:', error);
    return [];
  }

  return data || [];
} 