import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Brain, AlertTriangle, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const PAGE_SIZE = 50;

export default function Compliance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [auditPage, setAuditPage] = useState(0);

  // --- Audit logs with pagination ---
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["audit_logs", auditPage],
    queryFn: async () => {
      const from = 0;
      const to = (auditPage + 1) * PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // --- Stats: audit count ---
  const { data: auditCount } = useQuery({
    queryKey: ["audit_logs_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // --- Stats: ai_outputs count ---
  const { data: aiOutputsCount } = useQuery({
    queryKey: ["ai_outputs_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ai_outputs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // --- Stats: pending sign-offs ---
  const { data: pendingSignoffs } = useQuery({
    queryKey: ["ai_outputs_pending"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ai_outputs")
        .select("*", { count: "exact", head: true })
        .eq("user_signoff", false);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // --- Stats: consents count ---
  const { data: consentsCount } = useQuery({
    queryKey: ["consents_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("consents")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // --- Consents list ---
  const { data: consents, isLoading: consentsLoading } = useQuery({
    queryKey: ["consents_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // --- AI Safety metrics ---
  const { data: aiSafety, isLoading: aiSafetyLoading } = useQuery({
    queryKey: ["ai_safety_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_outputs")
        .select("model_version, user_signoff")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const total = data.length;
      const signedOff = data.filter((d) => d.user_signoff).length;
      const latestModel = data[0]?.model_version ?? "—";
      const signOffRate = total > 0 ? ((signedOff / total) * 100).toFixed(1) : "—";
      const issues = total - signedOff;
      return { latestModel, signOffRate, issues, total };
    },
  });

  // Group consents by type
  const consentsByType = consents
    ? consents.reduce<Record<string, { granted: number; revoked: number; total: number }>>((acc, c) => {
        if (!acc[c.consent_type]) acc[c.consent_type] = { granted: 0, revoked: 0, total: 0 };
        acc[c.consent_type].total++;
        if (c.granted) acc[c.consent_type].granted++;
        else acc[c.consent_type].revoked++;
        return acc;
      }, {})
    : {};

  const stats = [
    { label: t("compliance.stats.auditEvents"), value: auditCount?.toLocaleString() ?? "—", icon: FileText },
    { label: t("compliance.stats.aiOutputsLogged"), value: aiOutputsCount?.toLocaleString() ?? "—", icon: Brain },
    { label: t("compliance.stats.issuesReported"), value: pendingSignoffs?.toLocaleString() ?? "—", icon: AlertTriangle },
    { label: t("compliance.stats.consentsActive"), value: consentsCount?.toLocaleString() ?? "—", icon: CheckCircle2 },
  ];

  const hasMoreAudit = auditLogs && auditLogs.length >= (auditPage + 1) * PAGE_SIZE;

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title={t("seo.compliance.title") as string} description={t("seo.compliance.description") as string} path="/app/compliance" noindex />
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          {t("compliance.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("compliance.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">{t("compliance.tabs.audit")}</TabsTrigger>
          <TabsTrigger value="consent">{t("compliance.tabs.consent")}</TabsTrigger>
          <TabsTrigger value="ai-safety">{t("compliance.tabs.aiSafety")}</TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance.tabs.audit")}</CardTitle>
              <CardDescription>{t("compliance.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !auditLogs || auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-10 w-10 mb-3" />
                   <p className="text-sm">{t("compliance.empty.audit")}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-muted-foreground">{t("compliance.table.action")}</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">{t("compliance.table.type")}</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">{t("compliance.table.status")}</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">{t("compliance.table.time")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => {
                          const details = log.details as Record<string, string> | null;
                          const status = details?.status ?? "—";
                          return (
                            <tr key={log.id} className="border-b last:border-0">
                              <td className="p-3 font-medium">{log.action}</td>
                              <td className="p-3">
                                <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                              </td>
                              <td className="p-3">
                                <Badge variant={status === "Pending" ? "destructive" : "secondary"} className="text-xs">
                                  {status}
                                </Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {format(new Date(log.created_at), "yyyy-MM-dd HH:mm")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {hasMoreAudit && (
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setAuditPage((p) => p + 1)}>
                        {t("compliance.loadMore")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance.tabs.consent")}</CardTitle>
              <CardDescription>{t("compliance.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {consentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : Object.keys(consentsByType).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-10 w-10 mb-3" />
                   <p className="text-sm">{t("compliance.empty.consent")}</p>
                </div>
              ) : (
                Object.entries(consentsByType).map(([type, counts]) => (
                  <div key={type} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-sm font-medium">{type}</span>
                         <p className="text-xs text-muted-foreground">
                           {counts.granted} {t("compliance.consent.granted")} · {counts.revoked} {t("compliance.consent.revoked")}
                         </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{counts.total}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Safety Tab */}
        <TabsContent value="ai-safety" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance.tabs.aiSafety")}</CardTitle>
              <CardDescription>{t("compliance.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSafetyLoading ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !aiSafety || aiSafety.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-10 w-10 mb-3" />
                  <p className="text-sm">{t("compliance.empty.aiOutputs")}</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">{t("compliance.aiSafetyMetrics.modelVersion")}</p>
                    <p className="text-lg font-bold mt-1">{aiSafety.latestModel}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">{t("compliance.aiSafetyMetrics.signOffRate")}</p>
                    <p className="text-lg font-bold mt-1">{aiSafety.signOffRate}%</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">{t("compliance.aiSafetyMetrics.issuesReported")}</p>
                    <p className="text-lg font-bold mt-1">{aiSafety.issues}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
