import { useTranslation, type Language } from "@/i18n/context";
import { PlayCircle } from "lucide-react";

const COPY: Record<Language, { eyebrow: string; title: string; lead: string; caption: string }> = {
  en: {
    eyebrow: "Programme overview",
    title: "Watch the VASCU-LINK study in 30 seconds",
    lead: "A short visual brief on the doctoral programme: the clinical gap, the 4-zero approach, the Vessel Pathway Compass platform, and the L1 → L3 trajectory validated on the certified Philips Ingenia 3T MRI at Hôpital de Moutier (Réseau de l'Arc, Switzerland).",
    caption: "Silent motion brief · 30 s · 1080p — long-form 3-min version available on request.",
  },
  fr: {
    eyebrow: "Présentation du programme",
    title: "Découvrir l'étude VASCU-LINK en 30 secondes",
    lead: "Une présentation visuelle courte du programme doctoral : le besoin clinique, l'approche 4-zéro, la plateforme Vessel Pathway Compass et la trajectoire L1 → L3 validée sur IRM 3T Philips Ingenia certifiée à l'Hôpital de Moutier (Réseau de l'Arc, Suisse).",
    caption: "Brief animé sans son · 30 s · 1080p — version longue 3 min disponible sur demande.",
  },
  de: {
    eyebrow: "Programmübersicht",
    title: "Die VASCU-LINK-Studie in 30 Sekunden",
    lead: "Ein kurzer visueller Überblick über das Doktorandenprogramm: die klinische Lücke, der 4-Null-Ansatz, die Vessel Pathway Compass-Plattform und der L1 → L3-Verlauf, validiert auf dem zertifizierten Philips Ingenia 3T MRT am Spital Moutier (Réseau de l'Arc, Schweiz).",
    caption: "Stiller Motion-Brief · 30 s · 1080p — 3-Minuten-Langfassung auf Anfrage erhältlich.",
  },
};

export function HomeIntroVideoSection() {
  const { language } = useTranslation();
  const c = COPY[language] ?? COPY.en;
  return (
    <section
      id="programme-video"
      aria-labelledby="programme-video-title"
      className="py-16 md:py-24 bg-background"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-primary mb-3 inline-flex items-center gap-2 justify-center">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {c.eyebrow}
          </p>
          <h2
            id="programme-video-title"
            className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            {c.title}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {c.lead}
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl bg-black aspect-video">
          <video
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-cover"
            aria-label={c.title}
          >
            <source src="/vascu-link-intro.mp4" type="video/mp4" />
          </video>
        </div>

        <p className="text-center text-xs text-muted-foreground/80 mt-4 italic">
          {c.caption}
        </p>
      </div>
    </section>
  );
}

export default HomeIntroVideoSection;
