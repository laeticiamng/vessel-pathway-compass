import { useState, useEffect } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Users, Plus, Banknote } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function Collab() {
  const { session } = useAuth();
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [funding, setFunding] = useState<any[]>([]);
  const [pName, setPName] = useState("");
  const [pOrg, setPOrg] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [fName, setFName] = useState("");
  const [fAgency, setFAgency] = useState("");
  const [fAmount, setFAmount] = useState("");

  const load = async () => {
    if (!session) return;
    const [{ data: p }, { data: f }] = await Promise.all([
      supabase.from("partnerships").select("*").order("created_at", { ascending: false }),
      supabase.from("funding_applications").select("*").order("created_at", { ascending: false }),
    ]);
    setPartnerships(p ?? []);
    setFunding(f ?? []);
  };
  useEffect(() => { load(); }, [session]);

  const addPartner = async () => {
    if (!session || !pName.trim()) return toast.error("Name required");
    const { error } = await supabase.from("partnerships").insert({
      user_id: session.user.id,
      partner_name: pName.trim(),
      partner_institution: pOrg.trim() || null,
      notes: pDesc.trim() || null,
      status: "active",
    });
    if (error) toast.error(error.message); else { toast.success("Partnership added"); setPName(""); setPOrg(""); setPDesc(""); load(); }
  };
  const addFunding = async () => {
    if (!session || !fName.trim()) return toast.error("Funder required");
    const { error } = await supabase.from("funding_applications").insert({
      user_id: session.user.id,
      funder: fName.trim(),
      programme: fAgency.trim() || null,
      amount_eur: fAmount ? Number(fAmount) : null,
      status: "draft",
    });
    if (error) toast.error(error.message); else { toast.success("Application added"); setFName(""); setFAgency(""); setFAmount(""); load(); }
  };

  return (
    <>
      <SEOHead title="Collaboration Hub — VASCU-LINK" description="Research partnerships and funding tracking." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Collaboration Hub</h1>
          </div>
          <p className="text-muted-foreground">Track research partnerships and funding applications.</p>
        </header>

        <Tabs defaultValue="partnerships">
          <TabsList>
            <TabsTrigger value="partnerships"><Users className="mr-1 h-4 w-4" />Partnerships</TabsTrigger>
            <TabsTrigger value="funding"><Banknote className="mr-1 h-4 w-4" />Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="partnerships" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>New partnership</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1"><Label>Name</Label><Input value={pName} onChange={(e) => setPName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Organisation</Label><Input value={pOrg} onChange={(e) => setPOrg(e.target.value)} /></div>
                <div className="space-y-1 md:col-span-2"><Label>Description</Label><Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} /></div>
                <Button onClick={addPartner} className="md:col-span-2"><Plus className="mr-1 h-4 w-4" />Add</Button>
              </CardContent>
            </Card>
            <div className="grid gap-3 md:grid-cols-2">
              {partnerships.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">{p.partner_name}<Badge variant="outline">{p.status}</Badge></CardTitle>
                    <CardDescription>{p.partner_institution}</CardDescription>
                  </CardHeader>
                  {p.notes && <CardContent className="text-sm">{p.notes}</CardContent>}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>New funding application</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1"><Label>Funder</Label><Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="SNSF, ERC, Innosuisse…" /></div>
                <div className="space-y-1"><Label>Programme</Label><Input value={fAgency} onChange={(e) => setFAgency(e.target.value)} /></div>
                <div className="space-y-1"><Label>Amount (EUR)</Label><Input type="number" value={fAmount} onChange={(e) => setFAmount(e.target.value)} /></div>
                <Button onClick={addFunding} className="md:col-span-3"><Plus className="mr-1 h-4 w-4" />Add</Button>
              </CardContent>
            </Card>
            <div className="grid gap-3 md:grid-cols-2">
              {funding.map((f) => (
                <Card key={f.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">{f.funder}<Badge variant="outline">{f.status}</Badge></CardTitle>
                    <CardDescription>{f.programme} {f.amount_eur ? `· ${Number(f.amount_eur).toLocaleString()} €` : ""}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
