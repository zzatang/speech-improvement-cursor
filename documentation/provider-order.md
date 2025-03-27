# Provider Order in Next.js App Router

This document provides guidelines for correctly ordering providers in a Next.js application to avoid React hooks issues.

## Root Layout Provider Structure

When using multiple providers in a Next.js application, it's important to:

1. Use the `"use client"` directive for client-side providers
2. Initialize stateful objects (like QueryClient) inside the component using useState
3. Maintain a consistent nesting order

### Recommended Provider Order

```tsx
<html lang="en" suppressHydrationWarning>
  <body>
    {/* Theme provider (affects entire app appearance) */}
    <ThemeProvider>
      {/* Auth provider (needed for authenticated API calls) */}
      <AuthProvider>
        {/* Data fetching provider */}
        <TanstackClientProvider>
          {/* Toast/notification provider */}
          <ToastProvider>
            {children}
          </ToastProvider>
        </TanstackClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </body>
</html>
```

## Common React Hooks Errors

If you encounter the error: `Invalid hook call. Hooks can only be called inside of the body of a function component`, check for:

1. **Version mismatch** - Ensure React, React DOM, and Next.js have compatible versions
2. **Multiple React instances** - Make sure you don't have duplicate React installations
3. **Breaking Rules of Hooks** - Verify hooks are only called from:
   - React function components
   - Custom hooks
   - Not inside loops, conditions, or nested functions

## Troubleshooting

If hooks errors persist:

1. Clear Next.js cache: `npm run next clean`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for duplicate React entries in package-lock.json
4. Verify all client components use the "use client" directive
5. Use the React DevTools to identify unexpected component behavior

## Key Points to Remember

- Keep providers that use React context at a higher level
- Initialize stateful providers with useState hooks
- Add suppressHydrationWarning to HTML tag to prevent hydration errors
- Use useEffect for side effects in client components 