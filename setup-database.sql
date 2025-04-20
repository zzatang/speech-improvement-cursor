-- Create the speech_exercises table
CREATE TABLE IF NOT EXISTS "public"."speech_exercises" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "exercise_type" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "difficulty_level" INTEGER NOT NULL,
  "age_group" TEXT
);

-- Add RLS policies
ALTER TABLE "public"."speech_exercises" ENABLE ROW LEVEL SECURITY;

-- Create policy for anon users to read exercises
CREATE POLICY "Allow anonymous read access" 
ON "public"."speech_exercises" 
FOR SELECT USING (true);

-- Create policy for authenticated users to create exercises
CREATE POLICY "Allow authenticated users to create exercises" 
ON "public"."speech_exercises" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy for authenticated users to update exercises
CREATE POLICY "Allow authenticated users to update exercises" 
ON "public"."speech_exercises" 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create policy for authenticated users to delete exercises
CREATE POLICY "Allow authenticated users to delete exercises" 
ON "public"."speech_exercises" 
FOR DELETE 
TO authenticated 
USING (true);

-- Create the user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."user_progress" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "user_id" TEXT NOT NULL,
  "exercise_id" UUID NOT NULL,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "score" INTEGER,
  "attempts" INTEGER DEFAULT 0,
  "feedback" TEXT
);

-- Add RLS policies for user_progress
ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own progress
CREATE POLICY "Users can read their own progress" 
ON "public"."user_progress" 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policy for users to create their own progress
CREATE POLICY "Users can create their own progress" 
ON "public"."user_progress" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own progress
CREATE POLICY "Users can update their own progress" 
ON "public"."user_progress" 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own progress
CREATE POLICY "Users can delete their own progress" 
ON "public"."user_progress" 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS speech_exercises_exercise_type_idx ON "public"."speech_exercises" (exercise_type);
CREATE INDEX IF NOT EXISTS speech_exercises_difficulty_level_idx ON "public"."speech_exercises" (difficulty_level);
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON "public"."user_progress" (user_id);
CREATE INDEX IF NOT EXISTS user_progress_exercise_id_idx ON "public"."user_progress" (exercise_id);
CREATE INDEX IF NOT EXISTS user_progress_user_exercise_idx ON "public"."user_progress" (user_id, exercise_id);

-- Insert sample data for speech_exercises
INSERT INTO "public"."speech_exercises" (
  "title", 
  "description", 
  "exercise_type", 
  "content", 
  "difficulty_level", 
  "age_group"
) VALUES 
(
  'R Sounds Practice', 
  'Practice words with R sounds to improve pronunciation', 
  'repeat', 
  '{"phrases": ["Red rabbit", "Green grass grows", "Bright rainbow"], "focus": "R Sounds"}', 
  1, 
  '8-13'
),
(
  'S Sounds Practice', 
  'Practice words with S sounds', 
  'repeat', 
  '{"phrases": ["Sally sells seashells", "Six silly snakes", "Sunny summers"], "focus": "S Sounds"}', 
  1, 
  '8-13'
),
(
  'Simple Reading Passage', 
  'A short passage about animals', 
  'reading', 
  '{"text": "The quick brown fox jumps over the lazy dog. The dog was not very happy about this, but the fox was having fun.", "focus": "Sentence Flow"}', 
  2, 
  '8-13'
),
(
  'Th Sounds Practice', 
  'Practice words with Th sounds', 
  'repeat', 
  '{"phrases": ["The three thieves", "Think thoughtfully", "That thing there"], "focus": "Th Sounds"}', 
  2, 
  '8-13'
); 