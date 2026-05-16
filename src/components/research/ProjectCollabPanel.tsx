import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Send, Trash2, Copy, MessageSquare, Users } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

type Member = { id: string; user_id: string; project_role: string; created_at: string; display_name?: string | null };
type Invitation = { id: string; invited_email: string; invited_role: string; status: string; token: string; created_at: string };
type Message = { id: string; author_id: string; body: string; created_at: string; display_name?: string | null };

interface Props {
  projectId: string;
  ownerId: string;
}

export function ProjectCollabPanel({ projectId, ownerId }: Props) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const isOwner = userId === ownerId;

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myRole, setMyRole] = useState<string>("viewer");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;

    // Members + profile join (display_name)
    const { data: m } = await supabase
      .from("project_members")
      .select("id,user_id,project_role,created_at")
      .eq("project_id", projectId);
    const memberRows = m ?? [];
    const userIds = Array.from(new Set([ownerId, ...memberRows.map((r) => r.user_id)]));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id,display_name")
      .in("user_id", userIds);
    const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
    const fullMembers: Member[] = [
      { id: "owner", user_id: ownerId, project_role: "owner", created_at: "", display_name: nameMap.get(ownerId) },
      ...memberRows.map((r) => ({ ...r, display_name: nameMap.get(r.user_id) })),
    ];
    setMembers(fullMembers);

    // My role
    if (userId === ownerId) setMyRole("owner");
    else {
      const mine = memberRows.find((r) => r.user_id === userId);
      setMyRole(mine?.project_role ?? "viewer");
    }

    // Invitations (owner only)
    if (userId === ownerId) {
      const { data: inv } = await supabase
        .from("project_invitations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      setInvitations(inv ?? []);
    }

    // Messages
    const { data: msg } = await supabase
      .from("project_messages")
      .select("id,author_id,body,created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(200);
    const authorIds = Array.from(new Set((msg ?? []).map((x) => x.author_id)));
    const { data: authorProfiles } = authorIds.length
      ? await supabase.from("profiles").select("user_id,display_name").in("user_id", authorIds)
      : { data: [] as any[] };
    const authorMap = new Map((authorProfiles ?? []).map((p) => [p.user_id, p.display_name]));
    setMessages((msg ?? []).map((x) => ({ ...x, display_name: authorMap.get(x.author_id) })));
  }, [projectId, userId, ownerId]);

  useEffect(() => { load(); }, [load]);

  // Realtime messages
  useEffect(() => {
    const ch = supabase
      .channel(`project-${projectId}-messages`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [projectId, load]);

  const sendInvite = async () => {
    const parsed = emailSchema.safeParse(inviteEmail);
    if (!parsed.success) return toast.error("Invalid email");
    if (!userId) return;
    const { error } = await supabase.from("project_invitations").insert({
      project_id: projectId, invited_email: parsed.data.toLowerCase(), invited_role: inviteRole, invited_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Invitation created");
    setInviteEmail("");
    load();
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/app/research/hardware-designer?accept=${token}&project=${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("project_invitations").update({ status: "revoked" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Revoked"); load(); }
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); load(); }
  };

  const changeRole = async (id: string, role: string) => {
    const { error } = await supabase.from("project_members").update({ project_role: role }).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !userId) return;
    if (body.length > 4000) return toast.error("Message too long");
    const { error } = await supabase.from("project_messages").insert({
      project_id: projectId, author_id: userId, body,
    });
    if (error) toast.error(error.message); else setDraft("");
  };

  const canWrite = myRole === "owner" || myRole === "editor";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Members + invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Team ({members.length})</CardTitle>
          <CardDescription>Your role: <Badge variant="outline">{myRole}</Badge></CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="flex-1 truncate">{m.display_name ?? m.user_id.slice(0, 8)}</span>
                {isOwner && m.project_role !== "owner" ? (
                  <>
                    <Select value={m.project_role} onValueChange={(v) => changeRole(m.id, v)}>
                      <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">editor</SelectItem>
                        <SelectItem value="viewer">viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => removeMember(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">{m.project_role}</Badge>
                )}
              </li>
            ))}
          </ul>

          {isOwner && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Invite partner</p>
              <div className="flex gap-2">
                <Input type="email" placeholder="email@org.ch" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">editor</SelectItem>
                    <SelectItem value="viewer">viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={sendInvite}><UserPlus className="h-4 w-4" /></Button>
              </div>

              {invitations.length > 0 && (
                <ul className="space-y-1 text-xs">
                  {invitations.map((i) => (
                    <li key={i.id} className="flex items-center gap-2 rounded border p-2">
                      <span className="flex-1 truncate">{i.invited_email}</span>
                      <Badge variant="outline">{i.invited_role}</Badge>
                      <Badge variant={i.status === "pending" ? "default" : "secondary"}>{i.status}</Badge>
                      {i.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => copyInviteLink(i.token)}><Copy className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => revokeInvite(i.id)}><Trash2 className="h-3 w-3" /></Button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />Discussion</CardTitle>
          <CardDescription>{messages.length} messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-80 space-y-2 overflow-y-auto rounded border bg-muted/20 p-2">
            {messages.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className="rounded bg-background p-2 text-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{m.display_name ?? m.author_id.slice(0, 8)}</span>
                  <span>· {new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
          </div>
          {canWrite ? (
            <div className="flex gap-2">
              <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" maxLength={4000} />
              <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Read-only access.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
