import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, Clock, Send, User } from "lucide-react";
import VoteButtons from "@/components/network/VoteButtons";
import { formatDistanceToNow } from "date-fns";

interface ForumThreadDetailProps {
  postId: string;
  onBack: () => void;
}

export default function ForumThreadDetail({ postId, onBack }: ForumThreadDetailProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");

  // Fetch parent post
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["forum-post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch replies
  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ["forum-replies", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("parent_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch display names for all user_ids
  const userIds = [
    ...(post ? [post.user_id] : []),
    ...(replies?.map((r) => r.user_id) ?? []),
  ];
  const uniqueUserIds = [...new Set(userIds)];

  const { data: profiles } = useQuery({
    queryKey: ["profiles-batch", uniqueUserIds.join(",")],
    queryFn: async () => {
      if (uniqueUserIds.length === 0) return {};
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", uniqueUserIds);
      const map: Record<string, string> = {};
      for (const p of data ?? []) {
        map[p.user_id] = p.display_name ?? "Anonymous";
      }
      return map;
    },
    enabled: uniqueUserIds.length > 0,
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !post) throw new Error("Not authenticated");
      const { error } = await supabase.from("forum_posts").insert({
        title: `Re: ${post.title}`,
        topic: post.topic,
        content: replyContent,
        user_id: user.id,
        parent_id: postId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setReplyContent("");
      toast({ title: t("network.thread.replyPosted") });
    },
    onError: (err: Error) => {
      toast({ title: t("network.errorTitle"), description: err.message, variant: "destructive" });
    },
  });

  const getName = (userId: string) => profiles?.[userId] ?? "Anonymous";

  if (postLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back")}
        </Button>
        <p className="text-muted-foreground">{t("network.thread.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> {t("network.thread.backToDiscussions")}
      </Button>

      {/* Original post */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <VoteButtons postId={post.id} className="mt-1" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline">{post.topic}</Badge>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {getName(post.user_id)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {replies?.length ?? 0}
            </Badge>
          </div>
          <Separator />
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">
          {t("network.thread.replies")} ({replies?.length ?? 0})
        </h3>

        {repliesLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}

        {!repliesLoading && replies?.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            {t("network.thread.noReplies")}
          </p>
        )}

        {replies?.map((reply) => (
          <Card key={reply.id} className="border-l-2 border-l-primary/30">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start gap-3">
                <VoteButtons postId={reply.id} className="mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User className="h-3 w-3" /> {getName(reply.user_id)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      {user && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold text-sm">{t("network.thread.writeReply")}</h3>
            <Textarea
              placeholder={t("network.thread.replyPlaceholder")}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => replyMutation.mutate()}
                disabled={!replyContent.trim() || replyMutation.isPending}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {replyMutation.isPending ? t("common.loading") : t("network.thread.reply")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
