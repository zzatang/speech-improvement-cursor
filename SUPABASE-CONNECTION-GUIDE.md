# Supabase Connection Guide

If you're experiencing issues connecting to the Supabase database, follow these steps to resolve the problem.

## 1. Quick Fix (Temporary)

When you see the "Unable to connect to the database" error:

1. Click the "Configure Connection" button
2. Enter your Supabase URL and Anon Key (from your Supabase project dashboard)
3. Click "Save & Reload"

This will store your connection details in your browser's localStorage and allow you to continue working.

## 2. Permanent Fix

For a permanent solution, set up your environment variables:

1. Create a `.env.local` file in the root of your project
2. Add these lines (replacing with your values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Save the file and restart your development server:
```
npm run dev
```

## 3. Finding Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Project Settings > API
4. Copy the "Project URL" (this is your NEXT_PUBLIC_SUPABASE_URL)
5. Copy the "anon public" key (this is your NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 4. Common Issues

### Environment Variables Not Loading

Next.js requires `.env.local` for local development. Make sure:
- The file is named exactly `.env.local` (not `.env`)
- The file is in the root directory of your project
- There are no spaces around the `=` sign
- You've restarted your development server after creating/editing the file

### Invalid URL or Key

- Ensure your URL starts with `https://` and ends with `.supabase.co`
- Your anon key should be a long string of characters
- Don't include quotes around the values in your `.env.local` file

### Still Having Issues?

If you're still experiencing connection problems:

1. Try using the localStorage method as a temporary workaround
2. Check if your Supabase project is active in the dashboard
3. Verify your credentials by testing them in the Supabase dashboard
4. Clear your browser cache and try again

## 5. Next Steps

Once your connection is working:

1. You'll be able to see your dashboard with your profile information
2. Streak and progress data will be tracked properly
3. Your exercises and achievements will be saved to your profile

If you're still experiencing issues, please contact the development team for further assistance. 