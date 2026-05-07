import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { Languages, AlertTriangle, FileSearch, ExternalLink, Download } from "lucide-react";
import qaReport from "@/generated/i18nQa.json";

type MissingEntry = {
  key: string;
  files: string[];
  routes: string[];
  fileRoutes?: Record<string, string[]>;
};
type ChangelogIssue = {
  slug: string;
  key: string;
  missingLocales: string[];
  observedTitles: Record<string, string>;
};
type Report = {
  generatedAt: string;
  totals: {
    usedKeys: number;
    missing: Record<string, number>;
    changelogSectionIssues: number;
    pagesIndexed?: number;
  };
  missingByLocale: Record<"en" | "fr" | "de", MissingEntry[]>;
  fileRoutes?: Record<string, string[]>;
  changelog: { sections: unknown[]; issues: ChangelogIssue[] };
};

const REPORT = qaReport as Report;
const LOCALES: Array<"en" | "fr" | "de"> = ["en", "fr", "de"];

export default function I18nQaAdmin() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
    enabled: !!user,
  });

  const isAdmin = roles?.includes("admin") || roles?.includes("super_admin");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return REPORT.missingByLocale;
    const out: Report["missingByLocale"] = { en: [], fr: [], de: [] };
    for (const loc of LOCALES) {
      out[loc] = REPORT.missingByLocale[loc].filter(
        (e) =>
          e.key.toLowerCase().includes(q) ||
          e.files.some((f) => f.toLowerCase().includes(q)),
      );
    }
    return out;
  }, [search]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(REPORT, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `i18n-qa-${REPORT.generatedAt}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEOHead title="Translation QA — Admin" description="Per-locale missing i18n keys and changelog parity audit." />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Languages className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Translation QA</h1>
            <p className="text-sm text-muted-foreground">
              Generated {new Date(REPORT.generatedAt).toLocaleString()} — {REPORT.totals.usedKeys} used keys scanned.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadJson}>
          <Download className="h-4 w-4 mr-2" /> Export JSON
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LOCALES.map((loc) => (
          <Card key={loc}>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs">{loc}</CardDescription>
              <CardTitle className="text-3xl flex items-baseline gap-2">
                {REPORT.totals.missing[loc]}
                <span className="text-xs font-normal text-muted-foreground">missing</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs">Changelog</CardDescription>
            <CardTitle className="text-3xl flex items-baseline gap-2">
              {REPORT.totals.changelogSectionIssues}
              <span className="text-xs font-normal text-muted-foreground">section issues</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Missing keys per locale
            </CardTitle>
            <Input
              placeholder="Filter by key or file…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList>
              {LOCALES.map((loc) => (
                <TabsTrigger key={loc} value={loc}>
                  {loc.toUpperCase()} ({filtered[loc].length})
                </TabsTrigger>
              ))}
            </TabsList>
            {LOCALES.map((loc) => (
              <TabsContent key={loc} value={loc}>
                {filtered[loc].length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No missing keys for {loc.toUpperCase()} ✅
                  </p>
                ) : (
                  <ScrollArea className="h-[480px] pr-4">
                    <ul className="space-y-3">
                      {filtered[loc].map((entry) => (
                        <li
                          key={entry.key}
                          className="rounded-md border border-border p-3 text-sm space-y-2"
                        >
                          <code className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded break-all">
                            {entry.key}
                          </code>
                          <div className="flex flex-wrap gap-2">
                            {entry.routes.map((r) => (
                              <Button
                                key={r}
                                size="sm"
                                variant="secondary"
                                asChild
                                className="h-7 text-xs"
                              >
                                <Link to={r}>
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {r}
                                </Link>
                              </Button>
                            ))}
                            {entry.routes.length === 0 && (
                              <Badge variant="outline" className="text-xs">No direct route</Badge>
                            )}
                          </div>
                          <details className="text-xs text-muted-foreground" open>
                            <summary className="cursor-pointer">
                              Files & screens ({entry.files.length})
                            </summary>
                            <ul className="mt-2 space-y-2 pl-1">
                              {entry.files.map((f) => {
                                const fr = entry.fileRoutes?.[f] ?? [];
                                return (
                                  <li key={f} className="border-l-2 border-muted pl-2">
                                    <code className="block break-all">{f}</code>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {fr.length === 0 ? (
                                        <Badge variant="outline" className="text-[10px]">
                                          Not mounted on any route
                                        </Badge>
                                      ) : (
                                        fr.map((r) => (
                                          <Button
                                            key={r}
                                            size="sm"
                                            variant="secondary"
                                            asChild
                                            className="h-6 text-[11px] px-2"
                                          >
                                            <Link to={r}>
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              {r}
                                            </Link>
                                          </Button>
                                        ))
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Changelog section variants
          </CardTitle>
          <CardDescription>
            Every section title in the generated changelog must resolve to a translation key in
            every locale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {REPORT.changelog.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">All section variants resolve in EN/FR/DE ✅</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {REPORT.changelog.issues.map((iss) => (
                <li key={iss.slug} className="rounded border border-border p-3">
                  <code className="font-mono text-xs">{iss.key}</code>
                  <div className="mt-1 text-xs">
                    Missing in:{" "}
                    {iss.missingLocales.map((l) => (
                      <Badge key={l} variant="destructive" className="mr-1 uppercase">
                        {l}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Observed titles: {JSON.stringify(iss.observedTitles)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
