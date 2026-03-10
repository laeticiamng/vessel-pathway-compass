import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  postId: string;
  className?: string;
}

export default function VoteButtons({ postId, className }: VoteButtonsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: votes } = useQuery({
    queryKey: ["forum-votes", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_votes")
        .select("user_id, vote_type")
        .eq("post_id", postId);
      if (error) throw error;
      return data;
    },
  });

  const { upCount, downCount, userVote } = useMemo(() => {
    const up = votes?.filter((v) => v.vote_type === "up").length ?? 0;
    const down = votes?.filter((v) => v.vote_type === "down").length ?? 0;
    const mine = votes?.find((v) => v.user_id === user?.id)?.vote_type ?? null;
    return { upCount: up, downCount: down, userVote: mine };
  }, [votes, user?.id]);

  const voteMutation = useMutation({
    mutationFn: async (type: "up" | "down") => {
      if (!user) throw new Error("Not authenticated");

      if (userVote === type) {
        // Remove vote
        const { error } = await supabase
          .from("forum_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else if (userVote) {
        // Change vote
        const { error } = await supabase
          .from("forum_votes")
          .update({ vote_type: type })
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // New vote
        const { error } = await supabase
          .from("forum_votes")
          .insert({ post_id: postId, user_id: user.id, vote_type: type });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-votes", postId] });
    },
  });

  const score = upCount - downCount;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 sm:h-7 sm:w-7",
          userVote === "up" && "text-primary bg-primary/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          voteMutation.mutate("up");
        }}
        disabled={!user || voteMutation.isPending}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <span
        className={cn(
          "text-xs font-semibold tabular-nums min-w-[1.25rem] text-center",
          score > 0 && "text-primary",
          score < 0 && "text-destructive",
          score === 0 && "text-muted-foreground"
        )}
      >
        {score}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 sm:h-7 sm:w-7",
          userVote === "down" && "text-destructive bg-destructive/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          voteMutation.mutate("down");
        }}
        disabled={!user || voteMutation.isPending}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
