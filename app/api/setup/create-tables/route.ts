import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sql = `
-- Create user_profiles table for Supabase Auth
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "user_id" TEXT NOT NULL UNIQUE,
  "display_name" TEXT,
  "avatar_url" TEXT,
  "avatar_color" TEXT DEFAULT '#4F46E5',
  "avatar_accessories" TEXT[],
  "streak_count" INTEGER DEFAULT 0,
  "last_login" TIMESTAMP WITH TIME ZONE,
  "overall_progress" INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Supabase Auth
-- Allow users to read their own profiles
CREATE POLICY IF NOT EXISTS "Users can read their own profiles"
ON "public"."user_profiles"
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow users to insert their own profiles
CREATE POLICY IF NOT EXISTS "Users can insert their own profiles"
ON "public"."user_profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profiles"
ON "public"."user_profiles"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own profiles
CREATE POLICY IF NOT EXISTS "Users can delete their own profiles"
ON "public"."user_profiles"
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON "public"."user_profiles" (user_id);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON "public"."user_profiles" (created_at);

-- Grant permissions
GRANT ALL ON "public"."user_profiles" TO authenticated;
GRANT ALL ON "public"."user_profiles" TO service_role;
  `;

  return NextResponse.json({
    message: 'SQL commands for creating user_profiles table',
    sql: sql.trim(),
    instructions: [
      '1. Go to your Supabase Dashboard',
      '2. Navigate to SQL Editor',
      '3. Copy and paste the SQL above',
      '4. Click "Run" to execute the commands',
      '5. Refresh your profile page after execution'
    ]
  });
} 