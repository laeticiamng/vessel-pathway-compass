import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart3, TrendingUp, Shield, Users } from "lucide-react";

const categories = ["PAD/AOMI", "Aortic", "Carotid", "Venous", "DVT/PE", "Wound/Limb"];

const mockOutcomes = [
  { category: "PAD/AOMI", entries: 45, amputation: "4.4%", restenosis: "12%", mortality: "1.2%", complications: "8.5%" },
  { category: "Aortic", entries: 23, amputation: "N/A", restenosis: "3%", mortality: "2.1%", complications: "11%" },
  { category: "Carotid", entries: 31, amputation: "N/A", restenosis: "5%", mortality: "0.8%", complications: "4.2%" },
  { category: "Venous", entries: 28, amputation: "N/A", restenosis: "15%", mortality: "0.1%", complications: "6%" },
];

export default function Registry() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary" />
            Outcomes Registry
          </h1>
          <p className="text-muted-foreground mt-1">Global vascular outcomes registry with privacy-first benchmarking</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          Anonymized Data Only
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge key={cat} variant="secondary" className="cursor-pointer hover:bg-primary/10">{cat}</Badge>
        ))}
      </div>

      <Tabs defaultValue="physician">
        <TabsList>
          <TabsTrigger value="physician">My Outcomes</TabsTrigger>
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="physician" className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: "Total Cases", value: "127" },
              { label: "30-day Mortality", value: "1.2%" },
              { label: "Complication Rate", value: "7.1%" },
              { label: "PROMs Collected", value: "89%" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Outcomes by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Entries</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Amputation</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Restenosis</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Mortality</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Complications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOutcomes.map((o) => (
                      <tr key={o.category} className="border-b last:border-0">
                        <td className="p-3 font-medium">{o.category}</td>
                        <td className="p-3">{o.entries}</td>
                        <td className="p-3">{o.amputation}</td>
                        <td className="p-3">{o.restenosis}</td>
                        <td className="p-3">{o.mortality}</td>
                        <td className="p-3">{o.complications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Institution Aggregate</CardTitle>
              <CardDescription>Aggregated outcomes for your institution</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Institution dashboard with aggregate charts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Benchmarking</CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2">
                  Compare against anonymized network percentiles
                  <Badge variant="outline" className="text-xs">Privacy-first</Badge>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Percentile comparison across anonymized network data</p>
                <p className="text-xs mt-1">No re-identification possible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
