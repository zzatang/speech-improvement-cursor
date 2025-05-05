/**
 * IMPORTANT: Configure Clerk JWT Template
 * 
 * To fix the "Row Level Security Policy" errors with Supabase, you need to properly
 * configure your Clerk JWT template for Supabase integration.
 * 
 * Steps:
 * 1. Go to the Clerk Dashboard (https://dashboard.clerk.dev/)
 * 2. Select your application
 * 3. Navigate to JWT Templates
 * 4. Create a new template named "supabase" with these claims:
 * 
 * {
 *   "role": "authenticated",
 *   "aud": "authenticated",
 *   "sub": "{{user.id}}"
 * }
 * 
 * This ensures that Clerk generates JWTs that Supabase recognizes as authenticated,
 * allowing the Row Level Security policies to work correctly.
 * 
 * For more details on Clerk+Supabase integration see:
 * https://clerk.com/docs/integrations/databases/supabase
 */

export {}; 