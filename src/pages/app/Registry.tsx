import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, BarChart3, TrendingUp, Shield } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";

const CATEGORIES = ["PAD", "Aortic", "Carotid", "Venous", "DVT/PE"] as const;

interface OutcomeRow {
  id: string;
  outcome_type: string;
  case_id: string;
  details: Record<string, unknown> | null;
  outcome_date: string;
}

interface CaseRow {
  id: string;
  category: string;
}

function computeCategoryStats(outcomes: OutcomeRow[], cases: CaseRow[]) {
  const caseMap = new Map(cases.map((c) => [c.id, c.category]));

  // Group outcomes by category
  const grouped: Record<string, OutcomeRow[]> = {};
  for (const o of outcomes) {
    const cat = caseMap.get(o.case_id) ?? "unknown";
    const normCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    if (!grouped[normCat]) grouped[normCat] = [];
    grouped[normCat].push(o);
  }

  return Object.entries(grouped).map(([category, items]) => {
    const total = items.length;
    const countType = (type: string) => items.filter((i) => i.outcome_type === type).length;

    const amputation = countType("amputation");
    const restenosis = countType("restenosis");
    const mortality = countType("mortality");
    const complication = countType("complication");

    const pct = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%");

    return {
      category,
      entries: total,
      amputation: pct(amputation),
      restenosis: pct(restenosis),
      mortality: pct(mortality),
      complications: pct(complication),
    };
  });
}

export default function Registry() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["registry-outcomes", user?.id],
    queryFn: async () => {
      // Fetch user's outcomes and their associated cases
      const [outcomesRes, casesRes, promsRes] = await Promise.all([
        supabase.from("outcomes").select("id, outcome_type, case_id, details, outcome_date").eq("created_by", user!.id),
        supabase.from("cases").select("id, category").eq("created_by", user!.id),
        supabase.from("proms").select("id, case_id").limit(1000),
      ]);

      if (outcomesRes.error) throw outcomesRes.error;
      if (casesRes.error) throw casesRes.error;

      const outcomes = outcomesRes.data as OutcomeRow[];
      const cases = casesRes.data as CaseRow[];
      const totalCases = cases.length;
      const totalOutcomes = outcomes.length;

      const mortalityCount = outcomes.filter((o) => o.outcome_type === "mortality").length;
      const complicationCount = outcomes.filter((o) => o.outcome_type === "complication").length;
      const promsCount = promsRes.data?.length ?? 0;
      const promsRate = totalCases > 0 ? `${Math.round((promsCount / totalCases) * 100)}%` : "0%";

      const mortalityRate = totalOutcomes > 0 ? `${((mortalityCount / totalOutcomes) * 100).toFixed(1)}%` : "0%";
      const complicationRate = totalOutcomes > 0 ? `${((complicationCount / totalOutcomes) * 100).toFixed(1)}%` : "0%";

      const byCategory = computeCategoryStats(outcomes, cases);

      return {
        totalCases,
        mortalityRate,
        complicationRate,
        promsRate,
        byCategory,
      };
    },
    enabled: !!user,
  });

  const summaryStats = [
    { label: t("registry.stats.casesContributed"), value: data?.totalCases ?? 0 },
    { label: t("registry.stats.mortality30day"), value: data?.mortalityRate ?? "—" },
    { label: t("registry.stats.complicationRate"), value: data?.complicationRate ?? "—" },
    { label: t("registry.stats.promsCollected"), value: data?.promsRate ?? "—" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title={t("seo.registry.title") as string} description={t("seo.registry.description") as string} path="/app/registry" noindex />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <LineChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("registry.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("registry.subtitle")}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5 self-start sm:self-auto">
          <Shield className="h-3 w-3" />
          {t("registry.badge")}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Badge key={cat} variant="secondary">{t(`medicalCategories.${cat.toLowerCase()}`) as string || cat}</Badge>
        ))}
      </div>

      <Tabs defaultValue="physician">
        <TabsList>
          <TabsTrigger value="physician">{t("registry.tabs.physician")}</TabsTrigger>
          <TabsTrigger value="institution">{t("registry.tabs.institution")}</TabsTrigger>
          <TabsTrigger value="benchmark">{t("registry.tabs.benchmarking")}</TabsTrigger>
        </TabsList>

        <TabsContent value="physician" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("registry.table.category")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("registry.table.category")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("registry.table.entries")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">{t("registry.table.amputation")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">{t("registry.table.restenosis")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("registry.table.mortality")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">{t("registry.table.complications")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="p-3"><Skeleton className="h-4 w-14" /></td>
                          ))}
                        </tr>
                      ))}
                    {!isLoading && data?.byCategory && data.byCategory.length > 0
                      ? data.byCategory.map((o) => (
                          <tr key={o.category} className="border-b last:border-0">
                            <td className="p-3 font-medium">{o.category}</td>
                            <td className="p-3">{o.entries}</td>
                            <td className="p-3 hidden sm:table-cell">{o.amputation}</td>
                            <td className="p-3 hidden sm:table-cell">{o.restenosis}</td>
                            <td className="p-3">{o.mortality}</td>
                            <td className="p-3 hidden sm:table-cell">{o.complications}</td>
                          </tr>
                        ))
                      : !isLoading && (
                           <tr>
                             <td colSpan={6} className="p-8 text-center text-muted-foreground">
                               {t("registry.emptyOutcomes")}
                            </td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("registry.institutionAggregate")}</CardTitle>
              <CardDescription>{t("registry.institutionPlaceholder")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t("registry.institutionPlaceholder")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle>{t("registry.networkBenchmarking")}</CardTitle>
               <CardDescription>
                 <span className="flex items-center gap-2">
                   {t("registry.benchmarkPlaceholder")}
                   <Badge variant="outline" className="text-xs">{t("registry.privacyFirst")}</Badge>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t("registry.benchmarkPlaceholder")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
