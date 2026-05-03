import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute() {
  const { session, user, loading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-onboarding", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Wait for both auth and (if logged in) profile to settle before deciding.
  // Without this guard a slow network can briefly redirect to /onboarding
  // before the actual profile row arrives.
  if (loading || (!!user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Only redirect to onboarding when we have a definitive answer that it
  // hasn't been completed. If the profile fetch failed (profile === null
  // / undefined and not loading) we fall through to the app to avoid
  // trapping users in an onboarding loop.
  if (profile && profile.onboarding_completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppLayout />;
}
