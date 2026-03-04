import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "./layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PublicAppRoute() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
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

  // Redirect authenticated users who haven't completed onboarding
  if (user && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppLayout />;
}
