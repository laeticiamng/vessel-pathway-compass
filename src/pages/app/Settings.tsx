import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Building, Globe, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Institution, integrations, and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Institution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input placeholder="University Hospital" />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input placeholder="Switzerland" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { lang: "English", code: "EN", active: true },
            { lang: "Français", code: "FR", active: false },
            { lang: "Deutsch", code: "DE", active: false },
          ].map((l) => (
            <div key={l.code} className="flex items-center justify-between">
              <span className="text-sm">{l.lang} ({l.code})</span>
              <Switch checked={l.active} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark Mode</span>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">SSO Integration</span>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Rate Limiting</span>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
