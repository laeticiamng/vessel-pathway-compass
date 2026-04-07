import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MessageSquare, Plus, Users, HelpCircle, Loader2, ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import ForumThreadDetail from "@/components/network/ForumThreadDetail";
import VoteButtons from "@/components/network/VoteButtons";

const TOPICS = ["general", "cases", "imaging", "research", "contrast-sparing", "simulation"] as const;

export default function Network() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState<string>("general");
  const [tab, setTab] = useState("forum");

  // Fetch forum posts (top-level only)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*, profiles:user_id(display_name)")
        .is("parent_id", null)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch reply counts
  const { data: replyCounts } = useQuery({
    queryKey: ["forum-reply-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("parent_id")
        .not("parent_id", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        if (r.parent_id) counts[r.parent_id] = (counts[r.parent_id] || 0) + 1;
      }
      return counts;
    },
    enabled: !!user,
  });

  // Fetch expert requests
  const { data: expertRequests } = useQuery({
    queryKey: ["expert-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("forum_posts").insert({
        title,
        content,
        topic,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setCreateOpen(false);
      setTitle("");
      setContent("");
      toast.success(t("network.postCreated") || "Post created");
    },
    onError: () => toast.error(t("auth.error")),
  });

  const selectedPost = posts?.find((p) => p.id === selectedPostId);
  if (selectedPost) {
    return (
      <ForumThreadDetail
        post={selectedPost}
        onBack={() => setSelectedPostId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title="Network & Forum" description="Community forum and expert network" path="/app/network" noindex />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("network.title") || "Network & Forum"}
          </h1>
          <p className="text-muted-foreground mt-1">{t("network.subtitle") || "Discuss cases, share knowledge, and connect with experts"}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("network.newPost") || "New Post"}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="forum" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {t("network.tabs.forum") || "Forum"}</TabsTrigger>
          <TabsTrigger value="experts" className="gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> {t("network.tabs.experts") || "Expert Requests"}</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="mt-6 space-y-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          {!isLoading && (posts?.length ?? 0) === 0 && (
            <Card><CardContent className="py-12 text-center"><MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">{t("network.emptyForum") || "No posts yet. Be the first to start a discussion!"}</p></CardContent></Card>
          )}
          {posts?.map((post) => (
            <Card key={post.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedPostId(post.id)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <VoteButtons postId={post.id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.is_pinned && <Badge variant="default" className="text-xs">📌 Pinned</Badge>}
                      <Badge variant="secondary" className="text-xs capitalize">{post.topic}</Badge>
                      <h3 className="font-semibold">{post.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{(post as any).profiles?.display_name || "Anonymous"}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {replyCounts?.[post.id] ?? 0}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="experts" className="mt-6 space-y-4">
          {(expertRequests?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-12 text-center"><HelpCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">{t("network.emptyExperts") || "No expert requests yet"}</p></CardContent></Card>
          ) : (
            expertRequests!.map((req) => (
              <Card key={req.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{req.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{req.topic}</Badge>
                        <Badge variant={req.status === "answered" ? "default" : "outline"} className="text-xs capitalize">{req.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.case_summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("network.newPost") || "New Post"}</DialogTitle>
            <DialogDescription>{t("network.newPostDesc") || "Share a question, case discussion, or insight with the community"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("network.fields.title") || "Title"}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." />
            </div>
            <div>
              <label className="text-sm font-medium">{t("network.fields.topic") || "Topic"}</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("network.fields.content") || "Content"}</label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createPost.mutate()} disabled={!title.trim() || !content.trim() || createPost.isPending}>
              {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
