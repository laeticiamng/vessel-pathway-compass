

# Route Protection for /app Routes

## Approach

Create an auth guard component that uses Supabase's `onAuthStateChange` listener to track session state. Wrap the `/app` route in this guard — unauthenticated users get redirected to `/auth`.

## Files to Create

1. **`src/hooks/useAuth.tsx`** — Auth context provider + hook
   - `AuthProvider` wraps the app, listens to `onAuthStateChange` (set up before `getSession()`)
   - Exposes `{ user, session, loading }` via `useAuth()` hook
   - Three states: loading, authenticated, unauthenticated

2. **`src/components/ProtectedRoute.tsx`** — Guard component
   - Uses `useAuth()` to check session
   - Shows a centered spinner while loading
   - Redirects to `/auth` if no session
   - Renders `<Outlet />` if authenticated

## Files to Modify

3. **`src/App.tsx`** — Wrap app with `<AuthProvider>`, change `/app` route element from `<AppLayout />` to `<ProtectedRoute />` which renders `<AppLayout />` inside it

4. **`src/pages/Auth.tsx`** — If user is already logged in, redirect to `/app` (prevent accessing login when authenticated)

