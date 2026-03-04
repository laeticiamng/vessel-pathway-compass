import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageSquare, Users, Search, Send, Star, Clock } from "lucide-react";

const topics = ["PAD", "Aorta", "Venous", "Carotid", "Wounds", "Thrombosis"];

const discussions = [
  { title: "Complex iliac occlusion — hybrid approach?", author: "Anon Physician", replies: 12, topic: "PAD", time: "3h ago" },
  { title: "EVAR vs open repair in young patients", author: "Vascular Surgeon", replies: 8, topic: "Aorta", time: "1d ago" },
  { title: "Compression therapy adherence strategies", author: "Phlebologist", replies: 5, topic: "Venous", time: "2d ago" },
];

const experts = [
  { name: "Expert A", specialty: "PAD / Limb Preservation", languages: ["EN", "FR"], rating: 4.9, cases: 156 },
  { name: "Expert B", specialty: "Aortic Surgery", languages: ["EN", "DE"], rating: 4.8, cases: 89 },
  { name: "Expert C", specialty: "Venous Disease", languages: ["FR", "DE"], rating: 4.7, cases: 112 },
];

export default function Network() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          Global Expert Network
        </h1>
        <p className="text-muted-foreground mt-1">Case discussions, tele-expertise, and mentorship matching</p>
      </div>

      <Tabs defaultValue="discussions">
        <TabsList>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="ask-expert">Ask an Expert</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search discussions..." className="pl-10" />
            </div>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>
          <div className="flex gap-2">
            {topics.map((t) => (
              <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary/10">{t}</Badge>
            ))}
          </div>
          {discussions.map((d) => (
            <Card key={d.title} className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{d.topic}</Badge>
                    <span>{d.author}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {d.replies}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {d.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ask-expert" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask an Expert</CardTitle>
              <CardDescription>Submit a de-identified case for structured expert review</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Submit de-identified case package</p>
                <p className="text-sm mt-1">Routed to available experts with structured response template</p>
                <Button className="mt-4">
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Submit Case
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorship" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Available Mentors</h2>
          {experts.map((e) => (
            <Card key={e.name}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{e.name}</h3>
                    <p className="text-sm text-muted-foreground">{e.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {e.rating}</span>
                      <span className="text-xs text-muted-foreground">{e.cases} cases reviewed</span>
                      <div className="flex gap-1">
                        {e.languages.map((l) => (
                          <Badge key={l} variant="outline" className="text-[10px] px-1.5">{l}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Request Mentorship</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
