-- Create user profiles for existing users who don't have them
INSERT INTO public.user_profiles (user_id, display_name, avatar_color, streak_count, overall_progress, created_at, updated_at)
SELECT 
  au.id::text,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Speech Star') as display_name,
  '#4F46E5' as avatar_color,
  0 as streak_count,
  0 as overall_progress,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id::text = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING; 