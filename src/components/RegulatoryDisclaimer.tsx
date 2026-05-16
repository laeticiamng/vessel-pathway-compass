import { ShieldAlert } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { line1: string; line2: string; line3: string }> = {
  en: {
    line1: "VASCU-LINK · Vessel Pathway Compass — Research prototype · Not a CE-marked medical device · Not for clinical use.",
    line2: "Doctoral research project (PhD candidate Dr Laëticia Motongane). Doctoral L1 validation runs on certified Philips Ingenia 3T MRI at Hôpital de Moutier (Réseau de l'Arc, Switzerland). AquaMR low-field hardware is a post-PhD R&D horizon — not built during the thesis.",
    line3: "Compliance frameworks referenced: IEC 60601-1 · IEC 60601-2-33 · IEC 62304 · IEC 62366-1 · IEC 81001-5-1 · ISO 14971 · ISO 13485 · MDR EU 2017/745 · SPIRIT-AI · STARD-AI · TRIPOD+AI · PROBAST · KDIGO 2012.",
  },
  fr: {
    line1: "VASCU-LINK · Vessel Pathway Compass — Prototype de recherche · Non un dispositif médical CE-marqué · Pas d'usage clinique.",
    line2: "Projet de recherche doctorale (doctorante Dr Laëticia Motongane). La validation doctorale L1 se déroule sur IRM 3T Philips Ingenia certifiée à l'Hôpital de Moutier (Réseau de l'Arc, Suisse). Le matériel bas champ AquaMR est un horizon de R&D post-PhD — non construit pendant la thèse.",
    line3: "Référentiels de conformité visés : IEC 60601-1 · IEC 60601-2-33 · IEC 62304 · IEC 62366-1 · IEC 81001-5-1 · ISO 14971 · ISO 13485 · MDR EU 2017/745 · SPIRIT-AI · STARD-AI · TRIPOD+AI · PROBAST · KDIGO 2012.",
  },
  de: {
    line1: "VASCU-LINK · Vessel Pathway Compass — Forschungsprototyp · Kein CE-zertifiziertes Medizinprodukt · Keine klinische Anwendung.",
    line2: "Doktorforschungsprojekt (Doktorandin Dr. Laëticia Motongane). Die Doktorvalidierung L1 läuft auf zertifiziertem Philips Ingenia 3T MRT am Spital Moutier (Réseau de l'Arc, Schweiz). Die AquaMR-Niederfeld-Hardware ist ein Post-PhD-F&E-Horizont — nicht während der Thesis gebaut.",
    line3: "Referenzierte Konformitätsrahmen: IEC 60601-1 · IEC 60601-2-33 · IEC 62304 · IEC 62366-1 · IEC 81001-5-1 · ISO 14971 · ISO 13485 · MDR EU 2017/745 · SPIRIT-AI · STARD-AI · TRIPOD+AI · PROBAST · KDIGO 2012.",
  },
};

interface Props {
  variant?: "footer" | "compact";
  className?: string;
}

export function RegulatoryDisclaimer({ variant = "footer", className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  if (variant === "compact") {
    return (
      <p className={`text-[11px] leading-relaxed text-muted-foreground/80 ${className}`}>
        <ShieldAlert className="inline h-3 w-3 mr-1 -mt-0.5" aria-hidden="true" />
        {copy.line1} {copy.line2}
      </p>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Regulatory disclaimer"
      className={`border-t border-border/60 bg-muted/30 py-3 px-4 text-center ${className}`}
    >
      <p className="text-[11px] leading-relaxed text-muted-foreground max-w-4xl mx-auto">
        <span className="font-medium text-foreground/80">{copy.line1}</span>{" "}
        {copy.line2}{" "}
        <span className="italic">{copy.line3}</span>
      </p>
    </aside>
  );
}

export default RegulatoryDisclaimer;
