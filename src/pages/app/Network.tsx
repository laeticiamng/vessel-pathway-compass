import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Globe, MessageSquare, Users, Search, Send, Clock } from "lucide-react";
import ForumThreadDetail from "@/components/network/ForumThreadDetail";
import VoteButtons from "@/components/network/VoteButtons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { forumPostSchema, expertRequestSchema } from "@/lib/validation";

const TOPICS = ["PAD", "Aorta", "Venous", "Carotid", "Wounds", "Thrombosis"] as const;

export default function Network() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return (t("timeAgo.minutesAgo") as string).replace("{{count}}", String(mins));
    const hours = Math.floor(mins / 60);
    if (hours < 24) return (t("timeAgo.hoursAgo") as string).replace("{{count}}", String(hours));
    const days = Math.floor(hours / 24);
    return (t("timeAgo.daysAgo") as string).replace("{{count}}", String(days));
  }
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [expertDialogOpen, setExpertDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // New discussion form
  const [postTitle, setPostTitle] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [postContent, setPostContent] = useState("");

  // Ask expert form
  const [expertTitle, setExpertTitle] = useState("");
  const [expertTopic, setExpertTopic] = useState("");
  const [expertSummary, setExpertSummary] = useState("");

  // Fetch forum posts (top-level only)
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      // Get reply counts
      const postIds = data.map((p) => p.id);
      if (postIds.length === 0) return data.map((p) => ({ ...p, replyCount: 0 }));

      const { data: replies } = await supabase
        .from("forum_posts")
        .select("parent_id")
        .in("parent_id", postIds);

      const countMap = new Map<string, number>();
      for (const r of replies ?? []) {
        if (r.parent_id) countMap.set(r.parent_id, (countMap.get(r.parent_id) ?? 0) + 1);
      }

      return data.map((p) => ({ ...p, replyCount: countMap.get(p.id) ?? 0 }));
    },
    enabled: !!user,
  });

  // Fetch expert requests
  const { data: expertRequests, isLoading: expertLoading } = useQuery({
    queryKey: ["expert-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Create discussion
  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const parsed = forumPostSchema.safeParse({ title: postTitle, topic: postTopic || "General", content: postContent });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.from("forum_posts").insert({
        title: parsed.data.title,
        topic: parsed.data.topic,
        content: parsed.data.content,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setPostDialogOpen(false);
      setPostTitle(""); setPostTopic(""); setPostContent("");
      toast({ title: t("common.create"), description: t("network.newDiscussion") });
    },
    onError: (err: Error) => {
      toast({ title: t("network.errorTitle"), description: err.message, variant: "destructive" });
    },
  });

  // Create expert request
  const createExpertReq = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("expert_requests").insert({
        title: expertTitle,
        topic: expertTopic || "General",
        case_summary: expertSummary,
        requester_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-requests"] });
      setExpertDialogOpen(false);
      setExpertTitle(""); setExpertTopic(""); setExpertSummary("");
      toast({ title: t("common.create"), description: t("network.submitCase") });
    },
    onError: (err: Error) => {
      toast({ title: t("network.errorTitle"), description: err.message, variant: "destructive" });
    },
  });

  const filteredPosts = posts?.filter((p) => {
    if (selectedTopic && p.topic !== selectedTopic) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          {t("network.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("network.subtitle")}</p>
      </div>

      <Tabs defaultValue="discussions">
        <TabsList>
          <TabsTrigger value="discussions">{t("network.tabs.discussions")}</TabsTrigger>
          <TabsTrigger value="ask-expert">{t("network.tabs.askExpert")}</TabsTrigger>
          <TabsTrigger value="mentorship">{t("network.tabs.mentorship")}</TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="mt-6 space-y-4">
          {selectedPostId ? (
            <ForumThreadDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
          ) : (
            <>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("network.searchDiscussions")}
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => setPostDialogOpen(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("network.newDiscussion")}
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedTopic === null ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTopic(null)}
                >
                  {t("patients.filters.allCategories")}
                </Badge>
                {TOPICS.map((tp) => (
                  <Badge
                    key={tp}
                    variant={selectedTopic === tp ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setSelectedTopic(selectedTopic === tp ? null : tp)}
                  >
                    {tp}
                  </Badge>
                ))}
              </div>

              {postsLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}

              {!postsLoading && filteredPosts?.map((d) => (
                <Card key={d.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedPostId(d.id)}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <VoteButtons postId={d.id} />
                      <div>
                        <h3 className="font-semibold">{d.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{d.topic}</Badge>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {d.replyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(d.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!postsLoading && filteredPosts?.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">{t("network.emptyDiscussions")}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setPostDialogOpen(true)}>
                      {t("network.newDiscussion")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Ask Expert Tab */}
        <TabsContent value="ask-expert" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{t("network.tabs.askExpert")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("network.askExpertDesc")}</p>
            </div>
            <Button onClick={() => setExpertDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              {t("network.submitCase")}
            </Button>
          </div>

          {expertLoading &&
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))}

          {!expertLoading && expertRequests?.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{r.topic}</Badge>
                    <Badge variant={r.status === "pending" ? "secondary" : "default"} className="text-xs capitalize">{r.status}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(r.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.case_summary}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {!expertLoading && expertRequests?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Send className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">{t("network.emptyExperts")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mentorship Tab */}
        <TabsContent value="mentorship" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("network.tabs.mentorship")}</CardTitle>
              <CardDescription>{t("network.mentorshipComingSoon")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t("network.requestMentorship")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Discussion Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("network.newDiscussion")}</DialogTitle>
            <DialogDescription>{t("network.newDiscussionDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.title")}</Label>
               <Input placeholder={t("network.placeholders.postTitle")} value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.topic")}</Label>
               <Select value={postTopic} onValueChange={setPostTopic}>
                 <SelectTrigger><SelectValue placeholder={t("network.dialogLabels.selectTopic")} /></SelectTrigger>
                <SelectContent>
                  {TOPICS.map((tp) => (
                    <SelectItem key={tp} value={tp}>{tp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.content")}</Label>
               <Textarea placeholder={t("network.placeholders.postContent")} value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createPost.mutate()} disabled={!postTitle || !postContent || createPost.isPending}>
              {createPost.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Expert Request Dialog */}
      <Dialog open={expertDialogOpen} onOpenChange={setExpertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("network.submitCase")}</DialogTitle>
            <DialogDescription>{t("network.askExpertDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.title")}</Label>
               <Input placeholder={t("network.placeholders.expertTitle")} value={expertTitle} onChange={(e) => setExpertTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.topic")}</Label>
               <Select value={expertTopic} onValueChange={setExpertTopic}>
                 <SelectTrigger><SelectValue placeholder={t("network.dialogLabels.selectTopic")} /></SelectTrigger>
                <SelectContent>
                  {TOPICS.map((tp) => (
                    <SelectItem key={tp} value={tp}>{tp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>{t("network.dialogLabels.caseSummary")}</Label>
               <Textarea placeholder={t("network.placeholders.expertSummary")} value={expertSummary} onChange={(e) => setExpertSummary(e.target.value)} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpertDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createExpertReq.mutate()} disabled={!expertTitle || !expertSummary || createExpertReq.isPending}>
              {createExpertReq.isPending ? t("common.loading") : t("network.submitCase")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
